/**
 * PlayStation Network (PSN) & Unified Profile Achievements Service
 * Real-time sync across:
 * 1) Custom Live Proxy (Cloudflare Worker / /api/psn/profile)
 * 2) User custom JSON import / localStorage
 * 3) Supabase Cloud DB
 * 4) Static data/psn-trophies.json (auto-synced by GitHub Actions)
 * Dynamically merges verified Brawl Stars live skills & achievements.
 */

import { SUPABASE_CONFIG } from "./supabase-config.js";
import { getLiveSyncSettings } from "./live-sync-config.js";

const STORAGE_CUSTOM_KEY = "psn_custom_trophy_data";
const STORAGE_SNAPSHOT_KEY = "psn_snapshot_cache_v2";
const STORAGE_BRAWL_BRIDGE_KEY = "ps5_brawl_trophies_bridge_v2";
const REMOVED_GAME_IDS = new Set(["NPWR10004_00", "NPWR10005_00"]);
const REMOVED_GAME_TITLES = ["celeste", "hollow knight"];

function isRemovedGame(game) {
  if (!game) return true;
  if (REMOVED_GAME_IDS.has(game.npCommunicationId)) return true;
  const name = String(game.titleName || "").toLowerCase();
  return REMOVED_GAME_TITLES.some((t) => name.includes(t));
}

class PsnTrophyService {
  constructor() {
    this.profile = null;
    this.recentTrophies = [];
    this.baseGames = [];
    this.browserGames = [];
    this.externalGames = new Map();
    this.games = [];
    this.listeners = new Set();
    this.isLoading = false;
    this.lastError = null;
    this.syncSource = "json"; // 'live-proxy' | 'supabase' | 'json' | 'custom'
    this._pollTimer = null;
    this._lastNotifySig = "";
    this._detailsCache = new Map();
    this._hydrateSnapshotSync();
  }

  _hydrateSnapshotSync() {
    try {
      const raw = localStorage.getItem(STORAGE_SNAPSHOT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.profile && Array.isArray(parsed.games)) {
        this.profile = parsed.profile;
        this.recentTrophies = (parsed.recentTrophies || []).filter((t) => !isRemovedGame({ titleName: t.gameTitle, npCommunicationId: t.npCommunicationId }));
        const filtered = parsed.games.filter((g) => !isRemovedGame(g));
        this.baseGames = filtered;
        this.browserGames = filtered.filter((g) => g.isBrowserGame === true);
        this.syncSource = parsed.syncSource || "json";
        this._rebuildMergedGames();
        this._lastNotifySig = this._computeStateSig();
      }
    } catch (_) {}
  }

  _saveSnapshotCache() {
    try {
      if (!this.profile || !Array.isArray(this.baseGames) || this.baseGames.length === 0) return;
      const slimGames = this.baseGames.map((g) => {
        if (!g || g.isBrowserGame) return g;
        const { trophies: _omit, ...rest } = g;
        return rest;
      });
      localStorage.setItem(
        STORAGE_SNAPSHOT_KEY,
        JSON.stringify({
          syncSource: this.syncSource,
          profile: this.profile,
          recentTrophies: this.recentTrophies,
          games: slimGames
        })
      );
    } catch (_) {}
  }

  async loadGameDetails(commId) {
    if (!commId) return null;
    const game = this.getGame(commId);
    if (!game) return null;
    if (Array.isArray(game.trophies) && game.trophies.length > 0) {
      return game;
    }
    if (this._detailsCache.has(commId)) {
      game.trophies = this._detailsCache.get(commId);
      return game;
    }
    try {
      const res = await fetch(`data/psn-details/${encodeURIComponent(commId)}.json`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data?.trophies) ? data.trophies : [];
        this._detailsCache.set(commId, list);
        game.trophies = list;
      }
    } catch (_) {}
    return game;
  }

  _computeGameEntrySig(g) {
    if (!g) return "";
    const e = g.earnedTrophies || {};
    return `${g.npCommunicationId || ""}|${g.progress || 0}|${e.platinum || 0}|${e.gold || 0}|${e.silver || 0}|${e.bronze || 0}|${g.lastUpdatedDateTime || ""}`;
  }

  _computeStateSig() {
    const prof = this.profile || {};
    const firstRecent = this.recentTrophies?.[0];
    const brawl = this.externalGames.get("NPWR_BRAWL_STARS_2RGUQJQ0R");
    return [
      this.syncSource,
      prof.onlineId || "",
      prof.trophyLevel || 0,
      prof.totalTrophies || 0,
      prof.platinum || 0,
      prof.gold || 0,
      prof.silver || 0,
      prof.bronze || 0,
      prof.lastSyncAt || "",
      (this.baseGames || []).length,
      firstRecent?.earnedDateTime || "",
      this._computeGameEntrySig(brawl)
    ].join("|");
  }

  async init() {
    this._loadCachedExternalBridges();
    const res = await this.loadData();
    this.startLivePolling();
    return res;
  }

  _loadCachedExternalBridges() {
    try {
      const raw = localStorage.getItem(STORAGE_BRAWL_BRIDGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.npCommunicationId) {
          this.externalGames.set(parsed.npCommunicationId, parsed);
        }
      }
    } catch (_) {}
  }

  onUpdate(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  _notify() {
    const data = this.getData();
    for (const cb of this.listeners) {
      try {
        cb(data);
      } catch (err) {
        console.error("PSN Service listener error:", err);
      }
    }
  }

  _rebuildMergedGames() {
    const seen = new Set();
    const result = [];
    const pushUnique = (g) => {
      if (!g || isRemovedGame(g)) return;
      if (g.npCommunicationId && seen.has(g.npCommunicationId)) return;
      if (g.npCommunicationId) seen.add(g.npCommunicationId);
      result.push(g);
    };

    Array.from(this.externalGames.values()).forEach(pushUnique);
    (this.baseGames || []).forEach(pushUnique);
    (this.browserGames || []).forEach(pushUnique);
    this.games = result;
  }

  mergeExternalGame(gameEntry) {
    if (!gameEntry || !gameEntry.npCommunicationId) return;
    const prev = this.externalGames.get(gameEntry.npCommunicationId);
    if (prev && this._computeGameEntrySig(prev) === this._computeGameEntrySig(gameEntry)) {
      return;
    }
    this.externalGames.set(gameEntry.npCommunicationId, gameEntry);
    try {
      localStorage.setItem(STORAGE_BRAWL_BRIDGE_KEY, JSON.stringify(gameEntry));
    } catch (_) {}
    this._rebuildMergedGames();
    this._lastNotifySig = this._computeStateSig();
    this._notify();
  }

  /**
   * Computes honest aggregated trophy/skill metrics without fabricated numbers:
   * - If live PSN account is linked (psnLinked === true): uses real synced PSN counts (+ Brawl earned).
   * - If PSN is awaiting link (psnLinked === false): uses user-confirmed PlayStation platinums (2)
   *   plus actual earned Brawl Stars skills & Browser game awards from this.games.
   */
  getAggregatedSummary() {
    const prof = this.profile || {};
    const liveSettings = getLiveSyncSettings();
    const psnLinked = Boolean(prof.psnLinked || this.syncSource === "live-proxy" || this.syncSource === "supabase");
    const confirmedPsnPlats = Number.isFinite(prof.confirmedPsnPlatinums) ? prof.confirmedPsnPlatinums : 2;

    let earnedGold = 0;
    let earnedSilver = 0;
    let earnedBronze = 0;
    let earnedPlatInGames = 0;
    let totalDefinedAwards = 0;
    let totalEarnedAwards = 0;

    (this.games || []).forEach((g) => {
      const e = g.earnedTrophies || {};
      const br = Number(e.bronze || 0);
      const sv = Number(e.silver || 0);
      const gd = Number(e.gold || 0);
      const pl = Number(e.platinum || 0);
      earnedBronze += br;
      earnedSilver += sv;
      earnedGold += gd;
      earnedPlatInGames += pl;
      totalDefinedAwards += Number(g.totalTrophiesCount || (Array.isArray(g.trophies) ? g.trophies.length : 0));
      totalEarnedAwards += br + sv + gd + pl;
    });

    let plat = confirmedPsnPlats;
    let gold = earnedGold;
    let silver = earnedSilver;
    let bronze = earnedBronze;

    if (psnLinked) {
      // Real synced PSN totals include all PSN trophies + external Brawl Stars bridge
      const brawl = this.externalGames.get("NPWR_BRAWL_STARS_2RGUQJQ0R")?.earnedTrophies || {};
      plat = Number(prof.platinum || 0) + Number(brawl.platinum || 0);
      gold = Number(prof.gold || 0) + Number(brawl.gold || 0);
      silver = Number(prof.silver || 0) + Number(brawl.silver || 0);
      bronze = Number(prof.bronze || 0) + Number(brawl.bronze || 0);
    } else {
      plat = confirmedPsnPlats + earnedPlatInGames;
    }

    const totalTrophies = plat + gold + silver + bronze;
    const masteryPct = totalDefinedAwards > 0
      ? Math.min(100, Math.round((totalEarnedAwards / totalDefinedAwards) * 100))
      : 0;

    const brawlGame = this.externalGames.get("NPWR_BRAWL_STARS_2RGUQJQ0R");

    return {
      onlineId: liveSettings.psnOnlineId || prof.psnOnlineId || prof.onlineId || "Cr1mnsx",
      psnOnlineId: liveSettings.psnOnlineId || prof.psnOnlineId || "",
      psnLinked,
      confirmedPsnPlatinums: confirmedPsnPlats,
      trophyLevel: psnLinked && prof.trophyLevel ? prof.trophyLevel : null,
      levelProgress: psnLinked && prof.trophyLevel ? (prof.levelProgress || 0) : masteryPct,
      platinum: plat,
      gold,
      silver,
      bronze,
      totalTrophies,
      brawlEarnedCount: brawlGame
        ? (brawlGame.earnedTrophies.platinum + brawlGame.earnedTrophies.gold + brawlGame.earnedTrophies.silver + brawlGame.earnedTrophies.bronze)
        : 0,
      brawlTotalCount: brawlGame ? brawlGame.totalTrophiesCount : 0,
      syncSource: this.syncSource,
      lastSyncAt: prof.lastSyncAt || brawlGame?.lastUpdatedDateTime || null
    };
  }

  getData() {
    this._rebuildMergedGames();

    const brawlGame = this.externalGames.get("NPWR_BRAWL_STARS_2RGUQJQ0R");
    const brawlRecent = brawlGame && Array.isArray(brawlGame.trophies)
      ? brawlGame.trophies
          .filter((t) => t.earned)
          .slice(0, 3)
          .map((t) => ({
            ...t,
            gameTitle: "Brawl Stars (#2RGUQJQ0R)",
            npCommunicationId: brawlGame.npCommunicationId
          }))
      : [];

    const filteredBaseRecent = (this.recentTrophies || []).filter((t) => !isRemovedGame({ titleName: t.gameTitle, npCommunicationId: t.npCommunicationId }));
    const mergedRecent = [...filteredBaseRecent.slice(0, 8), ...brawlRecent].slice(0, 12);

    return {
      profile: this.profile,
      summary: this.getAggregatedSummary(),
      recentTrophies: mergedRecent,
      games: this.games,
      syncSource: this.syncSource,
      lastError: this.lastError
    };
  }

  startLivePolling() {
    if (this._pollTimer) return;
    this._pollTimer = setInterval(() => {
      if (!document.hidden) {
        this.loadData({ silent: true });
      }
    }, 45000);

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        this.loadData({ silent: true });
      }
    });
  }

  async _ensureBrowserGamesLoaded() {
    if (this.browserGames.length > 0) return;
    try {
      const res = await fetch(`data/psn-trophies.json?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        this.browserGames = (data.games || []).filter((g) => g && g.isBrowserGame === true && !isRemovedGame(g));
        this._rebuildMergedGames();
        this._notify();
      }
    } catch (_) {}
  }

  async loadData({ silent = false } = {}) {
    if (!silent) this.isLoading = true;
    this.lastError = null;
    const settings = getLiveSyncSettings();

    const finishLoad = () => {
      this._rebuildMergedGames();
      this.isLoading = false;
      this._saveSnapshotCache();
      const nextSig = this._computeStateSig();
      if (!silent || nextSig !== this._lastNotifySig) {
        this._lastNotifySig = nextSig;
        this._notify();
      }
      return this.getData();
    };

    const isStaticHost =
      typeof window !== "undefined" &&
      (window.location.hostname.endsWith(".github.io") || window.location.protocol === "file:");

    // Tier 1: Real-Time Serverless Proxy or Local Server PSN Endpoint
    const psnEndpoints = [];
    if (settings.psnProxyUrl) {
      const qs = settings.psnOnlineId ? `?onlineId=${encodeURIComponent(settings.psnOnlineId)}` : "";
      psnEndpoints.push(`${settings.psnProxyUrl}/psn/profile${qs}`);
    }
    if (!isStaticHost) {
      if (settings.psnOnlineId) {
        psnEndpoints.push(`/api/psn/profile?onlineId=${encodeURIComponent(settings.psnOnlineId)}&t=${Date.now()}`);
      } else {
        psnEndpoints.push(`/api/psn/profile?t=${Date.now()}`);
      }
    }

    for (const url of psnEndpoints) {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const live = await res.json();
            if (live?.profile && Array.isArray(live.games)) {
              this.profile = { ...live.profile, psnLinked: true };
              this.recentTrophies = live.recentTrophies || [];
              const filteredLive = live.games.filter((g) => !isRemovedGame(g));
              this.baseGames = filteredLive;
              const includedBrowser = filteredLive.filter((g) => g.isBrowserGame === true);
              if (includedBrowser.length > 0) this.browserGames = includedBrowser;
              else this._ensureBrowserGamesLoaded();
              this.syncSource = "live-proxy";
              return finishLoad();
            }
          }
        }
      } catch (_) {}
    }

    // Tier 2: Custom user JSON import in localStorage
    try {
      const customRaw = localStorage.getItem(STORAGE_CUSTOM_KEY);
      if (customRaw) {
        const parsed = JSON.parse(customRaw);
        if (parsed?.profile && parsed?.games) {
          this.profile = parsed.profile;
          this.recentTrophies = (parsed.recentTrophies || []).filter((t) => !isRemovedGame({ titleName: t.gameTitle, npCommunicationId: t.npCommunicationId }));
          this.baseGames = parsed.games.filter((g) => !isRemovedGame(g));
          this.syncSource = "custom";
          return finishLoad();
        }
      }
    } catch (_) {}

    // Tier 3: Supabase Live Database
    if (SUPABASE_CONFIG?.url && SUPABASE_CONFIG?.anonKey) {
      try {
        const sbData = await this._loadFromSupabase();
        if (sbData && sbData.profile) {
          this.profile = { ...sbData.profile, psnLinked: true };
          this.recentTrophies = (sbData.recentTrophies || []).filter((t) => !isRemovedGame({ titleName: t.gameTitle }));
          this.baseGames = (sbData.games || []).filter((g) => !isRemovedGame(g));
          this.syncSource = "supabase";
          return finishLoad();
        }
      } catch (err) {
        console.warn("Supabase PSN query failed, falling back to JSON:", err);
      }
    }

    // Tier 4: Static snapshot data/psn-trophies.json (auto-updated by GitHub Actions)
    try {
      const jsonUrl = silent ? `data/psn-trophies.json?t=${Date.now()}` : `data/psn-trophies.json`;
      const res = await fetch(jsonUrl, silent ? { cache: "no-store" } : undefined);
      if (res.ok) {
        const data = await res.json();
        this.profile = data.profile;
        this.recentTrophies = (data.recentTrophies || []).filter((t) => !isRemovedGame({ titleName: t.gameTitle, npCommunicationId: t.npCommunicationId }));
        const filteredJson = (data.games || []).filter((g) => !isRemovedGame(g));
        this.baseGames = filteredJson;
        this.browserGames = filteredJson.filter((g) => g.isBrowserGame === true);
        this.syncSource = "json";
        return finishLoad();
      }
    } catch (err) {
      this.lastError = "Не удалось загрузить данные наград";
      console.error("PSN JSON fetch failed:", err);
    }

    return finishLoad();
  }

  async _loadFromSupabase() {
    const { url, anonKey } = SUPABASE_CONFIG;
    const headers = {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`
    };

    const profRes = await fetch(`${url}/rest/v1/psn_profiles?select=*&order=last_sync_at.desc&limit=1`, { headers });
    if (!profRes.ok) return null;
    const profs = await profRes.json();
    if (!profs || profs.length === 0) return null;
    const rawProf = profs[0];

    const profile = {
      onlineId: rawProf.online_id,
      psnLinked: true,
      avatarUrl: rawProf.avatar_url,
      aboutMe: rawProf.about_me,
      trophyLevel: rawProf.trophy_level,
      levelTier: rawProf.level_tier,
      levelProgress: rawProf.level_progress,
      totalTrophies: rawProf.total_trophies,
      platinum: rawProf.platinum,
      gold: rawProf.gold,
      silver: rawProf.silver,
      bronze: rawProf.bronze,
      lastSyncAt: rawProf.last_sync_at
    };

    const gamesRes = await fetch(`${url}/rest/v1/psn_games?online_id=eq.${encodeURIComponent(profile.onlineId)}&order=last_played_at.desc`, { headers });
    const rawGames = gamesRes.ok ? await gamesRes.json() : [];

    const troRes = await fetch(`${url}/rest/v1/psn_trophies?online_id=eq.${encodeURIComponent(profile.onlineId)}&order=earned_at.desc`, { headers });
    const rawTrophies = troRes.ok ? await troRes.json() : [];

    const games = rawGames.map((g) => {
      const gameTrophies = rawTrophies
        .filter((t) => t.np_communication_id === g.np_communication_id)
        .map((t) => ({
          trophyId: t.trophy_id,
          trophyHidden: t.trophy_hidden,
          trophyType: t.trophy_type,
          trophyName: t.trophy_name,
          trophyDetail: t.trophy_detail,
          trophyIconUrl: t.trophy_icon_url,
          trophyRare: t.trophy_rare,
          earned: t.trophy_earned,
          earnedDateTime: t.earned_at,
          gameTitle: g.title_name
        }));

      return {
        npCommunicationId: g.np_communication_id,
        titleName: g.title_name,
        titleIconUrl: g.title_icon_url,
        platform: g.title_platform,
        progress: g.progress,
        platinumEarned: g.platinum_earned,
        earnedTrophies: {
          bronze: g.trophy_count_bronze,
          silver: g.trophy_count_silver,
          gold: g.trophy_count_gold,
          platinum: g.trophy_count_platinum
        },
        totalTrophiesCount: g.trophy_count_total,
        lastUpdatedDateTime: g.last_played_at,
        trophies: gameTrophies
      };
    });

    const recentTrophies = rawTrophies
      .filter((t) => t.trophy_earned && t.earned_at)
      .slice(0, 20)
      .map((t) => ({
        trophyId: t.trophy_id,
        trophyType: t.trophy_type,
        trophyName: t.trophy_name,
        trophyDetail: t.trophy_detail,
        trophyIconUrl: t.trophy_icon_url,
        earned: true,
        earnedDateTime: t.earned_at,
        gameTitle: games.find((g) => g.npCommunicationId === t.np_communication_id)?.titleName || "PlayStation"
      }));

    return { profile, games, recentTrophies };
  }

  importFromJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.profile || !parsed.profile.onlineId) {
        throw new Error("Неверный формат: отсутствует объект profile или onlineId.");
      }
      if (!Array.isArray(parsed.games)) {
        throw new Error("Неверный формат: поле games должно быть массивом.");
      }

      const cleanGames = parsed.games.filter((g) => !isRemovedGame(g));
      parsed.profile.lastSyncAt = new Date().toISOString();
      parsed.profile.psnLinked = true;
      localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify({ ...parsed, games: cleanGames }));

      this.profile = parsed.profile;
      this.recentTrophies = parsed.recentTrophies || [];
      this.baseGames = cleanGames;
      this.syncSource = "custom";
      this.lastError = null;

      this._rebuildMergedGames();
      this._notify();
      return { success: true, count: cleanGames.length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  disconnect() {
    try {
      localStorage.removeItem(STORAGE_CUSTOM_KEY);
    } catch (_) {}
    return this.loadData();
  }

  async syncNow() {
    return this.loadData();
  }

  getGames(filter = "all", searchQuery = "") {
    this._rebuildMergedGames();
    let list = this.games || [];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((g) => g.titleName.toLowerCase().includes(q));
    }

    if (filter === "platinum") {
      list = list.filter((g) => g.platinumEarned || (g.earnedTrophies?.platinum > 0));
    } else if (filter === "completed") {
      list = list.filter((g) => g.progress >= 100);
    } else if (filter === "in_progress") {
      list = list.filter((g) => g.progress > 0 && g.progress < 100);
    } else if (filter === "not_started") {
      list = list.filter((g) => g.progress === 0);
    }

    return list;
  }

  getGame(commId) {
    this._rebuildMergedGames();
    return this.games.find((g) => g.npCommunicationId === commId);
  }
}

export const psnService = new PsnTrophyService();
if (typeof window !== "undefined") {
  window.psnService = psnService;
}

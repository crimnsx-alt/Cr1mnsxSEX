/**
 * PlayStation Network (PSN) Trophy Service
 * TASK 10: Automatic Synchronization & Client-Side Trophy Engine
 */

import { SUPABASE_CONFIG } from "./supabase-config.js";

const STORAGE_CUSTOM_KEY = "psn_custom_trophy_data";
const STORAGE_SYNC_STATE_KEY = "psn_sync_state";

class PsnTrophyService {
  constructor() {
    this.profile = null;
    this.recentTrophies = [];
    this.games = [];
    this.listeners = new Set();
    this.isLoading = false;
    this.lastError = null;
    this.syncSource = "json"; // 'supabase' | 'json' | 'custom'
  }

  async init() {
    return this.loadData();
  }

  onUpdate(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  _notify() {
    for (const cb of this.listeners) {
      try {
        cb(this.getData());
      } catch (err) {
        console.error("PSN Service listener error:", err);
      }
    }
  }

  getData() {
    return {
      profile: this.profile,
      recentTrophies: this.recentTrophies,
      games: this.games,
      syncSource: this.syncSource,
      lastError: this.lastError
    };
  }

  /**
   * Load data with intelligent multi-tier fallback:
   * 1. Custom user import from localStorage (if exists)
   * 2. Supabase Cloud DB (if configured and populated)
   * 3. Static cached data/psn-trophies.json (auto-synced by GitHub Actions)
   */
  async loadData() {
    this.isLoading = true;
    this.lastError = null;

    // Tier 1: User custom import
    try {
      const customRaw = localStorage.getItem(STORAGE_CUSTOM_KEY);
      if (customRaw) {
        const parsed = JSON.parse(customRaw);
        if (parsed?.profile && parsed?.games) {
          this.profile = parsed.profile;
          this.recentTrophies = parsed.recentTrophies || [];
          this.games = parsed.games || [];
          this.syncSource = "custom";
          this.isLoading = false;
          this._notify();
          return this.getData();
        }
      }
    } catch (_) {}

    // Tier 2: Supabase Live Database
    if (SUPABASE_CONFIG?.url && SUPABASE_CONFIG?.anonKey) {
      try {
        const sbData = await this._loadFromSupabase();
        if (sbData && sbData.profile) {
          this.profile = sbData.profile;
          this.recentTrophies = sbData.recentTrophies || [];
          this.games = sbData.games || [];
          this.syncSource = "supabase";
          this.isLoading = false;
          this._notify();
          return this.getData();
        }
      } catch (err) {
        console.warn("Supabase PSN query failed, falling back to JSON:", err);
      }
    }

    // Tier 3: data/psn-trophies.json
    try {
      const res = await fetch(`data/psn-trophies.json?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        this.profile = data.profile;
        this.recentTrophies = data.recentTrophies || [];
        this.games = data.games || [];
        this.syncSource = "json";
        this.isLoading = false;
        this._notify();
        return this.getData();
      }
    } catch (err) {
      this.lastError = "Не удалось загрузить данные трофеев PSN";
      console.error("PSN JSON fetch failed:", err);
    }

    this.isLoading = false;
    this._notify();
    return this.getData();
  }

  async _loadFromSupabase() {
    const { url, anonKey } = SUPABASE_CONFIG;
    const headers = {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`
    };

    // 1. Profile
    const profRes = await fetch(`${url}/rest/v1/psn_profiles?select=*&order=last_sync_at.desc&limit=1`, { headers });
    if (!profRes.ok) return null;
    const profs = await profRes.json();
    if (!profs || profs.length === 0) return null;
    const rawProf = profs[0];

    const profile = {
      onlineId: rawProf.online_id,
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

    // 2. Games
    const gamesRes = await fetch(`${url}/rest/v1/psn_games?online_id=eq.${encodeURIComponent(profile.onlineId)}&order=last_played_at.desc`, { headers });
    const rawGames = gamesRes.ok ? await gamesRes.json() : [];

    // 3. Trophies
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
        gameTitle: games.find((g) => g.npCommunicationId === t.np_communication_id)?.titleName || 'PlayStation Game'
      }));

    return { profile, games, recentTrophies };
  }

  /**
   * Import custom JSON data provided by user
   */
  importFromJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.profile || !parsed.profile.onlineId) {
        throw new Error("Неверный формат: отсутствует объект profile или onlineId.");
      }
      if (!Array.isArray(parsed.games)) {
        throw new Error("Неверный формат: поле games должно быть массивом.");
      }

      parsed.profile.lastSyncAt = new Date().toISOString();
      localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(parsed));

      this.profile = parsed.profile;
      this.recentTrophies = parsed.recentTrophies || [];
      this.games = parsed.games;
      this.syncSource = "custom";
      this.lastError = null;

      this._notify();
      return { success: true, count: parsed.games.length };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Disconnect profile (clears custom import, reloads base sync)
   */
  disconnect() {
    try {
      localStorage.removeItem(STORAGE_CUSTOM_KEY);
    } catch (_) {}
    return this.loadData();
  }

  /**
   * Trigger Manual Sync (re-fetch live data)
   */
  async syncNow() {
    return this.loadData();
  }

  /**
   * Filter and search games
   */
  getGames(filter = "all", searchQuery = "") {
    let list = this.games || [];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((g) => g.titleName.toLowerCase().includes(q));
    }

    if (filter === "platinum") {
      list = list.filter((g) => g.platinumEarned || g.earnedTrophies?.platinum > 0);
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
    return this.games.find((g) => g.npCommunicationId === commId);
  }
}

export const psnService = new PsnTrophyService();

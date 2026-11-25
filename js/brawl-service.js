/**
 * PlayStation®5 Brawl Stars Personal Player Profile, Brawler Showcase & Friends Hub
 * Supercell Account #2RGUQJQ0R (Cr1mnsx): instant eager brawler portraits,
 * 25-match history, direct friend invite / QR sharing, and PS5 Trophies Bridge.
 */

import { SoundEngine } from "./sound.js";
import { escapeHtml } from "./friends-service.js";
import { psnService } from "./psn-service.js";
import { getLiveSyncSettings } from "./live-sync-config.js";

export const BRAWL_TAG = "2RGUQJQ0R";
export const BRAWL_TAG_DISPLAY = "#2RGUQJQ0R";
export const STORAGE_KEY_DATA = "ps5_brawl_player_data_v2";
export const STORAGE_KEY_TROPHIES = "ps5_brawl_trophies_bridge_v2";

export const BRAWLER_AVATARS = {
  leon: "assets/brawl/brawlers/leon_model.webp",
  crow: "assets/brawl/brawlers/crow_model.webp",
  spike: "assets/brawl/brawlers/spike_model.webp",
  shelly: "assets/brawl/brawlers/shelly_model.webp"
};

export const BRAWLER_RARITIES = {
  // Legendary
  leon: { name: "ЛЕГЕНДАРНЫЙ", color: "#FFCC00", glow: "rgba(255, 204, 0, 0.45)" },
  crow: { name: "ЛЕГЕНДАРНЫЙ", color: "#FFCC00", glow: "rgba(255, 204, 0, 0.45)" },
  spike: { name: "ЛЕГЕНДАРНЫЙ", color: "#FFCC00", glow: "rgba(255, 204, 0, 0.45)" },
  amber: { name: "ЛЕГЕНДАРНЫЙ", color: "#FFCC00", glow: "rgba(255, 204, 0, 0.45)" },
  meg: { name: "ЛЕГЕНДАРНЫЙ", color: "#FFCC00", glow: "rgba(255, 204, 0, 0.45)" },
  chester: { name: "ЛЕГЕНДАРНЫЙ", color: "#FFCC00", glow: "rgba(255, 204, 0, 0.45)" },
  surge: { name: "ЛЕГЕНДАРНЫЙ", color: "#FFCC00", glow: "rgba(255, 204, 0, 0.45)" },
  sandy: { name: "ЛЕГЕНДАРНЫЙ", color: "#FFCC00", glow: "rgba(255, 204, 0, 0.45)" },
  kit: { name: "ЛЕГЕНДАРНЫЙ", color: "#FFCC00", glow: "rgba(255, 204, 0, 0.45)" },
  draco: { name: "ЛЕГЕНДАРНЫЙ", color: "#FFCC00", glow: "rgba(255, 204, 0, 0.45)" },
  kenji: { name: "ЛЕГЕНДАРНЫЙ", color: "#FFCC00", glow: "rgba(255, 204, 0, 0.45)" },
  cordelius: { name: "ЛЕГЕНДАРНЫЙ", color: "#FFCC00", glow: "rgba(255, 204, 0, 0.45)" },
  // Mythic
  mortis: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  tara: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  gene: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  max: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  mrp: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  sprout: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  byron: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  squeak: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  fang: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  eve: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  janet: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  otis: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  buster: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  gray: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  rt: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  willow: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  doug: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  chuck: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  mico: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  melodie: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  lily: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  clancy: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  moe: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  juju: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  shade: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  kaze: { name: "МИФИЧЕСКИЙ", color: "#F43F5E", glow: "rgba(244, 63, 94, 0.45)" },
  // Epic
  edgar: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  piper: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  bo: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  emz: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  stu: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  pam: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  frank: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  bibi: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  bea: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  nani: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  griff: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  grom: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  bonnie: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  gale: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  colette: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  belle: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  ash: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  lola: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  sam: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  mandy: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  maisie: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  hank: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  pearl: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  larrylawrie: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  angelo: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  berry: { name: "ЭПИЧЕСКИЙ", color: "#C084FC", glow: "rgba(192, 132, 252, 0.45)" },
  // Super Rare
  rico: { name: "СВЕРХРЕДКИЙ", color: "#4ADE80", glow: "rgba(74, 222, 128, 0.45)" },
  darryl: { name: "СВЕРХРЕДКИЙ", color: "#4ADE80", glow: "rgba(74, 222, 128, 0.45)" },
  penny: { name: "СВЕРХРЕДКИЙ", color: "#4ADE80", glow: "rgba(74, 222, 128, 0.45)" },
  carl: { name: "СВЕРХРЕДКИЙ", color: "#4ADE80", glow: "rgba(74, 222, 128, 0.45)" },
  jacky: { name: "СВЕРХРЕДКИЙ", color: "#4ADE80", glow: "rgba(74, 222, 128, 0.45)" },
  gus: { name: "СВЕРХРЕДКИЙ", color: "#4ADE80", glow: "rgba(74, 222, 128, 0.45)" },
  dynamike: { name: "СВЕРХРЕДКИЙ", color: "#4ADE80", glow: "rgba(74, 222, 128, 0.45)" },
  // Rare
  elprimo: { name: "РЕДКИЙ", color: "#2563EB", glow: "rgba(37, 99, 235, 0.45)" },
  barley: { name: "РЕДКИЙ", color: "#2563EB", glow: "rgba(37, 99, 235, 0.45)" },
  poco: { name: "РЕДКИЙ", color: "#2563EB", glow: "rgba(37, 99, 235, 0.45)" },
  rosa: { name: "РЕДКИЙ", color: "#2563EB", glow: "rgba(37, 99, 235, 0.45)" },
  brock: { name: "РЕДКИЙ", color: "#2563EB", glow: "rgba(37, 99, 235, 0.45)" },
  bull: { name: "РЕДКИЙ", color: "#2563EB", glow: "rgba(37, 99, 235, 0.45)" },
  colt: { name: "РЕДКИЙ", color: "#2563EB", glow: "rgba(37, 99, 235, 0.45)" },
  nita: { name: "РЕДКИЙ", color: "#2563EB", glow: "rgba(37, 99, 235, 0.45)" },
  // Starting
  shelly: { name: "НАЧАЛЬНЫЙ", color: "#EC4899", glow: "rgba(236, 72, 153, 0.45)" }
};

export function getBrawlerSlug(rawName) {
  if (!rawName) return "leon";
  let s = String(rawName).toLowerCase().trim();
  if (s === "8-bit" || s === "8bit") return "8-bit";
  if (s === "el primo") return "el_primo";
  if (s === "mr. p" || s === "mr p") return "mr_p";
  if (s === "r-t" || s === "r t") return "r-t";
  if (s.includes("larry")) return "larry_lawrie";
  if (s === "starr nova") return "starr_nova";
  if (s === "jae-yong") return "jae-yong";
  return s.replace(/[^a-z0-9]/g, "");
}

export function getBrawlerRarityInfo(name) {
  const slug = getBrawlerSlug(name);
  if (BRAWLER_RARITIES[slug]) return BRAWLER_RARITIES[slug];
  return { name: "БОЕЦ", color: "#FFCC00", glow: "rgba(255, 204, 0, 0.45)" };
}

export function getBrawlerModelUrl(brawler) {
  if (!brawler) return "assets/brawl/brawlers/leon_model.webp";
  const name = (brawler.name || "").toLowerCase().trim();
  if (name === "leon") return "assets/brawl/brawlers/leon_model.webp";
  if (name === "crow") return "assets/brawl/brawlers/crow_model.webp";
  if (name === "spike") return "assets/brawl/brawlers/spike_model.webp";
  if (name === "shelly") return "assets/brawl/brawlers/shelly_model.webp";

  if (brawler.id) {
    return `https://cdn.brawlify.com/brawlers/model/${brawler.id}.png`;
  }
  return "assets/covers/brawl_stars.jpg";
}

export function getBrawlerAvatarUrl(brawler) {
  if (!brawler) return "assets/covers/brawl_stars.jpg";
  if (brawler.id) {
    return `https://cdn.brawlify.com/brawlers/borderless/${brawler.id}.png`;
  }
  return "assets/covers/brawl_stars.jpg";
}

/**
 * Parses Supercell ISO-compact timestamp ("20261124T193000.000Z") into standard ISO string.
 */
export function parseSupercellBattleTime(rawTime) {
  if (!rawTime) return new Date().toISOString();
  if (/^\d{4}-\d{2}-\d{2}T/.test(rawTime)) return rawTime;
  const m = String(rawTime).match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?:\.(\d+))?Z$/i);
  if (!m) return rawTime;
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}.${m[7] || "000"}Z`;
}

/**
 * Normalizes either our curated JSON snapshot OR official Supercell `/players` + `/battlelog`
 * responses into the unified format used across the UI, preserving any richer local metadata
 * (fame, rankedElo, hyperCharges, winStreaks, skins) that the public Supercell endpoint omits.
 */
export function normalizeBrawlPayload(raw, prevPlayer = null, rawBattlelog = null) {
  const unwrapped = raw?.result?.data?.json || raw?.player || raw;
  if (!unwrapped || !unwrapped.tag) return null;

  const cleanTag = (t) => String(t || "").replace(/^#/, "").toUpperCase();
  const prevBrawlersMap = prevPlayer?.brawlers && !Array.isArray(prevPlayer.brawlers) ? prevPlayer.brawlers : {};
  const prevById = new Map();
  Object.entries(prevBrawlersMap).forEach(([slug, b]) => {
    if (b?.id) prevById.set(Number(b.id), { slug, ...b });
    prevById.set(String(b?.name || slug).toUpperCase(), { slug, ...b });
  });

  let brawlersMap = unwrapped.brawlers;
  if (Array.isArray(unwrapped.brawlers)) {
    brawlersMap = {};
    unwrapped.brawlers.forEach((b) => {
      const slug = getBrawlerSlug(b.name);
      const prevMatch = prevById.get(Number(b.id)) || prevById.get(String(b.name || "").toUpperCase()) || {};
      brawlersMap[slug] = {
        ...prevMatch,
        ...b,
        trophies: b.trophies ?? prevMatch.trophies ?? 0,
        highestTrophies: Math.max(b.highestTrophies ?? 0, prevMatch.highestTrophies ?? 0),
        power: b.power ?? prevMatch.power ?? 1,
        rank: b.rank ?? prevMatch.rank ?? 1,
        gadgets: b.gadgets ?? prevMatch.gadgets ?? [],
        starPowers: b.starPowers ?? prevMatch.starPowers ?? [],
        gears: b.gears ?? prevMatch.gears ?? [],
        hyperCharges: b.hyperCharges ?? prevMatch.hyperCharges ?? []
      };
    });
  } else if (brawlersMap && typeof brawlersMap === "object" && Object.keys(prevBrawlersMap).length > 0) {
    const merged = {};
    Object.entries(brawlersMap).forEach(([k, b]) => {
      const prevMatch = prevBrawlersMap[k] || prevById.get(Number(b?.id)) || {};
      merged[k] = { ...prevMatch, ...b };
    });
    brawlersMap = merged;
  }

  // Normalize battlelog from either unwrapped.battles or Supercell { items: [...] }
  let battles = unwrapped.battles;
  const battleItems = rawBattlelog?.items || raw?.battlelog?.items || (Array.isArray(rawBattlelog) ? rawBattlelog : null);
  if (Array.isArray(battleItems)) {
    battles = battleItems.slice(0, 25).map((item) => {
      const bInfo = item.battle || {};
      const isShowdown = Array.isArray(bInfo.players);
      const resultStr = bInfo.result || (bInfo.rank ? `Rank ${bInfo.rank}` : "match");
      const isWin = bInfo.result === "victory" || bInfo.rank === 1 || (isShowdown && bInfo.trophyChange > 0);
      let teams = [];
      if (Array.isArray(bInfo.teams)) {
        teams = bInfo.teams.map((team) =>
          team.map((pl) => ({
            tag: cleanTag(pl.tag),
            name: pl.name || "Player",
            brawler: (pl.brawler?.name || pl.brawler || "leon").toLowerCase(),
            id: pl.brawler?.id || null,
            brawlerTrophies: pl.brawler?.trophies ?? null,
            brawlerPower: pl.brawler?.power ?? 11
          }))
        );
      } else if (Array.isArray(bInfo.players)) {
        teams = [
          bInfo.players.map((pl) => ({
            tag: cleanTag(pl.tag),
            name: pl.name || "Player",
            brawler: (pl.brawler?.name || pl.brawler || "leon").toLowerCase(),
            id: pl.brawler?.id || null,
            brawlerTrophies: pl.brawler?.trophies ?? null,
            brawlerPower: pl.brawler?.power ?? 11
          }))
        ];
      }
      return {
        timestamp: parseSupercellBattleTime(item.battleTime),
        event: {
          mode: item.event?.mode || bInfo.mode || "3v3",
          map: item.event?.map || "Арена"
        },
        victory: Boolean(isWin),
        result: resultStr,
        trophyChange: bInfo.trophyChange ?? null,
        teams
      };
    });
  }

  return {
    ...(prevPlayer || {}),
    ...unwrapped,
    tag: cleanTag(unwrapped.tag),
    club: unwrapped.club?.name
      ? { tag: cleanTag(unwrapped.club.tag), name: unwrapped.club.name }
      : (prevPlayer?.club || null),
    brawlers: brawlersMap || prevBrawlersMap,
    battles: battles || prevPlayer?.battles || []
  };
}

function animateNumber(element, start, end, duration = 400) {
  if (!element) return;
  if (start === end) {
    element.textContent = end.toLocaleString("ru-RU");
    return;
  }
  const startTime = performance.now();
  const diff = end - start;
  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + diff * ease);
    element.textContent = current.toLocaleString("ru-RU");
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  requestAnimationFrame(update);
}

class BrawlStarsService {
  constructor() {
    this.tag = BRAWL_TAG;
    this.player = null;
    this.pollTimer = null;
    this.isPolling = false;
    this.lastSyncTime = null;
    this.syncSource = "snapshot"; // "live-proxy" | "local-api" | "snapshot"
    this.activeTab = "roster"; // "roster" | "battles"
    this.brawlerFilter = "all"; // "all" | "1000" | "pwr11" | "rank" | "winstreak"
    this.searchQuery = "";
    this.selectedSpotlightBrawler = "LEON";
    this.lastTrophiesShown = 2136;
    this._preloadedUrls = new Set();
    this._imgCache = [];
    this._preloadQueueRunning = false;
    this._renderedGridSig = "";
    this._visibilityHooked = false;

    this.initBaselineData();
  }

  initBaselineData() {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_DATA);
      if (cached) {
        this.player = JSON.parse(cached);
        this.lastSyncTime = new Date();
      }
    } catch (_) {}

    if (!this.player) {
      fetch(`assets/brawl/initial_player_data.json?t=${Date.now()}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          const normalized = normalizeBrawlPayload(d, null);
          if (!this.player && normalized) {
            this.player = normalized;
            this.lastSyncTime = new Date();
            this.syncSource = "snapshot";
            this.exportTrophiesBridge();
            if (typeof requestIdleCallback === "function") {
              requestIdleCallback(() => this.preloadRosterPortraits(), { timeout: 1400 });
            } else {
              setTimeout(() => this.preloadRosterPortraits(), 300);
            }
            if (this.isViewActive()) this.renderAll();
          }
        })
        .catch(() => {});
    } else {
      this.exportTrophiesBridge();
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(() => this.preloadRosterPortraits(), { timeout: 1400 });
      }
    }

    // Start background live polling immediately so Home & Trophies stay up to date even before opening Brawl view
    setTimeout(() => this.startPolling(), 450);
  }

  preloadRosterPortraits(priorityList = null) {
    const brawlers = this.player?.brawlers;
    if (!brawlers || this._preloadQueueRunning) return;

    const list = priorityList || Object.entries(brawlers)
      .map(([id, b]) => ({ id, ...b }))
      .sort((a, b) => (b.trophies || 0) - (a.trophies || 0));

    const urls = list
      .map((b) => getBrawlerAvatarUrl(b))
      .filter((u) => u && !this._preloadedUrls.has(u));

    if (urls.length === 0) return;

    this._preloadQueueRunning = true;
    let idx = 0;
    const concurrency = 14;

    const worker = () => {
      if (idx >= urls.length) return;
      const url = urls[idx++];
      this._preloadedUrls.add(url);

      const img = new Image();
      img.referrerPolicy = "no-referrer";
      img.decoding = "async";
      img.src = url;
      this._imgCache.push(img);

      const finish = () => worker();
      if (img.decode) {
        img.decode().then(finish).catch(finish);
      } else {
        img.onload = finish;
        img.onerror = finish;
      }
    };

    for (let i = 0; i < Math.min(concurrency, urls.length); i++) {
      worker();
    }

    setTimeout(() => {
      this._preloadQueueRunning = false;
    }, 3500);
  }

  isViewActive() {
    const el = document.getElementById("ps5BrawlStarsView");
    return el && !el.hidden;
  }

  async fetchLiveProfile(force = false) {
    const prevTrophies = this.player?.trophies;
    const prevBattleTime = this.player?.battles?.[0]?.timestamp;
    const prevRankedElo = this.player?.rankedElo;

    let freshData = null;
    let sourceUsed = "snapshot";

    // Tier 1: Direct user/Cloudflare Live Proxy (works on GitHub Pages in real time!)
    const liveCfg = getLiveSyncSettings();
    const proxyBase = (liveCfg.brawlProxyUrl || "").trim().replace(/\/+$/, "");
    if (proxyBase) {
      try {
        const directUrl = proxyBase.includes("?")
          ? `${proxyBase}&tag=${this.tag}&t=${Date.now()}`
          : `${proxyBase}/api/brawl/player?tag=${this.tag}&t=${Date.now()}`;
        const res = await fetch(directUrl, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          const parsed = normalizeBrawlPayload(json, this.player, json.battlelog);
          if (parsed) {
            freshData = parsed;
            sourceUsed = "live-proxy";
          }
        }
      } catch (_) {}
    }

    // Tier 2: Local dev/proxy server endpoint (/api/brawl/player)
    if (!freshData) {
      try {
        const res = await fetch(`/api/brawl/player?t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          const parsed = normalizeBrawlPayload(json, this.player, json.battlelog);
          if (parsed) {
            freshData = parsed;
            sourceUsed = "local-api";
          }
        }
      } catch (_) {}
    }

    // Tier 3: Static snapshot updated by GitHub Actions (cache-busted for live GH Pages reload)
    if (!freshData) {
      try {
        const res = await fetch(`assets/brawl/initial_player_data.json?t=${Date.now()}`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          const parsed = normalizeBrawlPayload(json, this.player, json.battlelog);
          if (parsed) {
            freshData = parsed;
            sourceUsed = json._liveSource || "snapshot";
          }
        }
      } catch (_) {}
    }

    if (freshData && freshData.tag) {
      this.player = freshData;
      this.syncSource = sourceUsed;
      this.lastSyncTime = new Date();
      try {
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(freshData));
      } catch (_) {}

      this.exportTrophiesBridge();

      // Detect deltas & notify live
      if (prevTrophies !== undefined && prevTrophies !== freshData.trophies) {
        const diff = freshData.trophies - prevTrophies;
        const sign = diff > 0 ? `+${diff}` : `${diff}`;
        this.notifyChange(
          "Brawl Stars: Обновление кубков!",
          `Счёт: ${freshData.trophies.toLocaleString("ru-RU")} 🏆 (${sign})`,
          diff > 0 ? "success" : "info"
        );
      } else if (prevRankedElo !== undefined && freshData.rankedElo && prevRankedElo !== freshData.rankedElo) {
        const eloDiff = freshData.rankedElo - prevRankedElo;
        this.notifyChange(
          "Brawl Stars: Изменение рейтинга!",
          `Ранг: ${freshData.rankedRankName || "Ranked"} · ELO ${freshData.rankedElo} (${eloDiff > 0 ? "+" : ""}${eloDiff})`,
          eloDiff > 0 ? "success" : "info"
        );
      } else if (prevBattleTime && freshData.battles?.[0]?.timestamp !== prevBattleTime) {
        const latestBattle = freshData.battles[0];
        const isVictory = latestBattle.victory;
        const trophyChange = latestBattle.trophyChange;
        const deltaText = trophyChange ? ` (${trophyChange > 0 ? "+" : ""}${trophyChange} 🏆)` : "";
        this.notifyChange(
          "Brawl Stars: Завершён новый бой!",
          `${isVictory ? "Победа!" : "Поражение"} ${latestBattle.event?.mode || "Режим"} · ${latestBattle.event?.map || "Карта"}${deltaText}`,
          isVictory ? "success" : "info"
        );
      } else if (force) {
        const bCount = Object.keys(freshData.brawlers || {}).length || 108;
        this.notifyChange(
          "Brawl Stars",
          `Аккаунт #${freshData.tag} синхронизирован: ${(freshData.trophies || 0).toLocaleString("ru-RU")} 🏆 · ${bCount} бойцов`,
          "info"
        );
      }

      if (this.isViewActive()) {
        this.renderAll();
      } else {
        this.renderHeaderBar();
      }
      return freshData;
    }

    return this.player;
  }

  notifyChange(title, message, type = "info") {
    try {
      SoundEngine.informativeToasts();
    } catch (_) {}

    const toast = document.createElement("div");
    toast.className = `ps5-brawl-live-toast is-${type}`;
    toast.innerHTML = `
      <div class="brawl-toast-skull">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 3.84 2.16 7.18 5.34 8.86.35.18.76.05.95-.3.2-.35.07-.8-.28-.98C5.24 18.23 3.5 15.32 3.5 12c0-4.69 3.81-8.5 8.5-8.5s8.5 3.81 8.5 8.5c0 3.32-1.74 6.23-4.51 7.58-.35.18-.48.63-.28.98.19.35.6.48.95.3C19.84 19.18 22 15.84 22 12c0-5.52-4.48-10-10-10zm-3 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-6 6.5h6v1.5H9z"/></svg>
      </div>
      <div class="brawl-toast-body">
        <strong class="brawl-toast-title">${escapeHtml(title)}</strong>
        <span class="brawl-toast-msg">${escapeHtml(message)}</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("is-visible"), 10);
    setTimeout(() => {
      toast.classList.remove("is-visible");
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  startPolling() {
    if (!this._visibilityHooked && typeof document !== "undefined") {
      this._visibilityHooked = true;
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) this.fetchLiveProfile();
      });
      window.addEventListener("focus", () => {
        this.fetchLiveProfile();
      });
    }
    if (this.isPolling) return;
    this.isPolling = true;
    this.fetchLiveProfile();
    this.pollTimer = setInterval(() => {
      if (!document.hidden) {
        this.fetchLiveProfile();
      }
    }, 25000);
  }

  stopPolling() {
    this.isPolling = false;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  renderInlineStage() {
    const view = document.getElementById("ps5BrawlStarsView");
    if (view) view.scrollTop = 0;
    this.startPolling();
    this.renderAll();
  }

  stopInlineStage() {
    // Keep lightweight
  }

  renderAll() {
    const view = document.getElementById("ps5BrawlStarsView");
    if (!view) return;

    view.hidden = false;
    this.preloadRosterPortraits();
    this.renderHeaderBar();
    this.renderProfileBanner();
    this.renderSpotlightHero(false);
    this.renderBrawlersGrid();
    this.renderBattleHistory();
    this.renderStatsBar();
    this.initViewTabListeners();
    this.updateBrawlIndicators();
  }

  renderProfileBanner() {
    const banner = document.getElementById("brawlProfileBanner");
    if (!banner || !this.player) return;

    const p = this.player;
    const nameEl = banner.querySelector(".brawl-profile-name");
    if (nameEl) nameEl.textContent = p.name || "Cr1mnsx";

    const bioEl = banner.querySelector(".brawl-profile-bio");
    if (bioEl) {
      const clubName = p.club?.name || "0.3.7|teams";
      const clubTag = p.club?.tag || "80RYCLU9Q";
      const trophies = (p.trophies || 42512).toLocaleString("ru-RU");
      const count = Object.keys(p.brawlers || {}).length || 108;
      bioEl.innerHTML = `Добавляйся ко мне в друзья по тегу <strong>#${escapeHtml(this.tag)}</strong> для совместных каток в 3v3 и Ранговом бою · ${trophies} 🏆 · ${count} бойцов · Клуб <strong>${escapeHtml(clubName)}</strong> (#${escapeHtml(clubTag)})`;
    }
  }

  openAddFriendDialog() {
    const modal = document.getElementById("modalBrawlInvite");
    if (!modal) return;
    try { SoundEngine.openDialog(); } catch (_) {}

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");

    const qrBox = document.getElementById("brawlInviteQrBox");
    if (qrBox && !qrBox.dataset.rendered) {
      qrBox.innerHTML = "";
      const inviteUrl = `https://link.brawlstars.com/invite/friend/ru?tag=${this.tag}`;
      if (typeof window.qrcode === "function") {
        try {
          const qr = window.qrcode(0, "M");
          qr.addData(inviteUrl);
          qr.make();
          qrBox.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true, title: `Brawl Stars QR ${this.tag}` });
          qrBox.dataset.rendered = "1";
        } catch (_) {
          qrBox.textContent = `#${this.tag}`;
        }
      } else {
        qrBox.textContent = `#${this.tag}`;
      }
    }
  }

  closeAddFriendDialog() {
    const modal = document.getElementById("modalBrawlInvite");
    if (!modal) return;
    try { SoundEngine.cancel(); } catch (_) {}
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }

  updateBrawlIndicators() {
    requestAnimationFrame(() => {
      const modeTabs = document.getElementById("brawlModeTabs");
      const modeInd = document.getElementById("brawlModeIndicator");
      const activeMode = modeTabs?.querySelector(".brawl-mode-tab.is-active");
      if (modeTabs && modeInd && activeMode) {
        modeInd.style.transform = `translateX(${activeMode.offsetLeft}px)`;
        modeInd.style.width = `${activeMode.offsetWidth}px`;
      }

      const filterPills = document.getElementById("brawlFilterPills");
      const filterInd = document.getElementById("brawlFilterIndicator");
      const activeFilter = filterPills?.querySelector(".brawl-filter-pill.is-active");
      if (filterPills && filterInd && activeFilter) {
        filterInd.style.transform = `translateX(${activeFilter.offsetLeft}px)`;
        filterInd.style.width = `${activeFilter.offsetWidth}px`;
      }
    });
  }

  renderHeaderBar() {
    const p = this.player;
    if (!p) return;

    const trophiesEl = document.getElementById("brawlTrophiesCount");
    if (trophiesEl) trophiesEl.textContent = (p.trophies || 0).toLocaleString("ru-RU");

    const statusEl = document.getElementById("brawlTelemetryStatus");
    if (statusEl) {
      const brawlerCount = Object.keys(p.brawlers || {}).length || 0;
      const syncStr = this.lastSyncTime
        ? `Обновлено ${this.lastSyncTime.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
        : "В сети";
      statusEl.textContent = `${(p.trophies || 0).toLocaleString("ru-RU")} 🏆 · ${brawlerCount} бойцов · ${syncStr}`;
    }

    const livePill = document.getElementById("brawlLiveStatusPill");
    if (livePill) {
      const isDirect = this.syncSource === "live-proxy" || this.syncSource === "local-api";
      const timeTag = this.lastSyncTime
        ? this.lastSyncTime.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        : "";
      livePill.innerHTML = isDirect
        ? `<span class="brawl-status-dot"></span> Прямой эфир · Live (${timeTag})`
        : `<span class="brawl-status-dot"></span> Авто-синк · ${timeTag || "Снимок"}`;
    }

    const battlesBtnSpan = document.querySelector("#btnBrawlTabBattles span");
    if (battlesBtnSpan) {
      const len = Array.isArray(p.battles) ? p.battles.length : 0;
      battlesBtnSpan.textContent = `История боёв (${len})`;
    }
  }

  renderStatsBar() {
    const p = this.player;
    if (!p) return;

    const brawlerCount = Object.keys(p.brawlers || {}).length || 108;
    const wins3v3 = p["3vs3Victories"] || 2840;
    const winsSolo = p.soloVictories || 633;
    const winsDuo = p.duoVictories || 918;
    const totalWins = wins3v3 + winsSolo + winsDuo;

    const container = document.getElementById("brawlStatsOverviewBar");
    if (!container) return;

    container.innerHTML = `
      <div class="brawl-stat-chip">
        <span class="brawl-sc-val">${(p.trophies || 42512).toLocaleString("ru-RU")}</span>
        <span class="brawl-sc-lbl">КУБКОВ 🏆 (МАКС: ${(p.highestTrophies || 42512).toLocaleString("ru-RU")})</span>
      </div>
      <div class="brawl-stat-chip">
        <span class="brawl-sc-val">${brawlerCount}</span>
        <span class="brawl-sc-lbl">БОЙЦОВ ИЗ 108</span>
      </div>
      <div class="brawl-stat-chip is-fame">
        <span class="brawl-sc-val">${p.fameTierName || "MARTIAN FAME II"}</span>
        <span class="brawl-sc-lbl">СЛАВА (${(p.fame || 20865).toLocaleString("ru-RU")} ОЧКОВ)</span>
      </div>
      <div class="brawl-stat-chip is-ranked">
        <span class="brawl-sc-val">${p.rankedRankName || "DIAMOND I"}</span>
        <span class="brawl-sc-lbl">РЕЙТИНГ (ELO: ${p.rankedElo || 4067})</span>
      </div>
      <div class="brawl-stat-chip is-club">
        <span class="brawl-sc-val">${p.club?.name || "0.3.7|teams"}</span>
        <span class="brawl-sc-lbl">КЛУБ (#${p.club?.tag || "80RYCLU9Q"})</span>
      </div>
      <div class="brawl-stat-chip">
        <span class="brawl-sc-val">${totalWins.toLocaleString("ru-RU")}</span>
        <span class="brawl-sc-lbl">ВСЕГО ПОБЕД (3v3: ${wins3v3.toLocaleString("ru-RU")} · SOLO: ${winsSolo} · DUO: ${winsDuo})</span>
      </div>
    `;
  }

  renderSpotlightHero(animate = false) {
    const p = this.player;
    if (!p) return;

    const brawlers = p.brawlers || {};
    const brawlerList = Object.entries(brawlers).map(([id, b]) => ({ id, ...b }));
    brawlerList.sort((a, b) => (b.trophies || 0) - (a.trophies || 0));

    // Find requested hero
    let curBrawler = brawlerList.find(
      (b) => (b.name || "").toUpperCase() === this.selectedSpotlightBrawler.toUpperCase()
    );
    if (!curBrawler && brawlerList.length > 0) curBrawler = brawlerList[0];
    if (!curBrawler) return;

    const name = curBrawler.name || "LEON";
    const trophies = curBrawler.trophies || 0;
    const maxTrophies = curBrawler.highestTrophies || trophies;
    const power = curBrawler.power || 11;
    const rank = curBrawler.rank || 1;
    const winStreak = curBrawler.currentWinStreak || 0;
    const maxWinStreak = curBrawler.maxWinStreak || 0;
    const skinName = curBrawler.skin?.name || "";

    // Dynamic Rarity & Model
    const rarity = getBrawlerRarityInfo(name);
    const modelUrl = getBrawlerModelUrl(curBrawler);
    const avatarUrl = getBrawlerAvatarUrl(curBrawler);

    // Abilities & Loadout
    const gadget = curBrawler.gadgets?.[0]?.name || (curBrawler.buffies?.gadget ? "Активирован" : "Не установлен");
    const starPower = curBrawler.starPowers?.[0]?.name || (curBrawler.buffies?.starPower ? "Активирована" : "Не установлена");
    const hasHyper = (curBrawler.hyperCharges && curBrawler.hyperCharges.length > 0) || curBrawler.buffies?.hyperCharge;
    const hyperTitle = curBrawler.hyperCharges?.[0]?.name || (hasHyper ? "Заряжен (Power 11)" : "Не разблокирован");
    const gearsDesc = (curBrawler.gears || []).map((g) => g.name).join(" + ") || "Снаряжение экипировано";

    const spotlightContainer = document.getElementById("brawlSpotlightCard");
    if (!spotlightContainer) return;

    spotlightContainer.innerHTML = `
      <div class="brawl-spotlight-inner" style="--spotlight-glow: ${rarity.glow}">
        <!-- Left: 3D Character Stage -->
        <div class="brawl-spotlight-visual">
          <div class="brawl-spotlight-aura"></div>
          <img src="${modelUrl}" 
               alt="${escapeHtml(name)}" 
               class="brawl-spotlight-hero-img ${animate ? "brawl-hero-entrance" : ""}" 
               id="brawlSpotlightHeroImg"
               loading="eager"
               decoding="async"
               referrerpolicy="no-referrer"
               onerror="if (!this.dataset.ret1) { this.dataset.ret1='1'; this.src='${avatarUrl}'; } else { this.onerror=null; this.src='assets/covers/brawl_stars.jpg'; }" />
          <div class="brawl-spotlight-pedestal"></div>
        </div>

        <!-- Right: Character Telemetry & Gear Spec -->
        <div class="brawl-spotlight-details">
          <div class="brawl-spotlight-top-badge">
            <span class="brawl-pill-legendary" style="background: ${rarity.color}; color: #181428;">${rarity.name}</span>
            <span class="brawl-pill-rank">ПРЕСТИЖ РАНГ ${rank}</span>
            ${skinName ? `<span class="brawl-pill-skin">${escapeHtml(skinName)}</span>` : ""}
          </div>

          <h2 class="brawl-spotlight-title">${escapeHtml(name)}</h2>

          <div class="brawl-spotlight-cups-row">
            <div class="brawl-big-trophy-display">
              <span class="brawl-btd-icon">🏆</span>
              <span class="brawl-btd-val" id="brawlSpotlightTrophyVal">${trophies.toLocaleString("ru-RU")}</span>
              <span class="brawl-btd-max">РЕКОРД: ${maxTrophies.toLocaleString("ru-RU")}</span>
            </div>
            <div class="brawl-pwr-badge ${power === 11 ? "is-pwr11" : ""}">
              <span class="brawl-pwr-label">POWER</span>
              <span class="brawl-pwr-val">${power}</span>
            </div>
            <div class="brawl-streak-badge ${winStreak > 0 ? "is-hot" : ""}">
              <span class="brawl-streak-icon">🔥</span>
              <span class="brawl-streak-val">${winStreak} ВИНСТРИК</span>
              <span class="brawl-streak-max">(МАКС: ${maxWinStreak})</span>
            </div>
          </div>

          <!-- Hero Gear & Abilities Specs -->
          <div class="brawl-hero-loadout">
            <div class="brawl-loadout-item" title="Гаджет">
              <span class="brawl-loadout-icon">⚙️</span>
              <div class="brawl-loadout-text">
                <span class="brawl-lt-title">ГАДЖЕТ</span>
                <span class="brawl-lt-sub">${escapeHtml(gadget)}</span>
              </div>
            </div>
            <div class="brawl-loadout-item" title="Звёздная сила">
              <span class="brawl-loadout-icon">⭐</span>
              <div class="brawl-loadout-text">
                <span class="brawl-lt-title">ЗВЁЗДНАЯ СИЛА</span>
                <span class="brawl-lt-sub">${escapeHtml(starPower)}</span>
              </div>
            </div>
            <div class="brawl-loadout-item ${hasHyper ? "is-hypercharge" : ""}" title="Гиперзаряд">
              <span class="brawl-loadout-icon">⚡</span>
              <div class="brawl-loadout-text">
                <span class="brawl-lt-title">ГИПЕРЗАРЯД</span>
                <span class="brawl-lt-sub">${escapeHtml(hyperTitle)}</span>
              </div>
            </div>
            <div class="brawl-loadout-item" title="Снаряжение">
              <span class="brawl-loadout-icon">🛡️</span>
              <div class="brawl-loadout-text">
                <span class="brawl-lt-title">СНАРЯЖЕНИЕ</span>
                <span class="brawl-lt-sub">${escapeHtml(gearsDesc)}</span>
              </div>
            </div>
          </div>

          <!-- Quick Switcher for Top Brawlers -->
          <div class="brawl-top-switch-row">
            <span class="brawl-ts-label">Топ бойцы аккаунта:</span>
            <div class="brawl-ts-buttons">
              ${brawlerList.slice(0, 7).map((b) => `
                <button type="button" class="brawl-ts-btn ${b.name.toUpperCase() === name.toUpperCase() ? "is-active" : ""}" data-brawler="${escapeHtml(b.name)}">
                  <span>${escapeHtml(b.name)}</span>
                  <span class="brawl-ts-cups">${(b.trophies || 0).toLocaleString("ru-RU")} 🏆</span>
                </button>
              `).join("")}
            </div>
          </div>
        </div>
      </div>
    `;

    // Trophy count-up animation
    if (animate) {
      const numEl = document.getElementById("brawlSpotlightTrophyVal");
      animateNumber(numEl, this.lastTrophiesShown, trophies, 350);
      const heroImg = document.getElementById("brawlSpotlightHeroImg");
      if (heroImg && heroImg.animate) {
        heroImg.animate(
          [
            { opacity: 0.25, transform: "translate3d(0, 14px, 0) scale(0.90)" },
            { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" }
          ],
          { duration: 380, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" }
        );
      }
    }
    this.lastTrophiesShown = trophies;

    // Listeners on quick switcher buttons
    spotlightContainer.querySelectorAll(".brawl-ts-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        try { SoundEngine.enter(); } catch (_) {}
        this.selectBrawler(btn.dataset.brawler);
      });
    });

    if (window.initSpotlightAndTilt) {
      window.initSpotlightAndTilt();
    }
  }

  selectBrawler(brawlerName) {
    if (!brawlerName) return;
    this.selectedSpotlightBrawler = brawlerName;
    try { SoundEngine.enter(); } catch (_) {}
    this.renderSpotlightHero(true);
    this.highlightSelectedBrawlerCard();
  }

  highlightSelectedBrawlerCard() {
    const cards = document.querySelectorAll(".brawler-grid-card");
    cards.forEach((card) => {
      const match = (card.dataset.brawler || "").toUpperCase() === this.selectedSpotlightBrawler.toUpperCase();
      card.classList.toggle("is-selected", match);
    });
  }

  renderBrawlersGrid() {
    const p = this.player;
    if (!p) return;

    const container = document.getElementById("brawlRosterGrid");
    if (!container) return;

    const brawlers = p.brawlers || {};
    let list = Object.entries(brawlers).map(([id, b]) => ({ id, ...b }));

    // Apply Filter
    if (this.brawlerFilter === "1000") {
      list = list.filter((b) => (b.trophies || 0) >= 1000);
    } else if (this.brawlerFilter === "pwr11") {
      list = list.filter((b) => (b.power || 0) === 11);
    } else if (this.brawlerFilter === "rank") {
      list = list.filter((b) => (b.rank || 0) >= 5);
    } else if (this.brawlerFilter === "winstreak") {
      list = list.filter((b) => (b.currentWinStreak || 0) > 0 || (b.maxWinStreak || 0) >= 10);
    }

    // Apply Search
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      list = list.filter((b) => (b.name || "").toLowerCase().includes(q));
    }

    // Sort by trophies descending
    list.sort((a, b) => (b.trophies || 0) - (a.trophies || 0));

    const countEl = document.getElementById("brawlRosterCountText");
    if (countEl) countEl.textContent = `Показано ${list.length} из ${Object.keys(brawlers).length} бойцов`;

    const sig = `${this.brawlerFilter}|${this.searchQuery.trim()}|${list.map((b) => `${b.id}:${b.trophies}`).join(",")}`;
    if (this._renderedGridSig === sig && container.querySelector(".brawler-grid-card")) {
      this.highlightSelectedBrawlerCard();
      return;
    }
    this._renderedGridSig = sig;
    this.preloadRosterPortraits(list);

    if (list.length === 0) {
      container.innerHTML = `
        <div class="brawl-empty-state">
          <span>По запросу «${escapeHtml(this.searchQuery)}» бойцы не найдены</span>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map((b, idx) => {
      const name = b.name || "BRAWLER";
      const trophies = (b.trophies || 0).toLocaleString("ru-RU");
      const power = b.power || 1;
      const rank = b.rank || 1;
      const winStreak = b.currentWinStreak || 0;
      const skinName = b.skin?.name || "";
      const isSelected = name.toUpperCase() === this.selectedSpotlightBrawler.toUpperCase();
      const rarity = getBrawlerRarityInfo(name);

      const avatarUrl = getBrawlerAvatarUrl(b);
      const priorityAttr = idx < 24 ? 'fetchpriority="high"' : "";

      return `
        <article class="brawler-grid-card ${b.trophies >= 1000 ? "is-legend" : ""} ${isSelected ? "is-selected" : ""}" 
                 data-brawler="${escapeHtml(name)}" 
                 tabindex="0" 
                 role="button"
                 style="--card-accent: ${rarity.color}">
          <div class="brawler-card-thumb-wrap">
            <img src="${avatarUrl}" 
                 alt="${escapeHtml(name)}" 
                 class="brawler-card-avatar" 
                 loading="eager" 
                 decoding="async" 
                 ${priorityAttr}
                 referrerpolicy="no-referrer"
                 onload="this.classList.add('is-loaded')"
                 onerror="this.onerror=null; this.src='assets/covers/brawl_stars.jpg'; this.classList.add('is-loaded');" />
            <span class="brawler-card-pwr ${power === 11 ? "is-max" : ""}">PWR ${power}</span>
            <span class="brawler-card-rank">R${rank}</span>
            ${winStreak > 0 ? `<span class="brawler-card-streak">🔥 ${winStreak}</span>` : ""}
            <div class="brawler-card-active-glow"></div>
          </div>
          <div class="brawler-card-meta">
            <div class="brawler-card-title-row">
              <strong class="brawler-card-name">${escapeHtml(name)}</strong>
              <span class="brawler-card-trophies"><svg width="12" height="12" viewBox="0 0 24 24" fill="#FFCC00"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H8v2h8v-2h-3v-3.1c1.8-.3 3.32-1.5 3.61-3.06C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z"/></svg> ${trophies}</span>
            </div>
            ${skinName ? `<span class="brawler-card-skin">${escapeHtml(skinName)}</span>` : `<span class="brawler-card-max">Макс: ${(b.highestTrophies || b.trophies || 0).toLocaleString("ru-RU")}</span>`}
          </div>
        </article>
      `;
    }).join("");

    // Mark cached/already-complete portraits immediately to avoid any fade flash
    container.querySelectorAll(".brawler-card-avatar").forEach((imgEl) => {
      if (imgEl.complete) imgEl.classList.add("is-loaded");
    });

    // Clicking a brawler updates the spotlight with animation
    container.querySelectorAll(".brawler-grid-card").forEach((card) => {
      card.addEventListener("click", () => {
        // Visual press pop
        card.classList.add("brawler-card-popped");
        setTimeout(() => card.classList.remove("brawler-card-popped"), 350);

        this.selectBrawler(card.dataset.brawler);

        // Smoothly scroll only the Brawl Stars view back up so the spotlight hero is visible without breaking the layout
        const brawlView = document.getElementById("ps5BrawlStarsView");
        if (brawlView && brawlView.scrollTop > 80) {
          brawlView.scrollTo({ top: 0, behavior: "smooth" });
        }
        // Safety guard: ensure outer shell containers are never scrolled out of place
        if (window.scrollY !== 0) window.scrollTo(0, 0);
        const stage = document.getElementById("viewportStage");
        if (stage && stage.scrollTop !== 0) stage.scrollTop = 0;
        const screen = document.getElementById("stageHome");
        if (screen && screen.scrollTop !== 0) screen.scrollTop = 0;
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.click();
        }
      });
    });

    if (window.initSpotlightAndTilt) {
      window.initSpotlightAndTilt();
    }
  }

  renderBattleHistory() {
    const p = this.player;
    if (!p) return;

    const container = document.getElementById("brawlBattlesList");
    if (!container) return;

    const battles = p.battles || [];
    if (battles.length === 0) {
      container.innerHTML = `<div class="brawl-empty-state">История боёв временно недоступна</div>`;
      return;
    }

    const brawlerIdByName = new Map();
    Object.entries(p.brawlers || {}).forEach(([key, br]) => {
      const numericId = br?.id;
      if (!numericId) return;
      if (key) brawlerIdByName.set(String(key).toLowerCase().trim(), numericId);
      if (br?.name) brawlerIdByName.set(String(br.name).toLowerCase().trim(), numericId);
    });

    container.innerHTML = battles.map((b) => {
      const mode = b.event?.mode || "3v3";
      const map = b.event?.map || "Арена боя";
      const isVictory = b.victory === true || (b.result && b.result.toLowerCase().includes("victory")) || (b.result && b.result.includes("Rank 1"));
      const isDefeat = b.victory === false || (b.result && b.result.toLowerCase().includes("defeat"));
      const resultText = isVictory ? "ПОБЕДА" : (isDefeat ? "ПОРАЖЕНИЕ" : (b.result || "МАТЧ"));
      const trophyDelta = b.trophyChange;
      const trophyStr = trophyDelta !== null && trophyDelta !== undefined
        ? (trophyDelta > 0 ? `+${trophyDelta}` : `${trophyDelta}`)
        : "";

      const timeAgo = this.formatTimeAgo(b.timestamp);

      // Find user
      let userEntry = null;
      (b.teams || []).forEach((team) => {
        team.forEach((player) => {
          if (player.tag === this.tag || (player.name && player.name.toLowerCase() === "cr1mnsx")) {
            userEntry = player;
          }
        });
      });

      const userBrawler = userEntry?.brawler || "leon";
      const userPwr = userEntry?.brawlerPower || 11;
      const resolvedUserId = userEntry?.id || brawlerIdByName.get(userBrawler.toLowerCase().trim()) || brawlerIdByName.get(getBrawlerSlug(userBrawler)) || "16000023";
      const brawlerAvatar = `https://cdn.brawlify.com/brawlers/borderless/${resolvedUserId}.png`;

      return `
        <article class="brawl-battle-card ${isVictory ? "is-win" : "is-loss"}">
          <div class="bbc-result-pill ${isVictory ? "is-win" : "is-loss"}">
            <span class="bbc-rp-text">${resultText}</span>
            ${trophyStr ? `<strong class="bbc-rp-delta">${trophyStr} 🏆</strong>` : ""}
          </div>

          <div class="bbc-meta-col">
            <div class="bbc-mode-row">
              <span class="bbc-mode-name">${escapeHtml(mode.toUpperCase())}</span>
              <span class="bbc-dot">·</span>
              <span class="bbc-map-name">${escapeHtml(map)}</span>
            </div>
            <span class="bbc-timestamp">${timeAgo}</span>
          </div>

          <div class="bbc-brawler-col">
            <img src="${brawlerAvatar}" alt="${escapeHtml(userBrawler)}" class="bbc-brawler-thumb" loading="eager" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='assets/covers/brawl_stars.jpg';" />
            <div class="bbc-brawler-info">
              <strong class="bbc-bi-name">${escapeHtml(userBrawler.toUpperCase())}</strong>
              <span class="bbc-bi-pwr">PWR ${userPwr}</span>
            </div>
          </div>

          <!-- Teams Roster Preview -->
          <div class="bbc-teams-preview">
            ${(b.teams || []).map((team, tIdx) => `
              <div class="bbc-team-group ${tIdx === 0 ? "team-blue" : "team-red"}">
                ${team.map((m) => {
                  const mName = (m.brawler || "").toLowerCase().trim();
                  const mId = m.id || brawlerIdByName.get(mName) || brawlerIdByName.get(getBrawlerSlug(mName));
                  const mSrc = mId ? `https://cdn.brawlify.com/brawlers/borderless/${mId}.png` : "assets/covers/brawl_stars.jpg";
                  return `
                    <span class="bbc-team-member ${m.tag === this.tag ? "is-self" : ""}" title="${escapeHtml(m.name)} (${escapeHtml(m.brawler)})">
                      <img src="${mSrc}" loading="eager" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='assets/covers/brawl_stars.jpg';" alt="${escapeHtml(m.brawler)}" />
                    </span>
                  `;
                }).join("")}
              </div>
            `).join("")}
          </div>
        </article>
      `;
    }).join("");
  }

  formatTimeAgo(isoString) {
    if (!isoString) return "Недавно";
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 60) return "Только что";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} мин. назад`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} ч. назад`;
    return `${Math.floor(diffSec / 86400)} дн. назад`;
  }

  /* ============================================================
   * VIEW TABS, PROFILE FRIEND ACTIONS & FILTER CONTROLS
   * ============================================================ */
  initViewTabListeners() {
    const btnRoster = document.getElementById("btnBrawlTabRoster");
    const btnBattles = document.getElementById("btnBrawlTabBattles");

    const stageRoster = document.getElementById("brawlStageRoster");
    const stageBattles = document.getElementById("brawlStageBattles");

    const setTab = (tab) => {
      const normalized = tab === "battles" ? "battles" : "roster";
      this.activeTab = normalized;
      try { SoundEngine.enter(); } catch (_) {}

      if (btnRoster) {
        btnRoster.classList.toggle("is-active", normalized === "roster");
        btnRoster.setAttribute("aria-selected", String(normalized === "roster"));
      }
      if (btnBattles) {
        btnBattles.classList.toggle("is-active", normalized === "battles");
        btnBattles.setAttribute("aria-selected", String(normalized === "battles"));
      }

      if (stageRoster) stageRoster.hidden = normalized !== "roster";
      if (stageBattles) stageBattles.hidden = normalized !== "battles";

      const targetStage = normalized === "battles" ? stageBattles : stageRoster;
      if (targetStage && targetStage.animate) {
        targetStage.animate(
          [{ opacity: 0, transform: "translate3d(0, 10px, 0)" }, { opacity: 1, transform: "translate3d(0, 0, 0)" }],
          { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" }
        );
      }

      this.updateBrawlIndicators();
      if (window.initSpotlightAndTilt) {
        window.initSpotlightAndTilt();
      }
    };

    if (!this._resizeBound) {
      this._resizeBound = true;
      window.addEventListener("resize", () => this.updateBrawlIndicators(), { passive: true });
    }

    if (btnRoster) btnRoster.onclick = () => setTab("roster");
    if (btnBattles) btnBattles.onclick = () => setTab("battles");

    // Filter Pills
    document.querySelectorAll(".brawl-filter-pill").forEach((pill) => {
      pill.onclick = () => {
        try { SoundEngine.enter(); } catch (_) {}
        document.querySelectorAll(".brawl-filter-pill").forEach((p) => p.classList.remove("is-active"));
        pill.classList.add("is-active");
        this.brawlerFilter = pill.dataset.filter || "all";
        this.updateBrawlIndicators();
        this.renderBrawlersGrid();
      };
    });

    // Search input
    const searchInput = document.getElementById("brawlBrawlerSearchInput");
    if (searchInput) {
      searchInput.oninput = (e) => {
        this.searchQuery = e.target.value;
        this.renderBrawlersGrid();
      };
    }

    // Header & Profile Add Friend buttons
    const copyTag = () => {
      navigator.clipboard?.writeText(this.tag);
      try { SoundEngine.enter(); } catch (_) {}
      this.notifyChange("Тег скопирован", `#${this.tag} скопирован в буфер обмена`, "info");
    };

    const btnSync = document.getElementById("btnBrawlSync");
    if (btnSync) {
      btnSync.onclick = () => {
        try { SoundEngine.enter(); } catch (_) {}
        btnSync.classList.add("is-spinning");
        this.fetchLiveProfile(true).finally(() => {
          setTimeout(() => btnSync.classList.remove("is-spinning"), 800);
        });
      };
    }

    const btnAddFriend = document.getElementById("btnBrawlAddFriend");
    if (btnAddFriend) btnAddFriend.onclick = () => this.openAddFriendDialog();

    const btnProfileQr = document.getElementById("btnBrawlProfileQr");
    if (btnProfileQr) btnProfileQr.onclick = () => this.openAddFriendDialog();

    const btnProfileInvite = document.getElementById("btnBrawlProfileInviteLink");
    if (btnProfileInvite) {
      btnProfileInvite.onclick = () => {
        copyTag();
        window.open(`https://link.brawlstars.com/invite/friend/ru?tag=${this.tag}`, "_blank", "noopener,noreferrer");
      };
    }

    const btnProfileCopyTag = document.getElementById("btnBrawlProfileCopyTag");
    if (btnProfileCopyTag) btnProfileCopyTag.onclick = copyTag;

    const btnProfilePs5 = document.getElementById("btnBrawlProfilePs5Friend");
    if (btnProfilePs5) {
      btnProfilePs5.onclick = () => {
        try { SoundEngine.openDialog(); } catch (_) {}
        if (window.openAddFriendModal) window.openAddFriendModal();
      };
    }

    const btnTrophies = document.getElementById("btnBrawlTrophiesView");
    if (btnTrophies) {
      btnTrophies.onclick = () => {
        const psnBtn = document.getElementById("btnOpenPsnModal");
        if (psnBtn) psnBtn.click();
      };
    }

    const tagCopyBtn = document.getElementById("brawlTagCopyBtn");
    if (tagCopyBtn) tagCopyBtn.onclick = copyTag;

    // Invite Modal controls
    document.getElementById("btnCloseBrawlInvite")?.addEventListener("click", () => this.closeAddFriendDialog());
    document.getElementById("backdropBrawlInvite")?.addEventListener("click", () => this.closeAddFriendDialog());
    const btnModalCopyPlayer = document.getElementById("btnModalCopyPlayerTag");
    if (btnModalCopyPlayer) btnModalCopyPlayer.onclick = copyTag;

    const btnModalCopyClub = document.getElementById("btnModalCopyClubTag");
    if (btnModalCopyClub) {
      btnModalCopyClub.onclick = () => {
        const clubTag = this.player?.club?.tag || "80RYCLU9Q";
        navigator.clipboard?.writeText(clubTag);
        try { SoundEngine.enter(); } catch (_) {}
        this.notifyChange("Тег клуба скопирован", `#${clubTag} скопирован`, "info");
      };
    }

    const btnModalPs5 = document.getElementById("btnModalOpenPs5Friend");
    if (btnModalPs5) {
      btnModalPs5.onclick = () => {
        this.closeAddFriendDialog();
        if (window.openAddFriendModal) window.openAddFriendModal();
      };
    }
  }

  /* ============================================================
   * LIVE BRAWL STARS SKILLS & ACHIEVEMENTS BRIDGE -> PS5 PROFILE
   * Computed strictly from real account data (#2RGUQJQ0R)
   * ============================================================ */
  exportTrophiesBridge() {
    const p = this.player;
    if (!p) return null;

    const brawlers = p.brawlers || {};
    const brawlerList = Object.values(brawlers);
    const brawlerCount = brawlerList.length;
    const trophies = Number(p.trophies || 0);
    const highestTrophies = Number(p.highestTrophies || trophies);
    const wins3v3 = Number(p["3vs3Victories"] || 0);
    const winsSolo = Number(p.soloVictories || 0);
    const winsDuo = Number(p.duoVictories || 0);
    const totalWins = wins3v3 + winsSolo + winsDuo;

    const findBrawler = (upperName) =>
      brawlerList.find((b) => String(b.name || "").toUpperCase() === upperName);
    const bTrophies = (upperName) => Number(findBrawler(upperName)?.trophies || 0);

    const leonTrophies = bTrophies("LEON");
    const crowTrophies = bTrophies("CROW");
    const spikeTrophies = bTrophies("SPIKE");
    const cordeliusTrophies = bTrophies("CORDELIUS");
    const kazeTrophies = bTrophies("KAZE");

    const max1000Count = brawlerList.filter((b) => Number(b.trophies || 0) >= 1000).length;
    const pwr11Count = brawlerList.filter((b) => Number(b.power || 0) >= 11).length;
    const hyperChargeCount = brawlerList.reduce((acc, b) => acc + (b.hyperCharges?.length || 0), 0);
    const starPowersCount = brawlerList.reduce((acc, b) => acc + (b.starPowers?.length || 0), 0);
    const gadgetsCount = brawlerList.reduce((acc, b) => acc + (b.gadgets?.length || 0), 0);
    const gearsCount = brawlerList.reduce((acc, b) => acc + (b.gears?.length || 0), 0);
    const skinsCount = brawlerList.filter((b) => Boolean(b.skin?.name)).length;
    const maxWinStreak = brawlerList.reduce((acc, b) => Math.max(acc, Number(b.maxWinStreak || 0)), 0);
    const curRankedElo = Number(p.rankedElo || 0);
    const peakRankedElo = Math.max(curRankedElo, Number(p.highestAllTimeRankedElo || 0));
    const latestBattleTs = p.battles?.[0]?.timestamp || p.lastUpdated || new Date().toISOString();
    const recentWins = (p.battles || []).filter((b) => b.victory === true).length;

    const skillsList = [
      // NEXT PLATINUM GOAL (locked until 50K trophies & 15+ brawlers 1000+ — preserves honest 2 PSN Platinums)
      {
        trophyId: 1,
        trophyType: "platinum",
        trophyName: "Абсолют Brawl Stars (50 000 🏆 + 15×1000)",
        trophyDetail: `Следующая цель аккаунта #2RGUQJQ0R: ${highestTrophies.toLocaleString("ru-RU")} / 50 000 кубков · 1000+ бойцов: ${max1000Count} / 15.`,
        trophyIconUrl: "assets/covers/brawl_stars.jpg",
        earned: highestTrophies >= 50000 && max1000Count >= 15,
        earnedDateTime: latestBattleTs
      },
      // GOLD SKILLS (High-tier skills verified from API metrics)
      {
        trophyId: 2,
        trophyType: "gold",
        trophyName: "Повелитель Арены 40 000+",
        trophyDetail: `Текущий счёт аккаунта: ${trophies.toLocaleString("ru-RU")} 🏆 (макс: ${highestTrophies.toLocaleString("ru-RU")}).`,
        trophyIconUrl: "assets/brawl/brawlers/leon_model.webp",
        earned: highestTrophies >= 40000,
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 3,
        trophyType: "gold",
        trophyName: "Мастер скрытности: Леон 2000+",
        trophyDetail: `Набрать 2 000+ кубков на бойце LEON (сейчас: ${leonTrophies.toLocaleString("ru-RU")} 🏆).`,
        trophyIconUrl: "assets/brawl/brawlers/leon_model.webp",
        earned: leonTrophies >= 2000,
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 4,
        trophyType: "gold",
        trophyName: `Космическая слава (${p.fameTierName || "MARTIAN FAME II"})`,
        trophyDetail: `Накопить 20 000+ очков славы на аккаунте (сейчас: ${Number(p.fame || 0).toLocaleString("ru-RU")} очков).`,
        trophyIconUrl: "assets/brawl/avatars/player_avatar.webp",
        earned: Number(p.fame || 0) >= 20000,
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 5,
        trophyType: "gold",
        trophyName: "Полный боевой ростер (100+ бойцов)",
        trophyDetail: `Разблокировать 100+ бойцов (в аккаунте открыто: ${brawlerCount}).`,
        trophyIconUrl: "assets/brawl/brawlers/crow_model.webp",
        earned: brawlerCount >= 100,
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 6,
        trophyType: "gold",
        trophyName: "Командный стратег (2500+ побед 3v3)",
        trophyDetail: `Одержать 2 500+ побед в режимах 3v3 (сейчас: ${wins3v3.toLocaleString("ru-RU")}).`,
        trophyIconUrl: "assets/brawl/brawlers/spike_model.webp",
        earned: wins3v3 >= 2500,
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 7,
        trophyType: "gold",
        trophyName: "Ранговая лига Diamond+ (3000+ ELO)",
        trophyDetail: `Текущий ранг: ${p.rankedRankName || "DIAMOND I"} (${curRankedElo} ELO · пик: ${p.highestAllTimeRankedRankName || "DIAMOND III"}, ${peakRankedElo} ELO).`,
        trophyIconUrl: "assets/brawl/avatars/player_avatar.webp",
        earned: peakRankedElo >= 3000,
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 8,
        trophyType: "gold",
        trophyName: "Лига Mythic (Цель: 4500+ ELO)",
        trophyDetail: `Повысить рейтинг до 4 500+ ELO в ранговых матчах (текущий пик: ${peakRankedElo} / 4 500 ELO).`,
        trophyIconUrl: "assets/brawl/avatars/player_avatar.webp",
        earned: peakRankedElo >= 4500,
        earnedDateTime: latestBattleTs
      },
      // SILVER SKILLS (Roster & mechanics mastery)
      {
        trophyId: 9,
        trophyType: "silver",
        trophyName: "Элитная семёрка (7+ бойцов 1000+)",
        trophyDetail: `Довести минимум 7 бойцов до 1 000+ 🏆 (сейчас таких бойцов: ${max1000Count}).`,
        trophyIconUrl: "assets/brawl/brawlers/crow_model.webp",
        earned: max1000Count >= 7,
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 10,
        trophyType: "silver",
        trophyName: "Непобедимый винстрик 15+",
        trophyDetail: `Максимальная серия побед на бойце: ${maxWinStreak} подряд.`,
        trophyIconUrl: "assets/brawl/brawlers/shelly_model.webp",
        earned: maxWinStreak >= 15,
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 11,
        trophyType: "silver",
        trophyName: "Мастерство Crow (1000+ 🏆)",
        trophyDetail: `Набрать 1 000+ кубков на Crow (сейчас: ${crowTrophies.toLocaleString("ru-RU")} 🏆).`,
        trophyIconUrl: "assets/brawl/brawlers/crow_model.webp",
        earned: crowTrophies >= 1000,
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 12,
        trophyType: "silver",
        trophyName: "Мастерство Spike (1000+ 🏆)",
        trophyDetail: `Набрать 1 000+ кубков на Spike (сейчас: ${spikeTrophies.toLocaleString("ru-RU")} 🏆).`,
        trophyIconUrl: "assets/brawl/brawlers/spike_model.webp",
        earned: spikeTrophies >= 1000,
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 13,
        trophyType: "silver",
        trophyName: "Мастерство Cordelius (1000+ 🏆)",
        trophyDetail: `Набрать 1 000+ кубков на Cordelius (сейчас: ${cordeliusTrophies.toLocaleString("ru-RU")} 🏆).`,
        trophyIconUrl: "assets/brawl/avatars/player_avatar.webp",
        earned: cordeliusTrophies >= 1000,
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 14,
        trophyType: "silver",
        trophyName: "Мастерство Kaze (1000+ 🏆)",
        trophyDetail: `Набрать 1 000+ кубков на Kaze (сейчас: ${kazeTrophies.toLocaleString("ru-RU")} 🏆).`,
        trophyIconUrl: "assets/brawl/avatars/player_avatar.webp",
        earned: kazeTrophies >= 1000,
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 15,
        trophyType: "silver",
        trophyName: "Максимальная сила 11 (25+ бойцов)",
        trophyDetail: `Прокачать 25+ бойцов до 11 уровня силы (сейчас Power 11: ${pwr11Count} бойцов).`,
        trophyIconUrl: "assets/brawl/brawlers/shelly_model.webp",
        earned: pwr11Count >= 25,
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 16,
        trophyType: "silver",
        trophyName: "Полная база Power 11 (50+ бойцов)",
        trophyDetail: `Прогресс прокачки аккаунта до фулла: ${pwr11Count} / 50 бойцов 11 уровня.`,
        trophyIconUrl: "assets/brawl/brawlers/shelly_model.webp",
        earned: pwr11Count >= 50,
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 17,
        trophyType: "silver",
        trophyName: "Арсенал Гиперзарядов (25+)",
        trophyDetail: `Открыть 25+ гиперзарядов по всему ростеру (активно сейчас: ${hyperChargeCount}).`,
        trophyIconUrl: "assets/brawl/brawlers/leon_model.webp",
        earned: hyperChargeCount >= 25,
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 18,
        trophyType: "silver",
        trophyName: "Звёздные силы (100+)",
        trophyDetail: `Открыть 100+ пассивок у бойцов (открыто сейчас: ${starPowersCount}).`,
        trophyIconUrl: "assets/covers/brawl_stars.jpg",
        earned: starPowersCount >= 100,
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 19,
        trophyType: "silver",
        trophyName: "Ветеран 120+ уровня опыта",
        trophyDetail: `Уровень профиля опыта Brawl Stars: ${Number(p.expLevel || 0)}.`,
        trophyIconUrl: "assets/brawl/avatars/player_avatar.webp",
        earned: Number(p.expLevel || 0) >= 120,
        earnedDateTime: latestBattleTs
      },
      // BRONZE SKILLS (Activity & Mode Milestones)
      {
        trophyId: 20,
        trophyType: "bronze",
        trophyName: "Одиночное столкновение (600+ побед)",
        trophyDetail: `Победы в Solo Showdown: ${winsSolo.toLocaleString("ru-RU")}.`,
        trophyIconUrl: "assets/brawl/brawlers/shelly_model.webp",
        earned: winsSolo >= 600,
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 21,
        trophyType: "bronze",
        trophyName: "Парное столкновение (900+ побед)",
        trophyDetail: `Победы в Duo Showdown: ${winsDuo.toLocaleString("ru-RU")}.`,
        trophyIconUrl: "assets/brawl/brawlers/leon_model.webp",
        earned: winsDuo >= 900,
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 22,
        trophyType: "bronze",
        trophyName: "Престиж 10+ и арсенал гаджетов",
        trophyDetail: `Престиж аккаунта: ${Number(p.totalPrestigeLevel || 0)} · Гаджеты: ${gadgetsCount} · Снаряжения: ${gearsCount}.`,
        trophyIconUrl: "assets/covers/brawl_stars.jpg",
        earned: Number(p.totalPrestigeLevel || 0) >= 10 && gadgetsCount >= 100,
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 23,
        trophyType: "bronze",
        trophyName: "Коллекционер скинов и 4000+ побед",
        trophyDetail: `Суммарно побед: ${totalWins.toLocaleString("ru-RU")} · Активные скины: ${skinsCount}.`,
        trophyIconUrl: "assets/brawl/brawlers/spike_model.webp",
        earned: totalWins >= 4000,
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 24,
        trophyType: "bronze",
        trophyName: "Свежая серия в прямом эфире",
        trophyDetail: `Последних матчей в истории: ${(p.battles || []).length} (побед среди них: ${recentWins}) · Клуб: ${p.club?.name || "—"}.`,
        trophyIconUrl: "assets/covers/brawl_stars.jpg",
        earned: recentWins >= 1 && Boolean(p.club?.name),
        earnedDateTime: latestBattleTs
      },
      {
        trophyId: 25,
        trophyType: "bronze",
        trophyName: "Рубеж 5 000 суммарных побед",
        trophyDetail: `Прогресс к цели: ${totalWins.toLocaleString("ru-RU")} / 5 000 побед во всех режимах.`,
        trophyIconUrl: "assets/covers/brawl_stars.jpg",
        earned: totalWins >= 5000,
        earnedDateTime: latestBattleTs
      }
    ];

    const earnedCount = skillsList.filter((t) => t.earned).length;
    const progressPct = Math.round((earnedCount / skillsList.length) * 100);

    const gameEntry = {
      titleName: "Brawl Stars",
      npCommunicationId: "NPWR_BRAWL_STARS_2RGUQJQ0R",
      titleIconUrl: "assets/covers/brawl_stars.jpg",
      trophyTitleIconUrl: "assets/covers/brawl_stars.jpg",
      platform: "LIVE · SUPERCELL",
      progress: progressPct,
      earnedTrophies: {
        bronze: skillsList.filter((t) => t.trophyType === "bronze" && t.earned).length,
        silver: skillsList.filter((t) => t.trophyType === "silver" && t.earned).length,
        gold: skillsList.filter((t) => t.trophyType === "gold" && t.earned).length,
        platinum: skillsList.filter((t) => t.trophyType === "platinum" && t.earned).length
      },
      definedTrophies: {
        bronze: skillsList.filter((t) => t.trophyType === "bronze").length,
        silver: skillsList.filter((t) => t.trophyType === "silver").length,
        gold: skillsList.filter((t) => t.trophyType === "gold").length,
        platinum: skillsList.filter((t) => t.trophyType === "platinum").length
      },
      totalTrophiesCount: skillsList.length,
      lastUpdatedDateTime: latestBattleTs,
      trophies: skillsList
    };

    try {
      localStorage.setItem(STORAGE_KEY_TROPHIES, JSON.stringify(gameEntry));
    } catch (_) {}

    psnService.mergeExternalGame(gameEntry);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("brawl:updated", {
        detail: { player: p, gameEntry, source: this.syncSource }
      }));
    }

    return gameEntry;
  }
}

export const brawlService = new BrawlStarsService();
if (typeof window !== "undefined") {
  window.brawlService = brawlService;
}

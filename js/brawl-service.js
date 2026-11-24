/**
 * PlayStation®5 Brawl Stars Live Profile, Battle Stream & Starr Drop Simulator
 * Connects Supercell Account #2RGUQJQ0R (Cr1mnsx) with real-time trophy tracking,
 * auto-polling, interactive 3D brawler showcase, 25-match live history,
 * Starr Drop mini-game, and PS5 Trophies Bridge (45 achievements).
 */

import { SoundEngine } from "./sound.js";
import { escapeHtml } from "./friends-service.js";

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

export const STARR_DROP_RARITIES = [
  { id: "rare", name: "РЕДКИЙ", color: "#2563EB", glow: "rgba(37, 99, 235, 0.6)", upgradeChance: 0.65 },
  { id: "super_rare", name: "СВЕРХРЕДКИЙ", color: "#16A34A", glow: "rgba(22, 163, 74, 0.6)", upgradeChance: 0.45 },
  { id: "epic", name: "ЭПИЧЕСКИЙ", color: "#9333EA", glow: "rgba(147, 51, 234, 0.6)", upgradeChance: 0.30 },
  { id: "mythic", name: "МИФИЧЕСКИЙ", color: "#E11D48", glow: "rgba(225, 29, 72, 0.7)", upgradeChance: 0.18 },
  { id: "legendary", name: "ЛЕГЕНДАРНЫЙ", color: "#EAB308", glow: "rgba(234, 179, 8, 0.8)", upgradeChance: 0.0 }
];

export const STARR_DROP_REWARDS = {
  rare: [
    { title: "50 Монет", type: "currency", icon: "🪙" },
    { title: "25 Очков силы", type: "power", icon: "⚡" },
    { title: "10 Блингов", type: "bling", icon: "💎" },
    { title: "20 Кредитов", type: "credits", icon: "🎟️" }
  ],
  super_rare: [
    { title: "100 Монет", type: "currency", icon: "🪙" },
    { title: "50 Очков силы", type: "power", icon: "⚡" },
    { title: "30 Блингов", type: "bling", icon: "💎" },
    { title: "50 Кредитов", type: "credits", icon: "🎟️" },
    { title: "Редкий значок (Смайлик)", type: "pin", icon: "🎭" }
  ],
  epic: [
    { title: "200 Монет", type: "currency", icon: "🪙" },
    { title: "100 Очков силы", type: "power", icon: "⚡" },
    { title: "100 Блингов", type: "bling", icon: "💎" },
    { title: "Эпический значок бойца", type: "pin", icon: "🔥" },
    { title: "Случайный гаджет", type: "gadget", icon: "⚙️" }
  ],
  mythic: [
    { title: "500 Монет", type: "currency", icon: "🪙" },
    { title: "200 Очков силы", type: "power", icon: "⚡" },
    { title: "Случайная Звёздная сила", type: "star_power", icon: "⭐" },
    { title: "Редкий скин бойца", type: "skin", icon: "🎨" },
    { title: "200 Кредитов Starr", type: "credits", icon: "🎟️" }
  ],
  legendary: [
    { title: "1000 Монет", type: "currency", icon: "🪙" },
    { title: "Случайный Гиперзаряд (Hypercharge)", type: "hypercharge", icon: "⚡🔥" },
    { title: "Сверхредкий / Эпический Скин", type: "skin", icon: "👑" },
    { title: "500 Кредитов Starr", type: "credits", icon: "🎟️" },
    { title: "Эксклюзивная иконка профиля", type: "avatar", icon: "🌟" }
  ]
};

class BrawlStarsService {
  constructor() {
    this.tag = BRAWL_TAG;
    this.player = null;
    this.pollTimer = null;
    this.isPolling = false;
    this.lastSyncTime = null;
    this.activeTab = "roster"; // "roster" | "battles" | "starr-drop"
    this.brawlerFilter = "all"; // "all" | "1000" | "pwr11" | "rank" | "winstreak"
    this.searchQuery = "";
    this.selectedSpotlightBrawler = "LEON";

    // Starr Drop Mini-Game State
    this.starrDrop = {
      rarityIndex: 0,
      tapsRemaining: 4,
      isOpened: false,
      reward: null,
      history: []
    };

    // Pre-load cached or local baseline data immediately
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
      // Fetch initial local snapshot for 0ms initial render
      fetch("assets/brawl/initial_player_data.json")
        .then((r) => r.json())
        .then((d) => {
          if (!this.player) {
            this.player = d.result?.data?.json || d;
            this.lastSyncTime = new Date();
            this.exportTrophiesBridge();
            if (this.isViewActive()) this.renderAll();
          }
        })
        .catch(() => {});
    } else {
      this.exportTrophiesBridge();
    }
  }

  isViewActive() {
    const el = document.getElementById("ps5BrawlStarsView");
    return el && !el.hidden;
  }

  /**
   * Fetch live player profile & battles with automatic multi-tier fallback:
   * 1. Local backend proxy: /api/brawl/player
   * 2. Public CORS gateway: api.allorigins.win
   * 3. Direct tRPC GET
   * 4. Offline snapshot
   */
  async fetchLiveProfile(force = false) {
    const prevTrophies = this.player?.trophies;
    const prevBattleTime = this.player?.battles?.[0]?.timestamp;

    let freshData = null;

    // Tier 1: Local server proxy
    try {
      const res = await fetch(`/api/brawl/player?t=${Date.now()}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        freshData = json.result?.data?.json || json;
      }
    } catch (_) {}

    // Tier 2: Public CORS gateway
    if (!freshData) {
      try {
        const ninjaUrl = encodeURIComponent("https://brawltime.ninja/api/trpc/player.byTag?input=%7B%22json%22%3A%222RGUQJQ0R%22%7D");
        const res = await fetch(`https://api.allorigins.win/raw?url=${ninjaUrl}&t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          freshData = json.result?.data?.json || json;
        }
      } catch (_) {}
    }

    if (freshData && freshData.tag) {
      this.player = freshData;
      this.lastSyncTime = new Date();
      try {
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(freshData));
      } catch (_) {}

      this.exportTrophiesBridge();

      // Detect deltas & toast
      if (prevTrophies !== undefined && prevTrophies !== freshData.trophies) {
        const diff = freshData.trophies - prevTrophies;
        const sign = diff > 0 ? `+${diff}` : `${diff}`;
        this.notifyChange(
          `Brawl Stars: Изменение кубков!`,
          `Новый счёт: ${freshData.trophies.toLocaleString("ru-RU")} 🏆 (${sign})`,
          diff > 0 ? "success" : "info"
        );
      } else if (prevBattleTime && freshData.battles?.[0]?.timestamp !== prevBattleTime) {
        const latestBattle = freshData.battles[0];
        const isVictory = latestBattle.victory;
        const trophyChange = latestBattle.trophyChange;
        const deltaText = trophyChange ? ` (${trophyChange > 0 ? "+" : ""}${trophyChange} 🏆)` : "";
        this.notifyChange(
          `Brawl Stars: Завершён новый бой!`,
          `${isVictory ? "Победа!" : "Поражение"} ${latestBattle.event?.mode || "Режим"} · ${latestBattle.event?.map || "Карта"}${deltaText}`,
          isVictory ? "success" : "info"
        );
      } else if (force) {
        this.notifyChange(
          "Brawl Stars",
          `Данные синхронизированы: ${freshData.trophies.toLocaleString("ru-RU")} 🏆 · 108 бойцов`,
          "info"
        );
      }

      if (this.isViewActive()) {
        this.renderAll();
      }
      return freshData;
    }

    return this.player;
  }

  notifyChange(title, message, type = "info") {
    try {
      SoundEngine.informativeToasts();
    } catch (_) {}

    // Dispatch global toast event if available
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
    if (this.isPolling) return;
    this.isPolling = true;
    this.fetchLiveProfile();
    this.pollTimer = setInterval(() => {
      if (!document.hidden) {
        this.fetchLiveProfile();
      }
    }, 45000);
  }

  stopPolling() {
    this.isPolling = false;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  renderInlineStage() {
    this.startPolling();
    this.renderAll();
  }

  stopInlineStage() {
    // Keep background polling lightly, but UI animations pause
  }

  renderAll() {
    const view = document.getElementById("ps5BrawlStarsView");
    if (!view) return;

    view.hidden = false;
    this.renderHeaderBar();
    this.renderSpotlightHero();
    this.renderBrawlersGrid();
    this.renderBattleHistory();
    this.renderStarrDropMiniGame();
    this.renderStatsBar();
    this.initViewTabListeners();
  }

  renderHeaderBar() {
    const p = this.player;
    if (!p) return;

    const trophiesEl = document.getElementById("brawlTrophiesCount");
    if (trophiesEl) trophiesEl.textContent = (p.trophies || 42512).toLocaleString("ru-RU");

    const statusEl = document.getElementById("brawlTelemetryStatus");
    if (statusEl) {
      const brawlerCount = Object.keys(p.brawlers || {}).length || 108;
      const syncStr = this.lastSyncTime ? `Обновлено ${this.lastSyncTime.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}` : "В сети";
      statusEl.textContent = `${p.trophies?.toLocaleString("ru-RU") || "42 512"} 🏆 · ${brawlerCount} бойцов · ${syncStr}`;
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

  renderSpotlightHero() {
    const p = this.player;
    if (!p) return;

    const brawlers = p.brawlers || {};
    const brawlerList = Object.entries(brawlers).map(([id, b]) => ({ id, ...b }));
    brawlerList.sort((a, b) => (b.trophies || 0) - (a.trophies || 0));

    // Current hero selection
    let curBrawler = brawlerList.find((b) => (b.name || "").toUpperCase() === this.selectedSpotlightBrawler.toUpperCase());
    if (!curBrawler && brawlerList.length > 0) curBrawler = brawlerList[0];
    if (!curBrawler) return;

    const name = curBrawler.name || "LEON";
    const trophies = curBrawler.trophies || 2136;
    const maxTrophies = curBrawler.highestTrophies || trophies;
    const power = curBrawler.power || 11;
    const rank = curBrawler.rank || 6;
    const winStreak = curBrawler.currentWinStreak || 0;
    const maxWinStreak = curBrawler.maxWinStreak || 11;
    const skinName = curBrawler.skin?.name || "TIGER LEON II";

    // 3D image selection
    let modelImg = BRAWLER_AVATARS[name.toLowerCase()] || "assets/brawl/brawlers/leon_model.webp";

    const spotlightContainer = document.getElementById("brawlSpotlightCard");
    if (!spotlightContainer) return;

    spotlightContainer.innerHTML = `
      <div class="brawl-spotlight-inner">
        <!-- Left: 3D Character Stage -->
        <div class="brawl-spotlight-visual">
          <div class="brawl-spotlight-aura"></div>
          <img src="${modelImg}" alt="${escapeHtml(name)}" class="brawl-spotlight-hero-img" id="brawlSpotlightHeroImg" />
          <div class="brawl-spotlight-pedestal"></div>
        </div>

        <!-- Right: Character Telemetry & Gear Spec -->
        <div class="brawl-spotlight-details">
          <div class="brawl-spotlight-top-badge">
            <span class="brawl-pill-legendary">ЛЕГЕНДАРНЫЙ БОЕЦ</span>
            <span class="brawl-pill-rank">ПРЕСТИЖ РАНГ ${rank}</span>
            <span class="brawl-pill-skin">${escapeHtml(skinName)}</span>
          </div>

          <h2 class="brawl-spotlight-title">${escapeHtml(name)}</h2>

          <div class="brawl-spotlight-cups-row">
            <div class="brawl-big-trophy-display">
              <span class="brawl-btd-icon">🏆</span>
              <span class="brawl-btd-val">${trophies.toLocaleString("ru-RU")}</span>
              <span class="brawl-btd-max">РЕКОРД: ${maxTrophies.toLocaleString("ru-RU")}</span>
            </div>
            <div class="brawl-pwr-badge">
              <span class="brawl-pwr-label">POWER</span>
              <span class="brawl-pwr-val">${power}</span>
            </div>
            <div class="brawl-streak-badge">
              <span class="brawl-streak-icon">🔥</span>
              <span class="brawl-streak-val">${winStreak} ВИНСТРИК</span>
              <span class="brawl-streak-max">(МАКС: ${maxWinStreak})</span>
            </div>
          </div>

          <!-- Hero Gear & Abilities Specs -->
          <div class="brawl-hero-loadout">
            <div class="brawl-loadout-item" title="Гаджет активирован">
              <span class="brawl-loadout-icon">⚙️</span>
              <div class="brawl-loadout-text">
                <span class="brawl-lt-title">ГАДЖЕТ</span>
                <span class="brawl-lt-sub">${curBrawler.gadgets?.[0]?.name || "Клонирование"}</span>
              </div>
            </div>
            <div class="brawl-loadout-item" title="Звёздная сила">
              <span class="brawl-loadout-icon">⭐</span>
              <div class="brawl-loadout-text">
                <span class="brawl-lt-title">ЗВЁЗДНАЯ СИЛА</span>
                <span class="brawl-lt-sub">${curBrawler.starPowers?.[0]?.name || "Скрытный след"}</span>
              </div>
            </div>
            <div class="brawl-loadout-item is-hypercharge" title="Гиперзаряд готов">
              <span class="brawl-loadout-icon">⚡</span>
              <div class="brawl-loadout-text">
                <span class="brawl-lt-title">ГИПЕРЗАРЯД</span>
                <span class="brawl-lt-sub">Limbo (Power 11)</span>
              </div>
            </div>
            <div class="brawl-loadout-item" title="Снаряжение">
              <span class="brawl-loadout-icon">🛡️</span>
              <div class="brawl-loadout-text">
                <span class="brawl-lt-title">СНАРЯЖЕНИЕ</span>
                <span class="brawl-lt-sub">Урон + Скорость</span>
              </div>
            </div>
          </div>

          <!-- Quick Switcher for Top Brawlers -->
          <div class="brawl-top-switch-row">
            <span class="brawl-ts-label">Топ бойцы аккаунта:</span>
            <div class="brawl-ts-buttons">
              ${brawlerList.slice(0, 6).map((b) => `
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

    // Add listeners to hero switch buttons
    spotlightContainer.querySelectorAll(".brawl-ts-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        try { SoundEngine.enter(); } catch (_) {}
        this.selectedSpotlightBrawler = btn.dataset.brawler;
        this.renderSpotlightHero();
      });
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

    if (list.length === 0) {
      container.innerHTML = `
        <div class="brawl-empty-state">
          <span>По запросу «${escapeHtml(this.searchQuery)}» бойцы не найдены</span>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map((b) => {
      const name = b.name || "BRAWLER";
      const trophies = (b.trophies || 0).toLocaleString("ru-RU");
      const power = b.power || 1;
      const rank = b.rank || 1;
      const winStreak = b.currentWinStreak || 0;
      const skinName = b.skin?.name || "";
      const avatarSlug = name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const iconUrl = `https://brawltime.ninja/media/brawlers/${avatarSlug}/avatar.webp`;

      return `
        <article class="brawler-grid-card ${b.trophies >= 1000 ? "is-legend" : ""}" data-brawler="${escapeHtml(name)}" tabindex="0" role="button">
          <div class="brawler-card-thumb-wrap">
            <img src="${iconUrl}" alt="${escapeHtml(name)}" class="brawler-card-avatar" onerror="this.onerror=null;this.src='assets/brawl/avatars/player_avatar.webp';" loading="lazy" />
            <span class="brawler-card-pwr ${power === 11 ? "is-max" : ""}">PWR ${power}</span>
            <span class="brawler-card-rank">R${rank}</span>
            ${winStreak > 0 ? `<span class="brawler-card-streak">🔥 ${winStreak}</span>` : ""}
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

    // Clicking a brawler updates the spotlight
    container.querySelectorAll(".brawler-grid-card").forEach((card) => {
      card.addEventListener("click", () => {
        try { SoundEngine.enter(); } catch (_) {}
        this.selectedSpotlightBrawler = card.dataset.brawler;
        this.renderSpotlightHero();
        // Smooth scroll to top of spotlight
        const spot = document.getElementById("brawlSpotlightCard");
        if (spot) spot.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.click();
        }
      });
    });
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

    container.innerHTML = battles.map((b, i) => {
      const mode = b.event?.mode || "3v3";
      const map = b.event?.map || "Арена Starr";
      const isVictory = b.victory === true || (b.result && b.result.toLowerCase().includes("victory")) || (b.result && b.result.includes("Rank 1"));
      const isDefeat = b.victory === false || (b.result && b.result.toLowerCase().includes("defeat"));
      const resultText = isVictory ? "ПОБЕДА" : (isDefeat ? "ПОРАЖЕНИЕ" : (b.result || "МАТЧ"));
      const trophyDelta = b.trophyChange;
      const trophyStr = trophyDelta !== null && trophyDelta !== undefined
        ? (trophyDelta > 0 ? `+${trophyDelta}` : `${trophyDelta}`)
        : "";

      // Time ago
      const timeAgo = this.formatTimeAgo(b.timestamp);

      // Find user in teams
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
      const brawlerAvatar = `https://brawltime.ninja/media/brawlers/${userBrawler.toLowerCase()}/avatar.webp`;

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
            <img src="${brawlerAvatar}" alt="${escapeHtml(userBrawler)}" class="bbc-brawler-thumb" onerror="this.onerror=null;this.src='assets/brawl/avatars/player_avatar.webp';" />
            <div class="bbc-brawler-info">
              <strong class="bbc-bi-name">${escapeHtml(userBrawler.toUpperCase())}</strong>
              <span class="bbc-bi-pwr">PWR ${userPwr}</span>
            </div>
          </div>

          <!-- Teams Roster Preview -->
          <div class="bbc-teams-preview">
            ${(b.teams || []).map((team, tIdx) => `
              <div class="bbc-team-group ${tIdx === 0 ? "team-blue" : "team-red"}">
                ${team.map((m) => `
                  <span class="bbc-team-member ${m.tag === this.tag ? "is-self" : ""}" title="${escapeHtml(m.name)} (${escapeHtml(m.brawler)})">
                    <img src="https://brawltime.ninja/media/brawlers/${(m.brawler || "shelly").toLowerCase()}/avatar.webp" onerror="this.onerror=null;this.src='assets/brawl/avatars/player_avatar.webp';" alt="${escapeHtml(m.brawler)}" />
                  </span>
                `).join("")}
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
   * STARR DROP MINI-GAME
   * ============================================================ */
  renderStarrDropMiniGame() {
    const arena = document.getElementById("brawlStarrDropArena");
    if (!arena) return;

    const currentRarity = STARR_DROP_RARITIES[this.starrDrop.rarityIndex] || STARR_DROP_RARITIES[0];

    arena.innerHTML = `
      <div class="starr-drop-box" id="starrDropBox" data-rarity="${currentRarity.id}" style="--sd-glow: ${currentRarity.glow}">
        <!-- Floating Animated Particle Rings -->
        <div class="sd-ambient-pulse" aria-hidden="true"></div>

        <!-- 3D Starr Drop Icon -->
        <div class="sd-emblem-wrap" id="sdEmblemWrap" role="button" tabindex="0" title="Нажмите, чтобы улучшить или открыть Starr Drop!">
          <div class="sd-emblem" style="background: ${currentRarity.color}">
            <svg viewBox="0 0 44 44" width="72" height="72" fill="#FFFFFF" aria-hidden="true">
              <path d="M22 6l4.2 9.2 9.8 1.4-7.1 6.9 1.7 9.8-8.6-4.5-8.6 4.5 1.7-9.8-7.1-6.9 9.8-1.4z"/>
              <circle cx="17.5" cy="20.5" r="2.5" fill="#181428"/>
              <circle cx="26.5" cy="20.5" r="2.5" fill="#181428"/>
              <path d="M18 26h8v2h-8z" fill="#181428"/>
            </svg>
          </div>
          <div class="sd-taps-cue" id="sdTapsCue">
            ${this.starrDrop.isOpened ? "ОТКРЫТО" : `ТАПОВ ОСТАЛОСЬ: ${this.starrDrop.tapsRemaining}`}
          </div>
        </div>

        <!-- Current Rarity Header -->
        <div class="sd-status-panel">
          <span class="sd-rarity-pill" style="background: ${currentRarity.color}">${currentRarity.name}</span>
          <h3 class="sd-title">${this.starrDrop.isOpened ? "Награда получена!" : "Нажимайте для повышения редкости!"}</h3>
          <p class="sd-desc">
            ${this.starrDrop.isOpened
              ? "Поздравляем! Награда добавлена в коллекцию аккаунта."
              : "Каждое нажатие имеет шанс улучшить Starr Drop до Легендарного уровня!"}
          </p>
        </div>

        <!-- Rewards reveal modal or opened state -->
        ${this.starrDrop.isOpened && this.starrDrop.reward ? `
          <div class="sd-reward-card is-opened">
            <span class="sd-reward-icon">${this.starrDrop.reward.icon}</span>
            <div class="sd-reward-meta">
              <span class="sd-reward-tier">${currentRarity.name} НАГРАДА</span>
              <strong class="sd-reward-title">${escapeHtml(this.starrDrop.reward.title)}</strong>
            </div>
            <button type="button" class="sd-reset-btn" id="btnStarrDropReset">
              <span>Открыть ещё один Starr Drop</span>
            </button>
          </div>
        ` : `
          <div class="sd-actions-row">
            <button type="button" class="sd-tap-btn" id="btnStarrDropTap">
              <span>Нажать на Starr Drop (${this.starrDrop.tapsRemaining})</span>
            </button>
          </div>
        `}

        <!-- Rarity Ladder Gauge -->
        <div class="sd-rarity-ladder">
          ${STARR_DROP_RARITIES.map((r, i) => `
            <div class="sd-ladder-step ${i === this.starrDrop.rarityIndex ? "is-current" : (i < this.starrDrop.rarityIndex ? "is-past" : "")}">
              <span class="sd-ls-dot" style="background: ${r.color}"></span>
              <span class="sd-ls-name">${r.name}</span>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    // Hook listeners
    const emblem = document.getElementById("sdEmblemWrap");
    const tapBtn = document.getElementById("btnStarrDropTap");
    const resetBtn = document.getElementById("btnStarrDropReset");

    if (emblem && !this.starrDrop.isOpened) {
      emblem.addEventListener("click", () => this.handleStarrDropTap());
      emblem.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          this.handleStarrDropTap();
        }
      });
    }

    if (tapBtn) {
      tapBtn.addEventListener("click", () => this.handleStarrDropTap());
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        try { SoundEngine.enter(); } catch (_) {}
        this.resetStarrDrop();
      });
    }
  }

  handleStarrDropTap() {
    if (this.starrDrop.isOpened) return;

    const emblem = document.getElementById("sdEmblemWrap");
    if (emblem) {
      emblem.classList.remove("sd-wobble");
      void emblem.offsetWidth; // Force reflow
      emblem.classList.add("sd-wobble");
    }

    this.starrDrop.tapsRemaining--;

    // Check upgrade chance
    const curRarity = STARR_DROP_RARITIES[this.starrDrop.rarityIndex];
    const canUpgrade = this.starrDrop.rarityIndex < STARR_DROP_RARITIES.length - 1;

    let upgraded = false;
    if (canUpgrade && Math.random() < curRarity.upgradeChance) {
      this.starrDrop.rarityIndex++;
      upgraded = true;
      try { SoundEngine.switchOn(); } catch (_) {}
      this.triggerFlashEffect();
    } else {
      try { SoundEngine.enter(); } catch (_) {}
    }

    // Check if finished
    if (this.starrDrop.tapsRemaining <= 0 || this.starrDrop.rarityIndex === STARR_DROP_RARITIES.length - 1) {
      this.openStarrDrop();
    } else {
      this.renderStarrDropMiniGame();
    }
  }

  openStarrDrop() {
    this.starrDrop.isOpened = true;
    const finalRarity = STARR_DROP_RARITIES[this.starrDrop.rarityIndex];
    const pool = STARR_DROP_REWARDS[finalRarity.id] || STARR_DROP_REWARDS.rare;
    const chosenReward = pool[Math.floor(Math.random() * pool.length)];
    this.starrDrop.reward = chosenReward;

    try {
      SoundEngine.informativeToasts();
    } catch (_) {}

    this.triggerConfettiBurst();
    this.renderStarrDropMiniGame();
  }

  resetStarrDrop() {
    this.starrDrop = {
      rarityIndex: 0,
      tapsRemaining: 4,
      isOpened: false,
      reward: null,
      history: this.starrDrop.history
    };
    this.renderStarrDropMiniGame();
  }

  triggerFlashEffect() {
    const flash = document.createElement("div");
    flash.className = "sd-screen-flash";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 400);
  }

  triggerConfettiBurst() {
    const container = document.getElementById("starrDropBox");
    if (!container) return;

    for (let i = 0; i < 28; i++) {
      const p = document.createElement("div");
      p.className = "sd-confetti-particle";
      const colors = ["#FFDD00", "#FF164A", "#2563EB", "#16A34A", "#9333EA", "#FFFFFF"];
      p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      p.style.setProperty("--tx", `${(Math.random() - 0.5) * 360}px`);
      p.style.setProperty("--ty", `${(Math.random() - 0.5) * 320 - 80}px`);
      p.style.setProperty("--rot", `${Math.random() * 720}deg`);
      container.appendChild(p);
      setTimeout(() => p.remove(), 1200);
    }
  }

  /* ============================================================
   * VIEW TABS AND FILTER CONTROLS
   * ============================================================ */
  initViewTabListeners() {
    // Mode Switcher: Roster vs Battles vs Starr Drop
    const btnRoster = document.getElementById("btnBrawlTabRoster");
    const btnBattles = document.getElementById("btnBrawlTabBattles");
    const btnStarrDrop = document.getElementById("btnBrawlTabStarrDrop");

    const stageRoster = document.getElementById("brawlStageRoster");
    const stageBattles = document.getElementById("brawlStageBattles");
    const stageStarrDrop = document.getElementById("brawlStageStarrDrop");

    const setTab = (tab) => {
      this.activeTab = tab;
      try { SoundEngine.enter(); } catch (_) {}

      if (btnRoster) btnRoster.classList.toggle("is-active", tab === "roster");
      if (btnBattles) btnBattles.classList.toggle("is-active", tab === "battles");
      if (btnStarrDrop) btnStarrDrop.classList.toggle("is-active", tab === "starr-drop");

      if (stageRoster) stageRoster.hidden = tab !== "roster";
      if (stageBattles) stageBattles.hidden = tab !== "battles";
      if (stageStarrDrop) stageStarrDrop.hidden = tab !== "starr-drop";
    };

    if (btnRoster) btnRoster.onclick = () => setTab("roster");
    if (btnBattles) btnBattles.onclick = () => setTab("battles");
    if (btnStarrDrop) btnStarrDrop.onclick = () => setTab("starr-drop");

    // Filter Pills
    document.querySelectorAll(".brawl-filter-pill").forEach((pill) => {
      pill.onclick = () => {
        try { SoundEngine.enter(); } catch (_) {}
        document.querySelectorAll(".brawl-filter-pill").forEach((p) => p.classList.remove("is-active"));
        pill.classList.add("is-active");
        this.brawlerFilter = pill.dataset.filter || "all";
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

    // Header buttons
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

    const btnNinja = document.getElementById("btnBrawlNinjaExternal");
    if (btnNinja) {
      btnNinja.onclick = () => {
        window.open(`https://brawltime.ninja/profile/${this.tag}`, "_blank", "noopener");
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
    if (tagCopyBtn) {
      tagCopyBtn.onclick = () => {
        navigator.clipboard?.writeText(this.tag);
        try { SoundEngine.enter(); } catch (_) {}
        this.notifyChange("Тег скопирован", `#${this.tag} скопирован в буфер обмена`, "info");
      };
    }
  }

  /* ============================================================
   * PS5 TROPHIES BRIDGE (45 ACHIEVEMENTS)
   * ============================================================ */
  exportTrophiesBridge() {
    const p = this.player;
    if (!p) return;

    const brawlers = p.brawlers || {};
    const brawlerList = Object.values(brawlers);
    const brawlerCount = brawlerList.length;
    const trophies = p.trophies || 42512;
    const wins3v3 = p["3vs3Victories"] || 2840;
    const winsSolo = p.soloVictories || 633;
    const winsDuo = p.duoVictories || 918;
    const leonTrophies = brawlerList.find((b) => (b.name || "").toUpperCase() === "LEON")?.trophies || 2136;
    const pwr11Count = brawlerList.filter((b) => b.power === 11).length;
    const maxWinStreak = Math.max(...brawlerList.map((b) => b.maxWinStreak || 0), 22);

    const trophiesList = [
      // PLATINUM (1)
      {
        trophyId: 1,
        trophyType: "platinum",
        trophyName: "Легенда Starr Park",
        trophyDetail: "Собрать все боевые трофеи и достижения Brawl Stars на аккаунте #2RGUQJQ0R.",
        trophyIconUrl: "assets/brawl/avatars/player_avatar.webp",
        earned: trophies >= 40000 && brawlerCount >= 100,
        earnedDateTime: "2026-11-20T18:00:00.000Z"
      },
      // GOLD (8)
      {
        trophyId: 2,
        trophyType: "gold",
        trophyName: "Повелитель Арены 40K+",
        trophyDetail: `Преодолеть планку в 40,000 кубков (Текущий счёт: ${trophies.toLocaleString("ru-RU")} 🏆).`,
        trophyIconUrl: "assets/brawl/brawlers/leon_model.webp",
        earned: trophies >= 40000,
        earnedDateTime: "2026-11-15T12:00:00.000Z"
      },
      {
        trophyId: 3,
        trophyType: "gold",
        trophyName: "Невидимка-Снайпер (Леон 2000+)",
        trophyDetail: `Набрать 2,000+ кубков на легендарном бойце Леон (Счёт: ${leonTrophies.toLocaleString("ru-RU")} 🏆).`,
        trophyIconUrl: "assets/brawl/brawlers/leon_model.webp",
        earned: leonTrophies >= 2000,
        earnedDateTime: "2026-11-10T14:30:00.000Z"
      },
      {
        trophyId: 4,
        trophyType: "gold",
        trophyName: "Властелин Галактики (Martian Fame II)",
        trophyDetail: "Достичь космической славы Martian Fame II (20,865 очков славы).",
        trophyIconUrl: "assets/brawl/avatars/player_avatar.webp",
        earned: (p.fame || 0) >= 20000,
        earnedDateTime: "2026-11-05T16:20:00.000Z"
      },
      {
        trophyId: 5,
        trophyType: "gold",
        trophyName: "Абсолютная Армия (100+ Бойцов)",
        trophyDetail: `Разблокировать 100+ бойцов в ростере Starr Park (Текущий ростер: ${brawlerCount} бойцов).`,
        trophyIconUrl: "assets/brawl/brawlers/crow_model.webp",
        earned: brawlerCount >= 100,
        earnedDateTime: "2026-10-30T10:00:00.000Z"
      },
      {
        trophyId: 6,
        trophyType: "gold",
        trophyName: "Командный Триумфатор (2500+ Побед 3v3)",
        trophyDetail: `Одержать 2,500+ триумфальных побед в командных режимах 3v3 (Счёт: ${wins3v3.toLocaleString("ru-RU")}).`,
        trophyIconUrl: "assets/brawl/brawlers/spike_model.webp",
        earned: wins3v3 >= 2500,
        earnedDateTime: "2026-10-25T19:40:00.000Z"
      },
      {
        trophyId: 7,
        trophyType: "gold",
        trophyName: "Неудержимый Винстрик 20+",
        trophyDetail: `Одержать серию из 20 побед подряд без единого поражения (Рекорд: ${maxWinStreak} побед).`,
        trophyIconUrl: "assets/brawl/brawlers/shelly_model.webp",
        earned: maxWinStreak >= 20,
        earnedDateTime: "2026-10-18T21:15:00.000Z"
      },
      {
        trophyId: 8,
        trophyType: "gold",
        trophyName: "Алмазная Элита (Ranked Diamond)",
        trophyDetail: `Достичь ранга Diamond в рейтинговом сезоне Brawl Stars (Ранг: ${p.rankedRankName || "Diamond I"}).`,
        trophyIconUrl: "assets/brawl/avatars/player_avatar.webp",
        earned: (p.rankedElo || 0) >= 3000,
        earnedDateTime: "2026-10-12T17:00:00.000Z"
      },
      {
        trophyId: 9,
        trophyType: "gold",
        trophyName: "Клубный Альянс (0.3.7|teams)",
        trophyDetail: "Состоять в престижном клубе 0.3.7|teams (#80RYCLU9Q).",
        trophyIconUrl: "assets/brawl/avatars/player_avatar.webp",
        earned: !!p.club?.name,
        earnedDateTime: "2026-10-01T12:00:00.000Z"
      },
      // SILVER (14)
      {
        trophyId: 10,
        trophyType: "silver",
        trophyName: "Ядовитый Ворон (Crow 1000+)",
        trophyDetail: "Преодолеть рубеж в 1,000 кубков на бойце Crow.",
        trophyIconUrl: "assets/brawl/brawlers/crow_model.webp",
        earned: true,
        earnedDateTime: "2026-09-20T14:00:00.000Z"
      },
      {
        trophyId: 11,
        trophyType: "silver",
        trophyName: "Колючий Кактус (Spike 1000+)",
        trophyDetail: "Преодолеть рубеж в 1,000 кубков на бойце Spike.",
        trophyIconUrl: "assets/brawl/brawlers/spike_model.webp",
        earned: true,
        earnedDateTime: "2026-09-15T16:00:00.000Z"
      },
      {
        trophyId: 12,
        trophyType: "silver",
        trophyName: "Царство Грибов (Cordelius 1000+)",
        trophyDetail: "Преодолеть рубеж в 1,000 кубков на бойце Cordelius.",
        trophyIconUrl: "assets/brawl/avatars/player_avatar.webp",
        earned: true,
        earnedDateTime: "2026-09-10T11:00:00.000Z"
      },
      {
        trophyId: 13,
        trophyType: "silver",
        trophyName: "Штормовой Порыв (Kaze 1000+)",
        trophyDetail: "Преодолеть рубеж в 1,000 кубков на бойце Kaze.",
        trophyIconUrl: "assets/brawl/avatars/player_avatar.webp",
        earned: true,
        earnedDateTime: "2026-09-05T18:00:00.000Z"
      },
      {
        trophyId: 14,
        trophyType: "silver",
        trophyName: "Одинокий Охотник (600+ Solo)",
        trophyDetail: `Одержать 600+ побед в одиночном столкновении (Счёт: ${winsSolo}).`,
        trophyIconUrl: "assets/brawl/brawlers/shelly_model.webp",
        earned: winsSolo >= 600,
        earnedDateTime: "2026-08-25T13:00:00.000Z"
      },
      {
        trophyId: 15,
        trophyType: "silver",
        trophyName: "Смертоносный Дуэт (900+ Duo)",
        trophyDetail: `Одержать 900+ побед в парном столкновении (Счёт: ${winsDuo}).`,
        trophyIconUrl: "assets/brawl/brawlers/leon_model.webp",
        earned: winsDuo >= 900,
        earnedDateTime: "2026-08-20T15:00:00.000Z"
      },
      {
        trophyId: 16,
        trophyType: "silver",
        trophyName: "Кузница Силы (40+ Power 11)",
        trophyDetail: `Прокачать 40+ бойцов до максимального 11 уровня (Прокачано: ${pwr11Count} бойцов).`,
        trophyIconUrl: "assets/brawl/avatars/player_avatar.webp",
        earned: pwr11Count >= 40,
        earnedDateTime: "2026-08-15T17:00:00.000Z"
      },
      {
        trophyId: 17,
        trophyType: "silver",
        trophyName: "Золотой Престиж (Уровень 10+)",
        trophyDetail: "Набрать 10+ уровней суммарного престижа аккаунта.",
        trophyIconUrl: "assets/brawl/avatars/player_avatar.webp",
        earned: (p.totalPrestigeLevel || 0) >= 10,
        earnedDateTime: "2026-08-10T19:00:00.000Z"
      },
      {
        trophyId: 18,
        trophyType: "silver",
        trophyName: "Ветеран 100 Уровня Опыта",
        trophyDetail: `Достичь 100+ уровня аккаунта (Текущий уровень: ${p.expLevel || 123}).`,
        trophyIconUrl: "assets/brawl/avatars/player_avatar.webp",
        earned: (p.expLevel || 0) >= 100,
        earnedDateTime: "2026-08-01T20:00:00.000Z"
      },
      {
        trophyId: 19,
        trophyType: "silver",
        trophyName: "Гиперзарядная Буря",
        trophyDetail: "Активировать гиперзаряд на 10 бойцах ростера.",
        trophyIconUrl: "assets/brawl/brawlers/leon_model.webp",
        earned: true,
        earnedDateTime: "2026-07-20T12:00:00.000Z"
      },
      {
        trophyId: 20,
        trophyType: "silver",
        trophyName: "Арсенал Снаряжений",
        trophyDetail: "Экипировать 50+ мифических и эпических снаряжений.",
        trophyIconUrl: "assets/brawl/avatars/player_avatar.webp",
        earned: true,
        earnedDateTime: "2026-07-15T14:00:00.000Z"
      },
      {
        trophyId: 21,
        trophyType: "silver",
        trophyName: "Коллекционер Скинов",
        trophyDetail: "Собрать эксклюзивные скины: Toon Spike, Tiger Leon II, Dragon Crow VI.",
        trophyIconUrl: "assets/brawl/brawlers/spike_model.webp",
        earned: true,
        earnedDateTime: "2026-07-10T16:00:00.000Z"
      },
      {
        trophyId: 22,
        trophyType: "silver",
        trophyName: "4,000 Побед на Арене",
        trophyDetail: `Суммарно победить в более чем 4,000 матчах (Суммарно: ${(wins3v3 + winsSolo + winsDuo).toLocaleString("ru-RU")}).`,
        trophyIconUrl: "assets/brawl/avatars/player_avatar.webp",
        earned: (wins3v3 + winsSolo + winsDuo) >= 4000,
        earnedDateTime: "2026-07-01T18:00:00.000Z"
      },
      {
        trophyId: 23,
        trophyType: "silver",
        trophyName: "Мастер Выживания Showdown",
        trophyDetail: "Занять топ-1 ранг в столкновении 50 раз подряд.",
        trophyIconUrl: "assets/brawl/brawlers/shelly_model.webp",
        earned: true,
        earnedDateTime: "2026-06-20T11:00:00.000Z"
      },
      // BRONZE (22)
      ...Array.from({ length: 22 }).map((_, idx) => ({
        trophyId: 24 + idx,
        trophyType: "bronze",
        trophyName: [
          "Первые шаги на Арене", "Футбольный Триумф в Броулбол", "Снайпер в Нокауте",
          "Хранитель Кристаллов", "Взломщик Сейфа", "Король Горячей Зоны",
          "Охотник за Головами", "Дуэлянт 1 на 1", "Роборубка: Эксперт",
          "Охота на Босса", "Звездный Игрок Матча", "Первый Гаджет в Бою",
          "Звездная Сила Разблокирована", "Первый Starr Drop", "Коллекция Значков",
          "Кредиты Starr Park", "Очки Силы Накоплены", "Сверкающие Блинги",
          "Дружеский Батл", "Картограф Starr", "Винстрик 5 побед", "Мастер Ростера"
        ][idx] || `Боевой приз #${idx + 1}`,
        trophyDetail: `Достижение игрока Cr1mnsx в боевой системе Brawl Stars (#2RGUQJQ0R).`,
        trophyIconUrl: "assets/brawl/avatars/player_avatar.webp",
        earned: true,
        earnedDateTime: "2026-05-15T10:00:00.000Z"
      }))
    ];

    const earnedCount = trophiesList.filter((t) => t.earned).length;
    const progressPct = Math.round((earnedCount / trophiesList.length) * 100);

    const gameEntry = {
      titleName: "Brawl Stars",
      npCommunicationId: "NPWR_BRAWL_STARS_2RGUQJQ0R",
      trophyTitleIconUrl: "assets/brawl/avatars/player_avatar.webp",
      progress: progressPct,
      earnedTrophies: {
        bronze: trophiesList.filter((t) => t.trophyType === "bronze" && t.earned).length,
        silver: trophiesList.filter((t) => t.trophyType === "silver" && t.earned).length,
        gold: trophiesList.filter((t) => t.trophyType === "gold" && t.earned).length,
        platinum: trophiesList.filter((t) => t.trophyType === "platinum" && t.earned).length
      },
      definedTrophies: {
        bronze: 22,
        silver: 14,
        gold: 8,
        platinum: 1
      },
      totalTrophiesCount: trophiesList.length,
      lastUpdatedDateTime: new Date().toISOString(),
      trophies: trophiesList
    };

    // Store in localStorage for persistent bridge
    try {
      localStorage.setItem(STORAGE_KEY_TROPHIES, JSON.stringify(gameEntry));
    } catch (_) {}

    // Hook into global psnService if available
    if (window.psnService && Array.isArray(window.psnService.games)) {
      const existingIdx = window.psnService.games.findIndex(
        (g) => g.npCommunicationId === gameEntry.npCommunicationId || g.titleName === "Brawl Stars"
      );
      if (existingIdx >= 0) {
        window.psnService.games[existingIdx] = gameEntry;
      } else {
        window.psnService.games.unshift(gameEntry);
      }
    }

    return gameEntry;
  }
}

export const brawlService = new BrawlStarsService();
if (typeof window !== "undefined") {
  window.brawlService = brawlService;
}

/**
 * PlayStation®5 System Software Shell — Master Application Controller
 * 1:1 PS5 OS Architecture:
 * - Top System Bar (Games | Media, Search, Settings, Language RU/EN, Profile, Clock)
 * - Top-Aligned Game Ribbon (70px -> 118px active expansion + adjacent bottom label)
 * - Welcome Hub Bento Grid (Friends, Store, Accessibility, 3D SVG Trophies, Battery Rings, SSD Storage)
 * - Explore View & Game Home Hero -> Level 1 Game Hub (16:9 Activity Cards, News, Trophies)
 * - Control Center (PS Button / Space), Search (/), Settings, Live PSN & Brawl Telemetry
 */

import {
  uiStrings,
  welcomeHubFriends,
  ribbonCatalog,
  settingsSections,
  controlCenterItems,
  searchCatalog,
  defaultProfileTelemetry
} from "./data.js";
import { SoundEngine } from "./sound.js";
import { PS5Icons } from "./icons.js";
import { PS5ParticleEngine } from "./particles.js";

// ============================================================
// State
// ============================================================
const state = {
  lang: "ru", // "ru" | "en"
  category: "games", // "games" | "media"
  activeId: "welcome",
  isHubOpen: false,
  isControlCenterOpen: false,
  particlesEnabled: true,
  settingsSection: "accounts",
  bgFlip: false,
  isMicMuted: false,
  widgetPreset: "default"
};

const $ = (sel) => document.querySelector(sel);
let particleEngine = null;

// ============================================================
// Helpers
// ============================================================
function t(objOrVal) {
  if (objOrVal && typeof objOrVal === "object" && ("ru" in objOrVal || "en" in objOrVal)) {
    return objOrVal[state.lang] ?? objOrVal.ru ?? objOrVal.en;
  }
  return objOrVal ?? "";
}

function S(key) {
  return uiStrings[state.lang]?.[key] ?? uiStrings.ru[key] ?? key;
}

function getCurrentList() {
  return ribbonCatalog[state.category] || ribbonCatalog.games;
}

function getActiveItem() {
  const list = getCurrentList();
  return list.find((it) => it.id === state.activeId) || list[0];
}

// ============================================================
// Static SVG Icon Hydration (Zero Emojis)
// ============================================================
function hydrateStaticIcons() {
  if ($("#iconPSBtn")) $("#iconPSBtn").innerHTML = PS5Icons.psLogo;
  if ($("#iconEditWidgetsGlyph")) $("#iconEditWidgetsGlyph").innerHTML = PS5Icons.gamepadSquare;
  $("#iconSearchBtn").innerHTML = PS5Icons.search;
  $("#iconSettingsBtn").innerHTML = PS5Icons.settings;
  $("#iconProfileAvatar").innerHTML = PS5Icons.profileSmiley;
  $("#iconChevronLeft").innerHTML = PS5Icons.chevronLeft;
  if ($("#iconChevronRight")) $("#iconChevronRight").innerHTML = PS5Icons.chevronRight;

  $("#iconFriendsHeader").innerHTML = PS5Icons.gamebase;
  $("#iconStoreMini").innerHTML = PS5Icons.psStoreBag;
  $("#iconAccHeader").innerHTML = PS5Icons.accessibility;
  $("#iconAccEmblem").innerHTML = PS5Icons.accessibilityEmblem;
  $("#iconTrophyHeader").innerHTML = PS5Icons.trophy;

  $("#cupPlat").innerHTML = PS5Icons.trophyCup3D("platinum");
  $("#cupGold").innerHTML = PS5Icons.trophyCup3D("gold");
  $("#cupSilver").innerHTML = PS5Icons.trophyCup3D("silver");
  $("#cupBronze").innerHTML = PS5Icons.trophyCup3D("bronze");
  $("#iconLevelCrest").innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#7c2d12" stroke="#f97316" stroke-width="1.6"/><path d="M8 7.5h8v3.2c0 2.2-1.8 4-4 4s-4-1.8-4-4V7.5zm2.5 8h3v2h-3v-2z" fill="#fdba74"/></svg>`;

  $("#iconOptionsDots").innerHTML = PS5Icons.dots;
  $("#iconHeroTrophy").innerHTML = PS5Icons.trophy;
  $("#iconScrollDown").innerHTML = PS5Icons.chevronDown;
  $("#iconCcMusic").innerHTML = PS5Icons.music;
  $("#iconSearchModal").innerHTML = PS5Icons.search;

  $("#ctxIconInfo").innerHTML = PS5Icons.info;
  $("#ctxIconShare").innerHTML = PS5Icons.share;
  $("#ctxIconStar").innerHTML = PS5Icons.star;

  // Store & Wishlist card visual backgrounds
  $("#welcomeStoreCardBg").style.backgroundImage = `url('${PS5Icons.makeSceneArt("store")}')`;
  $("#welcomeWishlistBg").style.backgroundImage = `url('${PS5Icons.makeSceneArt("wishlist")}')`;
  if ($("#welcomeMediaCardBg")) {
    $("#welcomeMediaCardBg").style.backgroundImage = `url('${PS5Icons.makeSceneArt("media-slot")}')`;
  }
  if ($("#welcomePsPlusCardBg")) {
    $("#welcomePsPlusCardBg").style.backgroundImage = `url('${PS5Icons.makeSceneArt("psplus")}')`;
  }

  renderWelcomeFriends();
  renderWelcomeBatteryRings();
  renderControllerHints();
  updateMuteButtonUI();
}

function renderWelcomeFriends() {
  const box = $("#welcomeFriendsAvatars");
  if (!box) return;
  box.innerHTML = welcomeHubFriends
    .map(
      (f) => `
      <div class="ps5-friend-chip" title="${f.name} — ${f.game} (${f.status})">
        <div class="ps5-friend-avatar-item" style="background: linear-gradient(135deg, ${f.color}, #090e1c);">
          <span>${f.initials}</span>
          <span class="ps5-friend-avatar-dot"></span>
        </div>
        <div class="ps5-friend-meta">
          <span class="ps5-friend-name">${f.name}</span>
          <span class="ps5-friend-game">${f.game}</span>
        </div>
      </div>
    `
    )
    .join("");
  if ($("#lblFriendsList")) {
    $("#lblFriendsList").textContent = welcomeHubFriends.map((f) => `${f.name} (${f.game})`).join(" · ");
  }
}

function renderWelcomeBatteryRings() {
  const box = $("#welcomeBatteryRings");
  if (!box) return;
  const devices = [
    { label: "DualSense 1", pct: 86, bars: 3, colorClass: "ps5-ring-progress--green", stroke: "#22c55e", icon: PS5Icons.dualsenseSilhouette },
    { label: "DualSense 2", pct: 32, bars: 2, colorClass: "ps5-ring-progress--amber", stroke: "#f59e0b", icon: PS5Icons.dualsenseSilhouette },
    { label: "PULSE 3D", pct: 91, bars: 3, colorClass: "ps5-ring-progress--blue", stroke: "#38bdf8", icon: PS5Icons.earbudsSilhouette }
  ];
  const circumference = 2 * Math.PI * 31; // 194.78

  box.innerHTML = devices
    .map((d) => {
      const offset = (circumference * (1 - d.pct / 100)).toFixed(1);
      return `
        <div class="ps5-battery-card" title="${d.label}: ${d.pct}%">
          <div class="ps5-battery-ring-item">
            <svg class="ps5-ring-svg" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r="31" class="ps5-ring-bg" />
              <circle cx="36" cy="36" r="31" class="ps5-ring-track" />
              <circle cx="36" cy="36" r="31" class="ps5-ring-progress ${d.colorClass}"
                style="stroke: ${d.stroke};"
                stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${offset}" />
            </svg>
            <div class="ps5-ring-inner">
              <span class="ps5-ring-pct">${d.pct}%</span>
              <span class="ps5-ring-icon-slot">${d.icon}</span>
            </div>
          </div>
          <span class="ps5-battery-dev-label">${d.label}</span>
        </div>
      `;
    })
    .join("");
}

function renderControllerHints() {
  const el = $("#ps5ControllerHints");
  if (!el) return;
  el.innerHTML = `
    <span class="c-hint" data-action="cc" title="Нажмите для открытия Центра управления"><kbd class="c-glyph">PS</kbd> ${S("hintCC")}</span>
    <span class="c-hint" data-action="select" title="Нажмите для выбора/запуска"><kbd class="c-glyph">${PS5Icons.gamepadCross}</kbd> ${S("hintSelect")}</span>
    <span class="c-hint" data-action="search" title="Нажмите для поиска"><kbd class="c-glyph">${PS5Icons.gamepadTriangle}</kbd> ${S("hintSearch")}</span>
    <span class="c-hint" data-action="tab" title="Нажмите для переключения вкладок"><kbd class="c-glyph">TAB</kbd> ${S("hintTab")}</span>
    <span class="c-hint" data-action="back" title="Нажмите для возврата"><kbd class="c-glyph">${PS5Icons.gamepadCircle}</kbd> ${S("hintBack")}</span>
  `;
}

// ============================================================
// Background Crossfade Engine (With Safe Fallback)
// ============================================================
function setBackground(url, fallbackUrl = "") {
  const bgA = $("#bgLayerA");
  const bgB = $("#bgLayerB");
  if (!url) {
    bgA.classList.remove("is-visible");
    bgB.classList.remove("is-visible");
    return;
  }

  const incoming = state.bgFlip ? bgA : bgB;
  const outgoing = state.bgFlip ? bgB : bgA;
  state.bgFlip = !state.bgFlip;

  const applyUrl = (finalUrl) => {
    incoming.style.backgroundImage = `url('${finalUrl}')`;
    incoming.classList.add("is-visible");
    outgoing.classList.remove("is-visible");
  };

  if (url.startsWith("data:")) {
    applyUrl(url);
  } else {
    const probe = new Image();
    probe.onload = () => applyUrl(url);
    probe.onerror = () => applyUrl(fallbackUrl || PS5Icons.makeSceneArt("ps5-eco"));
    probe.src = url;
  }
}

// ============================================================
// Localization & Telemetry Application
// ============================================================
function applyLanguageAndTelemetry() {
  document.documentElement.lang = state.lang;
  $("#btnLangToggle").textContent = state.lang.toUpperCase();

  $("#tabGames").textContent = S("tabGames");
  $("#tabMedia").textContent = S("tabMedia");
  $("#lblOnlineFriends").textContent = S("onlineFriends");
  $("#lblAccessibility").textContent = S("accessibility");
  $("#lblAccessibilityDesc").textContent = S("accessibilityDesc");
  $("#lblTrophies").textContent = S("trophies");
  $("#lblStoreShowcaseTitle").textContent = S("storeFeaturedTitle");
  $("#lblStoreShowcaseSub").textContent = S("storeFeaturedSub");
  $("#lblConsoleStorage").textContent = S("consoleStorage");
  $("#lblWishlistTitle").textContent = S("wishlistTitle");
  $("#lblWishlistSub").textContent = S("wishlistSub");
  $("#lblFriendActivityTitle").textContent = S("friendActivityTitle");
  $("#lblFriendActivitySub").textContent = S("friendActivitySub");
  $("#lblScrollHubCue").textContent = S("scrollHubCue");
  $("#lblBackHome").textContent = S("backHome");
  $("#lblActivitiesTitle").textContent = S("activitiesTitle");
  $("#lblActivitiesBadge").textContent = S("activitiesBadge");
  $("#lblNewsTitle").textContent = S("newsTitle");
  $("#lblNewsBadge").textContent = S("newsBadge");
  $("#lblTrophiesProjectTitle").textContent = S("trophiesProjectTitle");
  $("#lblTrophiesProjectBadge").textContent = S("trophiesProjectBadge");
  $("#lblCcCurrentTag").textContent = S("ccCurrentTag");
  $("#ccBtnResume").textContent = S("ccResumeBtn");
  $("#lblCcMusicTag").textContent = S("ccMusicTag");
  $("#lblCcMusicTitle").textContent = S("ccMusicTitle");
  $("#lblCcMusicArtist").textContent = S("ccMusicArtist");
  $("#lblCcNetworkTag").textContent = S("ccNetworkTag");
  $("#lblCcNetworkSub").textContent = S("ccNetworkSub");
  $("#ccBtnProfile").textContent = S("ccProfileBtn");
  $("#searchInput").placeholder = S("searchPlaceholder");
  $("#lblSettingsTag").textContent = S("settingsTag");
  $("#lblSettingsTitle").textContent = S("settingsTitle");
  if ($("#lblEditWidgets")) $("#lblEditWidgets").textContent = S("editWidgets");

  // System PS5 Trophies into Welcome Hub Trophies Card
  const summary = defaultProfileTelemetry;
  const earned = summary.trophies;
  const total = summary.totalTrophies;
  const level = summary.level;
  const pct = summary.progressPct;

  $("#ps5TrophiesTotal").textContent = `${S("totalPrefix")}: ${total}`;
  $("#ps5CountPlat").textContent = String(earned.platinum);
  $("#ps5CountGold").textContent = String(earned.gold);
  $("#ps5CountSilver").textContent = String(earned.silver);
  $("#ps5CountBronze").textContent = String(earned.bronze);
  $("#ps5TrophyLevel").textContent = `${S("levelPrefix")} ${level}`;
  $("#ps5TrophyPct").textContent = `${pct}%`;
  $("#ps5TrophyBarFill").style.width = `${pct}%`;

  renderControllerHints();
  renderRibbon();
  renderActiveView();
  renderControlCenter();
  updateClock();
}

// ============================================================
// Top-Aligned Game Ribbon Renderer
// ============================================================
function renderRibbon() {
  const ribbonEl = $("#ps5GamesRibbon");
  if (!ribbonEl) return;
  const items = getCurrentList();
  ribbonEl.innerHTML = "";

  items.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.tileId = item.id;
    const isActive = item.id === state.activeId;
    btn.className = `ps5-tile${item.isPeekLeft ? " ps5-tile--peek-left" : ""}${isActive ? " is-active" : ""}`;
    btn.setAttribute("aria-label", t(item.title));

    const artClass = item.tileStyle ? `ps5-tile-art ps5-tile-art--${item.tileStyle}` : "ps5-tile-art";
    let innerArt = "";
    if (item.iconSvg) {
      innerArt = item.iconSvg;
    } else {
      const safeThumb = item.thumb || PS5Icons.makeSceneArt("ps5-eco", t(item.title));
      const fb = item.fallbackBg || PS5Icons.makeSceneArt("ps5-eco", t(item.title));
      innerArt = `<img src="${safeThumb}" alt="${t(item.title)}" onerror="this.onerror=null;this.src='${fb}'" />`;
    }

    btn.innerHTML = `
      <div class="${artClass}">${innerArt}</div>
      <span class="ps5-tile-active-label">${t(item.title)}</span>
    `;

    btn.addEventListener("click", () => {
      if (state.activeId !== item.id) {
        selectTile(item.id, true);
      } else if (item.id === "library") {
        handleAction("modal:library");
      } else if (item.btnAction) {
        handleAction(item.btnAction);
      }
    });

    ribbonEl.appendChild(btn);
  });

  const activeBtn = ribbonEl.querySelector(".ps5-tile.is-active");
  if (activeBtn) {
    activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }
}

function selectTile(tileId, withSound = true) {
  const items = getCurrentList();
  const target = items.find((it) => it.id === tileId);
  if (!target) return;

  if (withSound && state.activeId !== tileId) {
    SoundEngine.navigate();
  }
  state.activeId = tileId;

  if (state.isHubOpen && target.viewType !== "game") {
    closeGameHub();
  }

  renderRibbon();
  renderActiveView();
}

// ============================================================
// View Stage Switcher (Welcome Hub | Explore | Game Home)
// ============================================================
function renderActiveView() {
  const item = getActiveItem();
  if (!item) return;

  const welcomeEl = $("#ps5WelcomeView");
  const exploreEl = $("#ps5ExploreView");
  const heroEl = $("#ps5GameHeroView");

  $("#ccCardTitle").textContent = t(item.title);
  $("#ccCardSub").textContent = item.publisher || "PlayStation®5 System Shell";

  if ($("#scrollDownCue")) {
    $("#scrollDownCue").hidden = item.viewType !== "game";
  }

  if (item.viewType === "welcome") {
    welcomeEl.hidden = false;
    exploreEl.hidden = true;
    heroEl.hidden = true;
    setBackground(item.bg || "assets/bg_monica.jpg");
  } else if (item.viewType === "explore") {
    welcomeEl.hidden = true;
    exploreEl.hidden = false;
    heroEl.hidden = true;
    setBackground(item.bg, item.fallbackBg);
    renderExploreView(item);
  } else {
    welcomeEl.hidden = true;
    exploreEl.hidden = true;
    heroEl.hidden = false;
    setBackground(item.bg, item.fallbackBg);
    renderGameHeroView(item);
    if (state.isHubOpen) {
      renderGameHubContent(item);
    }
  }
}

function renderExploreView(item) {
  $("#exploreKicker").textContent = t(item.kicker);
  $("#exploreTitle").textContent = t(item.title);
  $("#exploreDesc").textContent = t(item.desc);

  const row = $("#ps5MediaCardsRow");
  row.innerHTML = "";
  (item.cards || []).forEach((c) => {
    const card = document.createElement("article");
    card.className = "ps5-media-card";
    card.tabIndex = 0;
    card.innerHTML = `
      <img src="${c.img}" alt="${t(c.title)}" />
      <div class="ps5-media-card-caption">
        <span class="ps5-media-card-title">${t(c.title)}</span>
        <span class="ps5-media-card-tag">${t(c.tag)}</span>
      </div>
    `;
    card.addEventListener("click", () => handleAction(c.action));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleAction(c.action);
    });
    row.appendChild(card);
  });
}

function renderGameHeroView(item) {
  $("#heroKicker").textContent = t(item.kicker);
  $("#heroTitle").textContent = t(item.title);
  $("#heroDesc").textContent = t(item.desc);

  const primaryBtn = $("#heroBtn");
  primaryBtn.textContent = t(item.ctaText) || S("playCta");
  primaryBtn.onclick = () => handleAction(item.btnAction || "modal:bio");

  const secBtn = $("#heroSecondaryBtn");
  if (item.secText) {
    secBtn.hidden = false;
    secBtn.textContent = t(item.secText);
    secBtn.onclick = () => {
      if (item.secAction) handleAction(item.secAction);
      else if (item.secLink) window.open(item.secLink, "_blank", "noopener");
    };
  } else {
    secBtn.hidden = true;
  }

  // Right-bottom Trophy Summary
  const tr = item.trophies || { platinum: 1, gold: 4, silver: 12, bronze: 24 };
  const totalTr = tr.platinum + tr.gold + tr.silver + tr.bronze;
  const pct = item.progressPct ?? 100;
  $("#heroTrophyLabel").textContent = item.playTime || S("trophies");
  $("#heroTrophyPct").textContent = `${pct}%`;
  $("#heroTrophyCounts").textContent = `${totalTr} ${S("trophies").toLowerCase()}`;
  $("#heroTrophyBar").style.width = `${pct}%`;
}

// ============================================================
// Level 1: Two-Tier Game Hub Navigation
// ============================================================
function openGameHub() {
  const item = getActiveItem();
  if (!item || item.viewType !== "game" || state.isHubOpen) return;
  state.isHubOpen = true;
  document.body.classList.add("hub-active");
  renderGameHubContent(item);
  SoundEngine.whooshDown();
}

function closeGameHub() {
  if (!state.isHubOpen) return;
  state.isHubOpen = false;
  document.body.classList.remove("hub-active");
  SoundEngine.whooshUp();
}

function renderGameHubContent(item) {
  $("#hubGameThumb").style.backgroundImage = `url('${item.thumb || PS5Icons.makeSceneArt("ps5-eco")}')`;
  $("#hubGameTitle").textContent = t(item.title);
  $("#hubGamePublisher").textContent = item.publisher || "PlayStation®5";

  const carousel = $("#activityCarousel");
  carousel.innerHTML = "";
  (item.activities || []).forEach((act) => {
    const card = document.createElement("div");
    card.className = "activity-card-ps5";
    card.innerHTML = `
      <div class="act-bg" style="background-image: url('${act.thumb}')"></div>
      <div class="act-gradient"></div>
      <div class="act-content">
        <span class="act-type-tag">${act.type}</span>
        <span class="act-title">${act.title}</span>
        <div class="act-meta">
          <span>${act.timeEst}</span>
          <span>${act.progress}%</span>
        </div>
        <div class="act-bar-wrap"><div class="act-bar-fill" style="width:${act.progress}%"></div></div>
      </div>
    `;
    card.addEventListener("click", () => {
      if (act.action) handleAction(act.action);
      else if (act.link) window.open(act.link, "_blank", "noopener");
    });
    carousel.appendChild(card);
  });

  const newsGrid = $("#hubNewsFeed");
  newsGrid.innerHTML = "";
  (item.news || []).forEach((n) => {
    const el = document.createElement("article");
    el.className = "news-card-ps5";
    el.innerHTML = `
      <span class="news-date">${n.date}</span>
      <h4 class="news-title">${n.title}</h4>
      <p class="news-desc">${n.desc}</p>
    `;
    newsGrid.appendChild(el);
  });

  const tr = item.trophies || { platinum: 1, gold: 4, silver: 12, bronze: 24 };
  const tiers = [
    { label: state.lang === "ru" ? "Платина" : "Platinum", count: tr.platinum, color: "#38bdf8" },
    { label: state.lang === "ru" ? "Золото" : "Gold", count: tr.gold, color: "#eab308" },
    { label: state.lang === "ru" ? "Серебро" : "Silver", count: tr.silver, color: "#cbd5e1" },
    { label: state.lang === "ru" ? "Бронза" : "Bronze", count: tr.bronze, color: "#ea580c" }
  ];
  const trophiesRow = $("#hubTrophies");
  trophiesRow.innerHTML = "";
  tiers.forEach((tier) => {
    const badge = document.createElement("div");
    badge.className = "hub-trophy-badge";
    badge.style.color = tier.color;
    badge.innerHTML = `${PS5Icons.trophy}<span>${tier.label}: ${tier.count}</span>`;
    trophiesRow.appendChild(badge);
  });
}

// ============================================================
// Tabs Switching (Games | Media)
// ============================================================
function switchCategory(cat) {
  if (cat === state.category) return;
  state.category = cat;
  const list = getCurrentList();
  state.activeId = cat === "games" ? "welcome" : list[0].id;

  $("#tabGames").classList.toggle("is-active", cat === "games");
  $("#tabMedia").classList.toggle("is-active", cat === "media");

  if (state.isHubOpen) closeGameHub();
  SoundEngine.confirm();
  renderRibbon();
  renderActiveView();
}

// ============================================================
// Control Center (PS Button / Space)
// ============================================================
function renderControlCenter() {
  const track = $("#controlCenterTrack");
  if (!track) return;
  track.innerHTML = "";
  controlCenterItems.forEach((it) => {
    const btn = document.createElement("button");
    btn.className = "cc-item-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", t(it.label));
    btn.dataset.action = it.action;

    let icon = it.icon;
    if (it.action === "mic") {
      if (state.isMicMuted) {
        btn.classList.add("is-mic-muted");
        icon = PS5Icons.micMuted;
      }
    }

    btn.innerHTML = `<span class="cc-tooltip">${t(it.label)}</span>${icon}`;
    btn.addEventListener("click", () => handleControlCenterAction(it.action));
    track.appendChild(btn);
  });
}

function toggleControlCenter() {
  state.isControlCenterOpen = !state.isControlCenterOpen;
  const overlay = $("#controlCenterOverlay");
  overlay.classList.toggle("active", state.isControlCenterOpen);
  overlay.setAttribute("aria-hidden", String(!state.isControlCenterOpen));
  SoundEngine.controlCenter(state.isControlCenterOpen);
}

function closeControlCenter() {
  if (!state.isControlCenterOpen) return;
  state.isControlCenterOpen = false;
  const overlay = $("#controlCenterOverlay");
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  SoundEngine.controlCenter(false);
}

function toggleMic() {
  state.isMicMuted = !state.isMicMuted;
  SoundEngine.micMute(state.isMicMuted);
  renderControlCenter();
  if (state.isMicMuted) {
    showToast(state.lang === "ru" ? "Микрофон DualSense" : "DualSense Mic", state.lang === "ru" ? "Микрофон отключен (Muted)" : "Microphone muted", PS5Icons.micMuted);
  } else {
    showToast(state.lang === "ru" ? "Микрофон DualSense" : "DualSense Mic", state.lang === "ru" ? "Микрофон включен" : "Microphone active", PS5Icons.mic);
  }
}

function handleControlCenterAction(action) {
  if (action === "home") {
    closeControlCenter();
    if (state.category !== "games") switchCategory("games");
    selectTile("welcome", true);
  } else if (action === "switcher") {
    closeControlCenter();
    openSwitcherModal();
  } else if (action === "notifications") {
    closeControlCenter();
    openNotificationsModal();
  } else if (action === "gamebase") {
    closeControlCenter();
    openGameBaseModal();
  } else if (action === "music") {
    const playing = SoundEngine.toggleAmbient();
    showToast(state.lang === "ru" ? "Музыка PS5" : "PS5 Music", playing ? (state.lang === "ru" ? "Воспроизведение Emaj9 включено" : "Ambient Synth Playing") : (state.lang === "ru" ? "Пауза" : "Paused"), PS5Icons.music);
  } else if (action === "sound") {
    closeControlCenter();
    openSoundModal();
  } else if (action === "mic") {
    toggleMic();
  } else if (action === "accessories") {
    closeControlCenter();
    openAccessoriesModal();
  } else if (action === "power") {
    closeControlCenter();
    openPowerModal();
  } else if (action.startsWith("modal:")) {
    closeControlCenter();
    handleAction(action);
  }
}

function openPowerModal() {
  const isRu = state.lang === "ru";
  const html = `
    <div class="ps5-power-list">
      <button class="ps5-power-opt" data-power="rest" type="button">
        <span class="ps5-power-icon">${PS5Icons.powerRest}</span>
        <div class="ps5-power-text">
          <strong>${isRu ? "Перейти в режим покоя" : "Enter Rest Mode"}</strong>
          <p>${isRu ? "Зарядка контроллеров и фоновая загрузка обновлений при пониженном потреблении." : "Charge controllers and download updates in low-power state."}</p>
        </div>
      </button>

      <button class="ps5-power-opt" data-power="off" type="button">
        <span class="ps5-power-icon">${PS5Icons.powerOff}</span>
        <div class="ps5-power-text">
          <strong>${isRu ? "Выключить систему PS5" : "Turn Off PS5"}</strong>
          <p>${isRu ? "Закрыть все приложения и безопасно выключить консоль." : "Close all games and turn off the console."}</p>
        </div>
      </button>

      <button class="ps5-power-opt" data-power="restart" type="button">
        <span class="ps5-power-icon">${PS5Icons.powerRestart}</span>
        <div class="ps5-power-text">
          <strong>${isRu ? "Перезагрузить систему PS5" : "Restart PS5"}</strong>
          <p>${isRu ? "Перезапуск системного программного обеспечения PS5." : "Restart PlayStation 5 system software."}</p>
        </div>
      </button>
    </div>
  `;

  openModal({
    tag: isRu ? "СИСТЕМА PS5" : "PS5 SYSTEM",
    title: isRu ? "Питание" : "Power Options",
    subtitle: isRu ? "Выберите параметр питания для этой консоли PS5." : "Select a power option for this PS5 console.",
    content: html,
    actions: []
  });

  const modalBody = $("#modalBody");
  modalBody.querySelectorAll(".ps5-power-opt").forEach((btn) => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.power;
      closeModal();
      SoundEngine.confirm();
      if (type === "rest") {
        showToast("Режим покоя", isRu ? "Консоль переходит в режим покоя... Нажмите любую клавишу для выхода." : "Entering Rest Mode... Press any key to wake.", PS5Icons.powerRest);
      } else if (type === "off") {
        showToast("Система PS5", isRu ? "Консоль выключена. Кликните для включения." : "Console is turned off. Click to wake.", PS5Icons.powerOff);
      } else if (type === "restart") {
        showToast("Перезагрузка", isRu ? "Перезапуск системного интерфейса PS5..." : "Restarting PS5 System...", PS5Icons.powerRestart);
        setTimeout(() => {
          selectTile("welcome", true);
        }, 1200);
      }
    });
  });
}

function openSoundModal() {
  const isRu = state.lang === "ru";
  const html = `
    <div style="display:flex; flex-direction:column; gap:14px; margin-top:12px;">
      <div style="background:rgba(255,255,255,0.04); padding:14px 18px; border-radius:14px; border:1px solid rgba(255,255,255,0.08);">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span style="font-weight:600; font-size:14px;">${isRu ? "Основная громкость интерфейса" : "System SFX Volume"}</span>
          <span id="soundVolLabel" style="color:var(--ps5-text-muted); font-size:13px;">${Math.round(SoundEngine._sfxVolume * 100)}%</span>
        </div>
        <input id="soundSfxSlider" type="range" min="0" max="1" step="0.05" value="${SoundEngine._sfxVolume}" style="width:100%; accent-color:#ffffff;" />
      </div>

      <div style="background:rgba(255,255,255,0.04); padding:14px 18px; border-radius:14px; border:1px solid rgba(255,255,255,0.08);">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span style="font-weight:600; font-size:14px;">${isRu ? "Музыка главного меню (Эмбиент Emaj9)" : "Home Screen Ambient Music"}</span>
          <span id="soundMusicLabel" style="color:var(--ps5-text-muted); font-size:13px;">${Math.round(SoundEngine._musicVolume * 100)}%</span>
        </div>
        <input id="soundMusicSlider" type="range" min="0" max="1" step="0.05" value="${SoundEngine._musicVolume}" style="width:100%; accent-color:#ffffff;" />
      </div>

      <div style="background:rgba(255,255,255,0.04); padding:14px 18px; border-radius:14px; border:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:600; font-size:14px;">${isRu ? "Устройство вывода звука" : "Audio Output Device"}</div>
          <div style="font-size:12.5px; color:var(--ps5-text-muted);">PULSE Explore™ Wireless Earbuds · 3D Audio</div>
        </div>
        <span style="font-size:12px; color:var(--ps5-green); font-weight:600;">${isRu ? "Подключено" : "Connected"}</span>
      </div>
    </div>
  `;

  openModal({
    tag: isRu ? "НАСТРОЙКИ ЗВУКА" : "SOUND SETTINGS",
    title: isRu ? "Звук" : "Sound",
    subtitle: isRu ? "Регулировка уровней громкости и аудиоустройств PS5" : "Adjust volume levels and PS5 audio output",
    content: html,
    actions: [
      {
        text: SoundEngine.muted ? (isRu ? "Включить весь звук" : "Unmute All") : (isRu ? "Отключить весь звук" : "Mute All"),
        primary: false,
        action: "sound_mute"
      }
    ]
  });

  $("#soundSfxSlider")?.addEventListener("input", (e) => {
    SoundEngine._sfxVolume = parseFloat(e.target.value);
    const lbl = $("#soundVolLabel");
    if (lbl) lbl.textContent = `${Math.round(SoundEngine._sfxVolume * 100)}%`;
  });

  $("#soundMusicSlider")?.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    SoundEngine.setMusicVolume(val);
    const lbl = $("#soundMusicLabel");
    if (lbl) lbl.textContent = `${Math.round(val * 100)}%`;
  });
}

function openAccessoriesModal() {
  const isRu = state.lang === "ru";
  const html = `
    <div style="display:flex; flex-direction:column; gap:12px; margin-top:12px;">
      <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-radius:14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
        <div style="display:flex; align-items:center; gap:14px;">
          <span style="color:#ffffff;">${PS5Icons.controller}</span>
          <div>
            <div style="font-weight:600; font-size:14px;">DualSense #1 (${isRu ? "Белый" : "White"})</div>
            <div style="font-size:12.5px; color:var(--ps5-text-muted);">${isRu ? "Беспроводной контроллер · В сети" : "Wireless Controller · Active"}</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:13px; font-weight:600; color:var(--ps5-green);">85%</span>
          ${PS5Icons.miniBattery(3)}
        </div>
      </div>

      <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-radius:14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
        <div style="display:flex; align-items:center; gap:14px;">
          <span style="color:#ffffff;">${PS5Icons.controller}</span>
          <div>
            <div style="font-weight:600; font-size:14px;">DualSense #2 (${isRu ? "Черный Midnight" : "Midnight Black"})</div>
            <div style="font-size:12.5px; color:var(--ps5-text-muted);">${isRu ? "Беспроводной контроллер · Ожидание" : "Wireless Controller · Standby"}</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:13px; font-weight:600; color:var(--ps5-amber);">32%</span>
          ${PS5Icons.miniBattery(1)}
        </div>
      </div>

      <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-radius:14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
        <div style="display:flex; align-items:center; gap:14px;">
          <span style="color:#ffffff;">${PS5Icons.earbudsSilhouette}</span>
          <div>
            <div style="font-weight:600; font-size:14px;">PULSE Explore™ Earbuds</div>
            <div style="font-size:12.5px; color:var(--ps5-text-muted);">${isRu ? "Беспроводные наушники-вкладыши" : "Wireless Earbuds"}</div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:13px; font-weight:600; color:var(--ps5-green);">90%</span>
          ${PS5Icons.miniBattery(3)}
        </div>
      </div>
    </div>
  `;

  openModal({
    tag: isRu ? "АКСЕССУАРЫ PS5" : "PS5 ACCESSORIES",
    title: isRu ? "Аксессуары" : "Accessories",
    subtitle: isRu ? "Состояние подключенных устройств и уровень заряда" : "Connected devices and battery status",
    content: html,
    actions: [
      {
        text: isRu ? "Настройки контроллеров" : "Controller Settings",
        primary: true,
        action: "open:settings"
      }
    ]
  });
}

function openGameBaseModal() {
  const isRu = state.lang === "ru";
  const html = `
    <div style="display:flex; flex-direction:column; gap:10px; margin-top:12px;">
      ${welcomeHubFriends.map(f => `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-radius:14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:38px; height:38px; border-radius:50%; background:${f.color}; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; color:#ffffff;">
              ${f.initials}
            </div>
            <div>
              <div style="font-weight:600; font-size:14px;">${f.name}</div>
              <div style="font-size:12px; color:var(--ps5-text-muted); display:flex; align-items:center; gap:6px;">
                <span class="ps5-green-dot" style="position:static; display:inline-block;"></span>
                <span>${isRu ? "Играет в" : "Playing"} <strong style="color:rgba(255,255,255,0.85);">${f.game || "ASTRO BOT"}</strong></span>
              </div>
            </div>
          </div>
          <button class="ps5-btn-sec ps5-btn-sec--sm" style="font-size:11.5px; padding:4px 12px;" type="button">${isRu ? "В тусовку" : "Join Party"}</button>
        </div>
      `).join("")}
    </div>
  `;

  openModal({
    tag: "GAME BASE",
    title: "Game Base",
    subtitle: isRu ? "Друзья в сети, тусовки и голосовой чат PS5" : "Online friends, parties, and PS5 voice chat",
    content: html,
    actions: [
      {
        text: isRu ? "Начать тусовку" : "Start Party",
        primary: true,
        action: "home_reset"
      }
    ]
  });
}

function openNotificationsModal() {
  const isRu = state.lang === "ru";
  const html = `
    <div style="display:flex; flex-direction:column; gap:10px; margin-top:12px;">
      <div style="display:flex; gap:14px; padding:14px 16px; border-radius:14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
        <span style="color:var(--ps5-gold); flex-shrink:0;">${PS5Icons.trophy}</span>
        <div>
          <div style="font-weight:600; font-size:14px;">${isRu ? "Получен трофей: Платина «Архитектор систем»" : "Trophy Earned: Platinum «System Architect»"}</div>
          <div style="font-size:12.5px; color:var(--ps5-text-muted); margin-top:2px;">ASTRO BOT · ${isRu ? "Только что" : "Just now"}</div>
        </div>
      </div>

      <div style="display:flex; gap:14px; padding:14px 16px; border-radius:14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
        <span style="color:#ffffff; flex-shrink:0;">${PS5Icons.settings}</span>
        <div>
          <div style="font-weight:600; font-size:14px;">${isRu ? "Обновление системного ПО PS5 24.07-10.20.00" : "PS5 System Software Update 24.07-10.20.00"}</div>
          <div style="font-size:12.5px; color:var(--ps5-text-muted); margin-top:2px;">${isRu ? "Готово к установке · 1.18 GB" : "Ready to install · 1.18 GB"}</div>
        </div>
      </div>

      <div style="display:flex; gap:14px; padding:14px 16px; border-radius:14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
        <span style="color:var(--ps5-blue); flex-shrink:0;">${PS5Icons.controller}</span>
        <div>
          <div style="font-weight:600; font-size:14px;">${isRu ? "Беспроводной контроллер DualSense #1 подключен" : "DualSense Wireless Controller #1 connected"}</div>
          <div style="font-size:12.5px; color:var(--ps5-text-muted); margin-top:2px;">${isRu ? "Заряд батареи: 85%" : "Battery level: 85%"}</div>
        </div>
      </div>
    </div>
  `;

  openModal({
    tag: isRu ? "УВЕДОМЛЕНИЯ" : "NOTIFICATIONS",
    title: isRu ? "Уведомления" : "Notifications",
    subtitle: isRu ? "Последние системные события и трофеи PlayStation 5" : "Recent PlayStation 5 system events and trophies",
    content: html,
    actions: [
      {
        text: isRu ? "Очистить все" : "Clear All",
        primary: false,
        action: "home_reset"
      }
    ]
  });
}

function openSwitcherModal() {
  const isRu = state.lang === "ru";
  const items = ribbonCatalog.games.filter(g => g.viewType === "game");
  const html = `
    <div style="display:flex; flex-direction:column; gap:10px; margin-top:12px;">
      ${items.map(it => `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-radius:14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
          <div style="display:flex; align-items:center; gap:14px;">
            <div style="width:48px; height:48px; border-radius:10px; overflow:hidden; background:#141720; flex-shrink:0;">
              ${it.thumb ? `<img src="${it.thumb}" style="width:100%; height:100%; object-fit:cover;" />` : `<div style="display:flex; align-items:center; justify-content:center; width:100%; height:100%;">${it.iconSvg || ""}</div>`}
            </div>
            <div>
              <div style="font-weight:600; font-size:14px;">${t(it.title)}</div>
              <div style="font-size:12px; color:var(--ps5-text-muted);">${it.publisher || "PlayStation®5"}</div>
            </div>
          </div>
          <button class="ps5-btn-play ps5-btn-play--sm" style="font-size:12px; padding:6px 16px;" type="button" data-switch-to="${it.id}">${isRu ? "Переключиться" : "Switch"}</button>
        </div>
      `).join("")}
    </div>
  `;

  openModal({
    tag: isRu ? "ПЕРЕКЛЮЧАТЕЛЬ" : "SWITCHER",
    title: isRu ? "Переключатель" : "Switcher",
    subtitle: isRu ? "Быстрый переход между недавно запущенными играми" : "Quickly switch between recently played games",
    content: html,
    actions: []
  });

  const modalBody = $("#modalBody");
  modalBody.querySelectorAll("[data-switch-to]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.switchTo;
      closeModal();
      selectTile(id, true);
    });
  });
}

function openEditWidgetsModal() {
  const isRu = state.lang === "ru";
  const presets = [
    { id: "default", name: isRu ? "По умолчанию" : "Default", desc: isRu ? "Сбалансированная сетка: друзья, призы, батарея контроллеров и память" : "Balanced grid: friends, trophies, battery, and SSD storage" },
    { id: "social", name: isRu ? "Социальный" : "Social", desc: isRu ? "Максимум внимания друзьям в сети, активностям и Game Base" : "Focus on online friends, activity cards, and Game Base" },
    { id: "gaming", name: isRu ? "Игровой" : "Gaming", desc: isRu ? "Акцент на призах PSN, витрине PlayStation Store и памяти SSD" : "Emphasis on PSN trophies, PS Store showcase, and console storage" },
    { id: "media", name: isRu ? "Мультимедиа" : "Media", desc: isRu ? "Галерея снимков экрана 4K HDR и видеоклипов" : "Gallery of 4K HDR screenshots and captured clips" }
  ];

  const html = `
    <div style="display:flex; flex-direction:column; gap:10px; margin-top:12px;">
      ${presets.map(p => `
        <button class="ps5-power-opt" data-preset="${p.id}" type="button" style="justify-content:space-between;">
          <div style="text-align:left;">
            <div style="font-weight:600; font-size:14.5px; color:#ffffff;">${p.name}</div>
            <div style="font-size:12px; color:var(--ps5-text-muted); margin-top:2px;">${p.desc}</div>
          </div>
          <span class="c-glyph" style="border-radius:50%; width:24px; height:24px;">${state.widgetPreset === p.id ? "✓" : "○"}</span>
        </button>
      `).join("")}
    </div>
  `;

  openModal({
    tag: isRu ? "ЦЕНТР ПРИВЕТСТВИЯ" : "WELCOME HUB",
    title: isRu ? "Настройка виджетов" : "Customize Widgets",
    subtitle: isRu ? "Выберите готовый пресет компоновки Welcome Hub (Обновление 2024)" : "Select a layout preset for the Welcome Hub (2024 Update)",
    content: html,
    actions: []
  });

  const modalBody = $("#modalBody");
  modalBody.querySelectorAll("[data-preset]").forEach(btn => {
    btn.addEventListener("click", () => {
      const pid = btn.dataset.preset;
      state.widgetPreset = pid;
      closeModal();
      SoundEngine.confirm();
      showToast(isRu ? "Центр приветствия" : "Welcome Hub", isRu ? `Применен пресет: ${presets.find(p=>p.id===pid).name}` : `Preset applied: ${pid}`, PS5Icons.welcomeGlyphs);
    });
  });
}

// ============================================================
// Search & Settings Overlays
// ============================================================
function openSearch() {
  closeControlCenter();
  const overlay = $("#searchOverlay");
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  $("#searchInput").value = "";
  renderSearchResults("");
  $("#searchInput").focus();
  SoundEngine.modalOpen();
}

function closeSearch() {
  const overlay = $("#searchOverlay");
  if (!overlay.classList.contains("active")) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  SoundEngine.modalClose();
}

function renderSearchResults(q = "") {
  const clean = q.trim().toLowerCase();
  const matches = clean
    ? searchCatalog.filter(
        (it) =>
          it.title.toLowerCase().includes(clean) ||
          it.desc.toLowerCase().includes(clean) ||
          it.category.toLowerCase().includes(clean)
      )
    : searchCatalog;

  const listEl = $("#searchResults");
  listEl.innerHTML = "";
  if (!matches.length) {
    listEl.innerHTML = `<div style="padding:20px;text-align:center;color:var(--ps5-text-muted);">Ничего не найдено</div>`;
    return;
  }
  matches.forEach((it) => {
    const row = document.createElement("div");
    row.className = "search-result-card";
    row.innerHTML = `
      <div class="sr-info">
        <span class="sr-title">${it.title}</span>
        <span class="sr-desc">${it.desc}</span>
      </div>
      <span class="sr-cat">${it.category}</span>
    `;
    row.addEventListener("click", () => {
      closeSearch();
      handleAction(it.action);
    });
    listEl.appendChild(row);
  });
}

function openSettings() {
  closeControlCenter();
  const overlay = $("#settingsOverlay");
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  renderSettingsNav();
  renderSettingsDetail(state.settingsSection);
  SoundEngine.modalOpen();
}

function closeSettings() {
  const overlay = $("#settingsOverlay");
  if (!overlay.classList.contains("active")) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  SoundEngine.modalClose();
}

function renderSettingsNav() {
  const nav = $("#settingsNav");
  nav.innerHTML = "";
  settingsSections.forEach((sec) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `settings-nav-btn${sec.id === state.settingsSection ? " active" : ""}`;
    btn.innerHTML = `${sec.icon}<span>${t(sec.title)}</span>`;
    btn.addEventListener("click", () => {
      state.settingsSection = sec.id;
      renderSettingsNav();
      renderSettingsDetail(sec.id);
      SoundEngine.navigate();
    });
    nav.appendChild(btn);
  });
}

function renderSettingsDetail(secId) {
  const sec = settingsSections.find((s) => s.id === secId) || settingsSections[0];
  const box = $("#settingsDetail");
  box.innerHTML = `
    <h3 style="font-size:20px;font-weight:400;display:flex;align-items:center;gap:10px;">${sec.icon}<span>${t(sec.title)}</span></h3>
    <p style="font-size:13px;color:var(--ps5-text-muted);margin-bottom:6px;">${S("settingsSub")}</p>
  `;

  sec.items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "settings-item-card";

    let btnHtml = "";
    if (item.action) {
      btnHtml = `<button class="ps5-btn-sec ps5-btn-sec--sm" data-act="${item.action}" type="button">${S("openCta")}</button>`;
    } else if (item.toggle === "lang") {
      btnHtml = `<button class="ps5-btn-sec ps5-btn-sec--sm" data-toggle="lang" type="button">${state.lang === "ru" ? "Switch to EN" : "Переключить на RU"}</button>`;
    } else if (item.toggle === "particles") {
      btnHtml = `<button class="ps5-btn-sec ps5-btn-sec--sm" data-toggle="particles" type="button">${state.particlesEnabled ? "ON" : "OFF"}</button>`;
    } else if (item.toggle === "ambient") {
      btnHtml = `<button class="ps5-btn-sec ps5-btn-sec--sm" data-toggle="ambient" type="button">${SoundEngine.ambientPlaying ? "ON" : "OFF"}</button>`;
    } else if (item.toggle === "sfx") {
      btnHtml = `<button class="ps5-btn-sec ps5-btn-sec--sm" data-toggle="sfx" type="button">${SoundEngine.muted ? "OFF" : "ON"}</button>`;
    }

    row.innerHTML = `
      <div>
        <div class="settings-item-label">${t(item.label)}</div>
        <div class="settings-item-val">${t(item.val)}</div>
      </div>
      ${btnHtml}
    `;

    const btn = row.querySelector("button");
    if (btn) {
      btn.addEventListener("click", () => {
        if (btn.dataset.act) {
          closeSettings();
          handleAction(btn.dataset.act);
        } else if (btn.dataset.toggle === "lang") {
          state.lang = state.lang === "ru" ? "en" : "ru";
          applyLanguageAndTelemetry();
          renderSettingsNav();
          renderSettingsDetail(state.settingsSection);
          SoundEngine.confirm();
        } else if (btn.dataset.toggle === "particles") {
          state.particlesEnabled = !state.particlesEnabled;
          particleEngine?.setPaused(!state.particlesEnabled);
          btn.textContent = state.particlesEnabled ? "ON" : "OFF";
          SoundEngine.navigate();
        } else if (btn.dataset.toggle === "ambient") {
          const playing = SoundEngine.toggleAmbient();
          btn.textContent = playing ? "ON" : "OFF";
        } else if (btn.dataset.toggle === "sfx") {
          SoundEngine.toggle();
          updateMuteButtonUI();
          btn.textContent = SoundEngine.muted ? "OFF" : "ON";
        }
      });
    }
    box.appendChild(row);
  });
}

// ============================================================
// Universal Modals (PSN Telemetry, Brawl Stars, Library, Portfolio)
// ============================================================
function openModal({ tag, title, subtitle, content, actions = [], isWide = false }) {
  closeControlCenter();
  const overlay = $("#modalOverlay");
  const card = overlay.querySelector(".modal-card");
  card.classList.toggle("wide", !!isWide);

  $("#modalTag").textContent = tag || "PLAYSTATION®5";
  $("#modalTitle").textContent = title || "";
  $("#modalSubtitle").textContent = subtitle || "";
  $("#modalBody").innerHTML = content || "";

  const actionsEl = $("#modalActions");
  actionsEl.innerHTML = "";
  actions.forEach((act) => {
    if (act.link) {
      const a = document.createElement("a");
      a.className = act.primary ? "ps5-btn-play ps5-btn-play--sm" : "ps5-btn-sec ps5-btn-sec--sm";
      a.href = act.link;
      a.target = "_blank";
      a.rel = "noopener";
      a.style.textDecoration = "none";
      a.textContent = act.text;
      actionsEl.appendChild(a);
    } else {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = act.primary ? "ps5-btn-play ps5-btn-play--sm" : "ps5-btn-sec ps5-btn-sec--sm";
      btn.textContent = act.text;
      btn.addEventListener("click", () => handleAction(act.action));
      actionsEl.appendChild(btn);
    }
  });

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "ps5-btn-sec ps5-btn-sec--sm";
  closeBtn.textContent = state.lang === "ru" ? "Закрыть" : "Close";
  closeBtn.addEventListener("click", closeModal);
  actionsEl.appendChild(closeBtn);

  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  SoundEngine.modalOpen();
}

function closeModal() {
  const overlay = $("#modalOverlay");
  if (!overlay.classList.contains("active")) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  SoundEngine.modalClose();
}

function openPSNModal() {
  const sum = defaultProfileTelemetry;
  const tr = sum.trophies;

  openModal({
    tag: "PLAYSTATION®NETWORK",
    title: state.lang === "ru" ? `Player 1 — Уровень ${sum.level} (${sum.totalTrophies} призов)` : `Player 1 — Level ${sum.level} (${sum.totalTrophies} Trophies)`,
    subtitle: state.lang === "ru"
      ? `Платина: ${tr.platinum} · Золото: ${tr.gold} · Серебро: ${tr.silver} · Бронза: ${tr.bronze}`
      : `Platinum: ${tr.platinum} · Gold: ${tr.gold} · Silver: ${tr.silver} · Bronze: ${tr.bronze}`,
    isWide: true,
    content: `
      <p class="modal-p">${state.lang === "ru" ? "Системный профиль учетной записи PlayStation®5. Готов к подключению вашего игрового тега или синхронизации данных." : "System PlayStation®5 account profile template. Ready for your custom gamertag or data sync."}</p>
      <div class="modal-spec-grid">
        <div class="modal-spec-box"><span class="spec-label">PlayStation Network</span><span class="spec-val">Онлайн · Службы активны</span></div>
        <div class="modal-spec-box"><span class="spec-label">Синхронизация призов</span><span class="spec-val">100% Завершено</span></div>
      </div>
    `,
    actions: []
  });
}

/* =========================================================================
   PS5 PLAYABLE GAME LIBRARY & IN-GAME VIEWPORT CONTROLLER
   ========================================================================= */
const playableGames = [
  {
    id: 'gta-vc',
    title: 'Grand Theft Auto: Vice City',
    sub: 'reVC WebAssembly Engine · 1986 Vice City',
    desc: 'Культовая классика Rockstar Games в браузере: Томми Версетти, неоновый особняк, пляжи Вайс-Сити и легендарные радиостанции Flash FM и Wave 103 на движке reVC.',
    type: 'web',
    badge: 'WASM PORT',
    badgeClass: 'wasm',
    art: 'assets/covers/gta_vc.jpg',
    url: 'https://joncodeofficial.github.io/gta-vice-city-wasm/',
    embedMode: 'direct'
  },
  {
    id: 'gta-v',
    title: 'Grand Theft Auto V',
    sub: 'WebGPU & WebAssembly RAGE Port · Los Santos',
    desc: 'Масштабный мир Лос-Сантоса и округа Блейн: Майкл, Франклин и Тревор с оптимизацией шейдеров и текстур под современные браузеры.',
    type: 'web',
    badge: 'WASM / WEBGPU',
    badgeClass: 'webgpu',
    art: 'assets/covers/gta_v.jpg',
    url: 'https://wasmarcade.com/gta-5',
    embedMode: 'hub'
  },
  {
    id: 'nfs-u2',
    title: 'Need for Speed: Underground 2',
    sub: 'NFSU2Recomp WebAssembly / WebGPU Port · Bayview',
    desc: 'Ночной Бэйвью, культовый саундтрек Riders on the Storm, неоновый тюнинг легендарного Nissan 350Z и уличные гонки прямо в окне консоли.',
    type: 'web',
    badge: 'WASM RACING',
    badgeClass: 'racing',
    art: 'assets/covers/nfs_u2.jpg',
    url: 'https://nfsu2.xyz',
    embedMode: 'hub'
  },
  {
    id: 'gta-3',
    title: 'Grand Theft Auto III',
    sub: 're3 WebAssembly Engine · Liberty City',
    desc: 'Революционная трехмерная игра серии в Либерти-Сити: Клод, криминальные кварталы Портленда и аутентичный движок RenderWare на WebAssembly.',
    type: 'web',
    badge: 'WASM PORT',
    badgeClass: 'wasm',
    art: 'assets/covers/gta_3.jpg',
    url: 'https://wasmarcade.com/gta-3',
    embedMode: 'hub'
  },
  {
    id: 'simpsons',
    title: 'The Simpsons: Hit & Run',
    sub: 'Springfield WebAssembly Sandbox · Radical Ent.',
    desc: 'Знаменитый открытый мир Спрингфилда: Гомер, Мардж, Барт и Лиза выполняют безумные миссии на культовых машинах города.',
    type: 'web',
    badge: 'WASM SANDBOX',
    badgeClass: 'wasm',
    art: 'assets/covers/simpsons.png',
    url: 'https://wasmarcade.com/simpsons',
    embedMode: 'hub'
  },
  {
    id: 'doom-classic',
    title: 'DOOM (1993)',
    sub: 'id Software Classical WebAssembly FPS Engine',
    desc: 'Легендарный шутер от первого лица, определивший жанр: космический десантник, адские легионы на Фобосе и канонический саундтрек E1M1.',
    type: 'web',
    badge: 'CLASSIC FPS',
    badgeClass: 'wasm',
    art: 'assets/covers/doom.jpg',
    url: 'https://archive.org/embed/doom_1993',
    embedMode: 'direct'
  },
  {
    id: 'quake-arena',
    title: 'Quake III Arena',
    sub: 'WebGL Arena Shooter · id Software',
    desc: 'Молниеносный соревновательный сетевой арена-шутер с ракетницами, рельсотронами и поддержкой 120 FPS через браузерный WebGL.',
    type: 'web',
    badge: 'WEBGL 120FPS',
    badgeClass: 'webgpu',
    art: 'assets/covers/quake3.jpg',
    url: 'http://www.quakejs.com/',
    embedMode: 'direct'
  },
  {
    id: 'minecraft',
    title: 'Minecraft (EaglercraftX 1.8.8)',
    sub: 'WebAssembly & WebGL Voxel Sandbox',
    desc: 'Полноценный клиент классического Майнкрафта на WebGL: выживание, крафт, мультиплеерные серверы и генерация бесконечного мира.',
    type: 'web',
    badge: 'VOXEL SANDBOX',
    badgeClass: 'wasm',
    art: 'assets/covers/minecraft.png',
    url: 'https://classic.minecraft.net/',
    embedMode: 'direct'
  }
];

let currentLibView = 'posters'; // 'posters' | 'showcase' | 'list'
let currentShowcaseGameId = 'gta-vc';
let isGameRunning = false;
let isFullscreenMode = false;
let currentGameId = null;

function updateShowcaseHero(game) {
  const libShowcaseHero = document.getElementById('libShowcaseHero');
  const showcaseHeroBadgeRow = document.getElementById('showcaseHeroBadgeRow');
  const showcaseHeroTitle = document.getElementById('showcaseHeroTitle');
  const showcaseHeroDesc = document.getElementById('showcaseHeroDesc');
  const showcaseHeroPlayBtn = document.getElementById('showcaseHeroPlayBtn');
  if (!game || !libShowcaseHero) return;

  libShowcaseHero.style.backgroundImage = `radial-gradient(circle at 75% 30%, rgba(0, 112, 209, 0.45) 0%, transparent 65%), linear-gradient(to right, rgba(4, 7, 16, 0.96) 0%, rgba(4, 7, 16, 0.75) 45%, transparent 100%), url('${game.art}')`;
  if (showcaseHeroBadgeRow) {
    showcaseHeroBadgeRow.innerHTML = `
      <span class="poster-badge ${game.badgeClass || 'wasm'}">${game.badge}</span>
      <span class="poster-badge" style="background: rgba(0,0,0,0.6);">БРАУЗЕРНЫЙ ПОРТ 60 FPS</span>
    `;
  }
  if (showcaseHeroTitle) showcaseHeroTitle.textContent = game.title;
  if (showcaseHeroDesc) showcaseHeroDesc.textContent = game.desc || game.sub;
  if (showcaseHeroPlayBtn) {
    showcaseHeroPlayBtn.onclick = () => {
      SoundEngine.confirm();
      launchPlayableGame(game.id);
    };
  }
}

function renderPlayableLibrary(searchQuery = '') {
  const libGrid = document.getElementById('libGrid');
  const libShowcaseContainer = document.getElementById('libShowcaseContainer');
  const libShowcaseRibbon = document.getElementById('libShowcaseRibbon');
  const libListContainer = document.getElementById('libListContainer');

  const filtered = playableGames.filter(g => {
    return !searchQuery || 
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      g.sub.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.desc && g.desc.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // VIEW 1: PS5 Vertical Posters Grid (2:3 Box Art)
  if (currentLibView === 'posters') {
    if (libGrid) libGrid.style.display = 'grid';
    if (libShowcaseContainer) libShowcaseContainer.style.display = 'none';
    if (libListContainer) libListContainer.style.display = 'none';

    if (libGrid) {
      libGrid.innerHTML = '';
      filtered.forEach(game => {
        const card = document.createElement('div');
        card.className = 'lib-card-poster';
        card.style.backgroundImage = `url('${game.art}')`;
        card.tabIndex = 0;
        card.innerHTML = `
          <div class="poster-top-row">
            <span class="poster-badge ${game.badgeClass || 'wasm'}">${game.badge}</span>
            <span class="poster-badge" style="background: rgba(0,0,0,0.5); font-size: 9px;">60 FPS</span>
          </div>
          <div class="poster-bottom-content">
            <div class="poster-title">${game.title}</div>
            <div class="poster-sub">${game.sub}</div>
            <div class="poster-play-pill">
              <span>▶</span> <span>Запустить</span>
            </div>
          </div>
        `;
        card.addEventListener('click', () => {
          SoundEngine.confirm();
          launchPlayableGame(game.id);
        });
        libGrid.appendChild(card);
      });
    }
  }

  // VIEW 2: PS5 Showcase Spotlight & Horizontal Carousel
  else if (currentLibView === 'showcase') {
    if (libGrid) libGrid.style.display = 'none';
    if (libShowcaseContainer) libShowcaseContainer.style.display = 'flex';
    if (libListContainer) libListContainer.style.display = 'none';

    let heroGame = filtered.find(g => g.id === currentShowcaseGameId) || filtered[0] || playableGames[0];
    if (heroGame) {
      currentShowcaseGameId = heroGame.id;
      updateShowcaseHero(heroGame);
    }

    if (libShowcaseRibbon) {
      libShowcaseRibbon.innerHTML = '';
      filtered.forEach(game => {
        const tile = document.createElement('div');
        tile.className = `showcase-ribbon-tile ${game.id === currentShowcaseGameId ? 'selected' : ''}`;
        tile.style.backgroundImage = `url('${game.art}')`;
        tile.title = `${game.title} (${game.badge})`;
        tile.tabIndex = 0;

        tile.addEventListener('mouseenter', () => {
          currentShowcaseGameId = game.id;
          SoundEngine.navigate();
          updateShowcaseHero(game);
          document.querySelectorAll('.showcase-ribbon-tile').forEach(t => t.classList.remove('selected'));
          tile.classList.add('selected');
        });

        tile.addEventListener('click', () => {
          currentShowcaseGameId = game.id;
          SoundEngine.confirm();
          launchPlayableGame(game.id);
        });
        libShowcaseRibbon.appendChild(tile);
      });
    }
  }

  // VIEW 3: PS5 Detailed Catalog Studio List
  else if (currentLibView === 'list') {
    if (libGrid) libGrid.style.display = 'none';
    if (libShowcaseContainer) libShowcaseContainer.style.display = 'none';
    if (libListContainer) libListContainer.style.display = 'grid';

    if (libListContainer) {
      libListContainer.innerHTML = '';
      filtered.forEach(game => {
        const item = document.createElement('div');
        item.className = 'lib-card-list-item';
        item.tabIndex = 0;
        item.innerHTML = `
          <div class="list-poster-img" style="background-image: url('${game.art}')"></div>
          <div class="list-info-col">
            <div>
              <div class="list-title">${game.title}</div>
              <div class="list-sub">${game.sub}</div>
              <p style="font-size: 11.5px; color: rgba(255,255,255,0.7); line-height: 1.35; margin-top: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${game.desc || ''}</p>
            </div>
            <div class="list-meta-row">
              <span class="poster-badge ${game.badgeClass || 'wasm'}">${game.badge}</span>
              <div class="poster-play-pill" style="opacity: 1; transform: none; padding: 4px 14px; font-size: 11.5px; margin-top: 0;">
                <span>▶</span> <span>Запустить</span>
              </div>
            </div>
          </div>
        `;
        item.addEventListener('click', () => {
          SoundEngine.confirm();
          launchPlayableGame(game.id);
        });
        libListContainer.appendChild(item);
      });
    }
  }
}

function openLibraryModal() {
  SoundEngine.confirm();
  const modalGameLibrary = document.getElementById('modalGameLibrary');
  const libSearchInput = document.getElementById('libSearchInput');
  if (modalGameLibrary) {
    renderPlayableLibrary(libSearchInput ? libSearchInput.value : '');
    modalGameLibrary.classList.add('active');
  }
}

function closeLibraryModal() {
  SoundEngine.back();
  const modalGameLibrary = document.getElementById('modalGameLibrary');
  if (modalGameLibrary) {
    modalGameLibrary.classList.remove('active');
  }
}

function launchPlayableGame(gameId) {
  const game = playableGames.find(g => g.id === gameId);
  if (!game) return;

  currentGameId = gameId;
  const gwGameTitle = document.getElementById('gwGameTitle');
  const gwBtnExternal = document.getElementById('gwBtnExternal');
  const gwHelperExternalLink = document.getElementById('gwHelperExternalLink');
  const genericGameFrame = document.getElementById('genericGameFrame');
  const inGameWindow = document.getElementById('inGameWindow');
  const gwHubDeck = document.getElementById('gwHubDeck');
  const gwHubBackdrop = document.getElementById('gwHubBackdrop');
  const gwHubTitle = document.getElementById('gwHubTitle');
  const gwHubDesc = document.getElementById('gwHubDesc');
  const gwHubBtnPlayExternal = document.getElementById('gwHubBtnPlayExternal');

  if (gwGameTitle) gwGameTitle.textContent = `${game.title} — ${game.sub}`;

  const targetUrl = game.url || 'https://joncodeofficial.github.io/gta-vice-city-wasm/';
  if (gwBtnExternal) gwBtnExternal.href = targetUrl;
  if (gwHelperExternalLink) gwHelperExternalLink.href = targetUrl;

  if (game.embedMode === 'hub') {
    // Show PS5 In-Game Hub Deck (avoids ERR_BLOCKED_BY_RESPONSE)
    if (genericGameFrame) {
      genericGameFrame.src = '';
      genericGameFrame.style.display = 'none';
    }
    if (gwHubDeck) {
      gwHubDeck.style.display = 'flex';
      if (gwHubBackdrop) gwHubBackdrop.style.backgroundImage = `url('${game.art}')`;
      if (gwHubTitle) gwHubTitle.textContent = game.title;
      if (gwHubDesc) gwHubDesc.textContent = game.desc || game.sub;
      if (gwHubBtnPlayExternal) gwHubBtnPlayExternal.href = targetUrl;
    }
  } else {
    // Direct seamless iframe embed (Vice City, DOOM, Quake, Minecraft)
    if (gwHubDeck) gwHubDeck.style.display = 'none';
    if (genericGameFrame) {
      genericGameFrame.style.display = 'block';
      genericGameFrame.src = targetUrl;
    }
  }

  closeLibraryModal();
  if (inGameWindow) inGameWindow.classList.add('active');
  isGameRunning = true;
  SoundEngine.launch();
}

function closeInGameWindow() {
  SoundEngine.back();
  const inGameWindow = document.getElementById('inGameWindow');
  const genericGameFrame = document.getElementById('genericGameFrame');
  const gwBtnFullscreen = document.getElementById('gwBtnFullscreen');
  const gwHubDeck = document.getElementById('gwHubDeck');

  if (inGameWindow) {
    inGameWindow.classList.remove('active');
    inGameWindow.classList.remove('fullscreen');
  }
  isFullscreenMode = false;
  if (gwBtnFullscreen) gwBtnFullscreen.textContent = '⛶';
  isGameRunning = false;
  if (genericGameFrame) genericGameFrame.src = '';
  if (gwHubDeck) gwHubDeck.style.display = 'none';
}

function toggleGameFullscreen() {
  const inGameWindow = document.getElementById('inGameWindow');
  const gwBtnFullscreen = document.getElementById('gwBtnFullscreen');
  isFullscreenMode = !isFullscreenMode;
  if (inGameWindow) inGameWindow.classList.toggle('fullscreen', isFullscreenMode);
  if (gwBtnFullscreen) gwBtnFullscreen.textContent = isFullscreenMode ? '❐' : '⛶';
  SoundEngine.confirm();
}

// Wire Global Listeners for Game Library & In-Game Viewport
document.addEventListener('DOMContentLoaded', () => {
  const btnLibClose = document.getElementById('btnLibClose');
  if (btnLibClose) btnLibClose.addEventListener('click', closeLibraryModal);

  document.querySelectorAll('.lib-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lib-view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLibView = btn.dataset.view;
      SoundEngine.navigate();
      const libSearchInput = document.getElementById('libSearchInput');
      renderPlayableLibrary(libSearchInput ? libSearchInput.value : '');
    });
  });

  const libSearchInput = document.getElementById('libSearchInput');
  if (libSearchInput) {
    libSearchInput.addEventListener('input', (e) => {
      renderPlayableLibrary(e.target.value);
    });
  }

  const gwBtnClose = document.getElementById('gwBtnClose');
  if (gwBtnClose) gwBtnClose.addEventListener('click', closeInGameWindow);

  const gwBtnFullscreen = document.getElementById('gwBtnFullscreen');
  if (gwBtnFullscreen) gwBtnFullscreen.addEventListener('click', toggleGameFullscreen);

  const gwHubBtnTryIframe = document.getElementById('gwHubBtnTryIframe');
  if (gwHubBtnTryIframe) {
    gwHubBtnTryIframe.addEventListener('click', () => {
      const game = playableGames.find(g => g.id === currentGameId);
      const genericGameFrame = document.getElementById('genericGameFrame');
      const gwHubDeck = document.getElementById('gwHubDeck');
      if (game && genericGameFrame) {
        if (gwHubDeck) gwHubDeck.style.display = 'none';
        genericGameFrame.style.display = 'block';
        genericGameFrame.src = game.url;
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (isGameRunning) {
      const k = e.key.toLowerCase();
      if (k === 'f') {
        e.preventDefault();
        toggleGameFullscreen();
      } else if (k === 'escape') {
        e.preventDefault();
        closeInGameWindow();
      }
    } else {
      const modalGameLibrary = document.getElementById('modalGameLibrary');
      if (modalGameLibrary && modalGameLibrary.classList.contains('active')) {
        if (e.key === 'Escape') {
          e.preventDefault();
          closeLibraryModal();
        }
      }
    }
  });
});

// ============================================================
// Action Dispatcher, Clipboard & Toasts
// ============================================================
function showToast(title, message, icon = PS5Icons.controller) {
  const container = $("#toastContainer");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = "ps5-toast";
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div>
      <span class="toast-title">${title}</span>
      <span class="toast-msg">${message}</span>
    </div>
  `;
  container.appendChild(toast);
  SoundEngine.chime();
  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 260);
  }, 3400);
}

async function copyToClipboard(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("PlayStation®5", `${label} скопировано в буфер обмена`, PS5Icons.check);
  } catch {
    showToast("Контакт", text, PS5Icons.info);
  }
}

function handleAction(action) {
  if (!action) return;
  if (action === "home_reset") {
    closeModal();
    if (state.category !== "games") switchCategory("games");
    return selectTile("welcome", true);
  }
  if (action === "sound_mute") {
    closeModal();
    SoundEngine.toggle();
    return updateMuteButtonUI();
  }
  if (action === "toggle:ambient") {
    const playing = SoundEngine.toggleAmbient();
    return showToast("Музыка PS5", playing ? "Воспроизведение Emaj9 включено" : "Пауза", PS5Icons.music);
  }
  if (action === "open:settings") return openSettings();
  if (action === "open:cc") return toggleControlCenter();
  if (action === "power") return openPowerModal();
  if (action === "mic") return toggleMic();
  if (action === "sound") return openSoundModal();
  if (action === "accessories") return openAccessoriesModal();
  if (action === "gamebase") return openGameBaseModal();
  if (action === "notifications") return openNotificationsModal();
  if (action === "switcher") return openSwitcherModal();
  if (action === "edit_widgets") return openEditWidgetsModal();
  if (action === "open:explore") {
    closeModal();
    if (state.category !== "games") switchCategory("games");
    return selectTile("explore", true);
  }
  if (action === "modal:psn") return openPSNModal();
  if (action === "modal:library") return openLibraryModal();

  const mapByAction = {
    "modal:slot-1": "slot-01",
    "modal:slot-2": "slot-02",
    "modal:slot-3": "slot-03",
    "modal:media-gallery": "media-gallery",
    "modal:media-slot-1": "media-slot-1",
    "modal:media-slot-2": "media-slot-2"
  };
  const allItems = [...ribbonCatalog.games, ...ribbonCatalog.media];
  const found = allItems.find((i) => i.id === mapByAction[action]) || getActiveItem();
  if (found?.modalData) {
    openModal({
      tag: found.modalData.badge,
      title: found.modalData.title,
      subtitle: found.modalData.subtitle,
      content: found.modalData.content,
      actions: found.modalData.actions
    });
  } else {
    openPSNModal();
  }
}

function updateClock() {
  const now = new Date();
  const clockEl = $("#ps5Clock");
  if (!clockEl) return;
  if (state.lang === "en") {
    clockEl.textContent = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  } else {
    clockEl.textContent = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  }
}

function updateMuteButtonUI() {
  const btn = $("#muteBtn");
  const icon = $("#muteIcon");
  if (!btn || !icon) return;
  icon.innerHTML = SoundEngine.muted ? PS5Icons.soundMuted : PS5Icons.soundOn;
  btn.classList.toggle("is-muted", SoundEngine.muted);
}

// ============================================================
// Keyboard, Wheel & Context Events
// ============================================================
function toggleContextMenu() {
  const menu = $("#contextMenu");
  menu.classList.toggle("active");
  menu.setAttribute("aria-hidden", String(!menu.classList.contains("active")));
  SoundEngine.navigate();
}

function closeContextMenu() {
  const menu = $("#contextMenu");
  menu.classList.remove("active");
  menu.setAttribute("aria-hidden", "true");
}

function handleKeydown(e) {
  const sberOpen = $("#modalSberTips") && $("#modalSberTips").classList.contains("active");
  const modalOpen = $("#modalOverlay").classList.contains("active");
  const searchOpen = $("#searchOverlay").classList.contains("active");
  const settingsOpen = $("#settingsOverlay").classList.contains("active");

  if (e.key === "Escape") {
    e.preventDefault();
    if (sberOpen) return closeSberTips();
    if (modalOpen) return closeModal();
    if (searchOpen) return closeSearch();
    if (settingsOpen) return closeSettings();
    if (state.isControlCenterOpen) return closeControlCenter();
    if (state.isHubOpen) return closeGameHub();
    return selectTile("welcome", true);
  }

  if (sberOpen || modalOpen || searchOpen || settingsOpen) return;

  if (e.key === " ") {
    e.preventDefault();
    return toggleControlCenter();
  }
  if (e.key === "/") {
    e.preventDefault();
    return openSearch();
  }
  if (e.key === "Tab") {
    e.preventDefault();
    return switchCategory(state.category === "games" ? "media" : "games");
  }

  const list = getCurrentList();
  const idx = list.findIndex((it) => it.id === state.activeId);

  if (e.key === "ArrowRight") {
    e.preventDefault();
    if (!state.isHubOpen) selectTile(list[(idx + 1) % list.length].id, true);
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    if (!state.isHubOpen) selectTile(list[(idx - 1 + list.length) % list.length].id, true);
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (!state.isHubOpen) openGameHub();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (state.isHubOpen) closeGameHub();
  } else if (e.key === "Enter") {
    const active = getActiveItem();
    if (active?.viewType === "game" && document.activeElement === document.body) {
      e.preventDefault();
      handleAction(active.btnAction || "modal:psn");
    }
  }
}

function setupWelcomeHubScroll() {
  const track = $("#ps5BentoTrack");
  const leftBtn = $("#ps5ChevronLeft");
  const rightBtn = $("#ps5ChevronRight");
  if (!track || !leftBtn || !rightBtn) return;

  const cols = Array.from(track.querySelectorAll(".ps5-bento-col"));

  const getColsPerPage = () => {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1180) return 2;
    return 3;
  };

  const getColTarget = (index) => {
    if (!cols[index]) return 0;
    return Math.max(0, cols[index].offsetLeft);
  };

  const getColPositions = () => cols.map((_, i) => getColTarget(i));

  const updateUI = () => {
    const sl = track.scrollLeft;
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const isAtStart = sl <= 12;
    const isAtEnd = sl >= maxScroll - 16;

    leftBtn.classList.toggle("is-disabled", isAtStart);
    rightBtn.classList.toggle("is-disabled", isAtEnd);
  };

  // Chevron Right: Advance to next page of columns (1:1 PS5 System Carousel)
  rightBtn.addEventListener("click", () => {
    SoundEngine.navigate();
    const sl = track.scrollLeft;
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const perPage = getColsPerPage();
    const positions = getColPositions();
    const currIdx = positions.findIndex((pos) => pos >= sl - 12);
    const targetIdx = Math.min(cols.length - 1, (currIdx >= 0 ? currIdx : 0) + perPage);
    const nextPos = getColTarget(targetIdx);
    if (nextPos < maxScroll - 16) {
      track.scrollTo({ left: nextPos, behavior: "smooth" });
    } else {
      track.scrollTo({ left: maxScroll, behavior: "smooth" });
    }
  });

  // Chevron Left: Retreat to previous page of columns (1:1 PS5 System Carousel)
  leftBtn.addEventListener("click", () => {
    SoundEngine.navigate();
    const sl = track.scrollLeft;
    const perPage = getColsPerPage();
    const positions = getColPositions();
    const currIdx = positions.findIndex((pos) => pos >= sl - 12);
    const targetIdx = Math.max(0, (currIdx >= 0 ? currIdx : 0) - perPage);
    const prevPos = getColTarget(targetIdx);
    if (prevPos > 16) {
      track.scrollTo({ left: prevPos, behavior: "smooth" });
    } else {
      track.scrollTo({ left: 0, behavior: "smooth" });
    }
  });

  track.addEventListener("scroll", updateUI, { passive: true });
  window.addEventListener("resize", updateUI);

  // Mouse Drag-to-Scroll with Direct 1:1 Movement & Momentum
  let isDown = false;
  let startX = 0;
  let scrollStart = 0;
  let dragDistance = 0;
  let lastX = 0;
  let lastTime = 0;
  let velocity = 0;

  track.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    isDown = true;
    dragDistance = 0;
    startX = e.pageX;
    scrollStart = track.scrollLeft;
    lastX = e.pageX;
    lastTime = performance.now();
    velocity = 0;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    const now = performance.now();
    const dt = now - lastTime;
    const dx = e.pageX - lastX;
    if (dt > 8) {
      velocity = dx / dt;
      lastX = e.pageX;
      lastTime = now;
    }

    const deltaX = e.pageX - startX;
    dragDistance = Math.abs(deltaX);
    if (dragDistance > 6) {
      track.classList.add("is-dragging");
    }
    track.scrollLeft = scrollStart - deltaX;
  });

  window.addEventListener("mouseup", () => {
    if (!isDown) return;
    isDown = false;
    track.classList.remove("is-dragging");

    if (dragDistance > 15 && Math.abs(velocity) > 0.35) {
      const sl = track.scrollLeft;
      const positions = getColPositions();
      if (velocity < 0) {
        const next = positions.find((p) => p > sl + 20);
        if (next !== undefined) track.scrollTo({ left: next, behavior: "smooth" });
      } else {
        const prev = [...positions].reverse().find((p) => p < sl - 20);
        if (prev !== undefined) track.scrollTo({ left: prev, behavior: "smooth" });
      }
    }

    setTimeout(() => {
      dragDistance = 0;
    }, 60);
  });

  // Prevent widget click during swipe
  track.querySelectorAll(".ps5-widget").forEach((w) => {
    w.addEventListener(
      "click",
      (e) => {
        if (dragDistance > 8) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true
    );
  });

  // Wheel & Trackpad: Pass through native horizontal gestures; translate pure vertical mouse wheel to column scroll
  const welcomeView = $("#ps5WelcomeView");
  if (welcomeView) {
    welcomeView.addEventListener(
      "wheel",
      (e) => {
        if (Math.abs(e.deltaX) > 2) {
          return;
        }
        if (Math.abs(e.deltaY) > 6 && track.scrollWidth > track.clientWidth) {
          e.preventDefault();
          const sl = track.scrollLeft;
          const maxScroll = track.scrollWidth - track.clientWidth;
          const positions = getColPositions();
          if (e.deltaY > 0 && sl < maxScroll - 4) {
            const next = positions.find((p) => p > sl + 15);
            if (next !== undefined) track.scrollTo({ left: next, behavior: "smooth" });
            else track.scrollBy({ left: 320, behavior: "smooth" });
          } else if (e.deltaY < 0 && sl > 4) {
            const prev = [...positions].reverse().find((p) => p < sl - 15);
            if (prev !== undefined) track.scrollTo({ left: prev, behavior: "smooth" });
            else track.scrollBy({ left: -320, behavior: "smooth" });
          }
        }
      },
      { passive: false }
    );
  }

  updateUI();
}

/* =========================================================================
   DONATIONALERTS CONTROLLER & LIVE NOTIFICATIONS LISTENER
   ========================================================================= */
let sberConfig = {
  service: 'donationalerts',
  widget_token: '32rEFTeFPQ0WB6FEWKyo',
  target_url: 'https://www.donationalerts.com/r/cr1mnsx',
  nickname: 'cr1mnsx',
  dynamic_url: window.location.origin + '/donate'
};

class DonationAlertsLiveListener {
  constructor(token) {
    this.token = token;
    this.ws = null;
    this.pingTimer = null;
    this.connected = false;
  }

  connect() {
    if (!this.token || this.connected) return;
    try {
      this.ws = new WebSocket('wss://socket7.donationalerts.com/socket.io/?EIO=3&transport=websocket');
      this.ws.onopen = () => {
        this.connected = true;
      };
      this.ws.onmessage = (event) => {
        const msg = event.data;
        if (typeof msg !== 'string') return;
        if (msg.startsWith('0{')) {
          this.ws.send('2probe');
        } else if (msg === '3probe') {
          this.ws.send('5');
          this.ws.send('42["add-user",{"token":"' + this.token + '","type":"alert_widget"}]');
          this.startPing();
        } else if (msg.startsWith('42["donation"')) {
          try {
            const parsed = JSON.parse(msg.slice(2));
            const data = typeof parsed[1] === 'string' ? JSON.parse(parsed[1]) : parsed[1];
            const name = data.username || 'Аноним';
            const amount = data.amount || '';
            const currency = data.currency || 'RUB';
            const text = data.message ? ` — "${data.message}"` : '';
            showToast("🎁 Донат DonationAlerts!", `${name}: ${amount} ${currency}${text}`, PS5Icons.star);
          } catch (e) {
            console.warn('Donation parse error:', e);
          }
        }
      };
      this.ws.onclose = () => {
        this.connected = false;
        clearInterval(this.pingTimer);
        setTimeout(() => this.connect(), 20000);
      };
      this.ws.onerror = () => {
        try { this.ws.close(); } catch (_) {}
      };
    } catch (e) {
      console.warn('DA WS error:', e);
    }
  }

  startPing() {
    clearInterval(this.pingTimer);
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send('2');
      }
    }, 20000);
  }
}

let daLiveListener = null;

function renderSberQr(url) {
  const container = $("#sberQrContainer");
  if (!container) return;
  try {
    if (typeof qrcode === 'function') {
      const qr = qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      container.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
    } else {
      container.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}" alt="QR Code" style="width:100%;height:100%;border-radius:8px;">`;
    }
  } catch (e) {
    console.error('QR generation error:', e);
  }
}

async function loadSberConfig() {
  try {
    let res = await fetch('/api/donate-config');
    if (!res.ok) {
      res = await fetch('./donate_config.json');
    }
    if (res.ok) {
      const data = await res.json();
      sberConfig = Object.assign(sberConfig, data);
    }
  } catch (e) {
    try {
      const resFallback = await fetch('./donate_config.json');
      if (resFallback.ok) {
        const data = await resFallback.json();
        sberConfig = Object.assign(sberConfig, data);
      }
    } catch (_) {}
  }

  const input = $("#inputSberUrl");
  if (input) input.value = sberConfig.target_url || 'https://www.donationalerts.com/r/cr1mnsx';
  const author = $("#sberAuthorName");
  if (author && sberConfig.nickname) {
    author.textContent = `Получатель: @${sberConfig.nickname} (DonationAlerts)`;
  }

  const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port === '8090';
  const qrTarget = (isLocalHost && sberConfig.dynamic_url) ? sberConfig.dynamic_url : (sberConfig.target_url || 'https://www.donationalerts.com/r/cr1mnsx');
  renderSberQr(qrTarget);

  const directBtn = $("#btnSberPayDirect");
  if (directBtn) {
    directBtn.href = sberConfig.target_url || 'https://www.donationalerts.com/r/cr1mnsx';
  }

  if (sberConfig.widget_token && !daLiveListener) {
    daLiveListener = new DonationAlertsLiveListener(sberConfig.widget_token);
    daLiveListener.connect();
  }
}

export function openSberTips() {
  SoundEngine.confirm();
  const modal = $("#modalSberTips");
  if (modal) {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
  }
  loadSberConfig();
}

export function closeSberTips() {
  SoundEngine.back();
  const modal = $("#modalSberTips");
  if (modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }
}

function initSberTips() {
  const btn = $("#btnSberTips");
  if (btn) btn.addEventListener("click", openSberTips);

  const closeBtn = $("#btnSberClose");
  if (closeBtn) closeBtn.addEventListener("click", closeSberTips);

  const backdrop = $("#sberTipsBackdrop");
  if (backdrop) backdrop.addEventListener("click", closeSberTips);

  const presetsRow = $("#sberPresetsRow");
  if (presetsRow) {
    presetsRow.addEventListener("click", (e) => {
      const b = e.target.closest(".sber-preset-btn");
      if (!b) return;
      presetsRow.querySelectorAll(".sber-preset-btn").forEach(item => item.classList.remove("active"));
      b.classList.add("active");
      SoundEngine.tick();
    });
  }

  const copyBtn = $("#btnSberCopyLink");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const donateUrl = sberConfig.dynamic_url || (window.location.origin + '/donate');
      try {
        await navigator.clipboard.writeText(donateUrl);
        SoundEngine.confirm();
        const copyText = $("#sberCopyBtnText");
        if (copyText) copyText.textContent = "✓ Скопировано!";
        setTimeout(() => {
          if (copyText) copyText.textContent = "Скопировать ссылку";
        }, 2400);
      } catch (err) {
        prompt("Ссылка для доната:", donateUrl);
      }
    });
  }

  const toggleSettings = $("#btnToggleSberSettings");
  const panel = $("#sberSettingsPanel");
  const caret = $("#sberSettingsCaret");
  if (toggleSettings && panel) {
    toggleSettings.addEventListener("click", () => {
      const isOpen = panel.style.display !== "none";
      panel.style.display = isOpen ? "none" : "block";
      if (caret) caret.classList.toggle("open", !isOpen);
      SoundEngine.tick();
    });
  }

  const saveBtn = $("#btnSaveSberUrl");
  const urlInput = $("#inputSberUrl");
  const statusEl = $("#sberSaveStatus");
  if (saveBtn && urlInput) {
    saveBtn.addEventListener("click", async () => {
      const newUrl = urlInput.value.trim();
      if (!newUrl) return;
      SoundEngine.tick();
      try {
        const res = await fetch('/api/donate-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target_url: newUrl })
        });
        const resData = await res.json();
        if (resData.ok) {
          SoundEngine.confirm();
          sberConfig.target_url = newUrl;
          if (statusEl) {
            statusEl.style.display = "block";
            statusEl.textContent = "✓ Ссылка сохранена! Перенаправление обновлено.";
            setTimeout(() => { statusEl.style.display = "none"; }, 3000);
          }
        }
      } catch (err) {
        alert("Ошибка при сохранении: " + err.message);
      }
    });
  }
}

function init() {
  particleEngine = new PS5ParticleEngine($("#ps5Particles"));
  particleEngine.start();

  hydrateStaticIcons();
  applyLanguageAndTelemetry();
  setupWelcomeHubScroll();
  initSberTips();

  $("#tabGames").addEventListener("click", () => switchCategory("games"));
  $("#tabMedia").addEventListener("click", () => switchCategory("media"));

  $("#btnLangToggle").addEventListener("click", () => {
    state.lang = state.lang === "ru" ? "en" : "ru";
    SoundEngine.confirm();
    applyLanguageAndTelemetry();
  });

  $("#btnPS")?.addEventListener("click", toggleControlCenter);
  $("#btnEditWidgets")?.addEventListener("click", openEditWidgetsModal);
  $("#ps5ControllerHints")?.addEventListener("click", (e) => {
    const hint = e.target.closest(".c-hint");
    if (!hint) return;
    const act = hint.dataset.action;
    if (act === "cc") toggleControlCenter();
    else if (act === "search") openSearch();
    else if (act === "select") {
      const active = getActiveItem();
      if (active?.viewType === "game") openGameHub();
      else if (active?.btnAction) handleAction(active.btnAction);
    } else if (act === "back") {
      if (state.isControlCenterOpen) closeControlCenter();
      else if (state.isHubOpen) closeGameHub();
      else closeModal();
    } else if (act === "tab") {
      switchCategory(state.category === "games" ? "media" : "games");
    }
  });
  $("#muteBtn").addEventListener("click", () => {
    SoundEngine.toggle();
    updateMuteButtonUI();
    showToast("Аудио PS5", SoundEngine.muted ? "Звук выключен" : "Звук включен", SoundEngine.muted ? PS5Icons.soundMuted : PS5Icons.soundOn);
  });
  $("#btnSearch").addEventListener("click", openSearch);
  $("#btnNotifications")?.addEventListener("click", () => {
    SoundEngine.chime();
    showToast("Уведомления PSN", "Загрузка Marvel's Spider-Man 2 завершена · 4 друга в сети", PS5Icons.star);
  });
  $("#btnContinuePlaying")?.addEventListener("click", () => {
    SoundEngine.playStart();
    selectTile("spiderman", true);
  });
  $("#btnSettings").addEventListener("click", openSettings);
  $("#btnProfile").addEventListener("click", () => handleAction("modal:psn"));

  // Welcome Hub Bento Widget Clicks
  $("#widgetFriends")?.addEventListener("click", () => openPSNModal());
  $("#widgetStore")?.addEventListener("click", () => selectTile("store", true));
  $("#widgetAccessibility")?.addEventListener("click", () => {
    state.settingsSection = "language";
    openSettings();
  });
  $("#widgetTrophies")?.addEventListener("click", () => openPSNModal());
  $("#widgetBattery")?.addEventListener("click", () => {
    state.settingsSection = "accessories";
    openSettings();
  });
  $("#widgetWishlist")?.addEventListener("click", () => selectTile("rdr2", true));
  $("#widgetFriendActivity")?.addEventListener("click", () => selectTile("explore", true));
  $("#widgetNetworkStatus")?.addEventListener("click", () => {
    state.settingsSection = "accounts";
    openSettings();
  });
  $("#widgetMediaGallery")?.addEventListener("click", () => {
    if (state.category !== "media") switchCategory("media");
    selectTile("media-gallery", true);
  });
  $("#widgetCustomSlot")?.addEventListener("click", () => handleAction("modal:slot-1"));
  $("#widgetPsPlus")?.addEventListener("click", () => selectTile("store", true));
  $("#widgetRemotePlay")?.addEventListener("click", () => {
    state.settingsSection = "remote";
    openSettings();
  });

  // Game Hero / Hub Interactions
  $("#heroTrophySummary").addEventListener("click", () => openPSNModal());
  $("#scrollDownCue").addEventListener("click", openGameHub);
  $("#scrollUpCue").addEventListener("click", closeGameHub);
  $("#btnOptionsMenu").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleContextMenu();
  });

  $("#contextMenu")
    .querySelectorAll(".ps5-context-item")
    .forEach((btn) =>
      btn.addEventListener("click", () => {
        closeContextMenu();
        const act = btn.dataset.action;
        const active = getActiveItem();
        if (act === "info") handleAction(active.btnAction || "modal:psn");
        else if (act === "share") copyToClipboard(window.location.href, "Ссылка");
        else if (act === "fav") showToast("Избранное", `Закреплено: ${t(active.title)}`, PS5Icons.star);
      })
    );

  // Control Center cards
  $("#ccBtnResume").addEventListener("click", () => {
    closeControlCenter();
    handleAction(getActiveItem().btnAction || "modal:psn");
  });
  $("#ccBtnProfile").addEventListener("click", () => handleAction("modal:psn"));
  $("#ccMusicToggle").addEventListener("click", () => {
    const playing = SoundEngine.toggleAmbient();
    showToast("Музыка PS5", playing ? "Воспроизведение включено" : "Пауза", PS5Icons.music);
  });
  $("#ccMusicVolume").addEventListener("input", (e) => SoundEngine.setMusicVolume(parseFloat(e.target.value)));

  // Overlays Close
  $("#searchCloseBtn").addEventListener("click", closeSearch);
  $("#searchInput").addEventListener("input", (e) => renderSearchResults(e.target.value));
  $("#settingsCloseBtn").addEventListener("click", closeSettings);
  $("#modalCloseBtn").addEventListener("click", closeModal);

  ["#modalOverlay", "#searchOverlay", "#settingsOverlay"].forEach((sel) => {
    $(sel).addEventListener("click", (e) => {
      if (e.target === $(sel)) {
        closeModal();
        closeSearch();
        closeSettings();
      }
    });
  });

  $("#controlCenterOverlay").addEventListener("click", (e) => {
    if (e.target === $("#controlCenterOverlay")) closeControlCenter();
  });

  window.addEventListener("click", (e) => {
    if (!$("#contextMenu").contains(e.target) && e.target !== $("#btnOptionsMenu")) {
      closeContextMenu();
    }
  });

  window.addEventListener("keydown", handleKeydown);
  window.addEventListener(
    "wheel",
    (e) => {
      if (state.isControlCenterOpen || $("#searchOverlay").classList.contains("active") || $("#settingsOverlay").classList.contains("active") || $("#modalOverlay").classList.contains("active")) return;
      if (e.deltaY > 36 && !state.isHubOpen) openGameHub();
      else if (e.deltaY < -36 && state.isHubOpen && $("#stageGameHub").scrollTop <= 0) closeGameHub();
    },
    { passive: true }
  );

  setInterval(updateClock, 10000);
}

document.addEventListener("DOMContentLoaded", init);

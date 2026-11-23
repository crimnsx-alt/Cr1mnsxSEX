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
import { FriendsService, PRESET_AVATARS, escapeHtml } from "./friends-service.js";
import { psnService } from "./psn-service.js";
import { SoundEngine } from "./sound.js";
import {
  PS5_SOUND_CATALOG,
  PS5_SOUND_MANIFEST_STATS,
  PS5_SOUND_CATEGORIES,
  getSoundEntry
} from "./sound-catalog.js";
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
  widgetPreset: "default",
  trophyFilter: "all",
  trophySearch: "",
  activeGameDetailId: null,
  soundLibrarySearch: "",
  soundLibraryFilter: "all"
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
  $("#iconProfileAvatar").innerHTML = `<div class="ps5-topbar-avatar-circle" style="width:100%; height:100%; border-radius:50%; background:linear-gradient(135deg, #0284c7, #1e3a8a); display:flex; align-items:center; justify-content:center; color:#ffffff;">${PS5Icons.profile}</div>`;
  $("#iconChevronLeft").innerHTML = PS5Icons.chevronLeft;
  if ($("#iconChevronRight")) $("#iconChevronRight").innerHTML = PS5Icons.chevronRight;

  $("#iconFriendsHeader").innerHTML = PS5Icons.gamebase;
  $("#iconStoreMini").innerHTML = PS5Icons.psStoreBag;
  $("#iconAccHeader").innerHTML = PS5Icons.accessibility;
  $("#iconAccEmblem").innerHTML = PS5Icons.accessibilityEmblem;
  $("#iconTrophyHeader").innerHTML = PS5Icons.trophy;
  if ($("#iconStorageHeader")) $("#iconStorageHeader").innerHTML = PS5Icons.storage;
  if ($("#iconTpHeader")) $("#iconTpHeader").innerHTML = PS5Icons.trophy;

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
  renderWelcomeWishlist();
  updateNetworkWidgetStatus();
  renderWelcomeBatteryRings();
  renderControllerHints();
  updateMuteButtonUI();
}

let selectedAvatarId = PRESET_AVATARS[0].id;
let isOwnerUnlocked = false;

async function renderWelcomeFriends() {
  const container = $("#welcomeFriendsContent");
  if (!container) return;

  const friends = await FriendsService.getConfirmedFriends();
  const countBadge = $("#lblFriendsCount");
  if (countBadge) {
    countBadge.textContent = friends.length.toString();
  }

  // Update pending request badge if user has one
  const myReq = FriendsService.getMyRequest();
  const reqBadge = $("#reqPendingBadge");
  if (reqBadge) {
    if (myReq && myReq.status === "pending") {
      reqBadge.hidden = false;
      reqBadge.textContent = "1";
    } else {
      reqBadge.hidden = true;
    }
  }

  if (!friends || friends.length === 0) {
    container.innerHTML = `
      <div class="ps5-friends-empty">
        <div class="ps5-fe-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <p class="ps5-fe-title">Здесь пока нет друзей</p>
        <p class="ps5-fe-desc">Добавь свой первый контакт и играйте вместе</p>
        <button type="button" class="ps5-btn-empty-add" id="btnEmptyAddFriend">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          <span>Добавить друга</span>
        </button>
      </div>
    `;
    const btnEmpty = $("#btnEmptyAddFriend");
    if (btnEmpty) {
      btnEmpty.onclick = (e) => {
        e.stopPropagation();
        openAddFriendModal();
      };
    }
    return;
  }

  // Render confirmed friends chips
  container.innerHTML = `
    <div class="ps5-friends-avatars">
      ${friends.map((f) => {
        const av = PRESET_AVATARS.find((a) => a.id === f.avatar) || PRESET_AVATARS[0];
        const hasSocials = f.consent_public_contacts && (f.steam || f.telegram || f.vk || f.discord || f.psnId);
        return `
          <div class="ps5-friend-chip" data-id="${f.id}" tabindex="0" role="button" title="${escapeHtml(f.displayName)} (@${escapeHtml(f.nickname)})">
            <div class="ps5-friend-avatar-item" style="background: ${av.bg};">
              <span>${av.icon}</span>
              <span class="ps5-friend-avatar-dot"></span>
            </div>
            <div class="ps5-friend-meta">
              <div class="ps5-friend-name-row">
                <span class="ps5-friend-name">${escapeHtml(f.displayName)}</span>
                <span class="ps5-friend-handle">@${escapeHtml(f.nickname)}</span>
              </div>
              <span class="ps5-friend-game">${escapeHtml(f.currentGame || "PlayStation®5")}</span>
            </div>
            ${hasSocials ? `
              <div class="ps5-friend-socials-badge" title="Есть подтвержденные контакты">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.28 2.69 7.93 6.46 9.35l2.42-3.48A4.974 4.974 0 0 1 10 15c0-.62.12-1.22.33-1.77L7.4 11.2a2.49 2.49 0 0 1-1.4.42c-1.38 0-2.5-1.12-2.5-2.5S4.62 6.62 6 6.62s2.5 1.12 2.5 2.5c0 .32-.06.63-.18.91l2.94 2.1c.45-.18.94-.28 1.46-.28.47 0 .91.08 1.33.23l2.84-4.08A4.983 4.983 0 0 1 17 5c2.76 0 5 2.24 5 5s-2.24 5-5 5c-.75 0-1.46-.17-2.1-.47l-3.32 4.77C11.72 19.34 11.86 19.38 12 19.38c4.07 0 7.38-3.31 7.38-7.38S16.07 2 12 2z"/></svg>
              </div>
            ` : ""}
          </div>
        `;
      }).join("")}
    </div>
  `;

  // Click on a friend chip opens their public profile popup
  container.querySelectorAll(".ps5-friend-chip").forEach((chip) => {
    chip.onclick = (e) => {
      e.stopPropagation();
      const fid = chip.dataset.id;
      const fr = friends.find((item) => item.id === fid);
      if (fr) openFriendProfileModal(fr);
    };
  });
}

// ============================================================
// ELITE UI MASTER: NumberFlow Odometer & Spring Animations
// ============================================================
function animateNumberFlow(element, targetValue, options = {}) {
  if (!element) return;
  const target = Number(targetValue) || 0;
  const duration = options.duration || 950;
  const prefix = options.prefix || "";
  const suffix = options.suffix || "";
  const formatter = options.formatter;

  const prev = typeof element._numFlowVal === "number" ? element._numFlowVal : null;
  element._numFlowVal = target;

  if (prev === null || prev === target) {
    element.textContent = formatter ? formatter(target) : `${prefix}${target.toLocaleString()}${suffix}`;
    return;
  }

  const startVal = prev;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Framer spring-like exponential deceleration:
    const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const curr = Math.round(startVal + (target - startVal) * ease);

    element.textContent = formatter ? formatter(curr) : `${prefix}${curr.toLocaleString()}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = formatter ? formatter(target) : `${prefix}${target.toLocaleString()}${suffix}`;
    }
  }

  requestAnimationFrame(step);
}

// ============================================================
// ELITE UI MASTER: Aceternity / Magic UI Spotlight Cursor Mesh
// ============================================================
function initSpotlightCards() {
  const container = document.getElementById("ps5BentoViewport");
  if (!container) return;

  container.addEventListener("pointermove", (e) => {
    const widgets = container.querySelectorAll(".ps5-widget");
    for (let i = 0; i < widgets.length; i++) {
      const w = widgets[i];
      const rect = w.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      w.style.setProperty("--mouse-x", `${x}px`);
      w.style.setProperty("--mouse-y", `${y}px`);
    }
  }, { passive: true });
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
                stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${circumference.toFixed(1)}"
                data-target-offset="${offset}" />
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

  // Staggered sweep animation
  requestAnimationFrame(() => {
    const rings = box.querySelectorAll(".ps5-ring-progress");
    rings.forEach((ring, idx) => {
      setTimeout(() => {
        const target = ring.getAttribute("data-target-offset");
        if (target) ring.style.strokeDashoffset = target;
      }, 60 + idx * 100);
    });
  });
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
  const tipsSpan = $("#btnSberTips")?.querySelector("span");
  if (tipsSpan) {
    tipsSpan.textContent = state.lang === "ru" ? "Донат" : "Donate";
  }
  if ($("#btnSberTips")) {
    $("#btnSberTips").title = state.lang === "ru" ? "DonationAlerts · Поддержать автора" : "DonationAlerts · Support Project";
  }
  $("#lblOnlineFriends").textContent = S("onlineFriends");
  $("#lblAccessibility").textContent = S("accessibility");
  $("#lblAccessibilityDesc").textContent = S("accessibilityDesc");
  $("#lblTrophies").textContent = S("trophies");
  $("#lblStoreShowcaseTitle").textContent = S("storeFeaturedTitle");
  $("#lblStoreShowcaseSub").textContent = S("storeFeaturedSub");
  if ($("#lblConsoleStorage")) $("#lblConsoleStorage").textContent = S("consoleStorage");
  if ($("#lblStorageFree")) $("#lblStorageFree").textContent = S("storageFreeHint");
  if ($("#lblWishlistTitle")) $("#lblWishlistTitle").textContent = S("wishlistTitle");
  const wlItems = getWishlistItems();
  if ($("#lblWishlistCount")) $("#lblWishlistCount").textContent = formatGamePlural(wlItems.length, state.lang === "ru");
  if ($("#lblWishlistHint")) $("#lblWishlistHint").textContent = S("wishlistDiscountHint");
  if ($("#lblTrophyProgressTitle")) $("#lblTrophyProgressTitle").textContent = S("trophyProgressTitle");
  const libTitleEl = document.querySelector(".lib-main-title");
  if (libTitleEl) {
    libTitleEl.innerHTML = `${state.lang === "ru" ? "Библиотека игр" : "Game Library"} <span style="font-size: 18px; color: rgba(255, 255, 255, 0.5); font-weight: 500; margin-left: 8px;">(${playableGames.length})</span>`;
  }
  const heroSubEl = $("#lblWelcomeHeroSub");
  if (heroSubEl) {
    heroSubEl.textContent = state.lang === "ru"
      ? "PlayStation®5 System Software · Интерактивная веб-оболочка Welcome Hub"
      : "PlayStation®5 System Software · Interactive Welcome Hub Shell";
  }
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

  // System PS5 Trophies into Welcome Hub Trophies Card (Real PSN Data)
  const prof = psnService.profile;
  const total = prof ? prof.totalTrophies : defaultProfileTelemetry.totalTrophies;
  const level = prof ? prof.trophyLevel : defaultProfileTelemetry.level;
  const pct = prof ? prof.levelProgress : defaultProfileTelemetry.progressPct;
  const plat = prof ? prof.platinum : defaultProfileTelemetry.trophies.platinum;
  const gold = prof ? prof.gold : defaultProfileTelemetry.trophies.gold;
  const silver = prof ? prof.silver : defaultProfileTelemetry.trophies.silver;
  const bronze = prof ? prof.bronze : defaultProfileTelemetry.trophies.bronze;

  animateNumberFlow($("#ps5TrophiesTotal"), total, { prefix: `${S("totalPrefix")}: ` });
  animateNumberFlow($("#ps5CountPlat"), plat);
  animateNumberFlow($("#ps5CountGold"), gold);
  animateNumberFlow($("#ps5CountSilver"), silver);
  animateNumberFlow($("#ps5CountBronze"), bronze);
  animateNumberFlow($("#ps5TrophyLevel"), level, { prefix: `${S("levelPrefix")} ` });
  animateNumberFlow($("#ps5TrophyPct"), pct, { suffix: "%" });
  if ($("#ps5TrophyBarFill")) {
    $("#ps5TrophyBarFill").style.transition = "width 0.85s var(--framer-spring)";
    $("#ps5TrophyBarFill").style.width = `${pct}%`;
  }

  // Profile Identity & Greeting on Welcome Hub
  const onlineId = prof?.onlineId || "Player 1";
  if ($("#lblWelcomeHeroTitle")) {
    $("#lblWelcomeHeroTitle").textContent = state.lang === "ru" ? `С возвращением, ${onlineId}` : `Welcome back, ${onlineId}`;
  }
  if (prof?.avatarUrl && $("#iconProfileAvatar")) {
    const avatarBtn = $("#btnProfile");
    if (avatarBtn) {
      avatarBtn.title = state.lang === "ru" ? `Профиль ${onlineId}` : `Profile ${onlineId}`;
    }
    $("#iconProfileAvatar").innerHTML = `<img src="${prof.avatarUrl}" alt="${onlineId}" class="ps5-topbar-avatar" onerror="this.onerror=null;this.parentElement.innerHTML=PS5Icons.avatarSvg" />`;
  }

  renderControllerHints();
  renderRibbon();
  renderActiveView();
  renderControlCenter();
  renderWelcomeWishlist();
  updateNetworkWidgetStatus();
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

    btn.addEventListener("pointerenter", () => {
      if (state.activeId !== item.id) {
        SoundEngine.focusMove();
      }
    });

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
    if (document.activeElement && document.activeElement.classList.contains("ps5-tile")) {
      activeBtn.focus({ preventScroll: true });
    }
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

  document.body.classList.remove("view-welcome", "view-explore", "view-game");
  document.body.classList.add(`view-${item.viewType || "game"}`);

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
  const heroView = $("#ps5GameHeroView");
  if (heroView) {
    heroView.classList.remove("ps5-hero-anim-in");
    void heroView.offsetWidth;
    heroView.classList.add("ps5-hero-anim-in");
  }

  const pubEl = $("#heroPublisher");
  if (pubEl) {
    pubEl.textContent = item.publisher || "";
    pubEl.hidden = !item.publisher;
  }

  const kickerEl = $("#heroKicker");
  if (kickerEl) {
    const kickerText = t(item.kicker);
    kickerEl.textContent = kickerText || "";
    kickerEl.hidden = !kickerText;
  }

  const titleEl = $("#heroTitle");
  if (titleEl) {
    titleEl.textContent = t(item.title) || "";
  }

  const descEl = $("#heroDesc");
  if (descEl) {
    const descText = t(item.desc);
    descEl.textContent = descText || "";
    descEl.hidden = !descText;
  }

  const primaryBtn = $("#heroBtn");
  if (primaryBtn) {
    const cta = t(item.ctaText) || S("playCta") || "Играть";
    const btnTextEl = $("#heroBtnText");
    if (btnTextEl) btnTextEl.textContent = cta;
    else primaryBtn.textContent = cta;
    primaryBtn.setAttribute("aria-label", `${cta}: ${t(item.title)}`);
    primaryBtn.onclick = () => handleAction(item.btnAction || "launch:gta-vc");
  }

  const secBtn = $("#heroSecondaryBtn");
  if (secBtn) {
    if (item.secText) {
      secBtn.hidden = false;
      const secLabel = t(item.secText);
      const secTextEl = $("#heroSecBtnText");
      if (secTextEl) secTextEl.textContent = secLabel;
      else secBtn.textContent = secLabel;
      secBtn.setAttribute("aria-label", `${secLabel}: ${t(item.title)}`);
      secBtn.onclick = () => {
        if (item.secAction) handleAction(item.secAction);
        else if (item.secLink) window.open(item.secLink, "_blank", "noopener");
        else openLibraryModal();
      };
    } else {
      secBtn.hidden = true;
    }
  }

  // Right-bottom Trophy Summary
  const trophyCard = $("#heroTrophySummary");
  if (trophyCard) {
    if (item.trophies) {
      trophyCard.hidden = false;
      const tr = item.trophies;
      const totalTr = (tr.platinum || 0) + (tr.gold || 0) + (tr.silver || 0) + (tr.bronze || 0);
      const pct = item.progressPct ?? 100;
      $("#heroTrophyLabel").textContent = item.playTime || S("trophies") || "Призы";
      $("#heroTrophyPct").textContent = `${pct}%`;
      $("#heroTrophyCounts").textContent = `${totalTr} ${S("trophies").toLowerCase()}`;
      $("#heroTrophyBar").style.width = `${pct}%`;
    } else {
      trophyCard.hidden = true;
    }
  }
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
  SoundEngine.changePanel();
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
    SoundEngine.openHome();
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
      if (type === "rest" || type === "off") {
        SoundEngine.logOut();
      } else {
        SoundEngine.confirm();
      }
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
      <!-- System Sounds Master Toggle -->
      <div style="background:rgba(255,255,255,0.04); padding:14px 18px; border-radius:14px; border:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:600; font-size:14px;">${isRu ? "Системные звуки PS5 (System Sounds)" : "PS5 System Sounds"}</div>
          <div style="font-size:12px; color:var(--ps5-text-muted);">${isRu ? "Воспроизведение оригинальных звуковых эффектов PS5" : "Original PlayStation 5 system audio effects"}</div>
        </div>
        <button class="ps5-btn-sec ps5-btn-sec--sm" id="btnModalToggleSystemSounds" type="button">
          ${SoundEngine.systemSoundsEnabled ? "ON" : "OFF"}
        </button>
      </div>

      <!-- Navigation Volume -->
      <div style="background:rgba(255,255,255,0.04); padding:14px 18px; border-radius:14px; border:1px solid rgba(255,255,255,0.08);">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span style="font-weight:600; font-size:14px;">${isRu ? "Громкость навигации (Navigation Volume)" : "Navigation Volume (Focus Move)"}</span>
          <span id="soundNavLabel" style="color:var(--ps5-text-muted); font-size:13px;">${Math.round(SoundEngine.navVolume * 100)}%</span>
        </div>
        <input id="soundNavSlider" type="range" min="0" max="1" step="0.05" value="${SoundEngine.navVolume}" style="width:100%; accent-color:#ffffff;" />
      </div>

      <!-- Interface Volume -->
      <div style="background:rgba(255,255,255,0.04); padding:14px 18px; border-radius:14px; border:1px solid rgba(255,255,255,0.08);">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span style="font-weight:600; font-size:14px;">${isRu ? "Громкость интерфейса (Interface Volume)" : "Interface Volume (Enter / Cancel / Modals)"}</span>
          <span id="soundUiLabel" style="color:var(--ps5-text-muted); font-size:13px;">${Math.round(SoundEngine.uiVolume * 100)}%</span>
        </div>
        <input id="soundUiSlider" type="range" min="0" max="1" step="0.05" value="${SoundEngine.uiVolume}" style="width:100%; accent-color:#ffffff;" />
      </div>

      <!-- Notification Volume -->
      <div style="background:rgba(255,255,255,0.04); padding:14px 18px; border-radius:14px; border:1px solid rgba(255,255,255,0.08);">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span style="font-weight:600; font-size:14px;">${isRu ? "Громкость уведомлений (Notification Volume)" : "Notification Volume (Toasts / Trophies)"}</span>
          <span id="soundNotifLabel" style="color:var(--ps5-text-muted); font-size:13px;">${Math.round(SoundEngine.notifVolume * 100)}%</span>
        </div>
        <input id="soundNotifSlider" type="range" min="0" max="1" step="0.05" value="${SoundEngine.notifVolume}" style="width:100%; accent-color:#ffffff;" />
      </div>

      <!-- Home Screen Ambient Music (Preserved!) -->
      <div style="background:rgba(255,255,255,0.04); padding:14px 18px; border-radius:14px; border:1px solid rgba(255,255,255,0.08);">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span style="font-weight:600; font-size:14px;">${isRu ? "Музыка главного меню (PS5 Ambient Synth Emaj9)" : "Home Screen Ambient Music (Emaj9 Synth)"}</span>
          <span id="soundMusicLabel" style="color:var(--ps5-text-muted); font-size:13px;">${Math.round(SoundEngine.musicVolume * 100)}%</span>
        </div>
        <input id="soundMusicSlider" type="range" min="0" max="1" step="0.05" value="${SoundEngine.musicVolume}" style="width:100%; accent-color:#ffffff;" />
      </div>

      <!-- Test Sound Section -->
      <div style="background:rgba(255,255,255,0.04); padding:14px 18px; border-radius:14px; border:1px solid rgba(255,255,255,0.08);">
        <div style="margin-bottom:6px;">
          <span style="font-weight:600; font-size:14px;">${isRu ? "Проверка оригинальных звуков (Test Sound)" : "Test Original System Audio"}</span>
          <div style="font-size:12px; color:var(--ps5-text-muted); margin-top:2px;">
            ${isRu ? "Проверка воспроизведения файлов из каталога assets/audio/" : "Verify audio file playback from assets/audio/ directory"}
          </div>
        </div>
        <div style="display:flex; gap:8px; margin-top:10px; flex-wrap:wrap;">
          <button class="ps5-btn-sec ps5-btn-sec--sm" id="btnTestSoundNav" type="button">${isRu ? "▶ Навигация (Focus Move)" : "▶ Nav (Focus Move)"}</button>
          <button class="ps5-btn-sec ps5-btn-sec--sm" id="btnTestSoundUi" type="button">${isRu ? "▶ Интерфейс (Enter)" : "▶ UI (Enter)"}</button>
          <button class="ps5-btn-sec ps5-btn-sec--sm" id="btnTestSoundNotif" type="button">${isRu ? "▶ Уведомление (Trophy)" : "▶ Notif (Trophy)"}</button>
        </div>
        <div id="testSoundStatus" style="font-size:12px; color:#38bdf8; margin-top:10px; display:none; line-height:1.4;"></div>
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
    subtitle: isRu ? "Регулировка уровней громкости и аудиосистемы PS5" : "Adjust volume levels and PS5 audio channels",
    content: html,
    actions: [
      {
        text: SoundEngine.muted ? (isRu ? "Включить весь звук" : "Unmute All") : (isRu ? "Отключить весь звук" : "Mute All"),
        primary: false,
        action: "sound_mute"
      }
    ]
  });

  const toggleSysBtn = $("#btnModalToggleSystemSounds");
  if (toggleSysBtn) {
    toggleSysBtn.addEventListener("click", () => {
      const next = !SoundEngine.systemSoundsEnabled;
      SoundEngine.setSystemSoundsEnabled(next);
      toggleSysBtn.textContent = next ? "ON" : "OFF";
      if (next) SoundEngine.switchOn();
      else SoundEngine.switchOff();
    });
  }

  $("#soundNavSlider")?.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    SoundEngine.setNavVolume(val);
    const lbl = $("#soundNavLabel");
    if (lbl) lbl.textContent = `${Math.round(val * 100)}%`;
  });

  $("#soundUiSlider")?.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    SoundEngine.setUiVolume(val);
    const lbl = $("#soundUiLabel");
    if (lbl) lbl.textContent = `${Math.round(val * 100)}%`;
  });

  $("#soundNotifSlider")?.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    SoundEngine.setNotifVolume(val);
    const lbl = $("#soundNotifLabel");
    if (lbl) lbl.textContent = `${Math.round(val * 100)}%`;
  });

  $("#soundMusicSlider")?.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    SoundEngine.setMusicVolume(val);
    const lbl = $("#soundMusicLabel");
    if (lbl) lbl.textContent = `${Math.round(val * 100)}%`;
  });

  const runTest = (channel) => {
    const res = SoundEngine.testSound(channel);
    const statusEl = $("#testSoundStatus");
    if (statusEl) {
      statusEl.style.display = "block";
      if (res.isLoaded) {
        statusEl.style.color = "#22c55e";
        statusEl.textContent = isRu
          ? `✓ Оригинальный звук «${res.soundKey}» (${res.file}) успешно воспроизведен.`
          : `✓ Original sound "${res.soundKey}" (${res.file}) played successfully.`;
      } else {
        statusEl.style.color = "#f59e0b";
        statusEl.textContent = isRu
          ? `⚠ Аудиофайл «${res.file}» отсутствует в assets/audio/. Для воспроизведения поместите оригинальный файл в папку.`
          : `⚠ Audio file "${res.file}" is missing from assets/audio/. Place the original file in the directory to enable sound.`;
      }
    }
  };

  $("#btnTestSoundNav")?.addEventListener("click", () => runTest("nav"));
  $("#btnTestSoundUi")?.addEventListener("click", () => runTest("ui"));
  $("#btnTestSoundNotif")?.addEventListener("click", () => runTest("notif"));
}

function openAccessoriesModal() {
  const isRu = state.lang === "ru";
  const html = `
    <div style="display:flex; flex-direction:column; gap:12px; margin-top:12px;">
      <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-radius:14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
        <div style="display:flex; align-items:center; gap:14px;">
          <span style="color:#ffffff;">${PS5Icons.controller}</span>
          <div>
            <div style="font-weight:600; font-size:14px;">DualSense 1 (${isRu ? "Белый" : "White"})</div>
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
            <div style="font-weight:600; font-size:14px;">DualSense 2 (${isRu ? "Черный Midnight" : "Midnight Black"})</div>
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

async function openGameBaseModal(initialTab = "friends") {
  const isRu = state.lang === "ru";
  const friends = await FriendsService.getConfirmedFriends();
  let currentTab = initialTab;

  function buildContent(activeTab, searchResults = null, searchQuery = "") {
    return `
      <div class="ps5-gb-shell">
        <div class="ps5-gb-nav-row">
          <div class="ps5-gb-tabs">
            <button type="button" class="ps5-gb-tab ${activeTab === 'parties' ? 'active' : ''}" data-gbtab="parties">
              <span class="ps5-gb-dot ps5-gb-dot--blue"></span>
              <span>${isRu ? "Партии" : "Parties"} · 2</span>
            </button>
            <button type="button" class="ps5-gb-tab ${activeTab === 'friends' ? 'active' : ''}" data-gbtab="friends">
              <span class="ps5-gb-dot ps5-gb-dot--green"></span>
              <span>${isRu ? "Друзья" : "Friends"} · ${friends.length}</span>
            </button>
            <button type="button" class="ps5-gb-tab ${activeTab === 'requests' ? 'active' : ''}" data-gbtab="requests">
              <span>${isRu ? "Заявки" : "Friend Requests"}</span>
            </button>
            <button type="button" class="ps5-gb-tab ${activeTab === 'search' ? 'active' : ''}" data-gbtab="search">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <span>${isRu ? "Поиск" : "Search"}</span>
            </button>
          </div>
          <button type="button" class="ps5-btn-sec ps5-btn-sec--sm" id="btnGbCreateParty" style="font-size:12px; padding:5px 14px;">
            ▲ ${isRu ? "Начать тусовку" : "Create Party"}
          </button>
        </div>

        ${activeTab === 'friends' ? `
          <div class="ps5-gb-subbar">
            <span>${isRu ? `Всего друзей: ${friends.length}` : `All friends: ${friends.length}`}</span>
            <span>${isRu ? "Сортировка: В сети - Не в сети" : "Sort by: Online - Offline"}</span>
          </div>

          ${friends.length === 0 ? `
            <div class="ps5-friends-empty" style="padding:28px 16px;">
              <div class="ps5-fe-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
              <p class="ps5-fe-title">${isRu ? "Здесь пока нет друзей" : "No friends here yet"}</p>
              <p class="ps5-fe-desc">${isRu ? "Добавь свой первый контакт и играйте вместе в PlayStation®5" : "Add your first friend and play together on PlayStation®5"}</p>
              <button type="button" class="ps5-btn-play ps5-btn-play--sm" id="btnGbAddFriendEmpty" style="margin-top:8px;">
                ${isRu ? "Добавить друга" : "Add Friend"}
              </button>
            </div>
          ` : `
            <div class="ps5-gb-grid">
              ${friends.map(f => {
                const av = PRESET_AVATARS.find(a => a.id === f.avatar) || PRESET_AVATARS[0];
                return `
                  <div class="ps5-gb-friend-card" data-fid="${f.id}">
                    <div class="ps5-gb-avatar-wrap" style="background:${av.bg};">
                      <span>${av.icon}</span>
                      <span class="ps5-gb-avatar-dot"></span>
                    </div>
                    <div class="ps5-gb-card-name">
                      <span>${escapeHtml(f.displayName)}</span>
                      <span class="ps5-gb-plus-icon">+</span>
                    </div>
                    <div class="ps5-gb-card-status">${escapeHtml(f.currentGame || "PlayStation®5 System")}</div>
                  </div>
                `;
              }).join("")}
            </div>
          `}
        ` : ''}

        ${activeTab === 'parties' ? `
          <div style="display:flex; flex-direction:column; gap:10px; padding:6px 0;">
            <div style="display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-radius:14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
              <div style="display:flex; align-items:center; gap:14px;">
                <div style="width:42px; height:42px; border-radius:50%; background:linear-gradient(135deg, #38bdf8, #818cf8); display:flex; align-items:center; justify-content:center; color:#fff; font-weight:800;">🎙</div>
                <div>
                  <div style="font-weight:600; font-size:14.5px;">${isRu ? "Тусовка Cr1mnsx & Friends" : "Cr1mnsx & Friends Party"}</div>
                  <div style="font-size:12px; color:var(--ps5-text-muted); margin-top:2px;">2 ${isRu ? "участника в голосовом чате · Открытая" : "members in voice chat · Open"}</div>
                </div>
              </div>
              <button class="ps5-btn-play ps5-btn-play--sm" type="button" id="btnJoinGbParty">${isRu ? "Присоединиться" : "Join"}</button>
            </div>
          </div>
        ` : ''}

        ${activeTab === 'requests' ? `
          <div style="display:flex; flex-direction:column; gap:12px; padding:6px 0; text-align:center;">
            <p style="font-size:13.5px; color:rgba(255,255,255,0.7);">${isRu ? "Управление входящими и исходящими заявками в друзья:" : "Manage incoming and outgoing friend requests:"}</p>
            <div style="display:flex; justify-content:center; gap:12px; margin-top:4px;">
              <button type="button" class="ps5-btn-play ps5-btn-play--sm" id="btnGbGoRequests">${isRu ? "Открыть «Мои заявки»" : "Open Friend Requests"}</button>
              <button type="button" class="ps5-btn-sec ps5-btn-sec--sm" id="btnGbGoAdd">${isRu ? "Добавить нового друга" : "Add New Friend"}</button>
            </div>
          </div>
        ` : ''}

        ${activeTab === 'search' ? `
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div class="ps5-store-search-bar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="text" class="ps5-store-search-input" id="inputGbSearch" placeholder="${isRu ? "Введите никнейм игрока для поиска..." : "Search players by gamertag or nickname..."}" value="${escapeHtml(searchQuery)}" autocomplete="off" />
            </div>

            <div id="gbSearchResults" class="ps5-gb-grid">
              ${searchResults === null ? `
                <div style="grid-column:1/-1; text-align:center; padding:24px; color:rgba(255,255,255,0.4); font-size:13px;">
                  ${isRu ? "Начните вводить никнейм, чтобы найти профиль игрока в базе" : "Type a gamertag to find player profiles in the directory"}
                </div>
              ` : (searchResults.length === 0 ? `
                <div style="grid-column:1/-1; text-align:center; padding:24px; color:rgba(255,255,255,0.4); font-size:13px;">
                  ${isRu ? "Игроков с таким никнеймом не найдено" : "No players found matching this nickname"}
                </div>
              ` : searchResults.map(p => {
                const av = PRESET_AVATARS.find(a => a.id === p.avatar) || PRESET_AVATARS[0];
                return `
                  <div class="ps5-gb-friend-card" data-search-fid="${p.id}">
                    <div class="ps5-gb-avatar-wrap" style="background:${av.bg};">
                      <span>${av.icon}</span>
                    </div>
                    <div class="ps5-gb-card-name">
                      <span>${escapeHtml(p.displayName)}</span>
                    </div>
                    <div class="ps5-gb-card-status">@${escapeHtml(p.nickname)}</div>
                    <button type="button" class="ps5-btn-sec ps5-btn-sec--sm btn-view-found-profile" data-profile-nick="${escapeHtml(p.nickname)}" style="margin-top:8px; font-size:11px; padding:3px 10px;">
                      ${isRu ? "Профиль" : "View"}
                    </button>
                  </div>
                `;
              }).join(''))}
            </div>
          </div>
        ` : ''}

        <div class="ps5-gb-footer-cue">
          <span class="ps5-gb-cue-key">L1 / R1</span>
          <span>${isRu ? "Переключение вкладок" : "Switch Tabs"}</span>
        </div>
      </div>
    `;
  }

  function attachGbEvents() {
    const cardEl = $("#modalOverlay .modal-card");
    if (cardEl) cardEl.classList.add("ultra-wide");

    $("#modalOverlay")?.querySelectorAll("[data-gbtab]").forEach(btn => {
      btn.onclick = () => {
        SoundEngine.changePanel();
        currentTab = btn.dataset.gbtab;
        refreshGbModal();
      };
    });

    const addBtnEmpty = $("#btnGbAddFriendEmpty");
    if (addBtnEmpty) addBtnEmpty.onclick = () => { closeModal(); openAddFriendModal(); };

    const btnGoReq = $("#btnGbGoRequests");
    if (btnGoReq) btnGoReq.onclick = () => { closeModal(); openFriendRequestsModal(); };

    const btnGoAdd = $("#btnGbGoAdd");
    if (btnGoAdd) btnGoAdd.onclick = () => { closeModal(); openAddFriendModal(); };

    const btnParty = $("#btnGbCreateParty");
    if (btnParty) btnParty.onclick = () => {
      SoundEngine.joinParty();
      showToast(isRu ? "Тусовка PS5" : "PS5 Party", isRu ? "Голосовая тусовка создана · Микрофон активен" : "Voice party created · Mic live", PS5Icons.controller);
    };

    const btnJoinParty = $("#btnJoinGbParty");
    if (btnJoinParty) btnJoinParty.onclick = () => {
      SoundEngine.joinParty();
      showToast(isRu ? "Тусовка" : "Party", isRu ? "Вы присоединились к голосовому чату" : "Joined voice party", PS5Icons.controller);
    };

    $("#modalOverlay")?.querySelectorAll(".ps5-gb-friend-card[data-fid]").forEach(card => {
      card.onclick = () => {
        const fid = card.dataset.fid;
        const fr = friends.find(f => f.id === fid);
        if (fr) { closeModal(); openFriendProfileModal(fr); }
      };
    });

    const inputSearch = $("#inputGbSearch");
    if (inputSearch) {
      inputSearch.focus();
      inputSearch.oninput = async () => {
        const q = inputSearch.value.trim();
        if (!q) {
          refreshGbModal(null, "");
          return;
        }
        const res = await FriendsService.searchFriends(q);
        refreshGbModal(res, q);
      };
    }

    $("#modalOverlay")?.querySelectorAll(".btn-view-found-profile").forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const nick = btn.dataset.profileNick;
        const res = await FriendsService.searchFriends(nick);
        if (res && res[0]) {
          closeModal();
          openFriendProfileModal(res[0]);
        }
      };
    });
  }

  function refreshGbModal(searchResults = null, query = "") {
    const body = $("#modalBody");
    if (!body) return;
    body.innerHTML = buildContent(currentTab, searchResults, query);
    attachGbEvents();
  }

  openModal({
    tag: "GAME BASE",
    title: "Game Base",
    subtitle: isRu ? "Друзья, тусовки, поиск игроков и голосовой чат PS5" : "Friends, parties, player search and voice chat",
    content: buildContent(currentTab),
    isWide: true,
    actions: []
  });

  attachGbEvents();
}

function openNotificationsModal() {
  const isRu = state.lang === "ru";
  const html = `
    <div style="display:flex; flex-direction:column; gap:10px; margin-top:12px;">
      <div style="display:flex; gap:14px; padding:14px 16px; border-radius:14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
        <span style="color:var(--ps5-gold); flex-shrink:0;">${PS5Icons.trophy}</span>
        <div>
          <div style="font-weight:600; font-size:14px;">${isRu ? "Получен трофей: Платина «Король Вайс-Сити»" : "Trophy Earned: Platinum «Vice City King»"}</div>
          <div style="font-size:12.5px; color:var(--ps5-text-muted); margin-top:2px;">Grand Theft Auto: Vice City · ${isRu ? "Только что" : "Just now"}</div>
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
          <div style="font-weight:600; font-size:14px;">${isRu ? "Беспроводной контроллер DualSense 1 подключен" : "DualSense Wireless Controller 1 connected"}</div>
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
  SoundEngine.openDialog();
}

function closeSearch() {
  const overlay = $("#searchOverlay");
  if (!overlay.classList.contains("active")) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  SoundEngine.cancel();
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
  SoundEngine.openDialog();
}

function closeSettings() {
  const overlay = $("#settingsOverlay");
  if (!overlay.classList.contains("active")) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  SoundEngine.cancel();
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
      SoundEngine.changePanel();
    });
    nav.appendChild(btn);
  });
}

function renderSettingsDetail(secId) {
  const sec = settingsSections.find((s) => s.id === secId) || settingsSections[0];
  const box = $("#settingsDetail");
  if (!box) return;

  if (sec.id === "ps5_sounds" || sec.isSoundLibrary) {
    renderSoundLibrarySettings(box);
    return;
  }

  const secTitle = t(sec.title) || (state.lang === "ru" ? "Параметры" : "Settings");
  box.innerHTML = `
    <h3 style="font-size:20px;font-weight:400;display:flex;align-items:center;gap:10px;">${sec.icon || ""}<span>${secTitle}</span></h3>
    <p style="font-size:13px;color:var(--ps5-text-muted);margin-bottom:6px;">${S("settingsSub")}</p>
  `;

  sec.items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "settings-item-card";

    let btnHtml = "";
    if (item.slider) {
      let val = 0.8;
      if (item.slider === "nav_vol") val = SoundEngine.navVolume;
      else if (item.slider === "ui_vol") val = SoundEngine.uiVolume;
      else if (item.slider === "notif_vol") val = SoundEngine.notifVolume;

      btnHtml = `
        <div style="display:flex; align-items:center; gap:12px; width:220px;">
          <input type="range" min="0" max="1" step="0.05" value="${val}" data-slider-type="${item.slider}" style="width:100%; accent-color:#ffffff;" />
          <span class="ps5-settings-slider-lbl" style="font-size:12.5px; color:var(--ps5-text-muted); min-width:38px; text-align:right;">${Math.round(val * 100)}%</span>
        </div>
      `;
    } else if (item.action) {
      btnHtml = `<button class="ps5-btn-sec ps5-btn-sec--sm" data-act="${item.action}" type="button">${S("openCta")}</button>`;
    } else if (item.toggle === "lang") {
      btnHtml = `<button class="ps5-btn-sec ps5-btn-sec--sm" data-toggle="lang" type="button">${state.lang === "ru" ? "Switch to EN" : "Переключить на RU"}</button>`;
    } else if (item.toggle === "particles") {
      btnHtml = `<button class="ps5-btn-sec ps5-btn-sec--sm" data-toggle="particles" type="button">${state.particlesEnabled ? "ON" : "OFF"}</button>`;
    } else if (item.toggle === "ambient") {
      btnHtml = `<button class="ps5-btn-sec ps5-btn-sec--sm" data-toggle="ambient" type="button">${SoundEngine.ambientPlaying ? "ON" : "OFF"}</button>`;
    } else if (item.toggle === "system_sounds" || item.toggle === "sfx") {
      btnHtml = `<button class="ps5-btn-sec ps5-btn-sec--sm" data-toggle="system_sounds" type="button">${SoundEngine.systemSoundsEnabled ? "ON" : "OFF"}</button>`;
    }

    row.innerHTML = `
      <div>
        <div class="settings-item-label">${t(item.label)}</div>
        <div class="settings-item-val">${t(item.val)}</div>
      </div>
      ${btnHtml}
    `;

    const slider = row.querySelector("input[type='range']");
    if (slider) {
      slider.addEventListener("input", (e) => {
        const val = parseFloat(e.target.value);
        const stype = e.target.dataset.sliderType;
        const lbl = row.querySelector(".ps5-settings-slider-lbl");
        if (lbl) lbl.textContent = `${Math.round(val * 100)}%`;

        if (stype === "nav_vol") SoundEngine.setNavVolume(val);
        else if (stype === "ui_vol") SoundEngine.setUiVolume(val);
        else if (stype === "notif_vol") SoundEngine.setNotifVolume(val);
      });
    }

    const btn = row.querySelector("button");
    if (btn) {
      btn.addEventListener("click", () => {
        if (btn.dataset.act === "test_sound") {
          const res = SoundEngine.testSound("ui");
          showToast(
            state.lang === "ru" ? "Проверка звука PS5" : "PS5 Audio Test",
            res.isLoaded
              ? (state.lang === "ru" ? `✓ Звук «${res.soundKey}» (${res.file}) воспроизведен` : `✓ Sound "${res.soundKey}" (${res.file}) played`)
              : (state.lang === "ru" ? `⚠ Файл «${res.file}» отсутствует в assets/audio/` : `⚠ File "${res.file}" missing in assets/audio/`),
            res.isLoaded ? PS5Icons.soundOn : PS5Icons.soundMuted
          );
        } else if (btn.dataset.act) {
          closeSettings();
          handleAction(btn.dataset.act);
        } else if (btn.dataset.toggle === "lang") {
          state.lang = state.lang === "ru" ? "en" : "ru";
          applyLanguageAndTelemetry();
          renderSettingsNav();
          renderSettingsDetail(state.settingsSection);
          SoundEngine.changePanel();
        } else if (btn.dataset.toggle === "particles") {
          state.particlesEnabled = !state.particlesEnabled;
          particleEngine?.setPaused(!state.particlesEnabled);
          btn.textContent = state.particlesEnabled ? "ON" : "OFF";
          if (state.particlesEnabled) SoundEngine.switchOn();
          else SoundEngine.switchOff();
        } else if (btn.dataset.toggle === "ambient") {
          const playing = SoundEngine.toggleAmbient();
          btn.textContent = playing ? "ON" : "OFF";
          if (playing) SoundEngine.switchOn();
          else SoundEngine.switchOff();
        } else if (btn.dataset.toggle === "system_sounds" || btn.dataset.toggle === "sfx") {
          const next = !SoundEngine.systemSoundsEnabled;
          SoundEngine.setSystemSoundsEnabled(next);
          btn.textContent = next ? "ON" : "OFF";
          if (next) SoundEngine.switchOn();
          else SoundEngine.switchOff();
        }
      });
    }
    box.appendChild(row);
  });
}

/* =========================================================================
   TASK 11: PS5 SYSTEM SOUND TEST CENTER & INTERACTIVE CATALOG
   ========================================================================= */

function renderSoundLibrarySettings(box) {
  const isRu = state.lang === "ru";
  
  box.innerHTML = `
    <div class="ps5-sl-header">
      <div class="ps5-sl-title-group">
        <h3 class="ps5-sl-title">${PS5Icons.soundOn} <span>${isRu ? "Системные звуки PlayStation®5" : "PlayStation®5 System Sounds"}</span></h3>
        <p class="ps5-sl-sub">${isRu ? "Оригинальная коллекция 45 звуковых эффектов PS5 (Khinsider Gamerip 2020) с распределением по системным действиям" : "Official 45 PS5 sound effects collection (Khinsider Gamerip 2020) mapped to system events"}</p>
      </div>
      <div class="ps5-sl-chips">
        <span class="ps5-sl-chip active">✓ 26 ${isRu ? "Активных" : "Active"}</span>
        <span class="ps5-sl-chip reserved">★ 4 ${isRu ? "В резерве" : "Reserved"}</span>
        <span class="ps5-sl-chip missing">⚠ 15 ${isRu ? "Отсутствуют" : "Missing"}</span>
      </div>
    </div>

    <!-- Global Volume & Test Controls -->
    <div class="ps5-sl-controls-card">
      <div class="ps5-sl-vol-col">
        <div class="ps5-sl-vol-header">
          <span>${isRu ? "Общая громкость (Master Volume)" : "Master Volume"}</span>
          <span id="slMasterVolVal" class="ps5-sl-vol-num">${Math.round(SoundEngine.masterVolume * 100)}%</span>
        </div>
        <input type="range" id="slMasterVolSlider" min="0" max="1" step="0.05" value="${SoundEngine.masterVolume}" style="width:100%; accent-color:#ffffff;" />
      </div>

      <div class="ps5-sl-vol-col">
        <div class="ps5-sl-vol-header">
          <span>${isRu ? "Громкость интерфейса (SFX Volume)" : "Interface & SFX Volume"}</span>
          <span id="slSfxVolVal" class="ps5-sl-vol-num">${Math.round(SoundEngine.uiVolume * 100)}%</span>
        </div>
        <input type="range" id="slSfxVolSlider" min="0" max="1" step="0.05" value="${SoundEngine.uiVolume}" style="width:100%; accent-color:#ffffff;" />
      </div>

      <div class="ps5-sl-btns-row">
        <button type="button" class="sber-btn-primary" id="btnTestAllActiveSounds">
          <span id="btnTestAllIcon">▶</span>
          <span id="btnTestAllLabel">${isRu ? "Протестировать все активные звуки" : "Test All Active Sounds"}</span>
        </button>
        <button type="button" class="ps5-btn-sec ps5-btn-sec--sm" id="slBtnToggleMute">
          ${SoundEngine.muted ? (isRu ? "Включить звук" : "Unmute") : (isRu ? "Выключить звук" : "Mute")}
        </button>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="ps5-sl-search-wrap">
      <div class="ps5-sl-search-box">
        <span class="ps5-sl-search-icon" style="color:rgba(255,255,255,0.4); display:flex; align-items:center;">${PS5Icons.search}</span>
        <input type="text" id="slSearchInput" placeholder="${isRu ? "Поиск звука по названию, действию или категории..." : "Search sounds by name, action, or category..."}" value="${escapeHtml(state.soundLibrarySearch || "")}" />
        ${state.soundLibrarySearch ? `<button type="button" id="slSearchClear" class="ps5-sl-clear-btn">✕</button>` : ""}
      </div>
      <div class="ps5-sl-filter-pills" id="slFilterPills">
        <button type="button" class="sl-pill${state.soundLibraryFilter === "all" ? " is-active" : ""}" data-filter="all">${isRu ? "Все (45)" : "All (45)"}</button>
        <button type="button" class="sl-pill${state.soundLibraryFilter === "active" ? " is-active" : ""}" data-filter="active">${isRu ? "Активные (26)" : "Active (26)"}</button>
        <button type="button" class="sl-pill${state.soundLibraryFilter === "reserved" ? " is-active" : ""}" data-filter="reserved">${isRu ? "В резерве (4)" : "Reserved (4)"}</button>
        <button type="button" class="sl-pill${state.soundLibraryFilter === "missing" ? " is-active" : ""}" data-filter="missing">${isRu ? "Отсутствуют (15)" : "Missing (15)"}</button>
        <button type="button" class="sl-pill${state.soundLibraryFilter === "navigation" ? " is-active" : ""}" data-filter="navigation">${isRu ? "Навигация" : "Navigation"}</button>
        <button type="button" class="sl-pill${state.soundLibraryFilter === "confirmation" ? " is-active" : ""}" data-filter="confirmation">${isRu ? "Подтверждение" : "Confirmation"}</button>
        <button type="button" class="sl-pill${state.soundLibraryFilter === "system_menu" ? " is-active" : ""}" data-filter="system_menu">${isRu ? "Меню" : "Menus"}</button>
        <button type="button" class="sl-pill${state.soundLibraryFilter === "notifications" ? " is-active" : ""}" data-filter="notifications">${isRu ? "Уведомления" : "Notifications"}</button>
        <button type="button" class="sl-pill${state.soundLibraryFilter === "trophies" ? " is-active" : ""}" data-filter="trophies">${isRu ? "Призы" : "Trophies"}</button>
        <button type="button" class="sl-pill${state.soundLibraryFilter === "input" ? " is-active" : ""}" data-filter="input">${isRu ? "Ввод текста" : "Input"}</button>
      </div>
    </div>

    <!-- Sound Cards List -->
    <div class="ps5-sl-list" id="slCardsList"></div>
  `;

  renderSoundCardsList();
  attachSoundLibraryListeners();
}

function renderSoundCardsList() {
  const isRu = state.lang === "ru";
  const listEl = $("#slCardsList");
  if (!listEl) return;

  const query = (state.soundLibrarySearch || "").trim().toLowerCase();
  const filter = state.soundLibraryFilter || "all";

  const filtered = PS5_SOUND_CATALOG.filter(s => {
    // Category or status filter
    if (filter === "active" && s.status !== "ACTIVE") return false;
    if (filter === "reserved" && s.status !== "RESERVED") return false;
    if (filter === "missing" && s.status !== "MISSING") return false;
    if (["navigation", "confirmation", "system_menu", "notifications", "trophies", "input", "system", "social", "store", "assistant"].includes(filter)) {
      if (s.category !== filter) return false;
    }

    // Search query
    if (query) {
      const matchName = s.name.toLowerCase().includes(query);
      const matchKey = s.key.toLowerCase().includes(query);
      const matchId = String(s.id) === query;
      const matchAction = (s.action || "").toLowerCase().includes(query);
      const matchDesc = (s.description || "").toLowerCase().includes(query);
      return matchName || matchKey || matchId || matchAction || matchDesc;
    }
    return true;
  });

  if (filtered.length === 0) {
    listEl.innerHTML = `
      <div style="padding:48px 20px; text-align:center; color:rgba(255,255,255,0.4); font-size:14px;">
        ${isRu ? "Звуки не найдены по текущему запросу" : "No sounds found matching criteria"}
      </div>
    `;
    return;
  }

  listEl.innerHTML = filtered.map(s => {
    const isMissing = s.status === "MISSING";
    const isReserved = s.status === "RESERVED";
    const isActive = s.status === "ACTIVE";

    let badgeClass = "sl-badge--missing";
    let badgeText = isRu ? "ОТСУТСТВУЕТ" : "MISSING";
    if (isActive) {
      badgeClass = "sl-badge--active";
      badgeText = isRu ? "АКТИВЕН" : "ACTIVE";
    } else if (isReserved) {
      badgeClass = "sl-badge--reserved";
      badgeText = isRu ? "В РЕЗЕРВЕ" : "RESERVED";
    }

    const durText = s.duration ? `${s.duration}s · 44.1kHz` : (isRu ? "Файл заблокирован на источнике (Cloudflare Turnstile)" : "File blocked by bot protection (Cloudflare Turnstile)");

    return `
      <div class="ps5-sl-card${isMissing ? " is-missing" : ""}" id="slCard-${s.id}" data-id="${s.id}">
        <div class="ps5-sl-card-top">
          <div class="ps5-sl-card-title-row">
            <span class="ps5-sl-id-badge">#${s.id}</span>
            <span class="ps5-sl-name">${escapeHtml(s.name)}</span>
            <span class="ps5-sl-cat-badge">${s.category}</span>
          </div>
          <span class="sl-badge ${badgeClass}">${badgeText}</span>
        </div>

        <p class="ps5-sl-desc">${escapeHtml(s.description)}</p>

        <div class="ps5-sl-meta-row">
          <span class="ps5-sl-action">
            <strong>${isRu ? "Назначение:" : "Bound to:"}</strong> ${escapeHtml(s.action || s.targetFeature || "")}
          </span>
          <span class="ps5-sl-tech">${durText}</span>
        </div>

        <div class="ps5-sl-card-footer">
          <span class="ps5-sl-file-hint">${escapeHtml(s.filename)}</span>
          ${isMissing ? `
            <button type="button" class="ps5-sl-btn-play is-disabled" disabled title="${isRu ? "Файл заблокирован защитой сайта" : "File blocked by bot protection"}">
              ✕ ${isRu ? "Недоступен" : "Unavailable"}
            </button>
          ` : `
            <button type="button" class="ps5-sl-btn-play" data-play-id="${s.id}">
              <span>▶</span> <span>${isRu ? "Прослушать" : "Play"}</span>
            </button>
          `}
        </div>
      </div>
    `;
  }).join("");

  listEl.querySelectorAll(".ps5-sl-btn-play[data-play-id]").forEach(btn => {
    btn.addEventListener("click", () => {
      const soundId = parseInt(btn.dataset.playId, 10);
      const card = $(`#slCard-${soundId}`);
      if (card) {
        card.classList.add("is-playing");
        setTimeout(() => card.classList.remove("is-playing"), 600);
      }
      SoundEngine.testSound(soundId);
    });
  });
}

function attachSoundLibraryListeners() {
  const masterSlider = $("#slMasterVolSlider");
  const masterVal = $("#slMasterVolVal");
  if (masterSlider) {
    masterSlider.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      SoundEngine.setMasterVolume(val);
      if (masterVal) masterVal.textContent = `${Math.round(val * 100)}%`;
      SoundEngine.sliderLevelMeter();
    });
  }

  const sfxSlider = $("#slSfxVolSlider");
  const sfxVal = $("#slSfxVolVal");
  if (sfxSlider) {
    sfxSlider.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      SoundEngine.setUiVolume(val);
      SoundEngine.setNavVolume(val * 0.9);
      if (sfxVal) sfxVal.textContent = `${Math.round(val * 100)}%`;
      SoundEngine.sliderLevelMeter();
    });
  }

  const muteBtn = $("#slBtnToggleMute");
  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      const isMuted = SoundEngine.toggle();
      updateMuteButtonUI();
      muteBtn.textContent = isMuted ? (state.lang === "ru" ? "Включить звук" : "Unmute") : (state.lang === "ru" ? "Выключить звук" : "Mute");
      showToast("Аудио PS5", isMuted ? "Звук выключен" : "Звук включен", isMuted ? PS5Icons.soundMuted : PS5Icons.soundOn);
    });
  }

  const searchInput = $("#slSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      state.soundLibrarySearch = e.target.value;
      renderSoundCardsList();
    });
  }

  const clearBtn = $("#slSearchClear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      state.soundLibrarySearch = "";
      if (searchInput) searchInput.value = "";
      renderSoundCardsList();
    });
  }

  const filterPills = $("#slFilterPills");
  if (filterPills) {
    filterPills.querySelectorAll(".sl-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        filterPills.querySelectorAll(".sl-pill").forEach(p => p.classList.remove("is-active"));
        pill.classList.add("is-active");
        state.soundLibraryFilter = pill.dataset.filter || "all";
        SoundEngine.focusMove();
        renderSoundCardsList();
      });
    });
  }

  const testAllBtn = $("#btnTestAllActiveSounds");
  if (testAllBtn) {
    testAllBtn.addEventListener("click", () => {
      const isRu = state.lang === "ru";
      if (SoundEngine._isTestingSequence) {
        SoundEngine.cancelTesting();
        testAllBtn.classList.remove("is-testing");
        $("#btnTestAllIcon").textContent = "▶";
        $("#btnTestAllLabel").textContent = isRu ? "Протестировать все активные звуки" : "Test All Active Sounds";
        return;
      }

      testAllBtn.classList.add("is-testing");
      $("#btnTestAllIcon").textContent = "⏹";
      $("#btnTestAllLabel").textContent = isRu ? "Остановить тестирование" : "Stop testing";

      SoundEngine.testAllActiveSounds(
        (sound, idx, total) => {
          $("#btnTestAllLabel").textContent = `${isRu ? "Звук" : "Sound"} ${idx + 1} / ${total}: ${sound.name}`;
          const card = $(`#slCard-${sound.id}`);
          if (card) {
            card.classList.add("is-playing");
            card.scrollIntoView({ behavior: "smooth", block: "nearest" });
            setTimeout(() => card.classList.remove("is-playing"), 400);
          }
        },
        () => {
          testAllBtn.classList.remove("is-testing");
          $("#btnTestAllIcon").textContent = "▶";
          $("#btnTestAllLabel").textContent = isRu ? "Протестировать все активные звуки" : "Test All Active Sounds";
        }
      );
    });
  }
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
  const titleEl = $("#modalTitle");
  if (titleEl) {
    titleEl.textContent = title || "";
    titleEl.style.display = title ? "block" : "none";
  }
  const subEl = $("#modalSubtitle");
  if (subEl) {
    subEl.textContent = subtitle || "";
    subEl.style.display = subtitle ? "block" : "none";
  }
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
  SoundEngine.openDialog();
}

function closeModal() {
  const overlay = $("#modalOverlay");
  if (!overlay.classList.contains("active")) return;
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
  const titleEl = $("#modalTitle");
  if (titleEl) {
    titleEl.style.display = "none";
    titleEl.textContent = "";
  }
  SoundEngine.cancel();
}

/* =========================================================================
   TASK 05: AUTHENTIC PS5 WELCOME HUB WIDGET CONTROLLERS
   - Trophies 1:1 screen (Image 2)
   - Store 1:1 screen (Image 3)
   - Media Gallery 1:1 screen & Lightbox (Image 4)
   - Interactive Wishlist with localStorage
   - Live Network Status & Diagnostics
   - Remote Play Setup Guide
   ========================================================================= */

/* =========================================================================
   TASK 10: REAL PSN TROPHY SYNC & TROPHY COLLECTION ENGINE
   ========================================================================= */

function formatTrophyDate(isoDate, isRu) {
  if (!isoDate) return isRu ? "Не получено" : "Not earned";
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString(isRu ? "ru-RU" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch {
    return isoDate;
  }
}

function openTrophyCollectionModal() {
  const modal = $("#modalTrophyCollection");
  if (!modal) return;
  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  SoundEngine.openDialog();

  renderTrophyCollectionModal();
}

function closeTrophyCollectionModal() {
  const modal = $("#modalTrophyCollection");
  if (!modal || !modal.classList.contains("active")) return;
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  SoundEngine.cancel();
}

function renderTrophyCollectionModal() {
  const isRu = state.lang === "ru";
  const { profile, recentTrophies, games, syncSource } = psnService.getData();
  if (!profile) return;

  // Profile Identity
  const avatarEl = $("#tcProfileAvatar");
  if (avatarEl && profile.avatarUrl) avatarEl.src = profile.avatarUrl;
  $("#tcProfileOnlineId").textContent = profile.onlineId || "Player 1";

  const pill = $("#tcSyncPill");
  if (pill) {
    if (syncSource === "supabase") pill.textContent = isRu ? "● PSN Cloud DB" : "● PSN Cloud DB";
    else if (syncSource === "custom") pill.textContent = isRu ? "● Локальный импорт" : "● Custom Import";
    else pill.textContent = isRu ? "● PSN Sync" : "● PSN Sync";
  }

  const tsEl = $("#tcSyncTimestamp");
  if (tsEl) {
    if (profile.lastSyncAt) {
      const syncDate = new Date(profile.lastSyncAt);
      tsEl.textContent = `${isRu ? "Синхронизировано:" : "Synced:"} ${syncDate.toLocaleDateString(isRu ? "ru-RU" : "en-US", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`;
    } else {
      tsEl.textContent = isRu ? "Синхронизировано недавно" : "Recently synced";
    }
  }

  // Level & Progress
  $("#tcTrophyLevel").textContent = String(profile.trophyLevel || 1);
  $("#tcLevelProgressBar").style.width = `${profile.levelProgress || 0}%`;
  $("#tcLevelProgressPct").textContent = `${profile.levelProgress || 0}%`;

  // 3D Cup Icons
  $("#tcCupPlatSvg").innerHTML = PS5Icons.trophyCup3D("platinum");
  $("#tcCupGoldSvg").innerHTML = PS5Icons.trophyCup3D("gold");
  $("#tcCupSilverSvg").innerHTML = PS5Icons.trophyCup3D("silver");
  $("#tcCupBronzeSvg").innerHTML = PS5Icons.trophyCup3D("bronze");

  // Counters
  $("#tcTotalCount").textContent = Number(profile.totalTrophies || 0).toLocaleString();
  $("#tcPlatCount").textContent = Number(profile.platinum || 0).toLocaleString();
  $("#tcGoldCount").textContent = Number(profile.gold || 0).toLocaleString();
  $("#tcSilverCount").textContent = Number(profile.silver || 0).toLocaleString();
  $("#tcBronzeCount").textContent = Number(profile.bronze || 0).toLocaleString();

  // Section 1: Recent Trophies
  const recentListEl = $("#tcRecentTrophiesList");
  if (recentListEl) {
    if (!recentTrophies || recentTrophies.length === 0) {
      recentListEl.innerHTML = `<div style="padding:14px; color:rgba(255,255,255,0.4); font-size:13px;">${isRu ? "Нет недавних призов" : "No recent trophies"}</div>`;
    } else {
      recentListEl.innerHTML = recentTrophies.map(t => {
        const iconSrc = t.trophyIconUrl || "assets/covers/gta_vc.jpg";
        return `
          <div class="tc-recent-card" data-comm-id="${t.npCommunicationId || ''}">
            <img src="${iconSrc}" alt="${escapeHtml(t.trophyName)}" class="tc-recent-icon" onerror="this.src='assets/covers/gta_vc.jpg'">
            <div class="tc-recent-info">
              <span class="tc-recent-trophy-name">${escapeHtml(t.trophyName)}</span>
              <span class="tc-recent-game-title">${escapeHtml(t.gameTitle || 'PlayStation 5')}</span>
              <span class="tc-recent-date">${formatTrophyDate(t.earnedDateTime, isRu)}</span>
            </div>
          </div>
        `;
      }).join("");

      recentListEl.querySelectorAll(".tc-recent-card").forEach(card => {
        card.addEventListener("click", () => {
          const cid = card.dataset.commId;
          if (cid) openGameTrophiesDetail(cid);
        });
      });
    }
  }

  // Section 2: My Games
  renderTrophyGamesList();
}

function renderTrophyGamesList() {
  const isRu = state.lang === "ru";
  const gamesGrid = $("#tcGamesGrid");
  const countBadge = $("#tcGamesCount");
  if (!gamesGrid) return;

  const filteredGames = psnService.getGames(state.trophyFilter, state.trophySearch);
  if (countBadge) {
    countBadge.textContent = isRu ? `${filteredGames.length} ${formatGamePlural(filteredGames.length, true)}` : `${filteredGames.length} games`;
  }

  if (filteredGames.length === 0) {
    gamesGrid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 36px 20px; text-align: center; color: rgba(255, 255, 255, 0.4); font-size: 14px;">
        ${isRu ? "Игры не найдены по текущему запросу" : "No games found matching your search"}
      </div>
    `;
    return;
  }

  gamesGrid.innerHTML = filteredGames.map(g => {
    const thumb = g.titleIconUrl || "assets/covers/gta_vc.jpg";
    const counts = g.earnedTrophies || { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    const hasPlat = g.platinumEarned || counts.platinum > 0;

    return `
      <div class="tc-game-card" data-comm-id="${g.npCommunicationId}">
        <img src="${thumb}" alt="${escapeHtml(g.titleName)}" class="tc-game-thumb" onerror="this.src='assets/covers/gta_vc.jpg'">
        <div class="tc-game-details">
          <div class="tc-game-header-row">
            <span class="tc-game-title" title="${escapeHtml(g.titleName)}">${escapeHtml(g.titleName)}</span>
            <span class="tc-platform-badge">${g.platform || 'PS5'}</span>
          </div>
          <div class="tc-game-progress-row">
            <div class="tc-game-progress-track">
              <div class="tc-game-progress-fill" style="width: ${g.progress}%;"></div>
            </div>
            <span class="tc-game-progress-val">${g.progress}%</span>
          </div>
          <div class="tc-game-cups-mini">
            ${hasPlat ? `<span class="tc-mini-cup tc-mini-cup--plat">🏆 ${counts.platinum || 1}</span>` : ''}
            <span class="tc-mini-cup tc-mini-cup--gold">🥇 ${counts.gold || 0}</span>
            <span class="tc-mini-cup tc-mini-cup--silver">🥈 ${counts.silver || 0}</span>
            <span class="tc-mini-cup tc-mini-cup--bronze">🥉 ${counts.bronze || 0}</span>
          </div>
        </div>
      </div>
    `;
  }).join("");

  gamesGrid.querySelectorAll(".tc-game-card").forEach(card => {
    card.addEventListener("click", () => {
      const cid = card.dataset.commId;
      if (cid) openGameTrophiesDetail(cid);
    });
  });
}

function openGameTrophiesDetail(commId) {
  const isRu = state.lang === "ru";
  const game = psnService.getGame(commId);
  if (!game) return;

  state.activeGameDetailId = commId;
  const modal = $("#modalGameTrophiesDetail");
  const body = $("#gameDetailBody");
  if (!modal || !body) return;

  SoundEngine.openDialog();

  const thumb = game.titleIconUrl || "assets/covers/gta_vc.jpg";
  const counts = game.earnedTrophies || { bronze: 0, silver: 0, gold: 0, platinum: 0 };
  const trophies = game.trophies || [];

  body.innerHTML = `
    <!-- Game Hero Banner -->
    <div class="tc-game-hero-banner">
      <img src="${thumb}" alt="${escapeHtml(game.titleName)}" class="tc-game-hero-thumb" onerror="this.src='assets/covers/gta_vc.jpg'">
      <div class="tc-game-hero-info">
        <h2 class="tc-game-hero-title">${escapeHtml(game.titleName)}</h2>
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
          <span class="tc-platform-badge">${game.platform || 'PS5'}</span>
          <span style="font-size:12.5px; color:rgba(255,255,255,0.6);">${isRu ? "Всего призов:" : "Total trophies:"} ${game.totalTrophiesCount || trophies.length}</span>
        </div>
        <div class="tc-game-progress-row" style="max-width:400px;">
          <div class="tc-game-progress-track">
            <div class="tc-game-progress-fill" style="width:${game.progress}%;"></div>
          </div>
          <span class="tc-game-progress-val">${game.progress}%</span>
        </div>
        <div class="tc-game-cups-mini" style="margin-top:8px;">
          <span class="tc-mini-cup tc-mini-cup--plat">🏆 ${counts.platinum || 0}</span>
          <span class="tc-mini-cup tc-mini-cup--gold">🥇 ${counts.gold || 0}</span>
          <span class="tc-mini-cup tc-mini-cup--silver">🥈 ${counts.silver || 0}</span>
          <span class="tc-mini-cup tc-mini-cup--bronze">🥉 ${counts.bronze || 0}</span>
        </div>
      </div>
    </div>

    <!-- Trophies List -->
    <div class="tc-trophy-list">
      ${trophies.length === 0 ? `
        <div style="padding:32px; text-align:center; color:rgba(255,255,255,0.4); font-size:14px;">
          ${isRu ? "Список индивидуальных призов игры подгружается..." : "Trophy list is loading..."}
        </div>
      ` : trophies.map(t => {
        const isEarned = !!t.earned;
        const iconSrc = t.trophyIconUrl || thumb;
        const gradeClass = `tc-trophy-grade-badge--${t.trophyType || 'bronze'}`;

        return `
          <div class="tc-trophy-item ${isEarned ? 'is-earned' : 'is-locked'}">
            <img src="${iconSrc}" alt="${escapeHtml(t.trophyName)}" class="tc-trophy-thumb" onerror="this.src='${thumb}'">
            <div class="tc-trophy-content">
              <div class="tc-trophy-name-row">
                <span class="tc-trophy-name">${escapeHtml(t.trophyName)}</span>
                <span class="tc-trophy-grade-badge ${gradeClass}">${(t.trophyType || 'bronze').toUpperCase()}</span>
              </div>
              <span class="tc-trophy-desc">${escapeHtml(t.trophyDetail || '')}</span>
            </div>
            <div class="tc-trophy-status-col">
              ${isEarned 
                ? `<span class="tc-earned-date">✓ ${formatTrophyDate(t.earnedDateTime, isRu)}</span>`
                : `<span class="tc-locked-text">🔒 ${isRu ? "Не получено" : "Locked"}</span>`
              }
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
}

function closeGameTrophiesDetail() {
  const modal = $("#modalGameTrophiesDetail");
  if (!modal || !modal.classList.contains("active")) return;
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  SoundEngine.cancel();
}

function openPsnJsonImportModal() {
  closeSettings();
  const modal = $("#modalPsnJsonImport");
  const txt = $("#txtJsonImport");
  const err = $("#jsonImportError");
  if (!modal) return;
  if (txt) txt.value = "";
  if (err) err.style.display = "none";

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  SoundEngine.openDialog();
}

function closePsnJsonImportModal() {
  const modal = $("#modalPsnJsonImport");
  if (!modal || !modal.classList.contains("active")) return;
  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  SoundEngine.cancel();
}

function submitPsnJsonImport() {
  const txtEl = $("#txtJsonImport");
  const errEl = $("#jsonImportError");
  if (!txtEl || !errEl) return;

  const val = txtEl.value.trim();
  if (!val) {
    errEl.textContent = state.lang === "ru" ? "Вставьте JSON с данными" : "Please paste JSON data";
    errEl.style.display = "block";
    return;
  }

  const res = psnService.importFromJSON(val);
  if (!res.success) {
    errEl.textContent = res.error;
    errEl.style.display = "block";
    SoundEngine.error();
    return;
  }

  closePsnJsonImportModal();
  SoundEngine.trophyToast();
  showToast(
    state.lang === "ru" ? "Импорт призов PSN" : "PSN Trophy Import",
    state.lang === "ru" ? `✓ Успешно импортировано ${res.count} игр` : `✓ Successfully imported ${res.count} games`,
    PS5Icons.trophy
  );
  applyLanguageAndTelemetry();
}

function openPsnSyncDetailsModal() {
  const isRu = state.lang === "ru";
  const { profile, games, syncSource } = psnService.getData();
  const onlineId = profile?.onlineId || "Cr1mnsx";
  const total = profile?.totalTrophies || 0;
  const level = profile?.trophyLevel || 1;

  const html = `
    <div style="display:flex; flex-direction:column; gap:16px; margin-top:8px;">
      <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-radius:14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
        <div style="display:flex; align-items:center; gap:14px;">
          <img src="${profile?.avatarUrl || 'assets/covers/gta_vc.jpg'}" style="width:44px; height:44px; border-radius:50%; object-fit:cover;" alt="Avatar" onerror="this.src='assets/covers/gta_vc.jpg'">
          <div>
            <div style="font-weight:700; font-size:15px; color:#ffffff;">${onlineId}</div>
            <div style="font-size:12.5px; color:rgba(255,255,255,0.5);">PlayStation Network Online ID</div>
          </div>
        </div>
        <span style="padding:4px 10px; border-radius:999px; background:rgba(34,197,94,0.15); color:#22c55e; font-size:12px; font-weight:700;">● Активен</span>
      </div>

      <div class="modal-spec-grid">
        <div class="spec-cell">
          <span class="spec-label">Уровень PSN</span>
          <span class="spec-value" style="color:#f59e0b;">Level ${level}</span>
        </div>
        <div class="spec-cell">
          <span class="spec-label">Всего призов</span>
          <span class="spec-value">${Number(total).toLocaleString()}</span>
        </div>
        <div class="spec-cell">
          <span class="spec-label">Игр в библиотеке</span>
          <span class="spec-value">${games.length}</span>
        </div>
        <div class="spec-cell">
          <span class="spec-label">Платиновые призы</span>
          <span class="spec-value" style="color:#38bdf8;">🏆 ${profile?.platinum || 0}</span>
        </div>
      </div>

      <div style="padding:16px; background:rgba(0,112,209,0.08); border:1px solid rgba(0,112,209,0.25); border-radius:14px;">
        <div style="font-weight:700; font-size:13.5px; color:#38bdf8; margin-bottom:6px;">
          ${isRu ? "Автоматическое обновление 24/7 (GitHub Actions)" : "Automatic 24/7 Sync (GitHub Actions)"}
        </div>
        <div style="font-size:12.5px; color:rgba(255,255,255,0.7); line-height:1.5;">
          ${isRu 
            ? "Для автоматической синхронизации новых призов с вашей PS5 добавьте токен NPSSO в Secrets репозитория GitHub:<br>1. Получите токен на <code>ca.account.sony.com/api/v1/ssocookie</code><br>2. Добавьте секрет <code>PSN_NPSSO</code> в GitHub Settings → Secrets → Actions.<br>Синхронизация запускается каждые 45 минут без передачи пароля."
            : "For automatic trophy updates from your PS5, add your NPSSO token to GitHub Repository Secrets:<br>1. Obtain your token at <code>ca.account.sony.com/api/v1/ssocookie</code><br>2. Add secret <code>PSN_NPSSO</code> under Settings → Secrets → Actions.<br>Sync runs every 45 minutes automatically."
          }
        </div>
      </div>
    </div>
  `;

  openModal({
    tag: "PSN TROPHY SYNC",
    title: isRu ? "Синхронизация PlayStation Network" : "PlayStation Network Sync",
    subtitle: isRu ? "Статус подключения и автоматическое обновление" : "Connection status and automated updates",
    content: html,
    isWide: true,
    actions: [
      { text: isRu ? "Синхронизировать сейчас" : "Sync Now", primary: true, action: "act:psn_sync_now" },
      { text: isRu ? "Импорт JSON" : "Import JSON", primary: false, action: "modal:psn_json_import" },
      { text: isRu ? "Сбросить кэш" : "Reset Cache", primary: false, action: "act:psn_disconnect" }
    ]
  });
}

function openTrophiesModal(gameId = "gta-vc") {
  openTrophyCollectionModal();
}

function openPSNModal() {
  openTrophyCollectionModal();
}

function openStoreModal() {
  const isRu = state.lang === "ru";
  SoundEngine.confirm();

  const trending = [
    { id: "re-req", title: "Resident Evil Requiem", price: "$69.99", badge: "PS5", thumb: "assets/covers/cyberpunk.jpg" },
    { id: "gta-6", title: "Grand Theft Auto VI", price: isRu ? "Скоро" : "Just announced", badge: "PS5", thumb: "assets/covers/gta_vc.jpg" },
    { id: "marathon", title: "Marathon", price: "$39.99", badge: "PS5", thumb: "assets/covers/doom.jpg" },
    { id: "cod", title: "Call of Duty®", price: isRu ? "В библиотеке" : "In library", badge: "PS5 | PS4", thumb: "assets/covers/quake3.jpg" },
    { id: "wolverine", title: "Marvel's Wolverine", price: isRu ? "Скоро" : "Just announced", badge: "PS5", thumb: "assets/covers/nfs_u2.jpg" },
    { id: "gtav", title: "Grand Theft Auto V", price: isRu ? "В библиотеке" : "In library", badge: "PS5 | PS4", thumb: "assets/covers/gta_v.jpg" }
  ];

  const html = `
    <div class="ps5-store-shell">
      <div class="ps5-store-top-tabs">
        <span class="ps5-store-top-tab active">${isRu ? "Игры" : "Games"}</span>
        <span class="ps5-store-top-tab">${isRu ? "Мультимедиа" : "Media"}</span>
        <span class="ps5-store-top-tab">${isRu ? "Игроки" : "Players"}</span>
      </div>

      <div class="ps5-store-search-bar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" class="ps5-store-search-input" id="inputStoreModalSearch" placeholder="${isRu ? "Поиск игр, дополнений и приложений..." : "Search for games, add-ons, and apps..."}" autocomplete="off" />
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
      </div>

      <div style="display:flex; flex-direction:column; gap:12px;">
        <span class="ps5-store-section-title">${isRu ? "Популярные игры (Trending)" : "Trending games"}</span>
        <div class="ps5-store-trending-grid">
          ${trending.map(g => `
            <div class="ps5-store-game-tile" data-store-gid="${g.id}">
              <img src="${g.thumb}" class="ps5-store-tile-thumb" alt="${g.title}" />
              <div class="ps5-store-tile-body">
                <div class="ps5-store-tile-badges">
                  <span class="ps5-badge-plat">${g.badge}</span>
                </div>
                <span class="ps5-store-tile-name">${g.title}</span>
                <span class="ps5-store-tile-price">${g.price}</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:12px; margin-top:4px;">
        <span class="ps5-store-section-title">${isRu ? "Подписки PlayStation Plus и сервисы" : "PlayStation Plus and other subscriptions"}</span>
        <div class="ps5-store-subs-row">
          <div class="ps5-store-sub-card" id="cardSubPsPlus">
            <div class="ps5-store-sub-logo psplus">+</div>
            <div>
              <div class="ps5-store-sub-name">PlayStation Plus</div>
              <div class="ps5-store-sub-hint">${isRu ? "Каталог 400+ игр, онлайн мультиплеер" : "400+ games catalog, online multiplayer"}</div>
            </div>
          </div>

          <div class="ps5-store-sub-card" id="cardSubEaPlay">
            <div class="ps5-store-sub-logo eaplay">EA</div>
            <div>
              <div class="ps5-store-sub-name">EA Play</div>
              <div class="ps5-store-sub-hint">${isRu ? "Ранний доступ, 10% скидки в Store" : "Early access trials, 10% member discount"}</div>
            </div>
          </div>

          <div class="ps5-store-sub-card" id="cardSubGtaPlus">
            <div class="ps5-store-sub-logo gtaplus">GTA+</div>
            <div>
              <div class="ps5-store-sub-name">GTA+</div>
              <div class="ps5-store-sub-hint">${isRu ? "$500,000 каждый месяц, эксклюзивные авто" : "$500,000 monthly, exclusive vehicles"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  openModal({
    tag: "PLAYSTATION®STORE",
    title: "PlayStation™Store",
    subtitle: isRu ? "Официальная витрина цифровых игр, предзаказов и подписок PS5" : "Official digital games, pre-orders and subscription hub",
    content: html,
    isWide: true,
    actions: []
  });

  const cardEl = $("#modalOverlay .modal-card");
  if (cardEl) cardEl.classList.add("ultra-wide");

  $("#modalOverlay")?.querySelectorAll(".ps5-store-game-tile").forEach(tile => {
    tile.onclick = () => {
      SoundEngine.purchaseUniversalCheckout();
      const gid = tile.dataset.storeGid;
      const g = trending.find(x => x.id === gid);
      if (g) {
        addWishlistItem({ id: g.id, title: g.title, sub: "PS Store" });
      }
    };
  });

  $("#modalOverlay")?.querySelectorAll(".ps5-store-sub-card").forEach(card => {
    card.onclick = () => {
      SoundEngine.purchaseUniversalCheckout();
      showToast("PlayStation Store", isRu ? "Информация о подписке загружена" : "Subscription details loaded", PS5Icons.star);
    };
  });
}

function openMediaGalleryModal() {
  const isRu = state.lang === "ru";
  SoundEngine.confirm();

  const galleryItems = [
    { title: "Ocean Drive Sunset", game: "Grand Theft Auto: Vice City", thumb: "assets/covers/gta_vc.jpg", trophy: "🏆 Король Вайс-Сити", date: "17/7/2026", res: "3840×2160 HDR" },
    { title: "Los Santos Vinewood Skyline", game: "Grand Theft Auto V", thumb: "assets/covers/gta_v.jpg", trophy: "🏆 Добро пожаловать", date: "12/7/2026", res: "3840×2160 HDR" },
    { title: "Bayview Drift Circuit Final", game: "Need for Speed Underground 2", thumb: "assets/covers/nfs_u2.jpg", trophy: "🥇 Король дрифта", date: "05/7/2026", res: "1920×1080 60fps" },
    { title: "Springfield Downtown Cruise", game: "The Simpsons Hit & Run", thumb: "assets/covers/simpsons.png", trophy: "🥉 В пончиках сила", date: "28/6/2026", res: "1920×1080 60fps" },
    { title: "Mars Phobos Arena Overdrive", game: "DOOM", thumb: "assets/covers/doom.jpg", trophy: "🥈 BFG 9000", date: "19/6/2026", res: "3840×2160 HDR" },
    { title: "The Longest Yard Railgun Frag", game: "Quake III Arena", thumb: "assets/covers/quake3.jpg", trophy: "🥇 Quad Damage", date: "10/6/2026", res: "1920×1080 120fps" }
  ];

  const html = `
    <div class="ps5-mg-shell">
      <div class="ps5-mg-tabs-row">
        <div class="ps5-mg-tabs">
          <button type="button" class="ps5-mg-tab active">${isRu ? "Все" : "All"}</button>
          <button type="button" class="ps5-mg-tab">${isRu ? "Избранное" : "Favourites"}</button>
          <button type="button" class="ps5-mg-tab">${isRu ? "Призы" : "Trophies"}</button>
          <button type="button" class="ps5-mg-tab">${isRu ? "Альбомы" : "Albums"}</button>
        </div>
        <span style="font-size:12px; color:rgba(255,255,255,0.5);">${isRu ? "Сортировка: По дате" : "Sort by: Date"}</span>
      </div>

      <div class="ps5-mg-grid">
        ${galleryItems.map((item, idx) => `
          <div class="ps5-mg-card" data-mg-idx="${idx}" title="${item.title} (${item.game})">
            <img src="${item.thumb}" alt="${item.title}" />
            <div class="ps5-mg-trophy-badge">${item.trophy}</div>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  openModal({
    tag: "MEDIA GALLERY",
    title: isRu ? "Галерея мультимедиа PS5" : "Media Gallery",
    subtitle: isRu ? "Снимки экрана 4K HDR и видеозаписи игрового процесса" : "4K HDR Screenshots and gameplay video captures",
    content: html,
    isWide: true,
    actions: []
  });

  const cardEl = $("#modalOverlay .modal-card");
  if (cardEl) cardEl.classList.add("ultra-wide");

  $("#modalOverlay")?.querySelectorAll(".ps5-mg-card").forEach(card => {
    card.onclick = () => {
      const idx = parseInt(card.dataset.mgIdx, 10);
      const it = galleryItems[idx];
      if (it) openMediaLightbox(it);
    };
  });
}

function openMediaLightbox(item) {
  const isRu = state.lang === "ru";
  SoundEngine.takeScreenshot();

  const html = `
    <div style="display:flex; flex-direction:column; gap:14px; width:100%;">
      <div style="position:relative; width:100%; aspect-ratio:16/9; border-radius:14px; overflow:hidden; background:#000; box-shadow:0 14px 40px rgba(0,0,0,0.8);">
        <img src="${item.thumb}" style="width:100%; height:100%; object-fit:contain;" alt="${item.title}" />
        <div style="position:absolute; bottom:12px; left:12px; padding:4px 10px; border-radius:6px; background:rgba(0,0,0,0.8); color:#ffffff; font-size:12px; font-weight:600; border:1px solid rgba(255,255,255,0.2);">
          ${item.trophy}
        </div>
      </div>

      <div class="modal-spec-grid">
        <div class="modal-spec-box"><span class="spec-label">${isRu ? "Игра" : "Game"}</span><span class="spec-val">${item.game}</span></div>
        <div class="modal-spec-box"><span class="spec-label">${isRu ? "Разрешение" : "Resolution"}</span><span class="spec-val">${item.res}</span></div>
        <div class="modal-spec-box"><span class="spec-label">${isRu ? "Дата снимка" : "Date"}</span><span class="spec-val">${item.date}</span></div>
        <div class="modal-spec-box"><span class="spec-label">${isRu ? "Формат" : "Format"}</span><span class="spec-val">PNG 4K (Ultra HD)</span></div>
      </div>
    </div>
  `;

  openModal({
    tag: "CAPTURE PREVIEW",
    title: item.title,
    subtitle: item.game,
    content: html,
    isWide: true,
    actions: [
      {
        text: isRu ? "Назад в галерею" : "Back to Gallery",
        primary: true,
        action: "modal:back_gallery"
      }
    ]
  });
}

function openNetworkDiagnosticsModal() {
  const isRu = state.lang === "ru";
  const isOnline = navigator.onLine;
  const conn = navigator.connection || {};
  const effType = conn.effectiveType ? conn.effectiveType.toUpperCase() : "Wi-Fi 6 (802.11ax)";
  const rtt = conn.rtt ? `${conn.rtt} ms` : "22 ms";

  const html = `
    <div style="display:flex; flex-direction:column; gap:14px; margin-top:8px;">
      <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 18px; border-radius:14px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="width:10px; height:10px; border-radius:50%; background:#94a3b8; box-shadow:0 0 10px rgba(148, 163, 184, 0.7);"></span>
          <span style="font-weight:600; font-size:14.5px;">${isRu ? "Состояние подключения к сети" : "Network Connection Status"}</span>
        </div>
        <span style="font-size:13px; font-weight:700; color:#94a3b8;">${isRu ? "Статус не проверен" : "Status unverified"}</span>
      </div>

      <div class="modal-spec-grid">
        <div class="modal-spec-box"><span class="spec-label">${isRu ? "Тип соединения" : "Connection Type"}</span><span class="spec-val">${effType}</span></div>
        <div class="modal-spec-box"><span class="spec-label">${isRu ? "Задержка (Ping)" : "Round Trip Latency"}</span><span class="spec-val">${rtt}</span></div>
        <div class="modal-spec-box"><span class="spec-label">${isRu ? "Шифрование" : "Security"}</span><span class="spec-val">WPA3-Personal</span></div>
        <div class="modal-spec-box"><span class="spec-label">NAT Type</span><span class="spec-val">Type 2 (Moderate)</span></div>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; margin-top:6px;">
        <span style="font-size:13px; font-weight:600; color:rgba(255,255,255,0.7);">${isRu ? "Службы PlayStation Network:" : "PlayStation Network Services:"}</span>
        <div style="display:flex; justify-content:space-between; font-size:12.5px; padding:8px 12px; background:rgba(255,255,255,0.03); border-radius:8px;">
          <span>${isRu ? "Управление учетной записью" : "Account Management"}</span>
          <span style="color:#94a3b8; font-weight:600;">● ${isRu ? "Статус не проверен" : "Status unverified"}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:12.5px; padding:8px 12px; background:rgba(255,255,255,0.03); border-radius:8px;">
          <span>${isRu ? "Игры и социальные сети" : "Gaming and Social"}</span>
          <span style="color:#94a3b8; font-weight:600;">● ${isRu ? "Статус не проверен" : "Status unverified"}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:12.5px; padding:8px 12px; background:rgba(255,255,255,0.03); border-radius:8px;">
          <span>${isRu ? "PlayStation Store" : "PlayStation Store"}</span>
          <span style="color:#94a3b8; font-weight:600;">● ${isRu ? "Статус не проверен" : "Status unverified"}</span>
        </div>
      </div>
    </div>
  `;

  openModal({
    tag: "PLAYSTATION®NETWORK",
    title: isRu ? "Диагностика сети PS5" : "PS5 Network Diagnostics",
    subtitle: isRu ? "Проверка сетевого оборудования и служб PlayStation Network" : "Network status and PlayStation Network services check",
    content: html,
    isWide: true,
    actions: [
      {
        text: isRu ? "Повторить проверку" : "Test Connection",
        primary: true,
        action: "modal:test_network"
      }
    ]
  });
}

function openRemotePlayModal() {
  const isRu = state.lang === "ru";
  const pin = Math.floor(10000000 + Math.random() * 90000000);
  const html = `
    <div style="display:flex; flex-direction:column; gap:16px; margin-top:8px;">
      <p style="font-size:14px; color:rgba(255,255,255,0.8); line-height:1.5;">
        ${isRu ? "Транслируйте игры с консоли PlayStation®5 на ваш ПК, Mac, смартфон iOS / Android или устройство PlayStation Portal с разрешением до 1080p и 60 FPS с поддержкой DualSense." : "Stream games from your PlayStation®5 console to your PC, Mac, iOS/Android device or PlayStation Portal with up to 1080p 60 FPS and full DualSense haptics."}
      </p>

      <div style="display:flex; align-items:center; justify-content:space-between; padding:18px 22px; border-radius:14px; background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.25);">
        <div>
          <span style="font-size:12px; font-weight:600; color:#38bdf8; letter-spacing:0.06em; text-transform:uppercase;">${isRu ? "Одноразовый код сопряжения" : "Pairing PIN"}</span>
          <div style="font-size:28px; font-weight:800; letter-spacing:0.18em; color:#ffffff; font-family:monospace; margin-top:4px;">${pin}</div>
        </div>
        <span style="font-size:11.5px; color:rgba(255,255,255,0.5);">${isRu ? "Действителен 300 сек" : "Expires in 300s"}</span>
      </div>

      <div class="modal-spec-grid">
        <div class="modal-spec-box"><span class="spec-label">${isRu ? "Рекомендуемая сеть" : "Recommended Network"}</span><span class="spec-val">5 GHz Wi-Fi / LAN 1 Gbps</span></div>
        <div class="modal-spec-box"><span class="spec-label">${isRu ? "Качество потока" : "Stream Quality"}</span><span class="spec-val">1080p 60 FPS HDR</span></div>
      </div>
    </div>
  `;

  openModal({
    tag: "PS REMOTE PLAY",
    title: isRu ? "Дистанционная игра PS Remote Play" : "PlayStation Remote Play",
    subtitle: isRu ? "Подключение портативных устройств и ПК к вашей PlayStation®5" : "Connect portable devices and PCs to your PlayStation®5",
    content: html,
    isWide: true,
    actions: []
  });
}

const DEFAULT_WISHLIST = [
  { id: "gta-6", title: "GTA VI", sub: "Rockstar Games" },
  { id: "ds2", title: "Death Stranding 2", sub: "Kojima Productions" },
  { id: "wolverine", title: "Marvel's Wolverine", sub: "PlayStation Studios" }
];

function getWishlistItems() {
  try {
    const raw = localStorage.getItem("ps5_wishlist_items");
    if (!raw) {
      localStorage.setItem("ps5_wishlist_items", JSON.stringify(DEFAULT_WISHLIST));
      return DEFAULT_WISHLIST;
    }
    const items = JSON.parse(raw);
    return Array.isArray(items)
      ? items.map(i => i.id === "wolverine" ? { ...i, sub: "PlayStation Studios" } : i)
      : DEFAULT_WISHLIST;
  } catch (e) {
    return DEFAULT_WISHLIST;
  }
}

function saveWishlistItems(items) {
  try {
    localStorage.setItem("ps5_wishlist_items", JSON.stringify(items));
  } catch (e) {}
}

function formatGamePlural(n, isRu) {
  if (!isRu) return `${n} ${n === 1 ? 'game' : 'games'}`;
  const rem10 = n % 10;
  const rem100 = n % 100;
  if (rem10 === 1 && rem100 !== 11) return `${n} игра`;
  if (rem10 >= 2 && rem10 <= 4 && (rem100 < 10 || rem100 >= 20)) return `${n} игры`;
  return `${n} игр`;
}

function renderWelcomeWishlist() {
  const container = $("#welcomeWishlistItems");
  const countBadge = $("#lblWishlistCount");
  if (!container) return;
  const items = getWishlistItems();
  const isRu = state.lang === "ru";

  if (countBadge) {
    countBadge.textContent = formatGamePlural(items.length, isRu);
  }

  if (!items || items.length === 0) {
    container.innerHTML = `<span class="ps5-wtag-empty">${isRu ? "Список желаемого пуст. Добавляйте игры из PS Store." : "Wishlist is empty. Add games from PS Store."}</span>`;
    return;
  }

  container.innerHTML = items.map(it => `
    <span class="ps5-wtag" data-id="${it.id}">
      <span>${escapeHtml(it.title)}</span>
      <button type="button" class="ps5-wtag-del" data-del-id="${it.id}" title="${isRu ? "Удалить из списка" : "Remove"}">×</button>
    </span>
  `).join("");

  container.querySelectorAll(".ps5-wtag-del").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const delId = btn.dataset.delId;
      removeWishlistItem(delId);
    };
  });
}

function removeWishlistItem(id) {
  const isRu = state.lang === "ru";
  const items = getWishlistItems().filter(i => i.id !== id);
  saveWishlistItems(items);
  SoundEngine.back();
  renderWelcomeWishlist();
  showToast(isRu ? "Список желаемого" : "Wishlist", isRu ? "Игра удалена из списка желаемого" : "Game removed from wishlist", PS5Icons.heart);
}

function addWishlistItem(item) {
  const isRu = state.lang === "ru";
  const items = getWishlistItems();
  if (items.some(i => i.id === item.id)) {
    showToast(isRu ? "Список желаемого" : "Wishlist", isRu ? `«${item.title}» уже в списке желаемого` : `"${item.title}" is already in wishlist`, PS5Icons.heart);
    return;
  }
  items.push(item);
  saveWishlistItems(items);
  SoundEngine.confirm();
  renderWelcomeWishlist();
  showToast(isRu ? "Список желаемого" : "Wishlist", isRu ? `«${item.title}» добавлена в список желаемого` : `"${item.title}" added to wishlist`, PS5Icons.heart);
}

function updateNetworkWidgetStatus() {
  const isRu = state.lang === "ru";
  const subEl = $("#lblNetworkStatusSub");
  const dotEl = $("#widgetNetworkStatus .ps5-green-dot");

  if (subEl) {
    subEl.textContent = isRu ? "Статус не проверен" : "Status unverified";
  }
  if (dotEl) {
    dotEl.style.background = "#94a3b8";
    dotEl.style.boxShadow = "0 0 8px rgba(148, 163, 184, 0.7)";
  }
}

window.addEventListener("online", updateNetworkWidgetStatus);
window.addEventListener("offline", updateNetworkWidgetStatus);

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
  SoundEngine.openDialog();
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

  const modalGameLibrary = document.getElementById('modalGameLibrary');
  if (modalGameLibrary) {
    modalGameLibrary.addEventListener('click', (e) => {
      if (e.target === modalGameLibrary) closeLibraryModal();
    });
  }

  document.querySelectorAll('.lib-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lib-view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLibView = btn.dataset.view;
      SoundEngine.changePanel();
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
  SoundEngine.informativeToasts();
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
  if (action === "test_sound") {
    const res = SoundEngine.testSound("ui");
    return showToast(
      state.lang === "ru" ? "Проверка звука PS5" : "PS5 Audio Test",
      res.isLoaded
        ? (state.lang === "ru" ? `✓ Звук «${res.soundKey}» (${res.file}) воспроизведен` : `✓ Sound "${res.soundKey}" (${res.file}) played`)
        : (state.lang === "ru" ? `⚠ Файл «${res.file}» отсутствует в assets/audio/` : `⚠ File "${res.file}" missing in assets/audio/`),
      res.isLoaded ? PS5Icons.soundOn : PS5Icons.soundMuted
    );
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
  if (action === "open:ps5_sounds" || action === "modal:ps5_sounds") {
    state.settingsSection = "ps5_sounds";
    openSettings();
    return;
  }
  if (action === "modal:trophy_collection" || action === "modal:trophies") return openTrophyCollectionModal();
  if (action === "modal:psn_sync_details") return openPsnSyncDetailsModal();
  if (action === "modal:psn_json_import") return openPsnJsonImportModal();
  if (action === "act:psn_sync_now") {
    closeModal();
    SoundEngine.enter();
    showToast(
      state.lang === "ru" ? "Синхронизация PSN" : "PSN Sync",
      state.lang === "ru" ? "Проверка и загрузка трофеев..." : "Checking and syncing trophies...",
      PS5Icons.trophy
    );
    psnService.syncNow().then((data) => {
      SoundEngine.trophyToast();
      showToast(
        state.lang === "ru" ? "Трофеи обновлены" : "Trophies Updated",
        state.lang === "ru" ? `✓ Синхронизировано ${data.games?.length || 0} игр и ${data.profile?.totalTrophies || 0} призов` : `✓ Synced ${data.games?.length || 0} games and ${data.profile?.totalTrophies || 0} trophies`,
        PS5Icons.trophy
      );
      applyLanguageAndTelemetry();
    }).catch(() => {
      SoundEngine.error();
      showToast(
        state.lang === "ru" ? "Ошибка синхронизации" : "Sync Error",
        state.lang === "ru" ? "Не удалось связаться с сервером" : "Could not reach sync server",
        PS5Icons.error
      );
    });
    return;
  }
  if (action === "act:psn_disconnect") {
    closeModal();
    psnService.disconnect();
    SoundEngine.cancel();
    showToast(
      state.lang === "ru" ? "PSN Профиль" : "PSN Profile",
      state.lang === "ru" ? "Локальные данные сброшены" : "Local data reset to defaults",
      PS5Icons.info
    );
    applyLanguageAndTelemetry();
    return;
  }
  if (action === "modal:psn") return openPSNModal();
  if (action === "modal:trophies") return openTrophiesModal();
  if (action === "modal:store") return openStoreModal();
  if (action === "modal:remote_play") return openRemotePlayModal();
  if (action === "modal:media-gallery" || action === "modal:back_gallery") return openMediaGalleryModal();
  if (action === "modal:test_network") return openNetworkDiagnosticsModal();
  if (action === "modal:library") return openLibraryModal();
  if (action.startsWith("select:")) {
    const tileId = action.slice(7);
    closeModal();
    if ($("#searchOverlay")?.classList.contains("active")) closeSearch();
    if (state.category !== "games") switchCategory("games");
    return selectTile(tileId, true);
  }
  if (action === "launch:gtavc") return launchPlayableGame("gta-vc");
  if (action.startsWith("launch:")) {
    const gameId = action.slice(7);
    return launchPlayableGame(gameId);
  }
  if (action === "open:youtube") return window.open("https://youtube.com/gaming", "_blank", "noopener");
  if (action === "open:twitch") return window.open("https://twitch.tv", "_blank", "noopener");

  const mapByAction = {
    "modal:slot-1": "slot-01",
    "modal:slot-2": "slot-02",
    "modal:slot-3": "slot-03",
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
  const willBeActive = !menu.classList.contains("active");
  menu.classList.toggle("active", willBeActive);
  menu.setAttribute("aria-hidden", String(!willBeActive));
  if (willBeActive) {
    SoundEngine.openOptionMenu();
  } else {
    SoundEngine.closeOptionMenu();
  }
}

function closeContextMenu() {
  const menu = $("#contextMenu");
  if (!menu.classList.contains("active")) return;
  menu.classList.remove("active");
  menu.setAttribute("aria-hidden", "true");
  SoundEngine.closeOptionMenu();
}

function getTopbarItems() {
  return [
    $("#tabGames"),
    $("#tabMedia"),
    $("#btnSberTips"),
    $("#btnLangToggle"),
    $("#muteBtn"),
    $("#btnSearch"),
    $("#btnNotifications"),
    $("#btnSettings"),
    $("#btnProfile")
  ].filter(Boolean);
}

function handleKeydown(e) {
  const sberOpen = $("#modalSberTips") && $("#modalSberTips").classList.contains("active");
  const friendAddOpen = $("#modalAddFriend") && $("#modalAddFriend").classList.contains("active");
  const friendReqOpen = $("#modalFriendRequests") && $("#modalFriendRequests").classList.contains("active");
  const modalOpen = $("#modalOverlay") && $("#modalOverlay").classList.contains("active");
  const searchOpen = $("#searchOverlay") && $("#searchOverlay").classList.contains("active");
  const settingsOpen = $("#settingsOverlay") && $("#settingsOverlay").classList.contains("active");
  const libOpen = $("#modalGameLibrary") && $("#modalGameLibrary").classList.contains("active");
  const inGameOpen = $("#inGameWindow") && $("#inGameWindow").classList.contains("active");

  if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) {
    if (e.key === "Backspace") {
      SoundEngine.backspace();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      SoundEngine.textInput();
    }
  }

  if (e.key === "Escape" || e.key === "o" || e.key === "O") {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") && e.key !== "Escape") {
      return;
    }
    e.preventDefault();
    if (inGameOpen) return closeInGameWindow();
    if (libOpen) return closeLibraryModal();
    if (friendAddOpen) return closeAddFriendModal();
    if (friendReqOpen) return closeFriendRequestsModal();
    if (sberOpen) return closeSberTips();
    if (modalOpen) return closeModal();
    if (searchOpen) return closeSearch();
    if (settingsOpen) return closeSettings();
    if (state.isControlCenterOpen) return closeControlCenter();
    if (state.isHubOpen) return closeGameHub();
    return selectTile("welcome", true);
  }

  if (sberOpen || modalOpen || searchOpen || settingsOpen || friendAddOpen || friendReqOpen || libOpen || inGameOpen) return;

  if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;

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

  const topbarItems = getTopbarItems();
  const currentFocused = document.activeElement;
  const topbarIndex = topbarItems.indexOf(currentFocused);

  // If focus is inside the Top Navigation / System Bar
  if (topbarIndex !== -1) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex = Math.min(topbarItems.length - 1, topbarIndex + 1);
      topbarItems[nextIndex].focus();
      SoundEngine.navigate();
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIndex = Math.max(0, topbarIndex - 1);
      topbarItems[prevIndex].focus();
      SoundEngine.navigate();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const activeTile = document.querySelector(".ps5-tile.is-active");
      if (activeTile) {
        activeTile.focus({ preventScroll: true });
        SoundEngine.navigate();
      }
      return;
    }
    if (e.key === "Enter" || e.key === "x" || e.key === "X") {
      e.preventDefault();
      currentFocused.click();
      return;
    }
  }

  // If focus is in Game Carousel / Main Stage
  const list = getCurrentList();
  const idx = list.findIndex((it) => it.id === state.activeId);

  if (e.key === "ArrowRight") {
    e.preventDefault();
    if (!state.isHubOpen) {
      const nextId = list[(idx + 1) % list.length].id;
      selectTile(nextId, true);
      const nextTile = document.querySelector(`.ps5-tile[data-tile-id="${nextId}"]`);
      if (nextTile) nextTile.focus({ preventScroll: true });
    }
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    if (!state.isHubOpen) {
      const prevId = list[(idx - 1 + list.length) % list.length].id;
      selectTile(prevId, true);
      const prevTile = document.querySelector(`.ps5-tile[data-tile-id="${prevId}"]`);
      if (prevTile) prevTile.focus({ preventScroll: true });
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (state.isHubOpen) {
      closeGameHub();
    } else {
      const tabTarget = state.category === "games" ? $("#tabGames") : $("#tabMedia");
      if (tabTarget) {
        tabTarget.focus();
        SoundEngine.navigate();
      }
    }
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (!state.isHubOpen) {
      const active = getActiveItem();
      if (active?.viewType === "game") {
        openGameHub();
      } else {
        const firstWidget = $("#widgetFriends") || $(".ps5-widget");
        if (firstWidget) {
          firstWidget.focus();
          SoundEngine.navigate();
        }
      }
    }
  } else if (e.key === "Enter" || e.key === "x" || e.key === "X") {
    const active = getActiveItem();
    if (active) {
      e.preventDefault();
      if (active.id === "library") {
        handleAction("modal:library");
      } else if (active.btnAction) {
        handleAction(active.btnAction);
      } else if (active.viewType === "game") {
        openGameHub();
      }
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

  let localSavedUrl = null;
  try {
    localSavedUrl = localStorage.getItem('ps5_donate_url');
  } catch (_) {}
  if (localSavedUrl && typeof localSavedUrl === 'string') {
    const trimmed = localSavedUrl.trim();
    if (trimmed.startsWith('http') && !trimmed.includes('ваш_никнейм') && !trimmed.includes('your_nickname')) {
      sberConfig.target_url = trimmed;
      const match = trimmed.match(/\/r\/([a-zA-Z0-9_-]+)/);
      if (match) {
        sberConfig.nickname = match[1];
      }
    }
  }

  // Ensure target_url is valid and persistent
  if (!sberConfig.target_url || !sberConfig.target_url.startsWith('http') || sberConfig.target_url.includes('ваш_никнейм') || sberConfig.target_url.includes('your_nickname')) {
    sberConfig.target_url = 'https://www.donationalerts.com/r/cr1mnsx';
    sberConfig.nickname = 'cr1mnsx';
  }

  const input = $("#inputSberUrl");
  if (input) input.value = sberConfig.target_url;
  const author = $("#sberAuthorName");
  if (author && sberConfig.nickname) {
    author.textContent = `Получатель: @${sberConfig.nickname} (DonationAlerts)`;
  }

  const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port === '8090';
  const qrTarget = (isLocalHost && sberConfig.dynamic_url) ? sberConfig.dynamic_url : (sberConfig.target_url || 'https://www.donationalerts.com/r/cr1mnsx');
  renderSberQr(qrTarget);

  const directBtn = $("#btnSberPayDirect");
  if (directBtn) {
    directBtn.href = sberConfig.target_url || '#';
  }

  if (sberConfig.widget_token && !daLiveListener) {
    daLiveListener = new DonationAlertsLiveListener(sberConfig.widget_token);
    daLiveListener.connect();
  }
}

export function openSberTips() {
  SoundEngine.openDialog();
  const modal = $("#modalSberTips");
  if (modal) {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
  }
  loadSberConfig();
}

export function closeSberTips() {
  SoundEngine.cancel();
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
      const amount = b.dataset.amount;
      const directBtn = $("#btnSberPayDirect");
      if (directBtn) {
        const base = sberConfig.target_url || "https://www.donationalerts.com/r/cr1mnsx";
        directBtn.href = `${base}?amount=${amount}`;
      }
      SoundEngine.tick();
    });
  }

  const copyBtn = $("#btnSberCopyLink");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const donateUrl = sberConfig.target_url || "https://www.donationalerts.com/r/cr1mnsx";
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
      if (!newUrl || !newUrl.startsWith("http") || newUrl.includes("ваш_никнейм") || newUrl.includes("your_nickname")) {
        SoundEngine.errorInTextBox();
        if (statusEl) {
          statusEl.style.display = "block";
          statusEl.style.color = "#ef4444";
          statusEl.textContent = "Пожалуйста, укажите рабочую ссылку DonationAlerts (например: https://www.donationalerts.com/r/cr1mnsx)";
          setTimeout(() => { statusEl.style.display = "none"; }, 3500);
        }
        return;
      }
      SoundEngine.enter();
      try {
        localStorage.setItem('ps5_donate_url', newUrl);
      } catch (_) {}
      sberConfig.target_url = newUrl;
      const match = newUrl.match(/\/r\/([a-zA-Z0-9_-]+)/);
      if (match) {
        sberConfig.nickname = match[1];
        const author = $("#sberAuthorName");
        if (author) author.textContent = `Получатель: @${sberConfig.nickname} (DonationAlerts)`;
      }
      const directBtn = $("#btnSberPayDirect");
      if (directBtn) directBtn.href = newUrl;
      renderSberQr(newUrl);

      try {
        await fetch('/api/donate-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target_url: newUrl })
        });
      } catch (_) {}

      if (statusEl) {
        statusEl.style.display = "block";
        statusEl.style.color = "#22c55e";
        statusEl.textContent = "✓ Ссылка сохранена! Перенаправление обновлено.";
        setTimeout(() => { statusEl.style.display = "none"; }, 3000);
      }
    });
  }

  const directPayBtn = $("#btnSberPayDirect");
  if (directPayBtn) {
    directPayBtn.addEventListener("click", (e) => {
      if (!sberConfig.target_url || sberConfig.target_url === "#" || sberConfig.target_url.includes("ваш_никнейм")) {
        e.preventDefault();
        const panel = $("#sberSettingsPanel");
        const caret = $("#sberSettingsCaret");
        if (panel) panel.style.display = "block";
        if (caret) caret.classList.add("open");
        const urlInput = $("#inputSberUrl");
        if (urlInput) urlInput.focus();
        SoundEngine.errorInTextBox();
        showToast("DonationAlerts", "Укажите вашу ссылку на страницу донатов", PS5Icons.cross);
      }
    });
  }
}

/* =========================================================================
   PLAYSTATION 5 REAL FRIENDS SYSTEM & MODALS CONTROLLER
   ========================================================================= */
export function openAddFriendModal() {
  SoundEngine.openDialog();
  const modal = $("#modalAddFriend");
  if (!modal) return;

  const grid = $("#avatarPickerGrid");
  if (grid) {
    grid.innerHTML = PRESET_AVATARS.map((av) => `
      <button type="button" class="ps5-avatar-btn ${av.id === selectedAvatarId ? "selected" : ""}" data-avatar-id="${av.id}" title="${av.name}" style="background: ${av.bg};">
        ${av.icon}
      </button>
    `).join("");

    grid.querySelectorAll(".ps5-avatar-btn").forEach((btn) => {
      btn.onclick = () => {
        selectedAvatarId = btn.dataset.avatarId;
        grid.querySelectorAll(".ps5-avatar-btn").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        SoundEngine.focus();
      };
    });
  }

  const status = FriendsService.getBackendStatus();
  const statusEl = $("#txtBackendMode");
  if (statusEl) {
    statusEl.textContent = status.isLive ? "Supabase Live" : "Локальный режим";
  }

  const alertBox = $("#friendFormAlert");
  if (alertBox) {
    alertBox.hidden = true;
    alertBox.textContent = "";
    alertBox.className = "ps5-form-alert";
  }

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
}

export function closeAddFriendModal() {
  SoundEngine.cancel();
  const modal = $("#modalAddFriend");
  if (modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }
}

export function openFriendRequestsModal() {
  SoundEngine.openDialog();
  const modal = $("#modalFriendRequests");
  if (!modal) return;

  const status = FriendsService.getBackendStatus();
  const statusEl = $("#txtRequestsBackendMode");
  if (statusEl) {
    statusEl.textContent = status.isLive ? "Supabase Live" : "Локальный режим";
  }

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");

  switchRequestsTab("my");
}

export function closeFriendRequestsModal() {
  SoundEngine.cancel();
  const modal = $("#modalFriendRequests");
  if (modal) {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }
}

function switchRequestsTab(tab) {
  SoundEngine.changePanel();
  const tabMy = $("#tabBtnMyRequest");
  const tabOwner = $("#tabBtnOwnerManage");
  const panelMy = $("#panelMyRequest");
  const panelOwner = $("#panelOwnerManage");

  if (tab === "my") {
    tabMy.classList.add("active");
    tabOwner.classList.remove("active");
    panelMy.hidden = false;
    panelOwner.hidden = true;
    renderMyRequestTab();
  } else {
    tabOwner.classList.add("active");
    tabMy.classList.remove("active");
    panelMy.hidden = true;
    panelOwner.hidden = false;
    renderOwnerTab();
  }
}

function renderMyRequestTab() {
  const container = $("#myRequestContent");
  if (!container) return;

  const myReq = FriendsService.getMyRequest();
  if (!myReq) {
    container.innerHTML = `
      <div class="ps5-friends-empty">
        <p class="ps5-fe-title">Вы пока не отправляли заявку в друзья</p>
        <p class="ps5-fe-desc">Заполните анкету профиля, чтобы отправить заявку владельцу консоли.</p>
        <button type="button" class="ps5-btn-empty-add" id="btnMyReqAdd">
          <span>Отправить заявку</span>
        </button>
      </div>
    `;
    const btn = $("#btnMyReqAdd");
    if (btn) {
      btn.onclick = () => {
        closeFriendRequestsModal();
        openAddFriendModal();
      };
    }
    return;
  }

  const av = PRESET_AVATARS.find((a) => a.id === myReq.avatar) || PRESET_AVATARS[0];
  let statusBadge = "";
  if (myReq.status === "pending") {
    statusBadge = `<span class="ps5-status-tag status-pending">Ожидает подтверждения</span>`;
  } else if (myReq.status === "accepted") {
    statusBadge = `<span class="ps5-status-tag status-accepted">Принята (Вы в друзьях!)</span>`;
  } else if (myReq.status === "rejected") {
    statusBadge = `<span class="ps5-status-tag status-rejected">Отклонена</span>`;
  } else {
    statusBadge = `<span class="ps5-status-tag status-rejected">Заблокировано</span>`;
  }

  container.innerHTML = `
    <div class="ps5-my-request-card">
      <div class="ps5-mrc-top">
        <div class="ps5-mrc-user">
          <div class="ps5-friend-avatar-item" style="background: ${av.bg}; width: 44px; height: 44px;">
            <span>${av.icon}</span>
          </div>
          <div>
            <div class="ps5-friend-name" style="font-size: 15px;">${escapeHtml(myReq.displayName)}</div>
            <div class="ps5-friend-handle">@${escapeHtml(myReq.nickname)}</div>
          </div>
        </div>
        ${statusBadge}
      </div>
      ${myReq.bio ? `<p class="ps5-fe-desc" style="max-width: 100%;">${escapeHtml(myReq.bio)}</p>` : ""}
      <div style="font-size: 11px; color: rgba(255,255,255,0.4);">
        Дата отправки: ${new Date(myReq.createdAt).toLocaleString("ru-RU")}
      </div>
      <div style="display: flex; gap: 8px; margin-top: 6px;">
        <button type="button" class="sber-btn-secondary" style="font-size: 12px; height: 32px;" id="btnCancelMyRequest">Отозвать заявку</button>
      </div>
    </div>
  `;

  const btnCancel = $("#btnCancelMyRequest");
  if (btnCancel) {
    btnCancel.onclick = () => {
      FriendsService.deleteMyRequest();
      showToast("Заявка", "Ваша заявка отозвана", PS5Icons.star);
      renderMyRequestTab();
      renderWelcomeFriends();
    };
  }
}

async function renderOwnerTab() {
  const authBox = $("#ownerAuthBox");
  const feedBox = $("#ownerRequestsFeed");
  const list = $("#ownerRequestsList");

  if (!isOwnerUnlocked) {
    authBox.hidden = false;
    feedBox.hidden = true;
    return;
  }

  authBox.hidden = true;
  feedBox.hidden = false;

  const pin = $("#inputOwnerPin")?.value || "";
  try {
    const requests = await FriendsService.getFriendRequests(pin);
    if (!requests || requests.length === 0) {
      list.innerHTML = `<div class="ps5-friends-empty"><p class="ps5-fe-title">Нет входящих заявок</p></div>`;
      return;
    }

    list.innerHTML = requests.map((req) => {
      const av = PRESET_AVATARS.find((a) => a.id === req.avatar) || PRESET_AVATARS[0];
      const hasConsent = req.consent_public_contacts;
      return `
        <div class="ps5-request-item" data-req-id="${req.id}">
          <div class="ps5-req-meta-row">
            <div class="ps5-req-user-info">
              <div class="ps5-friend-avatar-item" style="background: ${av.bg}; width: 36px; height: 36px;">
                <span>${av.icon}</span>
              </div>
              <div>
                <span class="ps5-friend-name">${escapeHtml(req.displayName)}</span>
                <span class="ps5-friend-handle">@${escapeHtml(req.nickname)}</span>
              </div>
            </div>
            <span class="ps5-status-tag status-${req.status}">
              ${req.status === "pending" ? "Ожидает" : req.status === "accepted" ? "Принята" : "Отклонена"}
            </span>
          </div>

          ${req.bio ? `<p style="font-size: 12px; color: rgba(255,255,255,0.75); margin: 2px 0;">${escapeHtml(req.bio)}</p>` : ""}

          ${hasConsent ? `
            <div class="ps5-req-socials-chips">
              ${req.steam ? `<a class="ps5-social-chip" href="${req.steam.startsWith("http") ? req.steam : "https://steamcommunity.com/id/" + req.steam}" target="_blank" rel="noopener">Steam</a>` : ""}
              ${req.telegram ? `<a class="ps5-social-chip" href="${req.telegram.startsWith("http") ? req.telegram : "https://t.me/" + req.telegram.replace("@", "")}" target="_blank" rel="noopener">Telegram</a>` : ""}
              ${req.vk ? `<a class="ps5-social-chip" href="${req.vk.startsWith("http") ? req.vk : "https://vk.com/" + req.vk}" target="_blank" rel="noopener">VK</a>` : ""}
              ${req.discord ? `<span class="ps5-social-chip" title="Discord: ${escapeHtml(req.discord)}">Discord: ${escapeHtml(req.discord)}</span>` : ""}
              ${req.psnId ? `<span class="ps5-social-chip" title="PSN ID: ${escapeHtml(req.psnId)}">PSN: ${escapeHtml(req.psnId)}</span>` : ""}
              ${req.otherPlatforms ? `<span class="ps5-social-chip">${escapeHtml(req.otherPlatforms)}</span>` : ""}
            </div>
          ` : `<div style="font-size: 11px; color: rgba(255,255,255,0.4);">Контакты скрыты пользователем</div>`}

          <div class="ps5-req-actions-row">
            ${req.status === "pending" ? `
              <button type="button" class="ps5-btn-accept btn-act-accept" data-id="${req.id}">✓ Принять</button>
              <button type="button" class="ps5-btn-reject btn-act-reject" data-id="${req.id}">Отклонить</button>
            ` : req.status === "accepted" ? `
              <span style="font-size: 12px; color: #4ade80;">В друзьях</span>
            ` : `
              <span style="font-size: 12px; color: #fb7185;">Отклонена</span>
            `}
            <button type="button" class="ps5-btn-danger-sub btn-act-block" data-nick="${escapeHtml(req.nickname)}" title="Заблокировать пользователя">Блок</button>
          </div>
        </div>
      `;
    }).join("");

    list.querySelectorAll(".btn-act-accept").forEach((btn) => {
      btn.onclick = async () => {
        try {
          await FriendsService.acceptRequest(btn.dataset.id, pin);
          SoundEngine.launch();
          showToast("Друзья", "Заявка принята! Друг добавлен.", PS5Icons.star);
          renderOwnerTab();
          renderWelcomeFriends();
        } catch (err) {
          alert(err.message);
        }
      };
    });

    list.querySelectorAll(".btn-act-reject").forEach((btn) => {
      btn.onclick = async () => {
        try {
          await FriendsService.rejectRequest(btn.dataset.id, pin);
          SoundEngine.modalClose();
          showToast("Заявка", "Заявка отклонена.", PS5Icons.close);
          renderOwnerTab();
          renderWelcomeFriends();
        } catch (err) {
          alert(err.message);
        }
      };
    });

    list.querySelectorAll(".btn-act-block").forEach((btn) => {
      btn.onclick = async () => {
        if (confirm(`Заблокировать пользователя ${btn.dataset.nick}?`)) {
          await FriendsService.blockUser(btn.dataset.nick, pin);
          showToast("Безопасность", "Пользователь заблокирован.", PS5Icons.warning);
          renderOwnerTab();
          renderWelcomeFriends();
        }
      };
    });

  } catch (err) {
    isOwnerUnlocked = false;
    authBox.hidden = false;
    feedBox.hidden = true;
    const errEl = $("#ownerAuthError");
    if (errEl) {
      errEl.hidden = false;
      errEl.textContent = err.message || "Ошибка авторизации";
    }
  }
}

function openFriendProfileModal(friend) {
  const av = PRESET_AVATARS.find((a) => a.id === friend.avatar) || PRESET_AVATARS[0];
  const hasConsent = friend.consent_public_contacts;

  let socialsHtml = "";
  if (hasConsent) {
    const s = [];
    if (friend.steam) s.push(`<a class="ps5-social-chip" href="${friend.steam.startsWith("http") ? friend.steam : "https://steamcommunity.com/id/" + friend.steam}" target="_blank" rel="noopener">Steam ↗</a>`);
    if (friend.telegram) s.push(`<a class="ps5-social-chip" href="${friend.telegram.startsWith("http") ? friend.telegram : "https://t.me/" + friend.telegram.replace("@", "")}" target="_blank" rel="noopener">Telegram ↗</a>`);
    if (friend.vk) s.push(`<a class="ps5-social-chip" href="${friend.vk.startsWith("http") ? friend.vk : "https://vk.com/" + friend.vk}" target="_blank" rel="noopener">VK ↗</a>`);
    if (friend.discord) s.push(`<span class="ps5-social-chip">Discord: ${escapeHtml(friend.discord)}</span>`);
    if (friend.psnId) s.push(`<span class="ps5-social-chip">PSN: ${escapeHtml(friend.psnId)}</span>`);
    if (friend.otherPlatforms) s.push(`<span class="ps5-social-chip">${escapeHtml(friend.otherPlatforms)}</span>`);
    socialsHtml = s.length ? `<div class="ps5-req-socials-chips" style="margin-top: 14px;">${s.join("")}</div>` : "<p class=\"modal-p\">Пользователь не указал дополнительных ссылок.</p>";
  } else {
    socialsHtml = "<p class=\"modal-p\" style=\"opacity: 0.6;\">Пользователь скрыл контактные данные в настройках приватности.</p>";
  }

  openModal({
    tag: "ПРОФИЛЬ ДРУГА",
    title: `${escapeHtml(friend.displayName)} (@${escapeHtml(friend.nickname)})`,
    subtitle: `${friend.status || "Online"} · ${escapeHtml(friend.currentGame || "PlayStation®5")}`,
    content: `
      <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 12px;">
        <div class="ps5-friend-avatar-item" style="background: ${av.bg}; width: 52px; height: 52px; font-size: 22px;">
          <span>${av.icon}</span>
          <span class="ps5-friend-avatar-dot"></span>
        </div>
        <div>
          <h3 style="margin: 0; color: #fff; font-size: 17px;">${escapeHtml(friend.displayName)}</h3>
          <span style="color: #38bdf8; font-size: 13px;">@${escapeHtml(friend.nickname)}</span>
        </div>
      </div>
      ${friend.bio ? `<p class="modal-p">${escapeHtml(friend.bio)}</p>` : ""}
      <div class="modal-spec-grid" style="margin-top: 12px;">
        <div class="modal-spec-box"><span class="spec-label">Статус</span><span class="spec-val" style="color: #4ade80;">В сети</span></div>
        <div class="modal-spec-box"><span class="spec-label">Платформа</span><span class="spec-val">PlayStation®5 System</span></div>
      </div>
      <div style="margin-top: 14px;">
        <span class="spec-label" style="display: block; margin-bottom: 6px;">Связь с игроком:</span>
        ${socialsHtml}
      </div>
    `,
    actions: []
  });
}

function initFriendsSystem() {
  $("#btnOpenAddFriend")?.addEventListener("click", (e) => {
    e.stopPropagation();
    openAddFriendModal();
  });
  $("#btnOpenFriendRequests")?.addEventListener("click", (e) => {
    e.stopPropagation();
    openFriendRequestsModal();
  });
  $("#widgetFriends")?.addEventListener("click", (e) => {
    if (e.target.closest("#btnOpenAddFriend") || e.target.closest("#btnOpenFriendRequests") || e.target.closest(".ps5-friend-chip") || e.target.closest("#btnEmptyAddFriend")) {
      return;
    }
    openFriendRequestsModal();
  });

  $("#btnCloseAddFriend")?.addEventListener("click", closeAddFriendModal);
  $("#btnCancelAddFriend")?.addEventListener("click", closeAddFriendModal);
  $("#backdropAddFriend")?.addEventListener("click", closeAddFriendModal);

  $("#btnCloseRequests")?.addEventListener("click", closeFriendRequestsModal);
  $("#backdropFriendRequests")?.addEventListener("click", closeFriendRequestsModal);
  $("#tabBtnMyRequest")?.addEventListener("click", () => switchRequestsTab("my"));
  $("#tabBtnOwnerManage")?.addEventListener("click", () => switchRequestsTab("owner"));
  $("#btnReloadRequests")?.addEventListener("click", renderOwnerTab);

  $("#btnUnlockOwner")?.addEventListener("click", async () => {
    const pin = $("#inputOwnerPin")?.value || "";
    try {
      await FriendsService.getFriendRequests(pin);
      isOwnerUnlocked = true;
      $("#ownerAuthError").hidden = true;
      SoundEngine.confirm();
      renderOwnerTab();
    } catch (err) {
      const errEl = $("#ownerAuthError");
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = err.message || "Неверный ПИН-код";
      }
      SoundEngine.errorInTextBox();
    }
  });

  const form = $("#formAddFriend");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const alertBox = $("#friendFormAlert");
      const btnSubmit = $("#btnSubmitFriendRequest");

      alertBox.hidden = true;
      alertBox.className = "ps5-form-alert";

      const formData = {
        nickname: $("#inputFriendNick").value,
        displayName: $("#inputFriendName").value,
        bio: $("#inputFriendBio").value,
        avatar: selectedAvatarId,
        steam: $("#inputFriendSteam").value,
        telegram: $("#inputFriendTelegram").value,
        vk: $("#inputFriendVk").value,
        discord: $("#inputFriendDiscord").value,
        psnId: $("#inputFriendPsn").value,
        otherPlatforms: $("#inputFriendOther").value,
        consent: $("#checkFriendConsent").checked
      };

      try {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span>Отправка…</span>`;

        await FriendsService.submitFriendRequest(formData);
        SoundEngine.launch();

        alertBox.hidden = false;
        alertBox.className = "ps5-form-alert success";
        alertBox.textContent = "✓ Заявка успешно отправлена! Статус: Ожидает подтверждения владельцем.";

        setTimeout(() => {
          closeAddFriendModal();
          openFriendRequestsModal();
          renderWelcomeFriends();
          form.reset();
        }, 1200);

      } catch (err) {
        SoundEngine.errorInTextBox();
        SoundEngine.error();
        alertBox.hidden = false;
        alertBox.className = "ps5-form-alert error";
        alertBox.textContent = `Ошибка: ${err.message}`;
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          <span>Отправить заявку</span>
        `;
      }
    });
  }
}

let lastGamepadPoll = 0;
function pollGamepads() {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  if (gamepads && gamepads.length) {
    const gp = Array.from(gamepads).find((g) => g && g.connected);
    if (gp) {
      const now = performance.now();
      if (now - lastGamepadPoll > 200) {
        const dLeft = gp.buttons[14]?.pressed || (gp.axes[0] && gp.axes[0] < -0.5);
        const dRight = gp.buttons[15]?.pressed || (gp.axes[0] && gp.axes[0] > 0.5);
        const dUp = gp.buttons[12]?.pressed || (gp.axes[1] && gp.axes[1] < -0.5);
        const dDown = gp.buttons[13]?.pressed || (gp.axes[1] && gp.axes[1] > 0.5);

        const btnCross = gp.buttons[0]?.pressed;
        const btnCircle = gp.buttons[1]?.pressed;
        const btnSquare = gp.buttons[2]?.pressed;
        const btnTriangle = gp.buttons[3]?.pressed;
        const btnL1 = gp.buttons[4]?.pressed;
        const btnR1 = gp.buttons[5]?.pressed;
        const btnPS = gp.buttons[16]?.pressed;

        if (btnCross) {
          lastGamepadPoll = now;
          handleKeydown(new KeyboardEvent("keydown", { key: "Enter" }));
        } else if (btnCircle) {
          lastGamepadPoll = now;
          handleKeydown(new KeyboardEvent("keydown", { key: "Escape" }));
        } else if (btnTriangle) {
          lastGamepadPoll = now;
          handleKeydown(new KeyboardEvent("keydown", { key: "/" }));
        } else if (btnPS) {
          lastGamepadPoll = now;
          handleKeydown(new KeyboardEvent("keydown", { key: " " }));
        } else if (btnL1) {
          lastGamepadPoll = now;
          switchCategory("games");
        } else if (btnR1) {
          lastGamepadPoll = now;
          switchCategory("media");
        } else if (dLeft) {
          lastGamepadPoll = now;
          handleKeydown(new KeyboardEvent("keydown", { key: "ArrowLeft" }));
        } else if (dRight) {
          lastGamepadPoll = now;
          handleKeydown(new KeyboardEvent("keydown", { key: "ArrowRight" }));
        } else if (dUp) {
          lastGamepadPoll = now;
          handleKeydown(new KeyboardEvent("keydown", { key: "ArrowUp" }));
        } else if (dDown) {
          lastGamepadPoll = now;
          handleKeydown(new KeyboardEvent("keydown", { key: "ArrowDown" }));
        }
      }
    }
  }
  requestAnimationFrame(pollGamepads);
}

function init() {
  particleEngine = new PS5ParticleEngine($("#ps5Particles"));
  particleEngine.start();

  hydrateStaticIcons();
  applyLanguageAndTelemetry();
  setupWelcomeHubScroll();
  initSberTips();
  initFriendsSystem();

  // One-time gesture listener to unlock Web Audio API and start ambient audio smoothly
  const unlockAudioOnGesture = () => {
    SoundEngine.unlockAudio();
    window.removeEventListener("pointerdown", unlockAudioOnGesture);
    window.removeEventListener("keydown", unlockAudioOnGesture);
    window.removeEventListener("touchstart", unlockAudioOnGesture);
  };
  window.addEventListener("pointerdown", unlockAudioOnGesture, { passive: true });
  window.addEventListener("keydown", unlockAudioOnGesture, { passive: true });
  window.addEventListener("touchstart", unlockAudioOnGesture, { passive: true });

  $("#tabGames").addEventListener("click", () => switchCategory("games"));
  $("#tabMedia").addEventListener("click", () => switchCategory("media"));

  $("#btnLangToggle").addEventListener("click", () => {
    state.lang = state.lang === "ru" ? "en" : "ru";
    SoundEngine.changePanel();
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
    showToast("Уведомления PSN", "Службы сети активны · PlayStation Network Online", PS5Icons.star);
  });
  $("#btnContinuePlaying")?.addEventListener("click", () => {
    SoundEngine.playStart();
    selectTile("gta-vc", true);
  });
  $("#btnSettings").addEventListener("click", openSettings);
  $("#btnProfile").addEventListener("click", () => openTrophyCollectionModal());

  // Welcome Hub Bento Widget Clicks (Authentic 1:1 PS5 Modals & Diagnostics)
  $("#widgetStore")?.addEventListener("click", () => openStoreModal());
  $("#widgetAccessibility")?.addEventListener("click", () => {
    state.settingsSection = "language";
    openSettings();
  });
  $("#widgetTrophies")?.addEventListener("click", () => openTrophyCollectionModal());
  $("#widgetBattery")?.addEventListener("click", () => {
    state.settingsSection = "accessories";
    openSettings();
  });
  $("#widgetStorage")?.addEventListener("click", () => {
    state.settingsSection = "storage";
    openSettings();
  });
  $("#widgetWishlist")?.addEventListener("click", () => openStoreModal());
  $("#widgetFriendActivity")?.addEventListener("click", () => selectTile("explore", true));
  $("#widgetNetworkStatus")?.addEventListener("click", () => openNetworkDiagnosticsModal());
  $("#widgetMediaGallery")?.addEventListener("click", () => openMediaGalleryModal());
  $("#widgetPsPlus")?.addEventListener("click", () => openStoreModal());
  $("#widgetRemotePlay")?.addEventListener("click", () => openRemotePlayModal());
  $("#widgetTrophyProgress")?.addEventListener("click", () => openTrophyCollectionModal());

  // PSN Trophy Service Background Initialization & Live Updates
  psnService.init().then(() => {
    applyLanguageAndTelemetry();
  });
  psnService.onUpdate(() => {
    applyLanguageAndTelemetry();
    if ($("#modalTrophyCollection")?.classList.contains("active")) {
      renderTrophyCollectionModal();
    }
  });

  // Trophy Collection Modal Event Listeners
  $("#btnTcClose")?.addEventListener("click", closeTrophyCollectionModal);
  $("#tcBackdrop")?.addEventListener("click", closeTrophyCollectionModal);

  $("#btnSyncTrophiesTop")?.addEventListener("click", () => {
    const btn = $("#btnSyncTrophiesTop");
    btn?.classList.add("is-loading");
    SoundEngine.enter();
    showToast(
      state.lang === "ru" ? "Синхронизация PSN" : "PSN Sync",
      state.lang === "ru" ? "Проверка и загрузка трофеев..." : "Checking and syncing trophies...",
      PS5Icons.trophy
    );
    psnService.syncNow().then((data) => {
      btn?.classList.remove("is-loading");
      SoundEngine.trophyToast();
      showToast(
        state.lang === "ru" ? "Трофеи обновлены" : "Trophies Updated",
        state.lang === "ru" ? `✓ Синхронизировано ${data.games?.length || 0} игр и ${data.profile?.totalTrophies || 0} призов` : `✓ Synced ${data.games?.length || 0} games and ${data.profile?.totalTrophies || 0} trophies`,
        PS5Icons.trophy
      );
      applyLanguageAndTelemetry();
      renderTrophyCollectionModal();
    }).catch(() => {
      btn?.classList.remove("is-loading");
      SoundEngine.error();
      showToast(
        state.lang === "ru" ? "Ошибка синхронизации" : "Sync Error",
        state.lang === "ru" ? "Не удалось связаться с сервером" : "Could not reach sync server",
        PS5Icons.error
      );
    });
  });

  $("#tcGamesSearchInput")?.addEventListener("input", (e) => {
    state.trophySearch = e.target.value;
    renderTrophyGamesList();
  });

  $("#tcFilterPills")?.querySelectorAll(".tc-filter-pill")?.forEach((pill) => {
    pill.addEventListener("click", () => {
      $("#tcFilterPills")?.querySelectorAll(".tc-filter-pill")?.forEach((p) => p.classList.remove("is-active"));
      pill.classList.add("is-active");
      state.trophyFilter = pill.dataset.filter || "all";
      SoundEngine.focusMove();
      renderTrophyGamesList();
    });
  });

  // Single Game Trophy Details Modal Event Listeners
  $("#btnGameDetailClose")?.addEventListener("click", closeGameTrophiesDetail);
  $("#btnGameDetailBack")?.addEventListener("click", closeGameTrophiesDetail);
  $("#gameDetailBackdrop")?.addEventListener("click", closeGameTrophiesDetail);

  // PSN JSON Import Modal Event Listeners
  $("#btnJsonImportClose")?.addEventListener("click", closePsnJsonImportModal);
  $("#btnCancelJsonImport")?.addEventListener("click", closePsnJsonImportModal);
  $("#jsonImportBackdrop")?.addEventListener("click", closePsnJsonImportModal);
  $("#btnSubmitJsonImport")?.addEventListener("click", submitPsnJsonImport);

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
  $("#ccMusicVolume")?.addEventListener("input", (e) => {
    const val = parseFloat(e.target.value);
    SoundEngine.setMusicVolume(val);
    SoundEngine.sliderLevelMeter(val);
  });

  // Overlays Close
  $("#searchCloseBtn").addEventListener("click", closeSearch);
  $("#searchInput").addEventListener("input", (e) => renderSearchResults(e.target.value));
  $("#settingsCloseBtn").addEventListener("click", closeSettings);
  $("#modalCloseBtn").addEventListener("click", closeModal);
  $("#btnLibClose")?.addEventListener("click", closeLibraryModal);
  $("#gwBtnClose")?.addEventListener("click", closeInGameWindow);

  const modalGameLibrary = document.getElementById("modalGameLibrary");
  if (modalGameLibrary) {
    modalGameLibrary.addEventListener("click", (e) => {
      if (e.target === modalGameLibrary) closeLibraryModal();
    });
  }

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

  initSpotlightCards();
  setInterval(updateClock, 10000);
  requestAnimationFrame(pollGamepads);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

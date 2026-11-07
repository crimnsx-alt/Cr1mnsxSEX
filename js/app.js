/**
 * PS5 Home Menu & Game Hub — Master Application Controller
 * Реализует аутентичную механику консоли PlayStation 5 (spllitz baCpOEqBMSA):
 * - Двухуровневая вертикальная навигация: Home View (Level 0) <-> Game Hub (Level 1)
 * - Карусель Activity Cards (16:9) с индикаторами прогресса и таймерами
 * - Полноценный Control Center (кнопка PS / Пробел)
 * - Экран настроек системы PS5 (Settings Screen)
 * - Быстрый поиск (Search Screen)
 * - Контекстное меню игры (•••)
 * - Генеративная эмбиент-музыка меню (Web Audio API)
 */

import {
  portfolioData,
  settingsSections,
  controlCenterItems,
  searchCatalog
} from "./data.js";
import { SoundEngine } from "./sound.js";

// ============================================================
// State
// ============================================================
let currentCategory = "projects"; // "projects" | "link"
let activeIndex = 0;
let isGameHubActive = false;
let isControlCenterOpen = false;
let currentSettingsSection = "accounts";
let bgFlip = false;

// ============================================================
// DOM Elements Cache
// ============================================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const dom = {
  bgA: $("#bgLayerA"),
  bgB: $("#bgLayerB"),
  dock: $("#gamesDock"),
  heroSection: $(".hero-section"),
  heroTag: $("#heroTag"),
  heroTitle: $("#heroTitle"),
  heroDesc: $("#heroDesc"),
  heroBtn: $("#heroBtn"),
  heroSecBtn: $("#heroSecondaryBtn"),
  btnOptionsMenu: $("#btnOptionsMenu"),
  contextMenu: $("#contextMenu"),
  scrollDownCue: $("#scrollDownCue"),
  scrollUpCue: $("#scrollUpCue"),
  hubGameThumb: $("#hubGameThumb"),
  hubGameTitle: $("#hubGameTitle"),
  hubGamePublisher: $("#hubGamePublisher"),
  activityCarousel: $("#activityCarousel"),
  hubNewsFeed: $("#hubNewsFeed"),
  hubTrophies: $("#hubTrophies"),
  navTabs: $$(".nav-tab"),
  clock: $("#clock"),
  muteBtn: $("#muteBtn"),
  trophyPill: $("#trophyPill"),
  profilePill: $("#profilePill"),
  btnPS: $("#btnPS"),
  btnSearch: $("#btnSearch"),
  btnSettings: $("#btnSettings"),
  toastContainer: $("#toastContainer"),
  modalOverlay: $("#modalOverlay"),
  modalCloseBtn: $("#modalCloseBtn"),
  modalTag: $("#modalTag"),
  modalTitle: $("#modalTitle"),
  modalSubtitle: $("#modalSubtitle"),
  modalBody: $("#modalBody"),
  modalActions: $("#modalActions"),
  searchOverlay: $("#searchOverlay"),
  searchInput: $("#searchInput"),
  searchCloseBtn: $("#searchCloseBtn"),
  searchResults: $("#searchResults"),
  settingsOverlay: $("#settingsOverlay"),
  settingsCloseBtn: $("#settingsCloseBtn"),
  settingsNav: $("#settingsNav"),
  settingsDetail: $("#settingsDetail"),
  controlCenterOverlay: $("#controlCenterOverlay"),
  controlCenterTrack: $("#controlCenterTrack"),
  ccCardTitle: $("#ccCardTitle"),
  ccBtnResume: $("#ccBtnResume"),
  ccBtnProfile: $("#ccBtnProfile"),
  ccMusicToggle: $("#ccMusicToggle"),
  ccMusicVolume: $("#ccMusicVolume")
};

// ============================================================
// Toast Notification System (PS5 Style)
// ============================================================
function showToast(title, message, icon = "🎮") {
  const toast = document.createElement("div");
  toast.className = "ps5-toast";
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <span class="toast-title">${title}</span>
      <span class="toast-msg">${message}</span>
    </div>
  `;

  dom.toastContainer.appendChild(toast);
  SoundEngine.chime();

  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  }, 3600);
}

// ============================================================
// Clipboard Copy System
// ============================================================
async function copyToClipboard(text, label) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    showToast("Буфер обмена", `${label} успешно скопировано!`, "📋");
  } catch (err) {
    showToast("Внимание", `Контакт: ${text}`, "📋");
  }
}

// ============================================================
// Dynamic 4K Background Cross-fade
// ============================================================
function setBackground(url) {
  const incoming = bgFlip ? dom.bgA : dom.bgB;
  const outgoing = bgFlip ? dom.bgB : dom.bgA;

  incoming.style.backgroundImage = `url('${url}')`;
  incoming.style.opacity = "1";
  outgoing.style.opacity = "0";

  bgFlip = !bgFlip;
}

// ============================================================
// TWO-TIER VERTICAL NAVIGATION (Home View <-> Game Hub)
// ============================================================
function openGameHub() {
  if (isGameHubActive) return;
  isGameHubActive = true;
  document.body.classList.add("hub-active");
  renderGameHubContent();
  SoundEngine.whooshDown();
}

function closeGameHub() {
  if (!isGameHubActive) return;
  isGameHubActive = false;
  document.body.classList.remove("hub-active");
  SoundEngine.whooshUp();
}

function toggleGameHub() {
  if (isGameHubActive) {
    closeGameHub();
  } else {
    openGameHub();
  }
}

function renderGameHubContent() {
  const currentItem = portfolioData[currentCategory][activeIndex];
  if (!currentItem) return;

  // 1. Mini-Header
  dom.hubGameThumb.style.backgroundImage = `url('${currentItem.thumb}')`;
  dom.hubGameTitle.textContent = currentItem.title;
  dom.hubGamePublisher.textContent = currentItem.publisher || "PlayStation Studios";

  // 2. Activity Cards Carousel (16:9)
  dom.activityCarousel.innerHTML = "";
  (currentItem.activities || []).forEach((act) => {
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
          <span style="font-weight: 700; color: #fff;">${act.progress}%</span>
        </div>
        <div class="act-bar-wrap">
          <div class="act-bar-fill" style="width: ${act.progress}%;"></div>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      if (act.action) {
        handleAction(act.action);
      } else if (act.link) {
        window.open(act.link, "_blank", "noopener");
      }
    });

    dom.activityCarousel.appendChild(card);
  });

  // 3. Official News Feed
  dom.hubNewsFeed.innerHTML = "";
  (currentItem.news || []).forEach((n) => {
    const newsCard = document.createElement("div");
    newsCard.className = "news-card-ps5";
    newsCard.innerHTML = `
      <span class="news-date">${n.date}</span>
      <h4 class="news-title">${n.title}</h4>
      <p class="news-desc">${n.desc}</p>
    `;
    dom.hubNewsFeed.appendChild(newsCard);
  });

  // 4. Trophies Row
  dom.hubTrophies.innerHTML = "";
  const t = currentItem.trophies || { platinum: 1, gold: 5, silver: 10, bronze: 20 };
  const trophiesList = [
    { label: "★ 1 Платина", count: t.platinum, color: "#00d4ff" },
    { label: "🥇 Золото", count: t.gold, color: "#f1c40f" },
    { label: "🥈 Серебро", count: t.silver, color: "#bdc3c7" },
    { label: "🥉 Бронза", count: t.bronze, color: "#e67e22" }
  ];

  trophiesList.forEach((tr) => {
    const badge = document.createElement("div");
    badge.className = "hub-trophy-badge";
    badge.style.color = tr.color;
    badge.textContent = `${tr.label}: ${tr.count}`;
    dom.hubTrophies.appendChild(badge);
  });
}

// ============================================================
// Top App Dock (Games Row)
// ============================================================
function renderDock() {
  const items = portfolioData[currentCategory];
  dom.dock.innerHTML = "";

  items.forEach((item, idx) => {
    const tile = document.createElement("div");
    tile.className = `game-tile ${idx === activeIndex ? "active" : ""}`;
    tile.style.backgroundImage = `url('${item.thumb}')`;
    tile.setAttribute("role", "button");
    tile.setAttribute("tabindex", "0");
    tile.setAttribute("aria-label", item.title);

    tile.innerHTML = `
      <span class="tile-badge">${item.badge}</span>
      <span class="tile-label">${item.title}</span>
    `;

    tile.addEventListener("click", () => {
      if (idx !== activeIndex) {
        selectItem(idx);
        SoundEngine.navigate();
      } else {
        handleAction(item.btnAction || "modal:bio");
      }
    });

    dom.dock.appendChild(tile);
  });
}

// ============================================================
// Hero Section Updates
// ============================================================
function updateHero(item) {
  dom.heroSection.classList.add("transitioning");

  setTimeout(() => {
    dom.heroTag.textContent = item.tag;
    dom.heroTitle.textContent = item.title;
    dom.heroDesc.textContent = item.desc;

    dom.heroBtn.textContent = item.btnText;
    dom.heroBtn.onclick = () => {
      handleAction(item.btnAction);
    };

    dom.heroSecBtn.textContent = item.secText;
    dom.heroSecBtn.onclick = () => {
      if (item.secAction) {
        handleAction(item.secAction);
      } else if (item.secLink) {
        window.open(item.secLink, "_blank", "noopener");
      }
    };

    // Обновляем Control Center Card
    dom.ccCardTitle.textContent = item.title;

    dom.heroSection.classList.remove("transitioning");
  }, 160);
}

function selectItem(index) {
  const items = portfolioData[currentCategory];
  activeIndex = index;
  const item = items[index];

  renderDock();
  setBackground(item.bg);
  updateHero(item);

  if (isGameHubActive) {
    renderGameHubContent();
  }
}

// ============================================================
// Category Tabs Switching
// ============================================================
function switchCategory(cat) {
  if (cat === currentCategory) return;
  currentCategory = cat;
  activeIndex = 0;

  dom.navTabs.forEach((t) => {
    t.classList.toggle("active", t.dataset.category === cat);
  });

  if (isGameHubActive) {
    closeGameHub();
  }

  selectItem(0);
  SoundEngine.confirm();
  showToast("Раздел изменен", cat === "projects" ? "Раздел: Проекты (Games)" : "Раздел: Link (Media)", "📂");
}

// ============================================================
// PS5 Control Center (PS Button)
// ============================================================
function renderControlCenter() {
  dom.controlCenterTrack.innerHTML = "";
  controlCenterItems.forEach((item) => {
    const btn = document.createElement("button");
    btn.className = "cc-item-btn";
    btn.type = "button";
    btn.setAttribute("aria-label", item.label);
    btn.innerHTML = `
      <span class="cc-tooltip">${item.label}</span>
      <span>${item.icon}</span>
    `;

    btn.addEventListener("click", () => {
      handleControlCenterAction(item.action);
    });

    dom.controlCenterTrack.appendChild(btn);
  });
}

function toggleControlCenter() {
  isControlCenterOpen = !isControlCenterOpen;
  if (isControlCenterOpen) {
    dom.controlCenterOverlay.classList.add("active");
    dom.controlCenterOverlay.setAttribute("aria-hidden", "false");
    SoundEngine.controlCenter(true);
  } else {
    closeControlCenter();
  }
}

function closeControlCenter() {
  if (!isControlCenterOpen) return;
  isControlCenterOpen = false;
  dom.controlCenterOverlay.classList.remove("active");
  dom.controlCenterOverlay.setAttribute("aria-hidden", "true");
  SoundEngine.controlCenter(false);
}

function handleControlCenterAction(action) {
  switch (action) {
    case "home":
      closeControlCenter();
      if (isGameHubActive) closeGameHub();
      selectItem(0);
      break;

    case "switcher":
      closeControlCenter();
      selectItem((activeIndex + 1) % portfolioData[currentCategory].length);
      SoundEngine.navigate();
      showToast("Переключатель", "Выбран следующий проект", "🔀");
      break;

    case "notifications":
      closeControlCenter();
      showToast("PlayStation Network", "Все сетевые службы функционируют штатно", "🔔");
      break;

    case "gamebase":
      closeControlCenter();
      handleAction("modal:bio");
      break;

    case "music":
      const playing = SoundEngine.toggleAmbient();
      dom.ccMusicToggle.textContent = playing ? "⏸ Пауза" : "▶ Играть";
      showToast("Фоновая музыка PS5", playing ? "Воспроизведение включено" : "Пауза", "🎵");
      break;

    case "sound":
      SoundEngine.toggle();
      dom.muteBtn.textContent = SoundEngine.muted ? "🔇" : "🔊";
      dom.muteBtn.classList.toggle("muted", SoundEngine.muted);
      showToast("Звук", SoundEngine.muted ? "Звуковые эффекты выключены" : "Звуковые эффекты активны", SoundEngine.muted ? "🔇" : "🔊");
      break;

    case "mic":
      showToast("Микрофон DualSense", "Микрофон контроллера отключен (Mute)", "🎤");
      SoundEngine.navigate();
      break;

    case "accessories":
      closeControlCenter();
      showToast("DualSense Controller", "Заряд аккумулятора: 88% • Haptic Feedback", "🎮");
      break;

    case "power":
      closeControlCenter();
      openModal({
        tag: "PS5 POWER OPTIONS",
        title: "Питание системы",
        subtitle: "Управление состоянием дашборда",
        content: `
          <div class="modal-spec-grid">
            <div class="modal-spec-box">
              <span class="spec-label">Сброс позиции</span>
              <span class="spec-val">Вернуться на начальный экран</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Аудиосистема</span>
              <span class="spec-val">Выключить звук и фоновую музыку</span>
            </div>
          </div>
        `,
        actions: [
          { text: "Вернуться в главное меню", action: "home_reset", primary: true },
          { text: "Отключить звук", action: "sound_mute", primary: false }
        ]
      });
      break;

    default:
      if (action.startsWith("modal:")) {
        closeControlCenter();
        handleAction(action);
      }
      break;
  }
}

// ============================================================
// PS5 Search Overlay (Live Quick Search)
// ============================================================
function openSearch() {
  closeControlCenter();
  dom.searchOverlay.classList.add("active");
  dom.searchOverlay.setAttribute("aria-hidden", "false");
  dom.searchInput.value = "";
  renderSearchResults("");
  dom.searchInput.focus();
  SoundEngine.modalOpen();
}

function closeSearch() {
  if (!dom.searchOverlay.classList.contains("active")) return;
  dom.searchOverlay.classList.remove("active");
  dom.searchOverlay.setAttribute("aria-hidden", "true");
  SoundEngine.modalClose();
}

function renderSearchResults(query = "") {
  const cleanQ = query.trim().toLowerCase();
  const filtered = cleanQ
    ? searchCatalog.filter(
        (item) =>
          item.title.toLowerCase().includes(cleanQ) ||
          item.desc.toLowerCase().includes(cleanQ) ||
          item.category.toLowerCase().includes(cleanQ)
      )
    : searchCatalog;

  dom.searchResults.innerHTML = "";

  if (filtered.length === 0) {
    dom.searchResults.innerHTML = `<div style="padding: 24px; text-align: center; color: var(--text-muted);">Ничего не найдено по запросу «${query}»</div>`;
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement("div");
    card.className = "search-result-card";
    card.innerHTML = `
      <div class="sr-info">
        <span class="sr-title">${item.title}</span>
        <span class="sr-desc">${item.desc}</span>
      </div>
      <span class="sr-cat">${item.category}</span>
    `;

    card.addEventListener("click", () => {
      closeSearch();
      if (item.action) {
        handleAction(item.action);
      } else if (item.link) {
        window.open(item.link, "_blank", "noopener");
      }
    });

    dom.searchResults.appendChild(card);
  });
}

// ============================================================
// PS5 Settings Screen (Настройки системы)
// ============================================================
function openSettings() {
  closeControlCenter();
  dom.settingsOverlay.classList.add("active");
  dom.settingsOverlay.setAttribute("aria-hidden", "false");
  renderSettingsNav();
  renderSettingsDetail(currentSettingsSection);
  SoundEngine.modalOpen();
}

function closeSettings() {
  if (!dom.settingsOverlay.classList.contains("active")) return;
  dom.settingsOverlay.classList.remove("active");
  dom.settingsOverlay.setAttribute("aria-hidden", "true");
  SoundEngine.modalClose();
}

function renderSettingsNav() {
  dom.settingsNav.innerHTML = "";
  settingsSections.forEach((sec) => {
    const btn = document.createElement("button");
    btn.className = `settings-nav-btn ${sec.id === currentSettingsSection ? "active" : ""}`;
    btn.type = "button";
    btn.innerHTML = `<span>${sec.icon}</span><span>${sec.title}</span>`;
    btn.addEventListener("click", () => {
      currentSettingsSection = sec.id;
      renderSettingsNav();
      renderSettingsDetail(sec.id);
      SoundEngine.navigate();
    });
    dom.settingsNav.appendChild(btn);
  });
}

function renderSettingsDetail(sectionId) {
  const section = settingsSections.find((s) => s.id === sectionId) || settingsSections[0];
  dom.settingsDetail.innerHTML = `
    <h3 style="font-size: 1.35rem; font-weight: 800; margin-bottom: 6px;">${section.icon} ${section.title}</h3>
    <div style="font-size: 0.86rem; color: var(--text-muted); margin-bottom: 20px;">Конфигурация консольной рабочей среды cr1mnsx</div>
  `;

  section.items.forEach((it) => {
    const card = document.createElement("div");
    card.className = "settings-item-card";

    let actionHTML = "";
    if (it.action) {
      actionHTML = `<button class="btn-settings-action" data-action="${it.action}" type="button">Открыть</button>`;
    } else if (it.toggle === "ambient") {
      actionHTML = `<button class="btn-settings-action" data-toggle="ambient" type="button">${SoundEngine.ambientPlaying ? "Выключить" : "Включить"}</button>`;
    } else if (it.toggle === "sfx") {
      actionHTML = `<button class="btn-settings-action" data-toggle="sfx" type="button">${SoundEngine.muted ? "Включить" : "Выключить"}</button>`;
    }

    card.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:4px;">
        <span class="settings-item-label">${it.label}</span>
        <span class="settings-item-val">${it.val}</span>
      </div>
      ${actionHTML}
    `;

    const btn = card.querySelector("button");
    if (btn) {
      btn.addEventListener("click", () => {
        if (btn.dataset.action) {
          handleAction(btn.dataset.action);
        } else if (btn.dataset.toggle === "ambient") {
          const playing = SoundEngine.toggleAmbient();
          btn.textContent = playing ? "Выключить" : "Включить";
          dom.ccMusicToggle.textContent = playing ? "⏸ Пауза" : "▶ Играть";
          showToast("Фоновая музыка", playing ? "Включена" : "Выключена", "🎵");
        } else if (btn.dataset.toggle === "sfx") {
          SoundEngine.toggle();
          btn.textContent = SoundEngine.muted ? "Включить" : "Выключить";
          dom.muteBtn.textContent = SoundEngine.muted ? "🔇" : "🔊";
          dom.muteBtn.classList.toggle("muted", SoundEngine.muted);
        }
      });
    }

    dom.settingsDetail.appendChild(card);
  });
}

// ============================================================
// Context Menu (Three Dots)
// ============================================================
function toggleContextMenu() {
  const isActive = dom.contextMenu.classList.contains("active");
  if (isActive) {
    closeContextMenu();
  } else {
    dom.contextMenu.classList.add("active");
    dom.contextMenu.setAttribute("aria-hidden", "false");
    SoundEngine.navigate();
  }
}

function closeContextMenu() {
  dom.contextMenu.classList.remove("active");
  dom.contextMenu.setAttribute("aria-hidden", "true");
}

function handleContextAction(act) {
  closeContextMenu();
  const currentItem = portfolioData[currentCategory][activeIndex];

  switch (act) {
    case "info":
      handleAction(currentItem.btnAction);
      break;

    case "share":
      copyToClipboard(window.location.href, "Ссылка на проект");
      break;

    case "fav":
      SoundEngine.chime();
      showToast("Избранное", `Проект «${currentItem.title}» закреплен в быстром доступе`, "⭐");
      break;
  }
}

// ============================================================
// PS5 Modal / Drawer System (Без внешних редиректов)
// ============================================================
function openModal({ tag, title, subtitle, content, actions = [], isWide = false }) {
  closeControlCenter();
  const card = dom.modalOverlay.querySelector(".modal-card");
  if (card) {
    card.classList.toggle("wide", !!isWide);
  }

  dom.modalTag.textContent = tag || "PLAYSTATION 5";
  dom.modalTitle.textContent = title || "";
  dom.modalSubtitle.textContent = subtitle || "";
  dom.modalBody.innerHTML = content || "";

  dom.modalActions.innerHTML = "";
  actions.forEach((act) => {
    if (act.link) {
      const a = document.createElement("a");
      a.className = `btn-modal ${act.primary ? "primary" : "secondary"}`;
      a.href = act.link;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = act.text;
      dom.modalActions.appendChild(a);
    } else {
      const btn = document.createElement("button");
      btn.className = `btn-modal ${act.primary ? "primary" : "secondary"}`;
      btn.type = "button";
      btn.textContent = act.text;
      btn.addEventListener("click", () => {
        handleAction(act.action);
      });
      dom.modalActions.appendChild(btn);
    }
  });

  const closeBtn = document.createElement("button");
  closeBtn.className = "btn-modal secondary";
  closeBtn.type = "button";
  closeBtn.textContent = "Закрыть";
  closeBtn.addEventListener("click", closeModal);
  dom.modalActions.appendChild(closeBtn);

  dom.modalOverlay.classList.add("active");
  dom.modalOverlay.setAttribute("aria-hidden", "false");
  SoundEngine.modalOpen();
}

function closeModal() {
  if (!dom.modalOverlay.classList.contains("active")) return;
  dom.modalOverlay.classList.remove("active");
  dom.modalOverlay.setAttribute("aria-hidden", "true");
  const card = dom.modalOverlay.querySelector(".modal-card");
  if (card) {
    card.classList.remove("wide");
  }
  SoundEngine.modalClose();
}

function closeAllOverlays() {
  closeModal();
  closeSearch();
  closeSettings();
  closeContextMenu();
  closeControlCenter();
}

// ============================================================
// PS5 Game Library Modal (Библиотека всех проектов)
// ============================================================
function openGameLibraryModal() {
  const allProjects = portfolioData.projects.map((p, idx) => ({ ...p, category: "projects", catIndex: idx }));
  const allLinks = portfolioData.link.map((l, idx) => ({ ...l, category: "link", catIndex: idx }));
  const combined = [...allProjects, ...allLinks];

  let activeTab = "all";

  function renderLibraryContent() {
    const list = activeTab === "all" ? combined : combined.filter((it) => it.category === activeTab);
    return `
      <div class="library-filter-tabs">
        <button class="lib-tab-btn ${activeTab === "all" ? "active" : ""}" data-tab="all" type="button">Ваша коллекция (${combined.length})</button>
        <button class="lib-tab-btn ${activeTab === "projects" ? "active" : ""}" data-tab="projects" type="button">Проекты (${allProjects.length})</button>
        <button class="lib-tab-btn ${activeTab === "link" ? "active" : ""}" data-tab="link" type="button">Link & Сетап (${allLinks.length})</button>
      </div>
      <div class="library-cards-grid">
        ${list
          .map(
            (item) => `
          <div class="lib-game-card" data-cat="${item.category}" data-idx="${item.catIndex}" role="button" tabindex="0">
            <div class="lib-card-thumb" style="background-image: url('${item.thumb}')">
              <span class="lib-badge">${item.badge}</span>
            </div>
            <div class="lib-card-info">
              <div class="lib-card-title">${item.title}</div>
              <div class="lib-card-tag">${item.tag}</div>
            </div>
            <div class="lib-card-action">
              <span class="lib-run-btn">Выбрать ✕</span>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  function attachLibraryEvents() {
    const tabs = dom.modalBody.querySelectorAll(".lib-tab-btn");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        activeTab = tab.dataset.tab;
        SoundEngine.navigate();
        dom.modalBody.innerHTML = renderLibraryContent();
        attachLibraryEvents();
      });
    });

    const cards = dom.modalBody.querySelectorAll(".lib-game-card");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const cat = card.dataset.cat;
        const idx = parseInt(card.dataset.idx, 10);
        closeModal();
        if (currentCategory !== cat) {
          switchCategory(cat);
        }
        selectItem(idx);
        SoundEngine.confirm();
        showToast("Библиотека проектов", `Выбран проект «${portfolioData[cat][idx].title}»`, "🎮");
      });
    });
  }

  openModal({
    tag: "PS5 GAME LIBRARY",
    title: "Библиотека проектов Дмитрия (cr1mnsx)",
    subtitle: "Полная коллекция разработок, конфигураций и открытого кода",
    content: renderLibraryContent(),
    isWide: true,
    actions: [
      { text: "Скопировать VK", action: "copy:vk", primary: true },
      { text: "Открыть профиль GitHub", link: "https://github.com/crimnsx-alt", primary: false }
    ]
  });

  attachLibraryEvents();
}

// ============================================================
// Central Action Dispatcher
// ============================================================
function handleAction(actionString) {
  if (!actionString) return;

  if (actionString === "copy:vk") {
    copyToClipboard("https://vk.ru/cr1mnsx", "ВКонтакте (vk.ru/cr1mnsx)");
    return;
  }
  if (actionString === "copy:github") {
    copyToClipboard("https://github.com/crimnsx-alt", "GitHub (github.com/crimnsx-alt)");
    return;
  }
  if (actionString === "copy:setup") {
    copyToClipboard("ПК: Ryzen 5600X, RTX 3060 Ti, 32GB RAM | Ноутбук: MacBook Air", "Спецификация сетапа");
    return;
  }
  if (actionString === "copy:all_links") {
    copyToClipboard("VK: https://vk.ru/cr1mnsx | GitHub: https://github.com/crimnsx-alt | PS5 Hub: https://crimnsx-alt.github.io/Cr1mnsxSEX/", "Все ссылки");
    return;
  }
  if (actionString === "home_reset") {
    closeModal();
    if (isGameHubActive) closeGameHub();
    selectItem(0);
    return;
  }
  if (actionString === "sound_mute") {
    closeModal();
    SoundEngine.toggle();
    dom.muteBtn.textContent = SoundEngine.muted ? "🔇" : "🔊";
    dom.muteBtn.classList.toggle("muted", SoundEngine.muted);
    return;
  }

  if (actionString === "modal:bio" || actionString === "modal:profile") {
    const hubItem = portfolioData.projects[0];
    openModal({
      tag: hubItem.modalData.badge,
      title: hubItem.modalData.title,
      subtitle: hubItem.modalData.subtitle,
      content: hubItem.modalData.content,
      actions: hubItem.modalData.actions
    });
    return;
  }

  if (actionString === "modal:career" || actionString === "modal:project_1c") {
    const item = portfolioData.projects[1];
    openModal({
      tag: item.modalData.badge,
      title: item.modalData.title,
      subtitle: item.modalData.subtitle,
      content: item.modalData.content,
      actions: item.modalData.actions
    });
    return;
  }

  if (actionString === "modal:vr" || actionString === "modal:project_vr") {
    const item = portfolioData.projects[2];
    openModal({
      tag: item.modalData.badge,
      title: item.modalData.title,
      subtitle: item.modalData.subtitle,
      content: item.modalData.content,
      actions: item.modalData.actions
    });
    return;
  }

  if (actionString === "modal:contacts") {
    const item = portfolioData.projects[3];
    openModal({
      tag: item.modalData.badge,
      title: item.modalData.title,
      subtitle: item.modalData.subtitle,
      content: item.modalData.content,
      actions: item.modalData.actions
    });
    return;
  }

  if (actionString === "modal:setup") {
    const item = portfolioData.link[0];
    openModal({
      tag: item.modalData.badge,
      title: item.modalData.title,
      subtitle: item.modalData.subtitle,
      content: item.modalData.content,
      actions: item.modalData.actions
    });
    return;
  }

  if (actionString === "modal:gaming") {
    const item = portfolioData.link[1];
    openModal({
      tag: item.modalData.badge,
      title: item.modalData.title,
      subtitle: item.modalData.subtitle,
      content: item.modalData.content,
      actions: item.modalData.actions
    });
    return;
  }

  if (actionString === "modal:links") {
    const item = portfolioData.link[2];
    openModal({
      tag: item.modalData.badge,
      title: item.modalData.title,
      subtitle: item.modalData.subtitle,
      content: item.modalData.content,
      actions: item.modalData.actions
    });
    return;
  }

  if (actionString === "modal:trophy") {
    openModal({
      tag: "PSN TROPHY COLLECTION",
      title: "Коллекция трофеев cr1mnsx",
      subtitle: "PlayStation Network • Статус Уровня 99",
      content: `
        <div class="modal-spec-grid">
          <div class="modal-spec-box">
            <span class="spec-label">★ Платиновые</span>
            <span class="spec-val" style="color: #00d4ff;">1 Трофей (100% зачистка)</span>
          </div>
          <div class="modal-spec-box">
            <span class="spec-label">🥇 Золотые</span>
            <span class="spec-val" style="color: #f1c40f;">12 Трофеев</span>
          </div>
          <div class="modal-spec-box">
            <span class="spec-label">🥈 Серебряные</span>
            <span class="spec-val" style="color: #bdc3c7;">28 Трофеев</span>
          </div>
          <div class="modal-spec-box">
            <span class="spec-label">🥉 Бронзовые</span>
            <span class="spec-val" style="color: #e67e22;">58 Трофеев</span>
          </div>
        </div>
        <p class="modal-p">Главное достижение: <strong>«Master of Next-Gen Architecture & 1C Consulting»</strong>.</p>
      `,
      actions: [
        { text: "Скопировать профиль", action: "copy:vk", primary: true }
      ]
    });
    return;
  }

  if (actionString === "modal:library") {
    openGameLibraryModal();
    return;
  }

  const items = portfolioData[currentCategory];
  const cur = items[activeIndex];
  if (cur && cur.modalData) {
    openModal({
      tag: cur.modalData.badge,
      title: cur.modalData.title,
      subtitle: cur.modalData.subtitle,
      content: cur.modalData.content,
      actions: cur.modalData.actions
    });
  }
}

// ============================================================
// Keyboard Navigation (PS5 Controller Mapping)
// ============================================================
function handleKeyboard(e) {
  if (!SoundEngine.ambientPlaying && !SoundEngine.muted) {
    SoundEngine.startAmbient();
  }

  // Escape closes any active overlay or returns from Game Hub
  if (e.key === "Escape") {
    e.preventDefault();
    if (dom.modalOverlay.classList.contains("active")) {
      closeModal();
    } else if (dom.searchOverlay.classList.contains("active")) {
      closeSearch();
    } else if (dom.settingsOverlay.classList.contains("active")) {
      closeSettings();
    } else if (isControlCenterOpen) {
      closeControlCenter();
    } else if (isGameHubActive) {
      closeGameHub();
    }
    return;
  }

  // Если открыт поиск или настройки — локальный фокус
  if (dom.searchOverlay.classList.contains("active") || dom.settingsOverlay.classList.contains("active") || dom.modalOverlay.classList.contains("active")) {
    return;
  }

  const items = portfolioData[currentCategory];

  switch (e.key) {
    case " ":
      // Пробел — вызов Control Center (кнопка PS)
      e.preventDefault();
      toggleControlCenter();
      break;

    case "/":
      e.preventDefault();
      openSearch();
      break;

    case "ArrowDown":
      e.preventDefault();
      if (!isGameHubActive) {
        openGameHub();
      }
      break;

    case "ArrowUp":
      e.preventDefault();
      if (isGameHubActive) {
        closeGameHub();
      }
      break;

    case "ArrowRight":
      e.preventDefault();
      if (!isGameHubActive) {
        selectItem((activeIndex + 1) % items.length);
        SoundEngine.navigate();
      }
      break;

    case "ArrowLeft":
      e.preventDefault();
      if (!isGameHubActive) {
        selectItem((activeIndex - 1 + items.length) % items.length);
        SoundEngine.navigate();
      }
      break;

    case "Tab":
      e.preventDefault();
      switchCategory(currentCategory === "projects" ? "link" : "projects");
      break;

    case "Enter":
      e.preventDefault();
      handleAction(items[activeIndex].btnAction);
      break;
  }
}

// ============================================================
// Mouse Wheel Two-Tier Scroll
// ============================================================
function handleWheel(e) {
  if (isControlCenterOpen || dom.searchOverlay.classList.contains("active") || dom.settingsOverlay.classList.contains("active")) {
    return;
  }

  if (e.deltaY > 35 && !isGameHubActive) {
    openGameHub();
  } else if (e.deltaY < -35 && isGameHubActive && dom.stageGameHub.scrollTop <= 0) {
    closeGameHub();
  }
}

// ============================================================
// Clock
// ============================================================
function updateClock() {
  const now = new Date();
  dom.clock.textContent = now.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

// ============================================================
// Mute Button Handler
// ============================================================
function initMuteButton() {
  const btn = dom.muteBtn;

  function updateIcon() {
    btn.textContent = SoundEngine.muted ? "🔇" : "🔊";
    btn.classList.toggle("muted", SoundEngine.muted);
    btn.setAttribute("aria-label", SoundEngine.muted ? "Включить звук" : "Выключить звук");
  }

  btn.addEventListener("click", () => {
    SoundEngine.toggle();
    updateIcon();
    showToast("Аудио PS5", SoundEngine.muted ? "Звук выключен" : "Звук включен", SoundEngine.muted ? "🔇" : "🔊");
  });

  updateIcon();
}

// ============================================================
// User Gesture Audio Unlock
// ============================================================
function initAudioUnlock() {
  const unlock = () => {
    if (!SoundEngine.muted && !SoundEngine.ambientPlaying) {
      SoundEngine.startAmbient();
    }
    window.removeEventListener("click", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("click", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
}

// ============================================================
// Application Bootstrapper
// ============================================================
function init() {
  // 1. Вкладки навигации
  dom.navTabs.forEach((tab) => {
    tab.addEventListener("click", () => switchCategory(tab.dataset.category));
  });

  // 2. Двухуровневый спуск / подъем
  dom.scrollDownCue.addEventListener("click", openGameHub);
  dom.scrollUpCue.addEventListener("click", closeGameHub);
  window.addEventListener("wheel", handleWheel, { passive: true });

  // 3. Поиск, Настройки, Кнопка PS
  dom.btnSearch.addEventListener("click", openSearch);
  dom.searchCloseBtn.addEventListener("click", closeSearch);
  dom.searchInput.addEventListener("input", (e) => renderSearchResults(e.target.value));

  dom.btnSettings.addEventListener("click", openSettings);
  dom.settingsCloseBtn.addEventListener("click", closeSettings);

  dom.btnPS.addEventListener("click", toggleControlCenter);

  // 4. Control Center Cards
  dom.ccBtnResume.addEventListener("click", () => {
    closeControlCenter();
    handleAction(portfolioData[currentCategory][activeIndex].btnAction);
  });
  dom.ccBtnProfile.addEventListener("click", () => {
    closeControlCenter();
    handleAction("modal:bio");
  });
  dom.ccMusicToggle.addEventListener("click", () => {
    const playing = SoundEngine.toggleAmbient();
    dom.ccMusicToggle.textContent = playing ? "⏸ Пауза" : "▶ Играть";
  });
  dom.ccMusicVolume.addEventListener("input", (e) => {
    SoundEngine.setMusicVolume(parseFloat(e.target.value));
  });

  // 5. Контекстное меню игры (•••)
  dom.btnOptionsMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleContextMenu();
  });

  dom.contextMenu.querySelectorAll(".context-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      handleContextAction(btn.dataset.action);
    });
  });

  window.addEventListener("click", (e) => {
    if (!dom.contextMenu.contains(e.target) && e.target !== dom.btnOptionsMenu) {
      closeContextMenu();
    }
  });

  // 6. Плашка трофеев и профиль
  dom.trophyPill.addEventListener("click", () => handleAction("modal:trophy"));
  dom.profilePill.addEventListener("click", () => handleAction("modal:bio"));

  // 7. Модальные окна закрытия
  dom.modalCloseBtn.addEventListener("click", closeModal);
  dom.modalOverlay.addEventListener("click", (e) => {
    if (e.target === dom.modalOverlay) closeModal();
  });
  dom.searchOverlay.addEventListener("click", (e) => {
    if (e.target === dom.searchOverlay) closeSearch();
  });
  dom.settingsOverlay.addEventListener("click", (e) => {
    if (e.target === dom.settingsOverlay) closeSettings();
  });
  dom.controlCenterOverlay.addEventListener("click", (e) => {
    if (e.target === dom.controlCenterOverlay) closeControlCenter();
  });

  // 8. Клавиатура
  window.addEventListener("keydown", handleKeyboard);

  // 9. Часы
  updateClock();
  setInterval(updateClock, 1000);

  // 10. Звук и Control Center
  initMuteButton();
  initAudioUnlock();
  renderControlCenter();

  // 11. Первоначальный рендер
  selectItem(0);

  // 12. Приветственный тост
  setTimeout(() => {
    showToast("PlayStation 5", "Вход выполнен: cr1mnsx • Нажмите ↓ для перехода в Game Hub", "⭐");
  }, 900);
}

document.addEventListener("DOMContentLoaded", init);

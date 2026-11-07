/**
 * PS5 Home Menu & Welcome Hub — Main Application Controller
 * Реализует все функции оригинального интерфейса PlayStation 5:
 * - Панель быстрого доступа Control Center (кнопка PS)
 * - Полнотекстовый поиск (Search Overlay)
 * - Экран настроек системы PS5 (Settings Screen)
 * - Генеративная эмбиент-музыка главного меню
 * - Контекстное меню игры / проекта (Three-dots Options)
 * - Модульная Bento-сетка виджетов (Welcome Hub)
 * - Пресеты, сменяемые темы и режим обзора фона
 */

import {
  portfolioData,
  welcomeWidgets,
  layoutPresets,
  bgThemes,
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
let bgThemeIndex = 0;
let currentPresetIndex = 0;
let currentSettingsSection = "accounts";
let bgFlip = false;
let isShowcase = false;
let isControlCenterOpen = false;

const widgetSpans = { ...layoutPresets[0].spans };

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
  activityCards: $("#activityCards"),
  welcomeHubGrid: $("#welcomeHubGrid"),
  presetChips: $("#presetChips"),
  navTabs: $$(".nav-tab"),
  clock: $("#clock"),
  muteBtn: $("#muteBtn"),
  trophyPill: $("#trophyPill"),
  profilePill: $("#profilePill"),
  btnPS: $("#btnPS"),
  btnSearch: $("#btnSearch"),
  btnSettings: $("#btnSettings"),
  btnPreset: $("#btnPreset"),
  presetLabel: $("#presetLabel"),
  btnBgTheme: $("#btnBgTheme"),
  themeLabel: $("#themeLabel"),
  btnShowcase: $("#btnShowcase"),
  showcaseBanner: $("#showcaseBanner"),
  btnExitShowcase: $("#btnExitShowcase"),
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
  controlCenterBar: $("#controlCenterBar"),
  controlCenterTrack: $("#controlCenterTrack")
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
// Dynamic Background Cross-fade
// ============================================================
function setBackground(url) {
  const incoming = bgFlip ? dom.bgA : dom.bgB;
  const outgoing = bgFlip ? dom.bgB : dom.bgA;

  incoming.style.backgroundImage = `url('${url}')`;
  incoming.style.opacity = "1";
  outgoing.style.opacity = "0";

  bgFlip = !bgFlip;
}

function cycleBackgroundTheme() {
  bgThemeIndex = (bgThemeIndex + 1) % bgThemes.length;
  const theme = bgThemes[bgThemeIndex];
  setBackground(theme.url);
  dom.themeLabel.textContent = `Фон: ${theme.name}`;
  showToast("Тема фона", `Применена тема: «${theme.name}»`, "🎨");
  SoundEngine.themeChange();
}

// ============================================================
// Showcase Mode (Чистый обзор фона)
// ============================================================
function toggleShowcase(forceState) {
  isShowcase = typeof forceState === "boolean" ? forceState : !isShowcase;

  if (isShowcase) {
    closeControlCenter();
    closeAllModals();
    document.body.classList.add("showcase-active");
    dom.showcaseBanner.setAttribute("aria-hidden", "false");
  } else {
    document.body.classList.remove("showcase-active");
    dom.showcaseBanner.setAttribute("aria-hidden", "true");
  }

  SoundEngine.showcase();
}

// ============================================================
// PS5 Control Center (Quick Menu • Кнопка PS)
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
    dom.controlCenterBar.classList.add("active");
    dom.controlCenterBar.setAttribute("aria-hidden", "false");
    SoundEngine.controlCenter(true);
  } else {
    closeControlCenter();
  }
}

function closeControlCenter() {
  if (!isControlCenterOpen) return;
  isControlCenterOpen = false;
  dom.controlCenterBar.classList.remove("active");
  dom.controlCenterBar.setAttribute("aria-hidden", "true");
  SoundEngine.controlCenter(false);
}

function handleControlCenterAction(action) {
  switch (action) {
    case "home":
      window.scrollTo({ top: 0, behavior: "smooth" });
      selectItem(0);
      closeControlCenter();
      break;

    case "switcher":
      closeControlCenter();
      selectItem((activeIndex + 1) % portfolioData[currentCategory].length);
      SoundEngine.navigate();
      showToast("Переключатель", "Переключено на следующий проект", "🔀");
      break;

    case "notifications":
      closeControlCenter();
      showToast("PlayStation Network", "Все службы сети cr1mnsx функционируют нормально", "🔔");
      break;

    case "gamebase":
      closeControlCenter();
      handleAction("modal:bio");
      break;

    case "music":
      const playing = SoundEngine.toggleAmbient();
      showToast("Фоновая музыка PS5", playing ? "Воспроизведение включено" : "Воспроизведение приостановлено", "🎵");
      break;

    case "sound":
      SoundEngine.toggle();
      dom.muteBtn.textContent = SoundEngine.muted ? "🔇" : "🔊";
      dom.muteBtn.classList.toggle("muted", SoundEngine.muted);
      showToast("Аудио", SoundEngine.muted ? "Звук отключен" : "Звук активен", SoundEngine.muted ? "🔇" : "🔊");
      break;

    case "accessories":
      closeControlCenter();
      showToast("DualSense Controller", "Заряд 88% • Haptic Feedback активен • Bluetooth", "🎮");
      break;

    case "power":
      closeControlCenter();
      openModal({
        tag: "PS5 POWER OPTIONS",
        title: "Питание системы",
        subtitle: "Управление состоянием дашборда",
        content: `
          <p class="modal-p">Выберите действие с интерфейсом:</p>
          <div class="modal-spec-grid">
            <div class="modal-spec-box">
              <span class="spec-label">Режим отдыха</span>
              <span class="spec-val">Включить Showcase (обзор фона)</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Аудиосистема</span>
              <span class="spec-val">Выключить звук и музыку</span>
            </div>
          </div>
        `,
        actions: [
          { text: "Включить режим отдыха (Showcase)", action: "showcase", primary: true },
          { text: "Выключить звук", action: "sound_mute", primary: false }
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
// PS5 Search Overlay (Мгновенный поиск)
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
    <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 8px;">${section.icon} ${section.title}</h3>
    <div style="font-size: 0.86rem; color: var(--text-muted); margin-bottom: 18px;">Параметры и конфигурация рабочей среды cr1mnsx</div>
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

    // Слушатель для кнопок в настройках
    const btn = card.querySelector("button");
    if (btn) {
      btn.addEventListener("click", () => {
        if (btn.dataset.action) {
          handleAction(btn.dataset.action);
        } else if (btn.dataset.toggle === "ambient") {
          const playing = SoundEngine.toggleAmbient();
          btn.textContent = playing ? "Выключить" : "Включить";
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
      copyToClipboard(window.location.href, "Ссылка на дашборд");
      break;

    case "fav":
      SoundEngine.chime();
      showToast("Избранное", `Проект «${currentItem.title}» закреплен в избранном`, "⭐");
      break;
  }
}

// ============================================================
// PS5 Modal / Drawer System (Без внешних редиректов)
// ============================================================
function openModal({ tag, title, subtitle, content, actions = [] }) {
  closeControlCenter();
  dom.modalTag.textContent = tag || "PS5 WELCOME HUB";
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
  SoundEngine.modalClose();
}

function closeAllModals() {
  closeModal();
  closeSearch();
  closeSettings();
  closeContextMenu();
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
    copyToClipboard("VK: https://vk.ru/cr1mnsx | GitHub: https://github.com/crimnsx-alt | PS5 Hub: https://crimnsx-alt.github.io/Cr1mnsxSEX/", "Все ссылки хаба");
    return;
  }
  if (actionString === "showcase") {
    closeModal();
    toggleShowcase(true);
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
      tag: "PSN TROPHY SHOWCASE",
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
        <p class="modal-p">Ключевое разблокированное достижение: <strong>«Next-Gen Master: Архитектура Welcome Hub и Консалтинг 1С»</strong>.</p>
      `,
      actions: [
        { text: "Скопировать профиль", action: "copy:vk", primary: true }
      ]
    });
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
// Bento Grid & Widgets System
// ============================================================
function getWidgetIconSVG(iconName) {
  switch (iconName) {
    case "trophy": return "🏆";
    case "storage": return "💾";
    case "controller": return "🎮";
    case "network": return "🌐";
    case "links": return "🔗";
    case "media": return "🖼️";
    default: return "⚡";
  }
}

function renderWidgets() {
  dom.welcomeHubGrid.innerHTML = "";

  welcomeWidgets.forEach((w) => {
    const spanClass = widgetSpans[w.id] || w.defaultSpan || "widget-1x1";
    const themeClass = w.type === "blue" ? "widget-blue" : "widget-glass";

    const card = document.createElement("div");
    card.className = `widget-card ${themeClass} ${spanClass}`;
    card.dataset.widgetId = w.id;

    card.innerHTML = `
      <div class="widget-header">
        <div class="widget-icon-title">
          <div class="widget-icon-badge">${getWidgetIconSVG(w.icon)}</div>
          <div class="widget-title-group">
            <span class="widget-title">${w.title}</span>
            <span class="widget-badge">${w.badge}</span>
          </div>
        </div>
        <div class="widget-header-actions">
          <span class="widget-meta-tag">${w.headerRight}</span>
          <button class="btn-widget-resize" type="button" title="Изменить размер виджета" aria-label="Размер виджета">⤢</button>
        </div>
      </div>
      <div class="widget-body">
        ${w.content}
      </div>
      <div class="widget-footer-note">${w.footerNote}</div>
    `;

    const resizeBtn = card.querySelector(".btn-widget-resize");
    resizeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      cycleWidgetSize(w.id);
    });

    card.addEventListener("click", (e) => {
      const targetAction = e.target.closest("[data-action]");
      if (targetAction) {
        e.preventDefault();
        e.stopPropagation();
        handleAction(targetAction.dataset.action);
      }
    });

    dom.welcomeHubGrid.appendChild(card);
  });
}

function cycleWidgetSize(widgetId) {
  const current = widgetSpans[widgetId] || "widget-1x1";
  let next = "widget-1x1";

  if (current === "widget-1x1") next = "widget-2x1";
  else if (current === "widget-2x1") next = "widget-1x2";
  else next = "widget-1x1";

  widgetSpans[widgetId] = next;
  renderWidgets();
  SoundEngine.resize();
  showToast("Виджет обновлен", `Новый размер: ${next.replace("widget-", "")}`, "📐");
}

function renderPresetChips() {
  dom.presetChips.innerHTML = "";
  layoutPresets.forEach((p, idx) => {
    const chip = document.createElement("button");
    chip.className = `chip-btn ${idx === currentPresetIndex ? "active" : ""}`;
    chip.type = "button";
    chip.textContent = p.name;
    chip.addEventListener("click", () => applyPreset(idx));
    dom.presetChips.appendChild(chip);
  });
}

function applyPreset(index) {
  currentPresetIndex = index;
  const preset = layoutPresets[index];
  Object.assign(widgetSpans, preset.spans);
  dom.presetLabel.textContent = `Раскладка: ${preset.name}`;
  renderPresetChips();
  renderWidgets();
  SoundEngine.confirm();
  showToast("Раскладка изменена", preset.name, "🍱");
}

function cyclePreset() {
  const nextIdx = (currentPresetIndex + 1) % layoutPresets.length;
  applyPreset(nextIdx);
}

// ============================================================
// Top App Dock
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
// Hero Section & Activity Cards Update
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

    dom.activityCards.innerHTML = item.cards.map((c) => `
      <div class="activity-card" data-action="${c.action || ''}" data-link="${c.link || ''}">
        <div class="card-type">${c.type}</div>
        <div class="card-title">${c.title}</div>
        <div class="card-progress">${c.progress}</div>
      </div>
    `).join("");

    dom.activityCards.querySelectorAll(".activity-card").forEach((card) => {
      card.addEventListener("click", () => {
        if (card.dataset.action) {
          handleAction(card.dataset.action);
        } else if (card.dataset.link) {
          window.open(card.dataset.link, "_blank", "noopener");
        }
      });
    });

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

  selectItem(0);
  SoundEngine.confirm();
  showToast("Раздел изменен", cat === "projects" ? "Раздел: Проекты" : "Раздел: Link", "📂");
}

// ============================================================
// Keyboard Navigation (PS5 Controller & Keyboard Mapping)
// ============================================================
function handleKeyboard(e) {
  // Запуск эмбиент-музыки по первому нажатию
  if (!SoundEngine.ambientPlaying && !SoundEngine.muted) {
    SoundEngine.startAmbient();
  }

  // 1. Showcase
  if (isShowcase) {
    e.preventDefault();
    toggleShowcase(false);
    return;
  }

  // 2. Escape closes modals / search / settings / control center
  if (e.key === "Escape") {
    e.preventDefault();
    if (isControlCenterOpen) {
      closeControlCenter();
    } else {
      closeAllModals();
    }
    return;
  }

  // Если открыт поиск или настройки — стрелки и Enter обрабатываются локально
  if (dom.searchOverlay.classList.contains("active")) {
    return;
  }
  if (dom.settingsOverlay.classList.contains("active") || dom.modalOverlay.classList.contains("active")) {
    return;
  }

  const items = portfolioData[currentCategory];

  switch (e.key) {
    case " ":
      // Пробел — вызов Control Center (аналог кнопки PS)
      e.preventDefault();
      toggleControlCenter();
      break;

    case "/":
      e.preventDefault();
      openSearch();
      break;

    case "ArrowRight":
      e.preventDefault();
      selectItem((activeIndex + 1) % items.length);
      SoundEngine.navigate();
      break;

    case "ArrowLeft":
      e.preventDefault();
      selectItem((activeIndex - 1 + items.length) % items.length);
      SoundEngine.navigate();
      break;

    case "Tab":
      e.preventDefault();
      switchCategory(currentCategory === "projects" ? "link" : "projects");
      break;

    case "Enter":
      e.preventDefault();
      handleAction(items[activeIndex].btnAction);
      break;

    case "p":
    case "P":
    case "a":
    case "A":
      e.preventDefault();
      cyclePreset();
      break;

    case "b":
    case "B":
      e.preventDefault();
      cycleBackgroundTheme();
      break;

    case "s":
    case "S":
    case "c":
    case "C":
      e.preventDefault();
      toggleShowcase();
      break;
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
  // Вкладки
  dom.navTabs.forEach((tab) => {
    tab.addEventListener("click", () => switchCategory(tab.dataset.category));
  });

  // Кнопки управления в шапке
  dom.btnPreset.addEventListener("click", cyclePreset);
  dom.btnBgTheme.addEventListener("click", cycleBackgroundTheme);
  dom.btnShowcase.addEventListener("click", () => toggleShowcase(true));
  dom.btnExitShowcase.addEventListener("click", () => toggleShowcase(false));

  // Поиск, Настройки, Кнопка PS
  dom.btnSearch.addEventListener("click", openSearch);
  dom.searchCloseBtn.addEventListener("click", closeSearch);
  dom.searchInput.addEventListener("input", (e) => renderSearchResults(e.target.value));

  dom.btnSettings.addEventListener("click", openSettings);
  dom.settingsCloseBtn.addEventListener("click", closeSettings);

  dom.btnPS.addEventListener("click", toggleControlCenter);

  // Контекстное меню игры (•••)
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

  // Плашка трофеев и профиль
  dom.trophyPill.addEventListener("click", () => handleAction("modal:trophy"));
  dom.profilePill.addEventListener("click", () => handleAction("modal:bio"));

  // Модальные окна
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

  // Клавиатура
  window.addEventListener("keydown", handleKeyboard);

  // Часы
  updateClock();
  setInterval(updateClock, 1000);

  // Звук & Control Center
  initMuteButton();
  initAudioUnlock();
  renderControlCenter();

  // Виджеты Bento Grid
  renderPresetChips();
  renderWidgets();

  // Первый элемент
  selectItem(0);

  // Приветственный тост
  setTimeout(() => {
    showToast("PlayStation 5", "Вход выполнен: cr1mnsx (Уровень 99)", "⭐");
  }, 1000);
}

document.addEventListener("DOMContentLoaded", init);

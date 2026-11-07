/**
 * PS5 Welcome Hub — Main Application Engine
 * Модульная Bento-сетка, динамический кросс-фейд тем, модальные окна
 * без внешних редиректов, PS5 Toast-нотификации и звуковой движок.
 */

import { portfolioData, welcomeWidgets, layoutPresets, bgThemes } from "./data.js";
import { SoundEngine } from "./sound.js";

// ============================================================
// State
// ============================================================
let currentCategory = "projects"; // "projects" | "link"
let activeIndex = 0;
let bgThemeIndex = 0;
let currentPresetIndex = 0;
let bgFlip = false;
let isShowcase = false;

// Dynamic map of widget spans: widgetId -> spanClass
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
  activityCards: $("#activityCards"),
  welcomeHubGrid: $("#welcomeHubGrid"),
  presetChips: $("#presetChips"),
  navTabs: $$(".nav-tab"),
  clock: $("#clock"),
  muteBtn: $("#muteBtn"),
  trophyPill: $("#trophyPill"),
  profilePill: $("#profilePill"),
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
  modalActions: $("#modalActions")
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
    document.body.classList.add("showcase-active");
    dom.showcaseBanner.setAttribute("aria-hidden", "false");
  } else {
    document.body.classList.remove("showcase-active");
    dom.showcaseBanner.setAttribute("aria-hidden", "true");
  }

  SoundEngine.showcase();
}

// ============================================================
// PS5 Modal / Drawer System (Без внешних редиректов)
// ============================================================
function openModal({ tag, title, subtitle, content, actions = [] }) {
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

  // Добавляем обязательную кнопку закрытия в футер
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

// ============================================================
// Central Action Dispatcher
// ============================================================
function handleAction(actionString) {
  if (!actionString) return;

  // 1. Копирование контактов с тостом
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

  // 2. Модальные окна
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

  // Дефолтное открытие текущего элемента дока
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
// Render Bento Grid & Widgets System
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
          <button class="btn-widget-resize" type="button" title="Изменить размер виджета (1x1, 2x1, 1x2)" aria-label="Размер виджета">⤢</button>
        </div>
      </div>
      <div class="widget-body">
        ${w.content}
      </div>
      <div class="widget-footer-note">${w.footerNote}</div>
    `;

    // Кнопка ресайза виджета
    const resizeBtn = card.querySelector(".btn-widget-resize");
    resizeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      cycleWidgetSize(w.id);
    });

    // Делегирование кликов по интерактивным элементам внутри виджета
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
  showToast("Виджет обновлен", `Новый размер карточки: ${next.replace("widget-", "")}`, "📐");
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
// Render Top App Dock
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
        // Клик по уже активной иконке открывает модальное окно с подробностями!
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

    // Кнопка 1 (Play / Основная)
    dom.heroBtn.textContent = item.btnText;
    dom.heroBtn.onclick = () => {
      handleAction(item.btnAction);
    };

    // Кнопка 2 (Secondary)
    dom.heroSecBtn.textContent = item.secText;
    dom.heroSecBtn.onclick = () => {
      if (item.secAction) {
        handleAction(item.secAction);
      } else if (item.secLink) {
        window.open(item.secLink, "_blank", "noopener");
      }
    };

    // Карточки активностей
    dom.activityCards.innerHTML = item.cards.map((c) => `
      <div class="activity-card" data-action="${c.action || ''}" data-link="${c.link || ''}">
        <div class="card-type">${c.type}</div>
        <div class="card-title">${c.title}</div>
        <div class="card-progress">${c.progress}</div>
      </div>
    `).join("");

    // Слушатели на карточки активностей
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
// Keyboard Navigation (PS5 Controller Mapping)
// ============================================================
function handleKeyboard(e) {
  // Если активен режим обзора (Showcase) — любая клавиша выходит из него
  if (isShowcase) {
    e.preventDefault();
    toggleShowcase(false);
    return;
  }

  // Если открыто модальное окно — ESC закрывает его
  if (dom.modalOverlay.classList.contains("active")) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
    }
    return;
  }

  const items = portfolioData[currentCategory];

  switch (e.key) {
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
// Real-time Clock
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
// Application Bootstrapper
// ============================================================
function init() {
  // 1. Вкладки навигации
  dom.navTabs.forEach((tab) => {
    tab.addEventListener("click", () => switchCategory(tab.dataset.category));
  });

  // 2. Кнопки управления Welcome Hub в шапке
  dom.btnPreset.addEventListener("click", cyclePreset);
  dom.btnBgTheme.addEventListener("click", cycleBackgroundTheme);
  dom.btnShowcase.addEventListener("click", () => toggleShowcase(true));
  dom.btnExitShowcase.addEventListener("click", () => toggleShowcase(false));

  // 3. Плашка трофеев и профиль (внутренние окна без внешних редиректов!)
  dom.trophyPill.addEventListener("click", () => handleAction("modal:trophy"));
  dom.profilePill.addEventListener("click", () => handleAction("modal:bio"));

  // 4. Модальное окно: закрытие по крестику и по клику на оверлей
  dom.modalCloseBtn.addEventListener("click", closeModal);
  dom.modalOverlay.addEventListener("click", (e) => {
    if (e.target === dom.modalOverlay) {
      closeModal();
    }
  });

  // 5. Клавиатура
  window.addEventListener("keydown", handleKeyboard);

  // 6. Часы
  updateClock();
  setInterval(updateClock, 1000);

  // 7. Звук
  initMuteButton();

  // 8. Виджеты Bento Grid
  renderPresetChips();
  renderWidgets();

  // 9. Инициализация первого элемента
  selectItem(0);

  // 10. Стартовое приветствие
  setTimeout(() => {
    showToast("PS5 Welcome Hub", "Добро пожаловать в персональный хаб cr1mnsx!", "⭐");
  }, 900);
}

document.addEventListener("DOMContentLoaded", init);

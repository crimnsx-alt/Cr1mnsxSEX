/**
 * PS5 Portfolio Dashboard — Main Application Logic
 * Manages dock rendering, hero updates, keyboard navigation,
 * category switching, background cross-fade, and clock.
 */

import { portfolioData } from "./data.js";
import { SoundEngine } from "./sound.js";

// ---- State ----
let currentCategory = "projects";
let activeIndex = 0;
let bgFlip = false; // toggles between bg layers A and B for cross-fade

// ---- DOM Cache ----
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
  clock: $("#clock"),
  muteBtn: $("#muteBtn"),
};

const navTabs = $$(".nav-tab");

// ---- Background Cross-fade ----
function setBackground(url) {
  const incoming = bgFlip ? dom.bgA : dom.bgB;
  const outgoing = bgFlip ? dom.bgB : dom.bgA;

  incoming.style.backgroundImage = `url('${url}')`;
  incoming.style.opacity = "1";
  outgoing.style.opacity = "0";

  bgFlip = !bgFlip;
}

// ---- Render Dock Tiles ----
function renderDock() {
  const items = portfolioData[currentCategory];
  dom.dock.innerHTML = "";

  items.forEach((item, idx) => {
    const tile = document.createElement("div");
    tile.className = `game-tile${idx === activeIndex ? " active" : ""}`;
    tile.style.backgroundImage = `url('${item.thumb}')`;
    tile.setAttribute("role", "button");
    tile.setAttribute("aria-label", item.title);
    tile.innerHTML = `
      <span class="tile-badge">${item.badge}</span>
      <span class="tile-label">${item.title}</span>
    `;
    tile.addEventListener("click", () => {
      if (idx !== activeIndex) {
        selectItem(idx);
        SoundEngine.navigate();
      }
    });
    dom.dock.appendChild(tile);
  });
}

// ---- Update Hero Content ----
function updateHero(item) {
  // Smooth content transition
  dom.heroSection.classList.add("transitioning");

  setTimeout(() => {
    dom.heroTag.textContent = item.tag;
    dom.heroTitle.textContent = item.title;
    dom.heroDesc.textContent = item.desc;
    dom.heroBtn.textContent = item.btnText;
    dom.heroBtn.href = item.btnLink;
    dom.heroSecBtn.textContent = item.secText;
    dom.heroSecBtn.href = item.secLink;
    dom.heroSection.classList.remove("transitioning");
  }, 180);
}

// ---- Render Activity Cards ----
function renderCards(cards) {
  dom.activityCards.innerHTML = cards
    .map(
      (c) => `
    <a href="${c.link}" target="_blank" rel="noopener" class="activity-card">
      <div class="card-type">${c.type}</div>
      <div class="card-title">${c.title}</div>
      <div class="card-progress">${c.progress}</div>
    </a>`
    )
    .join("");
}

// ---- Select Item ----
function selectItem(index) {
  const items = portfolioData[currentCategory];
  activeIndex = index;
  const item = items[index];

  renderDock();
  setBackground(item.bg);
  updateHero(item);
  renderCards(item.cards);
}

// ---- Switch Category ----
function switchCategory(cat) {
  if (cat === currentCategory) return;
  currentCategory = cat;
  activeIndex = 0;

  navTabs.forEach((t) => {
    t.classList.toggle("active", t.dataset.category === cat);
  });

  selectItem(0);
  SoundEngine.confirm();
}

// ---- Keyboard Navigation ----
function handleKeyboard(e) {
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
      switchCategory(currentCategory === "projects" ? "media" : "projects");
      break;

    case "Enter":
      e.preventDefault();
      SoundEngine.open();
      window.open(items[activeIndex].btnLink, "_blank");
      break;
  }
}

// ---- Live Clock ----
function updateClock() {
  const now = new Date();
  dom.clock.textContent = now.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---- Mute Button ----
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
  });

  updateIcon();
}

// ---- Init ----
function init() {
  // Tabs
  navTabs.forEach((tab) => {
    tab.addEventListener("click", () => switchCategory(tab.dataset.category));
  });

  // Keyboard
  window.addEventListener("keydown", handleKeyboard);

  // Clock
  updateClock();
  setInterval(updateClock, 1000);

  // Mute
  initMuteButton();

  // Initial render
  selectItem(0);
}

document.addEventListener("DOMContentLoaded", init);


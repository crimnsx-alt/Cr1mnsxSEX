/**
 * PlayStation®5 Twitch Broadcast Hub Service
 * Integrates Twitch Live Stream Player, Chat, Custom Streamer Management,
 * and PS5 Picture-in-Picture (Pin to Side / PiP) mode.
 */

import { SoundEngine } from "./sound.js";

const STORAGE_KEY = "ps5_twitch_streamers_v1";

export const DEFAULT_TWITCH_STREAMERS = [
  {
    id: "mafanyaking",
    channel: "mafanyaking",
    name: "Мафаня",
    color: "#ec4899",
    category: "Just Chatting",
    desc: "Мафаня — общение, игры, стримы и IRL",
    url: "https://www.twitch.tv/mafanyaking",
    initial: "M"
  },
  {
    id: "kussia88",
    channel: "kussia88",
    name: "Каша",
    color: "#ef4444",
    category: "Just Chatting / Реакции",
    desc: "Каша — реакты, угарные нарезки и разговорные стримы",
    url: "https://www.twitch.tv/kussia88",
    initial: "К"
  },
  {
    id: "5opka",
    channel: "5opka",
    name: "Пятёрка",
    color: "#10b981",
    category: "Игры / Minecraft / Шоу",
    desc: "Кирилл Баранов (Пятёрка) — легендарные шоу, майнкрафт и стримы",
    url: "https://www.twitch.tv/5opka",
    initial: "5"
  },
  {
    id: "lenyapudge",
    channel: "lenyapudge",
    name: "Лёня Пудж",
    color: "#06b6d4",
    category: "Dota 2 / Pudge",
    desc: "Лёня Пудж — топовый геймплей на Pudge и угар в Доте",
    url: "https://www.twitch.tv/lenyapudge",
    initial: "Л"
  },
  {
    id: "sbomba3131",
    channel: "sbomba3131",
    name: "Сбомба",
    color: "#f97316",
    category: "Игры / Общение",
    desc: "Сбомба (sbomba3131) — позитивные стримы, прохождения и челленджи",
    url: "https://www.twitch.tv/sbomba3131",
    initial: "С"
  },
  {
    id: "bugorpro",
    channel: "bugorpro",
    name: "Бугор",
    color: "#8b5cf6",
    category: "CS2 / Шутеры / Игры",
    desc: "Бугор (bugorpro) — киберспорт, матчи CS2 и хардкорный гейминг",
    url: "https://www.twitch.tv/bugorpro",
    initial: "Б"
  }
];

class TwitchBroadcastService {
  constructor() {
    this.streamers = this.loadStreamers();
    this.activeChannel = this.streamers[0]?.channel || "mafanyaking";
    this.isChatOpen = true;
    this.isPipActive = false;
    this.isHubActive = false;
    this.showToastCallback = null;
  }

  setToastHandler(fn) {
    this.showToastCallback = fn;
  }

  toast(title, msg, icon) {
    if (this.showToastCallback) {
      this.showToastCallback(title, msg, icon);
    }
  }

  loadStreamers() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("[TwitchService] Failed to read localStorage:", e);
    }
    return [...DEFAULT_TWITCH_STREAMERS];
  }

  saveStreamers() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.streamers));
    } catch (e) {
      console.warn("[TwitchService] Failed to write localStorage:", e);
    }
  }

  getStreamers() {
    return this.streamers;
  }

  getActiveStreamer() {
    return this.streamers.find((s) => s.channel.toLowerCase() === this.activeChannel.toLowerCase()) || this.streamers[0] || {
      id: this.activeChannel,
      channel: this.activeChannel,
      name: this.activeChannel,
      color: "#9146FF",
      category: "Twitch Live",
      desc: "Прямая трансляция канала",
      url: `https://www.twitch.tv/${this.activeChannel}`,
      initial: this.activeChannel.charAt(0).toUpperCase()
    };
  }

  parseChannelInput(input) {
    if (!input) return null;
    let trimmed = input.trim();
    // Support URLs: https://www.twitch.tv/username or twitch.tv/username/
    trimmed = trimmed.replace(/^https?:\/\//i, "");
    trimmed = trimmed.replace(/^(www\.)?twitch\.tv\//i, "");
    trimmed = trimmed.split("/")[0].split("?")[0].replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
    return trimmed.length > 0 ? trimmed : null;
  }

  addStreamer(rawInput, customName = "") {
    const channel = this.parseChannelInput(rawInput);
    if (!channel) {
      return { success: false, error: "Неверное имя канала или ссылка" };
    }

    if (this.streamers.some((s) => s.channel.toLowerCase() === channel)) {
      return { success: false, error: "Этот канал уже есть в списке" };
    }

    const palette = ["#ec4899", "#ef4444", "#10b981", "#06b6d4", "#f97316", "#8b5cf6", "#3b82f6", "#eab308"];
    const randomColor = palette[Math.floor(Math.random() * palette.length)];
    const name = customName.trim() || channel;

    const newStreamer = {
      id: channel,
      channel: channel,
      name: name,
      color: randomColor,
      category: "Twitch Channel",
      desc: `Пользовательский канал Twitch: ${channel}`,
      url: `https://www.twitch.tv/${channel}`,
      initial: name.charAt(0).toUpperCase(),
      custom: true
    };

    this.streamers.push(newStreamer);
    this.saveStreamers();
    this.selectStreamer(channel);
    this.renderSidebarList();
    return { success: true, streamer: newStreamer };
  }

  removeStreamer(channel) {
    this.streamers = this.streamers.filter((s) => s.channel.toLowerCase() !== channel.toLowerCase());
    if (this.streamers.length === 0) {
      this.streamers = [...DEFAULT_TWITCH_STREAMERS];
    }
    this.saveStreamers();
    if (this.activeChannel.toLowerCase() === channel.toLowerCase()) {
      this.selectStreamer(this.streamers[0].channel);
    } else {
      this.renderSidebarList();
    }
  }

  resetDefaults() {
    this.streamers = [...DEFAULT_TWITCH_STREAMERS];
    this.saveStreamers();
    this.selectStreamer(this.streamers[0].channel);
    this.renderSidebarList();
  }

  getParentParams() {
    const currentHost = window.location.hostname;
    const hosts = [...new Set([currentHost, "crimnsx-alt.github.io", "localhost", "127.0.0.1"])].filter(Boolean);
    return hosts.map((h) => `parent=${encodeURIComponent(h)}`).join("&");
  }

  getPlayerUrl(channel) {
    const parents = this.getParentParams();
    return `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&${parents}&autoplay=true&muted=false`;
  }

  getChatUrl(channel) {
    const parents = this.getParentParams();
    return `https://www.twitch.tv/embed/${encodeURIComponent(channel)}/chat?${parents}&darkpopout`;
  }

  getAvatarSvg(streamer) {
    const initial = streamer.initial || streamer.name.charAt(0).toUpperCase();
    const color = streamer.color || "#9146FF";
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='${encodeURIComponent(color)}'/%3E%3Cstop offset='100%25' stop-color='%23121318'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' rx='50' fill='url(%23g)'/%3E%3Ccircle cx='50' cy='50' r='48' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='2' stroke-opacity='0.4'/%3E%3Ctext x='50' y='63' font-family='-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' font-size='42' font-weight='800' fill='%23ffffff' text-anchor='middle'%3E${encodeURIComponent(initial)}%3C/text%3E%3C/svg%3E`;
  }

  renderSidebarList() {
    const container = document.getElementById("twitchStreamersList");
    if (!container) return;

    const countEl = document.getElementById("twitchStreamersCount");
    if (countEl) countEl.textContent = this.streamers.length;

    container.innerHTML = this.streamers
      .map((s) => {
        const isActive = s.channel.toLowerCase() === this.activeChannel.toLowerCase();
        const avatarSvg = this.getAvatarSvg(s);
        return `
          <div class="twitch-streamer-card ${isActive ? "is-active" : ""}" data-channel="${s.channel}" role="button" tabindex="0">
            <div class="twitch-card-avatar-wrap">
              <img src="${avatarSvg}" alt="${s.name}" class="twitch-card-avatar" />
              <span class="twitch-card-online-dot" style="background-color: ${s.color};"></span>
            </div>
            <div class="twitch-card-info">
              <div class="twitch-card-name-row">
                <span class="twitch-card-name">${s.name}</span>
                ${isActive ? '<span class="twitch-card-active-pill">В ЭФИРЕ</span>' : ""}
              </div>
              <span class="twitch-card-handle">twitch.tv/${s.channel}</span>
            </div>
            ${
              s.custom
                ? `<button type="button" class="twitch-card-del-btn" data-del-channel="${s.channel}" title="Удалить канал">×</button>`
                : ""
            }
          </div>
        `;
      })
      .join("");

    container.querySelectorAll(".twitch-streamer-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".twitch-card-del-btn")) return;
        const ch = card.dataset.channel;
        SoundEngine.focusMove();
        this.selectStreamer(ch);
      });
    });

    container.querySelectorAll(".twitch-card-del-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const ch = btn.dataset.delChannel;
        SoundEngine.confirm();
        this.removeStreamer(ch);
      });
    });
  }

  selectStreamer(channel) {
    this.activeChannel = channel;
    const streamer = this.getActiveStreamer();

    // Update Ambient Glow
    const glowEl = document.getElementById("twitchAmbientGlow");
    if (glowEl) {
      glowEl.style.setProperty("--streamer-color", streamer.color || "#9146FF");
    }

    // Update Meta Bar
    const nameEl = document.getElementById("twitchMetaName");
    if (nameEl) nameEl.textContent = streamer.name;

    const catEl = document.getElementById("twitchMetaCategory");
    if (catEl) catEl.textContent = streamer.category || "Twitch Live";

    const linkEl = document.getElementById("twitchMetaLink");
    if (linkEl) {
      linkEl.href = streamer.url;
      linkEl.textContent = `twitch.tv/${streamer.channel}`;
    }

    const descEl = document.getElementById("twitchMetaDesc");
    if (descEl) descEl.textContent = streamer.desc || "Прямая трансляция канала";

    const avatarEl = document.getElementById("twitchMetaAvatar");
    if (avatarEl) {
      avatarEl.innerHTML = `<img src="${this.getAvatarSvg(streamer)}" alt="${streamer.name}" />`;
    }

    // Update PiP Bar
    const pipName = document.getElementById("twitchPipName");
    if (pipName) pipName.textContent = `${streamer.name} (${streamer.channel})`;

    // Update Video Iframe
    this.renderPlayerIframe();

    // Update Chat Iframe if open
    if (this.isChatOpen) {
      this.renderChatIframe();
    }

    // Update Active in Sidebar
    document.querySelectorAll(".twitch-streamer-card").forEach((card) => {
      card.classList.toggle("is-active", card.dataset.channel.toLowerCase() === channel.toLowerCase());
    });
  }

  renderPlayerIframe() {
    const wrap = document.getElementById("twitchIframeWrap");
    if (!wrap) return;

    const url = this.getPlayerUrl(this.activeChannel);
    wrap.innerHTML = `
      <iframe
        id="twitchPlayerIframe"
        src="${url}"
        frameborder="0"
        allowfullscreen="true"
        scrolling="no"
        allow="autoplay; fullscreen"
        title="Twitch Player - ${this.activeChannel}">
      </iframe>
    `;
  }

  renderChatIframe() {
    const wrap = document.getElementById("twitchChatIframeWrap");
    if (!wrap) return;

    const url = this.getChatUrl(this.activeChannel);
    wrap.innerHTML = `
      <iframe
        id="twitchChatIframe"
        src="${url}"
        frameborder="0"
        scrolling="no"
        title="Twitch Chat - ${this.activeChannel}">
      </iframe>
    `;
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    const sidebar = document.getElementById("twitchChatSidebar");
    const lbl = document.getElementById("lblToggleChat");
    if (sidebar) {
      sidebar.classList.toggle("is-closed", !this.isChatOpen);
    }
    if (lbl) {
      lbl.textContent = this.isChatOpen ? "Чат: Вкл" : "Чат: Выкл";
    }
    if (this.isChatOpen) {
      this.renderChatIframe();
    } else {
      const wrap = document.getElementById("twitchChatIframeWrap");
      if (wrap) wrap.innerHTML = "";
    }
    SoundEngine.sliderStep();
  }

  openHub(initialChannel = null) {
    if (initialChannel) {
      this.activeChannel = initialChannel;
    }
    this.isHubActive = true;
    this.closePip(false);

    const modal = document.getElementById("modalTwitchHub");
    if (!modal) return;

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    SoundEngine.openDialog();

    this.renderSidebarList();
    this.selectStreamer(this.activeChannel);
  }

  closeHub() {
    this.isHubActive = false;
    const modal = document.getElementById("modalTwitchHub");
    if (!modal) return;

    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    SoundEngine.closeDialog();

    // Clear iframes to stop playback and memory usage
    const pWrap = document.getElementById("twitchIframeWrap");
    if (pWrap) pWrap.innerHTML = "";
    const cWrap = document.getElementById("twitchChatIframeWrap");
    if (cWrap) cWrap.innerHTML = "";
  }

  enablePip() {
    const streamer = this.getActiveStreamer();
    this.isPipActive = true;

    // Close Hub visually without destroying audio/stream
    const modal = document.getElementById("modalTwitchHub");
    if (modal) {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
    }

    const pipWidget = document.getElementById("ps5TwitchPip");
    const pipBody = document.getElementById("twitchPipBody");
    const pipName = document.getElementById("twitchPipName");

    if (pipWidget && pipBody) {
      pipWidget.hidden = false;
      if (pipName) pipName.textContent = `${streamer.name} · LIVE`;
      pipBody.innerHTML = `
        <iframe
          src="${this.getPlayerUrl(this.activeChannel)}"
          frameborder="0"
          allowfullscreen="true"
          scrolling="no"
          allow="autoplay; fullscreen"
          title="Twitch Mini Player - ${this.activeChannel}">
        </iframe>
      `;
    }

    // Clear big modal iframe
    const pWrap = document.getElementById("twitchIframeWrap");
    if (pWrap) pWrap.innerHTML = "";
    const cWrap = document.getElementById("twitchChatIframeWrap");
    if (cWrap) cWrap.innerHTML = "";

    SoundEngine.enter();
    this.toast("PlayStation®5 PiP", `Трансляция ${streamer.name} закреплена в углу`, null);
  }

  expandPip() {
    this.closePip(false);
    this.openHub(this.activeChannel);
  }

  closePip(shouldStop = true) {
    this.isPipActive = false;
    const pipWidget = document.getElementById("ps5TwitchPip");
    if (pipWidget) pipWidget.hidden = true;
    if (shouldStop) {
      const pipBody = document.getElementById("twitchPipBody");
      if (pipBody) pipBody.innerHTML = "";
    }
  }

  init() {
    // Top Bar Buttons
    document.getElementById("btnTwitchClose")?.addEventListener("click", () => this.closeHub());
    document.getElementById("twitchBackdrop")?.addEventListener("click", () => this.closeHub());
    document.getElementById("btnToggleChat")?.addEventListener("click", () => this.toggleChat());
    document.getElementById("btnTwitchPip")?.addEventListener("click", () => this.enablePip());
    document.getElementById("btnOpenExternalTwitch")?.addEventListener("click", () => {
      const st = this.getActiveStreamer();
      window.open(st.url, "_blank", "noopener");
    });

    // Add Streamer UI
    const addForm = document.getElementById("twitchAddForm");
    const btnShowAdd = document.getElementById("btnShowAddStreamer");
    const btnSubmit = document.getElementById("btnAddStreamerSubmit");
    const inputNew = document.getElementById("inputNewStreamer");

    btnShowAdd?.addEventListener("click", () => {
      if (!addForm) return;
      const isHidden = addForm.hidden;
      addForm.hidden = !isHidden;
      if (!addForm.hidden) {
        inputNew?.focus();
        btnShowAdd.classList.add("is-active");
      } else {
        btnShowAdd.classList.remove("is-active");
      }
      SoundEngine.sliderStep();
    });

    const handleAdd = () => {
      const val = inputNew?.value;
      if (!val) return;
      const res = this.addStreamer(val);
      if (res.success) {
        inputNew.value = "";
        addForm.hidden = true;
        btnShowAdd?.classList.remove("is-active");
        SoundEngine.chime();
        this.toast("Канал добавлен", `Стример ${res.streamer.name} успешно добавлен в список`, null);
      } else {
        SoundEngine.error();
        this.toast("Ошибка", res.error, null);
      }
    };

    btnSubmit?.addEventListener("click", handleAdd);
    inputNew?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleAdd();
    });

    // Reset Defaults Button
    document.getElementById("btnResetDefaultStreamers")?.addEventListener("click", () => {
      SoundEngine.confirm();
      this.resetDefaults();
      this.toast("Twitch Hub", "Список каналов сброшен к исходным 6 стримерам", null);
    });

    // Share / Copy Link
    document.getElementById("btnCopyStreamLink")?.addEventListener("click", () => {
      const st = this.getActiveStreamer();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(st.url);
      }
      SoundEngine.confirm();
      this.toast("Ссылка скопирована", st.url, null);
    });

    // Reload Player
    document.getElementById("btnReloadPlayer")?.addEventListener("click", () => {
      SoundEngine.focusMove();
      this.renderPlayerIframe();
      if (this.isChatOpen) this.renderChatIframe();
    });

    // PiP Widget Controls
    document.getElementById("btnTwitchPipExpand")?.addEventListener("click", () => this.expandPip());
    document.getElementById("btnTwitchPipClose")?.addEventListener("click", () => {
      SoundEngine.closeDialog();
      this.closePip(true);
    });
  }
}

export const twitchService = new TwitchBroadcastService();

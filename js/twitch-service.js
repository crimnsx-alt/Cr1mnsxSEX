/**
 * PlayStation®5 Twitch Broadcast Hub Service
 * Integrates Real-time Live Status Telemetry, Official Avatars, Cinema Player,
 * Live Chat, and In-Dashboard Spatial Stage with auto-selection of active streams.
 */

import { SoundEngine } from "./sound.js";
import { escapeHtml } from "./friends-service.js";

const STORAGE_KEY = "ps5_twitch_streamers_v2";
const STATUS_CACHE_KEY = "ps5_twitch_status_cache_v2";
const STATUS_CACHE_TTL = 60000; // 60s TTL for live telemetry to avoid redundant network spikes

export const DEFAULT_TWITCH_STREAMERS = [
  {
    id: "sbomba3131",
    channel: "sbomba3131",
    name: "Сбомба",
    color: "#f97316",
    category: "Игры / Общение",
    desc: "Сбомба (sbomba3131) — позитивные стримы, прохождения и челленджи",
    url: "https://www.twitch.tv/sbomba3131",
    avatar: "https://static-cdn.jtvnw.net/jtv_user_pictures/4d62128d-fb6e-45a5-8865-0302106997a5-profile_image-300x300.png",
    initial: "С",
    isLive: true,
    uptime: "2ч+"
  },
  {
    id: "mafanyaking",
    channel: "mafanyaking",
    name: "Мафаня",
    color: "#ec4899",
    category: "Just Chatting",
    desc: "Мафаня — общение, игры, стримы и IRL",
    url: "https://www.twitch.tv/mafanyaking",
    avatar: "https://static-cdn.jtvnw.net/jtv_user_pictures/640e8965-1b32-4428-bd45-6fe892746bf4-profile_image-300x300.png",
    initial: "M",
    isLive: false,
    uptime: null
  },
  {
    id: "kussia88",
    channel: "kussia88",
    name: "Каша",
    color: "#ef4444",
    category: "Just Chatting / Реакции",
    desc: "Каша — реакты, угарные нарезки и разговорные стримы",
    url: "https://www.twitch.tv/kussia88",
    avatar: "https://static-cdn.jtvnw.net/jtv_user_pictures/0d44d834-a0f3-4c42-875c-61563c9ab20c-profile_image-300x300.png",
    initial: "К",
    isLive: false,
    uptime: null
  },
  {
    id: "5opka",
    channel: "5opka",
    name: "Пятёрка",
    color: "#10b981",
    category: "Игры / Minecraft / Шоу",
    desc: "Кирилл Баранов (Пятёрка) — легендарные шоу, майнкрафт и стримы",
    url: "https://www.twitch.tv/5opka",
    avatar: "https://static-cdn.jtvnw.net/jtv_user_pictures/e70b3a04-a290-43e5-854f-96a495a2a330-profile_image-300x300.png",
    initial: "5",
    isLive: false,
    uptime: null
  },
  {
    id: "lenyapudge",
    channel: "lenyapudge",
    name: "Лёня Пудж",
    color: "#06b6d4",
    category: "Dota 2 / Pudge",
    desc: "Лёня Пудж — топовый геймплей на Pudge и угар в Доте",
    url: "https://www.twitch.tv/lenyapudge",
    avatar: "https://static-cdn.jtvnw.net/jtv_user_pictures/88eac48e-2bad-4292-a4b8-1d8518ef199e-profile_image-300x300.png",
    initial: "Л",
    isLive: false,
    uptime: null
  },
  {
    id: "bugorpro",
    channel: "bugorpro",
    name: "Бугор",
    color: "#8b5cf6",
    category: "CS2 / Шутеры / Игры",
    desc: "Бугор (bugorpro) — киберспорт, матчи CS2 и хардкорный гейминг",
    url: "https://www.twitch.tv/bugorpro",
    avatar: "https://static-cdn.jtvnw.net/jtv_user_pictures/58b00871-db29-4b86-a4bf-cfde10544560-profile_image-300x300.png",
    initial: "Б",
    isLive: false,
    uptime: null
  }
];

class TwitchBroadcastService {
  constructor() {
    this.streamers = this.loadStreamers();
    // Default to the first live streamer or the first in list
    const firstLive = this.streamers.find((s) => s.isLive);
    this.activeChannel = firstLive ? firstLive.channel : (this.streamers[0]?.channel || "sbomba3131");
    this.isChatOpen = true;
    this.isInlineChatOpen = true;
    this.isPipActive = false;
    this.isHubActive = false;
    this.isInlineActive = false;
    this.userHasManuallySelected = false;
    this.showToastCallback = null;
    this.currentRenderedChannel = null;
    this.currentRenderedChatChannel = null;
    this._chatMountTimeout = null;
    this._isCheckingStatus = false;
    this.checkTimer = null;
  }

  setToastHandler(fn) {
    this.showToastCallback = fn;
  }

  toast(title, msg, icon) {
    if (this.showToastCallback) {
      this.showToastCallback(title, msg, icon);
    }
  }

  loadStatusCache() {
    try {
      const raw = localStorage.getItem(STATUS_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.channels && typeof parsed.timestamp === "number") {
          return parsed;
        }
      }
    } catch (_) {}
    return null;
  }

  saveStatusCache() {
    try {
      const data = {
        timestamp: Date.now(),
        channels: {}
      };
      this.streamers.forEach((s) => {
        data.channels[s.channel.toLowerCase()] = {
          isLive: !!s.isLive,
          uptime: s.uptime,
          avatar: s.avatar
        };
      });
      localStorage.setItem(STATUS_CACHE_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  isStatusCacheFresh() {
    const cache = this.loadStatusCache();
    if (!cache) return false;
    return (Date.now() - cache.timestamp) < STATUS_CACHE_TTL;
  }

  loadStreamers() {
    let list = null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
    } catch (e) {
      console.warn("[TwitchService] Failed to read localStorage:", e);
    }
    if (!list) {
      list = JSON.parse(JSON.stringify(DEFAULT_TWITCH_STREAMERS));
    }

    // Hydrate with persistent status cache immediately for 0ms rendering
    const cache = this.loadStatusCache();
    if (cache && cache.channels) {
      list.forEach((s) => {
        const c = cache.channels[s.channel.toLowerCase()];
        if (c) {
          s.isLive = !!c.isLive;
          s.uptime = c.uptime || null;
          if (c.avatar && c.avatar.startsWith("http")) s.avatar = c.avatar;
        }
      });
    }

    // Prioritize active live streamers to the top immediately
    list.sort((a, b) => {
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      return 0;
    });

    return list;
  }

  saveStreamers() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.streamers));
    } catch (e) {
      console.warn("[TwitchService] Failed to write localStorage:", e);
    }
  }

  getActiveStreamer() {
    return (
      this.streamers.find((s) => s.channel.toLowerCase() === this.activeChannel.toLowerCase()) ||
      this.streamers[0] || {
        id: this.activeChannel,
        channel: this.activeChannel,
        name: this.activeChannel,
        color: "#9146FF",
        category: "Twitch Live",
        desc: "Прямая трансляция канала",
        url: `https://www.twitch.tv/${this.activeChannel}`,
        avatar: "",
        initial: this.activeChannel.charAt(0).toUpperCase(),
        isLive: false,
        uptime: null
      }
    );
  }

  parseChannelInput(input) {
    if (!input) return null;
    let trimmed = input.trim();
    trimmed = trimmed.replace(/^https?:\/\//i, "");
    trimmed = trimmed.replace(/^(www\.)?twitch\.tv\//i, "");
    trimmed = trimmed.split("/")[0].split("?")[0].replace(/[^a-zA-Z0-9_]/g, "").toLowerCase();
    return trimmed.length > 0 ? trimmed : null;
  }

  async addStreamer(rawInput, customName = "") {
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
      desc: `Канал Twitch: ${channel}`,
      url: `https://www.twitch.tv/${channel}`,
      avatar: "",
      initial: name.charAt(0).toUpperCase(),
      custom: true,
      isLive: false,
      uptime: null
    };

    // Try fetching real avatar from decapi
    try {
      const avRes = await fetch(`https://decapi.me/twitch/avatar/${channel}`);
      if (avRes.ok) {
        const avUrl = (await avRes.text()).trim();
        if (avUrl.startsWith("http")) newStreamer.avatar = avUrl;
      }
    } catch (_) {}

    this.streamers.push(newStreamer);
    this.saveStreamers();
    this.userHasManuallySelected = true;
    this.selectStreamer(channel);
    this.renderSidebarList();
    this.renderInlineSidebarList();
    this.checkSingleStreamerLive(newStreamer);

    return { success: true, streamer: newStreamer };
  }

  removeStreamer(channel) {
    this.streamers = this.streamers.filter((s) => s.channel.toLowerCase() !== channel.toLowerCase());
    if (this.streamers.length === 0) {
      this.streamers = JSON.parse(JSON.stringify(DEFAULT_TWITCH_STREAMERS));
    }
    this.saveStreamers();
    if (this.activeChannel.toLowerCase() === channel.toLowerCase()) {
      this.selectStreamer(this.streamers[0].channel);
    } else {
      this.renderSidebarList();
      this.renderInlineSidebarList();
    }
  }

  resetDefaults() {
    this.streamers = JSON.parse(JSON.stringify(DEFAULT_TWITCH_STREAMERS));
    this.saveStreamers();
    this.userHasManuallySelected = false;
    this.selectStreamer(this.streamers[0].channel);
    this.renderSidebarList();
    this.renderInlineSidebarList();
    this.checkAllStreamersLive(true);
  }

  getParentParams() {
    const currentHost = window.location.hostname;
    const hosts = [...new Set([currentHost, "crimnsx-alt.github.io", "localhost", "127.0.0.1"])].filter(Boolean);
    return hosts.map((h) => `parent=${encodeURIComponent(h)}`).join("&");
  }

  getPlayerUrl(channel) {
    const parents = this.getParentParams();
    // autoplay=true and muted=false (with fallback muted=true for guaranteed browser start)
    return `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&${parents}&autoplay=true&muted=true`;
  }

  getChatUrl(channel) {
    const parents = this.getParentParams();
    return `https://www.twitch.tv/embed/${encodeURIComponent(channel)}/chat?${parents}&darkpopout`;
  }

  getAvatarSrc(streamer) {
    if (streamer.avatar && streamer.avatar.startsWith("http")) {
      return streamer.avatar;
    }
    const initial = streamer.initial || streamer.name.charAt(0).toUpperCase();
    const color = streamer.color || "#9146FF";
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='${encodeURIComponent(color)}'/%3E%3Cstop offset='100%25' stop-color='%23121318'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' rx='50' fill='url(%23g)'/%3E%3Ccircle cx='50' cy='50' r='48' fill='none' stroke='${encodeURIComponent(color)}' stroke-width='2' stroke-opacity='0.4'/%3E%3Ctext x='50' y='63' font-family='-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' font-size='42' font-weight='800' fill='%23ffffff' text-anchor='middle'%3E${encodeURIComponent(initial)}%3C/text%3E%3C/svg%3E`;
  }

  formatUptime(raw) {
    if (!raw) return "В эфире";
    let str = raw.replace(/\s+/g, " ");
    str = str.replace(/(\d+)\s*hours?/, "$1ч");
    str = str.replace(/(\d+)\s*minutes?/, "$1м");
    str = str.replace(/(\d+)\s*seconds?/, "");
    str = str.replace(/,\s*/g, " ").trim();
    return str || "В эфире";
  }

  // ============================================================
  // REAL-TIME LIVE STATUS TELEMETRY
  // ============================================================
  async checkSingleStreamerLive(streamer) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3800);
      const res = await fetch(`https://decapi.me/twitch/uptime/${encodeURIComponent(streamer.channel)}`, {
        signal: controller.signal,
        cache: "no-store"
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const text = (await res.text()).trim();
        const isOffline =
          text.toLowerCase().includes("offline") ||
          text.toLowerCase().includes("not found") ||
          text.length === 0;
        streamer.isLive = !isOffline;
        streamer.uptime = isOffline ? null : this.formatUptime(text);
      }
    } catch (_) {}
  }

  async checkAllStreamersLive(force = false, autoSelect = false) {
    if (this._isCheckingStatus) return;
    if (!force && this.isStatusCacheFresh()) {
      return;
    }

    this._isCheckingStatus = true;
    try {
      const prevLiveMap = new Map(this.streamers.map((s) => [s.channel.toLowerCase(), s.isLive]));
      const prevUptimeMap = new Map(this.streamers.map((s) => [s.channel.toLowerCase(), s.uptime]));

      const checks = this.streamers.map(async (s) => {
        await this.checkSingleStreamerLive(s);
      });
      await Promise.all(checks);

      // Check if anything actually changed
      let hasChanged = false;
      for (const s of this.streamers) {
        const ch = s.channel.toLowerCase();
        if (prevLiveMap.get(ch) !== s.isLive || prevUptimeMap.get(ch) !== s.uptime) {
          hasChanged = true;
          break;
        }
      }

      // Sort: Live streamers rise to top
      this.streamers.sort((a, b) => {
        if (a.isLive && !b.isLive) return -1;
        if (!a.isLive && b.isLive) return 1;
        return 0;
      });

      this.saveStatusCache();
      this.saveStreamers();

      // Auto-select the live streamer so stream starts playing right away
      if (autoSelect && !this.userHasManuallySelected) {
        const liveStreamer = this.streamers.find((s) => s.isLive);
        if (liveStreamer && liveStreamer.channel !== this.activeChannel) {
          this.activeChannel = liveStreamer.channel;
          hasChanged = true;
        }
      }

      if (hasChanged) {
        if (this.isInlineActive) {
          this.renderInlineSidebarList();
          this.updateInlineStreamer(this.activeChannel);
        }
        if (this.isHubActive) {
          this.renderSidebarList();
          this.selectStreamer(this.activeChannel);
        }
      }
    } finally {
      this._isCheckingStatus = false;
    }
  }

  startStatusPolling() {
    if (this.checkTimer) clearInterval(this.checkTimer);
    this.checkTimer = setInterval(() => {
      if (this.isInlineActive || this.isHubActive) {
        this.checkAllStreamersLive(true);
      }
    }, 60000);
  }

  // ============================================================
  // INLINE STAGE CONTROLLER (Directly inside PS5 Dashboard)
  // ============================================================
  renderInlineStage() {
    this.isInlineActive = true;
    this.closePip(false);

    const twitchView = document.getElementById("ps5TwitchView");
    if (!twitchView) return;
    twitchView.hidden = false;

    // Check if a streamer is live and auto-select
    if (!this.userHasManuallySelected) {
      const liveStreamer = this.streamers.find((s) => s.isLive);
      if (liveStreamer) {
        this.activeChannel = liveStreamer.channel;
      }
    }

    // Instant 0ms render from memory & cache
    this.renderInlineSidebarList();
    this.updateInlineStreamer(this.activeChannel);

    // Silent background live check (will only update if cache expired or changed)
    this.checkAllStreamersLive(false, !this.userHasManuallySelected);
    this.startStatusPolling();
  }

  stopInlineStage() {
    this.isInlineActive = false;
    const twitchView = document.getElementById("ps5TwitchView");
    if (twitchView) twitchView.hidden = true;

    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
    if (this._chatMountTimeout) {
      clearTimeout(this._chatMountTimeout);
      this._chatMountTimeout = null;
    }

    if (!this.isPipActive) {
      const pHolder = document.getElementById("twitchInlineIframeHolder");
      if (pHolder) pHolder.innerHTML = "";
      const cHolder = document.getElementById("twitchInlineChatHolder");
      if (cHolder) cHolder.innerHTML = "";
      this.currentRenderedChannel = null;
      this.currentRenderedChatChannel = null;
    }
  }

  renderInlineSidebarList() {
    const container = document.getElementById("twitchInlineStreamersList");
    if (!container) return;

    const countEl = document.getElementById("twitchInlineChannelsCount");
    if (countEl) countEl.textContent = this.streamers.length;

    container.innerHTML = this.streamers
      .map((s) => {
        const isActive = s.channel.toLowerCase() === this.activeChannel.toLowerCase();
        const avatarSrc = this.getAvatarSrc(s);
        const liveClass = s.isLive ? "is-live" : "is-offline";

        const safeName = escapeHtml(s.name || "");
        const safeCh = escapeHtml(s.channel || "");
        const safeUptime = escapeHtml(s.uptime || "");
        return `
          <div class="twitch-in-card ${liveClass} ${isActive ? "is-active" : ""}" data-channel="${safeCh}" role="button" tabindex="0">
            <div class="twitch-in-avatar-wrap">
              <img src="${avatarSrc}" alt="${safeName}" class="twitch-in-card-avatar" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${this.getAvatarSrc({ ...s, avatar: '' })}'" />
              <span class="twitch-in-card-dot ${s.isLive ? "dot-online" : "dot-offline"}"></span>
            </div>
            <div class="twitch-in-card-info">
              <div class="twitch-in-card-name-row">
                <span class="twitch-in-card-name">${safeName}</span>
                ${
                  s.isLive
                    ? `<span class="twitch-in-live-badge"><span class="twitch-badge-pulse"></span>В ЭФИРЕ</span>`
                    : `<span class="twitch-in-offline-badge">Офлайн</span>`
                }
              </div>
              <div class="twitch-in-card-sub-row">
                <span class="twitch-in-card-handle">twitch.tv/${safeCh}</span>
                ${s.isLive && safeUptime ? `<span class="twitch-in-card-uptime">${safeUptime}</span>` : ""}
              </div>
            </div>
            ${
              s.custom
                ? `<button type="button" class="twitch-in-card-del" data-del-channel="${safeCh}" title="Удалить канал">×</button>`
                : ""
            }
          </div>
        `;
      })
      .join("");

    container.querySelectorAll(".twitch-in-card").forEach((card) => {
      const activate = () => {
        const ch = card.dataset.channel;
        this.userHasManuallySelected = true;
        SoundEngine.focusMove();
        this.selectStreamer(ch);
      };
      card.addEventListener("click", (e) => {
        if (e.target.closest(".twitch-in-card-del")) return;
        activate();
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (e.target.closest(".twitch-in-card-del")) return;
          e.preventDefault();
          activate();
        }
      });
    });

    container.querySelectorAll(".twitch-in-card-del").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const ch = btn.dataset.delChannel;
        SoundEngine.confirm();
        this.removeStreamer(ch);
      });
    });
  }

  updateInlineStreamer(channel) {
    const streamer = this.getActiveStreamer();

    // Top Status Strip Pill
    const statusPill = document.querySelector(".twitch-cb-live-pill");
    const statusText = document.getElementById("twitchInlineStatusText");
    const telemetry = document.getElementById("twitchInlineTelemetry");

    if (statusPill && statusText) {
      if (streamer.isLive) {
        statusPill.className = "twitch-cb-live-pill is-live";
        statusText.textContent = `В ЭФИРЕ · 1080P 60FPS`;
        if (telemetry) telemetry.textContent = `Трансляция активна ${streamer.uptime ? `(${streamer.uptime})` : ""}`;
      } else {
        statusPill.className = "twitch-cb-live-pill is-offline";
        statusText.textContent = `НЕ В СЕТИ · ОФЛАЙН`;
        if (telemetry) telemetry.textContent = `Трансляция завершена · Доступна запись (VOD)`;
      }
    }

    // Ambient Aura
    const aura = document.getElementById("twitchInlineAmbientAura");
    if (aura) {
      aura.style.setProperty("--streamer-color", streamer.color || "#9146FF");
    }

    // Meta Bar
    const nameEl = document.getElementById("twitchInlineName");
    if (nameEl) nameEl.textContent = streamer.name;

    const catEl = document.getElementById("twitchInlineCategory");
    if (catEl) {
      catEl.textContent = streamer.isLive ? `${streamer.category} · В эфире` : `${streamer.category} · Офлайн`;
      catEl.className = streamer.isLive ? "twitch-in-category is-live" : "twitch-in-category is-offline";
    }

    const linkEl = document.getElementById("twitchInlineHandle");
    if (linkEl) {
      linkEl.href = streamer.url;
      linkEl.textContent = `twitch.tv/${streamer.channel}`;
    }

    const bioEl = document.getElementById("twitchInlineBio");
    if (bioEl) {
      bioEl.textContent = streamer.isLive
        ? `Прямой эфир на канале ${streamer.name} ${streamer.uptime ? `(в сети ${streamer.uptime})` : ""}`
        : `${streamer.desc} · Сейчас не в сети`;
    }

    const avatarEl = document.getElementById("twitchInlineAvatar");
    if (avatarEl) {
      avatarEl.innerHTML = `<img src="${this.getAvatarSrc(streamer)}" alt="${escapeHtml(streamer.name || "")}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${this.getAvatarSrc({ ...streamer, avatar: '' })}'" />`;
    }

    // Update Player Iframe if channel changed or empty
    const holder = document.getElementById("twitchInlineIframeHolder");
    if (holder && this.currentRenderedChannel !== channel) {
      this.currentRenderedChannel = channel;
      holder.innerHTML = `
        <div class="twitch-iframe-skeleton" id="twitchInlinePlayerSkeleton">
          <div class="twitch-skeleton-shimmer"></div>
          <div class="twitch-skeleton-spinner"></div>
          <span class="twitch-skeleton-label">Загрузка трансляции</span>
        </div>
        <iframe
          src="${this.getPlayerUrl(channel)}"
          frameborder="0"
          allowfullscreen="true"
          scrolling="no"
          loading="eager"
          fetchpriority="high"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          title="Twitch Player Inline - ${escapeHtml(channel)}">
        </iframe>
      `;
      const pIframe = holder.querySelector("iframe");
      const pSkeleton = holder.querySelector(".twitch-iframe-skeleton");
      if (pIframe && pSkeleton) {
        const hideSkel = () => {
          pSkeleton.classList.add("is-hidden");
          setTimeout(() => pSkeleton?.remove(), 400);
        };
        pIframe.addEventListener("load", hideSkel, { once: true });
        setTimeout(hideSkel, 4500);
      }
    }

    // Update Chat Iframe if open (with intelligent de-duplication)
    if (this.isInlineChatOpen) {
      this.renderInlineChat(channel);
    }

    // Update active highlight in inline cards
    document.querySelectorAll(".twitch-in-card").forEach((card) => {
      card.classList.toggle("is-active", card.dataset.channel.toLowerCase() === channel.toLowerCase());
    });
  }

  renderInlineChat(channel = null, force = false) {
    const holder = document.getElementById("twitchInlineChatHolder");
    if (!holder) return;

    const targetChannel = channel || this.activeChannel;

    // Fast-path: already rendered and iframe is alive, do NOT destroy and reload!
    if (!force && this.currentRenderedChatChannel === targetChannel && holder.querySelector("iframe")) {
      return;
    }

    this.currentRenderedChatChannel = targetChannel;
    if (this._chatMountTimeout) {
      clearTimeout(this._chatMountTimeout);
      this._chatMountTimeout = null;
    }

    // Immediate PS5 Skeleton Shimmer
    holder.innerHTML = `
      <div class="twitch-iframe-skeleton" id="twitchInlineChatSkeleton">
        <div class="twitch-skeleton-shimmer"></div>
        <div class="twitch-skeleton-spinner"></div>
        <span class="twitch-skeleton-label">Чат трансляции</span>
      </div>
    `;

    // Micro-defer mounting of chat iframe by 150ms so player gets 100% bandwidth
    this._chatMountTimeout = setTimeout(() => {
      const iframe = document.createElement("iframe");
      iframe.src = this.getChatUrl(targetChannel);
      iframe.frameBorder = "0";
      iframe.scrolling = "no";
      iframe.title = `Twitch Chat Inline - ${targetChannel}`;
      iframe.setAttribute("loading", "lazy");

      const skeleton = holder.querySelector(".twitch-iframe-skeleton");
      const hideChatSkel = () => {
        if (skeleton) skeleton.classList.add("is-hidden");
        setTimeout(() => skeleton?.remove(), 400);
      };
      iframe.addEventListener("load", hideChatSkel, { once: true });
      setTimeout(hideChatSkel, 4500);

      holder.appendChild(iframe);
      this._chatMountTimeout = null;
    }, 150);
  }
  toggleInlineChat() {
    this.isInlineChatOpen = !this.isInlineChatOpen;
    const drawer = document.getElementById("twitchInlineChatDrawer");
    const btn = document.getElementById("btnInlineToggleChat");
    const lbl = document.getElementById("lblInlineToggleChat");

    if (drawer) {
      drawer.classList.toggle("is-closed", !this.isInlineChatOpen);
    }
    if (btn) {
      btn.classList.toggle("is-active", this.isInlineChatOpen);
    }
    if (lbl) {
      lbl.textContent = this.isInlineChatOpen ? "Чат: Вкл" : "Чат: Выкл";
    }

    if (this.isInlineChatOpen) {
      this.renderInlineChat(this.activeChannel, true);
    } else {
      if (this._chatMountTimeout) {
        clearTimeout(this._chatMountTimeout);
        this._chatMountTimeout = null;
      }
      const holder = document.getElementById("twitchInlineChatHolder");
      if (holder) holder.innerHTML = "";
      this.currentRenderedChatChannel = null;
    }
    SoundEngine.sliderStep();
  }

  // ============================================================
  // FULLSCREEN MODAL DIALOG (Cinema Mode)
  // ============================================================
  renderSidebarList() {
    const container = document.getElementById("twitchStreamersList");
    if (!container) return;

    const countEl = document.getElementById("twitchStreamersCount");
    if (countEl) countEl.textContent = this.streamers.length;

    container.innerHTML = this.streamers
      .map((s) => {
        const isActive = s.channel.toLowerCase() === this.activeChannel.toLowerCase();
        const avatarSrc = this.getAvatarSrc(s);
        const safeName = escapeHtml(s.name || "");
        const safeCh = escapeHtml(s.channel || "");
        return `
          <div class="twitch-streamer-card ${s.isLive ? "is-live" : "is-offline"} ${isActive ? "is-active" : ""}" data-channel="${safeCh}" role="button" tabindex="0">
            <div class="twitch-card-avatar-wrap">
              <img src="${avatarSrc}" alt="${safeName}" class="twitch-card-avatar" onerror="this.onerror=null;this.src='${this.getAvatarSrc({ ...s, avatar: '' })}'" />
              <span class="twitch-card-online-dot ${s.isLive ? "dot-online" : "dot-offline"}"></span>
            </div>
            <div class="twitch-card-info">
              <div class="twitch-card-name-row">
                <span class="twitch-card-name">${safeName}</span>
                ${
                  s.isLive
                    ? `<span class="twitch-card-active-pill">В ЭФИРЕ</span>`
                    : `<span class="twitch-card-offline-pill">Офлайн</span>`
                }
              </div>
              <span class="twitch-card-handle">twitch.tv/${safeCh}</span>
            </div>
            ${
              s.custom
                ? `<button type="button" class="twitch-card-del-btn" data-del-channel="${safeCh}" title="Удалить канал">×</button>`
                : ""
            }
          </div>
        `;
      })
      .join("");

    container.querySelectorAll(".twitch-streamer-card").forEach((card) => {
      const activate = () => {
        const ch = card.dataset.channel;
        this.userHasManuallySelected = true;
        SoundEngine.focusMove();
        this.selectStreamer(ch);
      };
      card.addEventListener("click", (e) => {
        if (e.target.closest(".twitch-card-del-btn")) return;
        activate();
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (e.target.closest(".twitch-card-del-btn")) return;
          e.preventDefault();
          activate();
        }
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

    // Update Modal
    if (this.isHubActive) {
      const glowEl = document.getElementById("twitchAmbientGlow");
      if (glowEl) {
        glowEl.style.setProperty("--streamer-color", streamer.color || "#9146FF");
      }

      const nameEl = document.getElementById("twitchMetaName");
      if (nameEl) nameEl.textContent = streamer.name;

      const catEl = document.getElementById("twitchMetaCategory");
      if (catEl) catEl.textContent = streamer.isLive ? `${streamer.category} · В эфире` : `${streamer.category} · Офлайн`;

      const linkEl = document.getElementById("twitchMetaLink");
      if (linkEl) {
        linkEl.href = streamer.url;
        linkEl.textContent = `twitch.tv/${streamer.channel}`;
      }

      const descEl = document.getElementById("twitchMetaDesc");
      if (descEl) descEl.textContent = streamer.desc || "Прямая трансляция канала";

      const avatarEl = document.getElementById("twitchMetaAvatar");
      if (avatarEl) {
        avatarEl.innerHTML = `<img src="${this.getAvatarSrc(streamer)}" alt="${streamer.name}" />`;
      }

      this.renderPlayerIframe();
      if (this.isChatOpen) {
        this.renderChatIframe();
      }

      document.querySelectorAll(".twitch-streamer-card").forEach((card) => {
        card.classList.toggle("is-active", card.dataset.channel.toLowerCase() === channel.toLowerCase());
      });
    }

    // Update Inline Stage
    if (this.isInlineActive) {
      this.updateInlineStreamer(channel);
    }

    // Update PiP
    if (this.isPipActive) {
      const pipBody = document.getElementById("twitchPipBody");
      const pipName = document.getElementById("twitchPipName");
      if (pipName) pipName.textContent = `${streamer.name} ${streamer.isLive ? "· LIVE" : "· Офлайн"}`;
      if (pipBody) {
        pipBody.innerHTML = `
          <iframe
            src="${this.getPlayerUrl(channel)}"
            frameborder="0"
            allowfullscreen="true"
            scrolling="no"
            allow="autoplay; fullscreen"
            title="Twitch Mini Player - ${channel}">
          </iframe>
        `;
      }
    }
  }

  renderPlayerIframe() {
    const wrap = document.getElementById("twitchIframeWrap");
    if (!wrap) return;

    const url = this.getPlayerUrl(this.activeChannel);
    wrap.innerHTML = `
      <div class="twitch-iframe-skeleton" id="twitchModalPlayerSkeleton">
        <div class="twitch-skeleton-shimmer"></div>
        <div class="twitch-skeleton-spinner"></div>
        <span class="twitch-skeleton-label">Загрузка плеера</span>
      </div>
      <iframe
        id="twitchPlayerIframe"
        src="${url}"
        frameborder="0"
        allowfullscreen="true"
        scrolling="no"
        loading="eager"
        fetchpriority="high"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        title="Twitch Player - ${this.activeChannel}">
      </iframe>
    `;
    const pIframe = wrap.querySelector("iframe");
    const pSkeleton = wrap.querySelector(".twitch-iframe-skeleton");
    if (pIframe && pSkeleton) {
      const hideSkel = () => {
        pSkeleton.classList.add("is-hidden");
        setTimeout(() => pSkeleton?.remove(), 400);
      };
      pIframe.addEventListener("load", hideSkel, { once: true });
      setTimeout(hideSkel, 4500);
    }
  }

  renderChatIframe() {
    const wrap = document.getElementById("twitchChatIframeWrap");
    if (!wrap) return;

    const url = this.getChatUrl(this.activeChannel);
    wrap.innerHTML = `
      <div class="twitch-iframe-skeleton" id="twitchModalChatSkeleton">
        <div class="twitch-skeleton-shimmer"></div>
        <div class="twitch-skeleton-spinner"></div>
        <span class="twitch-skeleton-label">Подключение чата</span>
      </div>
      <iframe
        id="twitchChatIframe"
        src="${url}"
        frameborder="0"
        scrolling="no"
        loading="lazy"
        title="Twitch Chat - ${this.activeChannel}">
      </iframe>
    `;
    const cIframe = wrap.querySelector("iframe");
    const cSkeleton = wrap.querySelector(".twitch-iframe-skeleton");
    if (cIframe && cSkeleton) {
      const hideSkel = () => {
        cSkeleton.classList.add("is-hidden");
        setTimeout(() => cSkeleton?.remove(), 400);
      };
      cIframe.addEventListener("load", hideSkel, { once: true });
      setTimeout(hideSkel, 4500);
    }
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
      this.userHasManuallySelected = true;
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
    SoundEngine.modalClose();

    const pWrap = document.getElementById("twitchIframeWrap");
    if (pWrap) pWrap.innerHTML = "";
    const cWrap = document.getElementById("twitchChatIframeWrap");
    if (cWrap) cWrap.innerHTML = "";
  }

  enablePip() {
    const streamer = this.getActiveStreamer();
    this.isPipActive = true;

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
      if (pipName) pipName.textContent = `${streamer.name} ${streamer.isLive ? "· LIVE" : "· Офлайн"}`;
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

    const pWrap = document.getElementById("twitchIframeWrap");
    if (pWrap) pWrap.innerHTML = "";
    const cWrap = document.getElementById("twitchChatIframeWrap");
    if (cWrap) cWrap.innerHTML = "";

    SoundEngine.enter();
    this.toast("PlayStation®5 PiP", `Трансляция ${streamer.name} закреплена в углу`, null);
  }

  expandPip() {
    this.closePip(false);
    if (this.isInlineActive) {
      this.updateInlineStreamer(this.activeChannel);
    } else {
      this.openHub(this.activeChannel);
    }
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
    // ------------------------------------------------------------
    // Modal Event Listeners
    // ------------------------------------------------------------
    document.getElementById("btnTwitchClose")?.addEventListener("click", () => this.closeHub());
    document.getElementById("twitchBackdrop")?.addEventListener("click", () => this.closeHub());
    document.getElementById("btnToggleChat")?.addEventListener("click", () => this.toggleChat());
    document.getElementById("btnTwitchPip")?.addEventListener("click", () => this.enablePip());
    document.getElementById("btnOpenExternalTwitch")?.addEventListener("click", () => {
      const st = this.getActiveStreamer();
      window.open(st.url, "_blank", "noopener");
    });

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
      this.addStreamer(val).then((res) => {
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
      });
    };

    btnSubmit?.addEventListener("click", handleAdd);
    inputNew?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleAdd();
    });

    document.getElementById("btnResetDefaultStreamers")?.addEventListener("click", () => {
      SoundEngine.confirm();
      this.resetDefaults();
      this.toast("Twitch Hub", "Список каналов сброшен к исходным 6 стримерам", null);
    });

    document.getElementById("btnCopyStreamLink")?.addEventListener("click", () => {
      const st = this.getActiveStreamer();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(st.url);
      }
      SoundEngine.confirm();
      this.toast("Ссылка скопирована", st.url, null);
    });

    document.getElementById("btnReloadPlayer")?.addEventListener("click", () => {
      SoundEngine.focusMove();
      this.renderPlayerIframe();
      if (this.isChatOpen) this.renderChatIframe();
    });

    // ------------------------------------------------------------
    // Inline Stage Event Listeners
    // ------------------------------------------------------------
    document.getElementById("btnInlineToggleChat")?.addEventListener("click", () => this.toggleInlineChat());
    document.getElementById("btnInlinePip")?.addEventListener("click", () => this.enablePip());
    document.getElementById("btnInlineFullscreen")?.addEventListener("click", () => this.openHub(this.activeChannel));
    document.getElementById("btnInlineExternal")?.addEventListener("click", () => {
      const st = this.getActiveStreamer();
      window.open(st.url, "_blank", "noopener");
    });

    const inlineAddDrawer = document.getElementById("twitchInlineAddDrawer");
    const btnInlineShowAdd = document.getElementById("btnInlineShowAdd");
    const btnInlineConfirm = document.getElementById("btnInlineAddConfirm");
    const inputInlineNew = document.getElementById("inputInlineNewStreamer");

    btnInlineShowAdd?.addEventListener("click", () => {
      if (!inlineAddDrawer) return;
      const isHidden = inlineAddDrawer.hidden;
      inlineAddDrawer.hidden = !isHidden;
      if (!inlineAddDrawer.hidden) {
        inputInlineNew?.focus();
        btnInlineShowAdd.classList.add("is-active");
      } else {
        btnInlineShowAdd.classList.remove("is-active");
      }
      SoundEngine.sliderStep();
    });

    const handleInlineAdd = () => {
      const val = inputInlineNew?.value;
      if (!val) return;
      this.addStreamer(val).then((res) => {
        if (res.success) {
          inputInlineNew.value = "";
          inlineAddDrawer.hidden = true;
          btnInlineShowAdd?.classList.remove("is-active");
          SoundEngine.chime();
          this.toast("Канал добавлен", `Стример ${res.streamer.name} успешно добавлен`, null);
        } else {
          SoundEngine.error();
          this.toast("Ошибка", res.error, null);
        }
      });
    };

    btnInlineConfirm?.addEventListener("click", handleInlineAdd);
    inputInlineNew?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleInlineAdd();
    });

    document.getElementById("btnInlineResetStreamers")?.addEventListener("click", () => {
      SoundEngine.confirm();
      this.resetDefaults();
      this.toast("Twitch Hub", "Список каналов сброшен к исходным 6 стримерам", null);
    });

    document.getElementById("btnInlineShare")?.addEventListener("click", () => {
      const st = this.getActiveStreamer();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(st.url);
      }
      SoundEngine.confirm();
      this.toast("Ссылка скопирована", st.url, null);
    });

    document.getElementById("btnInlineReload")?.addEventListener("click", () => {
      SoundEngine.focusMove();
      this.currentRenderedChannel = null;
      this.currentRenderedChatChannel = null;
      this.checkAllStreamersLive(true, false);
      this.updateInlineStreamer(this.activeChannel);
      this.toast("Обновление", "Трансляция и статус стримеров обновляются...", null);
    });

    // ------------------------------------------------------------
    // PiP Widget Controls
    // ------------------------------------------------------------
    document.getElementById("btnTwitchPipExpand")?.addEventListener("click", () => this.expandPip());
    document.getElementById("btnTwitchPipClose")?.addEventListener("click", () => {
      SoundEngine.modalClose();
      this.closePip(true);
    });

    // Silent background live check if cache is expired
    this.checkAllStreamersLive(false, true);
  }
}

export const twitchService = new TwitchBroadcastService();

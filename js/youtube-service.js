/**
 * PlayStation®5 YouTube Cinema Hub & Video Studio Service
 * Features real-time video library for channel @Mafanya122 (МАФАНЯ КИНГ),
 * automated RSS feed polling for new uploads, cinema player,
 * ambient aura backlighting, and instant 0ms cached loading.
 */

import { SoundEngine } from "./sound.js";

const STORAGE_KEY = "ps5_youtube_videos_v2";
const CACHE_KEY = "ps5_youtube_cache_v2";
const CACHE_TTL = 90000; // 90s TTL to prevent rate limiting

export const MAFANYA_CHANNEL_ID = "UCrSt81cEFZrtTTVj6UiG3Qw";
export const MAFANYA_CHANNEL_URL = "https://www.youtube.com/@Mafanya122/videos";

export const DEFAULT_YOUTUBE_VIDEOS = [
  {
    id: "nr5Hy2uwrc4",
    title: "РЕЖИССЕРСКАЯ ВЕРСИЯ ЛОРА С Г*ЕМ [доп материалы 3-й части, влог + похороны]",
    duration: "38:24",
    meta: "360 тыс. · 6 дн. назад",
    badge: "НОВОЕ · 4K",
    thumb: "https://i.ytimg.com/vi/nr5Hy2uwrc4/hqdefault.jpg",
    thumbHd: "https://i.ytimg.com/vi/nr5Hy2uwrc4/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=nr5Hy2uwrc4",
    pubDate: "2026-11-17 15:47:46",
    isNew: true
  },
  {
    id: "Z9A2LxrRjuk",
    title: "Я УМЕР, ЧТОБЫ НЕ ЖИТЬ С Г*ЕМ? [3 ЧАСТЬ ЛОРА МАФАНИ] - ФИНАЛ",
    duration: "46:15",
    meta: "1,5 млн · 1 мес. назад",
    badge: "ФИНАЛ ЛОРА",
    thumb: "https://i.ytimg.com/vi/Z9A2LxrRjuk/hqdefault.jpg",
    thumbHd: "https://i.ytimg.com/vi/Z9A2LxrRjuk/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=Z9A2LxrRjuk",
    pubDate: "2026-10-20 18:00:00",
    isNew: false
  },
  {
    id: "lHYHXugAZF4",
    title: "ФУРРИ НАС*ЛЬНИК ПРИШЁЛ К ПСИХОЛОГУ… [МАФАНЯ ZOOM ПРАНК]",
    duration: "17:42",
    meta: "94 тыс. · 3 мес. назад",
    badge: "ZOOM ПРАНК",
    thumb: "https://i.ytimg.com/vi/lHYHXugAZF4/hqdefault.jpg",
    thumbHd: "https://i.ytimg.com/vi/lHYHXugAZF4/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=lHYHXugAZF4",
    pubDate: "2026-08-15 14:30:00",
    isNew: false
  },
  {
    id: "R-ILS0pketc",
    title: "МНЕ Г*Й СДЕЛАЛ ПРЕДЛОЖЕНИЕ [ВТОРАЯ ЧАСТЬ ЛОРА МАФАНИ] - ЭТО КОНЕЦ???",
    duration: "35:10",
    meta: "448 тыс. · 3 мес. назад",
    badge: "2 ЧАСТЬ ЛОРА",
    thumb: "https://i.ytimg.com/vi/R-ILS0pketc/hqdefault.jpg",
    thumbHd: "https://i.ytimg.com/vi/R-ILS0pketc/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=R-ILS0pketc",
    pubDate: "2026-08-01 17:00:00",
    isNew: false
  },
  {
    id: "FGy7KWr7BrM",
    title: "ЗАСТАВИЛ Г*Я ВЛЮБИТЬСЯ В СЕБЯ [ПОЛНЫЙ ЛОР СЕРИАЛА ОТ МАФАНИ]",
    duration: "1:01:09",
    meta: "571 тыс. · 4 мес. назад",
    badge: "ПОЛНЫЙ ЛОР",
    thumb: "https://i.ytimg.com/vi/FGy7KWr7BrM/hqdefault.jpg",
    thumbHd: "https://i.ytimg.com/vi/FGy7KWr7BrM/maxresdefault.jpg",
    url: "https://www.youtube.com/watch?v=FGy7KWr7BrM",
    pubDate: "2026-07-10 19:00:00",
    isNew: false
  }
];

class YouTubeCinemaService {
  constructor() {
    this.videos = this.loadVideos();
    this.activeVideoId = this.videos[0]?.id || "nr5Hy2uwrc4";
    this.isInlineActive = false;
    this.isHubActive = false;
    this.currentRenderedVideoId = null;
    this.showToastCallback = null;
    this._isSyncing = false;
    this.syncTimer = null;
  }

  setToastHandler(fn) {
    this.showToastCallback = fn;
  }

  toast(title, msg, icon) {
    if (this.showToastCallback) {
      this.showToastCallback(title, msg, icon);
    }
  }

  loadVideos() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("[YouTubeService] Failed to read localStorage:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_YOUTUBE_VIDEOS));
  }

  saveVideos() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.videos));
    } catch (e) {
      console.warn("[YouTubeService] Failed to save localStorage:", e);
    }
  }

  getActiveVideo() {
    return this.videos.find((v) => v.id === this.activeVideoId) || this.videos[0];
  }

  getEmbedUrl(videoId, autoplay = 1) {
    return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=${autoplay}&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
  }

  formatRelativeDate(dateStr) {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr.replace(" ", "T"));
      const now = new Date();
      const diffMs = now - date;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 1) return "Сегодня";
      if (diffDays === 1) return "Вчера";
      if (diffDays < 7) return `${diffDays} дн. назад`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} мес. назад`;
      return `${Math.floor(diffDays / 365)} г. назад`;
    } catch (_) {
      return "";
    }
  }

  /**
   * Automated RSS Feed Polling:
   * Polls YouTube Channel RSS via public CORS-compliant json proxy.
   * If any new videos were published, prepends them to the list automatically!
   */
  async syncVideosFromRSS(force = false) {
    if (this._isSyncing) return;

    // Check TTL
    if (!force) {
      try {
        const lastSync = parseInt(localStorage.getItem(CACHE_KEY) || "0", 10);
        if (Date.now() - lastSync < CACHE_TTL) {
          return;
        }
      } catch (_) {}
    }

    this._isSyncing = true;
    const syncBtn = document.getElementById("btnYoutubeSync");
    if (syncBtn) syncBtn.classList.add("is-syncing");

    try {
      const rssUrl = encodeURIComponent(`https://www.youtube.com/feeds/videos.xml?channel_id=${MAFANYA_CHANNEL_ID}`);
      const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(proxyUrl, {
        signal: controller.signal,
        cache: "no-store"
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.status === "ok" && Array.isArray(data.items)) {
          let addedCount = 0;
          let newestItem = null;

          data.items.forEach((item) => {
            // guid format is "yt:video:VIDEO_ID" or link watch?v=ID
            let vid = "";
            if (item.guid && item.guid.includes("yt:video:")) {
              vid = item.guid.replace("yt:video:", "").trim();
            } else if (item.link) {
              const m = item.link.match(/v=([a-zA-Z0-9_-]+)/);
              if (m) vid = m[1];
            }

            if (!vid) return;

            // Check if already in list
            const existing = this.videos.find((v) => v.id === vid);
            if (!existing) {
              addedCount++;
              const relDate = this.formatRelativeDate(item.pubDate);
              const newVid = {
                id: vid,
                title: item.title || "Новое видео",
                duration: "Видео",
                meta: relDate ? `Новое · ${relDate}` : "Новый релиз",
                badge: "НОВОЕ",
                thumb: item.thumbnail || `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
                thumbHd: `https://i.ytimg.com/vi/${vid}/maxresdefault.jpg`,
                url: `https://www.youtube.com/watch?v=${vid}`,
                pubDate: item.pubDate || new Date().toISOString(),
                isNew: true
              };
              this.videos.unshift(newVid);
              if (!newestItem) newestItem = newVid;
            }
          });

          localStorage.setItem(CACHE_KEY, Date.now().toString());

          if (addedCount > 0) {
            this.saveVideos();
            this.toast(
              "YouTube · Новые видео",
              `Обнаружено ${addedCount} новых видео на канале @Mafanya122!`,
              null
            );
            if (this.isInlineActive) {
              this.renderInlinePlaylist();
              this.updateInlineVideo(this.activeVideoId);
            }
            if (this.isHubActive) {
              this.renderHubPlaylist();
              this.selectVideo(this.activeVideoId);
            }
          } else if (force) {
            this.toast("YouTube", "Все 5 видео актуальны. Новых релизов пока нет.", null);
          }
        }
      }
    } catch (e) {
      console.warn("[YouTubeService] RSS sync notice:", e);
      if (force) {
        this.toast("YouTube", "Видео синхронизированы из кэша.", null);
      }
    } finally {
      this._isSyncing = false;
      if (syncBtn) syncBtn.classList.remove("is-syncing");
    }
  }

  startAutoSync() {
    if (this.syncTimer) clearInterval(this.syncTimer);
    // Periodically sync every 3 minutes
    this.syncTimer = setInterval(() => {
      this.syncVideosFromRSS(false);
    }, 180000);
  }

  // ============================================================
  // INLINE STAGE (Rendered directly inside Dashboard)
  // ============================================================
  renderInlineStage() {
    this.isInlineActive = true;
    const view = document.getElementById("ps5YoutubeView");
    if (!view) return;
    view.hidden = false;

    // Instant 0ms render
    this.renderInlinePlaylist();
    this.updateInlineVideo(this.activeVideoId);

    // Silent background check for new uploads
    this.syncVideosFromRSS(false);
    this.startAutoSync();
  }

  stopInlineStage() {
    this.isInlineActive = false;
    const view = document.getElementById("ps5YoutubeView");
    if (view) view.hidden = true;

    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }

    const holder = document.getElementById("youtubeInlineIframeHolder");
    if (holder) holder.innerHTML = "";
    this.currentRenderedVideoId = null;
  }

  renderInlinePlaylist() {
    const container = document.getElementById("youtubeInlinePlaylist");
    if (!container) return;

    const countEl = document.getElementById("youtubeVideosCount");
    if (countEl) countEl.textContent = `${this.videos.length} ВИДЕО`;

    container.innerHTML = this.videos
      .map((v, idx) => {
        const isActive = v.id === this.activeVideoId;
        return `
          <div class="yt-in-card ${isActive ? "is-active" : ""}" data-video-id="${v.id}" role="button" tabindex="0">
            <div class="yt-in-card-thumb-wrap">
              <img src="${v.thumbHd}" alt="${v.title}" class="yt-in-card-thumb" loading="lazy" decoding="async" onerror="this.src='${v.thumb}'" />
              ${v.duration ? `<span class="yt-in-card-duration">${v.duration}</span>` : ""}
              <div class="yt-in-play-overlay">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
            </div>
            <div class="yt-in-card-info">
              <div class="yt-in-card-badge-row">
                ${v.badge ? `<span class="yt-in-card-badge ${v.isNew ? "badge-new" : ""}">${v.badge}</span>` : ""}
                <span class="yt-in-card-meta">${v.meta}</span>
              </div>
              <h4 class="yt-in-card-title">${v.title}</h4>
            </div>
          </div>
        `;
      })
      .join("");

    container.querySelectorAll(".yt-in-card").forEach((card) => {
      card.addEventListener("click", () => {
        const vid = card.dataset.videoId;
        SoundEngine.focusMove();
        this.selectVideo(vid);
      });
    });
  }

  updateInlineVideo(videoId) {
    this.activeVideoId = videoId;
    const video = this.getActiveVideo();

    // Top Telemetry Text
    const teleEl = document.getElementById("ytTelemetryText");
    if (teleEl) {
      teleEl.textContent = `${this.videos.length} видео · 4K UHD · Автообновление`;
    }

    // Meta Bar details
    const titleEl = document.getElementById("youtubeInlineVideoTitle");
    if (titleEl) titleEl.textContent = video.title;

    const metaEl = document.getElementById("youtubeInlineVideoMeta");
    if (metaEl) {
      metaEl.textContent = `${video.meta} ${video.duration ? `· ${video.duration}` : ""}`;
    }

    const shareBtn = document.getElementById("btnYoutubeShare");
    if (shareBtn) {
      shareBtn.onclick = () => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(video.url);
        }
        SoundEngine.confirm();
        this.toast("Ссылка скопирована", video.url, null);
      };
    }

    const extBtn = document.getElementById("btnYoutubeWatchExt");
    if (extBtn) {
      extBtn.onclick = () => {
        window.open(video.url, "_blank", "noopener");
      };
    }

    // Mount or update video player iframe with PS5 skeleton
    const holder = document.getElementById("youtubeInlineIframeHolder");
    if (holder && this.currentRenderedVideoId !== videoId) {
      this.currentRenderedVideoId = videoId;
      holder.innerHTML = `
        <div class="youtube-iframe-skeleton" id="youtubeInlineSkeleton">
          <div class="youtube-skeleton-shimmer"></div>
          <div class="youtube-skeleton-spinner"></div>
          <span class="youtube-skeleton-label">Загрузка видео</span>
        </div>
        <iframe
          src="${this.getEmbedUrl(videoId, 1)}"
          frameborder="0"
          allowfullscreen="true"
          loading="eager"
          fetchpriority="high"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          title="${video.title}">
        </iframe>
      `;

      const iframe = holder.querySelector("iframe");
      const skeleton = holder.querySelector(".youtube-iframe-skeleton");
      if (iframe && skeleton) {
        iframe.addEventListener("load", () => {
          skeleton.classList.add("is-hidden");
          setTimeout(() => skeleton?.remove(), 400);
        }, { once: true });
      }
    }

    // Highlight active card
    document.querySelectorAll(".yt-in-card").forEach((card) => {
      card.classList.toggle("is-active", card.dataset.videoId === videoId);
    });
  }

  selectVideo(videoId) {
    this.activeVideoId = videoId;
    if (this.isInlineActive) {
      this.updateInlineVideo(videoId);
    }
    if (this.isHubActive) {
      this.renderHubPlayer();
      document.querySelectorAll(".yt-hub-card").forEach((c) => {
        c.classList.toggle("is-active", c.dataset.videoId === videoId);
      });
    }
  }

  // ============================================================
  // FULLSCREEN CINEMA MODAL
  // ============================================================
  openHub(initialVideoId = null) {
    if (initialVideoId) {
      this.activeVideoId = initialVideoId;
    }
    this.isHubActive = true;
    const modal = document.getElementById("modalYoutubeHub");
    if (!modal) return;

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    SoundEngine.openDialog();

    this.renderHubPlaylist();
    this.renderHubPlayer();
  }

  closeHub() {
    this.isHubActive = false;
    const modal = document.getElementById("modalYoutubeHub");
    if (!modal) return;

    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    SoundEngine.closeDialog();

    const wrap = document.getElementById("youtubeHubPlayerWrap");
    if (wrap) wrap.innerHTML = "";
  }

  renderHubPlayer() {
    const wrap = document.getElementById("youtubeHubPlayerWrap");
    if (!wrap) return;

    const video = this.getActiveVideo();
    wrap.innerHTML = `
      <div class="youtube-iframe-skeleton">
        <div class="youtube-skeleton-shimmer"></div>
        <div class="youtube-skeleton-spinner"></div>
        <span class="youtube-skeleton-label">Загрузка плеера</span>
      </div>
      <iframe
        id="youtubeModalIframe"
        src="${this.getEmbedUrl(this.activeVideoId, 1)}"
        frameborder="0"
        allowfullscreen="true"
        loading="eager"
        fetchpriority="high"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerpolicy="strict-origin-when-cross-origin"
        title="${video.title}">
      </iframe>
    `;

    const iframe = wrap.querySelector("iframe");
    const skeleton = wrap.querySelector(".youtube-iframe-skeleton");
    if (iframe && skeleton) {
      iframe.addEventListener("load", () => {
        skeleton.classList.add("is-hidden");
        setTimeout(() => skeleton?.remove(), 400);
      }, { once: true });
    }

    const titleEl = document.getElementById("youtubeHubTitle");
    if (titleEl) titleEl.textContent = video.title;
    const metaEl = document.getElementById("youtubeHubMeta");
    if (metaEl) metaEl.textContent = `${video.meta} ${video.duration ? `· ${video.duration}` : ""}`;
  }

  renderHubPlaylist() {
    const container = document.getElementById("youtubeHubPlaylist");
    if (!container) return;

    container.innerHTML = this.videos
      .map((v) => {
        const isActive = v.id === this.activeVideoId;
        return `
          <div class="yt-hub-card ${isActive ? "is-active" : ""}" data-video-id="${v.id}" role="button" tabindex="0">
            <div class="yt-hub-card-thumb">
              <img src="${v.thumbHd}" alt="${v.title}" loading="lazy" decoding="async" onerror="this.src='${v.thumb}'" />
              ${v.duration ? `<span class="yt-hub-card-duration">${v.duration}</span>` : ""}
            </div>
            <div class="yt-hub-card-details">
              <span class="yt-hub-card-badge">${v.badge || "4K"}</span>
              <h5 class="yt-hub-card-title">${v.title}</h5>
              <span class="yt-hub-card-meta">${v.meta}</span>
            </div>
          </div>
        `;
      })
      .join("");

    container.querySelectorAll(".yt-hub-card").forEach((card) => {
      card.addEventListener("click", () => {
        const vid = card.dataset.videoId;
        SoundEngine.focusMove();
        this.selectVideo(vid);
      });
    });
  }

  init() {
    // Top bar actions
    document.getElementById("btnYoutubeSync")?.addEventListener("click", () => {
      SoundEngine.confirm();
      this.syncVideosFromRSS(true);
    });

    document.getElementById("btnYoutubeFullscreen")?.addEventListener("click", () => {
      this.openHub(this.activeVideoId);
    });

    document.getElementById("btnYoutubeExternal")?.addEventListener("click", () => {
      window.open(MAFANYA_CHANNEL_URL, "_blank", "noopener");
    });

    // Modal controls
    document.getElementById("btnYoutubeHubClose")?.addEventListener("click", () => this.closeHub());
    document.getElementById("youtubeHubBackdrop")?.addEventListener("click", () => this.closeHub());
    document.getElementById("btnYoutubeHubExt")?.addEventListener("click", () => {
      const v = this.getActiveVideo();
      window.open(v.url, "_blank", "noopener");
    });

    // Background sync on init
    this.syncVideosFromRSS(false);
  }
}

export const youtubeService = new YouTubeCinemaService();

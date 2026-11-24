/**
 * PlayStation®5 YouTube Cinema Hub & Video Studio Service
 * Features real-time video library for channel @Mafanya122 (МАФАНЯ КИНГ),
 * automated RSS feed polling for new uploads, cinema player,
 * ambient aura backlighting, and instant 0ms cached loading.
 * Also powers "Влад клевые машины" Series Hub (16 streams, 3 seasons, cast, photos).
 */

import { SoundEngine } from "./sound.js";
import {
  VLAD_SERIES_INFO,
  VLAD_SEASONS,
  VLAD_CAST,
  VLAD_PHOTOS,
  OTHER_SERIES
} from "./vlad-series-data.js";

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
    this.currentMode = "cinema"; // "cinema" | "series"
    this.activeSeasonFilter = "all"; // "all" | "1" | "2" | "3"
    this.isTrailerOpen = false;
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

    if (!this._isInitialized) {
      this.init();
    }

    // Instant 0ms render
    this.renderInlinePlaylist();
    this.updateInlineVideo(this.activeVideoId);
    this.updateModeIndicator();

    // Silent background check for new uploads
    this.syncVideosFromRSS(false);
    this.startAutoSync();
  }

  stopInlineStage() {
    this.isInlineActive = false;
    this.closeTrailer(false);
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
          <div class="yt-in-card ${isActive ? "is-active" : ""}" data-video-id="${v.id}" role="button" tabindex="0" style="--stagger-index: ${idx};">
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
                ${isActive ? `<span class="ps5-soundwave-bars is-mini" aria-hidden="true"><span></span><span></span><span></span></span>` : ""}
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

    if (window.initSpotlightAndTilt) {
      window.initSpotlightAndTilt();
    }
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
  // SERIES HUB METHODS ("Влад клевые машины" from mafanya.sex)
  // ============================================================
  updateModeIndicator() {
    requestAnimationFrame(() => {
      const indicator = document.getElementById("ytModeIndicator");
      if (!indicator) return;
      const activeBtn = document.querySelector(".yt-mode-tab.is-active");
      if (!activeBtn) return;
      const left = activeBtn.offsetLeft;
      const width = activeBtn.offsetWidth;
      indicator.style.transform = `translateX(${left}px)`;
      indicator.style.width = `${width}px`;
    });
  }

  animateNumber(el, start, end, duration = 800, decimals = 0) {
    if (!el) return;
    const startTime = performance.now();
    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Apple fluid ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * ease;
      el.textContent = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toString();
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    requestAnimationFrame(update);
  }

  animateSeriesStats() {
    const countEl = document.getElementById("seriesPillCountNum");
    const ratingEl = document.getElementById("seriesPillRatingNum");
    const votesEl = document.getElementById("seriesPillVotesNum");
    if (countEl) this.animateNumber(countEl, 0, 16, 750, 0);
    if (ratingEl) this.animateNumber(ratingEl, 4.0, 9.6, 950, 1);
    if (votesEl) this.animateNumber(votesEl, 0, 289, 900, 0);
  }

  switchMode(mode) {
    this.currentMode = mode;
    SoundEngine.focusMove();

    const cinemaBtn = document.getElementById("btnYtModeCinema");
    const seriesBtn = document.getElementById("btnYtModeSeries");
    const cinemaLayout = document.getElementById("ps5YoutubeCinemaLayout");
    const seriesLayout = document.getElementById("ps5YoutubeSeriesLayout");

    if (mode === "cinema") {
      cinemaBtn?.classList.add("is-active");
      cinemaBtn?.setAttribute("aria-selected", "true");
      seriesBtn?.classList.remove("is-active");
      seriesBtn?.setAttribute("aria-selected", "false");

      if (cinemaLayout) cinemaLayout.hidden = false;
      if (seriesLayout) seriesLayout.hidden = true;

      const tele = document.getElementById("ytTelemetryText");
      if (tele) tele.textContent = `${this.videos.length} видео 4K UHD · + Сериал «Влад клёвые машины» (16 серий · 9.6★)`;
    } else {
      seriesBtn?.classList.add("is-active");
      seriesBtn?.setAttribute("aria-selected", "true");
      cinemaBtn?.classList.remove("is-active");
      cinemaBtn?.setAttribute("aria-selected", "false");

      if (cinemaLayout) cinemaLayout.hidden = true;
      if (seriesLayout) seriesLayout.hidden = false;

      const sc = document.getElementById("seriesScrollContainer");
      if (sc) sc.scrollTop = 0;

      const tele = document.getElementById("ytTelemetryText");
      if (tele) tele.textContent = "16 стримов · 3 сезона · Рейтинг 9.6★";

      this.renderSeriesView();
      this.animateSeriesStats();
    }

    this.updateModeIndicator();

    if (window.initSpotlightAndTilt) {
      window.initSpotlightAndTilt();
    }
  }

  renderSeriesView() {
    this.renderSeriesEpisodes();
    this.renderSeriesCast();
    this.renderSeriesPhotos();

    if (window.initSpotlightAndTilt) {
      window.initSpotlightAndTilt();
    }
  }

  renderSeriesEpisodes() {
    const grid = document.getElementById("seriesEpisodesGrid");
    if (!grid) return;

    let seasonsToRender = VLAD_SEASONS;
    if (this.activeSeasonFilter !== "all") {
      const sNum = parseInt(this.activeSeasonFilter, 10);
      seasonsToRender = VLAD_SEASONS.filter((s) => s.seasonNumber === sNum);
    }

    let allEps = [];
    seasonsToRender.forEach((s) => {
      s.episodes.forEach((ep) => {
        allEps.push({
          ...ep,
          seasonNumber: s.seasonNumber,
          recapYoutubeId: s.recapYoutubeId,
          recapTitle: s.recapTitle
        });
      });
    });

    grid.innerHTML = allEps
      .map((ep, idx) => {
        const badgeClass =
          ep.tier === "legendary"
            ? "badge-legendary"
            : ep.tier === "great"
            ? "badge-great"
            : "badge-good";
        return `
          <div class="series-ep-card ${ep.tier === 'legendary' ? 'is-legendary' : ''}" data-slug="${ep.slug}" style="--stagger-index: ${idx};">
            <div class="series-ep-top">
              <span class="series-ep-rating-badge ${badgeClass}">${ep.rating.toFixed(1)} ★ ${ep.tierLabel}</span>
              <span class="series-ep-season-badge">Сезон ${ep.seasonNumber} · Серия ${ep.number}</span>
            </div>
            <h4 class="series-ep-title">${ep.title}</h4>
            <div class="series-ep-meta-row">
              <span>⏱ ${ep.duration} мин</span>
              <span>👥 ${ep.votes} оценок</span>
            </div>
            <div class="series-ep-actions">
              <a href="${ep.vkUrl}" target="_blank" rel="noopener" class="series-ep-btn vk" title="Смотреть трансляцию на VK Видео">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12.785 17.75c-6.19 0-9.72-4.24-9.87-11.3h3.09c.1 5.18 2.39 7.38 4.2 7.83V6.45h2.91v4.47c1.78-.19 3.65-2.22 4.28-4.47h2.91c-.49 2.76-2.52 4.79-3.97 5.63 1.45.68 3.76 2.45 4.64 5.67h-3.21c-.69-2.16-2.42-3.83-4.7-3.95v3.95h-.24z"/></svg>
                <span>VK Видео</span>
              </a>
              <a href="${ep.tgUrl}" target="_blank" rel="noopener" class="series-ep-btn tg" title="Смотреть запись в Telegram">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
                <span>Telegram</span>
              </a>
            </div>
          </div>
        `;
      })
      .join("");

    if (window.initSpotlightAndTilt) {
      window.initSpotlightAndTilt();
    }
  }

  renderSeriesCast() {
    const container = document.getElementById("seriesCastList");
    if (!container) return;

    container.innerHTML = VLAD_CAST
      .map((c, idx) => {
        const linkAttr = c.link ? `href="${c.link}" target="_blank" rel="noopener"` : `role="article"`;
        const tag = c.link ? "a" : "div";
        return `
          <${tag} ${linkAttr} class="series-cast-card" title="${c.name} — ${c.role}" style="--stagger-index: ${idx};">
            <div class="series-cast-thumb-wrap">
              <img src="${c.photo}" alt="${c.name}" loading="lazy" decoding="async" />
            </div>
            <h5 class="series-cast-name">${c.name}</h5>
            <span class="series-cast-role">${c.role}</span>
          </${tag}>
        `;
      })
      .join("");
  }

  renderSeriesPhotos() {
    const row = document.getElementById("seriesPhotosRow");
    if (!row) return;

    row.innerHTML = VLAD_PHOTOS
      .map((p, idx) => `
        <div class="series-photo-card" role="button" tabindex="0" title="Кадр со съемок #${idx + 1}" style="--stagger-index: ${idx};">
          <img src="${p}" alt="Кадр со съемок #${idx + 1}" loading="lazy" decoding="async" />
        </div>
      `)
      .join("");

    row.querySelectorAll(".series-photo-card").forEach((card, idx) => {
      card.addEventListener("click", () => {
        SoundEngine.focusMove();
        window.open(VLAD_PHOTOS[idx], "_blank", "noopener");
      });
    });
  }

  openTrailer() {
    this.isTrailerOpen = true;
    const modal = document.getElementById("modalSeriesTrailer");
    const wrap = document.getElementById("seriesTrailerPlayerWrap");
    if (!modal || !wrap) return;

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    SoundEngine.openDialog();

    wrap.innerHTML = `
      <video
        src="${VLAD_SERIES_INFO.trailerUrl}"
        poster="${VLAD_SERIES_INFO.trailerPoster}"
        controls
        autoplay
        playsinline
        preload="auto"
        style="width: 100%; height: 100%; object-fit: contain; background: #000;">
      </video>
    `;
  }

  closeTrailer(withSound = true) {
    const wasOpen = this.isTrailerOpen;
    this.isTrailerOpen = false;
    const modal = document.getElementById("modalSeriesTrailer");
    const wrap = document.getElementById("seriesTrailerPlayerWrap");
    if (!modal) return;

    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    if (withSound && wasOpen) {
      SoundEngine.modalClose();
    }

    if (wrap) {
      const vid = wrap.querySelector("video");
      if (vid) {
        vid.pause();
        vid.src = "";
      }
      wrap.innerHTML = "";
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

  closeHub(withSound = true) {
    const wasActive = this.isHubActive;
    this.isHubActive = false;
    const modal = document.getElementById("modalYoutubeHub");
    if (!modal) return;

    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    if (withSound && wasActive) {
      SoundEngine.modalClose();
    }

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
    if (this._isInitialized) return;
    this._isInitialized = true;

    // Mode switcher
    document.getElementById("btnYtModeCinema")?.addEventListener("click", () => {
      this.switchMode("cinema");
    });
    document.getElementById("btnYtModeSeries")?.addEventListener("click", () => {
      this.switchMode("series");
    });
    this.updateModeIndicator();
    window.addEventListener("resize", () => this.updateModeIndicator(), { passive: true });

    // Direct Quick-Jump Triggers to "Влад клёвые машины" Series Hub
    const jumpToSeries = () => {
      SoundEngine.confirm();
      this.switchMode("series");
    };
    document.getElementById("btnDrawerSeriesSpotlight")?.addEventListener("click", jumpToSeries);
    document.getElementById("btnMetaGoSeries")?.addEventListener("click", jumpToSeries);
    document.getElementById("btnPlayerSeriesCue")?.addEventListener("click", jumpToSeries);

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

    // Modal controls (YouTube Hub)
    document.getElementById("btnYoutubeHubClose")?.addEventListener("click", () => this.closeHub());
    document.getElementById("youtubeHubBackdrop")?.addEventListener("click", () => this.closeHub());
    document.getElementById("btnYoutubeHubExt")?.addEventListener("click", () => {
      const v = this.getActiveVideo();
      window.open(v.url, "_blank", "noopener");
    });

    // Series Trailer Modal controls
    document.getElementById("btnPlaySeriesTrailer")?.addEventListener("click", () => {
      this.openTrailer();
    });
    document.querySelector(".series-poster-wrap")?.addEventListener("click", () => {
      this.openTrailer();
    });
    document.getElementById("btnSeriesTrailerClose")?.addEventListener("click", () => {
      this.closeTrailer();
    });
    document.getElementById("seriesTrailerBackdrop")?.addEventListener("click", () => {
      this.closeTrailer();
    });

    // Series Recap Launch Buttons
    document.getElementById("btnSeriesRecap1")?.addEventListener("click", () => {
      SoundEngine.confirm();
      this.switchMode("cinema");
      this.selectVideo("FGy7KWr7BrM");
    });
    document.getElementById("btnSeriesRecap2")?.addEventListener("click", () => {
      SoundEngine.confirm();
      this.switchMode("cinema");
      this.selectVideo("R-ILS0pketc");
    });
    document.getElementById("btnSeriesRecap3")?.addEventListener("click", () => {
      SoundEngine.confirm();
      this.switchMode("cinema");
      this.selectVideo("Z9A2LxrRjuk");
    });
    document.getElementById("btnTrailerWatchRecap1")?.addEventListener("click", () => {
      this.closeTrailer();
      this.switchMode("cinema");
      this.selectVideo("FGy7KWr7BrM");
    });

    // Season Filter Pills
    document.querySelectorAll("#seriesSeasonFilter .series-filter-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        SoundEngine.focusMove();
        const season = pill.dataset.season;
        this.activeSeasonFilter = season;
        document.querySelectorAll("#seriesSeasonFilter .series-filter-pill").forEach((p) => {
          p.classList.toggle("is-active", p.dataset.season === season);
        });
        this.renderSeriesEpisodes();
      });
    });

    // Background sync on init
    this.syncVideosFromRSS(false);
  }
}

export const youtubeService = new YouTubeCinemaService();

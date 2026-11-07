/**
 * PS5 UI Sound Engine (Web Audio API)
 * Синтезирует мягкие футуристичные звуки интерфейса PlayStation 5.
 * Никаких внешних mp3/wav — абсолютная автономность и мгновенный отклик.
 */

class PS5SoundEngine {
  constructor() {
    this._ctx = null;
    this._muted = false;
    this._initialized = false;
  }

  /** Ленивая инициализация AudioContext по первому взаимодействию */
  _ensureContext() {
    if (!this._ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this._ctx = new AudioCtx();
      }
    }
    if (this._ctx && this._ctx.state === "suspended") {
      this._ctx.resume();
    }
    this._initialized = true;
  }

  get muted() {
    return this._muted;
  }

  toggle() {
    this._muted = !this._muted;
    if (!this._muted) {
      this.confirm();
    }
    return this._muted;
  }

  /** Мягкий футуристичный щелчок навигации (смена плитки в доке или фокуса) */
  navigate() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;

    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1150, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.055);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  /** Подтверждение / переключение вкладок / применение пресета */
  confirm() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;

    const ctx = this._ctx;
    const now = ctx.currentTime;

    // Первый аккорд
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.1, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Восходящая нота
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1320, now + 0.04);
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.1, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.035);
    osc2.stop(now + 0.18);
  }

  /** Открытие модального окна / карточки (PlayStation Submenu Swoosh) */
  modalOpen() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;

    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(1260, now + 0.14);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.16);
  }

  /** Закрытие модального окна (PlayStation Back) */
  modalClose() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;

    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(460, now + 0.1);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  /** Тост-уведомление (фирменный PlayStation Trophy / Notification Chime) */
  chime() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;

    const ctx = this._ctx;
    const now = ctx.currentTime;

    [
      { freq: 1046.5, time: 0.00, dur: 0.16 }, // C6
      { freq: 1318.5, time: 0.07, dur: 0.22 }, // E6
      { freq: 1567.98, time: 0.14, dur: 0.32 } // G6
    ].forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      gain.gain.setValueAtTime(0.001, now + n.time);
      gain.gain.linearRampToValueAtTime(0.12, now + n.time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  }

  /** Звук переключения фона / темы */
  themeChange() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;

    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.12);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  /** Звук изменения размера виджета */
  resize() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;

    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.setValueAtTime(1100, now + 0.04);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  /** Вход / выход из режима обзора фона (Showcase Mode) */
  showcase() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;

    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }
}

export const SoundEngine = new PS5SoundEngine();

/**
 * PS5 UI Sound Engine
 * Синтез мягких футуристичных щелчков через Web Audio API.
 * Экспортирует SoundEngine с методами navigate(), confirm(), toggle().
 */

class PS5SoundEngine {
  constructor() {
    this._ctx = null;
    this._muted = false;
    this._initialized = false;
  }

  /** Ленивая инициализация AudioContext (требует user gesture) */
  _ensureContext() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this._ctx.state === "suspended") {
      this._ctx.resume();
    }
    this._initialized = true;
  }

  /** Состояние mute */
  get muted() {
    return this._muted;
  }

  /** Переключить звук on/off */
  toggle() {
    this._muted = !this._muted;
    return this._muted;
  }

  /**
   * Мягкий навигационный щелчок (смена плитки).
   * Короткий синусоидальный тон ~1200 Hz с быстрым fade.
   */
  navigate() {
    if (this._muted) return;
    this._ensureContext();
    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Подтверждение / переключение категории.
   * Двухтоновый восходящий аккорд.
   */
  confirm() {
    if (this._muted) return;
    this._ensureContext();
    const ctx = this._ctx;
    const now = ctx.currentTime;

    // Первый тон
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

    // Второй тон (выше, с задержкой)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1320, now + 0.05);
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.1, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.04);
    osc2.stop(now + 0.18);
  }

  /**
   * Звук открытия ссылки — нисходящий тон.
   */
  open() {
    if (this._muted) return;
    this._ensureContext();
    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }
}

export const SoundEngine = new PS5SoundEngine();


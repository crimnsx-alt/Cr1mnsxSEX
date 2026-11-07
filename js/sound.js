/**
 * PS5 UI Sound Engine & Ambient Music Synthesizer (Web Audio API)
 * Синтезирует фирменную звуковую среду интерфейса PlayStation 5:
 * - Генеративная эмбиент-музыка главного меню (PS5 Home Ambient Drone)
 * - Навигационные щелчки курсора
 * - Подтверждение выбора и открытие карточек
 * - Открытие / закрытие Control Center (PS Button)
 * - Звук трофеев и уведомлений (Trophy Chime)
 * - Звук возврата / отмены (Back / Cancel)
 */

class PS5SoundEngine {
  constructor() {
    this._ctx = null;
    this._muted = false;
    this._ambientPlaying = false;
    this._ambientGain = null;
    this._ambientOscs = [];
    this._musicVolume = 0.25;
    this._sfxVolume = 0.7;
  }

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
  }

  get muted() {
    return this._muted;
  }

  get ambientPlaying() {
    return this._ambientPlaying;
  }

  get musicVolume() {
    return this._musicVolume;
  }

  toggle() {
    this._muted = !this._muted;
    if (this._muted) {
      this.stopAmbient();
    } else {
      this.confirm();
      this.startAmbient();
    }
    return this._muted;
  }

  setMusicVolume(val) {
    this._musicVolume = Math.max(0, Math.min(1, val));
    if (this._ambientGain && this._ctx) {
      this._ambientGain.gain.setTargetAtTime(this._ambientPlaying && !this._muted ? this._musicVolume * 0.12 : 0, this._ctx.currentTime, 0.1);
    }
  }

  /**
   * Генеративная эмбиент-музыка главного меню PS5
   * Мягкие обертоны (Emaj9 / Bmaj) с низкочастотной фильтрацией
   */
  startAmbient() {
    if (this._muted || this._ambientPlaying) return;
    this._ensureContext();
    if (!this._ctx) return;

    try {
      const ctx = this._ctx;
      this._ambientPlaying = true;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(this._musicVolume * 0.12, ctx.currentTime + 2.5);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(420, ctx.currentTime);

      masterGain.connect(filter);
      filter.connect(ctx.destination);
      this._ambientGain = masterGain;

      // Теплый созвучный аккорд PS5 Home Menu (E2, B2, E3, G#3, B3)
      const freqs = [82.41, 123.47, 164.81, 207.65, 246.94];
      this._ambientOscs = [];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = idx % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Легкая расстройка (LFO effect) для живого движения
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.1 + idx * 0.05, ctx.currentTime);
        lfoGain.gain.setValueAtTime(1.2, ctx.currentTime);
        lfo.connect(osc.frequency);
        lfo.start();

        oscGain.gain.setValueAtTime(0.35 / freqs.length, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start();
        this._ambientOscs.push({ osc, lfo });
      });
    } catch (e) {
      console.warn("Audio ambient start issue:", e);
    }
  }

  stopAmbient() {
    if (!this._ambientPlaying) return;
    this._ambientPlaying = false;
    if (this._ambientGain && this._ctx) {
      this._ambientGain.gain.setTargetAtTime(0.0001, this._ctx.currentTime, 0.5);
    }
    setTimeout(() => {
      this._ambientOscs.forEach(({ osc, lfo }) => {
        try { osc.stop(); lfo.stop(); } catch (e) {}
      });
      this._ambientOscs = [];
    }, 600);
  }

  toggleAmbient() {
    if (this._ambientPlaying) {
      this.stopAmbient();
    } else {
      this.startAmbient();
    }
    return this._ambientPlaying;
  }

  /** Навигационный щелчок курсора PS5 */
  navigate() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;

    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1220, now);
    osc.frequency.exponentialRampToValueAtTime(760, now + 0.05);

    gain.gain.setValueAtTime(0.12 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.065);
  }

  /** Подтверждение выбора (Confirm / Select) */
  confirm() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;

    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.1 * this._sfxVolume, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1320, now + 0.04);
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.11 * this._sfxVolume, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.035);
    osc2.stop(now + 0.18);
  }

  /** Назад / Отмена (Cancel / Back) */
  back() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;

    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(940, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.11);

    gain.gain.setValueAtTime(0.09 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  /** Открытие / закрытие Control Center (PS Button) */
  controlCenter(isOpen = true) {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;

    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    if (isOpen) {
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(1180, now + 0.16);
    } else {
      osc.frequency.setValueAtTime(1180, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.14);
    }

    gain.gain.setValueAtTime(0.09 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  /** Трофей / Уведомление (PS5 Trophy Chime) */
  chime() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;

    const ctx = this._ctx;
    const now = ctx.currentTime;

    [
      { freq: 1046.5, time: 0.00, dur: 0.18 }, // C6
      { freq: 1318.5, time: 0.07, dur: 0.24 }, // E6
      { freq: 1567.98, time: 0.14, dur: 0.35 } // G6
    ].forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      gain.gain.setValueAtTime(0.001, now + n.time);
      gain.gain.linearRampToValueAtTime(0.13 * this._sfxVolume, now + n.time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  }

  modalOpen() {
    this.controlCenter(true);
  }

  modalClose() {
    this.back();
  }

  themeChange() {
    this.confirm();
  }

  resize() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;

    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(750, now);
    osc.frequency.setValueAtTime(1150, now + 0.045);

    gain.gain.setValueAtTime(0.09 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  showcase() {
    this.controlCenter(true);
  }
}

export const SoundEngine = new PS5SoundEngine();

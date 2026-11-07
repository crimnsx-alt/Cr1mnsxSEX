/**
 * PS5 UI Sound Engine & Ambient Music Synthesizer (Web Audio API)
 * Синтезирует фирменную звуковую среду интерфейса PlayStation 5:
 * - Генеративная эмбиент-музыка меню (Emaj9 / Bmaj)
 * - Навигационный щелчок курсора
 * - Подтверждение выбора и открытие карточек
 * - Двухуровневый спуск / подъем (Game Hub Whoosh)
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
    this._musicVolume = 0.28;
    this._sfxVolume = 0.75;
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
   * Теплые обертоны (E2, B2, E3, G#3, B3) с LFO и мягким фильтром
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
      masterGain.gain.exponentialRampToValueAtTime(this._musicVolume * 0.12, ctx.currentTime + 2.0);

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      masterGain.connect(filter);
      filter.connect(ctx.destination);
      this._ambientGain = masterGain;

      const freqs = [82.41, 123.47, 164.81, 207.65, 246.94];
      this._ambientOscs = [];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();

        osc.type = idx % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.08 + idx * 0.04, ctx.currentTime);
        lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
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
      this._ambientGain.gain.setTargetAtTime(0.0001, this._ctx.currentTime, 0.4);
    }
    setTimeout(() => {
      this._ambientOscs.forEach(({ osc, lfo }) => {
        try { osc.stop(); lfo.stop(); } catch (e) {}
      });
      this._ambientOscs = [];
    }, 500);
  }

  toggleAmbient() {
    if (this._ambientPlaying) {
      this.stopAmbient();
    } else {
      this.startAmbient();
    }
    return this._ambientPlaying;
  }

  /** Навигационный щелчок курсора PS5 (при смене плитки в доке) */
  navigate() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;

    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1240, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.048);

    gain.gain.setValueAtTime(0.12 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  /** Подтверждение выбора (Enter / Кнопка X) */
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
    osc2.frequency.setValueAtTime(1320, now + 0.035);
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.11 * this._sfxVolume, now + 0.035);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.03);
    osc2.stop(now + 0.18);
  }

  /** Назад / Отмена (ESC / Кнопка O) */
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
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.1);

    gain.gain.setValueAtTime(0.09 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  /** Спуск в Game Hub (Стрелка вниз ↓) */
  whooshDown() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;

    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.22);

    osc.type = "triangle";
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.22);

    gain.gain.setValueAtTime(0.11 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  /** Возврат из Game Hub в главное меню (Стрелка вверх ↑) */
  whooshUp() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;

    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.18);

    gain.gain.setValueAtTime(0.1 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /** Открытие / закрытие Control Center (Кнопка PS) */
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

  /** Трофей / Уведомление (Легендарный звон PS5: C6 -> E6 -> G6) */
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
}

export const SoundEngine = new PS5SoundEngine();

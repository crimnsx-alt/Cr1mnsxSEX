/**
 * PlayStation 5 UI Sound Engine & System Audio Synthesizer (Web Audio API)
 * TASK 08.1: Complete Architectural Audio System with 45-Sound Catalog
 */

import { PS5_SOUND_CATALOG, PS5_AUDIO_TIERS } from "./sound-catalog.js";

class PS5SoundEngine {
  constructor() {
    this._ctx = null;
    this._muted = false;
    this._ambientPlaying = false;
    this._ambientGain = null;
    this._ambientOscs = [];
    this._musicVolume = 0.28;
    this._sfxVolume = 0.75;
    this._catalog = PS5_SOUND_CATALOG;
    this._allowReserved = false; // Зарезервированные звуки отключены до активации функций
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

  get catalog() {
    return this._catalog;
  }

  toggle() {
    this._muted = !this._muted;
    if (this._muted) {
      this.stopAmbient();
    } else {
      this.enter();
      this.startAmbient();
    }
    return this._muted;
  }

  setMusicVolume(val) {
    this._musicVolume = Math.max(0, Math.min(1, val));
    if (this._ambientGain && this._ctx) {
      this._ambientGain.gain.setTargetAtTime(
        this._ambientPlaying && !this._muted ? this._musicVolume * 0.12 : 0,
        this._ctx.currentTime,
        0.1
      );
    }
  }

  setSfxVolume(val) {
    this._sfxVolume = Math.max(0, Math.min(1, val));
  }

  /* =========================================================================
     GENERIC CATALOG DISPATCHER
     ========================================================================= */
  play(soundKey, param = null) {
    if (this._muted) return;
    const entry = this._catalog.find((s) => s.key === soundKey);
    if (!entry) return;

    // Зарезервированные звуки присутствуют в каталоге, но не воспроизводятся до подключения функций
    if (entry.tier === PS5_AUDIO_TIERS.RESERVED && !this._allowReserved) {
      return;
    }

    if (typeof this[soundKey] === "function") {
      this[soundKey](param);
    } else {
      this.focusMove();
    }
  }

  /* =========================================================================
     AMBIENT MENU SOUNDTRACK (Emaj9 / Bmaj Generative Synthesizer)
     ========================================================================= */
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
        try {
          osc.stop();
          lfo.stop();
        } catch (e) {}
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

  /* =========================================================================
     GROUP 1: ПОДКЛЮЧЕНО СРАЗУ (ОСНОВНЫЕ СИСТЕМНЫЕ ДЕЙСТВИЯ)
     ========================================================================= */

  /** Focus Move — перемещение по меню / переключение плиток */
  focusMove() {
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

  /** Enter — подтверждение выбора / открытие карточек */
  enter() {
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

  /** Cancel — отмена / возврат (ESC / Кнопка O) */
  cancel() {
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

  /** Open Home — открытие главного меню */
  openHome() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.16);

    gain.gain.setValueAtTime(0.1 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  /** Open Control Center — открытие центра управления (PS Button) */
  openControlCenter() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(1180, now + 0.16);

    gain.gain.setValueAtTime(0.09 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  /** Close Control Center — закрытие центра управления */
  closeControlCenter() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1180, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.14);

    gain.gain.setValueAtTime(0.09 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  /** Open Option Menu — открытие контекстного меню (...) */
  openOptionMenu() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1420, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

    gain.gain.setValueAtTime(0.11 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  /** Close Option Menu — закрытие контекстного меню параметров */
  closeOptionMenu() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.05);

    gain.gain.setValueAtTime(0.08 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  /** Open Dialog — открытие диалогового окна / модального окна */
  openDialog() {
    this.openControlCenter();
  }

  /** Backspace — удаление символа в поле ввода */
  backspace() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.035);

    gain.gain.setValueAtTime(0.08 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  /** Text Input — ввод символа в текстовое поле */
  textInput() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(980, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.025);

    gain.gain.setValueAtTime(0.06 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.03);
  }

  /** Switch On — включение переключателя / опции */
  switchOn() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(640, now);
    osc.frequency.exponentialRampToValueAtTime(960, now + 0.06);

    gain.gain.setValueAtTime(0.09 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  /** Switch Off — выключение переключателя / опции */
  switchOff() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(960, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.06);

    gain.gain.setValueAtTime(0.08 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  }

  /** Slider Level Meter — изменение ползунка громкости / настройки */
  sliderLevelMeter(normalizedVal = 0.5) {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    const val = Math.max(0, Math.min(1, typeof normalizedVal === "number" ? normalizedVal : 0.5));
    const freq = 440 + val * 660; // 440Hz -> 1100Hz

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.06 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.035);
  }

  /** Change Panel — переключение вкладки / панели */
  changePanel() {
    this.focusMove();
  }

  /** Focus Move in Keyboard — перемещение фокуса внутри клавиатуры */
  focusMoveInKeyboard() {
    this.textInput();
  }

  /** Open OSK — открытие экранной клавиатуры */
  openOsk() {
    this.openOptionMenu();
  }

  /* =========================================================================
     GROUP 2: ПОДКЛЮЧЕНО ПО МЕРЕ ПОЯВЛЕНИЯ ФУНКЦИЙ
     ========================================================================= */

  /** Error — системная ошибка */
  error() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    [360, 340].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.07 * this._sfxVolume, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.12);
    });
  }

  /** Error in Text Box — ошибка валидации поля ввода */
  errorInTextBox() {
    this.error();
  }

  /** Error Toasts — всплывающее уведомление об ошибке */
  errorToasts() {
    this.error();
  }

  /** Open Error Dialog — открытие диалога ошибки */
  openErrorDialog() {
    this.error();
  }

  /** Informative Toasts — информационное уведомление */
  informativeToasts() {
    this.chime();
  }

  /** Interactive Toasts — интерактивное уведомление */
  interactiveToasts() {
    this.chime();
  }

  /** Trophy Toast — получение трофея PS5 (C6 -> E6 -> G6) */
  trophyToast() {
    this.chime();
  }

  /** Platinum Trophy Toast — получение платинового трофея (C5 -> G5 -> C6 -> E6 -> G6 -> C7) */
  platinumTrophyToast() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    const notes = [
      { freq: 523.25,  time: 0.00, dur: 0.22 }, // C5
      { freq: 783.99,  time: 0.06, dur: 0.24 }, // G5
      { freq: 1046.50, time: 0.12, dur: 0.26 }, // C6
      { freq: 1318.51, time: 0.18, dur: 0.28 }, // E6
      { freq: 1567.98, time: 0.24, dur: 0.35 }, // G6
      { freq: 2093.00, time: 0.30, dur: 0.55 }  // C7
    ];

    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(n.freq, now + n.time);

      gain.gain.setValueAtTime(0.001, now + n.time);
      gain.gain.linearRampToValueAtTime(0.14 * this._sfxVolume, now + n.time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  }

  /** Join Party — вход в голосовую группу */
  joinParty() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    [523.25, 783.99].forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now + idx * 0.06);

      gain.gain.setValueAtTime(0.1 * this._sfxVolume, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.12);
    });
  }

  /** Leave Party — выход из голосовой группы */
  leaveParty() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    [783.99, 523.25].forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, now + idx * 0.06);

      gain.gain.setValueAtTime(0.09 * this._sfxVolume, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.11);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.11);
    });
  }

  /** Log Out — выход из профиля / выключение */
  logOut() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.22);

    gain.gain.setValueAtTime(0.11 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  /** Take Screenshot — создание снимка экрана */
  takeScreenshot() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.07);

    gain.gain.setValueAtTime(0.12 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  /** Purchase Universal Checkout — подтверждение покупки в Store */
  purchaseUniversalCheckout() {
    this.platinumTrophyToast();
  }

  /* =========================================================================
     BACKWARD-COMPATIBLE ALIASES FOR EXISTING UI CODE
     ========================================================================= */
  navigate() {
    this.focusMove();
  }

  focus() {
    this.focusMove();
  }

  hover() {
    this.focusMove();
  }

  confirm() {
    this.enter();
  }

  back() {
    this.cancel();
  }

  tick() {
    this.focusMove();
  }

  modalOpen() {
    this.openDialog();
  }

  modalClose() {
    this.cancel();
  }

  controlCenter(isOpen = true) {
    if (isOpen) this.openControlCenter();
    else this.closeControlCenter();
  }

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

  micMute(isMuted) {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    if (isMuted) {
      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.08);
    } else {
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.08);
    }
    gain.gain.setValueAtTime(0.09 * this._sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  launch() {
    if (this._muted) return;
    this._ensureContext();
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(110, now);
    subOsc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
    subGain.gain.setValueAtTime(0.12 * this._sfxVolume, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.28);

    [880, 1320, 1760].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.001, now + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.08 * this._sfxVolume, now + idx * 0.04 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.26);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.26);
    });
  }

  playStart() {
    this.launch();
  }
}

export const SoundEngine = new PS5SoundEngine();

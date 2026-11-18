/**
 * PlayStation 5 System Audio Manager (Web Audio API & Asset Audio Buffers)
 * TASK 08.2: Replace Existing Audio with PS5 System Sounds
 * 
 * Official Source: PS5 System Software Sounds Effects (Khinsider Rip)
 * - 45 cataloged system sounds
 * - Channel-based volume routing (Navigation, Interface, Notifications, Music)
 * - Persistent configuration in localStorage
 * - Safe asset loader with graceful missing-file fallback (no synthetic imitations)
 * - Generative PS5 Ambient Synth soundtrack (Emaj9 / Bmaj)
 */

import {
  PS5_SOUND_CATALOG,
  PS5_AUDIO_TIERS,
  PS5_AUDIO_CHANNELS,
  getSoundEntry
} from "./sound-catalog.js";

const STORAGE_KEY = "ps5_audio_settings";

const DEFAULT_SETTINGS = {
  systemSoundsEnabled: true,
  masterVolume: 0.85,
  navVolume: 0.75,
  uiVolume: 0.80,
  notifVolume: 0.90,
  musicVolume: 0.28,
  muted: false
};

class PS5AudioManager {
  constructor() {
    this._ctx = null;
    this._catalog = PS5_SOUND_CATALOG;
    this._allowReserved = false;

    // Load persisted settings
    this._settings = this._loadSettings();
    this._systemSoundsEnabled = this._settings.systemSoundsEnabled;
    this._masterVolume = this._settings.masterVolume;
    this._navVolume = this._settings.navVolume;
    this._uiVolume = this._settings.uiVolume;
    this._notifVolume = this._settings.notifVolume;
    this._musicVolume = this._settings.musicVolume;
    this._muted = this._settings.muted;

    // Gain Nodes
    this._masterGain = null;
    this._navGain = null;
    this._uiGain = null;
    this._notifGain = null;

    // Ambient Music Synth
    this._ambientGain = null;
    this._ambientOscs = [];
    this._ambientPlaying = false;

    // Asset Buffer Cache & Missing Files Registry
    this._bufferCache = new Map();
    this._missingFiles = new Set();
    this._loadingPromises = new Map();

    // Anti-duplication / spam throttle
    this._lastPlayTime = new Map();
  }

  /* =========================================================================
     SETTINGS PERSISTENCE (localStorage)
     ========================================================================= */
  _loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return Object.assign({}, DEFAULT_SETTINGS, parsed);
      }
    } catch (_) {}
    return { ...DEFAULT_SETTINGS };
  }

  saveSettings() {
    try {
      const data = {
        systemSoundsEnabled: this._systemSoundsEnabled,
        masterVolume: this._masterVolume,
        navVolume: this._navVolume,
        uiVolume: this._uiVolume,
        notifVolume: this._notifVolume,
        musicVolume: this._musicVolume,
        muted: this._muted
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  /* =========================================================================
     WEB AUDIO API CONTEXT & CHANNEL GRAPH
     ========================================================================= */
  _ensureContext() {
    if (!this._ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this._ctx = new AudioCtx();
        this._initAudioGraph();
      }
    }
    if (this._ctx && this._ctx.state === "suspended") {
      this._ctx.resume().catch(() => {});
    }
  }

  _initAudioGraph() {
    if (!this._ctx) return;
    const ctx = this._ctx;

    // Master Gain Node
    this._masterGain = ctx.createGain();
    this._masterGain.gain.setValueAtTime(this._muted ? 0 : this._masterVolume, ctx.currentTime);
    this._masterGain.connect(ctx.destination);

    // Navigation Channel Gain
    this._navGain = ctx.createGain();
    this._navGain.gain.setValueAtTime(this._systemSoundsEnabled ? this._navVolume : 0, ctx.currentTime);
    this._navGain.connect(this._masterGain);

    // Interface Channel Gain
    this._uiGain = ctx.createGain();
    this._uiGain.gain.setValueAtTime(this._systemSoundsEnabled ? this._uiVolume : 0, ctx.currentTime);
    this._uiGain.connect(this._masterGain);

    // Notification Channel Gain
    this._notifGain = ctx.createGain();
    this._notifGain.gain.setValueAtTime(this._systemSoundsEnabled ? this._notifVolume : 0, ctx.currentTime);
    this._notifGain.connect(this._masterGain);
  }

  _updateChannelGains() {
    if (!this._ctx) return;
    const ctx = this._ctx;
    const now = ctx.currentTime;

    if (this._masterGain) {
      this._masterGain.gain.setTargetAtTime(this._muted ? 0 : this._masterVolume, now, 0.05);
    }
    if (this._navGain) {
      this._navGain.gain.setTargetAtTime(this._systemSoundsEnabled ? this._navVolume : 0, now, 0.05);
    }
    if (this._uiGain) {
      this._uiGain.gain.setTargetAtTime(this._systemSoundsEnabled ? this._uiVolume : 0, now, 0.05);
    }
    if (this._notifGain) {
      this._notifGain.gain.setTargetAtTime(this._systemSoundsEnabled ? this._notifVolume : 0, now, 0.05);
    }
  }

  /* =========================================================================
     AUDIO BUFFER ASSET LOADER (WAV / MP3)
     ========================================================================= */
  async loadAudioFile(entry) {
    if (!entry) return null;
    if (this._bufferCache.has(entry.key)) {
      return this._bufferCache.get(entry.key);
    }
    if (this._missingFiles.has(entry.key)) {
      return null;
    }
    if (this._loadingPromises.has(entry.key)) {
      return this._loadingPromises.get(entry.key);
    }

    const promise = (async () => {
      this._ensureContext();
      if (!this._ctx) return null;

      const candidates = [entry.file, entry.altFile].filter(Boolean);
      for (const url of candidates) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const arrayBuffer = await res.arrayBuffer();
          const audioBuffer = await this._ctx.decodeAudioData(arrayBuffer);
          this._bufferCache.set(entry.key, audioBuffer);
          return audioBuffer;
        } catch (_) {
          // Continue to next candidate file format
        }
      }

      // Mark as missing to prevent repetitive failing network calls
      this._missingFiles.add(entry.key);
      return null;
    })();

    this._loadingPromises.set(entry.key, promise);
    const result = await promise;
    this._loadingPromises.delete(entry.key);
    return result;
  }

  /* =========================================================================
     PLAYBACK DISPATCHER (By Key or ID)
     ========================================================================= */
  play(soundKeyOrId) {
    if (this._muted || !this._systemSoundsEnabled) return;
    const entry = getSoundEntry(soundKeyOrId);
    if (!entry) return;

    // Block reserved tier until corresponding feature is activated
    if (entry.tier === PS5_AUDIO_TIERS.RESERVED && !this._allowReserved) {
      return;
    }

    // Debounce rapid movements (e.g., arrow key / d-pad spam)
    const now = performance.now();
    const lastTime = this._lastPlayTime.get(entry.key) || 0;
    if (entry.key === "focusMove" || entry.key === "focusMoveInKeyboard") {
      if (now - lastTime < 45) return;
    }
    this._lastPlayTime.set(entry.key, now);

    this._ensureContext();
    if (!this._ctx) return;

    const buffer = this._bufferCache.get(entry.key);
    if (buffer) {
      this._playBuffer(entry, buffer);
    } else if (!this._missingFiles.has(entry.key)) {
      this.loadAudioFile(entry).then((loaded) => {
        if (loaded) {
          this._playBuffer(entry, loaded);
        }
      });
    }
    // If files are missing, we gracefully return without synthetic beeps or crashes
  }

  _playBuffer(entry, buffer) {
    if (!this._ctx || this._muted || !this._systemSoundsEnabled) return;
    try {
      const source = this._ctx.createBufferSource();
      source.buffer = buffer;

      let channelNode = this._uiGain;
      if (entry.channel === PS5_AUDIO_CHANNELS.NAV) channelNode = this._navGain;
      else if (entry.channel === PS5_AUDIO_CHANNELS.NOTIF) channelNode = this._notifGain;

      source.connect(channelNode || this._masterGain || this._ctx.destination);
      source.start(0);
    } catch (_) {}
  }

  /* =========================================================================
     TEST SOUND FEATURE
     ========================================================================= */
  testSound(channel = "ui") {
    let soundKey = "enter";
    if (channel === "nav") soundKey = "focusMove";
    else if (channel === "notif") soundKey = "trophyToast";

    const entry = getSoundEntry(soundKey);
    const isLoaded = entry ? this._bufferCache.has(entry.key) : false;
    this.play(soundKey);

    return {
      channel,
      soundKey,
      file: entry?.file || "",
      isLoaded
    };
  }

  /* =========================================================================
     GETTERS & SETTERS (Volume Channels, System Sounds ON/OFF)
     ========================================================================= */
  get muted() {
    return this._muted;
  }

  get systemSoundsEnabled() {
    return this._systemSoundsEnabled;
  }

  get masterVolume() {
    return this._masterVolume;
  }

  get navVolume() {
    return this._navVolume;
  }

  get uiVolume() {
    return this._uiVolume;
  }

  get notifVolume() {
    return this._notifVolume;
  }

  get musicVolume() {
    return this._musicVolume;
  }

  get ambientPlaying() {
    return this._ambientPlaying;
  }

  get catalog() {
    return this._catalog;
  }

  get loadedCount() {
    return this._bufferCache.size;
  }

  get missingCount() {
    return this._missingFiles.size;
  }

  toggle() {
    this._muted = !this._muted;
    if (this._muted) {
      this.stopAmbient();
    } else {
      this.startAmbient();
    }
    this._updateChannelGains();
    this.saveSettings();
    return this._muted;
  }

  setSystemSoundsEnabled(enabled) {
    this._systemSoundsEnabled = !!enabled;
    this._updateChannelGains();
    this.saveSettings();
  }

  setMasterVolume(val) {
    this._masterVolume = Math.max(0, Math.min(1, val));
    this._updateChannelGains();
    this.saveSettings();
  }

  setNavVolume(val) {
    this._navVolume = Math.max(0, Math.min(1, val));
    this._updateChannelGains();
    this.saveSettings();
  }

  setUiVolume(val) {
    this._uiVolume = Math.max(0, Math.min(1, val));
    this._updateChannelGains();
    this.saveSettings();
  }

  setNotifVolume(val) {
    this._notifVolume = Math.max(0, Math.min(1, val));
    this._updateChannelGains();
    this.saveSettings();
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
    this.saveSettings();
  }

  // Backward-compatible SFX volume setter
  setSfxVolume(val) {
    this.setUiVolume(val);
    this.setNavVolume(val);
  }

  get _sfxVolume() {
    return this._uiVolume;
  }

  set _sfxVolume(val) {
    this.setUiVolume(val);
    this.setNavVolume(val);
  }

  /* =========================================================================
     GENERATIVE PS5 AMBIENT SYNTH MUSIC (Emaj9 / Bmaj) — PRESERVED
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
      filter.connect(this._masterGain || ctx.destination);
      this._ambientGain = masterGain;

      const freqs = [82.41, 123.47, 164.81, 207.65, 246.94];
      this._ambientOscs = [];

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.08 + idx * 0.04, ctx.currentTime);
        lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);

        lfo.connect(osc.frequency);
        lfo.start();

        const pan = (idx - 2) * 0.25;
        let panner = null;
        if (ctx.createStereoPanner) {
          panner = ctx.createStereoPanner();
          panner.pan.setValueAtTime(pan, ctx.currentTime);
        }

        oscGain.gain.setValueAtTime(0.04, ctx.currentTime);

        if (panner) {
          osc.connect(oscGain);
          oscGain.connect(panner);
          panner.connect(masterGain);
        } else {
          osc.connect(oscGain);
          oscGain.connect(masterGain);
        }

        osc.start();
        this._ambientOscs.push({ osc, lfo });
      });
    } catch (_) {
      this._ambientPlaying = false;
    }
  }

  stopAmbient() {
    if (!this._ambientPlaying) return;
    this._ambientPlaying = false;
    if (this._ambientGain && this._ctx) {
      try {
        this._ambientGain.gain.setTargetAtTime(0.0001, this._ctx.currentTime, 0.4);
      } catch (_) {}
    }
    setTimeout(() => {
      this._ambientOscs.forEach(({ osc, lfo }) => {
        try {
          osc.stop();
          lfo.stop();
        } catch (_) {}
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
     EXACT 22 MAPPED ACTIONS FROM TASK 08.2
     ========================================================================= */
  focusMove() { this.play("focusMove"); }
  focusMoveInKeyboard() { this.play("focusMoveInKeyboard"); }
  enter() { this.play("enter"); }
  cancel() { this.play("cancel"); }
  openHome() { this.play("openHome"); }
  openControlCenter() { this.play("openControlCenter"); }
  closeControlCenter() { this.play("closeControlCenter"); }
  openOptionMenu() { this.play("openOptionMenu"); }
  closeOptionMenu() { this.play("closeOptionMenu"); }
  openDialog() { this.play("openDialog"); }
  openOsk() { this.play("openOsk"); }
  backspace() { this.play("backspace"); }
  textInput() { this.play("textInput"); }
  switchOn() { this.play("switchOn"); }
  switchOff() { this.play("switchOff"); }
  sliderLevelMeter() { this.play("sliderLevelMeter"); }
  errorInTextBox() { this.play("errorInTextBox"); }
  error() { this.play("error"); }
  informativeToasts() { this.play("informativeToasts"); }
  interactiveToasts() { this.play("interactiveToasts"); }
  trophyToast() { this.play("trophyToast"); }
  platinumTrophyToast() { this.play("platinumTrophyToast"); }

  // Additional active and featured events
  changePanel() { this.play("changePanel"); }
  takeScreenshot() { this.play("takeScreenshot"); }
  joinParty() { this.play("joinParty"); }
  leaveParty() { this.play("leaveParty"); }
  logOut() { this.play("logOut"); }
  purchaseUniversalCheckout() { this.play("purchaseUniversalCheckout"); }
  errorToasts() { this.play("errorToasts"); }
  openErrorDialog() { this.play("openErrorDialog"); }

  /* =========================================================================
     BACKWARD-COMPATIBLE ALIASES FOR EXISTING UI CODE
     ========================================================================= */
  navigate() { this.focusMove(); }
  focus() { this.focusMove(); }
  hover() { this.focusMove(); }
  confirm() { this.enter(); }
  back() { this.cancel(); }
  tick() { this.focusMove(); }
  modalOpen() { this.openDialog(); }
  modalClose() { this.cancel(); }
  controlCenter(isOpen = true) {
    if (isOpen) this.openControlCenter();
    else this.closeControlCenter();
  }
  chime() { this.informativeToasts(); }
  whooshDown() { this.openHome(); }
  whooshUp() { this.openControlCenter(); }
  micMute(isMuted) {
    if (isMuted) this.switchOff();
    else this.switchOn();
  }
  launch() { this.enter(); }
  playStart() { this.enter(); }
}

export const SoundEngine = new PS5AudioManager();
export const AudioManager = SoundEngine;

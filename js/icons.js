/**
 * Vector SVG Icon System & Bespoke Art Generators for PlayStation 5 Shell
 * 100% pure vector SVGs (zero emojis).
 */

let _svgUid = 0;
const uid = (prefix) => `${prefix}_${++_svgUid}`;

export const PS5Icons = {
  psLogo: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.5 4.2v14.1l3.1 1.1V8.4c0-1 .4-1.4 1.1-1.2.8.2 1.1.8 1.1 1.8v3.9c2.2 1.1 4 0 4-2.8 0-2.9-1.1-4.1-4.1-5.1-1.6-.5-3.6-1-5.2-.8zm-1.1 9.4-5.7 2c-1.5.5-2.1 1.4-1.7 2.4.4 1 1.8 1.3 3.4.8l4-1.4v-2l-2.6.9c-.7.2-1.2.1-1.4-.3-.1-.3.1-.7.7-.9l3.3-1.1v-.4zm12.8 1.6c-1.4-.5-3.2-.6-4.7-.1l-2.8 1v2l2.9-1c.8-.3 1.5-.2 1.8.2.2.4-.1.8-.9 1.1l-3.8 1.3v2l5.6-2c1.8-.6 2.7-1.6 2.4-2.8-.1-.8-.9-1.3-2.5-1.7z"/></svg>`,

  search: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><line x1="15.4" y1="15.4" x2="20.8" y2="20.8"/></svg>`,

  settings: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,

  soundOn: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,

  soundMuted: `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>`,

  profileSmiley: `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5.5" fill="#f3f4f6"/><circle cx="8.8" cy="10.2" r="1.45" fill="#090c14"/><circle cx="15.2" cy="10.2" r="1.45" fill="#090c14"/><path d="M8.1 14.3c1 1.55 2.35 2.25 3.9 2.25s2.9-.7 3.9-2.25" fill="none" stroke="#090c14" stroke-width="1.85" stroke-linecap="round"/></svg>`,

  home: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9.5 9-7 9 7V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 13 15 13 15 22"/></svg>`,

  switcher: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="14" rx="1.5"/><rect width="7" height="7" x="3" y="14" rx="1.5"/></svg>`,

  notifications: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>`,

  gamebase: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,

  music: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,

  mic: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>`,

  micMuted: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="2" x2="22" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><line x1="12" y1="19" x2="12" y2="22"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><circle cx="18" cy="6" r="2.5" fill="#f59e0b" stroke="none"/></svg>`,

  controller: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>`,

  profile: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>`,

  power: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>`,

  powerRest: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,

  powerOff: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>`,

  powerRestart: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>`,

  gamepadSquare: `<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="1.5" y="1.5" width="11" height="11" rx="2"/></svg>`,

  gamepadCross: `<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M3 3l8 8M11 3l-8 8"/></svg>`,

  gamepadCircle: `<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="7" cy="7" r="5.2"/></svg>`,

  gamepadTriangle: `<svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M7 2.2L12.5 11.8H1.5Z"/></svg>`,

  storage: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>`,

  display: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,

  globe: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,

  info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,

  trophy: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,

  share: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>`,

  star: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,

  check: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,

  accessibility: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="7.4" r="1.2" fill="currentColor" stroke="none"/><path d="M7.5 10.6h9M12 10.6v4.4M9.6 18.2l2.4-3.2 2.4 3.2"/></svg>`,

  heartSolid: `<svg width="15" height="15" viewBox="0 0 24 24" fill="#ef4444" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`,

  bolt: `<svg width="14" height="14" viewBox="0 0 24 24" fill="#ffaa44" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,

  globeNetwork: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,

  creditCard: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,

  shieldLock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="12" r="2.5" fill="#a78bfa"/></svg>`,

  gift: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7" rx="1"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`,

  gear: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,

  get accessibilityEmblem() {
    const gid = uid("accGrad");
    return `<svg viewBox="0 0 64 64" width="52" height="52" fill="none" aria-hidden="true"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#1d4ed8"/></linearGradient></defs><circle cx="32" cy="32" r="28" fill="url(#${gid})" opacity="0.22"/><circle cx="32" cy="32" r="22" stroke="url(#${gid})" stroke-width="2.2"/><circle cx="32" cy="21.5" r="3.4" fill="#ffffff"/><path d="M20 29.5h24M32 29.5v10.5M24.5 47l7.5-7 7.5 7" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  },

  chevronLeft: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,

  chevronRight: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,

  chevronDown: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,

  dots: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="5.5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="18.5" cy="12" r="1.8"/></svg>`,

  get psPlusCross() {
    const gid = uid("plusGold");
    return `<svg viewBox="0 0 36 36" width="26" height="26" aria-hidden="true"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#fde047"/><stop offset="100%" stop-color="#eab308"/></linearGradient></defs><path d="M15 6h6v9h9v6h-9v9h-6v-9H6v-6h9V6z" fill="url(#${gid})"/></svg>`;
  },

  get psStoreBag() {
    const gid = uid("bagGrad");
    return `<svg viewBox="0 0 48 48" width="38" height="38" fill="none" aria-hidden="true"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#0055c4"/></linearGradient></defs><path d="M16 16v-2.5a8 8 0 0 1 16 0V16" stroke="#93c5fd" stroke-width="2.6" stroke-linecap="round"/><rect x="10" y="16" width="28" height="24" rx="5" fill="url(#${gid})"/><path d="M21 23.2v9.6l2 .7V26c0-.7.3-1 .8-.8.5.1.7.6.7 1.3v2.7c1.5.7 2.8 0 2.8-2 0-2-.8-2.8-2.8-3.5-1.1-.4-2.4-.7-3.5-.5zm-.7 6.3-3.9 1.4c-1 .3-1.4.9-1.1 1.6.3.7 1.2.9 2.3.5l2.7-1v-1.3l-1.8.6c-.5.1-.8 0-.9-.2-.1-.2.1-.5.5-.6l2.2-.8v-.2zm8.7 1.1c-1-.3-2.2-.4-3.2-.1l-1.9.7v1.3l2-.7c.5-.2 1-.1 1.2.1.1.3-.1.6-.6.8l-2.6.9v1.3l3.8-1.4c1.2-.4 1.8-1.1 1.6-1.9-.1-.5-.6-.9-1.7-1.1z" fill="#ffffff"/></svg>`;
  },

  welcomeGlyphs: `<svg viewBox="0 0 64 64" width="44" height="44" class="ps5-welcome-glyphs" aria-hidden="true"><rect x="10" y="10" width="16.5" height="16.5" rx="2" fill="none" stroke="#e5e7eb" stroke-width="4.2"/><polygon points="46,9.5 55.5,26.5 36.5,26.5" fill="none" stroke="#e5e7eb" stroke-width="4.2" stroke-linejoin="round"/><g stroke="#e5e7eb" stroke-width="4.2" stroke-linecap="round"><line x1="11" y1="38.5" x2="25.5" y2="53"/><line x1="25.5" y1="38.5" x2="11" y2="53"/></g><circle cx="46" cy="45.8" r="8.5" fill="none" stroke="#e5e7eb" stroke-width="4.2"/></svg>`,

  remotePlayTile: `<svg viewBox="0 0 44 44" width="32" height="32" fill="none" aria-hidden="true"><circle cx="22" cy="9" r="1.6" fill="#60a5fa"/><circle cx="22" cy="13.5" r="1.6" fill="#93c5fd"/><circle cx="22" cy="18" r="1.6" fill="#ffffff"/><path d="M14.5 22.5h15c2.6 0 4.5 2.1 5 4.8l.9 5.2c.3 1.8-1 3.3-2.8 3.3-1.1 0-2-.5-2.6-1.4l-2-2.6h-12l-2 2.6c-.6.9-1.5 1.4-2.6 1.4-1.8 0-3.1-1.5-2.8-3.3l.9-5.2c.5-2.7 2.4-4.8 5-4.8z" stroke="#ffffff" stroke-width="2" fill="rgba(255,255,255,0.08)"/></svg>`,

  gameLibraryTile: `<svg viewBox="0 0 44 44" width="32" height="32" fill="#ffffff" aria-hidden="true"><rect x="9" y="10" width="6.5" height="6" rx="1.2" opacity="0.9"/><rect x="18.5" y="10" width="6.5" height="6" rx="1.2" opacity="0.9"/><rect x="28" y="10" width="6.5" height="6" rx="1.2" opacity="0.9"/><rect x="9" y="19" width="6.5" height="6" rx="1.2" opacity="0.9"/><rect x="18.5" y="19" width="6.5" height="6" rx="1.2" opacity="0.9"/><path d="M23 25.5h8.5c1.7 0 3 1.3 3.3 3l.5 3.1c.2 1.1-.6 2.1-1.7 2.1-.6 0-1.2-.3-1.6-.9l-1.1-1.4h-7.3l-1.1 1.4c-.4.6-1 .9-1.6.9-1.1 0-1.9-1-1.7-2.1l.5-3.1c.3-1.7 1.6-3 3.3-3z" fill="#60a5fa"/></svg>`,

  exploreTile: `<svg viewBox="0 0 44 44" width="32" height="32" fill="none" aria-hidden="true"><circle cx="22" cy="22" r="13" stroke="#ffffff" stroke-width="2" opacity="0.85"/><polygon points="22,12 25.2,20.5 34,22 25.2,23.5 22,32 18.8,23.5 10,22 18.8,20.5" fill="#60a5fa"/></svg>`,

  youtubeTile: `<svg viewBox="0 0 44 44" width="32" height="32" aria-hidden="true"><rect x="6" y="11" width="32" height="22" rx="6" fill="#ff0000"/><polygon points="18,16 29,22 18,28" fill="#ffffff"/></svg>`,

  twitchTile: `<svg viewBox="0 0 44 44" width="32" height="32" aria-hidden="true"><path d="M9 7h26v17l-6 6h-6l-4 4v-4H9V7z" fill="#9146ff"/><rect x="23.5" y="14" width="3" height="7" fill="#ffffff"/><rect x="17.5" y="14" width="3" height="7" fill="#ffffff"/></svg>`,

  get brawlStarsTile() {
    return `<img src="assets/covers/brawl_stars.jpg" alt="Brawl Stars" style="width:100%; height:100%; object-fit:cover; display:block;" loading="eager" decoding="async" />`;
  },

  avatarSvg: `<div class="ps5-topbar-avatar-circle" style="width:100%; height:100%; border-radius:50%; background:linear-gradient(135deg, #0284c7, #1e3a8a); display:flex; align-items:center; justify-content:center; color:#ffffff;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg></div>`,

  makeProfileAvatarUri(seedColor1 = "#0ea5e9", seedColor2 = "#1e3a8a") {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="av" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${seedColor1}"/><stop offset="100%" stop-color="${seedColor2}"/></linearGradient><radialGradient id="glow" cx="0.35" cy="0.3" r="0.7"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs><rect width="120" height="120" rx="60" fill="url(#av)"/><rect width="120" height="120" rx="60" fill="url(#glow)"/><circle cx="60" cy="46" r="19" fill="#f8fafc" opacity="0.92"/><path d="M26 104c0-18.8 15.2-34 34-34s34 15.2 34 34" fill="#f8fafc" opacity="0.92"/></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  },

  dualsenseSilhouette: `<svg viewBox="0 0 36 26" width="24" height="17" fill="#ffffff" aria-hidden="true"><path d="M10.5 4.5h15c3.2 0 5.6 2.5 6.3 5.7l1.4 7.2c.5 2.4-1.3 4.6-3.7 4.6-1.4 0-2.7-.7-3.5-1.9l-2.6-3.6H12.6L10 20.1c-.8 1.2-2.1 1.9-3.5 1.9-2.4 0-4.2-2.2-3.7-4.6l1.4-7.2C4.9 7 7.3 4.5 10.5 4.5z"/></svg>`,

  earbudsSilhouette: `<svg viewBox="0 0 36 26" width="24" height="17" fill="#ffffff" aria-hidden="true"><path d="M13 4.5c-3 0-5.2 2.6-5.2 6.2 0 3.2 1.8 5.8 4.4 6.2 1.2.2 2.3-.6 2.3-1.9V6.8c0-1.3-1-2.3-1.5-2.3zm-1.8 4.8a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6z"/><path d="M23 7.5c3 0 5.2 2.6 5.2 6.2 0 3.2-1.8 5.8-4.4 6.2-1.2.2-2.3-.6-2.3-1.9V9.8c0-1.3 1-2.3 1.5-2.3zm1.8 4.8a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6z"/></svg>`,

  miniBattery(bars = 3) {
    const rects = [0, 1, 2]
      .map((i) =>
        i < bars
          ? `<rect x="${3 + i * 4}" y="3.2" width="3" height="3.6" fill="#ffffff"/>`
          : ""
      )
      .join("");
    return `<svg viewBox="0 0 20 10" width="14" height="7" class="ps5-mini-batt" aria-hidden="true"><rect x="1" y="1.5" width="15" height="7" rx="1.2" fill="none" stroke="#d1d5db" stroke-width="1.3"/><rect x="16.8" y="3.3" width="2" height="3.4" rx="0.5" fill="#d1d5db"/>${rects}</svg>`;
  },

  trophyCup3D(tier = "platinum") {
    const palettes = {
      platinum: { c1: "#e0f2fe", c2: "#38bdf8", c3: "#0284c7", base: "#0c4a6e" },
      gold: { c1: "#fef08a", c2: "#eab308", c3: "#a16207", base: "#713f12" },
      silver: { c1: "#f8fafc", c2: "#cbd5e1", c3: "#64748b", base: "#334155" },
      bronze: { c1: "#fed7aa", c2: "#ea580c", c3: "#9a3412", base: "#431407" }
    };
    const p = palettes[tier] || palettes.platinum;
    const gid = uid(`cup_${tier}`);
    return `
      <svg viewBox="0 0 48 56" width="40" height="46" class="ps5-trophy-3d-svg" aria-hidden="true">
        <defs>
          <linearGradient id="${gid}" x1="0.15" y1="0" x2="0.85" y2="1">
            <stop offset="0%" stop-color="${p.c1}"/>
            <stop offset="48%" stop-color="${p.c2}"/>
            <stop offset="100%" stop-color="${p.c3}"/>
          </linearGradient>
        </defs>
        <path d="M12 10H6.5C5.1 10 4 11.1 4 12.5v3.8C4 20.5 7.4 24 11.6 24H13" fill="none" stroke="url(#${gid})" stroke-width="3" stroke-linecap="round"/>
        <path d="M36 10h5.5c1.4 0 2.5 1.1 2.5 2.5v3.8c0 4.2-3.4 7.7-7.6 7.7H35" fill="none" stroke="url(#${gid})" stroke-width="3" stroke-linecap="round"/>
        <path d="M12 7h24v12.5c0 6.8-5.4 12.5-12 12.5s-12-5.7-12-12.5V7z" fill="url(#${gid})"/>
        <path d="M16 10.5h4.2v12.2c0 2.2.8 4.4 2 6-3.8-1.5-6.2-5.2-6.2-9.5v-8.7z" fill="#ffffff" opacity="0.24"/>
        <rect x="21" y="31" width="6" height="10" fill="url(#${gid})"/>
        <path d="M15 41h18l2 5H13l2-5z" fill="url(#${gid})"/>
        <rect x="12" y="46" width="24" height="5" rx="2" fill="${p.base}" stroke="${p.c2}" stroke-width="1"/>
      </svg>
    `;
  },

  trophyMini(tier = "bronze") {
    const colors = {
      platinum: "#38bdf8",
      gold: "#fbbf24",
      silver: "#e2e8f0",
      bronze: "#fb923c"
    };
    const fill = colors[tier] || colors.bronze;
    return `<svg class="ps5-mini-cup-svg" viewBox="0 0 24 24" width="13" height="13" fill="none" aria-hidden="true"><path d="M7 4h10v6a5 5 0 0 1-10 0V4z" fill="${fill}"/><path d="M7 6H4.8A1.8 1.8 0 0 0 3 7.8v.6A3.6 3.6 0 0 0 6.6 12H7M17 6h2.2A1.8 1.8 0 0 1 21 7.8v.6A3.6 3.6 0 0 1 17.4 12H17" stroke="${fill}" stroke-width="1.8" stroke-linecap="round"/><path d="M12 15v4M8.5 20h7" stroke="${fill}" stroke-width="1.9" stroke-linecap="round"/></svg>`;
  },

  checkMini: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`,

  lockMini: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`,

  brawl: {
    trophy: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H8v2h8v-2h-3v-3.1c1.8-.3 3.32-1.5 3.61-3.06C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/></svg>`,
    flame: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 2.5c.3 2.7-1.1 4.4-2.6 5.9-1.3 1.3-2.4 2.5-2.4 4.6a3.5 3.5 0 0 0 7 0c0-1.1-.4-2.1-1-2.9 2.3 1.1 4 3.5 4 6.2A6.5 6.5 0 0 1 12 22a6.5 6.5 0 0 1-6.5-6.5c0-4.2 3-7 5.5-9.5 1-.9 1.9-2 2.5-3.5z"/></svg>`,
    gear: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    star: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    bolt: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 10-12h-7l1-8z"/></svg>`,
    shield: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    crown: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 18h18v2H3v-2zm0-2l2-9 4.5 4L12 5l2.5 6L19 7l2 9H3z"/></svg>`,
    swords: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg>`,
    users: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
  },

  /**
   * Generates deterministic high-contrast SVG scene artwork data-URI for custom hubs/cards
   * so there are zero external broken images or generic stock photos.
   */
  makeSceneArt(theme = "ps5", title = "") {
    const configs = {
      "slot-1": { bg1: "#071024", bg2: "#0a2a66", accent: "#38bdf8", accent2: "#60a5fa", mark: "01" },
      "slot-2": { bg1: "#0d111d", bg2: "#1b2845", accent: "#60a5fa", accent2: "#93c5fd", mark: "02" },
      "slot-3": { bg1: "#0c0a1d", bg2: "#1e1b4b", accent: "#818cf8", accent2: "#38bdf8", mark: "03" },
      "media-slot": { bg1: "#06141d", bg2: "#0f2d3e", accent: "#22d3ee", accent2: "#3b82f6", mark: "HD" },
      "ps5-eco": { bg1: "#050914", bg2: "#0d2459", accent: "#60a5fa", accent2: "#ffffff", mark: "PS5" },
      "store": { bg1: "#071124", bg2: "#0f2e6b", accent: "#38bdf8", accent2: "#93c5fd", mark: "" },
      "wishlist": { bg1: "#170c0c", bg2: "#3b1518", accent: "#ef4444", accent2: "#f59e0b", mark: "" },
      "explore": { bg1: "#080d1a", bg2: "#16213e", accent: "#e2e8f0", accent2: "#38bdf8", mark: "" },
      "audio-slot": { bg1: "#071426", bg2: "#0c2d52", accent: "#60a5fa", accent2: "#34d399", mark: "3D" },
      "psplus": { bg1: "#071228", bg2: "#132347", accent: "#facc15", accent2: "#60a5fa", mark: "PLUS" },
      "remote": { bg1: "#0c1527", bg2: "#182a4d", accent: "#38bdf8", accent2: "#a78bfa", mark: "LINK" }
    };
    const cfg = configs[theme] || configs["ps5-eco"];
    const safeTitle = String(title || "").replace(/[<>&"']/g, "");
    const centerEmblem = cfg.mark ? `
      <g transform="translate(640,360)">
        <circle r="150" fill="none" stroke="${cfg.accent}" stroke-width="3" opacity="0.34"/>
        <circle r="118" fill="rgba(6,8,17,0.52)" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
        <text x="0" y="24" text-anchor="middle" font-family="Inter, sans-serif" font-size="76" font-weight="300" fill="#ffffff" letter-spacing="6" opacity="0.92">${cfg.mark}</text>
      </g>
    ` : "";
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${cfg.bg1}"/>
            <stop offset="100%" stop-color="${cfg.bg2}"/>
          </linearGradient>
          <radialGradient id="glow1" cx="0.62" cy="0.38" r="0.55">
            <stop offset="0%" stop-color="${cfg.accent}" stop-opacity="0.46"/>
            <stop offset="100%" stop-color="${cfg.accent}" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="glow2" cx="0.28" cy="0.75" r="0.45">
            <stop offset="0%" stop-color="${cfg.accent2}" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="${cfg.accent2}" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#bg)"/>
        <rect width="1280" height="720" fill="url(#glow1)"/>
        <rect width="1280" height="720" fill="url(#glow2)"/>
        <path d="M-80 540 C 260 320, 620 660, 1360 220" fill="none" stroke="${cfg.accent}" stroke-width="3" opacity="0.35"/>
        <path d="M-80 610 C 340 420, 740 700, 1360 310" fill="none" stroke="${cfg.accent2}" stroke-width="1.8" opacity="0.24"/>
        <circle cx="960" cy="240" r="140" fill="none" stroke="${cfg.accent}" stroke-width="1.4" opacity="0.2"/>
        <circle cx="960" cy="240" r="210" fill="none" stroke="${cfg.accent2}" stroke-width="1" opacity="0.14"/>
        <circle cx="1010" cy="190" r="4" fill="${cfg.accent2}" opacity="0.75"/>
        <circle cx="840" cy="310" r="3" fill="${cfg.accent}" opacity="0.65"/>
        <circle cx="1110" cy="330" r="2.5" fill="#ffffff" opacity="0.55"/>
        <circle cx="710" cy="180" r="2" fill="${cfg.accent2}" opacity="0.5"/>
        ${centerEmblem}
        ${safeTitle ? `<text x="1180" y="660" text-anchor="end" font-family="Inter, sans-serif" font-size="18" font-weight="300" fill="rgba(255,255,255,0.16)" letter-spacing="4">${safeTitle.toUpperCase()}</text>` : ""}
      </svg>
    `.trim();
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }
};

if (typeof window !== "undefined") {
  window.PS5Icons = PS5Icons;
}

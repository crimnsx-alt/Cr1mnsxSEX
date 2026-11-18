/**
 * PlayStation®5 System Software Shell — Pure UI/UX Template Store
 * Clean 1:1 PS5 Welcome Hub, Explore, Game Home & Control Center
 * Ready for custom content population (RU / EN).
 */

import { PS5Icons } from "./icons.js";

export const uiStrings = {
  ru: {
    tabGames: "Игры",
    tabMedia: "Медиа",
    onlineFriends: "ДРУЗЬЯ",
    accessibility: "Специальные возможности",
    accessibilityDesc: "Сделайте PS5 удобнее для себя.",
    trophies: "Призы",
    totalPrefix: "Всего",
    levelPrefix: "Уровень",
    consoleStorage: "Память консоли",
    storeFeaturedTitle: "PlayStation Store",
    storeFeaturedSub: "Витрина новинок и разделов оболочки",
    wishlistTitle: "Список желаемого",
    wishlistSub: "Избранные разделы и игры PS5",
    friendActivityTitle: "Активность",
    friendActivitySub: "Последние события и обновления системы",
    mediaGalleryTitle: "Галерея мультимедиа",
    mediaGallerySub: "Снимки экрана и видеоклипы 4K HDR",
    networkStatusTitle: "Состояние сети",
    networkStatusSub: "PlayStation Network · Статус не проверен",
    trophyProgressTitle: "Прогресс призов",
    trophyProgressSub: "Последние достижения и трофеи",
    storageFreeHint: "158 GB свободно · M.2 NVMe готов",
    wishlistCount: "3 игры",
    wishlistDiscountHint: "2 скидки активны в PS Store",
    playCta: "Играть",
    openCta: "Открыть",
    backHome: "В главное меню",
    scrollHubCue: "Нажмите ↓ или прокрутите вниз — Центр игры",
    activitiesTitle: "События и активности",
    activitiesBadge: "Карточки PS5",
    newsTitle: "Новости и обновления",
    newsBadge: "Лента событий",
    trophiesProjectTitle: "Призы и достижения",
    trophiesProjectBadge: "PlayStation Network",
    ccCurrentTag: "ТЕКУЩИЙ ЭКРАН",
    ccResumeBtn: "Возобновить",
    ccMusicTag: "МУЗЫКА PS5",
    ccMusicTitle: "PS5 Ambient Synth",
    ccMusicArtist: "Эмбиент меню (Emaj9)",
    ccNetworkTag: "GAME BASE И СЕТЬ",
    ccNetworkSub: "PlayStation Network: Службы в норме",
    ccProfileBtn: "Профиль",
    searchPlaceholder: "Поиск по играм, разделам и настройкам…",
    settingsTag: "PLAYSTATION 5 SYSTEM SOFTWARE",
    settingsTitle: "Настройки",
    settingsSub: "Конфигурация системной оболочки",
    hintSelect: "Выбрать",
    hintBack: "Назад",
    hintSearch: "Поиск",
    hintHub: "Центр игры",
    hintCC: "Центр управления",
    hintTab: "Вкладка",
    editWidgets: "Настроить виджеты",
    powerRest: "Перейти в режим покоя",
    powerRestSub: "Зарядка контроллеров и фоновая загрузка обновлений при пониженном потреблении.",
    powerOff: "Выключить систему PS5",
    powerOffSub: "Закрыть все приложения и выключить консоль.",
    powerRestart: "Перезагрузить систему PS5",
    powerRestartSub: "Перезапуск системного программного обеспечения PS5."
  },
  en: {
    tabGames: "Games",
    tabMedia: "Media",
    onlineFriends: "FRIENDS",
    accessibility: "Accessibility",
    accessibilityDesc: "Make your PS5 more usable for you.",
    trophies: "Trophies",
    totalPrefix: "Total",
    levelPrefix: "Level",
    consoleStorage: "Console Storage",
    storeFeaturedTitle: "PlayStation Store",
    storeFeaturedSub: "Featured releases & system showcase",
    wishlistTitle: "Wishlist",
    wishlistSub: "Featured PS5 selections and collections",
    friendActivityTitle: "Activity",
    friendActivitySub: "Recent events and system updates",
    mediaGalleryTitle: "Media Gallery",
    mediaGallerySub: "4K HDR captures and video clips",
    networkStatusTitle: "Network Status",
    networkStatusSub: "PlayStation Network · Status unverified",
    trophyProgressTitle: "Trophy Progress",
    trophyProgressSub: "Recent achievements & earned trophies",
    storageFreeHint: "158 GB free · M.2 NVMe ready",
    wishlistCount: "3 games",
    wishlistDiscountHint: "2 active sales in PS Store",
    playCta: "Play",
    openCta: "Open",
    backHome: "Home Screen",
    scrollHubCue: "Press ↓ or scroll down for Game Hub",
    activitiesTitle: "Activities",
    activitiesBadge: "PS5 Activity Cards",
    newsTitle: "Official News",
    newsBadge: "Updates",
    trophiesProjectTitle: "Trophies",
    trophiesProjectBadge: "PlayStation Network",
    ccCurrentTag: "CURRENTLY SELECTED",
    ccResumeBtn: "Resume",
    ccMusicTag: "PS5 MUSIC",
    ccMusicTitle: "PS5 Ambient Synth",
    ccMusicArtist: "Emaj9 Menu Soundtrack",
    ccNetworkTag: "GAME BASE & NETWORK",
    ccNetworkSub: "PlayStation Network: All services operational",
    ccProfileBtn: "Profile",
    searchPlaceholder: "Search games, sections, and settings…",
    settingsTag: "PLAYSTATION 5 SYSTEM SOFTWARE",
    settingsTitle: "Settings",
    settingsSub: "System shell preferences",
    hintSelect: "Select",
    hintBack: "Back",
    hintSearch: "Search",
    hintHub: "Game Hub",
    hintCC: "Control Center",
    hintTab: "Switch Tab",
    editWidgets: "Customize Widgets",
    powerRest: "Enter Rest Mode",
    powerRestSub: "Charge controllers and download updates in low-power mode.",
    powerOff: "Turn Off PS5",
    powerOffSub: "Close all games and turn off the console.",
    powerRestart: "Restart PS5",
    powerRestartSub: "Restart the PlayStation 5 system software."
  }
};

export const welcomeHubFriends = [];

export const defaultProfileTelemetry = {
  accountName: "PlayStation®5",
  level: 100,
  progressPct: 48,
  trophies: { platinum: 12, gold: 48, silver: 126, bronze: 384 },
  totalTrophies: 570
};

export const ribbonCatalog = {
  games: [
    {
      id: "welcome",
      viewType: "welcome",
      tileStyle: "welcome",
      iconSvg: PS5Icons.welcomeGlyphs,
      title: { ru: "Центр приветствия", en: "Welcome" },
      publisher: "PlayStation 5 System Software",
      kicker: { ru: "PS5 Welcome Hub", en: "PS5 Welcome Hub" },
      desc: {
        ru: "Персонализируемый экран состояния консоли с горизонтальной лентой виджетов.",
        en: "Customizable PS5 home dashboard with horizontally scrollable widgets."
      },
      ctaText: { ru: "Обзор профиля", en: "Profile Overview" },
      btnAction: "modal:psn",
      bg: "assets/bg_monica.jpg",
      thumb: PS5Icons.makeSceneArt("ps5-eco", "WELCOME HUB")
    },
    {
      id: "store",
      viewType: "game",
      tileStyle: "store",
      iconSvg: PS5Icons.psStoreBag,
      title: { ru: "PlayStation Store", en: "PlayStation Store" },
      publisher: "Sony Interactive Entertainment",
      kicker: { ru: "PlayStation™Store · Витрина", en: "PlayStation™Store · Showcase" },
      desc: {
        ru: "Цифровой магазин PlayStation 5: ключевые релизы, коллекции и интерактивные карточки.",
        en: "Explore flagship PS5 releases, digital collections, and interactive showcases."
      },
      ctaText: { ru: "Открыть витрину", en: "Browse Store" },
      btnAction: "modal:library",
      secText: { ru: "Обзор", en: "Explore" },
      secAction: "modal:library",
      bg: PS5Icons.makeSceneArt("store", "PLAYSTATION STORE"),
      thumb: PS5Icons.makeSceneArt("store", "PS STORE"),
      progressPct: 84,
      trophies: { platinum: 12, gold: 48, silver: 126, bronze: 384 },
      activities: [
        { title: "Подборка релизов PS5", type: "Витрина", progress: 100, timeEst: "4K HDR", thumb: PS5Icons.makeSceneArt("store"), action: "modal:library" },
        { title: "Новинки и скидки PS Store", type: "Распродажа", progress: 100, timeEst: "Скидки до -60%", thumb: PS5Icons.makeSceneArt("store"), action: "modal:library" }
      ],
      news: [
        { date: "PS Store", title: "Витрина 4K HDR", desc: "Главные релизы и эксклюзивы консоли PlayStation 5." }
      ]
    },
    {
      id: "gta-vc",
      viewType: "game",
      title: { ru: "Grand Theft Auto: Vice City", en: "Grand Theft Auto: Vice City" },
      publisher: "Rockstar Games • reVC WASM Engine",
      kicker: { ru: "WASM Arcade · 1986 Vice City", en: "WASM Arcade · 1986 Vice City" },
      desc: {
        ru: "Культовая классика Rockstar Games в браузере: Томми Версетти, неоновый особняк, пляжи Вайс-Сити и легендарные радиостанции Flash FM и Wave 103 на движке reVC.",
        en: "Rockstar Games cult classic running in browser via reVC WebAssembly engine: Tommy Vercetti, neon mansion, Vice City beaches, and legendary radio stations."
      },
      ctaText: { ru: "Играть", en: "Play" },
      btnAction: "launch:gta-vc",
      secText: { ru: "Подробнее", en: "Details" },
      secAction: "modal:library",
      bg: "assets/wallpapers/gta_vc_bg.jpg",
      thumb: "assets/covers/gta_vc.jpg",
      fallbackBg: PS5Icons.makeSceneArt("slot-1", "VICE CITY"),
      progressPct: 65,
      playTime: "reVC WASM • 60 FPS",
      trophies: { platinum: 1, gold: 3, silver: 8, bronze: 22 },
      activities: [
        { title: "Захват особняка Версетти", type: "Миссия сюжета", progress: 65, timeEst: "Миссия", thumb: "assets/covers/gta_vc.jpg", action: "launch:gta-vc" },
        { title: "Радиостанция Wave 103", type: "Саундтрек 80-х", progress: 100, timeEst: "Синтезаторы", thumb: "assets/covers/gta_vc.jpg", action: "launch:gta-vc" }
      ],
      news: [
        { date: "reVC WASM", title: "Поддержка геймпада DualSense", desc: "Управление полностью адаптировано под стики и кнопки контроллера PlayStation." }
      ]
    },
    {
      id: "gta-v",
      viewType: "game",
      title: { ru: "Grand Theft Auto V", en: "Grand Theft Auto V" },
      publisher: "Rockstar Games • WebGPU & WASM Port",
      kicker: { ru: "WebGPU Arcade · Los Santos", en: "WebGPU Arcade · Los Santos" },
      desc: {
        ru: "Масштабный мир Лос-Сантоса и округа Блейн: Майкл, Франклин и Тревор с оптимизацией шейдеров и текстур под современные браузеры.",
        en: "The expansive world of Los Santos and Blaine County: Michael, Franklin, and Trevor with shader and texture optimization for modern browsers."
      },
      ctaText: { ru: "Играть", en: "Play" },
      btnAction: "launch:gta-v",
      secText: { ru: "Подробнее", en: "Details" },
      secAction: "modal:library",
      bg: "assets/wallpapers/gta_v_bg.jpg",
      thumb: "assets/covers/gta_v.jpg",
      fallbackBg: PS5Icons.makeSceneArt("slot-2", "GTA V"),
      progressPct: 78,
      playTime: "WebGPU • 60 FPS",
      trophies: { platinum: 1, gold: 4, silver: 12, bronze: 32 },
      activities: [
        { title: "Ограбление в Палето-Бэй", type: "Сюжетная кампания", progress: 78, timeEst: "Глава 5", thumb: "assets/covers/gta_v.jpg", action: "launch:gta-v" },
        { title: "Прыжки с парашютом над Чилиад", type: "Экстрим", progress: 100, timeEst: "Завершено", thumb: "assets/covers/gta_v.jpg", action: "launch:gta-v" }
      ],
      news: [
        { date: "WebGPU RAGE", title: "Трассировка лучей и 60 FPS", desc: "Современный графический конвейер WebGPU обеспечивает плавный рендеринг Лос-Сантоса." }
      ]
    },
    {
      id: "nfs-u2",
      viewType: "game",
      title: { ru: "Need for Speed: Underground 2", en: "Need for Speed: Underground 2" },
      publisher: "EA Black Box • NFSU2Recomp WebAssembly",
      kicker: { ru: "WASM Racing · Bayview", en: "WASM Racing · Bayview" },
      desc: {
        ru: "Ночной Бэйвью, культовый саундтрек Riders on the Storm, неоновый тюнинг легендарного Nissan 350Z и уличные гонки прямо в окне консоли.",
        en: "Nighttime Bayview, iconic soundtrack, neon tuning of the Nissan 350Z, and street racing in the browser shell."
      },
      ctaText: { ru: "Играть", en: "Play" },
      btnAction: "launch:nfs-u2",
      secText: { ru: "Подробнее", en: "Details" },
      secAction: "modal:library",
      bg: "assets/wallpapers/nfs_u2_bg.jpg",
      thumb: "assets/covers/nfs_u2.jpg",
      fallbackBg: PS5Icons.makeSceneArt("slot-3", "NFSU2"),
      progressPct: 54,
      playTime: "NFSU2 WASM • 60 FPS",
      trophies: { platinum: 0, gold: 2, silver: 7, bronze: 18 },
      activities: [
        { title: "Гонки URL на автодроме", type: "Подземная лига", progress: 54, timeEst: "Этап 3", thumb: "assets/covers/nfs_u2.jpg", action: "launch:nfs-u2" },
        { title: "Тюнинг ателье Snoop Dogg", type: "Стайлинг", progress: 100, timeEst: "Рейтинг 10★", thumb: "assets/covers/nfs_u2.jpg", action: "launch:nfs-u2" }
      ],
      news: [
        { date: "NFSU2Recomp", title: "Поддержка аналоговых триггеров", desc: "Газ и тормоз плавно дозируются курками L2/R2 контроллера DualSense." }
      ]
    },
    {
      id: "simpsons",
      viewType: "game",
      title: { ru: "The Simpsons: Hit & Run", en: "The Simpsons: Hit & Run" },
      publisher: "Radical Entertainment • WASM Sandbox",
      kicker: { ru: "WASM Sandbox · Springfield", en: "WASM Sandbox · Springfield" },
      desc: {
        ru: "Знаменитый открытый мир Спрингфилда: Гомер, Мардж, Барт и Лиза выполняют безумные миссии на культовых машинах города.",
        en: "The open world of Springfield: Homer, Marge, Bart, and Lisa take on wild missions in iconic cartoon rides."
      },
      ctaText: { ru: "Играть", en: "Play" },
      btnAction: "launch:simpsons",
      secText: { ru: "Подробнее", en: "Details" },
      secAction: "modal:library",
      bg: "assets/wallpapers/simpsons_bg.jpg",
      thumb: "assets/covers/simpsons.png",
      fallbackBg: PS5Icons.makeSceneArt("slot-1", "SIMPSONS"),
      progressPct: 42,
      playTime: "WASM Sandbox • 60 FPS",
      trophies: { platinum: 0, gold: 1, silver: 5, bronze: 14 },
      activities: [
        { title: "Миссии Гомера Симпсона", type: "Уровень 1", progress: 42, timeEst: "Миссия 5", thumb: "assets/covers/simpsons.png", action: "launch:simpsons" },
        { title: "Сбор карточек коллекционера", type: "Секреты", progress: 80, timeEst: "Спрингфилд", thumb: "assets/covers/simpsons.png", action: "launch:simpsons" }
      ],
      news: [
        { date: "WASM Sandbox", title: "Оригинальная озвучка персонажей", desc: "Все реплики Гомера, Барта и мистера Бёрнса сохранены в оригинальном качестве." }
      ]
    },
    {
      id: "doom-classic",
      viewType: "game",
      title: { ru: "DOOM (1993)", en: "DOOM (1993)" },
      publisher: "id Software • Classic WASM FPS Engine",
      kicker: { ru: "WASM Classic FPS · Phobos", en: "WASM Classic FPS · Phobos" },
      desc: {
        ru: "Легендарный шутер от первого лица, определивший жанр: космический десантник, адские легионы на Фобосе и канонический саундтрек E1M1.",
        en: "The legendary first-person shooter that defined the genre: Doomguy, hellspawn on Phobos, and the iconic E1M1 soundtrack."
      },
      ctaText: { ru: "Играть", en: "Play" },
      btnAction: "launch:doom-classic",
      secText: { ru: "Подробнее", en: "Details" },
      secAction: "modal:library",
      bg: "assets/wallpapers/doom_bg.jpg",
      thumb: "assets/covers/doom.jpg",
      fallbackBg: PS5Icons.makeSceneArt("slot-2", "DOOM"),
      progressPct: 90,
      playTime: "id Tech 1 WASM • 60 FPS",
      trophies: { platinum: 1, gold: 3, silver: 6, bronze: 20 },
      activities: [
        { title: "Knee-Deep in the Dead (E1M1)", type: "Эпизод 1", progress: 90, timeEst: "Фобос", thumb: "assets/covers/doom.jpg", action: "launch:doom-classic" },
        { title: "Секретные зоны E1M8", type: "Испытание", progress: 100, timeEst: "BFG 9000", thumb: "assets/covers/doom.jpg", action: "launch:doom-classic" }
      ],
      news: [
        { date: "id Tech WASM", title: "E1M1 Саундтрек в MIDI / SoundFont", desc: "Поддержка высококачественного синтезатора Roland Sound Canvas." }
      ]
    },
    {
      id: "library",
      viewType: "game",
      tileStyle: "dark",
      iconSvg: PS5Icons.gameLibraryTile,
      title: { ru: "Библиотека игр", en: "Game Library" },
      publisher: "PlayStation®5 System Software",
      kicker: { ru: "Вся коллекция оболочки", en: "Full Shell Collection" },
      desc: {
        ru: "Ваша коллекция браузерных портов: GTA Vice City, GTA V, NFS Underground 2, Quake 3, DOOM, Simpsons, Minecraft.",
        en: "Playable browser collection: GTA Vice City, GTA V, NFS Underground 2, Quake 3, DOOM, Simpsons, Minecraft."
      },
      ctaText: { ru: "Открыть библиотеку", en: "Open Library" },
      btnAction: "modal:library",
      secText: { ru: "Профиль", en: "Profile" },
      secAction: "modal:psn",
      bg: PS5Icons.makeSceneArt("explore", "GAME LIBRARY"),
      thumb: PS5Icons.makeSceneArt("explore", "LIBRARY"),
      progressPct: 100,
      playTime: "Коллекция",
      trophies: { platinum: 0, gold: 0, silver: 0, bronze: 0 },
      activities: [
        { title: "Открыть каталог оболочки", type: "Библиотека", progress: 100, timeEst: "Все разделы", thumb: PS5Icons.makeSceneArt("explore"), action: "modal:library" }
      ],
      news: [
        { date: "Система", title: "Библиотека готова", desc: "Наполняется автоматически из конфигурации ленты." }
      ]
    }
  ],

  media: [
    {
      id: "ps5-media-audio",
      viewType: "game",
      title: { ru: "Музыка PS5 · Ambient Synth", en: "PS5 Music · Ambient Synth" },
      publisher: "Web Audio API Synthesizer",
      kicker: { ru: "Встроенный звуковой движок · Emaj9", en: "Built-in Audio Engine · Emaj9" },
      desc: {
        ru: "Генеративная эмбиент-музыка системного меню PlayStation 5 и тактильные звуки навигации интерфейса.",
        en: "Real-time PlayStation 5 ambient menu soundtrack with tactile UI feedback sounds."
      },
      ctaText: { ru: "Включить / Пауза", en: "Play / Pause" },
      btnAction: "toggle:ambient",
      secText: { ru: "Control Center", en: "Control Center" },
      secAction: "open:cc",
      bg: PS5Icons.makeSceneArt("audio-slot", "TEMPEST 3D AUDIO"),
      thumb: PS5Icons.makeSceneArt("audio-slot", "MUSIC"),
      progressPct: 100,
      playTime: "Tempest 3D Audio",
      trophies: { platinum: 0, gold: 0, silver: 0, bronze: 0 },
      activities: [
        { title: "Запустить эмбиент-синтезатор", type: "Аудиосистема", progress: 100, timeEst: "Web Audio API", thumb: PS5Icons.makeSceneArt("audio-slot"), action: "toggle:ambient" }
      ],
      news: [
        { date: "Audio", title: "Звук меню без внешних файлов", desc: "Плавное звучание Emaj9 с фильтрацией низких частот." }
      ]
    },
    {
      id: "media-gallery",
      viewType: "game",
      title: { ru: "Галерея мультимедиа", en: "Media Gallery" },
      publisher: "PlayStation®5 System Software",
      kicker: { ru: "Снимки экрана и клипы · 4K HDR", en: "Screenshots & Clips · 4K HDR" },
      desc: {
        ru: "Снимки экрана, 4K HDR видеоклипы и запечатленные трофейные моменты.",
        en: "Screenshots, 4K HDR video clips and captured trophy moments."
      },
      ctaText: { ru: "Открыть галерею", en: "Open Gallery" },
      btnAction: "modal:media-gallery",
      secText: { ru: "К играм", en: "Games Tab" },
      secAction: "home_reset",
      bg: PS5Icons.makeSceneArt("media-slot", "MEDIA GALLERY"),
      thumb: PS5Icons.makeSceneArt("media-slot", "HD"),
      progressPct: 100,
      playTime: "4K HDR",
      trophies: { platinum: 0, gold: 0, silver: 0, bronze: 0 },
      activities: [
        { title: "Альбом снимков экрана", type: "Медиа", progress: 100, timeEst: "4K HDR", thumb: PS5Icons.makeSceneArt("media-slot"), action: "modal:media-gallery" }
      ],
      news: [
        { date: "Media", title: "Галерея медиа", desc: "Просматривайте снимки экрана и записанные видеоролики игр." }
      ],
      modalData: {
        badge: "MEDIA GALLERY",
        title: "Галерея мультимедиа",
        subtitle: "Снимки экрана и видеоклипы 4K HDR",
        content: `<p class="modal-p">Коллекция снимков экрана 4K HDR, трофейных скриншотов и видеозаписей игрового процесса.</p>`,
        actions: []
      }
    },
    {
      id: "youtube",
      viewType: "game",
      title: { ru: "YouTube", en: "YouTube" },
      publisher: "Google LLC",
      kicker: { ru: "Медиасервис · 4K HDR 60 FPS", en: "Media Service · 4K HDR 60 FPS" },
      desc: {
        ru: "Смотрите любимые игровые каналы, прямые трансляции, руководства по прохождению и трейлеры в максимальном качестве 4K HDR.",
        en: "Watch your favorite gaming creators, live streams, game walkthroughs, and official 4K HDR trailers."
      },
      ctaText: { ru: "Запустить", en: "Start" },
      btnAction: "open:youtube",
      secText: { ru: "В браузер", en: "Browser" },
      secAction: "open:youtube",
      iconSvg: PS5Icons.youtubeTile,
      bg: PS5Icons.makeSceneArt("media-slot", "YOUTUBE 4K"),
      thumb: PS5Icons.makeSceneArt("media-slot", "YOUTUBE"),
      progressPct: 100,
      playTime: "Приложение PS5",
      trophies: { platinum: 0, gold: 0, silver: 0, bronze: 0 },
      activities: [
        { title: "Рекомендованные стримы", type: "Прямой эфир", progress: 100, timeEst: "Онлайн", thumb: PS5Icons.makeSceneArt("media-slot"), action: "open:youtube" },
        { title: "Официальные трейлеры PlayStation", type: "Канал PS", progress: 100, timeEst: "4K HDR", thumb: PS5Icons.makeSceneArt("slot-1"), action: "open:youtube" }
      ],
      news: [
        { date: "YouTube PS5", title: "Поддержка пространственного звука", desc: "Смотрите видео со звуком 3D Tempest Audio на совместимых наушниках." }
      ]
    },
    {
      id: "twitch",
      viewType: "game",
      title: { ru: "Twitch", en: "Twitch" },
      publisher: "Twitch Interactive, Inc.",
      kicker: { ru: "Прямые трансляции · Киберспорт", en: "Live Streams · Esports" },
      desc: {
        ru: "Смотрите прямые эфиры лучших стримеров, турниры PlayStation Tournaments и общайтесь с игровым сообществом в реальном времени.",
        en: "Watch top streamers live, follow PlayStation Tournaments, and chat with millions of gamers in real time."
      },
      ctaText: { ru: "Запустить", en: "Start" },
      btnAction: "open:twitch",
      secText: { ru: "К играм", en: "Games Tab" },
      secAction: "home_reset",
      iconSvg: PS5Icons.twitchTile,
      bg: PS5Icons.makeSceneArt("slot-2", "TWITCH LIVE"),
      thumb: PS5Icons.makeSceneArt("slot-2", "TWITCH"),
      progressPct: 100,
      playTime: "Приложение PS5",
      trophies: { platinum: 0, gold: 0, silver: 0, bronze: 0 },
      activities: [
        { title: "Популярные трансляции", type: "Трансляция", progress: 100, timeEst: "В эфире", thumb: PS5Icons.makeSceneArt("slot-2"), action: "open:twitch" }
      ],
      news: [
        { date: "Twitch PS5", title: "Трансляция прямо с консоли", desc: "Нажмите кнопку Create на контроллере DualSense, чтобы мгновенно начать свой стрим." }
      ]
    }
  ]
};

export const settingsSections = [
  {
    id: "accounts",
    title: { ru: "Пользователи и учетные записи", en: "Users and Accounts" },
    icon: PS5Icons.profile,
    items: [
      { label: { ru: "Активная учетная запись", en: "Active Account" }, val: "Player 1 (PS5)", action: "modal:psn" },
      { label: { ru: "Сетевой статус", en: "Online Status" }, val: { ru: "Статус не проверен · PSN", en: "Status unverified · PSN" } }
    ]
  },
  {
    id: "language",
    title: { ru: "Язык и Интерфейс", en: "Language & UI Mode" },
    icon: PS5Icons.globe,
    items: [
      { label: { ru: "Язык системной оболочки", en: "System Shell Language" }, val: { ru: "Русский (PS5 OS)", en: "English (PS5 OS)" }, toggle: "lang" },
      { label: { ru: "Анимация частиц и волн", en: "5D Background Particles" }, val: { ru: "Активно (Canvas 60 FPS)", en: "Active (Canvas 60 FPS)" }, toggle: "particles" }
    ]
  },
  {
    id: "storage",
    title: { ru: "Память", en: "Storage" },
    icon: PS5Icons.storage,
    items: [
      { label: { ru: "Хранилище консоли (SSD)", en: "Console Storage (SSD)" }, val: "667.2 GB / 825 GB" },
      { label: { ru: "Свободное пространство", en: "Free Space" }, val: "157.8 GB" }
    ]
  },
  {
    id: "sound",
    title: { ru: "Звук", en: "Sound" },
    icon: PS5Icons.soundOn,
    items: [
      { label: { ru: "Фоновая музыка меню (PS5 Ambient Synth)", en: "Home Screen Music (PS5 Ambient Synth)" }, val: "Emaj9 / Bmaj Generative", toggle: "ambient" },
      { label: { ru: "Системные звуки (System Sounds)", en: "System Sounds (PS5 System Effects)" }, val: { ru: "Оригинальные звуки интерфейса", en: "Original System Audio" }, toggle: "system_sounds" },
      { label: { ru: "Громкость навигации (Navigation Volume)", en: "Navigation Volume (Focus Move)" }, val: "75%", slider: "nav_vol" },
      { label: { ru: "Громкость интерфейса (Interface Volume)", en: "Interface Volume (Enter / Cancel / Modals)" }, val: "80%", slider: "ui_vol" },
      { label: { ru: "Громкость уведомлений (Notification Volume)", en: "Notification Volume (Toasts / Trophies)" }, val: "90%", slider: "notif_vol" },
      { label: { ru: "Проверка звука (Test Sound)", en: "Test Sound (Diagnostics)" }, val: { ru: "Воспроизвести тестовый сигнал", en: "Play Test Sound" }, action: "test_sound" }
    ]
  },
  {
    id: "accessories",
    title: { ru: "Аксессуары", en: "Accessories" },
    icon: PS5Icons.controller,
    items: [
      { label: { ru: "Беспроводной контроллер DualSense (Белый)", en: "DualSense Wireless Controller (White)" }, val: "86% · Bluetooth" },
      { label: { ru: "Беспроводной контроллер DualSense (Midnight Black)", en: "DualSense Wireless Controller (Midnight Black)" }, val: "32% · Требуется зарядка" },
      { label: { ru: "Беспроводные наушники PULSE Explore", en: "PULSE Explore Wireless Earbuds" }, val: "91% · Tempest 3D Audio" }
    ]
  },
  {
    id: "remote",
    title: { ru: "Дистанционная игра", en: "Remote Play" },
    icon: PS5Icons.controller,
    items: [
      { label: { ru: "Разрешить дистанционную игру", en: "Enable Remote Play" }, val: { ru: "Включено (1080p 60 FPS)", en: "Enabled (1080p 60 FPS)" } },
      { label: { ru: "Подключенные устройства", en: "Connected Devices" }, val: "PlayStation Portal · iPhone 15 Pro", action: "modal:remote_play" },
      { label: { ru: "Качество потоковой передачи", en: "Streaming Quality" }, val: "Высокое (HDR 60fps)" }
    ]
  },
  {
    id: "system",
    title: { ru: "Система", en: "System" },
    icon: PS5Icons.info,
    items: [
      { label: { ru: "Системное ПО", en: "System Software" }, val: "PlayStation®5 UI Shell" },
      { label: { ru: "Режим", en: "Mode" }, val: "PlayStation®5 Dashboard" }
    ]
  }
];

export const controlCenterItems = [
  { id: "cc-home", icon: PS5Icons.home, label: { ru: "Начало", en: "Home" }, action: "home" },
  { id: "cc-switcher", icon: PS5Icons.switcher, label: { ru: "Переключатель", en: "Switcher" }, action: "switcher" },
  { id: "cc-notifications", icon: PS5Icons.notifications, label: { ru: "Уведомления", en: "Notifications" }, action: "notifications" },
  { id: "cc-gamebase", icon: PS5Icons.gamebase, label: { ru: "Game Base", en: "Game Base" }, action: "gamebase" },
  { id: "cc-music", icon: PS5Icons.music, label: { ru: "Музыка", en: "Music" }, action: "music" },
  { id: "cc-sound", icon: PS5Icons.soundOn, label: { ru: "Звук", en: "Sound" }, action: "sound" },
  { id: "cc-mic", icon: PS5Icons.mic, label: { ru: "Микрофон", en: "Mic" }, action: "mic" },
  { id: "cc-accessories", icon: PS5Icons.controller, label: { ru: "Аксессуары", en: "Accessories" }, action: "accessories" },
  { id: "cc-profile", icon: PS5Icons.profile, label: { ru: "Профиль", en: "Profile" }, action: "modal:psn" },
  { id: "cc-power", icon: PS5Icons.power, label: { ru: "Питание", en: "Power" }, action: "power" }
];

export const searchCatalog = [
  { title: "Центр приветствия (Welcome Hub)", category: "Система", desc: "Горизонтальная лента виджетов PS5", action: "home_reset" },
  { title: "Grand Theft Auto: Vice City", category: "WASM", desc: "Культовая классика в Вайс-Сити 1986 года", action: "launch:gta-vc" },
  { title: "Grand Theft Auto V", category: "WebGPU", desc: "Лос-Сантос и округ Блейн на движке RAGE", action: "launch:gta-v" },
  { title: "Need for Speed: Underground 2", category: "WASM", desc: "Ночной Бэйвью и тюнинг Nissan 350Z", action: "launch:nfs-u2" },
  { title: "The Simpsons: Hit & Run", category: "WASM", desc: "Открытый мир Спрингфилда и миссии Гомера", action: "launch:simpsons" },
  { title: "DOOM (1993)", category: "WASM", desc: "Канонический шутер id Software на Фобосе", action: "launch:doom-classic" },
  { title: "PlayStation Store", category: "Витрина", desc: "Каталог и демонстрационные разделы", action: "modal:library" },
  { title: "Библиотека игр", category: "Система", desc: "Каталог из 8 браузерных портов", action: "modal:library" },
  { title: "Профиль и призы", category: "PSN", desc: "Системная статистика профиля", action: "modal:psn" },
  { title: "Настройки системы", category: "Система", desc: "Язык, звук, память и аксессуары", action: "open:settings" }
];

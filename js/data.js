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
    onlineFriends: "Друзья в сети",
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
    networkStatusSub: "PlayStation Network · Все службы работают",
    slotWidgetTitle: "Свободный виджет",
    slotWidgetSub: "Место для новой карточки Welcome Hub",
    playCta: "Открыть",
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
    onlineFriends: "Online Friends",
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
    networkStatusSub: "PlayStation Network · All services operational",
    slotWidgetTitle: "Custom Widget Slot",
    slotWidgetSub: "Ready for new Welcome Hub content",
    playCta: "Open",
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

export const welcomeHubFriends = [
  { name: "Zane Richardsons", initials: "ZR", color: "#3b82f6", status: "Online", game: "ASTRO BOT" },
  { name: "Space_Carrot10", initials: "SC", color: "#22c55e", status: "Online", game: "Marvel's Spider-Man 2" },
  { name: "DRJuiceXI", initials: "DJ", color: "#f59e0b", status: "Online", game: "Cyberpunk 2077" },
  { name: "Elisa Woods", initials: "EW", color: "#ec4899", status: "Online", game: "Elden Ring" }
];

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
      id: "psplus",
      viewType: "game",
      isPeekLeft: true,
      tileStyle: "dark",
      iconSvg: PS5Icons.psPlusCross,
      title: { ru: "PlayStation Plus", en: "PlayStation Plus" },
      publisher: "Sony Interactive Entertainment",
      kicker: { ru: "PlayStation®Plus · Подписка", en: "PlayStation®Plus · Membership" },
      desc: {
        ru: "Каталог игр PS5 и PS4, облачное хранилище сохранений и ежемесячные подборки.",
        en: "Discover hundreds of PS5 and PS4 titles, monthly games, and cloud storage."
      },
      ctaText: { ru: "Открыть каталог", en: "View Catalog" },
      btnAction: "modal:library",
      secText: { ru: "Профиль", en: "Profile" },
      secAction: "modal:psn",
      bg: PS5Icons.makeSceneArt("store", "PLAYSTATION PLUS"),
      thumb: PS5Icons.makeSceneArt("store", "PS PLUS"),
      progressPct: 100,
      trophies: { platinum: 12, gold: 48, silver: 126, bronze: 384 },
      activities: [
        { title: "Каталог PlayStation Plus", type: "Подписка", progress: 100, timeEst: "PS5 / PS4", thumb: PS5Icons.makeSceneArt("store"), action: "modal:library" },
        { title: "Игровой профиль", type: "PlayStation Network", progress: 100, timeEst: "Уровень 100", thumb: PS5Icons.makeSceneArt("ps5-eco"), action: "modal:psn" }
      ],
      news: [
        { date: "PS Plus", title: "Облачное хранилище активно", desc: "Автоматическая синхронизация прогресса и сохранений консоли." }
      ]
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
      secAction: "open:explore",
      bg: PS5Icons.makeSceneArt("store", "PLAYSTATION STORE"),
      thumb: PS5Icons.makeSceneArt("store", "PS STORE"),
      progressPct: 84,
      trophies: { platinum: 12, gold: 48, silver: 126, bronze: 384 },
      activities: [
        { title: "Подборка релизов PS5", type: "Витрина", progress: 100, timeEst: "4K HDR", thumb: PS5Icons.makeSceneArt("store"), action: "modal:library" },
        { title: "Слот для нового раздела", type: "Шаблон карточки", progress: 0, timeEst: "Готово к заполнению", thumb: PS5Icons.makeSceneArt("slot-1"), action: "modal:slot-1" }
      ],
      news: [
        { date: "PS Store", title: "Витрина 4K HDR", desc: "Чистый макет витрины PS5, готовый к наполнению вашим контентом." }
      ]
    },
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
      id: "slot-01",
      viewType: "game",
      title: { ru: "Раздел 01 · Шаблон", en: "Section 01 · Template" },
      publisher: "PlayStation®5 UI Slot",
      kicker: { ru: "PlayStation®5 · Пользовательский слот 01", en: "PlayStation®5 · Custom Slot 01" },
      desc: {
        ru: "Пустой модульный слот для добавления вашего главного раздела, заголовка, описания и ключевых карточек.",
        en: "Clean modular slot ready for your primary section title, description, and activity cards."
      },
      ctaText: { ru: "Открыть шаблон", en: "Open Slot" },
      btnAction: "modal:slot-1",
      secText: { ru: "Настройки", en: "Settings" },
      secAction: "open:settings",
      bg: PS5Icons.makeSceneArt("slot-1", "SLOT 01"),
      thumb: PS5Icons.makeSceneArt("slot-1", "01"),
      progressPct: 100,
      playTime: "Шаблон 01",
      trophies: { platinum: 0, gold: 0, silver: 0, bronze: 0 },
      activities: [
        { title: "Карточка активности 01", type: "Слот контента", progress: 50, timeEst: "Добавьте заголовок", thumb: PS5Icons.makeSceneArt("slot-1"), action: "modal:slot-1" },
        { title: "Карточка активности 02", type: "Слот контента", progress: 25, timeEst: "Добавьте описание", thumb: PS5Icons.makeSceneArt("slot-2"), action: "modal:slot-1" }
      ],
      news: [
        { date: "Слот 01", title: "Готово к наполнению", desc: "Здесь размещаются новости, обновления или анонсы нового раздела." }
      ],
      modalData: {
        badge: "TEMPLATE SLOT · 01",
        title: "Раздел 01 — Шаблон контента",
        subtitle: "Системная карточка оболочки PlayStation®5",
        content: `
          <p class="modal-p">Этот слот полностью очищен и подготовлен для добавления новой информации: текста, ссылок, тегов или характеристик.</p>
          <div class="modal-spec-grid">
            <div class="modal-spec-box"><span class="spec-label">Параметр 1</span><span class="spec-val">Значение (ожидает ввода)</span></div>
            <div class="modal-spec-box"><span class="spec-label">Параметр 2</span><span class="spec-val">Значение (ожидает ввода)</span></div>
          </div>
        `,
        actions: []
      }
    },
    {
      id: "slot-02",
      viewType: "game",
      title: { ru: "Раздел 02 · Шаблон", en: "Section 02 · Template" },
      publisher: "PlayStation®5 UI Slot",
      kicker: { ru: "PlayStation®5 · Пользовательский слот 02", en: "PlayStation®5 · Custom Slot 02" },
      desc: {
        ru: "Второй чистый экран оболочки в стиле PS5 для нового направления, коллекции или описания.",
        en: "Second clean PS5 shell screen ready for new content or collections."
      },
      ctaText: { ru: "Открыть шаблон", en: "Open Slot" },
      btnAction: "modal:slot-2",
      secText: { ru: "Библиотека", en: "Library" },
      secAction: "modal:library",
      bg: PS5Icons.makeSceneArt("slot-2", "SLOT 02"),
      thumb: PS5Icons.makeSceneArt("slot-2", "02"),
      progressPct: 75,
      playTime: "Шаблон 02",
      trophies: { platinum: 0, gold: 0, silver: 0, bronze: 0 },
      activities: [
        { title: "Блок информации 01", type: "Слот контента", progress: 75, timeEst: "Шаблон 02", thumb: PS5Icons.makeSceneArt("slot-2"), action: "modal:slot-2" }
      ],
      news: [
        { date: "Слот 02", title: "Чистая структура", desc: "Готово для добавления новых материалов." }
      ],
      modalData: {
        badge: "TEMPLATE SLOT · 02",
        title: "Раздел 02 — Шаблон контента",
        subtitle: "Готовый контейнер для новых данных",
        content: `<p class="modal-p">Замените этот текст в файле <code>js/data.js</code> или скажите, какую информацию сюда добавить.</p>`,
        actions: []
      }
    },
    {
      id: "slot-03",
      viewType: "game",
      title: { ru: "Раздел 03 · Шаблон", en: "Section 03 · Template" },
      publisher: "PlayStation®5 UI Slot",
      kicker: { ru: "PlayStation®5 · Пользовательский слот 03", en: "PlayStation®5 · Custom Slot 03" },
      desc: {
        ru: "Третий чистый экран оболочки PS5 с поддержкой Game Hub, карточек 16:9 и блока новостей.",
        en: "Third clean PS5 shell screen with Game Hub 16:9 activity cards and news grid."
      },
      ctaText: { ru: "Открыть шаблон", en: "Open Slot" },
      btnAction: "modal:slot-3",
      secText: { ru: "В главное меню", en: "Home" },
      secAction: "home_reset",
      bg: PS5Icons.makeSceneArt("slot-3", "SLOT 03"),
      thumb: PS5Icons.makeSceneArt("slot-3", "03"),
      progressPct: 50,
      playTime: "Шаблон 03",
      trophies: { platinum: 0, gold: 0, silver: 0, bronze: 0 },
      activities: [
        { title: "Блок информации 01", type: "Слот контента", progress: 50, timeEst: "Шаблон 03", thumb: PS5Icons.makeSceneArt("slot-3"), action: "modal:slot-3" }
      ],
      news: [
        { date: "Слот 03", title: "Готово к заполнению", desc: "Модульная сетка PS5 без сторонних упоминаний." }
      ],
      modalData: {
        badge: "TEMPLATE SLOT · 03",
        title: "Раздел 03 — Шаблон контента",
        subtitle: "Готовый контейнер для новых данных",
        content: `<p class="modal-p">Пустая карточка шаблона 03 готова к заполнению новым контентом.</p>`,
        actions: []
      }
    },
    {
      id: "spider-man",
      viewType: "game",
      title: { ru: "Marvel's Spider-Man", en: "Marvel's Spider-Man" },
      publisher: "Insomniac Games • Sony Interactive",
      kicker: { ru: "PlayStation®5 · Игровая витрина", en: "PlayStation®5 · Game Showcase" },
      desc: {
        ru: "Демонстрационная карточка игры PlayStation 5: полноэкранный арт-фон, прогресс трофеев и двухуровневый Game Hub.",
        en: "PlayStation 5 game showcase with full-bleed backdrop, trophy progress, and two-tier Game Hub."
      },
      ctaText: { ru: "Обзор игры", en: "Game Details" },
      btnAction: "modal:psn",
      secText: { ru: "Библиотека", en: "Library" },
      secAction: "modal:library",
      bg: "https://image.api.playstation.com/vulcan/img/rnd/202010/2122/19xis9VT5XfnXsLSMkxUjvVd.png",
      thumb: "https://image.api.playstation.com/vulcan/ap/rnd/202011/0402/C784xeOFo2wViCf4m5bxgoeH.png",
      fallbackBg: PS5Icons.makeSceneArt("ps5-eco", "SPIDER-MAN"),
      progressPct: 64,
      playTime: "4K HDR · 60 FPS",
      trophies: { platinum: 1, gold: 4, silver: 12, bronze: 28 },
      activities: [
        { title: "Сюжетная кампания", type: "Основная активность", progress: 64, timeEst: "PS5 Activity Card", thumb: PS5Icons.makeSceneArt("ps5-eco"), action: "modal:psn" },
        { title: "Режим производительности RT", type: "Графика 4K", progress: 100, timeEst: "60 FPS", thumb: PS5Icons.makeSceneArt("store"), action: "modal:psn" }
      ],
      news: [
        { date: "PS5 Demo", title: "Официальная карточка игры", desc: "Эталонный макет игрового хаба с Game Help и лентой событий." }
      ]
    },
    {
      id: "rdr2",
      viewType: "game",
      title: { ru: "Red Dead Redemption 2", en: "Red Dead Redemption 2" },
      publisher: "Rockstar Games",
      kicker: { ru: "PlayStation®5 · Игровая витрина", en: "PlayStation®5 · Game Showcase" },
      desc: {
        ru: "Демонстрационный игровой экран с виньеткой фона, кнопкой запуска и горизонтальными карточками активностей в Game Hub.",
        en: "Sample game screen featuring dark vignette backdrop, Play CTA, and horizontal activity cards."
      },
      ctaText: { ru: "Обзор игры", en: "Game Details" },
      btnAction: "modal:psn",
      secText: { ru: "Библиотека", en: "Library" },
      secAction: "modal:library",
      bg: "https://image.api.playstation.com/gs2-sec/appkgo/prod/CUSA08519_00/12/i_3da1cf7c41dc7652f9b639e1680d96436773658668c7dc3930c441291095713b/i/pic0.png",
      thumb: "https://image.api.playstation.com/gs2-sec/appkgo/prod/CUSA08519_00/12/i_3da1cf7c41dc7652f9b639e1680d96436773658668c7dc3930c441291095713b/i/icon0.png",
      fallbackBg: PS5Icons.makeSceneArt("wishlist", "RED DEAD REDEMPTION 2"),
      progressPct: 48,
      playTime: "PS4 Pro / PS5",
      trophies: { platinum: 0, gold: 2, silver: 8, bronze: 19 },
      activities: [
        { title: "Глава кампании", type: "Активность", progress: 48, timeEst: "В процессе", thumb: PS5Icons.makeSceneArt("wishlist"), action: "modal:psn" }
      ],
      news: [
        { date: "PS5 Demo", title: "Демонстрационный профиль игры", desc: "Пример оформления страницы игры в системе PlayStation 5." }
      ]
    },
    {
      id: "explore",
      viewType: "explore",
      tileStyle: "dark",
      iconSvg: PS5Icons.exploreTile,
      title: { ru: "Обзор", en: "Explore" },
      publisher: "PlayStation®5 System News",
      kicker: { ru: "Официальные новости PlayStation · Обновлено", en: "Official news from PlayStation · Updated" },
      desc: {
        ru: "Информационная лента и витрина карточек 16:9. Подготовьте собственные заголовки, анонсы или разделы для этой сетки.",
        en: "News hub and 16:9 card showcase. Ready to be populated with your custom headlines and updates."
      },
      bg: PS5Icons.makeSceneArt("explore", "EXPLORE"),
      thumb: PS5Icons.makeSceneArt("explore", "EXPLORE"),
      cards: [
        {
          title: { ru: "Карточка 01 · Шаблон", en: "Card 01 · Template" },
          tag: { ru: "Слот новостей", en: "News Slot" },
          img: PS5Icons.makeSceneArt("slot-1", "CARD 01"),
          action: "modal:slot-1"
        },
        {
          title: { ru: "Карточка 02 · Шаблон", en: "Card 02 · Template" },
          tag: { ru: "Слот витрины", en: "Showcase Slot" },
          img: PS5Icons.makeSceneArt("slot-2", "CARD 02"),
          action: "modal:slot-2"
        },
        {
          title: { ru: "Карточка 03 · Шаблон", en: "Card 03 · Template" },
          tag: { ru: "Слот галереи", en: "Gallery Slot" },
          img: PS5Icons.makeSceneArt("slot-3", "CARD 03"),
          action: "modal:slot-3"
        },
        {
          title: { ru: "Аудиосистема PS5", en: "PS5 Audio Synth" },
          tag: { ru: "Emaj9 Ambient", en: "Emaj9 Ambient" },
          img: PS5Icons.makeSceneArt("audio-slot", "AUDIO"),
          action: "toggle:ambient"
        },
        {
          title: { ru: "Каталог библиотеки", en: "System Library" },
          tag: { ru: "Все элементы", en: "All Items" },
          img: PS5Icons.makeSceneArt("store", "LIBRARY"),
          action: "modal:library"
        }
      ]
    },
    {
      id: "remoteplay",
      viewType: "game",
      tileStyle: "dark",
      iconSvg: PS5Icons.remotePlayTile,
      title: { ru: "PS Remote Play", en: "PS Remote Play" },
      publisher: "Sony Interactive Entertainment",
      kicker: { ru: "Удаленная игра · DualSense", en: "Remote Streaming · DualSense" },
      desc: {
        ru: "Потоковая трансляция игр PlayStation®5 на внешние экраны с минимальной задержкой.",
        en: "Stream your PlayStation®5 console to external displays with low latency."
      },
      ctaText: { ru: "Настройки", en: "Settings" },
      btnAction: "open:settings",
      secText: { ru: "Центр управления", en: "Control Center" },
      secAction: "open:cc",
      bg: PS5Icons.makeSceneArt("media-slot", "PS REMOTE PLAY"),
      thumb: PS5Icons.makeSceneArt("media-slot", "REMOTE"),
      progressPct: 100,
      playTime: "60 FPS HDR",
      trophies: { platinum: 0, gold: 0, silver: 0, bronze: 0 },
      activities: [
        { title: "Подключение контроллера DualSense", type: "Система", progress: 100, timeEst: "Готово", thumb: PS5Icons.makeSceneArt("media-slot"), action: "open:settings" }
      ],
      news: [
        { date: "Remote Play", title: "Системный компонент PS5", desc: "Стандартный модуль оболочки PlayStation." }
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
        ru: "Системный раздел для хранения скриншотов, видеороликов и визуальных материалов.",
        en: "System media gallery placeholder ready for screenshots, trailers, and clips."
      },
      ctaText: { ru: "Открыть шаблон", en: "Open Slot" },
      btnAction: "modal:media-gallery",
      secText: { ru: "К играм", en: "Games Tab" },
      secAction: "home_reset",
      bg: PS5Icons.makeSceneArt("media-slot", "MEDIA GALLERY"),
      thumb: PS5Icons.makeSceneArt("media-slot", "HD"),
      progressPct: 100,
      playTime: "4K HDR",
      trophies: { platinum: 0, gold: 0, silver: 0, bronze: 0 },
      activities: [
        { title: "Альбом снимков экрана", type: "Медиа", progress: 100, timeEst: "Пустой слот", thumb: PS5Icons.makeSceneArt("media-slot"), action: "modal:media-gallery" }
      ],
      news: [
        { date: "Media", title: "Раздел готов к наполнению", desc: "Добавьте собственные скриншоты или видеоролики." }
      ],
      modalData: {
        badge: "MEDIA GALLERY",
        title: "Галерея мультимедиа",
        subtitle: "Пустой шаблон медиа-секции",
        content: `<p class="modal-p">Здесь можно разместить изображения, превью видео или интерактивную фотогалерею.</p>`,
        actions: []
      }
    },
    {
      id: "media-slot-1",
      viewType: "game",
      title: { ru: "Медиа слот 01 · Шаблон", en: "Media Slot 01 · Template" },
      publisher: "PlayStation®5 Media UI",
      kicker: { ru: "Пользовательский медиа-блок", en: "Custom Media Container" },
      desc: {
        ru: "Свободная плитка во вкладке «Медиа» для добавления приложения, видео или страницы.",
        en: "Available tile inside the Media tab for apps, streams, or custom content."
      },
      ctaText: { ru: "Открыть шаблон", en: "Open Slot" },
      btnAction: "modal:media-slot-1",
      secText: { ru: "Настройки", en: "Settings" },
      secAction: "open:settings",
      bg: PS5Icons.makeSceneArt("slot-2", "MEDIA SLOT 01"),
      thumb: PS5Icons.makeSceneArt("slot-2", "02"),
      progressPct: 100,
      playTime: "Шаблон",
      trophies: { platinum: 0, gold: 0, silver: 0, bronze: 0 },
      activities: [
        { title: "Медиа-слот 01", type: "Шаблон", progress: 0, timeEst: "Ожидает контент", thumb: PS5Icons.makeSceneArt("slot-2"), action: "modal:media-slot-1" }
      ],
      news: [
        { date: "Media", title: "Готово к заполнению", desc: "Чистый шаблон без лишних данных." }
      ],
      modalData: {
        badge: "MEDIA SLOT · 01",
        title: "Медиа слот 01",
        subtitle: "Свободный блок вкладки «Медиа»",
        content: `<p class="modal-p">Готово для интеграции нового сервиса, видео или карточки.</p>`,
        actions: []
      }
    },
    {
      id: "media-slot-2",
      viewType: "game",
      title: { ru: "Медиа слот 02 · Шаблон", en: "Media Slot 02 · Template" },
      publisher: "PlayStation®5 Media UI",
      kicker: { ru: "Пользовательский медиа-блок", en: "Custom Media Container" },
      desc: {
        ru: "Дополнительная плитка вкладки «Медиа» для будущего наполнения.",
        en: "Additional Media tab tile ready for future content."
      },
      ctaText: { ru: "Открыть шаблон", en: "Open Slot" },
      btnAction: "modal:media-slot-2",
      secText: { ru: "К играм", en: "Games Tab" },
      secAction: "home_reset",
      bg: PS5Icons.makeSceneArt("slot-3", "MEDIA SLOT 02"),
      thumb: PS5Icons.makeSceneArt("slot-3", "03"),
      progressPct: 100,
      playTime: "Шаблон",
      trophies: { platinum: 0, gold: 0, silver: 0, bronze: 0 },
      activities: [
        { title: "Медиа-слот 02", type: "Шаблон", progress: 0, timeEst: "Ожидает контент", thumb: PS5Icons.makeSceneArt("slot-3"), action: "modal:media-slot-2" }
      ],
      news: [
        { date: "Media", title: "Готово к заполнению", desc: "Чистый шаблон без лишних данных." }
      ],
      modalData: {
        badge: "MEDIA SLOT · 02",
        title: "Медиа слот 02",
        subtitle: "Свободный блок вкладки «Медиа»",
        content: `<p class="modal-p">Готово для добавления нового контента.</p>`,
        actions: []
      }
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
      { label: { ru: "Сетевой статус", en: "Online Status" }, val: "Online · PlayStation Network" }
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
      { label: { ru: "Фоновая музыка меню", en: "Home Screen Music" }, val: "Emaj9 Ambient Synth", toggle: "ambient" },
      { label: { ru: "Звуковые эффекты системы", en: "System Sound Effects" }, val: "Web Audio API Feedback", toggle: "sfx" }
    ]
  },
  {
    id: "accessories",
    title: { ru: "Аксессуары", en: "Accessories" },
    icon: PS5Icons.controller,
    items: [
      { label: { ru: "Беспроводной контроллер DualSense #1", en: "DualSense Wireless Controller #1" }, val: "86% · Bluetooth" },
      { label: { ru: "Беспроводной контроллер DualSense #2", en: "DualSense Wireless Controller #2" }, val: "32% · Требуется зарядка" },
      { label: { ru: "Беспроводные наушники PULSE Explore", en: "PULSE Explore Wireless Earbuds" }, val: "91% · Tempest 3D Audio" }
    ]
  },
  {
    id: "system",
    title: { ru: "Система", en: "System" },
    icon: PS5Icons.info,
    items: [
      { label: { ru: "Системное ПО", en: "System Software" }, val: "PlayStation®5 UI Shell" },
      { label: { ru: "Режим", en: "Mode" }, val: "Clean Design Template" }
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
  { title: "Раздел 01 · Шаблон", category: "Шаблон", desc: "Пустой слот оболочки для нового контента", action: "modal:slot-1" },
  { title: "Раздел 02 · Шаблон", category: "Шаблон", desc: "Пустой слот оболочки для нового контента", action: "modal:slot-2" },
  { title: "Раздел 03 · Шаблон", category: "Шаблон", desc: "Пустой слот оболочки для нового контента", action: "modal:slot-3" },
  { title: "PlayStation Store", category: "Витрина", desc: "Каталог и демонстрационные разделы", action: "modal:library" },
  { title: "Обзор (Explore)", category: "Лента", desc: "Новости и карточки формата 16:9", action: "open:explore" },
  { title: "Профиль и призы", category: "PSN", desc: "Системная статистика профиля", action: "modal:psn" },
  { title: "Настройки системы", category: "Система", desc: "Язык, звук, память и аксессуары", action: "open:settings" }
];

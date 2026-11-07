/**
 * PS5 Welcome Hub — Data Store
 * Все данные персонального хаба Дмитрия (cr1mnsx).
 * Вкладки: "projects" (Проекты) и "link" (Link).
 */

export const bgThemes = [
  {
    id: "ps5-deep-blue",
    name: "PlayStation Deep Blue",
    url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1920&q=80",
    tag: "Оригинальная тема PS5"
  },
  {
    id: "cyber-neon",
    name: "Cyber City & Neon",
    url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80",
    tag: "Неоновый мегаполис"
  },
  {
    id: "dark-workstation",
    name: "Workstation Darkness",
    url: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1920&q=80",
    tag: "Студийный сетап"
  },
  {
    id: "quantum-vr",
    name: "Quantum VR Horizon",
    url: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=1920&q=80",
    tag: "Виртуальное пространство"
  },
  {
    id: "cosmic-console",
    name: "Cosmic Ray Tracing",
    url: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=1920&q=80",
    tag: "Атмосфера некстгена"
  }
];

export const portfolioData = {
  projects: [
    {
      id: "hub-profile",
      title: "Дмитрий (cr1mnsx)",
      badge: "WELCOME HUB",
      tag: "Next-Gen Dashboard • Личный хаб",
      desc: "Персональное интерактивное пространство Дмитрия (cr1mnsx): современные проекты, разработка, экспертиза в 1С:Предприятие, веб-технологии и прямые контакты.",
      btnText: "Обо мне & Стек",
      btnAction: "modal:bio",
      secText: "Скопировать контакт",
      secAction: "copy:vk",
      thumb: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=400&q=80",
      bg: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1920&q=80",
      cards: [
        {
          type: "Информация",
          title: "Профиль cr1mnsx & Биография",
          progress: "Frontend • 1С Консалтинг • UI/UX",
          action: "modal:bio"
        },
        {
          type: "Репозиторий",
          title: "Исходный код на GitHub",
          progress: "github.com/crimnsx-alt",
          link: "https://github.com/crimnsx-alt"
        }
      ],
      modalData: {
        badge: "USER PROFILE • LEVEL 99",
        title: "Дмитрий — Разработчик & Консультант 1С",
        subtitle: "Никнейм: cr1mnsx | Город: Россия | Статус: В сети",
        content: `
          <p class="modal-p">Привет! Я <strong>Дмитрий (cr1mnsx)</strong> — специалист на стыке современного веб-инжиниринга и корпоративных бизнес-систем 1С:Предприятие.</p>
          <div class="modal-spec-grid">
            <div class="modal-spec-box">
              <span class="spec-label">Квалификация</span>
              <span class="spec-val">1С Консультант & Web Dev</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Компания</span>
              <span class="spec-val">КГ «РУНА»</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Интерфейс</span>
              <span class="spec-val">PS5 Welcome Hub Glassmorphism</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Стек</span>
              <span class="spec-val">1С:Предприятие, JS (ESNext), CSS3, Web Audio</span>
            </div>
          </div>
          <p class="modal-p">Интересуюсь созданием высокотехнологичных пользовательских интерфейсов с глубоким погружением (звук, микроанимации, физика переходов), а также комплексным внедрением и оптимизацией конфигураций 1С для реального бизнеса.</p>
        `,
        actions: [
          { text: "Скопировать VK (cr1mnsx)", action: "copy:vk", primary: true },
          { text: "Открыть GitHub", link: "https://github.com/crimnsx-alt", primary: false }
        ]
      }
    },
    {
      id: "career-1c",
      title: "1С Консалтинг & Бизнес",
      badge: "CAREER",
      tag: "КГ «РУНА» • Экспертиза и Учет",
      desc: "Профессиональное развитие в сфере консалтинга и сопровождения систем 1С:Предприятие. Работа с ключевыми клиентами в КГ «РУНА», освоение стандартов УЦ №1 и решение задач автоматизации учета.",
      btnText: "Детали карьеры",
      btnAction: "modal:career",
      secText: "Учебный центр 1С",
      secLink: "https://uc1.1c.ru/",
      thumb: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80",
      bg: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1920&q=80",
      cards: [
        {
          type: "Компания",
          title: "Консалтинговая Группа «РУНА»",
          progress: "Коммуникации, сопровождение и аудит",
          action: "modal:career"
        },
        {
          type: "Квалификация",
          title: "Специализация: Консультант 1С",
          progress: "Сертифицированная база УЦ №1",
          link: "https://uc1.1c.ru/"
        }
      ],
      modalData: {
        badge: "CAREER TRACK • 1C CONSULTING",
        title: "1С:Предприятие — Экспертиза и Консалтинг",
        subtitle: "Практический опыт в КГ «РУНА» & База Учебного Центра №1",
        content: `
          <p class="modal-p">Моя профессиональная деятельность сосредоточена на автоматизации бизнес-процессов, настройке и консультировании пользователей по типовым и отраслевым конфигурациям 1С.</p>
          <div class="modal-spec-grid">
            <div class="modal-spec-box">
              <span class="spec-label">Направление</span>
              <span class="spec-val">Консалтинг и сопровождение</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Обучение</span>
              <span class="spec-val">Учебный Центр №1 1С (Пройдено)</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Фокус</span>
              <span class="spec-val">Анализ учета, регламентные операции</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Формат</span>
              <span class="spec-val">Комплексная клиентская поддержка</span>
            </div>
          </div>
          <p class="modal-p">Умение слушать бизнес-заказчика, выявлять узкие места в ведении учета и предлагать выверенные системные решения на платформе 1С:Предприятие 8.3.</p>
        `,
        actions: [
          { text: "Скопировать контакт для связи", action: "copy:vk", primary: true },
          { text: "Портал УЦ №1", link: "https://uc1.1c.ru/", primary: false }
        ]
      }
    },
    {
      id: "project-vr",
      title: "«По ту сторону яви»",
      badge: "VR 3D",
      tag: "Специальный гость • VR Game Dev",
      desc: "Атмосферный 3D-проект виртуальной реальности нового поколения, создаваемый моей девушкой. Исследование тонких граней восприятия, детализированное окружение и полное погружение.",
      btnText: "Карточка проекта",
      btnAction: "modal:vr",
      secText: "Связаться",
      secAction: "copy:vk",
      thumb: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=400&q=80",
      bg: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=1920&q=80",
      cards: [
        {
          type: "Жанр и Движок",
          title: "3D Virtual Reality Adventure",
          progress: "Интерактивная среда и пространственный звук",
          action: "modal:vr"
        },
        {
          type: "Текущий статус",
          title: "В активном продакшене",
          progress: "Левел-дизайн, освещение и физика взаимодействия",
          action: "modal:vr"
        }
      ],
      modalData: {
        badge: "FEATURED SHOWCASE • VR PROJECT",
        title: "«По ту сторону яви» (VR Experience)",
        subtitle: "Авторский VR-проект: разработка глубокого интерактивного пространства",
        content: `
          <p class="modal-p">Уникальный 3D-проект для виртуальной реальности, разрабатываемый моей девушкой с акцентом на психологическую атмосферу, нарратив окружения и эффект полного присутствия.</p>
          <div class="modal-spec-grid">
            <div class="modal-spec-box">
              <span class="spec-label">Платформа</span>
              <span class="spec-val">VR Headsets (6DOF)</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Атмосфера</span>
              <span class="spec-val">Мистический реализм & Тайна</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Звук</span>
              <span class="spec-val">Binaural 3D Audio</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Статус</span>
              <span class="spec-val">Прототипирование механик</span>
            </div>
          </div>
          <p class="modal-p">Я с радостью поддерживаю проект экспертизой в интерактивных механиках, звуковом оформлении и тестировании ощущений в шлеме виртуальной реальности.</p>
        `,
        actions: [
          { text: "Написать авторам", action: "copy:vk", primary: true }
        ]
      }
    },
    {
      id: "connect-hub",
      title: "Связь и Контакты",
      badge: "CONNECT",
      tag: "PlayStation Network • Контакты",
      desc: "Всегда открыт для конструктивного диалога, предложений в сфере 1С, веб-разработки, UI/UX и технологических коллабораций. Выбирайте удобный канал для связи.",
      btnText: "Открыть контакты",
      btnAction: "modal:contacts",
      secText: "Скопировать VK",
      secAction: "copy:vk",
      thumb: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80",
      bg: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80",
      cards: [
        {
          type: "ВКонтакте",
          title: "Профиль @cr1mnsx",
          progress: "Нажмите для копирования контакта",
          action: "copy:vk"
        },
        {
          type: "GitHub",
          title: "Профиль @crimnsx-alt",
          progress: "Репозитории и открытый код",
          link: "https://github.com/crimnsx-alt"
        }
      ],
      modalData: {
        badge: "NETWORK & COMMUNICATION",
        title: "Связь с Дмитрием (cr1mnsx)",
        subtitle: "Быстрые ссылки, мессенджеры и профили разработчика",
        content: `
          <p class="modal-p">Вы можете связаться со мной по вопросам сотрудничества, вакансий, 1С-консалтинга или фронтенд-разработки:</p>
          <div class="modal-spec-grid">
            <div class="modal-spec-box">
              <span class="spec-label">VK профиль</span>
              <span class="spec-val">vk.ru/cr1mnsx</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">GitHub</span>
              <span class="spec-val">github.com/crimnsx-alt</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Время ответа</span>
              <span class="spec-val">Обычно в течение дня</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Формат</span>
              <span class="spec-val">ЛС / Деловая переписка</span>
            </div>
          </div>
        `,
        actions: [
          { text: "Скопировать ссылку VK", action: "copy:vk", primary: true },
          { text: "Открыть профиль GitHub", link: "https://github.com/crimnsx-alt", primary: false }
        ]
      }
    }
  ],
  link: [
    {
      id: "link-setup",
      title: "Боевой Сетап & Железо",
      badge: "SETUP",
      tag: "Workstation & Мобильность",
      desc: "Моя рабочая и творческая экосистема: производительный десктоп для моделирования, компиляции и рендеринга + легкий MacBook Air для мобильной разработки.",
      btnText: "Характеристики ПК",
      btnAction: "modal:setup",
      secText: "Скопировать сетап",
      secAction: "copy:setup",
      thumb: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80",
      bg: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1920&q=80",
      cards: [
        {
          type: "Основной ПК",
          title: "AMD Ryzen 5 5600X • RTX 3060 Ti",
          progress: "32 GB DDR4 • 2 TB NVMe SSD",
          action: "modal:setup"
        },
        {
          type: "Ноутбук",
          title: "Apple MacBook Air",
          progress: "macOS • Выездная работа и код",
          action: "modal:setup"
        }
      ],
      modalData: {
        badge: "HARDWARE & WORKSTATION",
        title: "Конфигурация рабочей станции cr1mnsx",
        subtitle: "Сбалансированное железо для работы с кодом, 1С и мультимедиа",
        content: `
          <div class="modal-spec-grid">
            <div class="modal-spec-box">
              <span class="spec-label">Процессор</span>
              <span class="spec-val">AMD Ryzen 5 5600X (6c/12t)</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Видеокарта</span>
              <span class="spec-val">NVIDIA GeForce RTX 3060 Ti 8GB</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Память</span>
              <span class="spec-val">32 GB High-Speed DDR4</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Накопители</span>
              <span class="spec-val">Ultra NVMe M.2 SSD 2 TB</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Ноутбук</span>
              <span class="spec-val">Apple MacBook Air (Apple Silicon)</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Периферия</span>
              <span class="spec-val">Механическая клавиатура, DualSense</span>
            </div>
          </div>
        `,
        actions: [
          { text: "Скопировать спецификацию", action: "copy:setup", primary: true }
        ]
      }
    },
    {
      id: "link-gaming",
      title: "PlayStation 5 Экосистема",
      badge: "PS5",
      tag: "PlayStation 5 • 60 FPS Ray Tracing",
      desc: "Игровая атмосфера некстгена: кинематографичная графика, плавный фреймрейт 60 FPS, тактильный отклик DualSense и эстетика фирменного интерфейса Sony.",
      btnText: "Игровой профиль",
      btnAction: "modal:gaming",
      secText: "Связаться",
      secAction: "copy:vk",
      thumb: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=400&q=80",
      bg: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=1920&q=80",
      cards: [
        {
          type: "Текущая игра",
          title: "Grand Theft Auto V Next-Gen",
          progress: "PS5 Edition • Режим «Быстродействие RT» 60 FPS",
          action: "modal:gaming"
        },
        {
          type: "Аксессуары",
          title: "DualSense Wireless Controller",
          progress: "Адаптивные триггеры & Haptic Feedback",
          action: "modal:gaming"
        }
      ],
      modalData: {
        badge: "CONSOLE GAMING • PS5 ECOSYSTEM",
        title: "PlayStation 5 Experience",
        subtitle: "Любимые игры, тактильный отклик и консольный отдых",
        content: `
          <p class="modal-p">PlayStation 5 для меня — это источник вдохновения для визуального дизайна, чистого звукового сопровождения и образцового пользовательского опыта (UX).</p>
          <div class="modal-spec-grid">
            <div class="modal-spec-box">
              <span class="spec-label">Консоль</span>
              <span class="spec-val">PlayStation 5 Digital Edition</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Приоритет</span>
              <span class="spec-val">60 FPS с трассировкой лучей</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Геймпад</span>
              <span class="spec-val">DualSense White & Midnight Black</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Любимый жанр</span>
              <span class="spec-val">Открытый мир, сюжетные экшены</span>
            </div>
          </div>
        `,
        actions: [
          { text: "Скопировать контакт", action: "copy:vk", primary: true }
        ]
      }
    },
    {
      id: "link-hub",
      title: "Быстрые Ссылки (Link Hub)",
      badge: "LINK HUB",
      tag: "Единый каталог • Прямой доступ",
      desc: "Централизованный хаб ссылок: аккаунты, репозитории, профили и способы связаться в один клик без лишних переходов.",
      btnText: "Открыть Link Hub",
      btnAction: "modal:links",
      secText: "Скопировать всё",
      secAction: "copy:all_links",
      thumb: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80",
      bg: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80",
      cards: [
        {
          type: "ВКонтакте",
          title: "vk.ru/cr1mnsx",
          progress: "Кликните для копирования ссылки",
          action: "copy:vk"
        },
        {
          type: "GitHub",
          title: "github.com/crimnsx-alt",
          progress: "Открыть репозиторий",
          link: "https://github.com/crimnsx-alt"
        }
      ],
      modalData: {
        badge: "DIRECT LINK CATALOG",
        title: "Каталог ссылок и профилей",
        subtitle: "Быстрый переход и копирование контактов",
        content: `
          <div class="modal-spec-grid">
            <div class="modal-spec-box">
              <span class="spec-label">ВКонтакте</span>
              <span class="spec-val">vk.ru/cr1mnsx</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">GitHub</span>
              <span class="spec-val">github.com/crimnsx-alt</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Проект PS5 Hub</span>
              <span class="spec-val">crimnsx-alt.github.io/Cr1mnsxSEX</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Платформа 1С</span>
              <span class="spec-val">1С:Предприятие 8.3</span>
            </div>
          </div>
        `,
        actions: [
          { text: "Скопировать VK", action: "copy:vk", primary: true },
          { text: "Скопировать GitHub", action: "copy:github", primary: false }
        ]
      }
    }
  ]
};

/**
 * Данные виджетов для Welcome Hub Bento Grid
 */
export const welcomeWidgets = [
  {
    id: "widget-trophy",
    title: "Трофеи и Достижения",
    badge: "PSN LEVEL 99",
    type: "blue", // 'blue' or 'glass'
    defaultSpan: "widget-2x1", // 2x1, 1x1, 1x2
    icon: "trophy",
    headerRight: "100% Завершено",
    content: `
      <div class="widget-trophy-display">
        <div class="trophy-cup-huge">🏆</div>
        <div class="trophy-stats">
          <div class="trophy-row">
            <span class="t-badge platinum">★ 1 Платина</span>
            <span class="t-badge gold">🥇 12 Золото</span>
          </div>
          <div class="trophy-row">
            <span class="t-badge silver">🥈 28 Серебро</span>
            <span class="t-badge bronze">🥉 58 Бронза</span>
          </div>
          <div class="trophy-progress-wrap">
            <div class="trophy-bar"><div class="trophy-bar-fill" style="width: 99.4%;"></div></div>
            <span class="trophy-percent">Уровень 99 (99.4%)</span>
          </div>
        </div>
      </div>
    `,
    footerNote: "Последнее достижение: «Master of Next-Gen UI & 1C Consulting»"
  },
  {
    id: "widget-storage",
    title: "Стек & Хранилище Навыков",
    badge: "ULTRA NVMe SSD",
    type: "glass",
    defaultSpan: "widget-2x1",
    icon: "storage",
    headerRight: "825 GB / 1000 GB",
    content: `
      <div class="storage-meters">
        <div class="meter-item">
          <div class="meter-label"><span>1С:Предприятие & Консалтинг</span><span class="meter-val">90%</span></div>
          <div class="meter-track"><div class="meter-bar c-blue" style="width: 90%;"></div></div>
        </div>
        <div class="meter-item">
          <div class="meter-label"><span>JavaScript (ESNext) & Модули</span><span class="meter-val">95%</span></div>
          <div class="meter-track"><div class="meter-bar c-accent" style="width: 95%;"></div></div>
        </div>
        <div class="meter-item">
          <div class="meter-label"><span>UI/UX Glassmorphism & Audio API</span><span class="meter-val">92%</span></div>
          <div class="meter-track"><div class="meter-bar c-white" style="width: 92%;"></div></div>
        </div>
        <div class="meter-item">
          <div class="meter-label"><span>Бизнес-анализ & Учет в КГ «РУНА»</span><span class="meter-val">88%</span></div>
          <div class="meter-track"><div class="meter-bar c-purple" style="width: 88%;"></div></div>
        </div>
      </div>
    `,
    footerNote: "Скорость отклика интерфейса: 0.12 мс • SSD оптимизирован"
  },
  {
    id: "widget-controller",
    title: "DualSense Аккумулятор & Фокус",
    badge: "HAPTIC FEEDBACK",
    type: "glass",
    defaultSpan: "widget-1x1",
    icon: "controller",
    headerRight: "88% Заряд",
    content: `
      <div class="battery-card-content">
        <div class="battery-visual">
          <div class="battery-icon">🔋</div>
          <div class="battery-meta">
            <span class="battery-pct">88%</span>
            <span class="battery-status">Беспроводной контроллер</span>
          </div>
        </div>
        <div class="controller-features">
          <div class="feature-tag active"><span>● Тактильная отдача: ВКЛ</span></div>
          <div class="feature-tag active"><span>● Адаптивные триггеры: ВКЛ</span></div>
          <div class="feature-tag mode"><span>⚡ Режим глубокой работы</span></div>
        </div>
      </div>
    `,
    footerNote: "Контроллер подключен по Bluetooth • Низкая задержка"
  },
  {
    id: "widget-online",
    title: "Статус cr1mnsx в PSN",
    badge: "PLAYSTATION NETWORK",
    type: "blue",
    defaultSpan: "widget-1x1",
    icon: "network",
    headerRight: "Online",
    content: `
      <div class="psn-status-card">
        <div class="psn-user-bar">
          <div class="psn-avatar-big">Д</div>
          <div class="psn-user-info">
            <div class="psn-name">cr1mnsx <span class="online-dot"></span></div>
            <div class="psn-game">Программирование & 1С</div>
          </div>
        </div>
        <div class="psn-quick-actions">
          <button class="btn-psn-pill" data-action="modal:bio">Открыть профиль</button>
          <button class="btn-psn-pill outline" data-action="copy:vk">Копировать ID</button>
        </div>
      </div>
    `,
    footerNote: "Статус: Готов к общению и интересным проектам"
  },
  {
    id: "widget-links",
    title: "Быстрый Link Хаб",
    badge: "DIRECT CONNECTIONS",
    type: "glass",
    defaultSpan: "widget-1x1",
    icon: "links",
    headerRight: "3 Канала",
    content: `
      <div class="quick-links-list">
        <div class="q-link-row" data-action="copy:vk">
          <span class="q-icon">💬</span>
          <div class="q-info">
            <span class="q-title">ВКонтакте</span>
            <span class="q-desc">vk.ru/cr1mnsx (клик = скопировать)</span>
          </div>
          <span class="q-copy-btn">📋</span>
        </div>
        <a href="https://github.com/crimnsx-alt" target="_blank" rel="noopener" class="q-link-row">
          <span class="q-icon">🐙</span>
          <div class="q-info">
            <span class="q-title">GitHub Профиль</span>
            <span class="q-desc">github.com/crimnsx-alt</span>
          </div>
          <span class="q-arrow">↗</span>
        </a>
      </div>
    `,
    footerNote: "Клик по контакту мгновенно копирует ссылку"
  },
  {
    id: "widget-media",
    title: "Галерея Сетапа & Медиа",
    badge: "MEDIA CAPTURE",
    type: "glass",
    defaultSpan: "widget-1x1",
    icon: "media",
    headerRight: "4K HDR",
    content: `
      <div class="media-preview-grid">
        <div class="media-thumb" style="background-image: url('https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80');" data-action="modal:setup" title="Workstation PC"></div>
        <div class="media-thumb" style="background-image: url('https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=400&q=80');" data-action="modal:gaming" title="PS5 Gaming"></div>
        <div class="media-thumb" style="background-image: url('https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=400&q=80');" data-action="modal:vr" title="VR Project"></div>
        <div class="media-thumb" style="background-image: url('https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=400&q=80');" data-action="modal:bio" title="PS5 Welcome Hub"></div>
      </div>
    `,
    footerNote: "Скриншоты и концепты в высоком разрешении"
  }
];

export const layoutPresets = [
  {
    id: "balanced",
    name: "Стандартный Hub",
    description: "Сбалансированная Bento-сетка с акцентом на трофеи и стек",
    spans: {
      "widget-trophy": "widget-2x1",
      "widget-storage": "widget-2x1",
      "widget-controller": "widget-1x1",
      "widget-online": "widget-1x1",
      "widget-links": "widget-1x1",
      "widget-media": "widget-1x1"
    }
  },
  {
    id: "career-focus",
    name: "Стек & Карьера",
    description: "Максимальный приоритет технологического хранилища и статуса",
    spans: {
      "widget-trophy": "widget-1x1",
      "widget-storage": "widget-2x1",
      "widget-controller": "widget-1x1",
      "widget-online": "widget-2x1",
      "widget-links": "widget-1x1",
      "widget-media": "widget-1x1"
    }
  },
  {
    id: "media-links",
    name: "Медиа & Ссылки",
    description: "Расширенный блок быстрых связей и скриншотов сетапа",
    spans: {
      "widget-trophy": "widget-1x1",
      "widget-storage": "widget-1x1",
      "widget-controller": "widget-1x1",
      "widget-online": "widget-1x1",
      "widget-links": "widget-2x1",
      "widget-media": "widget-2x1"
    }
  }
];

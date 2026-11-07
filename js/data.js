/**
 * PS5 Home Menu & Game Hub — Data Store (spllitz baCpOEqBMSA Reference)
 * Полный набор данных: проекты с активностями (Activity Cards 16:9),
 * новостями, трофеями, настройками PS5 и Control Center.
 * Исключены любые упоминания старых консолей.
 */

export const portfolioData = {
  projects: [
    {
      id: "hub-profile",
      title: "Дмитрий (cr1mnsx)",
      publisher: "PlayStation Studios • cr1mnsx",
      badge: "CREATOR",
      tag: "Личный хаб • Разработчик & Консультант",
      desc: "Персональное пространство Дмитрия (cr1mnsx): современные веб-проекты, экспертиза в 1С:Предприятие, передовой фронтенд и прямые контакты.",
      btnText: "Запустить хаб",
      btnAction: "modal:bio",
      secText: "Скопировать контакт",
      secAction: "copy:vk",
      thumb: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=400&q=80",
      bg: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=1920&q=80",
      activities: [
        {
          id: "act-bio-1",
          title: "Профиль cr1mnsx & Навыки",
          type: "Основная цель",
          progress: 100,
          timeEst: "Завершено",
          thumb: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=640&q=80",
          action: "modal:bio"
        },
        {
          id: "act-bio-2",
          title: "Исходный код на GitHub",
          type: "Репозиторий",
          progress: 95,
          timeEst: "В сети",
          thumb: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=640&q=80",
          link: "https://github.com/crimnsx-alt"
        },
        {
          id: "act-bio-3",
          title: "Прямая связь ВКонтакте",
          type: "Контакт",
          progress: 100,
          timeEst: "Нажмите для копирования",
          thumb: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=640&q=80",
          action: "copy:vk"
        }
      ],
      news: [
        {
          date: "Ноябрь 2026",
          title: "Релиз Next-Gen дашборда PlayStation 5",
          desc: "Полная интеграция двухуровневого Game Hub, Activity Cards и Control Center."
        },
        {
          date: "Октябрь 2026",
          title: "Сертификация 1С & Расширение компетенций",
          desc: "Успешное завершение курса УЦ №1 и внедрение стандартов в КГ «РУНА»."
        }
      ],
      trophies: { platinum: 1, gold: 12, silver: 28, bronze: 58 },
      modalData: {
        badge: "USER PROFILE • LEVEL 99",
        title: "Дмитрий — Разработчик & Консультант 1С",
        subtitle: "Никнейм: cr1mnsx | Платформа: PS5 Dashboard | Статус: В сети",
        content: `
          <p class="modal-p">Привет! Я <strong>Дмитрий (cr1mnsx)</strong> — специалист на стыке веб-разработки и корпоративных бизнес-систем 1С:Предприятие.</p>
          <div class="modal-spec-grid">
            <div class="modal-spec-box">
              <span class="spec-label">Квалификация</span>
              <span class="spec-val">1С Консультант & Web Engineer</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Компания</span>
              <span class="spec-val">КГ «РУНА»</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Архитектура UI</span>
              <span class="spec-val">PlayStation 5 Home Menu</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Стек</span>
              <span class="spec-val">1С:Предприятие 8.3, JS ESNext, Web Audio API</span>
            </div>
          </div>
          <p class="modal-p">Фокусируюсь на создании иммерсивных интерфейсов с естественной физикой, реалистичным звуком и глубокой проработкой логики.</p>
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
      publisher: "КГ «РУНА» • 1C Enterprise",
      badge: "CAREER",
      tag: "КГ «РУНА» • Экспертиза и Учет",
      desc: "Профессиональное развитие в сфере консалтинга и сопровождения систем 1С:Предприятие. Работа с ключевыми клиентами в КГ «РУНА», освоение стандартов УЦ №1 и решение задач автоматизации учета.",
      btnText: "Открыть карточку",
      btnAction: "modal:career",
      secText: "Учебный центр 1С",
      secLink: "https://uc1.1c.ru/",
      thumb: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80",
      bg: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1920&q=80",
      activities: [
        {
          id: "act-1c-1",
          title: "Сопровождение клиентов в КГ «РУНА»",
          type: "Текущая активность",
          progress: 88,
          timeEst: "В процессе",
          thumb: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=640&q=80",
          action: "modal:career"
        },
        {
          id: "act-1c-2",
          title: "Сертификация: Консультант 1С",
          type: "Квалификация",
          progress: 100,
          timeEst: "Пройдено",
          thumb: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=640&q=80",
          link: "https://uc1.1c.ru/"
        }
      ],
      news: [
        {
          date: "2026",
          title: "Автоматизация регламентного учета",
          desc: "Оптимизация закрытия месяца и аудит баз данных клиентов."
        }
      ],
      trophies: { platinum: 1, gold: 5, silver: 8, bronze: 14 },
      modalData: {
        badge: "CAREER TRACK • 1C CONSULTING",
        title: "1С:Предприятие — Экспертиза и Консалтинг",
        subtitle: "Практический опыт в КГ «РУНА» & База Учебного Центра №1",
        content: `
          <p class="modal-p">Автоматизация бизнес-процессов, сопровождение и настройка типовых и отраслевых конфигураций 1С:Предприятие.</p>
          <div class="modal-spec-grid">
            <div class="modal-spec-box">
              <span class="spec-label">Направление</span>
              <span class="spec-val">Консалтинг и сопровождение</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Обучение</span>
              <span class="spec-val">Учебный Центр №1 (Пройдено)</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Фокус</span>
              <span class="spec-val">Анализ учета, закрытие месяца</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Клиенты</span>
              <span class="spec-val">Корпоративный сектор</span>
            </div>
          </div>
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
      publisher: "Independent VR Studio",
      badge: "VR 3D",
      tag: "Специальный гость • VR Game Dev",
      desc: "Атмосферный 3D-проект виртуальной реальности нового поколения, создаваемый моей девушкой. Исследование тонких граней восприятия, детализированное окружение и полное погружение.",
      btnText: "Карточка проекта",
      btnAction: "modal:vr",
      secText: "Связаться",
      secAction: "copy:vk",
      thumb: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=400&q=80",
      bg: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=1920&q=80",
      activities: [
        {
          id: "act-vr-1",
          title: "Пространственное окружение и 3D Audio",
          type: "VR Разработка",
          progress: 75,
          timeEst: "В разработке",
          thumb: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=640&q=80",
          action: "modal:vr"
        },
        {
          id: "act-vr-2",
          title: "Физика взаимодействия 6DOF",
          type: "Игровая механика",
          progress: 60,
          timeEst: "Тестирование механик",
          thumb: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=640&q=80",
          action: "modal:vr"
        }
      ],
      news: [
        {
          date: "2026",
          title: "Прототипирование локаций виртуальной реальности",
          desc: "Создание эффекта полного присутствия и реалистичного освещения."
        }
      ],
      trophies: { platinum: 0, gold: 2, silver: 6, bronze: 10 },
      modalData: {
        badge: "FEATURED SHOWCASE • VR PROJECT",
        title: "«По ту сторону яви» (VR Experience)",
        subtitle: "Авторский VR-проект: интерактивное 3D-пространство и психологический нарратив",
        content: `
          <p class="modal-p">Атмосферный VR-проект моей девушки с акцентом на исследование границ восприятия, детальное окружение и бинауральный 3D-звук.</p>
          <div class="modal-spec-grid">
            <div class="modal-spec-box">
              <span class="spec-label">Платформа</span>
              <span class="spec-val">VR Headsets (6DOF)</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Звук</span>
              <span class="spec-val">Binaural 3D Audio</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Статус</span>
              <span class="spec-val">Активный продакшен</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Роль</span>
              <span class="spec-val">Технический консалтинг и тесты</span>
            </div>
          </div>
        `,
        actions: [
          { text: "Написать авторам", action: "copy:vk", primary: true }
        ]
      }
    },
    {
      id: "connect-hub",
      title: "Связь и Контакты",
      publisher: "PlayStation Network • cr1mnsx",
      badge: "CONNECT",
      tag: "PlayStation Network • Контакты",
      desc: "Всегда открыт для конструктивного диалога, предложений в сфере 1С, веб-разработки, UI/UX и технологических коллабораций. Выбирайте удобный канал для связи.",
      btnText: "Открыть контакты",
      btnAction: "modal:contacts",
      secText: "Скопировать VK",
      secAction: "copy:vk",
      thumb: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80",
      bg: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80",
      activities: [
        {
          id: "act-con-1",
          title: "ВКонтакте: vk.ru/cr1mnsx",
          type: "Личные сообщения",
          progress: 100,
          timeEst: "Кликните для копирования",
          thumb: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=640&q=80",
          action: "copy:vk"
        },
        {
          id: "act-con-2",
          title: "GitHub: github.com/crimnsx-alt",
          type: "Репозитории",
          progress: 100,
          timeEst: "В сети",
          thumb: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=640&q=80",
          link: "https://github.com/crimnsx-alt"
        }
      ],
      news: [
        {
          date: "Онлайн",
          title: "Статус в сети: Готов к общению",
          desc: "Открыт для обсуждения веб-проектов, 1С-автоматизации и UI-дизайна."
        }
      ],
      trophies: { platinum: 1, gold: 4, silver: 10, bronze: 20 },
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
      publisher: "Hardware & Workstation",
      badge: "SETUP",
      tag: "Workstation & Мобильность",
      desc: "Моя рабочая и творческая экосистема: производительный десктоп для моделирования, компиляции и рендеринга + легкий MacBook Air для мобильной разработки.",
      btnText: "Характеристики ПК",
      btnAction: "modal:setup",
      secText: "Скопировать сетап",
      secAction: "copy:setup",
      thumb: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80",
      bg: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1920&q=80",
      activities: [
        {
          id: "act-set-1",
          title: "Основной ПК: Ryzen 5600X • RTX 3060 Ti",
          type: "Спецификация",
          progress: 100,
          timeEst: "32 GB ОЗУ • 2 TB SSD",
          thumb: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=640&q=80",
          action: "modal:setup"
        },
        {
          id: "act-set-2",
          title: "Apple MacBook Air (macOS)",
          type: "Мобильность",
          progress: 100,
          timeEst: "Apple Silicon",
          thumb: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=640&q=80",
          action: "modal:setup"
        }
      ],
      news: [
        {
          date: "Hardware Status",
          title: "Рабочая станция откалибрована",
          desc: "NVMe SSD скорость 3500 МБ/с, стабильное охлаждение и двойной монитор."
        }
      ],
      trophies: { platinum: 1, gold: 3, silver: 4, bronze: 10 },
      modalData: {
        badge: "HARDWARE & WORKSTATION",
        title: "Конфигурация рабочей станции cr1mnsx",
        subtitle: "Сбалансированное железо для работы с кодом, 1С и мультимедиа",
        content: `
          <div class="modal-spec-grid">
            <div class="modal-spec-box">
              <span class="spec-label">Процессор</span>
              <span class="spec-val">AMD Ryzen 5 5600X (6 ядер, 12 потоков)</span>
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
              <span class="spec-val">Apple MacBook Air (macOS)</span>
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
      publisher: "Sony Interactive Entertainment",
      badge: "PS5",
      tag: "PlayStation 5 • 60 FPS Ray Tracing",
      desc: "Игровая атмосфера некстгена: кинематографичная графика, плавный фреймрейт 60 FPS, тактильный отклик DualSense и эстетика фирменного интерфейса Sony.",
      btnText: "Игровой профиль",
      btnAction: "modal:gaming",
      secText: "Связаться",
      secAction: "copy:vk",
      thumb: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=400&q=80",
      bg: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=1920&q=80",
      activities: [
        {
          id: "act-game-1",
          title: "Grand Theft Auto V Expanded",
          type: "Текущая игра",
          progress: 90,
          timeEst: "60 FPS Ray Tracing",
          thumb: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?auto=format&fit=crop&w=640&q=80",
          action: "modal:gaming"
        },
        {
          id: "act-game-2",
          title: "DualSense Wireless Controller",
          type: "Аксессуар",
          progress: 88,
          timeEst: "Haptic Feedback активен",
          thumb: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=640&q=80",
          action: "modal:gaming"
        }
      ],
      news: [
        {
          date: "PS5 System",
          title: "Обновление прошивки консоли",
          desc: "Поддержка 120 FPS, VRR и Tempest 3D Audio."
        }
      ],
      trophies: { platinum: 1, gold: 5, silver: 12, bronze: 30 },
      modalData: {
        badge: "CONSOLE GAMING • PS5 ECOSYSTEM",
        title: "PlayStation 5 Experience",
        subtitle: "Любимые игры, тактильный отклик и консольный отдых",
        content: `
          <p class="modal-p">PlayStation 5 — эталон визуального дизайна, тактильного погружения и плавности интерфейса.</p>
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
              <span class="spec-val">DualSense Wireless Controller</span>
            </div>
            <div class="modal-spec-box">
              <span class="spec-label">Аудио</span>
              <span class="spec-val">Tempest 3D AudioTech</span>
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
      publisher: "Link Catalog • cr1mnsx",
      badge: "LINK HUB",
      tag: "Единый каталог • Прямой доступ",
      desc: "Централизованный хаб ссылок: аккаунты, репозитории, профили и способы связаться в один клик без лишних переходов.",
      btnText: "Открыть Link Hub",
      btnAction: "modal:links",
      secText: "Скопировать всё",
      secAction: "copy:all_links",
      thumb: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80",
      bg: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80",
      activities: [
        {
          id: "act-lnk-1",
          title: "Профиль ВКонтакте",
          type: "Социальная сеть",
          progress: 100,
          timeEst: "vk.ru/cr1mnsx",
          thumb: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=640&q=80",
          action: "copy:vk"
        },
        {
          id: "act-lnk-2",
          title: "Профиль на GitHub",
          type: "Открытый код",
          progress: 100,
          timeEst: "github.com/crimnsx-alt",
          thumb: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=640&q=80",
          link: "https://github.com/crimnsx-alt"
        }
      ],
      news: [
        {
          date: "Каталог",
          title: "Актуальные контакты проверены",
          desc: "Все каналы связи активны."
        }
      ],
      trophies: { platinum: 1, gold: 2, silver: 4, bronze: 8 },
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
 * Разделы системных настроек PS5 Settings
 */
export const settingsSections = [
  {
    id: "accounts",
    title: "Учетные записи и профиль",
    icon: "👤",
    items: [
      { label: "Основной пользователь", val: "cr1mnsx (Дмитрий)", action: "modal:bio" },
      { label: "Уровень PlayStation Network", val: "Уровень 99 • ★ Платина", action: "modal:trophy" },
      { label: "Контакты & Связь", val: "vk.ru/cr1mnsx", action: "copy:vk" }
    ]
  },
  {
    id: "storage",
    title: "Память и Хранилище SSD",
    icon: "💾",
    items: [
      { label: "Ultra-High Speed SSD", val: "825 GB (Доступно 667 GB)" },
      { label: "Стек разработки", val: "1С:Предприятие 8.3, JavaScript ESNext, Web Audio" },
      { label: "Бизнес-учет & Экспертиза", val: "КГ «РУНА»" }
    ]
  },
  {
    id: "sound",
    title: "Звук и Аудиосистема",
    icon: "🔊",
    items: [
      { label: "Фоновая музыка PS5", val: "Генеративный синтезатор меню", toggle: "ambient" },
      { label: "Звуковые эффекты интерфейса", val: "Синтез щелчков и аккордов", toggle: "sfx" },
      { label: "Tempest 3D Audio", val: "Откалибровано для стереонаушников" }
    ]
  },
  {
    id: "display",
    title: "Экран и Видео",
    icon: "🖥️",
    items: [
      { label: "Разрешение вывода", val: "3840 x 2160 (4K UHD) 60 FPS" },
      { label: "Трассировка лучей", val: "Ray Tracing Performance Mode" },
      { label: "Интерфейс консоли", val: "Sony PS5 Dashboard UI" }
    ]
  },
  {
    id: "accessories",
    title: "Аксессуары (DualSense)",
    icon: "🎮",
    items: [
      { label: "Контроллер", val: "DualSense Wireless Controller" },
      { label: "Уровень заряда аккумулятора", val: "88% • Подключено по Bluetooth" },
      { label: "Haptic Feedback & Триггеры", val: "Тактильный отклик активен" }
    ]
  },
  {
    id: "system",
    title: "Система",
    icon: "ℹ️",
    items: [
      { label: "Версия ПО консоли", val: "PlayStation 5 OS v24.8" },
      { label: "Устройство", val: "PS5-CR1MNSX" },
      { label: "Репозиторий", val: "crimnsx-alt/Cr1mnsxSEX" }
    ]
  }
];

/**
 * Элементы Control Center (PS Button)
 */
export const controlCenterItems = [
  { id: "cc-home", icon: "🏠", label: "Начало", action: "home" },
  { id: "cc-switcher", icon: "🔀", label: "Переключатель", action: "switcher" },
  { id: "cc-notifications", icon: "🔔", label: "Уведомления", action: "notifications" },
  { id: "cc-gamebase", icon: "👥", label: "Game Base", action: "gamebase" },
  { id: "cc-music", icon: "🎵", label: "Музыка", action: "music" },
  { id: "cc-sound", icon: "🔊", label: "Звук", action: "sound" },
  { id: "cc-accessories", icon: "🎮", label: "Аксессуары", action: "accessories" },
  { id: "cc-profile", icon: "👤", label: "cr1mnsx", action: "modal:bio" },
  { id: "cc-power", icon: "⚡", label: "Питание", action: "power" }
];

/**
 * Каталог для мгновенного поиска
 */
export const searchCatalog = [
  { title: "Дмитрий (cr1mnsx)", category: "Профиль", desc: "Главный хаб, биография, стек", action: "modal:bio" },
  { title: "1С:Предприятие & Консалтинг", category: "Карьера", desc: "Опыт в КГ «РУНА», база УЦ №1", action: "modal:career" },
  { title: "«По ту сторону яви»", category: "VR Проект", desc: "3D Virtual Reality Adventure", action: "modal:vr" },
  { title: "Связь и Контакты", category: "Контакты", desc: "VK: vk.ru/cr1mnsx, GitHub", action: "modal:contacts" },
  { title: "Боевой Сетап & ПК", category: "Сетап", desc: "Ryzen 5600X, RTX 3060 Ti, MacBook Air", action: "modal:setup" },
  { title: "PlayStation 5 Гейминг", category: "Консоль", desc: "PS5, DualSense, GTA V RT 60FPS", action: "modal:gaming" },
  { title: "Трофеи и Достижения", category: "PSN", desc: "★ 1 Платина, 12 Золото, Уровень 99", action: "modal:trophy" },
  { title: "GitHub Репозиторий", category: "Код", desc: "github.com/crimnsx-alt", link: "https://github.com/crimnsx-alt" },
  { title: "ВКонтакте", category: "Связь", desc: "vk.ru/cr1mnsx", action: "copy:vk" }
];

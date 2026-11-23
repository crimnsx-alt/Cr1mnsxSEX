# PS5 System Sound Library & Audio Engine

## 1. Обзор архитектуры звука PS5
- **Источник:** PS5 System Software Sounds Effects (Khinsider Gamerip 2020).
- **Каталог:** 45 системных звуков, задокументированных в `assets/audio/ps5/manifest.json` и `js/sound-catalog.js`.
- **Файловая структура:**
  - `assets/audio/ps5/active/` (26 проверенных WAV-файлов: `enter`, `cancel`, `focus_move`, `change_panel`, `open_home`, `trophy_toast`, `platinum_trophy_toast` и др.)
  - `assets/audio/ps5/reserved/` (4 зарезервированных WAV-файла: `join_party`, `leave_party`, `log_out`, `purchase_universal_checkout`)
  - 15 звуков имеют статус `MISSING` (источник защищен Cloudflare Turnstile; поддельные синтетические имитации запрещены!).

## 2. Модули звукового движка
- `js/sound-catalog.js`: Экспортирует `PS5_SOUND_CATALOG`, категории (`NAV`, `DIALOG`, `TOAST`, `TROPHY`, `INPUT`, `SYSTEM`), акустические метрики (длительность, RMS, Peak, частоту дискретизации).
- `js/sound.js`: Реализует `PS5AudioManager` (`SoundEngine`):
  - Web Audio API `AudioContext` с автоматическим жестом разблокировки (`pointerdown`, `keydown`).
  - Канальное микширование: `Master`, `Navigation`, `Interface`, `Notifications`, `Music`.
  - Генеративный PS5 Ambient Synth на аккордах `Emaj9` / `Bmaj` с фильтром низких частот.
  - Дебаунс навигационных звуков (40ms) против дребезга при быстром скролле или управлении геймпадом.
  - Методы тестирования звуков: `testSound(idOrKey)` и `testAllActiveSounds(onProgress, onComplete)`.

## 3. UI-интеграция
- В интерфейсе реализован **Центр тестирования звуков PS5** (Настройки ⚙️ → «Системные звуки PS5»):
  - Поиск звуков по названию и ID.
  - Фильтры по категориям.
  - Кнопки воспроизведения с живой анимацией волны.
  - Кнопка последовательного теста всех 26 активных звуков с подсветкой карточек.

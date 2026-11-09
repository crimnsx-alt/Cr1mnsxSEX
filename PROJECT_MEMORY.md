# 🎮 PlayStation 5 Web Experience — Project Memory & State

## 📍 Текущий статус проекта (Production Ready)
- **Локальный путь**: `/Users/cr1mnsx/ps5ux`
- **GitHub Репозиторий**: `https://github.com/crimnsx-alt/Cr1mnsxSEX`
- **GitHub Pages (Live)**: `https://crimnsx-alt.github.io/Cr1mnsxSEX/`
- **Локальный Dev-сервер**: `http://localhost:8080/`

---

## 🎯 Соответствие оригиналу PS5 (Референс: spllitz 2020 Home Menu)
1. **Top Bar**:
   - Логотип PlayStation слева.
   - Табы `Games` и `Media` с белым ползунком-индикатором активного таба.
   - Правая статусная зона: системные часы (HH:MM), аватар профиля cr1mnsx с онлайн-статусом, шестерёнка настроек.
2. **Carousel (Главная лента игр)**:
   - Иконки игр с рамкой `3px solid #ffffff` на фокусе, скруглением `12px` и подъемом при наведении/фокусе.
   - Фоновое динамическое переключение бэкграунда с плавным cross-fade.
   - Логотип игры / проекта и кнопка «Играть» («Play») / «Запустить» в левом нижнем блоке.
3. **Control Center (PS Button)**:
   - Нижняя плавающая док-панель по нажатию клавиши `PS` / `Escape` / кнопки на геймпаде.
   - 10 нативных системных иконок: Home, Switcher, Notifications, Game Base, Music, Broadcast, Accessibility, Network, Sound, Mic Mute.
4. **Activity Cards (16:9 Карточки активности)**:
   - Строгое соотношение сторон 16:9 (`320×180px`).
   - Официальный прогресс выполнения квестов/задач, трофеи (Gold, Silver, Platinum), время прохождения.
5. **Anti-Slop & Design Guidelines**:
   - 100% отказ от эмодзи: все иконки заменены на чистые векторные SVG (`js/icons.js`).
   - Тактильный отклик кнопок: `:active { transform: scale(0.96); }`.
   - Поддержка `@media (prefers-reduced-motion: reduce)`.
   - Шрифт Inter с точным оптическим трекингом и контрастом.

---

## 🚀 Быстрый запуск с Рабочего стола
На рабочем столе созданы ярлыки:
1. **`Project PS5 Antigravity.app`** — нативное macOS приложение для запуска IDE и открытия сайта в браузере в 1 клик.
2. **`Запустить Project PS5 в Antigravity.command`** — терминальный скрипт запуска с подробным логом.
3. **`PS5 Portfolio (Web).webloc`** — прямой переход на опубликованную версию на GitHub Pages.

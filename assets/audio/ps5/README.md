# PlayStation 5 Complete System Sound Library (45 Sounds)
## Документация, правила интеграции и каталог системных аудиоэффектов PS5

Официальный источник сборника: [PlayStation 5 System Software Sounds Effects (PS5 Gamerip 2020)](https://downloads.khinsider.com/game-soundtracks/album/playstation-5-system-software-sounds-effects-ps5-gamerip-2020)

---

## 1. Структура библиотеки

```
assets/audio/ps5/
├── active/               # 26 активных оригинальных WAV-файлов для текущего интерфейса
├── reserved/             # 4 зарезервированных WAV-файла для будущих функций
├── manifest.json         # Единый централизованный машиночитаемый каталог всех 45 звуков
└── README.md             # Справочник и правила работы с аудиосистемой
```

---

## 2. Сводная статистика библиотеки

| Показатель | Количество | Описание |
|---|---|---|
| **Всего звуков в коллекции** | **45** | Полный перечень системных эффектов PS5 |
| **Физически присутствуют на диске** | **30** | Аудиофайлы WAV 44.1 kHz 16-bit PCM |
| **АКТИВНЫЕ (ACTIVE)** | **26** | Подключены к существующим действиям сайта |
| **В РЕЗЕРВЕ (RESERVED)** | **4** | Сохранены для будущих функций (Social, Store, Power) |
| **ОТСУТСТВУЮТ (MISSING)** | **15** | Недоступны для прямого скачивания (Cloudflare Turnstile) |

---

## 3. Резервные звуки (RESERVED) и их целевое назначение

| ID | Звук | Файл | Длительность | Акустический характер | Будущая функция | Почему пока в резерве |
|---|---|---|---|---|---|---|
| **20** | **Join Party** | `join_party.wav` | 0.320s | Мажорный восходящий аккорд (~711Hz) | Модуль голосового чата Game Base Voice | Голосовой чат тусовок ещё не разработан |
| **21** | **Leave Party** | `leave_party.wav` | 0.280s | Разрешающий нисходящий аккорд (~593Hz) | Выход из голосовой комнаты | Голосовой чат тусовок ещё не разработан |
| **22** | **Log Out** | `log_out.wav` | 0.300s | Мягкий гармонический свип выключения (~142Hz) | Меню смены профиля и перехода в режим покоя | Системное меню питания находится в стадии прототипа |
| **33** | **Purchase Universal Checkout** | `purchase_universal_checkout.wav` | 0.350s | Звонкий перезвон монет/транзакции (~1557Hz) | Корзина покупок PlayStation Store | В магазине пока нет полноценной корзины checkout |

---

## 4. Отсутствующие звуки (MISSING)

Следующие 15 файлов отсутствуют на диске из-за защиты сайта `downloads.khinsider.com` (Cloudflare Managed Challenge / Turnstile):

1. `agent_no_results.wav` (Agent No Results)
2. `agent_utterance_received.wav` (Agent Utterance Received)
3. `agent_wake_up.wav` (Agent Wake up)
4. `change_panel_2.wav` (Change Panel 2)
5. `change_space.wav` (Change Space)
6. `face_recognition.wav` (Face Recognition)
7. `neutral_in_dialog.wav` (Neutral in Dialog)
8. `no_in_dialog.wav` (No in Dialog)
9. `pass_code.wav` (Pass Code)
10. `tts_cannot_move_focus.wav` (TTS Cannot Move Focus)
11. `undefined.wav` (Undefined)
12. `voice_recognition_for_osk_ends.wav` (Voice Recognition for OSK Ends)
13. `voice_recognition_for_osk_error.wav` (Voice Recognition for OSK Error)
14. `voice_recognition_for_osk_starts.wav` (Voice Recognition for OSK Starts)
15. `yes_in_dialog.wav` (Yes in Dialog)

---

## 5. Регламент интеграции для дальнейшей разработки (ЭТАП 8)

Перед добавлением любого нового системного действия или функции на сайт:

1. **Проверь каталог `assets/audio/ps5/manifest.json` или `js/sound-catalog.js`:**
   * Проверь список звуков со статусом `RESERVED`.
2. **Если подходящий звук есть в резерве:**
   * Измени его статус на `ACTIVE` в `manifest.json` и `sound-catalog.js`.
   * Перемести файл из `assets/audio/ps5/reserved/` в `assets/audio/ps5/active/`.
   * Добавь метод вызова в `SoundEngine` (`js/sound.js`).
   * Привяжи к соответствующему действию в `js/app.js`.
   * Проверь звучание в реальном интерфейсе.
3. **Если подходящего звука нет:**
   * **СТРОГО ЗАПРЕЩЕНО:** подставлять случайные аудиофайлы или называть синтетический шум оригинальным звуком.
   * Сообщи пользователю об отсутствии оригинального звука.
   * Оставь действие без звука или согласуй качественную Web Audio процедурную замену.

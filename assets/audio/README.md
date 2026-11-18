# PlayStation 5 System Software Sounds Effects (Audio Assets Directory)

В эту директорию помещаются оригинальные аудиофайлы звуковых эффектов интерфейса PlayStation 5, извлеченные из сборника:
**[PlayStation 5 System Software Sounds Effects (PS5 Gamerip 2020)](https://downloads.khinsider.com/game-soundtracks/album/playstation-5-system-software-sounds-effects-ps5-gamerip-2020)**.

Audio Manager проекта автоматически определяет формат файлов (`.wav` или `.mp3`) и загружает их через Web Audio API с буферизацией и кэшированием.

## 22 активных файла для интерфейса (TASK 08.2)

Поместите файлы с соответствующими именами в эту папку:

| № | Действие интерфейса | Имя звука | Требуемое имя файла (`.wav` или `.mp3`) | Канал звука |
|---|---|---|---|---|
| 17 | Перемещение по меню | Focus Move | `focus_move.wav` | Navigation |
| 16 | Перемещение по клавиатуре | Focus Move in Keyboard | `focus_move_in_keyboard.wav` | Navigation |
| 11 | Подтверждение | Enter | `enter.wav` | Interface |
| 5 | Назад | Cancel | `cancel.wav` | Interface |
| 28 | Открытие главного меню | Open Home | `open_home.wav` | Interface |
| 25 | Открытие Control Center | Open Control Center | `open_control_center.wav` | Interface |
| 9 | Закрытие Control Center | Close Control Center | `close_control_center.wav` | Interface |
| 29 | Открытие меню параметров | Open Option Menu | `open_option_menu.wav` | Interface |
| 10 | Закрытие меню параметров | Close Option Menu | `close_option_menu.wav` | Interface |
| 26 | Открытие модального окна | Open Dialog | `open_dialog.wav` | Interface |
| 30 | Открытие клавиатуры | Open OSK | `open_osk.wav` | Interface |
| 4 | Удаление символа | Backspace | `backspace.wav` | Interface |
| 38 | Ввод текста | Text Input | `text_input.wav` | Interface |
| 36 | Включение переключателя | Switch On | `switch_on.wav` | Interface |
| 35 | Выключение переключателя | Switch Off | `switch_off.wav` | Interface |
| 34 | Изменение ползунка | Slider Level Meter | `slider_level_meter.wav` | Interface |
| 12 | Ошибка ввода | Error in Text Box | `error_in_text_box.wav` | Interface |
| 13 | Системная ошибка | Error | `error.wav` | Interface |
| 18 | Информационное уведомление | Informative Toasts | `informative_toasts.wav` | Notifications |
| 19 | Интерактивное уведомление | Interactive Toasts | `interactive_toasts.wav` | Notifications |
| 39 | Получение трофея | Trophy Toast | `trophy_toast.wav` | Notifications |
| 32 | Получение платинового трофея | Platinum Trophy Toast | `platinum_trophy_toast.wav` | Notifications |

## Дополнительные активные действия
| № | Действие | Имя звука | Файл |
|---|---|---|---|
| 6 | Смена вкладки/панели | Change Panel | `change_panel.wav` |
| 37 | Создание скриншота | Take Screenshot | `take_screenshot.wav` |
| 20 | Вход в тусовку | Join Party | `join_party.wav` |
| 21 | Выход из тусовки | Leave Party | `leave_party.wav` |
| 22 | Выход из профиля / режим покоя | Log Out | `log_out.wav` |
| 33 | Подтверждение покупки Store | Purchase Universal Checkout | `purchase_universal_checkout.wav` |
| 14 | Уведомление об ошибке | Error Toasts | `error_toasts.wav` |
| 27 | Модальное окно ошибки | Open Error Dialog | `open_error_dialog.wav` |

## Зарезервированные системные звуки (15 файлов)
Остаются зарегистрированными в каталоге, но заблокированы до подключения будущих функций:
- `agent_no_results.wav`
- `agent_utterance_received.wav`
- `agent_wake_up.wav`
- `change_panel_2.wav`
- `change_space.wav`
- `face_recognition.wav`
- `neutral_in_dialog.wav`
- `no_in_dialog.wav`
- `pass_code.wav`
- `tts_cannot_move_focus.wav`
- `undefined.wav`
- `voice_recognition_for_osk_ends.wav`
- `voice_recognition_for_osk_error.wav`
- `voice_recognition_for_osk_starts.wav`
- `yes_in_dialog.wav`

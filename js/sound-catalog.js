/**
 * PlayStation 5 System Audio Catalog (45 System Sounds)
 * TASK 08.1: Complete Architectural Audio System
 */

export const PS5_AUDIO_TIERS = {
  ACTIVE: "active",       // Подключены сразу (основные системные действия)
  FEATURED: "featured",   // Подключаются по мере появления функций
  RESERVED: "reserved"    // Зарезервированы (присутствуют в каталоге, но не воспроизводятся до подключения)
};

export const PS5_SOUND_CATALOG = [
  { id: 1,  key: "agentNoResults",                name: "Agent No Results",                 desc: "Нет результатов поиска",                           tier: "reserved", file: "assets/audio/agent_no_results.wav" },
  { id: 2,  key: "agentUtteranceReceived",        name: "Agent Utterance Received",         desc: "Получена голосовая команда",                       tier: "reserved", file: "assets/audio/agent_utterance_received.wav" },
  { id: 3,  key: "agentWakeUp",                   name: "Agent Wake up",                    desc: "Активация голосового помощника",                   tier: "reserved", file: "assets/audio/agent_wake_up.wav" },
  { id: 4,  key: "backspace",                     name: "Backspace",                        desc: "Удаление символа",                                 tier: "active",   file: "assets/audio/backspace.wav" },
  { id: 5,  key: "cancel",                        name: "Cancel",                           desc: "Отмена действия",                                  tier: "active",   file: "assets/audio/cancel.wav" },
  { id: 6,  key: "changePanel",                   name: "Change Panel",                     desc: "Переключение панели",                              tier: "active",   file: "assets/audio/change_panel.wav" },
  { id: 7,  key: "changePanel2",                  name: "Change Panel 2",                   desc: "Альтернативное переключение панели",               tier: "reserved", file: "assets/audio/change_panel_2.wav" },
  { id: 8,  key: "changeSpace",                   name: "Change Space",                     desc: "Переключение области",                             tier: "reserved", file: "assets/audio/change_space.wav" },
  { id: 9,  key: "closeControlCenter",            name: "Close Control Center",             desc: "Закрытие центра управления",                       tier: "active",   file: "assets/audio/close_control_center.wav" },
  { id: 10, key: "closeOptionMenu",               name: "Close Option Menu",                desc: "Закрытие меню параметров",                         tier: "active",   file: "assets/audio/close_option_menu.wav" },
  { id: 11, key: "enter",                         name: "Enter",                            desc: "Подтверждение выбора",                             tier: "active",   file: "assets/audio/enter.wav" },
  { id: 12, key: "errorInTextBox",                name: "Error in Text Box",                desc: "Ошибка ввода",                                     tier: "featured", file: "assets/audio/error_in_text_box.wav" },
  { id: 13, key: "error",                         name: "Error",                            desc: "Системная ошибка",                                 tier: "featured", file: "assets/audio/error.wav" },
  { id: 14, key: "errorToasts",                   name: "Error Toasts",                     desc: "Уведомление об ошибке",                            tier: "featured", file: "assets/audio/error_toasts.wav" },
  { id: 15, key: "faceRecognition",               name: "Face Recognition",                 desc: "Распознавание лица",                               tier: "reserved", file: "assets/audio/face_recognition.wav" },
  { id: 16, key: "focusMoveInKeyboard",           name: "Focus Move in Keyboard",           desc: "Перемещение по клавиатуре",                        tier: "active",   file: "assets/audio/focus_move_in_keyboard.wav" },
  { id: 17, key: "focusMove",                     name: "Focus Move",                       desc: "Перемещение фокуса",                               tier: "active",   file: "assets/audio/focus_move.wav" },
  { id: 18, key: "informativeToasts",             name: "Informative Toasts",               desc: "Информационное уведомление",                       tier: "featured", file: "assets/audio/informative_toasts.wav" },
  { id: 19, key: "interactiveToasts",             name: "Interactive Toasts",               desc: "Интерактивное уведомление",                        tier: "featured", file: "assets/audio/interactive_toasts.wav" },
  { id: 20, key: "joinParty",                     name: "Join Party",                       desc: "Вход в группу",                                    tier: "featured", file: "assets/audio/join_party.wav" },
  { id: 21, key: "leaveParty",                    name: "Leave Party",                      desc: "Выход из группы",                                  tier: "featured", file: "assets/audio/leave_party.wav" },
  { id: 22, key: "logOut",                        name: "Log Out",                          desc: "Выход из профиля",                                 tier: "featured", file: "assets/audio/log_out.wav" },
  { id: 23, key: "neutralInDialog",               name: "Neutral in Dialog",                desc: "Нейтральный ответ в диалоге",                      tier: "reserved", file: "assets/audio/neutral_in_dialog.wav" },
  { id: 24, key: "noInDialog",                    name: "No in Dialog",                     desc: "Ответ «Нет»",                                      tier: "reserved", file: "assets/audio/no_in_dialog.wav" },
  { id: 25, key: "openControlCenter",             name: "Open Control Center",              desc: "Открытие центра управления",                       tier: "active",   file: "assets/audio/open_control_center.wav" },
  { id: 26, key: "openDialog",                    name: "Open Dialog",                      desc: "Открытие диалогового окна",                        tier: "active",   file: "assets/audio/open_dialog.wav" },
  { id: 27, key: "openErrorDialog",               name: "Open Error Dialog",                desc: "Открытие окна ошибки",                             tier: "featured", file: "assets/audio/open_error_dialog.wav" },
  { id: 28, key: "openHome",                      name: "Open Home",                        desc: "Открытие главного меню",                           tier: "active",   file: "assets/audio/open_home.wav" },
  { id: 29, key: "openOptionMenu",                name: "Open Option Menu",                 desc: "Открытие меню параметров",                         tier: "active",   file: "assets/audio/open_option_menu.wav" },
  { id: 30, key: "openOsk",                       name: "Open OSK",                         desc: "Открытие экранной клавиатуры",                     tier: "active",   file: "assets/audio/open_osk.wav" },
  { id: 31, key: "passCode",                      name: "Pass Code",                        desc: "Ввод кода доступа",                                tier: "reserved", file: "assets/audio/pass_code.wav" },
  { id: 32, key: "platinumTrophyToast",           name: "Platinum Trophy Toast",            desc: "Уведомление о платиновом трофее",                  tier: "featured", file: "assets/audio/platinum_trophy_toast.wav" },
  { id: 33, key: "purchaseUniversalCheckout",     name: "Purchase Universal Checkout",      desc: "Подтверждение покупки",                            tier: "featured", file: "assets/audio/purchase_universal_checkout.wav" },
  { id: 34, key: "sliderLevelMeter",              name: "Slider Level Meter",               desc: "Изменение уровня ползунка",                        tier: "active",   file: "assets/audio/slider_level_meter.wav" },
  { id: 35, key: "switchOff",                     name: "Switch Off",                       desc: "Выключение переключателя",                         tier: "active",   file: "assets/audio/switch_off.wav" },
  { id: 36, key: "switchOn",                      name: "Switch On",                        desc: "Включение переключателя",                          tier: "active",   file: "assets/audio/switch_on.wav" },
  { id: 37, key: "takeScreenshot",                name: "Take Screenshot",                  desc: "Создание скриншота",                               tier: "featured", file: "assets/audio/take_screenshot.wav" },
  { id: 38, key: "textInput",                     name: "Text Input",                       desc: "Ввод текста",                                      tier: "active",   file: "assets/audio/text_input.wav" },
  { id: 39, key: "trophyToast",                   name: "Trophy Toast",                     desc: "Получение трофея",                                 tier: "featured", file: "assets/audio/trophy_toast.wav" },
  { id: 40, key: "ttsCannotMoveFocus",            name: "TTS Cannot Move Focus",            desc: "Ошибка перемещения фокуса для озвучивания",        tier: "reserved", file: "assets/audio/tts_cannot_move_focus.wav" },
  { id: 41, key: "undefinedSound",                name: "Undefined",                        desc: "Неопределённое системное событие",                  tier: "reserved", file: "assets/audio/undefined.wav" },
  { id: 42, key: "voiceRecognitionForOskEnds",    name: "Voice Recognition for OSK Ends",   desc: "Завершение голосового ввода",                      tier: "reserved", file: "assets/audio/voice_recognition_for_osk_ends.wav" },
  { id: 43, key: "voiceRecognitionForOskError",   name: "Voice Recognition for OSK Error",  desc: "Ошибка голосового ввода",                          tier: "reserved", file: "assets/audio/voice_recognition_for_osk_error.wav" },
  { id: 44, key: "voiceRecognitionForOskStarts", name: "Voice Recognition for OSK Starts", desc: "Начало голосового ввода",                          tier: "reserved", file: "assets/audio/voice_recognition_for_osk_starts.wav" },
  { id: 45, key: "yesInDialog",                   name: "Yes in Dialog",                    desc: "Ответ «Да»",                                       tier: "reserved", file: "assets/audio/yes_in_dialog.wav" }
];

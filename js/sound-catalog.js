/**
 * PlayStation 5 System Audio Catalog (45 System Sounds)
 * TASK 08.2: Replace Existing Audio with PS5 System Sounds
 * 
 * Official Source: PS5 System Software Sounds Effects (Khinsider Rip)
 */

export const PS5_AUDIO_TIERS = {
  ACTIVE: "active",       // Подключены сразу (основные системные действия)
  FEATURED: "featured",   // Подключаются по мере появления функций
  RESERVED: "reserved"    // Зарезервированы (присутствуют в каталоге, но не воспроизводятся до подключения)
};

export const PS5_AUDIO_CHANNELS = {
  NAV: "nav",       // Канал навигации (Focus Move, перемещение фокуса)
  UI: "ui",         // Канал интерфейса (Enter, Cancel, Modals, Sliders, Toggles, Text Input)
  NOTIF: "notif",   // Канал уведомлений (Toasts, Trophies, Errors)
  MUSIC: "music"    // Канал фоновой музыки (Ambient Synth)
};

export const PS5_SOUND_CATALOG = [
  {
    id: 1,
    key: "agentNoResults",
    name: "Agent No Results",
    desc: "Нет результатов голосового поиска",
    action: "Голосовой помощник: нет результатов",
    tier: PS5_AUDIO_TIERS.RESERVED,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/agent_no_results.wav",
    altFile: "assets/audio/agent_no_results.mp3"
  },
  {
    id: 2,
    key: "agentUtteranceReceived",
    name: "Agent Utterance Received",
    desc: "Получена голосовая команда",
    action: "Голосовой помощник: команда принята",
    tier: PS5_AUDIO_TIERS.RESERVED,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/agent_utterance_received.wav",
    altFile: "assets/audio/agent_utterance_received.mp3"
  },
  {
    id: 3,
    key: "agentWakeUp",
    name: "Agent Wake up",
    desc: "Активация голосового помощника",
    action: "Голосовой помощник: пробуждение",
    tier: PS5_AUDIO_TIERS.RESERVED,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/agent_wake_up.wav",
    altFile: "assets/audio/agent_wake_up.mp3"
  },
  {
    id: 4,
    key: "backspace",
    name: "Backspace",
    desc: "Удаление символа в поле ввода",
    action: "Удаление символа",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/backspace.wav",
    altFile: "assets/audio/backspace.mp3"
  },
  {
    id: 5,
    key: "cancel",
    name: "Cancel",
    desc: "Отмена действия, закрытие диалога, кнопка «Назад»",
    action: "Назад",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/cancel.wav",
    altFile: "assets/audio/cancel.mp3"
  },
  {
    id: 6,
    key: "changePanel",
    name: "Change Panel",
    desc: "Переключение вкладки или панели интерфейса",
    action: "Переключение панели",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.NAV,
    file: "assets/audio/change_panel.wav",
    altFile: "assets/audio/change_panel.mp3"
  },
  {
    id: 7,
    key: "changePanel2",
    name: "Change Panel 2",
    desc: "Альтернативное переключение панели",
    action: "Альтернативное переключение панели",
    tier: PS5_AUDIO_TIERS.RESERVED,
    channel: PS5_AUDIO_CHANNELS.NAV,
    file: "assets/audio/change_panel_2.wav",
    altFile: "assets/audio/change_panel_2.mp3"
  },
  {
    id: 8,
    key: "changeSpace",
    name: "Change Space",
    desc: "Переключение рабочего пространства",
    action: "Переключение пространства",
    tier: PS5_AUDIO_TIERS.RESERVED,
    channel: PS5_AUDIO_CHANNELS.NAV,
    file: "assets/audio/change_space.wav",
    altFile: "assets/audio/change_space.mp3"
  },
  {
    id: 9,
    key: "closeControlCenter",
    name: "Close Control Center",
    desc: "Закрытие центра управления (Control Center)",
    action: "Закрытие Control Center",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/close_control_center.wav",
    altFile: "assets/audio/close_control_center.mp3"
  },
  {
    id: 10,
    key: "closeOptionMenu",
    name: "Close Option Menu",
    desc: "Закрытие всплывающего меню параметров (Options Menu)",
    action: "Закрытие меню параметров",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/close_option_menu.wav",
    altFile: "assets/audio/close_option_menu.mp3"
  },
  {
    id: 11,
    key: "enter",
    name: "Enter",
    desc: "Подтверждение выбора, нажатие кнопки, запуск",
    action: "Подтверждение",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/enter.wav",
    altFile: "assets/audio/enter.mp3"
  },
  {
    id: 12,
    key: "errorInTextBox",
    name: "Error in Text Box",
    desc: "Ошибка ввода данных в поле ввода",
    action: "Ошибка ввода",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/error_in_text_box.wav",
    altFile: "assets/audio/error_in_text_box.mp3"
  },
  {
    id: 13,
    key: "error",
    name: "Error",
    desc: "Общая системная ошибка",
    action: "Системная ошибка",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/error.wav",
    altFile: "assets/audio/error.mp3"
  },
  {
    id: 14,
    key: "errorToasts",
    name: "Error Toasts",
    desc: "Всплывающее уведомление об ошибке",
    action: "Уведомление об ошибке",
    tier: PS5_AUDIO_TIERS.FEATURED,
    channel: PS5_AUDIO_CHANNELS.NOTIF,
    file: "assets/audio/error_toasts.wav",
    altFile: "assets/audio/error_toasts.mp3"
  },
  {
    id: 15,
    key: "faceRecognition",
    name: "Face Recognition",
    desc: "Успешное распознавание лица камерой PS5",
    action: "Распознавание лица",
    tier: PS5_AUDIO_TIERS.RESERVED,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/face_recognition.wav",
    altFile: "assets/audio/face_recognition.mp3"
  },
  {
    id: 16,
    key: "focusMoveInKeyboard",
    name: "Focus Move in Keyboard",
    desc: "Перемещение курсора по экранной клавиатуре (OSK)",
    action: "Перемещение по клавиатуре",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.NAV,
    file: "assets/audio/focus_move_in_keyboard.wav",
    altFile: "assets/audio/focus_move_in_keyboard.mp3"
  },
  {
    id: 17,
    key: "focusMove",
    name: "Focus Move",
    desc: "Перемещение фокуса по элементам меню и карточкам",
    action: "Перемещение по меню",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.NAV,
    file: "assets/audio/focus_move.wav",
    altFile: "assets/audio/focus_move.mp3"
  },
  {
    id: 18,
    key: "informativeToasts",
    name: "Informative Toasts",
    desc: "Информационное всплывающее системное уведомление",
    action: "Информационное уведомление",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.NOTIF,
    file: "assets/audio/informative_toasts.wav",
    altFile: "assets/audio/informative_toasts.mp3"
  },
  {
    id: 19,
    key: "interactiveToasts",
    name: "Interactive Toasts",
    desc: "Интерактивное всплывающее системное уведомление",
    action: "Интерактивное уведомление",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.NOTIF,
    file: "assets/audio/interactive_toasts.wav",
    altFile: "assets/audio/interactive_toasts.mp3"
  },
  {
    id: 20,
    key: "joinParty",
    name: "Join Party",
    desc: "Присоединение к голосовой тусовке (Party)",
    action: "Вход в группу",
    tier: PS5_AUDIO_TIERS.FEATURED,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/join_party.wav",
    altFile: "assets/audio/join_party.mp3"
  },
  {
    id: 21,
    key: "leaveParty",
    name: "Leave Party",
    desc: "Выход из голосовой тусовки (Party)",
    action: "Выход из группы",
    tier: PS5_AUDIO_TIERS.FEATURED,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/leave_party.wav",
    altFile: "assets/audio/leave_party.mp3"
  },
  {
    id: 22,
    key: "logOut",
    name: "Log Out",
    desc: "Выход из профиля или перевод системы в режим покоя",
    action: "Выход из профиля",
    tier: PS5_AUDIO_TIERS.FEATURED,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/log_out.wav",
    altFile: "assets/audio/log_out.mp3"
  },
  {
    id: 23,
    key: "neutralInDialog",
    name: "Neutral in Dialog",
    desc: "Нейтральный выбор в диалоговом окне",
    action: "Нейтральный ответ в диалоге",
    tier: PS5_AUDIO_TIERS.RESERVED,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/neutral_in_dialog.wav",
    altFile: "assets/audio/neutral_in_dialog.mp3"
  },
  {
    id: 24,
    key: "noInDialog",
    name: "No in Dialog",
    desc: "Отрицательный выбор в диалоговом окне",
    action: "Ответ «Нет» в диалоге",
    tier: PS5_AUDIO_TIERS.RESERVED,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/no_in_dialog.wav",
    altFile: "assets/audio/no_in_dialog.mp3"
  },
  {
    id: 25,
    key: "openControlCenter",
    name: "Open Control Center",
    desc: "Открытие центра управления (Control Center)",
    action: "Открытие Control Center",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/open_control_center.wav",
    altFile: "assets/audio/open_control_center.mp3"
  },
  {
    id: 26,
    key: "openDialog",
    name: "Open Dialog",
    desc: "Открытие модального окна или карточки",
    action: "Открытие модального окна",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/open_dialog.wav",
    altFile: "assets/audio/open_dialog.mp3"
  },
  {
    id: 27,
    key: "openErrorDialog",
    name: "Open Error Dialog",
    desc: "Открытие модального окна с ошибкой",
    action: "Открытие окна ошибки",
    tier: PS5_AUDIO_TIERS.FEATURED,
    channel: PS5_AUDIO_CHANNELS.NOTIF,
    file: "assets/audio/open_error_dialog.wav",
    altFile: "assets/audio/open_error_dialog.mp3"
  },
  {
    id: 28,
    key: "openHome",
    name: "Open Home",
    desc: "Переход на главный экран Welcome Hub / Домой",
    action: "Открытие главного меню",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/open_home.wav",
    altFile: "assets/audio/open_home.mp3"
  },
  {
    id: 29,
    key: "openOptionMenu",
    name: "Open Option Menu",
    desc: "Открытие всплывающего контекстного меню параметров",
    action: "Открытие меню параметров",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/open_option_menu.wav",
    altFile: "assets/audio/open_option_menu.mp3"
  },
  {
    id: 30,
    key: "openOsk",
    name: "Open OSK",
    desc: "Открытие экранной клавиатуры",
    action: "Открытие клавиатуры",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/open_osk.wav",
    altFile: "assets/audio/open_osk.mp3"
  },
  {
    id: 31,
    key: "passCode",
    name: "Pass Code",
    desc: "Ввод цифры системного пароля",
    action: "Ввод кода доступа",
    tier: PS5_AUDIO_TIERS.RESERVED,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/pass_code.wav",
    altFile: "assets/audio/pass_code.mp3"
  },
  {
    id: 32,
    key: "platinumTrophyToast",
    name: "Platinum Trophy Toast",
    desc: "Звон получения платинового приза PS5",
    action: "Получение платинового трофея",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.NOTIF,
    file: "assets/audio/platinum_trophy_toast.wav",
    altFile: "assets/audio/platinum_trophy_toast.mp3"
  },
  {
    id: 33,
    key: "purchaseUniversalCheckout",
    name: "Purchase Universal Checkout",
    desc: "Подтверждение цифровой покупки в PlayStation Store",
    action: "Подтверждение покупки",
    tier: PS5_AUDIO_TIERS.FEATURED,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/purchase_universal_checkout.wav",
    altFile: "assets/audio/purchase_universal_checkout.mp3"
  },
  {
    id: 34,
    key: "sliderLevelMeter",
    name: "Slider Level Meter",
    desc: "Изменение уровня ползунка громкости или яркости",
    action: "Изменение ползунка",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/slider_level_meter.wav",
    altFile: "assets/audio/slider_level_meter.mp3"
  },
  {
    id: 35,
    key: "switchOff",
    name: "Switch Off",
    desc: "Выключение системного переключателя (Toggle OFF)",
    action: "Выключение переключателя",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/switch_off.wav",
    altFile: "assets/audio/switch_off.mp3"
  },
  {
    id: 36,
    key: "switchOn",
    name: "Switch On",
    desc: "Включение системного переключателя (Toggle ON)",
    action: "Включение переключателя",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/switch_on.wav",
    altFile: "assets/audio/switch_on.mp3"
  },
  {
    id: 37,
    key: "takeScreenshot",
    name: "Take Screenshot",
    desc: "Создание снимка экрана DualSense Create",
    action: "Создание скриншота",
    tier: PS5_AUDIO_TIERS.FEATURED,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/take_screenshot.wav",
    altFile: "assets/audio/take_screenshot.mp3"
  },
  {
    id: 38,
    key: "textInput",
    name: "Text Input",
    desc: "Ввод буквы или символа с клавиатуры",
    action: "Ввод текста",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/text_input.wav",
    altFile: "assets/audio/text_input.mp3"
  },
  {
    id: 39,
    key: "trophyToast",
    name: "Trophy Toast",
    desc: "Звон получения трофея (бронза, серебро, золото)",
    action: "Получение трофея",
    tier: PS5_AUDIO_TIERS.ACTIVE,
    channel: PS5_AUDIO_CHANNELS.NOTIF,
    file: "assets/audio/trophy_toast.wav",
    altFile: "assets/audio/trophy_toast.mp3"
  },
  {
    id: 40,
    key: "ttsCannotMoveFocus",
    name: "TTS Cannot Move Focus",
    desc: "Ошибка перемещения экранного диктора",
    action: "Диктор: ошибка перемещения",
    tier: PS5_AUDIO_TIERS.RESERVED,
    channel: PS5_AUDIO_CHANNELS.NAV,
    file: "assets/audio/tts_cannot_move_focus.wav",
    altFile: "assets/audio/tts_cannot_move_focus.mp3"
  },
  {
    id: 41,
    key: "undefinedSound",
    name: "Undefined",
    desc: "Резервное неопределённое системное событие",
    action: "Неопределённое событие",
    tier: PS5_AUDIO_TIERS.RESERVED,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/undefined.wav",
    altFile: "assets/audio/undefined.mp3"
  },
  {
    id: 42,
    key: "voiceRecognitionForOskEnds",
    name: "Voice Recognition for OSK Ends",
    desc: "Завершение голосового набора текста",
    action: "Завершение голосового набора",
    tier: PS5_AUDIO_TIERS.RESERVED,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/voice_recognition_for_osk_ends.wav",
    altFile: "assets/audio/voice_recognition_for_osk_ends.mp3"
  },
  {
    id: 43,
    key: "voiceRecognitionForOskError",
    name: "Voice Recognition for OSK Error",
    desc: "Ошибка распознавания речи для ввода",
    action: "Ошибка голосового набора",
    tier: PS5_AUDIO_TIERS.RESERVED,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/voice_recognition_for_osk_error.wav",
    altFile: "assets/audio/voice_recognition_for_osk_error.mp3"
  },
  {
    id: 44,
    key: "voiceRecognitionForOskStarts",
    name: "Voice Recognition for OSK Starts",
    desc: "Начало голосового набора текста",
    action: "Начало голосового набора",
    tier: PS5_AUDIO_TIERS.RESERVED,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/voice_recognition_for_osk_starts.wav",
    altFile: "assets/audio/voice_recognition_for_osk_starts.mp3"
  },
  {
    id: 45,
    key: "yesInDialog",
    name: "Yes in Dialog",
    desc: "Положительный выбор в диалоговом окне",
    action: "Ответ «Да» в диалоге",
    tier: PS5_AUDIO_TIERS.RESERVED,
    channel: PS5_AUDIO_CHANNELS.UI,
    file: "assets/audio/yes_in_dialog.wav",
    altFile: "assets/audio/yes_in_dialog.mp3"
  }
];

export function getSoundEntry(keyOrId) {
  if (typeof keyOrId === "number") {
    return PS5_SOUND_CATALOG.find(s => s.id === keyOrId) || null;
  }
  return PS5_SOUND_CATALOG.find(s => s.key === keyOrId) || null;
}

export function getActiveAndFeaturedSounds() {
  return PS5_SOUND_CATALOG.filter(s => s.tier !== PS5_AUDIO_TIERS.RESERVED);
}

export function getReservedSounds() {
  return PS5_SOUND_CATALOG.filter(s => s.tier === PS5_AUDIO_TIERS.RESERVED);
}

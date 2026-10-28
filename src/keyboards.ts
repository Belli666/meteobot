import { InlineKeyboardMarkup, ReplyKeyboardMarkup } from 'node-telegram-bot-api';
import { UserRecord } from './db';
import { Language, I18N_TEXTS } from './i18n';
import { KYRGYZ_REGIONS, KyrgyzRegion } from './kyrgyzstanData';

/**
 * Меню выбора языка (Кыргызча / Русский / English)
 */
export function getLanguageSelectionKeyboard(): { reply_markup: InlineKeyboardMarkup } {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🇰🇬 Кыргызча', callback_data: 'set_lang:ky' },
          { text: '🇷🇺 Русский', callback_data: 'set_lang:ru' },
          { text: '🇬🇧 English', callback_data: 'set_lang:en' },
        ],
      ],
    },
  };
}

/**
 * Стартовая клавиатура для онбординга (Reply Keyboard)
 */
export function getOnboardingReplyKeyboard(lang: Language = 'ru'): { reply_markup: ReplyKeyboardMarkup } {
  const b = I18N_TEXTS.buttons;
  const isKy = lang === 'ky';
  const isEn = lang === 'en';

  const bishkek = isKy ? '🏛️ Бишкек' : isEn ? '🏛️ Bishkek' : '🏛️ Бишкек';
  const osh = isKy ? '⛰️ Ош' : isEn ? '⛰️ Osh' : '⛰️ г. Ош';
  const chuy = isKy ? '🌾 Чүй' : isEn ? '🌾 Chuy' : '🌾 Чуй';
  const ik = isKy ? '🌊 Ысык-Көл' : isEn ? '🌊 Issyk-Kul' : '🌊 Иссык-Куль';
  const oshObl = isKy ? '🏔️ Ош облусу' : isEn ? '🏔️ Osh reg.' : '🏔️ Ош обл.';
  const ja = isKy ? '🌿 Жалал-Абад' : isEn ? '🌿 Jalal-Abad' : '🌿 Джалал-Абад';
  const naryn = isKy ? '⛰️ Нарын' : isEn ? '⛰️ Naryn' : '⛰️ Нарын';
  const talas = isKy ? '🌾 Талас' : isEn ? '🌾 Talas' : '🌾 Талас';
  const batken = isKy ? '🏜️ Баткен' : isEn ? '🏜️ Batken' : '🏜️ Баткен';

  return {
    reply_markup: {
      keyboard: [
        [{ text: b.sendLocation[lang], request_location: true }],
        [{ text: b.selectRegion[lang] }],
        [{ text: bishkek }, { text: osh }],
        [{ text: chuy }, { text: ik }],
        [{ text: oshObl }, { text: ja }],
        [{ text: naryn }, { text: talas }, { text: batken }],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  };
}

/**
 * Постоянная нижняя панель быстрого доступа
 */
export function getMainReplyKeyboard(lang: Language = 'ru'): { reply_markup: ReplyKeyboardMarkup } {
  const b = I18N_TEXTS.buttons;
  return {
    reply_markup: {
      keyboard: [
        [{ text: b.myWeather[lang] }, { text: b.forecast3d[lang] }],
        [{ text: b.selectRegion[lang] }, { text: b.settings[lang] }],
        [{ text: b.sendLocation[lang], request_location: true }],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  };
}

/**
 * Интерактивное Inline-меню со всеми областями Кыргызстана
 */
export function getKyrgyzstanRegionsKeyboard(lang: Language = 'ru'): { reply_markup: InlineKeyboardMarkup } {
  const rows: { text: string; callback_data: string }[][] = [];

  const bishkek = KYRGYZ_REGIONS.find((r) => r.id === 'bishkek')!;
  const oshCity = KYRGYZ_REGIONS.find((r) => r.id === 'osh_city')!;
  rows.push([
    { text: `${bishkek.emoji} ${bishkek.name[lang]}`, callback_data: 'kg_reg:bishkek' },
    { text: `${oshCity.emoji} ${oshCity.name[lang]}`, callback_data: 'kg_reg:osh_city' },
  ]);

  const chuy = KYRGYZ_REGIONS.find((r) => r.id === 'chuy')!;
  const ik = KYRGYZ_REGIONS.find((r) => r.id === 'issyk_kul')!;
  rows.push([
    { text: `${chuy.emoji} ${chuy.name[lang]}`, callback_data: 'kg_reg:chuy' },
    { text: `${ik.emoji} ${ik.name[lang]}`, callback_data: 'kg_reg:issyk_kul' },
  ]);

  const oshObl = KYRGYZ_REGIONS.find((r) => r.id === 'osh_oblast')!;
  const ja = KYRGYZ_REGIONS.find((r) => r.id === 'jalal_abad')!;
  rows.push([
    { text: `${oshObl.emoji} ${oshObl.name[lang]}`, callback_data: 'kg_reg:osh_oblast' },
    { text: `${ja.emoji} ${ja.name[lang]}`, callback_data: 'kg_reg:jalal_abad' },
  ]);

  const naryn = KYRGYZ_REGIONS.find((r) => r.id === 'naryn')!;
  const talas = KYRGYZ_REGIONS.find((r) => r.id === 'talas')!;
  rows.push([
    { text: `${naryn.emoji} ${naryn.name[lang]}`, callback_data: 'kg_reg:naryn' },
    { text: `${talas.emoji} ${talas.name[lang]}`, callback_data: 'kg_reg:talas' },
  ]);

  const batken = KYRGYZ_REGIONS.find((r) => r.id === 'batken')!;
  rows.push([
    { text: `${batken.emoji} ${batken.name[lang]}`, callback_data: 'kg_reg:batken' },
  ]);

  return {
    reply_markup: {
      inline_keyboard: rows,
    },
  };
}

/**
 * Меню городов и районов конкретной области
 */
export function getKyrgyzstanPlacesKeyboard(reg: KyrgyzRegion, lang: Language = 'ru'): { reply_markup: InlineKeyboardMarkup } {
  const rows: { text: string; callback_data: string }[][] = [];

  for (let i = 0; i < reg.places.length; i += 2) {
    const p1 = reg.places[i];
    const p2 = reg.places[i + 1];

    const row = [{ text: p1.name[lang] || p1.name.ru, callback_data: `kg_place:${p1.id}` }];
    if (p2) {
      row.push({ text: p2.name[lang] || p2.name.ru, callback_data: `kg_place:${p2.id}` });
    }
    rows.push(row);
  }

  const backText = lang === 'ky' ? '⬅️ Облустарга кайтуу' : lang === 'en' ? '⬅️ Back to regions' : '⬅️ Назад к областям';
  rows.push([{ text: backText, callback_data: 'open_kg_regions' }]);

  return {
    reply_markup: {
      inline_keyboard: rows,
    },
  };
}

/**
 * Компактное Inline-меню под главной карточкой погоды (по фидбеку QA)
 */
export function getWeatherInlineKeyboard(lang: Language = 'ru'): { reply_markup: InlineKeyboardMarkup } {
  const b = I18N_TEXTS.buttons;

  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: b.hourly[lang], callback_data: 'weather_hourly' },
          { text: b.forecast3d[lang], callback_data: 'weather_3d' },
        ],
        [
          { text: b.details[lang], callback_data: 'weather_details' },
          { text: b.selectRegion[lang], callback_data: 'open_kg_regions' },
        ],
        [
          { text: b.refresh[lang], callback_data: 'weather_refresh' },
          { text: b.settings[lang], callback_data: 'menu_settings' },
        ],
      ],
    },
  };
}

/**
 * Подменю для экранов деталей, почасового и 3-дневного прогноза
 */
export function getWeatherSubScreenKeyboard(lang: Language = 'ru'): { reply_markup: InlineKeyboardMarkup } {
  const b = I18N_TEXTS.buttons;

  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: b.backToWeather[lang], callback_data: 'weather_main' },
          { text: b.refresh[lang], callback_data: 'weather_refresh' },
        ],
      ],
    },
  };
}

/**
 * Упрощённое меню настроек
 */
export function getSettingsInlineKeyboard(user: UserRecord): { reply_markup: InlineKeyboardMarkup } {
  const lang = user.language || 'ru';
  const isKy = lang === 'ky';
  const isEn = lang === 'en';

  const notifyState = user.notify_enabled ? I18N_TEXTS.enabled[lang] : I18N_TEXTS.disabled[lang];
  const rainState = user.alert_rain ? I18N_TEXTS.enabled[lang] : I18N_TEXTS.disabled[lang];
  const stormState = user.alert_storm ? I18N_TEXTS.enabled[lang] : I18N_TEXTS.disabled[lang];

  // Полное время с минутами
  let cleanTime = user.notify_time || '07:30';
  if (cleanTime.length <= 2) {
    cleanTime = `${cleanTime.padStart(2, '0')}:00`;
  }

  const morningText = `🔔 ${I18N_TEXTS.settingsMorning[lang]} ${notifyState}`;
  const timeText = `⏰ ${cleanTime} (Asia/Bishkek)`;
  const rainAlertText = `☔ ${I18N_TEXTS.settingsRain[lang]} ${rainState}`;
  const stormAlertText = `🚨 ${I18N_TEXTS.settingsStorm[lang]} ${stormState}`;

  const langText = isKy ? `🌐 Тил: Кыргызча 🇰🇬` : isEn ? `🌐 Lang: English 🇬🇧` : `🌐 Язык: Русский 🇷🇺`;
  const regionText = isKy ? '🗺️ Сменить регион' : isEn ? '🗺️ Change region' : '🗺️ Сменить регион';
  const resetText = isKy ? '🗑️ Баарын тазалоо / Сброс' : isEn ? '🗑️ Reset settings' : '🗑️ Сбросить настройки';
  const backText = I18N_TEXTS.buttons.backToWeather[lang];

  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: morningText, callback_data: 'toggle_notify' }],
        [{ text: timeText, callback_data: 'choose_time' }],
        [
          { text: rainAlertText, callback_data: 'toggle_rain' },
          { text: stormAlertText, callback_data: 'toggle_storm' },
        ],
        [{ text: langText, callback_data: 'choose_language' }],
        [{ text: regionText, callback_data: 'open_kg_regions' }],
        [{ text: resetText, callback_data: 'request_reset' }],
        [{ text: backText, callback_data: 'weather_main' }],
      ],
    },
  };
}

/**
 * Клавиатура подтверждения очистки памяти
 */
export function getResetConfirmationKeyboard(lang: Language = 'ru'): { reply_markup: InlineKeyboardMarkup } {
  const isKy = lang === 'ky';
  const isEn = lang === 'en';

  const confirmText = isKy ? '🗑️ Ооба, тазалоо' : isEn ? '🗑️ Yes, reset all' : '🗑️ Да, сбросить всё';
  const cancelText = isKy ? '❌ Жок, артка' : isEn ? '❌ Cancel' : '❌ Отмена';

  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: confirmText, callback_data: 'confirm_reset' },
          { text: cancelText, callback_data: 'menu_settings' },
        ],
      ],
    },
  };
}

/**
 * Выбор времени утреннего брифинга (по времени Бишкека / UTC+6)
 */
export function getTimeChoiceKeyboard(lang: Language = 'ru'): { reply_markup: InlineKeyboardMarkup } {
  const isKy = lang === 'ky';
  const isEn = lang === 'en';
  const backText = isKy ? '⬅️ Ырастоолорго кайтуу' : isEn ? '⬅️ Back to settings' : '⬅️ Назад к настройкам';

  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '06:30', callback_data: 'set_time:06:30' },
          { text: '07:00', callback_data: 'set_time:07:00' },
          { text: '07:30', callback_data: 'set_time:07:30' },
        ],
        [
          { text: '08:00', callback_data: 'set_time:08:00' },
          { text: '08:30', callback_data: 'set_time:08:30' },
          { text: '09:00', callback_data: 'set_time:09:00' },
        ],
        [
          { text: backText, callback_data: 'menu_settings' },
        ],
      ],
    },
  };
}

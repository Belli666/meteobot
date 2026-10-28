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

  const bishkek = isKy ? '🏛️ Бишкек шаары' : isEn ? '🏛️ Bishkek' : '🏛️ Бишкек';
  const osh = isKy ? '⛰️ Ош шаары' : isEn ? '⛰️ Osh' : '⛰️ г. Ош';
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
        [{ text: b.myWeather[lang] }, { text: b.umbrella[lang] }, { text: b.clothing[lang] }],
        [{ text: b.forecast3d[lang] }, { text: b.selectRegion[lang] }],
        [{ text: b.settings[lang] }],
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
export function getKyrgyzstanPlacesKeyboard(region: KyrgyzRegion, lang: Language = 'ru'): { reply_markup: InlineKeyboardMarkup } {
  const buttons: { text: string; callback_data: string }[][] = [];

  for (let i = 0; i < region.places.length; i += 2) {
    const row = [
      {
        text: region.places[i].name[lang] || region.places[i].name.ru,
        callback_data: `kg_place:${region.places[i].id}`,
      },
    ];
    if (region.places[i + 1]) {
      row.push({
        text: region.places[i + 1].name[lang] || region.places[i + 1].name.ru,
        callback_data: `kg_place:${region.places[i + 1].id}`,
      });
    }
    buttons.push(row);
  }

  const backLabel = I18N_TEXTS.buttons.back[lang];
  buttons.push([{ text: `⬅️ ${backLabel}`, callback_data: 'open_kg_regions' }]);

  return {
    reply_markup: {
      inline_keyboard: buttons,
    },
  };
}

/**
 * Интерактивное Inline-меню под карточкой погоды
 */
export function getWeatherInlineKeyboard(lang: Language = 'ru'): { reply_markup: InlineKeyboardMarkup } {
  const isKy = lang === 'ky';
  const isEn = lang === 'en';

  const refreshText = isKy ? '🔄 Жаңылоо' : isEn ? '🔄 Refresh' : '🔄 Обновить';
  const forecastText = isKy ? '📅 3 күндүк божомол' : isEn ? '📅 3-Day Forecast' : '📅 Прогноз 3 дня';
  const umbrellaText = isKy ? '☂️ Кол чатыр керекпи?' : isEn ? '☂️ Umbrella needed?' : '☂️ Нужен ли зонт?';
  const clothingText = isKy ? '🧥 Эмне кийүү керек?' : isEn ? '🧥 What to wear?' : '🧥 Что надеть?';
  const regionText = isKy ? '🗺️ Облусту алмаштыруу' : isEn ? '🗺️ Change Region' : '🗺️ Сменить область КР';
  const settingsText = isKy ? '⚙️ Ырастоолор' : isEn ? '⚙️ Settings' : '⚙️ Настройки';

  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: refreshText, callback_data: 'weather_refresh' },
          { text: forecastText, callback_data: 'weather_3d' },
        ],
        [
          { text: umbrellaText, callback_data: 'advice_umbrella' },
          { text: clothingText, callback_data: 'advice_clothing' },
        ],
        [
          { text: regionText, callback_data: 'open_kg_regions' },
          { text: settingsText, callback_data: 'menu_settings' },
        ],
      ],
    },
  };
}

/**
 * Меню настроек уведомлений
 */
export function getSettingsInlineKeyboard(user: UserRecord): { reply_markup: InlineKeyboardMarkup } {
  const lang = user.language || 'ru';
  const isKy = lang === 'ky';
  const isEn = lang === 'en';

  const notifyState = user.notify_enabled ? I18N_TEXTS.enabled[lang] : I18N_TEXTS.disabled[lang];
  const rainState = user.alert_rain ? I18N_TEXTS.enabled[lang] : I18N_TEXTS.disabled[lang];
  const stormState = user.alert_storm ? I18N_TEXTS.enabled[lang] : I18N_TEXTS.disabled[lang];

  const morningText = isKy ? `🔔 Эртең мененки маалымат: ${notifyState}` : isEn ? `🔔 Daily Briefing: ${notifyState}` : `🔔 Утренний брифинг: ${notifyState}`;
  const timeText = isKy ? `⏰ Убактысы: ${user.notify_time || '07:30'} (Бишкек)` : isEn ? `⏰ Time: ${user.notify_time || '07:30'} (Bishkek)` : `⏰ Время: ${user.notify_time || '07:30'} (Бишкек)`;
  const rainAlertText = isKy ? `☔ Жамгыр эскертүүсү: ${rainState}` : isEn ? `☔ Rain alert: ${rainState}` : `☔ Оповещение о дожде: ${rainState}`;
  const stormAlertText = isKy ? `🚨 Бороон эскертүүсү: ${stormState}` : isEn ? `🚨 Storm alert: ${stormState}` : `🚨 Штормовой алерт: ${stormState}`;
  const langText = isKy ? `🌐 Тил: 🇰🇬 Кыргызча` : isEn ? `🌐 Language: 🇬🇧 English` : `🌐 Язык: 🇷🇺 Русский`;
  const regionText = isKy ? '🗺️ Облусту алмаштыруу' : isEn ? '🗺️ Change Region' : '🗺️ Выбрать область КР';
  const resetText = isKy ? '🗑️ Дайындарды тазалоо / Сброс' : isEn ? '🗑️ Clear my data / Reset' : '🗑️ Сбросить память / данные';
  const backText = isKy ? '⬅️ Аба ырайына кайтуу' : isEn ? '⬅️ Back to weather' : '⬅️ Назад к погоде';

  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: morningText, callback_data: 'toggle_notify' }],
        [{ text: timeText, callback_data: 'choose_time' }],
        [{ text: rainAlertText, callback_data: 'toggle_rain' }],
        [{ text: stormAlertText, callback_data: 'toggle_storm' }],
        [{ text: langText, callback_data: 'choose_language' }],
        [{ text: regionText, callback_data: 'open_kg_regions' }],
        [{ text: resetText, callback_data: 'request_reset' }],
        [{ text: backText, callback_data: 'weather_refresh' }],
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
  const backText = I18N_TEXTS.buttons.back[lang];
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
          { text: `⬅️ ${backText}`, callback_data: 'menu_settings' },
        ],
      ],
    },
  };
}

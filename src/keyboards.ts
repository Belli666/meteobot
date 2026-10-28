import { InlineKeyboardMarkup, ReplyKeyboardMarkup } from 'node-telegram-bot-api';
import { UserRecord } from './db';
import { KYRGYZ_REGIONS, KyrgyzRegion } from './kyrgyzstanData';

/**
 * Клавиатура быстрого выбора геопозиции и областей Кыргызстана (Reply Keyboard)
 */
export function getOnboardingReplyKeyboard(): { reply_markup: ReplyKeyboardMarkup } {
  return {
    reply_markup: {
      keyboard: [
        [{ text: '📍 Отправить мою геопозицию', request_location: true }],
        [{ text: '🗺️ Выбрать область Кыргызстана' }],
        [{ text: '🏛️ Бишкек' }, { text: '⛰️ г. Ош' }],
        [{ text: '🌾 Чуй' }, { text: '🌊 Иссык-Куль' }],
        [{ text: '🏔️ Ош обл.' }, { text: '🌿 Джалал-Абад' }],
        [{ text: '⛰️ Нарын' }, { text: '🌾 Талас' }, { text: '🏜️ Баткен' }],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  };
}

/**
 * Постоянная нижняя панель быстрого доступа
 */
export function getMainReplyKeyboard(): { reply_markup: ReplyKeyboardMarkup } {
  return {
    reply_markup: {
      keyboard: [
        [{ text: '🌡️ Моя погода' }, { text: '☂️ Зонт' }, { text: '🧥 Что надеть' }],
        [{ text: '📅 Прогноз на 3 дня' }, { text: '🗺️ Выбрать область' }],
        [{ text: '⚙️ Настройки' }],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  };
}

/**
 * Интерактивное Inline-меню со всеми 7 областями Кыргызстана + 2 городами респ. значения
 */
export function getKyrgyzstanRegionsKeyboard(): { reply_markup: InlineKeyboardMarkup } {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🏛️ г. Бишкек', callback_data: 'kg_reg:bishkek' },
          { text: '⛰️ г. Ош', callback_data: 'kg_reg:osh_city' },
        ],
        [
          { text: '🌾 Чуйская область', callback_data: 'kg_reg:chuy' },
          { text: '🌊 Иссык-Кульская обл.', callback_data: 'kg_reg:issyk_kul' },
        ],
        [
          { text: '🏔️ Ошская область', callback_data: 'kg_reg:osh_oblast' },
          { text: '🌿 Джалал-Абадская обл.', callback_data: 'kg_reg:jalal_abad' },
        ],
        [
          { text: '⛰️ Нарынская область', callback_data: 'kg_reg:naryn' },
          { text: '🌾 Таласская область', callback_data: 'kg_reg:talas' },
        ],
        [
          { text: '🏜️ Баткенская область', callback_data: 'kg_reg:batken' },
        ],
      ],
    },
  };
}

/**
 * Меню городов и районов внутри конкретной области Кыргызстана
 */
export function getKyrgyzstanPlacesKeyboard(region: KyrgyzRegion): { reply_markup: InlineKeyboardMarkup } {
  const buttons: { text: string; callback_data: string }[][] = [];

  // Разбиваем города по 2 в ряд
  for (let i = 0; i < region.places.length; i += 2) {
    const row = [
      {
        text: region.places[i].name,
        callback_data: `kg_place:${region.places[i].id}`,
      },
    ];
    if (region.places[i + 1]) {
      row.push({
        text: region.places[i + 1].name,
        callback_data: `kg_place:${region.places[i + 1].id}`,
      });
    }
    buttons.push(row);
  }

  // Кнопка возврата к списку областей
  buttons.push([{ text: '⬅️ Назад ко всем областям КР', callback_data: 'open_kg_regions' }]);

  return {
    reply_markup: {
      inline_keyboard: buttons,
    },
  };
}

/**
 * Интерактивное Inline-меню под карточкой погоды
 */
export function getWeatherInlineKeyboard(): { reply_markup: InlineKeyboardMarkup } {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🔄 Обновить', callback_data: 'weather_refresh' },
          { text: '📅 Прогноз 3 дня', callback_data: 'weather_3d' },
        ],
        [
          { text: '☂️ Нужен ли зонт?', callback_data: 'advice_umbrella' },
          { text: '🧥 Что надеть?', callback_data: 'advice_clothing' },
        ],
        [
          { text: '🗺️ Сменить область КР', callback_data: 'open_kg_regions' },
          { text: '⚙️ Настройки', callback_data: 'menu_settings' },
        ],
      ],
    },
  };
}

/**
 * Меню настроек уведомлений
 */
export function getSettingsInlineKeyboard(user: UserRecord): { reply_markup: InlineKeyboardMarkup } {
  const notifyState = user.notify_enabled ? '✅ Вкл' : '❌ Выкл';
  const rainState = user.alert_rain ? '✅ Вкл' : '❌ Выкл';
  const stormState = user.alert_storm ? '✅ Вкл' : '❌ Выкл';

  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: `🔔 Утренний брифинг: ${notifyState}`,
            callback_data: 'toggle_notify',
          },
        ],
        [
          { text: `⏰ Время: ${user.notify_time || '07:30'} (Бишкек)`, callback_data: 'choose_time' },
        ],
        [
          {
            text: `☔ Оповещение о дожде: ${rainState}`,
            callback_data: 'toggle_rain',
          },
        ],
        [
          {
            text: `🚨 Штормовой алерт: ${stormState}`,
            callback_data: 'toggle_storm',
          },
        ],
        [
          { text: '🗺️ Выбрать область КР', callback_data: 'open_kg_regions' },
        ],
        [
          { text: '⬅️ Назад к погоде', callback_data: 'weather_refresh' },
        ],
      ],
    },
  };
}

/**
 * Выбор времени утреннего брифинга (по времени Бишкека / UTC+6)
 */
export function getTimeChoiceKeyboard(): { reply_markup: InlineKeyboardMarkup } {
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
          { text: '⬅️ Назад в настройки', callback_data: 'menu_settings' },
        ],
      ],
    },
  };
}

import { InlineKeyboardMarkup, ReplyKeyboardMarkup } from 'node-telegram-bot-api';
import { UserRecord } from './db';

/**
 * Клавиатура выбора геопозиции и основных областей/городов Кыргызстана
 */
export function getOnboardingReplyKeyboard(): { reply_markup: ReplyKeyboardMarkup } {
  return {
    reply_markup: {
      keyboard: [
        [{ text: '📍 Отправить мою геопозицию', request_location: true }],
        [{ text: '🏙️ Бишкек' }, { text: '🏔️ Ош' }],
        [{ text: '🌊 Каракол' }, { text: '⛰️ Нарын' }],
        [{ text: '🌿 Джалал-Абад' }, { text: '🌾 Талас' }],
        [{ text: '🏜️ Баткен' }, { text: '🏖️ Чолпон-Ата' }],
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
        [{ text: '📅 Прогноз на 3 дня' }, { text: '⚙️ Настройки' }],
        [{ text: '📍 Сменить область / город' }],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
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
          { text: '⚙️ Настройки утренней сводки', callback_data: 'menu_settings' },
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
          { text: '📍 Изменить область / город', callback_data: 'change_city' },
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

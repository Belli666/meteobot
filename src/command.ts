import TelegramBot from 'node-telegram-bot-api';
import { bot, RATE_LIMIT_USER_RPM, DEFAULT_COUNTRY } from './config';
import {
  getUser,
  registerOrUpdateUser,
  setUserLocation,
  updateUserSettings,
  UserRecord,
} from './db';
import {
  searchCities,
  reverseGeocode,
  fetchWeatherData,
  WeatherData,
} from './weatherService';
import {
  formatWeatherMessage,
  formatForecast3Days,
  generateAdvice,
} from './advisor';
import {
  getOnboardingReplyKeyboard,
  getMainReplyKeyboard,
  getWeatherInlineKeyboard,
  getSettingsInlineKeyboard,
  getTimeChoiceKeyboard,
  getKyrgyzstanRegionsKeyboard,
  getKyrgyzstanPlacesKeyboard,
} from './keyboards';
import { KYRGYZ_REGIONS, ALL_KYRGYZ_PLACES } from './kyrgyzstanData';

function isRateLimited(_userId: number): boolean {
  return false;
}

function cleanQuery(text: string): string {
  // Убираем ведущие эмодзи вроде '🏙️ Бишкек' -> 'Бишкек'
  return text.replace(/^[^\p{L}\p{N}]+/u, '').trim();
}

export function initCommands(): void {
  // Команда /start
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const from = msg.from;
    if (!from) return;

    if (isRateLimited(from.id)) {
      await bot.sendMessage(chatId, '⚠️ Слишком много запросов. Подождите несколько секунд.');
      return;
    }

    const user = registerOrUpdateUser(from.id, from.first_name || 'Друг', from.username);

    // Если локация ещё не задана — запускаем онбординг с обязательным выбором области Кыргызстана
    if (!user.city_name || !user.latitude || !user.longitude) {
      const welcomeText =
        `👋 **Салам, ${from.first_name}!**\n\n` +
        `🌤️ Я персональный метеорологический ассистент **MeteoBot** по Кыргызстану.\n\n` +
        `Я помогу тебе:\n` +
        `• ☂️ Всегда знать, **нужен ли сегодня зонт**, чтобы не промокнуть под дождем или снегом;\n` +
        `• 🧥 Подобрать одежду по комфорту («ощущается как»);\n` +
        `• 🔔 Получать утреннюю сводку в удобное для тебя время (по Бишкеку);\n` +
        `• 🚨 Заранее узнавать о штормовом ветре, пыльных бурях и осадках.\n\n` +
        `📍 **Чтобы начать, выберите свой регион/город:**\n` +
        `Нажмите кнопку ниже, чтобы поделиться геопозицией, выберите область из списка или просто напишите название своего города мне в ответ!`;

      await bot.sendMessage(chatId, welcomeText, {
        parse_mode: 'Markdown',
        ...getOnboardingReplyKeyboard(),
      });
      return;
    }

    // Если локация уже есть — показываем текущую погоду
    await sendUserWeather(chatId, user);
  });

  bot.onText(/\/regions/, async (msg) => {
    await bot.sendMessage(msg.chat.id, '🗺️ **Выберите область Кыргызстана:**', {
      parse_mode: 'Markdown',
      ...getKyrgyzstanRegionsKeyboard(),
    });
  });

  // Команда /help
  bot.onText(/\/help/, async (msg) => {
    const helpText =
      `📖 **Команды MeteoBot:**\n\n` +
      `• /start — перезапустить бота и открыть главное меню\n` +
      `• /weather — текущая погода и советы\n` +
      `• /umbrella — подробный анализ: нужен ли зонт сегодня\n` +
      `• /forecast — прогноз на 3 дня\n` +
      `• /settings — настроить утреннюю рассылку и уведомления\n` +
      `• /city <город> — быстро узнать погоду в любом другом городе\n\n` +
      `💡 *Ты также можешь просто написать название любого города в чат, или нажать «📍 Отправить геопозицию».*`;

    await bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'Markdown' });
  });

  // Команды /weather, /forecast, /umbrella, /settings
  bot.onText(/\/weather/, async (msg) => {
    const user = getUser(msg.from?.id || 0);
    if (!user || !user.latitude) {
      return askForLocation(msg.chat.id);
    }
    await sendUserWeather(msg.chat.id, user);
  });

  bot.onText(/\/forecast/, async (msg) => {
    const user = getUser(msg.from?.id || 0);
    if (!user || !user.latitude) return askForLocation(msg.chat.id);
    await sendForecast(msg.chat.id, user);
  });

  bot.onText(/\/umbrella/, async (msg) => {
    const user = getUser(msg.from?.id || 0);
    if (!user || !user.latitude) return askForLocation(msg.chat.id);
    await sendUmbrellaDetails(msg.chat.id, user);
  });

  bot.onText(/\/settings/, async (msg) => {
    const user = getUser(msg.from?.id || 0);
    if (!user) return;
    await sendSettingsMenu(msg.chat.id, user);
  });

  // Быстрый запрос погоды по городу: /city Москва
  bot.onText(/\/city (.+)/, async (msg, match) => {
    const query = match ? match[1].trim() : '';
    if (!query) return;
    await handleCitySearch(msg.chat.id, msg.from?.id || 0, query);
  });

  // Обработка отправки геопозиции пользователем
  bot.on('location', async (msg) => {
    const loc = msg.location;
    if (!loc || !msg.from) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;

    await bot.sendMessage(chatId, '🛰️ Опираясь на координаты, определяем ваш регион...');

    try {
      const cityName = await reverseGeocode(loc.latitude, loc.longitude);
      setUserLocation(userId, cityName, loc.latitude, loc.longitude);

      await bot.sendMessage(
        chatId,
        `✅ **Локация установлена:** ${cityName}!\n` +
        `Теперь все метеосводки, советы по зонту и уведомления настроены под этот регион.`,
        {
          parse_mode: 'Markdown',
          ...getMainReplyKeyboard(),
        }
      );

      const updatedUser = getUser(userId);
      if (updatedUser) {
        await sendUserWeather(chatId, updatedUser);
      }
    } catch (err: any) {
      console.error('Ошибка геолокации:', err);
      await bot.sendMessage(chatId, '❌ Не удалось определить город по координатам. Попробуйте ввести название текстом.');
    }
  });

  // Обработка обычных текстовых сообщений (кнопки нижней клавиатуры и ввод города)
  bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/') || msg.location) return;

    const text = msg.text.trim();
    const chatId = msg.chat.id;
    const userId = msg.from?.id || 0;

    if (isRateLimited(userId)) {
      await bot.sendMessage(chatId, '⚠️ Слишком много сообщений. Пожалуйста, подождите пару секунд.');
      return;
    }

    const user = getUser(userId);

    // Кнопки нижней панели
    if (text === '🌡️ Моя погода') {
      if (!user || !user.latitude) return askForLocation(chatId);
      return sendUserWeather(chatId, user);
    }

    if (text === '☂️ Зонт') {
      if (!user || !user.latitude) return askForLocation(chatId);
      return sendUmbrellaDetails(chatId, user);
    }

    if (text === '🧥 Что надеть') {
      if (!user || !user.latitude) return askForLocation(chatId);
      return sendClothingDetails(chatId, user);
    }

    if (text === '📅 Прогноз на 3 дня') {
      if (!user || !user.latitude) return askForLocation(chatId);
      return sendForecast(chatId, user);
    }

    if (text === '⚙️ Настройки') {
      if (!user) return;
      return sendSettingsMenu(chatId, user);
    }

    if (
      text === '🗺️ Выбрать область Кыргызстана' ||
      text === '🗺️ Выбрать область КР' ||
      text === '🗺️ Выбрать область' ||
      text === '/regions'
    ) {
      await bot.sendMessage(chatId, '🗺️ **Выберите область Кыргызстана:**', {
        parse_mode: 'Markdown',
        ...getKyrgyzstanRegionsKeyboard(),
      });
      return;
    }

    if (text === '📍 Сменить область / город' || text === '📍 Сменить локацию') {
      await bot.sendMessage(
        chatId,
        '📍 **Выберите область Кыргызстана кнопкой ниже или напишите название села/города:**',
        {
          parse_mode: 'Markdown',
          ...getKyrgyzstanRegionsKeyboard(),
        }
      );
      return;
    }

    // Если это город (включая кнопки с эмодзи вроде '🏙️ Бишкек')
    const queryToSearch = cleanQuery(text);
    await handleCitySearch(chatId, userId, queryToSearch);
  });

  // Обработка Inline-кнопок
  bot.on('callback_query', async (query) => {
    const data = query.data;
    const msg = query.message;
    if (!data || !msg || !query.from) return;

    const chatId = msg.chat.id;
    const userId = query.from.id;
    const user = getUser(userId);

    await bot.answerCallbackQuery(query.id);

    try {
      if (data === 'weather_refresh') {
        if (!user || !user.latitude) return askForLocation(chatId);
        return sendUserWeather(chatId, user, msg.message_id);
      }

      if (data === 'weather_3d') {
        if (!user || !user.latitude) return askForLocation(chatId);
        return sendForecast(chatId, user);
      }

      if (data === 'advice_umbrella') {
        if (!user || !user.latitude) return askForLocation(chatId);
        return sendUmbrellaDetails(chatId, user);
      }

      if (data === 'advice_clothing') {
        if (!user || !user.latitude) return askForLocation(chatId);
        return sendClothingDetails(chatId, user);
      }

      if (data === 'menu_settings') {
        if (!user) return;
        return sendSettingsMenu(chatId, user, msg.message_id);
      }

      if (data === 'toggle_notify') {
        if (!user) return;
        updateUserSettings(userId, { notify_enabled: user.notify_enabled ? 0 : 1 });
        const updated = getUser(userId)!;
        return sendSettingsMenu(chatId, updated, msg.message_id);
      }

      if (data === 'toggle_rain') {
        if (!user) return;
        updateUserSettings(userId, { alert_rain: user.alert_rain ? 0 : 1 });
        const updated = getUser(userId)!;
        return sendSettingsMenu(chatId, updated, msg.message_id);
      }

      if (data === 'toggle_storm') {
        if (!user) return;
        updateUserSettings(userId, { alert_storm: user.alert_storm ? 0 : 1 });
        const updated = getUser(userId)!;
        return sendSettingsMenu(chatId, updated, msg.message_id);
      }

      if (data === 'choose_time') {
        await bot.editMessageText('⏰ **Выберите удобное время для ежедневной утренней сводки:**', {
          chat_id: chatId,
          message_id: msg.message_id,
          parse_mode: 'Markdown',
          ...getTimeChoiceKeyboard(),
        });
        return;
      }

      if (data.startsWith('set_time:')) {
        const time = data.split(':')[1];
        updateUserSettings(userId, { notify_time: time, notify_enabled: 1 });
        const updated = getUser(userId)!;
        await bot.sendMessage(chatId, `⏰ Время утренней сводки успешно установлено на **${time}**!`, {
          parse_mode: 'Markdown',
        });
        return sendSettingsMenu(chatId, updated);
      }

      if (data.startsWith('set_city:')) {
        // Формат set_city:lat:lon:name
        const parts = data.split(':');
        const lat = parseFloat(parts[1]);
        const lon = parseFloat(parts[2]);
        const name = parts.slice(3).join(':');

        setUserLocation(userId, name, lat, lon);
        await bot.sendMessage(
          chatId,
          `✅ **Город сохранён:** ${name}!\nТеперь этот регион используется по умолчанию.`,
          {
            parse_mode: 'Markdown',
            ...getMainReplyKeyboard(),
          }
        );

        const updated = getUser(userId)!;
        return sendUserWeather(chatId, updated);
      }

      if (data === 'open_kg_regions') {
        await bot.editMessageText('🗺️ **Выберите область Кыргызстана:**', {
          chat_id: chatId,
          message_id: msg.message_id,
          parse_mode: 'Markdown',
          ...getKyrgyzstanRegionsKeyboard(),
        });
        return;
      }

      if (data.startsWith('kg_reg:')) {
        const regId = data.split(':')[1];
        const reg = KYRGYZ_REGIONS.find((r) => r.id === regId);
        if (!reg) return;

        // Если это город республиканского значения (Бишкек или Ош) — сразу сохраняем
        if (reg.places.length === 1) {
          const place = reg.places[0];
          setUserLocation(userId, place.name, place.latitude, place.longitude, place.timezone);
          await bot.sendMessage(
            chatId,
            `✅ **Локация установлена:** ${place.name}!\nВсе метеосводки переключены на этот город.`,
            { parse_mode: 'Markdown', ...getMainReplyKeyboard() }
          );
          const updated = getUser(userId)!;
          return sendUserWeather(chatId, updated);
        }

        // Если область — открываем список городов/районов этой области
        await bot.editMessageText(
          `${reg.emoji} **${reg.name}**\nВыберите нужный город или район:`,
          {
            chat_id: chatId,
            message_id: msg.message_id,
            parse_mode: 'Markdown',
            ...getKyrgyzstanPlacesKeyboard(reg),
          }
        );
        return;
      }

      if (data.startsWith('kg_place:')) {
        const placeId = data.split(':')[1];
        const place = ALL_KYRGYZ_PLACES.find((p) => p.id === placeId);
        if (!place) return;

        const fullName = `${place.name} (${place.region})`;
        setUserLocation(userId, fullName, place.latitude, place.longitude, place.timezone);
        await bot.sendMessage(
          chatId,
          `✅ **Локация установлена:** ${fullName}!\nТеперь этот регион Кыргызстана используется по умолчанию.`,
          { parse_mode: 'Markdown', ...getMainReplyKeyboard() }
        );
        const updated = getUser(userId)!;
        return sendUserWeather(chatId, updated);
      }

      if (data === 'change_city') {
        await bot.sendMessage(
          chatId,
          '📍 **Выберите область Кыргызстана или напишите название города:**',
          {
            parse_mode: 'Markdown',
            ...getKyrgyzstanRegionsKeyboard(),
          }
        );
        return;
      }
    } catch (err: any) {
      console.error('Ошибка в callback query:', err);
    }
  });
}

async function sendUserWeather(chatId: number, user: UserRecord, editMessageId?: number): Promise<void> {
  if (!user.city_name || !user.latitude || !user.longitude) {
    return askForLocation(chatId);
  }

  try {
    const weather = await fetchWeatherData(user.city_name, user.latitude, user.longitude, user.timezone);
    const text = formatWeatherMessage(weather);

    if (editMessageId) {
      await bot.editMessageText(text, {
        chat_id: chatId,
        message_id: editMessageId,
        parse_mode: 'Markdown',
        ...getWeatherInlineKeyboard(),
      });
    } else {
      await bot.sendMessage(chatId, text, {
        parse_mode: 'Markdown',
        ...getWeatherInlineKeyboard(),
      });
    }
  } catch (err: any) {
    console.error('Ошибка получения погоды:', err);
    await bot.sendMessage(chatId, '⚠️ Не удалось связаться с метеосервисом. Пожалуйста, попробуйте через минуту.');
  }
}

async function sendForecast(chatId: number, user: UserRecord): Promise<void> {
  try {
    const weather = await fetchWeatherData(user.city_name!, user.latitude!, user.longitude!, user.timezone);
    const text = formatForecast3Days(weather);
    await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
  } catch (err: any) {
    await bot.sendMessage(chatId, '⚠️ Не удалось получить прогноз.');
  }
}

async function sendUmbrellaDetails(chatId: number, user: UserRecord): Promise<void> {
  try {
    const weather = await fetchWeatherData(user.city_name!, user.latitude!, user.longitude!, user.timezone);
    const advice = generateAdvice(weather);
    const cur = weather.current;

    let hourlyRainTimeline = '';
    if (weather.hourlyNext12h.length) {
      hourlyRainTimeline = '\n⏱️ **Вероятность осадков по часам:**\n' +
        weather.hourlyNext12h
          .slice(0, 8)
          .map((h) => {
            const bar = '█'.repeat(Math.round(h.precipitationProbability / 20)) + '░'.repeat(5 - Math.round(h.precipitationProbability / 20));
            return `• \`${h.time}\` [${bar}] **${h.precipitationProbability}%** ${h.weatherEmoji} (${h.precipitation} мм)`;
          })
          .join('\n');
    }

    const message =
      `☂️ **Анализ осадков и зонта для ${weather.cityName}**\n\n` +
      `Текущая обстановка: ${cur.weatherEmoji} **${cur.weatherDescription}**\n` +
      `Осадки сейчас: **${cur.precipitation} мм**\n` +
      `Влажность воздуха: **${cur.humidity}%**\n\n` +
      `📢 **Вердикт:**\n` +
      `${advice.umbrella}\n` +
      hourlyRainTimeline;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (err: any) {
    await bot.sendMessage(chatId, '⚠️ Не удалось рассчитать вероятность осадков.');
  }
}

async function sendClothingDetails(chatId: number, user: UserRecord): Promise<void> {
  try {
    const weather = await fetchWeatherData(user.city_name!, user.latitude!, user.longitude!, user.timezone);
    const advice = generateAdvice(weather);
    const cur = weather.current;

    const message =
      `🧥 **Гардеробный совет для ${weather.cityName}**\n\n` +
      `Фактическая температура: **${cur.temperature > 0 ? '+' : ''}${cur.temperature}°C**\n` +
      `Ощущается как: **${cur.apparentTemperature > 0 ? '+' : ''}${cur.apparentTemperature}°C**\n` +
      `Ветер: **${cur.windSpeed} м/с** (порывы до ${cur.windGusts} м/с)\n\n` +
      `👗 **Рекомендация по одежде:**\n` +
      `${advice.clothing}\n\n` +
      `💨 **Фактор ветра:**\n` +
      `${advice.wind}`;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (err: any) {
    await bot.sendMessage(chatId, '⚠️ Не удалось рассчитать рекомендации по одежде.');
  }
}

async function sendSettingsMenu(chatId: number, user: UserRecord, editMessageId?: number): Promise<void> {
  const text =
    `⚙️ **Настройки оповещений и метеослужбы**\n\n` +
    `📍 Текущий город: **${user.city_name || 'Не задан'}**\n` +
    `⏰ Утренняя сводка: **${user.notify_enabled ? `Включена (${user.notify_time})` : 'Выключена'}**\n` +
    `☔ Алерт о дожде: **${user.alert_rain ? 'Включен' : 'Выключен'}**\n` +
    `🚨 Экстренный штормовой алерт: **${user.alert_storm ? 'Включен' : 'Выключен'}**\n\n` +
    `Нажимайте кнопки ниже, чтобы переключить параметры:`;

  if (editMessageId) {
    await bot.editMessageText(text, {
      chat_id: chatId,
      message_id: editMessageId,
      parse_mode: 'Markdown',
      ...getSettingsInlineKeyboard(user),
    });
  } else {
    await bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      ...getSettingsInlineKeyboard(user),
    });
  }
}

async function askForLocation(chatId: number, customPrompt?: string): Promise<void> {
  const text =
    customPrompt ||
    `📍 **У вас ещё не выбран регион Кыргызстана.**\n` +
    `Пожалуйста, выберите область кнопкой ниже, отправьте геопозицию или напишите название города/села в чат:`;

  await bot.sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    ...getKyrgyzstanRegionsKeyboard(),
  });
}

async function handleCitySearch(chatId: number, userId: number, query: string): Promise<void> {
  try {
    const results = await searchCities(query);
    if (!results.length) {
      await bot.sendMessage(
        chatId,
        `🔍 В Кыргызстане населённый пункт «**${query}**» не найден.\n` +
        `Пожалуйста, напишите название города, района или села в Кыргызстане (например: *Бишкек*, *Ош*, *Каракол*, *Токмок*, *Кочкор*, *Ноокат*) или выберите область кнопкой ниже:`,
        {
          parse_mode: 'Markdown',
          ...getKyrgyzstanRegionsKeyboard(),
        }
      );
      return;
    }

    // Если найден ровно 1 город — автоматически сохраняем и показываем
    if (results.length === 1) {
      const city = results[0];
      const fullName = city.admin1 ? `${city.name} (${city.admin1})` : city.name;
      setUserLocation(userId, fullName, city.latitude, city.longitude, city.timezone);

      await bot.sendMessage(
        chatId,
        `📍 Регион установлен: **${fullName}**!`,
        { parse_mode: 'Markdown', ...getMainReplyKeyboard() }
      );

      const user = getUser(userId)!;
      return sendUserWeather(chatId, user);
    }

    // Если несколько вариантов в Кыргызстане — предлагаем выбрать
    const buttons = results.slice(0, 6).map((c) => {
      const label = `${c.name}${c.admin1 ? `, ${c.admin1}` : ''} (Кыргызстан)`;
      const shortName = c.name.slice(0, 20);
      return [
        {
          text: label,
          callback_data: `set_city:${c.latitude.toFixed(4)}:${c.longitude.toFixed(4)}:${shortName}`,
        },
      ];
    });

    await bot.sendMessage(chatId, `🔍 Найдено несколько совпадений в Кыргызстане для «**${query}**». Выберите ваш район:`, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: buttons },
    });
  } catch (err: any) {
    console.error('Ошибка поиска города:', err);
    await bot.sendMessage(chatId, '⚠️ Ошибка при поиске города. Попробуйте еще раз.');
  }
}

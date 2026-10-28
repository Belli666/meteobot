import TelegramBot from 'node-telegram-bot-api';
import { bot } from './config';
import {
  getUser,
  registerOrUpdateUser,
  setUserLocation,
  setUserLanguage,
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
  getLanguageSelectionKeyboard,
  getKyrgyzstanRegionsKeyboard,
  getKyrgyzstanPlacesKeyboard,
} from './keyboards';
import { Language, normalizeLang, I18N_TEXTS } from './i18n';
import { KYRGYZ_REGIONS, ALL_KYRGYZ_PLACES } from './kyrgyzstanData';

function cleanQuery(text: string): string {
  // Убираем ведущие эмодзи вроде '🏛️ Бишкек' -> 'Бишкек'
  return text.replace(/^[^\p{L}\p{N}]+/u, '').trim();
}

export function initCommands(): void {
  // Команда /start
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const from = msg.from;
    if (!from) return;

    const user = registerOrUpdateUser(from.id, from.first_name || 'Friend', from.username);

    // Если локация ещё не задана — показываем ТРЕХЪЯЗЫЧНОЕ приветствие с выбором языка
    if (!user.city_name || !user.latitude || !user.longitude) {
      await bot.sendMessage(chatId, I18N_TEXTS.welcomeMultilingual(from.first_name || 'Friend'), {
        parse_mode: 'Markdown',
        ...getLanguageSelectionKeyboard(),
      });
      return;
    }

    // Если локация уже есть — показываем погоду на языке пользователя
    await sendUserWeather(chatId, user);
  });

  // Команда смены языка /language или /lang
  bot.onText(/\/(language|lang)/, async (msg) => {
    await bot.sendMessage(
      msg.chat.id,
      '🌐 **Тилди тандаңыз / Выберите язык / Select language:**',
      {
        parse_mode: 'Markdown',
        ...getLanguageSelectionKeyboard(),
      }
    );
  });

  // Команда выбора областей /regions
  bot.onText(/\/regions/, async (msg) => {
    const user = getUser(msg.from?.id || 0);
    const lang = user?.language || 'ru';
    await bot.sendMessage(msg.chat.id, I18N_TEXTS.chooseRegionPrompt[lang], {
      parse_mode: 'Markdown',
      ...getKyrgyzstanRegionsKeyboard(lang),
    });
  });

  // Команда /help
  bot.onText(/\/help/, async (msg) => {
    const user = getUser(msg.from?.id || 0);
    const lang = user?.language || 'ru';
    const isKy = lang === 'ky';
    const isEn = lang === 'en';

    const helpText = isKy
      ? `📖 **MeteoBot буйруктары:**\n\n` +
        `• /start — ботту кайра баштоо жана башкы меню\n` +
        `• /weather — учурдагы аба ырайы жана кеңештер\n` +
        `• /umbrella — кол чатыр алуу керекпи толук анализи\n` +
        `• /forecast — 3 күндүк божомол\n` +
        `• /regions — Кыргызстандын 7 облусун тандоо\n` +
        `• /language — тилди алмаштыруу (Кыргызча/Русский/English)\n` +
        `• /settings — билдирүүлөрдү жана эртең мененки убакытты тууралоо\n` +
        `• /city <айыл/шаар> — Кыргызстандын каалаган жеринен аба ырайын билүү\n\n` +
        `💡 *Кыргызстандын каалаган жеринин атын түз эле чатка жазсаңыз да болот!*`
      : isEn
      ? `📖 **MeteoBot Commands:**\n\n` +
        `• /start — Restart the bot and open main menu\n` +
        `• /weather — Current weather and advice\n` +
        `• /umbrella — Detailed umbrella and precipitation check\n` +
        `• /forecast — 3-day forecast\n` +
        `• /regions — Select one of 7 Kyrgyzstan regions\n` +
        `• /language — Change language (Kyrgyz / Russian / English)\n` +
        `• /settings — Notification settings & briefing time\n` +
        `• /city <city> — Check weather in any Kyrgyzstan location\n\n` +
        `💡 *You can also simply type any Kyrgyz city or village name in chat!*`
      : `📖 **Команды MeteoBot:**\n\n` +
        `• /start — перезапустить бота и открыть главное меню\n` +
        `• /weather — текущая погода и советы\n` +
        `• /umbrella — подробный анализ: нужен ли зонт сегодня\n` +
        `• /forecast — прогноз на 3 дня\n` +
        `• /regions — выбор из 7 областей Кыргызстана\n` +
        `• /language — смена языка (Кыргызча / Русский / English)\n` +
        `• /settings — настройки утренней рассылки и алертов\n` +
        `• /city <город> — узнать погоду в любом городе Кыргызстана\n\n` +
        `💡 *Вы можете просто написать название села или города Кыргызстана в чат!*`;

    await bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'Markdown' });
  });

  // Команды /weather, /forecast, /umbrella, /settings
  bot.onText(/\/weather/, async (msg) => {
    const user = getUser(msg.from?.id || 0);
    if (!user || !user.latitude) return askForLocation(msg.chat.id);
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

  bot.onText(/\/city (.+)/, async (msg, match) => {
    const query = match ? match[1].trim() : '';
    if (!query) return;
    await handleCitySearch(msg.chat.id, msg.from?.id || 0, query);
  });

  // Обработка отправки геопозиции
  bot.on('location', async (msg) => {
    const loc = msg.location;
    if (!loc || !msg.from) return;

    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const user = getUser(userId);
    const lang = user?.language || 'ru';

    const locatingMsg =
      lang === 'ky'
        ? '🛰️ Координаттар боюнча аймагыңыз аныкталууда...'
        : lang === 'en'
        ? '🛰️ Determining your Kyrgyzstan region from coordinates...'
        : '🛰️ По координатам определяем ваш регион Кыргызстана...';

    await bot.sendMessage(chatId, locatingMsg);

    try {
      const cityName = await reverseGeocode(loc.latitude, loc.longitude);
      setUserLocation(userId, cityName, loc.latitude, loc.longitude);

      await bot.sendMessage(
        chatId,
        I18N_TEXTS.locationSaved[lang](cityName),
        {
          parse_mode: 'Markdown',
          ...getMainReplyKeyboard(lang),
        }
      );

      const updatedUser = getUser(userId);
      if (updatedUser) {
        await sendUserWeather(chatId, updatedUser);
      }
    } catch (err: any) {
      console.error('Ошибка геолокации:', err);
      const errMsg =
        lang === 'ky'
          ? '❌ Аймакты аныктоо мүмкүн болгон жок. Төмөнкү тизмеден облусту тандаңыз:'
          : lang === 'en'
          ? '❌ Could not determine region by coordinates. Please select from regions:'
          : '❌ Не удалось определить регион. Выберите область из списка:';
      await bot.sendMessage(chatId, errMsg, { ...getKyrgyzstanRegionsKeyboard(lang) });
    }
  });

  // Обработка текстовых сообщений
  bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/') || msg.location) return;

    const text = msg.text.trim();
    const chatId = msg.chat.id;
    const userId = msg.from?.id || 0;
    const user = getUser(userId);
    const lang = user?.language || 'ru';

    // Проверка кнопок нижней панели (мультиязычная)
    const lower = text.toLowerCase();

    if (lower.includes('аба ырайым') || lower.includes('моя погода') || lower.includes('my weather')) {
      if (!user || !user.latitude) return askForLocation(chatId, lang);
      return sendUserWeather(chatId, user);
    }

    if (lower.includes('кол чатыр') || lower.includes('зонт') || lower.includes('umbrella')) {
      if (!user || !user.latitude) return askForLocation(chatId, lang);
      return sendUmbrellaDetails(chatId, user);
    }

    if (lower.includes('кийүү') || lower.includes('надеть') || lower.includes('wear')) {
      if (!user || !user.latitude) return askForLocation(chatId, lang);
      return sendClothingDetails(chatId, user);
    }

    if (lower.includes('божомол') || lower.includes('прогноз') || lower.includes('forecast')) {
      if (!user || !user.latitude) return askForLocation(chatId, lang);
      return sendForecast(chatId, user);
    }

    if (lower.includes('ырастоолор') || lower.includes('настройки') || lower.includes('settings')) {
      if (!user) return;
      return sendSettingsMenu(chatId, user);
    }

    if (lower.includes('облус') || lower.includes('область') || lower.includes('region')) {
      await bot.sendMessage(chatId, I18N_TEXTS.chooseRegionPrompt[lang], {
        parse_mode: 'Markdown',
        ...getKyrgyzstanRegionsKeyboard(lang),
      });
      return;
    }

    if (lower.includes('тил') || lower.includes('язык') || lower.includes('language')) {
      await bot.sendMessage(
        chatId,
        '🌐 **Тилди тандаңыз / Выберите язык / Select language:**',
        {
          parse_mode: 'Markdown',
          ...getLanguageSelectionKeyboard(),
        }
      );
      return;
    }

    // Если это поиск населенного пункта КР
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
    const lang = user?.language || 'ru';

    await bot.answerCallbackQuery(query.id);

    try {
      // 1. Выбор языка
      if (data.startsWith('set_lang:')) {
        const selectedLang = normalizeLang(data.split(':')[1]);
        setUserLanguage(userId, selectedLang);
        const updated = getUser(userId)!;

        // Если локация ещё не задана — показываем выбор области КР на выбранном языке
        if (!updated.city_name || !updated.latitude) {
          await bot.sendMessage(
            chatId,
            I18N_TEXTS.languageSelectedMsg[selectedLang] + '\n\n' + I18N_TEXTS.chooseRegionPrompt[selectedLang],
            {
              parse_mode: 'Markdown',
              ...getKyrgyzstanRegionsKeyboard(selectedLang),
            }
          );
          // Устанавливаем соответствующую нижнюю панель
          await bot.sendMessage(
            chatId,
            selectedLang === 'ky' ? '👇 Төмөндөн баскычтарды колдоно аласыз:' : selectedLang === 'en' ? '👇 You can also use the buttons below:' : '👇 Ниже доступна панель быстрого доступа:',
            { ...getOnboardingReplyKeyboard(selectedLang) }
          );
          return;
        }

        // Если локация уже была — подтверждаем и обновляем погоду на новом языке
        await bot.sendMessage(chatId, I18N_TEXTS.languageSelectedMsg[selectedLang], {
          parse_mode: 'Markdown',
          ...getMainReplyKeyboard(selectedLang),
        });
        return sendUserWeather(chatId, updated);
      }

      // Открытие меню выбора языка из настроек
      if (data === 'choose_language') {
        await bot.editMessageText('🌐 **Тилди тандаңыз / Выберите язык / Select language:**', {
          chat_id: chatId,
          message_id: msg.message_id,
          parse_mode: 'Markdown',
          ...getLanguageSelectionKeyboard(),
        });
        return;
      }

      // 2. Выбор области Кыргызстана
      if (data === 'open_kg_regions') {
        await bot.editMessageText(I18N_TEXTS.chooseRegionPrompt[lang], {
          chat_id: chatId,
          message_id: msg.message_id,
          parse_mode: 'Markdown',
          ...getKyrgyzstanRegionsKeyboard(lang),
        });
        return;
      }

      if (data.startsWith('kg_reg:')) {
        const regId = data.split(':')[1];
        const reg = KYRGYZ_REGIONS.find((r) => r.id === regId);
        if (!reg) return;

        // Бишкек же Ош шаарлары (республикалык маанидеги) — дароо сактайбыз
        if (reg.places.length === 1) {
          const place = reg.places[0];
          const displayName = place.name[lang] || place.name.ru;
          setUserLocation(userId, displayName, place.latitude, place.longitude, place.timezone);
          await bot.sendMessage(
            chatId,
            I18N_TEXTS.locationSaved[lang](displayName),
            { parse_mode: 'Markdown', ...getMainReplyKeyboard(lang) }
          );
          const updated = getUser(userId)!;
          return sendUserWeather(chatId, updated);
        }

        // Облус болсо — ошол облустун шаар/райондорунун тизмесин ачабыз
        const regName = reg.name[lang] || reg.name.ru;
        const prompt =
          lang === 'ky'
            ? 'Шаарды же районду тандаңыз:'
            : lang === 'en'
            ? 'Select city or district:'
            : 'Выберите город или район:';

        await bot.editMessageText(
          `${reg.emoji} **${regName}**\n${prompt}`,
          {
            chat_id: chatId,
            message_id: msg.message_id,
            parse_mode: 'Markdown',
            ...getKyrgyzstanPlacesKeyboard(reg, lang),
          }
        );
        return;
      }

      if (data.startsWith('kg_place:')) {
        const placeId = data.split(':')[1];
        const place = ALL_KYRGYZ_PLACES.find((p) => p.id === placeId);
        if (!place) return;

        const placeName = place.name[lang] || place.name.ru;
        const regName = place.region[lang] || place.region.ru;
        const fullName = `${placeName} (${regName})`;
        setUserLocation(userId, fullName, place.latitude, place.longitude, place.timezone);

        await bot.sendMessage(
          chatId,
          I18N_TEXTS.locationSaved[lang](fullName),
          { parse_mode: 'Markdown', ...getMainReplyKeyboard(lang) }
        );
        const updated = getUser(userId)!;
        return sendUserWeather(chatId, updated);
      }

      // 3. Меню погоды
      if (data === 'weather_refresh') {
        if (!user || !user.latitude) return askForLocation(chatId, lang);
        return sendUserWeather(chatId, user, msg.message_id);
      }

      if (data === 'weather_3d') {
        if (!user || !user.latitude) return askForLocation(chatId, lang);
        return sendForecast(chatId, user);
      }

      if (data === 'advice_umbrella') {
        if (!user || !user.latitude) return askForLocation(chatId, lang);
        return sendUmbrellaDetails(chatId, user);
      }

      if (data === 'advice_clothing') {
        if (!user || !user.latitude) return askForLocation(chatId, lang);
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
        await bot.editMessageText(I18N_TEXTS.chooseTimeTitle[lang], {
          chat_id: chatId,
          message_id: msg.message_id,
          parse_mode: 'Markdown',
          ...getTimeChoiceKeyboard(lang),
        });
        return;
      }

      if (data.startsWith('set_time:')) {
        const time = data.split(':')[1];
        updateUserSettings(userId, { notify_time: time, notify_enabled: 1 });
        const updated = getUser(userId)!;
        await bot.sendMessage(chatId, I18N_TEXTS.timeSetSuccess[lang](time), {
          parse_mode: 'Markdown',
        });
        return sendSettingsMenu(chatId, updated);
      }

      if (data.startsWith('set_city:')) {
        const parts = data.split(':');
        const lat = parseFloat(parts[1]);
        const lon = parseFloat(parts[2]);
        const name = parts.slice(3).join(':');

        setUserLocation(userId, name, lat, lon);
        await bot.sendMessage(
          chatId,
          I18N_TEXTS.locationSaved[lang](name),
          {
            parse_mode: 'Markdown',
            ...getMainReplyKeyboard(lang),
          }
        );

        const updated = getUser(userId)!;
        return sendUserWeather(chatId, updated);
      }
    } catch (err: any) {
      console.error('Ошибка в callback query:', err);
    }
  });
}

async function sendUserWeather(chatId: number, user: UserRecord, editMessageId?: number): Promise<void> {
  const lang = user.language || 'ru';
  if (!user.city_name || !user.latitude || !user.longitude) {
    return askForLocation(chatId, lang);
  }

  try {
    const weather = await fetchWeatherData(user.city_name, user.latitude, user.longitude, user.timezone, lang);
    const text = formatWeatherMessage(weather, lang);

    if (editMessageId) {
      await bot.editMessageText(text, {
        chat_id: chatId,
        message_id: editMessageId,
        parse_mode: 'Markdown',
        ...getWeatherInlineKeyboard(lang),
      });
    } else {
      await bot.sendMessage(chatId, text, {
        parse_mode: 'Markdown',
        ...getWeatherInlineKeyboard(lang),
      });
    }
  } catch (err: any) {
    console.error('Ошибка получения погоды:', err);
    const errText =
      lang === 'ky'
        ? '⚠️ Аба ырайы кызматы менен байланышуу мүмкүн болгон жок. Бир мүнөттөн кийин кайталап көрүңүз.'
        : lang === 'en'
        ? '⚠️ Could not connect to weather service. Please try again in a minute.'
        : '⚠️ Не удалось связаться с метеосервисом. Пожалуйста, попробуйте через минуту.';
    await bot.sendMessage(chatId, errText);
  }
}

async function sendForecast(chatId: number, user: UserRecord): Promise<void> {
  const lang = user.language || 'ru';
  try {
    const weather = await fetchWeatherData(user.city_name!, user.latitude!, user.longitude!, user.timezone, lang);
    const text = formatForecast3Days(weather, lang);
    await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
  } catch (err: any) {
    await bot.sendMessage(chatId, '⚠️ Прогноз алуу мүмкүн болгон жок.');
  }
}

async function sendUmbrellaDetails(chatId: number, user: UserRecord): Promise<void> {
  const lang = user.language || 'ru';
  try {
    const weather = await fetchWeatherData(user.city_name!, user.latitude!, user.longitude!, user.timezone, lang);
    const advice = generateAdvice(weather, lang);
    const cur = weather.current;
    const isKy = lang === 'ky';
    const isEn = lang === 'en';

    const curStatusLabel = isKy ? 'Учурдагы абал' : isEn ? 'Current status' : 'Текущая обстановка';
    const precipNowLabel = isKy ? 'Жаан-чачын азыр' : isEn ? 'Precipitation right now' : 'Осадки сейчас';
    const humidityLabel = isKy ? 'Нымдуулук' : isEn ? 'Humidity' : 'Влажность';
    const verdictLabel = isKy ? 'Корутунду' : isEn ? 'Verdict' : 'Вердикт';
    const timelineLabel = isKy ? 'Саат сайын жаан-чачын ыктымалдуулугу' : isEn ? 'Hourly rain probability' : 'Вероятность осадков по часам';

    let hourlyRainTimeline = '';
    if (weather.hourlyNext12h.length) {
      hourlyRainTimeline =
        `\n⏱️ **${timelineLabel}:**\n` +
        weather.hourlyNext12h
          .slice(0, 8)
          .map((h) => {
            const bar = '█'.repeat(Math.round(h.precipitationProbability / 20)) + '░'.repeat(5 - Math.round(h.precipitationProbability / 20));
            return `• \`${h.time}\` [${bar}] **${h.precipitationProbability}%** ${h.weatherEmoji} (${h.precipitation} мм)`;
          })
          .join('\n');
    }

    const title = I18N_TEXTS.umbrellaTitle[lang](weather.cityName);
    const message =
      `${title}\n\n` +
      `${curStatusLabel}: ${cur.weatherEmoji} **${cur.weatherDescription}**\n` +
      `${precipNowLabel}: **${cur.precipitation} мм**\n` +
      `${humidityLabel}: **${cur.humidity}%**\n\n` +
      `📢 **${verdictLabel}:**\n` +
      `${advice.umbrella}\n` +
      hourlyRainTimeline;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (err: any) {
    await bot.sendMessage(chatId, '⚠️ Жаан-чачын маалыматын эсептөө мүмкүн болгон жок.');
  }
}

async function sendClothingDetails(chatId: number, user: UserRecord): Promise<void> {
  const lang = user.language || 'ru';
  try {
    const weather = await fetchWeatherData(user.city_name!, user.latitude!, user.longitude!, user.timezone, lang);
    const advice = generateAdvice(weather, lang);
    const cur = weather.current;
    const isKy = lang === 'ky';
    const isEn = lang === 'en';

    const title = I18N_TEXTS.clothingTitle[lang](weather.cityName);
    const actualTemp = isKy ? 'Иш жүзүндөгү температура' : isEn ? 'Actual temperature' : 'Фактическая температура';
    const feelsLike = isKy ? 'Сезилет' : isEn ? 'Feels like' : 'Ощущается как';
    const wind = isKy ? 'Шамал' : isEn ? 'Wind' : 'Ветер';
    const gusts = isKy ? 'күчөшү' : isEn ? 'gusts up to' : 'порывы до';
    const clothingHead = isKy ? '👗 Кийим кеңеши' : isEn ? '👗 Clothing recommendation' : '👗 Рекомендация по одежде';
    const windHead = isKy ? '💨 Шамал таасири' : isEn ? '💨 Wind factor' : '💨 Фактор ветра';

    const message =
      `${title}\n\n` +
      `${actualTemp}: **${cur.temperature > 0 ? '+' : ''}${cur.temperature}°C**\n` +
      `${feelsLike}: **${cur.apparentTemperature > 0 ? '+' : ''}${cur.apparentTemperature}°C**\n` +
      `${wind}: **${cur.windSpeed} м/с** (${gusts} ${cur.windGusts} м/с)\n\n` +
      `**${clothingHead}:**\n` +
      `${advice.clothing}\n\n` +
      `**${windHead}:**\n` +
      `${advice.wind}`;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (err: any) {
    await bot.sendMessage(chatId, '⚠️ Кийим кеңешин эсептөө мүмкүн болгон жок.');
  }
}

async function sendSettingsMenu(chatId: number, user: UserRecord, editMessageId?: number): Promise<void> {
  const lang = user.language || 'ru';
  const isKy = lang === 'ky';
  const isEn = lang === 'en';

  const text =
    `${I18N_TEXTS.settingsTitle[lang]}\n\n` +
    `${I18N_TEXTS.settingsCurrentCity[lang]} **${user.city_name || (isKy ? 'Тандалган эмес' : isEn ? 'Not set' : 'Не задан')}**\n` +
    `${I18N_TEXTS.settingsMorning[lang]} **${user.notify_enabled ? `${I18N_TEXTS.enabled[lang]} (${user.notify_time})` : I18N_TEXTS.disabled[lang]}**\n` +
    `${I18N_TEXTS.settingsRain[lang]} **${user.alert_rain ? I18N_TEXTS.enabled[lang] : I18N_TEXTS.disabled[lang]}**\n` +
    `${I18N_TEXTS.settingsStorm[lang]} **${user.alert_storm ? I18N_TEXTS.enabled[lang] : I18N_TEXTS.disabled[lang]}**\n` +
    `${I18N_TEXTS.settingsLanguage[lang]} **${lang === 'ky' ? 'Кыргызча 🇰🇬' : lang === 'en' ? 'English 🇬🇧' : 'Русский 🇷🇺'}**\n\n` +
    (isKy ? 'Параметрлерди алмаштыруу үчүн төмөнкү баскычтарды басыңыз:' : isEn ? 'Tap buttons below to change parameters:' : 'Нажимайте кнопки ниже, чтобы переключить параметры:');

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

async function askForLocation(chatId: number, lang: Language = 'ru'): Promise<void> {
  await bot.sendMessage(chatId, I18N_TEXTS.chooseRegionPrompt[lang], {
    parse_mode: 'Markdown',
    ...getKyrgyzstanRegionsKeyboard(lang),
  });
}

async function handleCitySearch(chatId: number, userId: number, query: string): Promise<void> {
  const user = getUser(userId);
  const lang = user?.language || 'ru';

  try {
    const results = await searchCities(query);
    if (!results.length) {
      await bot.sendMessage(
        chatId,
        I18N_TEXTS.cityNotFound[lang](query),
        {
          parse_mode: 'Markdown',
          ...getKyrgyzstanRegionsKeyboard(lang),
        }
      );
      return;
    }

    if (results.length === 1) {
      const city = results[0];
      const fullName = city.admin1 ? `${city.name} (${city.admin1})` : city.name;
      setUserLocation(userId, fullName, city.latitude, city.longitude, city.timezone);

      await bot.sendMessage(
        chatId,
        I18N_TEXTS.locationSaved[lang](fullName),
        { parse_mode: 'Markdown', ...getMainReplyKeyboard(lang) }
      );

      const updated = getUser(userId)!;
      return sendUserWeather(chatId, updated);
    }

    const choosePrompt =
      lang === 'ky'
        ? `🔍 «**${query}**» боюнча Кыргызстанда бир нече айыл/район табылды. Тандаңыз:`
        : lang === 'en'
        ? `🔍 Multiple matches found in Kyrgyzstan for «**${query}**. Select yours:`
        : `🔍 Найдено несколько совпадений в Кыргызстане для «**${query}**». Выберите ваш район:`;

    const buttons = results.slice(0, 6).map((c) => {
      const label = `${c.name}${c.admin1 ? `, ${c.admin1}` : ''} (KG)`;
      const shortName = c.name.slice(0, 20);
      return [
        {
          text: label,
          callback_data: `set_city:${c.latitude.toFixed(4)}:${c.longitude.toFixed(4)}:${shortName}`,
        },
      ];
    });

    await bot.sendMessage(chatId, choosePrompt, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: buttons },
    });
  } catch (err: any) {
    console.error('Ошибка поиска города:', err);
    await bot.sendMessage(chatId, '⚠️ Ошибка при поиске города.');
  }
}

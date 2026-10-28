import TelegramBot from 'node-telegram-bot-api';
import { bot } from './config';
import {
  getUser,
  registerOrUpdateUser,
  setUserLocation,
  setUserLanguage,
  updateUserSettings,
  deleteUser,
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
  formatWeatherDetailsMessage,
  formatHourlyForecastMessage,
  formatForecast3Days,
} from './advisor';
import {
  getOnboardingReplyKeyboard,
  getMainReplyKeyboard,
  getWeatherInlineKeyboard,
  getWeatherSubScreenKeyboard,
  getSettingsInlineKeyboard,
  getTimeChoiceKeyboard,
  getLanguageSelectionKeyboard,
  getKyrgyzstanRegionsKeyboard,
  getKyrgyzstanPlacesKeyboard,
  getResetConfirmationKeyboard,
} from './keyboards';
import { Language, normalizeLang, I18N_TEXTS } from './i18n';
import { KYRGYZ_REGIONS, ALL_KYRGYZ_PLACES } from './kyrgyzstanData';
import { escapeHtml, safeSendMessage, safeEditMessageText } from './telegramSafe';

function cleanQuery(text: string): string {
  // Убираем ведущие эмодзи вроде '🏛️ Бишкек' -> 'Бишкек'
  return text.replace(/^[^\p{L}\p{N}]+/u, '').trim();
}

function getValidUser(userId: number, from?: TelegramBot.User): UserRecord {
  const existing = getUser(userId);
  if (existing) return existing;
  return registerOrUpdateUser(userId, from?.first_name || 'Friend', from?.username);
}

export function initCommands(): void {
  // Команда /start
  bot.onText(/\/start/, async (msg) => {
    try {
      const chatId = msg.chat.id;
      const from = msg.from;
      if (!from) return;

      const user = registerOrUpdateUser(from.id, from.first_name || 'Friend', from.username);

      // Если локация ещё не задана — показываем ТРЕХЪЯЗЫЧНОЕ приветствие с выбором языка
      if (!user.city_name || !user.latitude || !user.longitude) {
        await safeSendMessage(bot, chatId, I18N_TEXTS.welcomeMultilingual(from.first_name || 'Friend'), {
          ...getLanguageSelectionKeyboard(),
        });
        return;
      }

      // Если локация уже есть — показываем главную карточку погоды
      await sendUserWeather(chatId, user);
    } catch (err: any) {
      console.error('❌ [/start] Ошибка:', err);
    }
  });

  // Команда сброса памяти о пользователе (/reset)
  bot.onText(/\/reset/, async (msg) => {
    try {
      const from = msg.from;
      if (!from) return;

      deleteUser(from.id);

      const resetNotice =
        `🗑️ <b>Память очищена / Дайындар тазаланды / Memory cleared!</b>\n\n` +
        `🇰🇬 Сиздин бардык орнотууларыңыз өчүрүлдү.\n` +
        `🇷🇺 Все ваши сохранённые данные и регион сброшены.\n` +
        `🇬🇧 All your saved settings and location have been reset.\n\n` +
        I18N_TEXTS.welcomeMultilingual(from.first_name || 'Friend');

      await safeSendMessage(bot, msg.chat.id, resetNotice, {
        ...getLanguageSelectionKeyboard(),
      });
    } catch (err: any) {
      console.error('❌ [/reset] Ошибка:', err);
    }
  });

  // Команда смены языка /language или /lang
  bot.onText(/\/(language|lang)/, async (msg) => {
    try {
      await safeSendMessage(
        bot,
        msg.chat.id,
        '🌐 <b>Тилди тандаңыз / Выберите язык / Select language:</b>',
        {
          ...getLanguageSelectionKeyboard(),
        }
      );
    } catch (err: any) {
      console.error('❌ [/language] Ошибка:', err);
    }
  });

  // Команда выбора областей /regions
  bot.onText(/\/regions/, async (msg) => {
    try {
      const user = getUser(msg.from?.id || 0);
      const lang = user?.language || 'ru';
      await safeSendMessage(bot, msg.chat.id, I18N_TEXTS.chooseRegionPrompt[lang], {
        ...getKyrgyzstanRegionsKeyboard(lang),
      });
    } catch (err: any) {
      console.error('❌ [/regions] Ошибка:', err);
    }
  });

  // Команда /help
  bot.onText(/\/help/, async (msg) => {
    try {
      const user = getUser(msg.from?.id || 0);
      const lang = user?.language || 'ru';
      const isKy = lang === 'ky';
      const isEn = lang === 'en';

      const helpText = isKy
        ? `📖 <b>MeteoBot буйруктары:</b>\n\n` +
          `• /start — башкы меню жана учурдагы аба ырайы\n` +
          `• /weather — компакттуу аба ырайы карточкасы\n` +
          `• /forecast — 3 күндүк толук божомол\n` +
          `• /regions — Кыргызстандын 7 облусун тандоо\n` +
          `• /language — тилди алмаштыруу (Кыргызча/Русский/English)\n` +
          `• /settings — утренний брифинг жана эскертүүлөр\n` +
          `• /city &lt;айыл/шаар&gt; — Кыргызстандын каалаган жери боюнча аба ырайы\n\n` +
          `💡 <i>Кыргызстандын каалаган айыл же шаарынын атын чатка түз жазсаңыз болот!</i>`
        : isEn
        ? `📖 <b>MeteoBot Commands:</b>\n\n` +
          `• /start — Main menu and current weather card\n` +
          `• /weather — Compact weather card & advice\n` +
          `• /forecast — 3-day detailed forecast\n` +
          `• /regions — Choose from 7 regions of Kyrgyzstan\n` +
          `• /language — Switch language (Kyrgyz / Russian / English)\n` +
          `• /settings — Daily morning briefing & alerts\n` +
          `• /city &lt;name&gt; — Weather in any Kyrgyz city/village\n\n` +
          `💡 <i>You can also directly type any Kyrgyz city or village name in chat!</i>`
        : `📖 <b>Команды MeteoBot:</b>\n\n` +
          `• /start — главное меню и карточка погоды\n` +
          `• /weather — компактная карточка погоды и советы\n` +
          `• /forecast — прогноз погоды на 3 дня\n` +
          `• /regions — выбор из 7 областей Кыргызстана\n` +
          `• /language — смена языка (Кыргызча / Русский / English)\n` +
          `• /settings — настройки утренней сводки и алертов\n` +
          `• /city &lt;город&gt; — узнать погоду в любом селе/городе КР\n\n` +
          `💡 <i>Вы можете просто написать название любого города или села Кыргызстана в чат!</i>`;

      await safeSendMessage(bot, msg.chat.id, helpText);
    } catch (err: any) {
      console.error('❌ [/help] Ошибка:', err);
    }
  });

  bot.onText(/\/weather/, async (msg) => {
    try {
      const user = getUser(msg.from?.id || 0);
      if (!user || !user.latitude) return askForLocation(msg.chat.id);
      await sendUserWeather(msg.chat.id, user);
    } catch (err: any) {
      console.error('❌ [/weather] Ошибка:', err);
    }
  });

  bot.onText(/\/forecast/, async (msg) => {
    try {
      const user = getUser(msg.from?.id || 0);
      if (!user || !user.latitude) return askForLocation(msg.chat.id);
      await sendForecast(msg.chat.id, user);
    } catch (err: any) {
      console.error('❌ [/forecast] Ошибка:', err);
    }
  });

  bot.onText(/\/settings/, async (msg) => {
    try {
      const user = getUser(msg.from?.id || 0);
      if (!user) return;
      await sendSettingsMenu(msg.chat.id, user);
    } catch (err: any) {
      console.error('❌ [/settings] Ошибка:', err);
    }
  });

  bot.onText(/\/city (.+)/, async (msg, match) => {
    try {
      const query = match ? match[1].trim() : '';
      if (!query) return;
      await handleCitySearch(msg.chat.id, msg.from?.id || 0, query);
    } catch (err: any) {
      console.error('❌ [/city] Ошибка:', err);
    }
  });

  // Обработка отправки геопозиции
  bot.on('location', async (msg) => {
    try {
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
          ? '🛰️ Determining your location in Kyrgyzstan...'
          : '🛰️ По координатам определяем ваш регион Кыргызстана...';

      await safeSendMessage(bot, chatId, locatingMsg);

      try {
        const cityName = await reverseGeocode(loc.latitude, loc.longitude);
        setUserLocation(userId, cityName, loc.latitude, loc.longitude);

        await safeSendMessage(
          bot,
          chatId,
          I18N_TEXTS.locationSaved[lang](cityName),
          { ...getMainReplyKeyboard(lang) }
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
        await safeSendMessage(bot, chatId, errMsg, { ...getKyrgyzstanRegionsKeyboard(lang) });
      }
    } catch (err: any) {
      console.error('❌ [location] Ошибка:', err);
    }
  });

  // Обработка текстовых сообщений
  bot.on('message', async (msg) => {
    try {
      if (!msg.text || msg.text.startsWith('/') || msg.location) return;

      const text = msg.text.trim();
      const chatId = msg.chat.id;
      const userId = msg.from?.id || 0;
      const user = getUser(userId);
      const lang = user?.language || 'ru';

      const lower = text.toLowerCase();

      // Проверка кнопок нижней панели
      if (lower.includes('аба ырай') || lower.includes('моя погода') || lower.includes('my weather')) {
        if (!user || !user.latitude) return askForLocation(chatId, lang);
        return sendUserWeather(chatId, user);
      }

      if (lower.includes('божомол') || lower.includes('прогноз') || lower.includes('forecast') || lower.includes('3 күндүк') || lower.includes('на 3 дня')) {
        if (!user || !user.latitude) return askForLocation(chatId, lang);
        return sendForecast(chatId, user);
      }

      if (lower.includes('ырастоолор') || lower.includes('настройки') || lower.includes('settings')) {
        if (!user) return;
        return sendSettingsMenu(chatId, user);
      }

      if (lower.includes('облус') || lower.includes('область') || lower.includes('регион') || lower.includes('город') || lower.includes('аймак') || lower.includes('city')) {
        await safeSendMessage(bot, chatId, I18N_TEXTS.chooseRegionPrompt[lang], {
          ...getKyrgyzstanRegionsKeyboard(lang),
        });
        return;
      }

      if (lower.includes('тил') || lower.includes('язык') || lower.includes('language')) {
        await safeSendMessage(
          bot,
          chatId,
          '🌐 <b>Тилди тандаңыз / Выберите язык / Select language:</b>',
          { ...getLanguageSelectionKeyboard() }
        );
        return;
      }

      if (
        lower.includes('сброс') ||
        lower.includes('тазалоо') ||
        lower.includes('reset') ||
        lower.includes('очистить память') ||
        lower.includes('очистить')
      ) {
        const confirmPrompt =
          lang === 'ky'
            ? '⚠️ <b>Чын эле бардык сакталган дайындарды жана аймакты тазалагыңыз келеби?</b>'
            : lang === 'en'
            ? '⚠️ <b>Are you sure you want to clear your saved data and location?</b>'
            : '⚠️ <b>Вы действительно хотите сбросить свои настройки и регион?</b>';

        await safeSendMessage(bot, chatId, confirmPrompt, {
          ...getResetConfirmationKeyboard(lang),
        });
        return;
      }

      // Поиск населенного пункта КР
      const queryToSearch = cleanQuery(text);
      await handleCitySearch(chatId, userId, queryToSearch);
    } catch (err: any) {
      console.error('❌ [message] Ошибка:', err);
    }
  });

  // Обработка Inline-кнопок
  bot.on('callback_query', async (query) => {
    const data = query.data;
    const msg = query.message;
    if (!data || !msg || !query.from) return;

    const chatId = msg.chat.id;
    const userId = query.from.id;
    // Гарантируем, что пользователь существует в базе данных
    const user = getUser(userId) || registerOrUpdateUser(userId, query.from.first_name || 'Friend', query.from.username);
    const lang = user.language || 'ru';

    try {
      await bot.answerCallbackQuery(query.id);
    } catch {
      // Игнорируем устаревшие callback queries
    }

    try {
      // 1. Выбор языка
      if (data.startsWith('set_lang:')) {
        const selectedLang = normalizeLang(data.split(':')[1]);
        const updated = registerOrUpdateUser(
          userId,
          query.from.first_name || 'Friend',
          query.from.username,
          selectedLang
        );
        setUserLanguage(userId, selectedLang);

        // Если локация ещё не задана — показываем выбор области КР на выбранном языке
        if (!updated.city_name || !updated.latitude) {
          await safeSendMessage(
            bot,
            chatId,
            I18N_TEXTS.languageSelectedMsg[selectedLang] + '\n\n' + I18N_TEXTS.chooseRegionPrompt[selectedLang],
            {
              ...getKyrgyzstanRegionsKeyboard(selectedLang),
            }
          );
          await safeSendMessage(
            bot,
            chatId,
            selectedLang === 'ky' ? '👇 Төмөндөн баскычтарды колдоно аласыз:' : selectedLang === 'en' ? '👇 Quick access panel:' : '👇 Ниже доступна панель быстрого доступа:',
            { ...getOnboardingReplyKeyboard(selectedLang) }
          );
          return;
        }

        // Если локация уже была — обновляем главное меню и карточку погоды
        await safeSendMessage(bot, chatId, I18N_TEXTS.languageSelectedMsg[selectedLang], {
          ...getMainReplyKeyboard(selectedLang),
        });
        return sendUserWeather(chatId, updated);
      }

      if (data === 'choose_language') {
        await safeEditMessageText(
          bot,
          '🌐 <b>Тилди тандаңыз / Выберите язык / Select language:</b>',
          {
            chat_id: chatId,
            message_id: msg.message_id,
            ...getLanguageSelectionKeyboard(),
          }
        );
        return;
      }

      // 2. Выбор области Кыргызстана
      if (data === 'open_kg_regions') {
        await safeEditMessageText(bot, I18N_TEXTS.chooseRegionPrompt[lang], {
          chat_id: chatId,
          message_id: msg.message_id,
          ...getKyrgyzstanRegionsKeyboard(lang),
        });
        return;
      }

      if (data.startsWith('kg_reg:')) {
        const regId = data.split(':')[1];
        const reg = KYRGYZ_REGIONS.find((r) => r.id === regId);
        if (!reg) return;

        // Бишкек или Ош (республиканские города с 1 местом)
        if (reg.places.length === 1) {
          const place = reg.places[0];
          const displayName = place.name[lang] || place.name.ru;
          setUserLocation(userId, displayName, place.latitude, place.longitude, place.timezone);

          await safeSendMessage(
            bot,
            chatId,
            I18N_TEXTS.locationSaved[lang](displayName),
            { ...getMainReplyKeyboard(lang) }
          );
          const updated = getValidUser(userId, query.from);
          return sendUserWeather(chatId, updated);
        }

        // Область — открываем выбор городов/районов
        const regName = reg.name[lang] || reg.name.ru;
        const prompt =
          lang === 'ky'
            ? 'Шаарды же районду тандаңыз:'
            : lang === 'en'
            ? 'Select city or district:'
            : 'Выберите город или район:';

        await safeEditMessageText(
          bot,
          `${reg.emoji} <b>${escapeHtml(regName)}</b>\n${prompt}`,
          {
            chat_id: chatId,
            message_id: msg.message_id,
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

        await safeSendMessage(
          bot,
          chatId,
          I18N_TEXTS.locationSaved[lang](fullName),
          { ...getMainReplyKeyboard(lang) }
        );
        const updated = getValidUser(userId, query.from);
        return sendUserWeather(chatId, updated);
      }

      // 3. Навигация по экранам погоды (Главная, Детали, По часам, 3 дня)
      if (data === 'weather_main' || data === 'weather_refresh') {
        if (!user || !user.latitude) return askForLocation(chatId, lang);
        return sendUserWeather(chatId, user, msg.message_id);
      }

      if (data === 'weather_details') {
        if (!user || !user.latitude) return askForLocation(chatId, lang);
        return sendWeatherDetails(chatId, user, msg.message_id);
      }

      if (data === 'weather_hourly') {
        if (!user || !user.latitude) return askForLocation(chatId, lang);
        return sendHourlyForecast(chatId, user, msg.message_id);
      }

      if (data === 'weather_3d') {
        if (!user || !user.latitude) return askForLocation(chatId, lang);
        return sendForecast(chatId, user, msg.message_id);
      }

      // 4. Меню настроек
      if (data === 'menu_settings') {
        if (!user) return;
        return sendSettingsMenu(chatId, user, msg.message_id);
      }

      if (data === 'toggle_notify') {
        if (!user) return;
        updateUserSettings(userId, { notify_enabled: user.notify_enabled ? 0 : 1 });
        const updated = getValidUser(userId, query.from);
        return sendSettingsMenu(chatId, updated, msg.message_id);
      }

      if (data === 'toggle_rain') {
        if (!user) return;
        updateUserSettings(userId, { alert_rain: user.alert_rain ? 0 : 1 });
        const updated = getValidUser(userId, query.from);
        return sendSettingsMenu(chatId, updated, msg.message_id);
      }

      if (data === 'toggle_storm') {
        if (!user) return;
        updateUserSettings(userId, { alert_storm: user.alert_storm ? 0 : 1 });
        const updated = getValidUser(userId, query.from);
        return sendSettingsMenu(chatId, updated, msg.message_id);
      }

      if (data === 'choose_time') {
        await safeEditMessageText(bot, I18N_TEXTS.chooseTimeTitle[lang], {
          chat_id: chatId,
          message_id: msg.message_id,
          ...getTimeChoiceKeyboard(lang),
        });
        return;
      }

      // Исправление бага с обрезанием минут: 'set_time:08:00' -> cleanTime = '08:00'
      if (data.startsWith('set_time:')) {
        const rawTime = data.replace(/^set_time:/, '').trim();
        let cleanTime = rawTime;
        if (/^\d{1,2}$/.test(cleanTime)) {
          cleanTime = `${cleanTime.padStart(2, '0')}:00`;
        }

        updateUserSettings(userId, { notify_time: cleanTime, notify_enabled: 1 });
        const updated = getValidUser(userId, query.from);

        await safeSendMessage(chatId ? bot : bot, chatId, I18N_TEXTS.timeSetSuccess[lang](cleanTime));
        return sendSettingsMenu(chatId, updated);
      }

      if (data.startsWith('set_city:')) {
        const parts = data.split(':');
        const lat = parseFloat(parts[1]);
        const lon = parseFloat(parts[2]);
        const name = parts.slice(3).join(':');

        setUserLocation(userId, name, lat, lon);
        await safeSendMessage(
          bot,
          chatId,
          I18N_TEXTS.locationSaved[lang](name),
          { ...getMainReplyKeyboard(lang) }
        );

        const updated = getValidUser(userId, query.from);
        return sendUserWeather(chatId, updated);
      }

      // Запрос на сброс памяти
      if (data === 'request_reset') {
        const confirmPrompt =
          lang === 'ky'
            ? '⚠️ <b>Чын эле бардык сакталган дайындарды жана аймакты тазалагыңыз келеби?</b>'
            : lang === 'en'
            ? '⚠️ <b>Are you sure you want to clear your saved data and location?</b>'
            : '⚠️ <b>Вы действительно хотите удалить все сохранённые данные и регион?</b>';

        await safeEditMessageText(bot, confirmPrompt, {
          chat_id: chatId,
          message_id: msg.message_id,
          ...getResetConfirmationKeyboard(lang),
        });
        return;
      }

      // Подтверждение сброса памяти
      if (data === 'confirm_reset') {
        deleteUser(userId);
        const resetNotice =
          `🗑️ <b>Память очищена / Дайындар тазаланды / Memory cleared!</b>\n\n` +
          `🇰🇬 Сиздин бардык орнотууларыңыз өчүрүлдү.\n` +
          `🇷🇺 Все ваши сохранённые данные и регион сброшены.\n` +
          `🇬🇧 All your saved settings and location have been reset.\n\n` +
          I18N_TEXTS.welcomeMultilingual(query.from.first_name || 'Friend');

        await safeSendMessage(bot, chatId, resetNotice, {
          ...getLanguageSelectionKeyboard(),
        });
        return;
      }
    } catch (err: any) {
      console.error('❌ [callback_query] Ошибка:', err);
    }
  });
}

/**
 * Отправка главной компактной карточки погоды
 */
async function sendUserWeather(chatId: number, user: UserRecord, editMessageId?: number): Promise<void> {
  const lang = user.language || 'ru';
  if (!user.city_name || !user.latitude || !user.longitude) {
    return askForLocation(chatId, lang);
  }

  try {
    const weather = await fetchWeatherData(user.city_name, user.latitude, user.longitude, user.timezone, lang);
    const text = formatWeatherMessage(weather, lang);

    if (editMessageId) {
      await safeEditMessageText(bot, text, {
        chat_id: chatId,
        message_id: editMessageId,
        ...getWeatherInlineKeyboard(lang),
      });
    } else {
      await safeSendMessage(bot, chatId, text, {
        ...getWeatherInlineKeyboard(lang),
      });
    }
  } catch (err: any) {
    console.error('Ошибка получения погоды:', err);
    const errText =
      lang === 'ky'
        ? '⚠️ Метеокызмат менен байланышуу мүмкүн болгон жок. Сураныч, бир аздан кийин кайталап көрүңүз.'
        : lang === 'en'
        ? '⚠️ Could not connect to weather service. Please try again in a moment.'
        : '⚠️ Метеослужба временно недоступна. Пожалуйста, попробуйте повторить запрос через минуту.';
    await safeSendMessage(bot, chatId, errText);
  }
}

/**
 * Отправка экрана подробных метеопоказателей
 */
async function sendWeatherDetails(chatId: number, user: UserRecord, editMessageId?: number): Promise<void> {
  const lang = user.language || 'ru';
  try {
    const weather = await fetchWeatherData(user.city_name!, user.latitude!, user.longitude!, user.timezone, lang);
    const text = formatWeatherDetailsMessage(weather, lang);

    if (editMessageId) {
      await safeEditMessageText(bot, text, {
        chat_id: chatId,
        message_id: editMessageId,
        ...getWeatherSubScreenKeyboard(lang),
      });
    } else {
      await safeSendMessage(bot, chatId, text, {
        ...getWeatherSubScreenKeyboard(lang),
      });
    }
  } catch (err: any) {
    console.error('Ошибка деталей погоды:', err);
  }
}

/**
 * Отправка почасового прогноза
 */
async function sendHourlyForecast(chatId: number, user: UserRecord, editMessageId?: number): Promise<void> {
  const lang = user.language || 'ru';
  try {
    const weather = await fetchWeatherData(user.city_name!, user.latitude!, user.longitude!, user.timezone, lang);
    const text = formatHourlyForecastMessage(weather, lang);

    if (editMessageId) {
      await safeEditMessageText(bot, text, {
        chat_id: chatId,
        message_id: editMessageId,
        ...getWeatherSubScreenKeyboard(lang),
      });
    } else {
      await safeSendMessage(bot, chatId, text, {
        ...getWeatherSubScreenKeyboard(lang),
      });
    }
  } catch (err: any) {
    console.error('Ошибка почасового прогноза:', err);
  }
}

/**
 * Отправка 3-дневного прогноза
 */
async function sendForecast(chatId: number, user: UserRecord, editMessageId?: number): Promise<void> {
  const lang = user.language || 'ru';
  try {
    const weather = await fetchWeatherData(user.city_name!, user.latitude!, user.longitude!, user.timezone, lang);
    const text = formatForecast3Days(weather, lang);

    if (editMessageId) {
      await safeEditMessageText(bot, text, {
        chat_id: chatId,
        message_id: editMessageId,
        ...getWeatherSubScreenKeyboard(lang),
      });
    } else {
      await safeSendMessage(bot, chatId, text, {
        ...getWeatherSubScreenKeyboard(lang),
      });
    }
  } catch (err: any) {
    console.error('Ошибка прогноза на 3 дня:', err);
  }
}

/**
 * Отправка меню настроек
 */
async function sendSettingsMenu(chatId: number, user: UserRecord, editMessageId?: number): Promise<void> {
  const lang = user.language || 'ru';
  const isKy = lang === 'ky';
  const isEn = lang === 'en';

  let cleanTime = user.notify_time || '07:30';
  if (cleanTime.length <= 2) {
    cleanTime = `${cleanTime.padStart(2, '0')}:00`;
  }

  const morningVal = user.notify_enabled ? `${I18N_TEXTS.enabled[lang]} (${cleanTime})` : I18N_TEXTS.disabled[lang];
  const rainVal = user.alert_rain ? I18N_TEXTS.enabled[lang] : I18N_TEXTS.disabled[lang];
  const stormVal = user.alert_storm ? I18N_TEXTS.enabled[lang] : I18N_TEXTS.disabled[lang];
  const langVal = lang === 'ky' ? 'Кыргызча 🇰🇬' : lang === 'en' ? 'English 🇬🇧' : 'Русский 🇷🇺';

  const text =
    `${I18N_TEXTS.settingsTitle[lang]}\n\n` +
    `${I18N_TEXTS.settingsCurrentCity[lang]} <b>${escapeHtml(user.city_name || (isKy ? 'Тандалган эмес' : isEn ? 'Not set' : 'Не задан'))}</b>\n` +
    `${I18N_TEXTS.settingsMorning[lang]} <b>${morningVal}</b>\n` +
    `${I18N_TEXTS.settingsTime[lang]} <b>${cleanTime} (Asia/Bishkek)</b>\n` +
    `${I18N_TEXTS.settingsRain[lang]} <b>${rainVal}</b>\n` +
    `${I18N_TEXTS.settingsStorm[lang]} <b>${stormVal}</b>\n` +
    `${I18N_TEXTS.settingsLanguage[lang]} <b>${langVal}</b>\n\n` +
    (isKy ? 'Параметрди алмаштыруу үчүн төмөнкү баскычты басыңыз:' : isEn ? 'Tap below to modify parameters:' : 'Нажмите кнопку ниже, чтобы изменить параметр:');

  if (editMessageId) {
    await safeEditMessageText(bot, text, {
      chat_id: chatId,
      message_id: editMessageId,
      ...getSettingsInlineKeyboard(user),
    });
  } else {
    await safeSendMessage(bot, chatId, text, {
      ...getSettingsInlineKeyboard(user),
    });
  }
}

async function askForLocation(chatId: number, lang: Language = 'ru'): Promise<void> {
  await safeSendMessage(bot, chatId, I18N_TEXTS.chooseRegionPrompt[lang], {
    ...getKyrgyzstanRegionsKeyboard(lang),
  });
}

/**
 * Обработка поиска города или села Кыргызстана с понятными сообщениями об ошибках
 */
async function handleCitySearch(chatId: number, userId: number, query: string): Promise<void> {
  const user = getUser(userId);
  const lang = user?.language || 'ru';

  try {
    const results = await searchCities(query, lang);
    if (!results.length) {
      await safeSendMessage(
        bot,
        chatId,
        I18N_TEXTS.cityNotFound[lang](query),
        {
          ...getKyrgyzstanRegionsKeyboard(lang),
        }
      );
      return;
    }

    if (results.length === 1) {
      const city = results[0];
      const fullName = city.admin1 ? `${city.name} (${city.admin1})` : city.name;
      setUserLocation(userId, fullName, city.latitude, city.longitude, city.timezone);

      await safeSendMessage(
        bot,
        chatId,
        I18N_TEXTS.locationSaved[lang](fullName),
        { ...getMainReplyKeyboard(lang) }
      );

      const updated = getValidUser(userId);
      return sendUserWeather(chatId, updated);
    }

    const choosePrompt =
      lang === 'ky'
        ? `🔍 «<b>${escapeHtml(query)}</b>» боюнча Кыргызстанда бир нече аймак табылды. Тандаңыз:`
        : lang === 'en'
        ? `🔍 Multiple matches found in Kyrgyzstan for «<b>${escapeHtml(query)}</b>». Select yours:`
        : `🔍 Найдено несколько совпадений в Кыргызстане для «<b>${escapeHtml(query)}</b>». Выберите ваш район:`;

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

    await safeSendMessage(bot, chatId, choosePrompt, {
      reply_markup: { inline_keyboard: buttons },
    });
  } catch (err: any) {
    console.error('Ошибка поиска города:', err);
    const errText =
      lang === 'ky'
        ? '⚠️ Аймак издөө кызматы убактылуу иштебей жатат. Төмөнкү тизмеден облусту тандаңыз:'
        : lang === 'en'
        ? '⚠️ Search service is temporarily unavailable. Please select your region below:'
        : '⚠️ Служба поиска временно недоступна. Пожалуйста, выберите область из списка ниже:';

    await safeSendMessage(bot, chatId, errText, {
      ...getKyrgyzstanRegionsKeyboard(lang),
    });
  }
}

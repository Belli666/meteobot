import { escapeHtml } from './telegramSafe';

export type Language = 'ky' | 'ru' | 'en';

export const SUPPORTED_LANGUAGES: Language[] = ['ky', 'ru', 'en'];

export function normalizeLang(lang?: string | null): Language {
  if (lang === 'ky' || lang === 'ru' || lang === 'en') {
    return lang;
  }
  return 'ru'; // По умолчанию русский
}

export interface WeatherCodeMeta {
  description: string;
  emoji: string;
}

export const WEATHER_CODE_TRANSLATIONS: Record<Language, Record<number, WeatherCodeMeta>> = {
  ky: {
    0: { description: 'Ачык асман', emoji: '☀️' },
    1: { description: 'Негизинен ачык', emoji: '🌤️' },
    2: { description: 'Маал-маалы менен булуттуу', emoji: '⛅' },
    3: { description: 'Булуттуу', emoji: '☁️' },
    45: { description: 'Туман', emoji: '🌫️' },
    48: { description: 'Кыроолуу туман', emoji: '🌫️' },
    51: { description: 'Бир аз себүүлөгөн жамгыр', emoji: '🌦️' },
    53: { description: 'Себүүлөгөн жамгыр', emoji: '🌦️' },
    55: { description: 'Катуу себүүлөгөн жамгыр', emoji: '🌧️' },
    56: { description: 'Тоңгон майда жамгыр', emoji: '🌧️' },
    57: { description: 'Катуу тоңгон жамгыр', emoji: '🌧️' },
    61: { description: 'Бир аз жамгыр', emoji: '🌧️' },
    63: { description: 'Орточо жамгыр', emoji: '🌧️' },
    65: { description: 'Катуу жамгыр', emoji: '🌧️' },
    66: { description: 'Муздак жамгыр', emoji: '🌨️' },
    67: { description: 'Катуу муздак жамгыр', emoji: '🌨️' },
    71: { description: 'Бир аз кар', emoji: '🌨️' },
    73: { description: 'Орточо кар', emoji: '❄️' },
    75: { description: 'Калың кар', emoji: '❄️' },
    77: { description: 'Кар бүртүкчөлөрү', emoji: '❄️' },
    80: { description: 'Кыска мөөнөттүү жамгыр', emoji: '🌦️' },
    81: { description: 'Нөшөрлөгөн жамгыр', emoji: '🌧️' },
    82: { description: 'Катуу нөшөр', emoji: '⛈️' },
    85: { description: 'Кардуу бороон', emoji: '🌨️' },
    86: { description: 'Калың кардуу бороон', emoji: '🌨️' },
    95: { description: 'Күн күркүрөп, чагылгандуу жамгыр', emoji: '⚡' },
    96: { description: 'Мөндүр аралаш чагылган', emoji: '⛈️' },
    99: { description: 'Катуу мөндүр аралаш чагылган', emoji: '⛈️' },
  },
  ru: {
    0: { description: 'Ясно', emoji: '☀️' },
    1: { description: 'В основном ясно', emoji: '🌤️' },
    2: { description: 'Переменная облачность', emoji: '⛅' },
    3: { description: 'Пасмурно', emoji: '☁️' },
    45: { description: 'Туман', emoji: '🌫️' },
    48: { description: 'Туман с инеем', emoji: '🌫️' },
    51: { description: 'Легкая морось', emoji: '🌦️' },
    53: { description: 'Морось', emoji: '🌦️' },
    55: { description: 'Густая морось', emoji: '🌧️' },
    56: { description: 'Ледяная морось', emoji: '🌧️' },
    57: { description: 'Плотная ледяная морось', emoji: '🌧️' },
    61: { description: 'Слабый дождь', emoji: '🌧️' },
    63: { description: 'Умеренный дождь', emoji: '🌧️' },
    65: { description: 'Сильный дождь', emoji: '🌧️' },
    66: { description: 'Ледяной дождь', emoji: '🌨️' },
    67: { description: 'Сильный ледяной дождь', emoji: '🌨️' },
    71: { description: 'Слабый снегопад', emoji: '🌨️' },
    73: { description: 'Умеренный снегопад', emoji: '❄️' },
    75: { description: 'Сильный снегопад', emoji: '❄️' },
    77: { description: 'Снежная крупа', emoji: '❄️' },
    80: { description: 'Кратковременный дождь', emoji: '🌦️' },
    81: { description: 'Ливневый дождь', emoji: '🌧️' },
    82: { description: 'Шквальный ливень', emoji: '⛈️' },
    85: { description: 'Снегопад зарядами', emoji: '🌨️' },
    86: { description: 'Сильный снежный шквал', emoji: '🌨️' },
    95: { description: 'Гроза', emoji: '⚡' },
    96: { description: 'Гроза с градом', emoji: '⛈️' },
    99: { description: 'Сильная гроза с градом', emoji: '⛈️' },
  },
  en: {
    0: { description: 'Clear sky', emoji: '☀️' },
    1: { description: 'Mainly clear', emoji: '🌤️' },
    2: { description: 'Partly cloudy', emoji: '⛅' },
    3: { description: 'Overcast', emoji: '☁️' },
    45: { description: 'Fog', emoji: '🌫️' },
    48: { description: 'Depositing rime fog', emoji: '🌫️' },
    51: { description: 'Light drizzle', emoji: '🌦️' },
    53: { description: 'Moderate drizzle', emoji: '🌦️' },
    55: { description: 'Dense drizzle', emoji: '🌧️' },
    56: { description: 'Freezing drizzle', emoji: '🌧️' },
    57: { description: 'Dense freezing drizzle', emoji: '🌧️' },
    61: { description: 'Slight rain', emoji: '🌧️' },
    63: { description: 'Moderate rain', emoji: '🌧️' },
    65: { description: 'Heavy rain', emoji: '🌧️' },
    66: { description: 'Freezing rain', emoji: '🌨️' },
    67: { description: 'Heavy freezing rain', emoji: '🌨️' },
    71: { description: 'Slight snow fall', emoji: '🌨️' },
    73: { description: 'Moderate snow fall', emoji: '❄️' },
    75: { description: 'Heavy snow fall', emoji: '❄️' },
    77: { description: 'Snow grains', emoji: '❄️' },
    80: { description: 'Slight rain showers', emoji: '🌦️' },
    81: { description: 'Moderate rain showers', emoji: '🌧️' },
    82: { description: 'Violent rain showers', emoji: '⛈️' },
    85: { description: 'Slight snow showers', emoji: '🌨️' },
    86: { description: 'Heavy snow showers', emoji: '🌨️' },
    95: { description: 'Thunderstorm', emoji: '⚡' },
    96: { description: 'Thunderstorm with hail', emoji: '⛈️' },
    99: { description: 'Severe thunderstorm with hail', emoji: '⛈️' },
  },
};

export const I18N_TEXTS = {
  // Трехъязычное стартовое приветствие
  welcomeMultilingual: (firstName: string) =>
    `👋 <b>Саламатсызбы / Здравствуйте / Hello, ${escapeHtml(firstName)}!</b>\n\n` +
    `🇰🇬 <b>Кыргызча:</b>\n` +
    `Кыргызстандын метеорологиялык ботуна кош келиңиз! Күнүмдүк аба ырайын, кол чатыр алуу кеңешин жана эртең мененки маалыматты алуу үчүн тилди тандаңыз.\n\n` +
    `🇷🇺 <b>Русский:</b>\n` +
    `Добро пожаловать в метео-бот по Кыргызстану! Чтобы получать точный прогноз, советы про зонт и утренние сводки, выберите язык.\n\n` +
    `🇬🇧 <b>English:</b>\n` +
    `Welcome to the Kyrgyzstan Weather Bot! To receive daily forecasts, umbrella alerts, and morning briefings, please select your language:`,

  languageSelectedMsg: {
    ky: '✅ <b>Кыргыз тили тандалды!</b> 🇰🇬',
    ru: '✅ <b>Выбран русский язык!</b> 🇷🇺',
    en: '✅ <b>English language selected!</b> 🇬🇧',
  },

  chooseRegionPrompt: {
    ky: '📍 <b>Кыргызстандын кайсы облусунда же шаарында турасыз?</b>\nТөмөндөгү баскычтар аркылуу өз аймагыңызды тандаңыз, геопозицияңызды жөнөтүңүз же шаар/айылдын атын жазыңыз:',
    ru: '📍 <b>В какой области или городе Кыргызстана вы находитесь?</b>\nВыберите область кнопками ниже, отправьте геопозицию или напишите название города/села в чат:',
    en: '📍 <b>Which region or city in Kyrgyzstan are you located in?</b>\nSelect your region below, send your GPS location, or type your city/village name:',
  },

  locationSaved: {
    ky: (city: string) =>
      `✅ <b>Аймак сакталды:</b> ${escapeHtml(city)}!\nЭми аба ырайы жана эртең мененки маалыматтар ушул аймакка негизделет.`,
    ru: (city: string) =>
      `✅ <b>Регион сохранён:</b> ${escapeHtml(city)}!\nТеперь прогноз погоды, советы про зонт и утренние сводки настроены под этот регион.`,
    en: (city: string) =>
      `✅ <b>Location saved:</b> ${escapeHtml(city)}!\nNow all weather reports, umbrella advice, and daily briefings are set for this region.`,
  },

  buttons: {
    myWeather: {
      ky: '🌡️ Аба ырайы',
      ru: '🌡️ Моя погода',
      en: '🌡️ My Weather',
    },
    forecast3d: {
      ky: '📅 3 күндүк',
      ru: '📅 На 3 дня',
      en: '📅 3-Day Forecast',
    },
    hourly: {
      ky: '⏱️ Саат сайын',
      ru: '⏱️ По часам',
      en: '⏱️ Hourly',
    },
    details: {
      ky: '📊 Толук маалымат',
      ru: '📊 Подробнее',
      en: '📊 Details',
    },
    selectRegion: {
      ky: '🗺️ Башка аймак',
      ru: '🗺️ Выбрать город',
      en: '🗺️ Change City',
    },
    settings: {
      ky: '⚙️ Ырастоолор',
      ru: '⚙️ Настройки',
      en: '⚙️ Settings',
    },
    sendLocation: {
      ky: '📍 Жайгашкан жеримди жөнөтүү',
      ru: '📍 Моя геопозиция',
      en: '📍 Send GPS location',
    },
    refresh: {
      ky: '🔄 Жаңылоо',
      ru: '🔄 Обновить',
      en: '🔄 Refresh',
    },
    changeLanguage: {
      ky: '🌐 Тилди алмаштыруу',
      ru: '🌐 Сменить язык',
      en: '🌐 Change Language',
    },
    back: {
      ky: '⬅️ Артview',
      ru: '⬅️ Назад',
      en: '⬅️ Back',
    },
    backToWeather: {
      ky: '⬅️ Аба ырайына кайтуу',
      ru: '⬅️ Назад к погоде',
      en: '⬅️ Back to weather',
    },
  },

  weatherLabels: {
    temp: { ky: 'Температура', ru: 'Температура', en: 'Temperature' },
    feelsLike: { ky: 'сезилет', ru: 'ощущается как', en: 'feels like' },
    humidity: { ky: 'Нымдуулук', ru: 'Влажность', en: 'Humidity' },
    pressure: { ky: 'Басым', ru: 'Давление', en: 'Pressure' },
    pressureUnit: { ky: 'сымап мамычасынын мм', ru: 'мм рт. ст.', en: 'mmHg' },
    wind: { ky: 'Шамал', ru: 'Ветер', en: 'Wind' },
    windSpeedUnit: { ky: 'м/с', ru: 'м/с', en: 'm/s' },
    windGusts: { ky: 'күчөшү', ru: 'порывы до', en: 'gusts up to' },
    sunrise: { ky: 'Күн чыгышы', ru: 'Восход', en: 'Sunrise' },
    sunset: { ky: 'Күн батышы', ru: 'Закат', en: 'Sunset' },
    hourlyTitle: {
      ky: 'Саат сайын божомол',
      ru: 'Почасовой прогноз',
      en: 'Hourly Forecast',
    },
    detailsTitle: {
      ky: 'Толук көрсөткүчтөр',
      ru: 'Подробные показатели',
      en: 'Detailed Weather Metrics',
    },
    updatedAt: {
      ky: 'Жаңыртылды',
      ru: 'Обновлено в',
      en: 'Updated at',
    },
    timeBishkek: {
      ky: 'Бишкек убактысы (UTC+6)',
      ru: 'время Бишкека (UTC+6)',
      en: 'Bishkek time (UTC+6)',
    },
    sourcesLabel: {
      ky: '📡 <b>Маалымат булактары:</b>\n• Аба ырайы модели: Open-Meteo (ECMWF / GFS)\n• Аймактык багыттар: Кыргызгидромет (meteo.kg)',
      ru: '📡 <b>Источники данных:</b>\n• Погодная модель: Open-Meteo (ECMWF / GFS)\n• Региональная база и ориентиры: Кыргызгидромет (meteo.kg)',
      en: '📡 <b>Data Sources:</b>\n• Forecast model: Open-Meteo (ECMWF / GFS)\n• Regional baseline: Kyrgyzhydromet (meteo.kg)',
    },
  },

  forecastTitle: {
    ky: (city: string) => `📍 <b>${escapeHtml(city)} — 3 күндүк аба ырайы</b>`,
    ru: (city: string) => `📍 <b>Прогноз на 3 дня · ${escapeHtml(city)}</b>`,
    en: (city: string) => `📍 <b>3-Day Weather Forecast · ${escapeHtml(city)}</b>`,
  },

  todayLabel: { ky: 'Бүгүн', ru: 'Сегодня', en: 'Today' },
  tomorrowLabel: { ky: 'Эртең', ru: 'Завтра', en: 'Tomorrow' },
  precipLabel: { ky: 'Жаан-чачын', ru: 'Осадки', en: 'Precipitation' },
  maxWindLabel: { ky: 'Шамалдын макс.', ru: 'Макс. ветер', en: 'Max wind' },
  uvLabel: { ky: 'УФ-индекс', ru: 'УФ-индекс', en: 'UV index' },

  settingsTitle: {
    ky: '⚙️ <b>MeteoBot ырастоолору</b>',
    ru: '⚙️ <b>Настройки MeteoBot</b>',
    en: '⚙️ <b>MeteoBot Settings</b>',
  },

  settingsCurrentCity: {
    ky: '📍 Текущий аймак:',
    ru: '📍 Текущий регион:',
    en: '📍 Current region:',
  },

  settingsMorning: {
    ky: '🔔 Эртең мененки маалымат:',
    ru: '🔔 Утренняя сводка:',
    en: '🔔 Daily morning briefing:',
  },

  settingsTime: {
    ky: '⏰ Убактысы:',
    ru: '⏰ Время сводки:',
    en: '⏰ Briefing time:',
  },

  settingsRain: {
    ky: '☔ Жамгыр эскертүүсү:',
    ru: '☔ Оповещение о дожде:',
    en: '☔ Rain alert:',
  },

  settingsStorm: {
    ky: '🚨 Бороон/шамал эскертүүсү:',
    ru: '🚨 Опасная погода:',
    en: '🚨 Storm alert:',
  },

  settingsLanguage: {
    ky: '🌐 Тил:',
    ru: '🌐 Язык:',
    en: '🌐 Language:',
  },

  enabled: { ky: 'Вкл', ru: 'Вкл', en: 'On' },
  disabled: { ky: 'Өчүк', ru: 'Выкл', en: 'Off' },

  chooseTimeTitle: {
    ky: '⏰ <b>Эртең мененки маалымат үчүн убакытты тандаңыз</b>\n<i>Часовой пояс: Asia/Bishkek (UTC+6)</i>',
    ru: '⏰ <b>Выберите время утренней сводки</b>\n<i>Часовой пояс: Asia/Bishkek (UTC+6)</i>',
    en: '⏰ <b>Select time for daily morning briefing</b>\n<i>Timezone: Asia/Bishkek (UTC+6)</i>',
  },

  timeSetSuccess: {
    ky: (t: string) => `⏰ Эртең мененки маалымат убактысы <b>${escapeHtml(t)}</b> деп коюлду (Бишкек убактысы)!`,
    ru: (t: string) => `⏰ Время утренней сводки установлено на <b>${escapeHtml(t)}</b> (время Бишкека)!`,
    en: (t: string) => `⏰ Daily briefing time successfully set to <b>${escapeHtml(t)}</b> (Bishkek time)!`,
  },

  cityNotFound: {
    ky: (q: string) =>
      `🔍 Кыргызстандан «<b>${escapeHtml(q)}</b>» деген айыл/шаар табылган жок.\n\nСураныч, Кыргызстандын шаарын же айылын жазыңыз (мисалы: <i>Бишкек, Ош, Каракол, Токмок, Кочкор, Ноокат, Балыкчы</i>) же төмөнкү баскычтан облусту тандаңыз:`,
    ru: (q: string) =>
      `🔍 В Кыргызстане населённый пункт «<b>${escapeHtml(q)}</b>» не найден.\n\nПожалуйста, напишите город или село Кыргызстана (например: <i>Бишкек, Ош, Каракол, Токмок, Кочкор, Ноокат, Балыкчы</i>) или выберите область кнопкой ниже:`,
    en: (q: string) =>
      `🔍 No location «<b>${escapeHtml(q)}</b>» was found in Kyrgyzstan.\n\nPlease enter a city or village in Kyrgyzstan (e.g., <i>Bishkek, Osh, Karakol, Tokmok, Kochkor, Nookat, Balykchy</i>) or select a region below:`,
  },
};

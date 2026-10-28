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
    `👋 **Саламатсызбы / Здравствуйте / Hello, ${firstName}!**\n\n` +
    `🇰🇬 **Кыргызча:**\n` +
    `Кыргызстандын метеорологиялык ботуна кош келиңиз! Күнүмдүк аба ырайын, кол чатыр алуу кеңешин жана эртең мененки маалыматты алуу үчүн тилди тандаңыз.\n\n` +
    `🇷🇺 **Русский:**\n` +
    `Добро пожаловать в метео-бот по Кыргызстану! Чтобы получать точный прогноз, советы про зонт и утренние сводки, выберите язык.\n\n` +
    `🇬🇧 **English:**\n` +
    `Welcome to the Kyrgyzstan Weather Bot! To receive daily forecasts, umbrella alerts, and morning briefings, please select your language:`,

  languageSelectedMsg: {
    ky: '✅ **Кыргыз тили тандалды!** 🇰🇬',
    ru: '✅ **Выбран русский язык!** 🇷🇺',
    en: '✅ **English language selected!** 🇬🇧',
  },

  chooseRegionPrompt: {
    ky: '📍 **Кыргызстандын кайсы облусунда же шаарында турасыз?**\nТөмөндөгү баскычтар аркылуу өз аймагыңызды тандаңыз, геопозицияңызды жөнөтүңүз же шаар/айылдын атын жазыңыз:',
    ru: '📍 **В какой области или городе Кыргызстана вы находитесь?**\nВыберите область кнопками ниже, отправьте геопозицию или напишите название города/села в чат:',
    en: '📍 **Which region or city in Kyrgyzstan are you located in?**\nSelect your region below, send your GPS location, or type your city/village name:',
  },

  locationSaved: {
    ky: (city: string) =>
      `✅ **Аймак сакталды:** ${city}!\nЭми аба ырайы, кол чатыр боюнча кеңештер жана эртең мененки маалыматтар ушул аймакка негизделет.`,
    ru: (city: string) =>
      `✅ **Регион сохранён:** ${city}!\nТеперь прогноз погоды, советы про зонт и утренние сводки настроены под этот регион.`,
    en: (city: string) =>
      `✅ **Location saved:** ${city}!\nNow all weather reports, umbrella advice, and daily briefings are set for this region.`,
  },

  buttons: {
    myWeather: {
      ky: '🌡️ Менин аба ырайым',
      ru: '🌡️ Моя погода',
      en: '🌡️ My Weather',
    },
    umbrella: {
      ky: '☂️ Кол чатыр',
      ru: '☂️ Зонт',
      en: '☂️ Umbrella',
    },
    clothing: {
      ky: '🧥 Эмне кийүү керек?',
      ru: '🧥 Что надеть',
      en: '🧥 What to wear',
    },
    forecast3d: {
      ky: '📅 3 күндүк божомол',
      ru: '📅 Прогноз на 3 дня',
      en: '📅 3-Day Forecast',
    },
    selectRegion: {
      ky: '🗺️ Облусту тандоо',
      ru: '🗺️ Выбрать область',
      en: '🗺️ Select Region',
    },
    settings: {
      ky: '⚙️ Ырастоолор',
      ru: '⚙️ Настройки',
      en: '⚙️ Settings',
    },
    sendLocation: {
      ky: '📍 Жайгашкан жеримди жөнөтүү',
      ru: '📍 Отправить мою геопозицию',
      en: '📍 Send my location',
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
      ky: '⬅️ Артка',
      ru: '⬅️ Назад',
      en: '⬅️ Back',
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
      ky: '📊 **Саат сайын божомол:**',
      ru: '📊 **Почасовой прогноз:**',
      en: '📊 **Hourly forecast:**',
    },
    adviceTitle: {
      ky: '💡 **Метеорологдун кеңештери:**',
      ru: '💡 **Советы метеоролога:**',
      en: '💡 **Meteorologist Advice:**',
    },
    source: {
      ky: '📡 *Маалымат: Open-Meteo жана Кыргызгидромет (meteo.kg)*',
      ru: '📡 *Данные: Open-Meteo и Кыргызгидромет (meteo.kg)*',
      en: '📡 *Data: Open-Meteo & Kyrgyzhydromet (meteo.kg)*',
    },
  },

  umbrellaTitle: {
    ky: (city: string) => `☂️ **${city} үчүн жаан-чачын жана кол чатыр анализи**`,
    ru: (city: string) => `☂️ **Анализ осадков и зонта для ${city}**`,
    en: (city: string) => `☂️ **Precipitation & Umbrella Analysis for ${city}**`,
  },

  clothingTitle: {
    ky: (city: string) => `🧥 **${city} үчүн кийим кеңеши**`,
    ru: (city: string) => `🧥 **Гардеробный совет для ${city}**`,
    en: (city: string) => `🧥 **Clothing Advice for ${city}**`,
  },

  forecastTitle: {
    ky: (city: string) => `📍 **${city} үчүн 3 күндүк аба ырайы божомолу**`,
    ru: (city: string) => `📍 **Прогноз погоды на 3 дня для ${city}**`,
    en: (city: string) => `📍 **3-Day Weather Forecast for ${city}**`,
  },

  todayLabel: { ky: 'Бүгүн', ru: 'Сегодня', en: 'Today' },
  tomorrowLabel: { ky: 'Эртең', ru: 'Завтра', en: 'Tomorrow' },
  precipLabel: { ky: 'Жаан-чачын', ru: 'Осадки', en: 'Precipitation' },
  maxWindLabel: { ky: 'Шамалдын макс.', ru: 'Макс. ветер', en: 'Max wind' },
  uvLabel: { ky: 'УФ-индекс', ru: 'УФ-индекс', en: 'UV index' },

  settingsTitle: {
    ky: '⚙️ **Билдирүүлөр жана аба ырайы кызматынын ырастоолору**',
    ru: '⚙️ **Настройки оповещений и метеослужбы**',
    en: '⚙️ **Notification and Weather Service Settings**',
  },

  settingsCurrentCity: {
    ky: '📍 Учурдагы аймак:',
    ru: '📍 Текущий регион:',
    en: '📍 Current region:',
  },

  settingsMorning: {
    ky: '⏰ Эртең мененки маалымат:',
    ru: '⏰ Утренняя сводка:',
    en: '⏰ Morning briefing:',
  },

  settingsRain: {
    ky: '☔ Жамгыр жөнүндө эскертүү:',
    ru: '☔ Оповещение о дожде:',
    en: '☔ Rain alert:',
  },

  settingsStorm: {
    ky: '🚨 Бороон/шамал эскертүүсү:',
    ru: '🚨 Экстренный штормовой алерт:',
    en: '🚨 Severe storm alert:',
  },

  settingsLanguage: {
    ky: '🌐 Тил:',
    ru: '🌐 Язык:',
    en: '🌐 Language:',
  },

  enabled: { ky: '✅ Күйүк', ru: '✅ Вкл', en: '✅ On' },
  disabled: { ky: '❌ Өчүк', ru: '❌ Выкл', en: '❌ Off' },

  chooseTimeTitle: {
    ky: '⏰ **Эртең мененки маалымат үчүн ыңгайлуу убакытты тандаңыз (Бишкек убактысы):**',
    ru: '⏰ **Выберите удобное время для утренней сводки (по Бишкеку):**',
    en: '⏰ **Select preferred time for daily morning briefing (Bishkek time):**',
  },

  timeSetSuccess: {
    ky: (t: string) => `⏰ Эртең мененки маалымат убактысы **${t}** деп коюлду!`,
    ru: (t: string) => `⏰ Время утренней сводки успешно установлено на **${t}**!`,
    en: (t: string) => `⏰ Morning briefing time successfully set to **${t}**!`,
  },

  cityNotFound: {
    ky: (q: string) =>
      `🔍 Кыргызстандан «**${q}**» деген айыл/шаар табылган жок.\nСураныч, Кыргызстандын шаарын же айылын жазыңыз (мисалы: *Бишкек*, *Ош*, *Каракол*, *Токмок*, *Кочкор*, *Ноокат*) же төмөнкү баскычтан облусту тандаңыз:`,
    ru: (q: string) =>
      `🔍 В Кыргызстане населённый пункт «**${q}**» не найден.\nПожалуйста, напишите город или село Кыргызстана (например: *Бишкек*, *Ош*, *Каракол*, *Токмок*, *Кочкор*, *Ноокат*) или выберите область кнопкой ниже:`,
    en: (q: string) =>
      `🔍 No location «**${q}**» was found in Kyrgyzstan.\nPlease enter a city or village in Kyrgyzstan (e.g., *Bishkek*, *Osh*, *Karakol*, *Tokmok*, *Kochkor*, *Nookat*) or select a region below:`,
  },
};

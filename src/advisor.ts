import { WeatherData } from './weatherService';

export interface WeatherAdvice {
  umbrella: string;
  clothing: string;
  wind: string;
  sun: string;
  health: string;
}

export function generateAdvice(weather: WeatherData): WeatherAdvice {
  const cur = weather.current;
  const hourly = weather.hourlyNext12h;
  const todayDaily = weather.daily7Days[0];

  // 1. Анализ зонта и осадков
  let umbrella = '☀️ Зонт не нужен: осадков не ожидается, небо чистое.';
  
  const willRainHourly = hourly.find((h) => h.precipitationProbability >= 40 || h.precipitation > 0.2);
  const maxRainHourly = hourly.reduce((max, h) => (h.precipitationProbability > max ? h.precipitationProbability : max), 0);
  const isCurrentlyRaining = cur.precipitation > 0.1 || cur.weatherCode >= 51;

  if (isCurrentlyRaining) {
    if (cur.weatherCode >= 71 && cur.weatherCode <= 77) {
      umbrella = '❄️ На улице снегопад — зонт пригодится, если снег мокрый, чтобы не промокнуть.';
    } else if (cur.weatherCode >= 80 && cur.weatherCode <= 99) {
      umbrella = '⛈️ Обязательно возьмите зонт или дождевик! На улице ливень или гроза.';
    } else {
      umbrella = '🌧️ На улице идёт дождь — обязательно захватите зонт!';
    }
  } else if (willRainHourly) {
    umbrella = `☂️ Захватите зонт с собой! Около ${willRainHourly.time} ожидается дождь (вероятность ${willRainHourly.precipitationProbability}%).`;
  } else if (maxRainHourly >= 25) {
    umbrella = `🌦️ Возможен небольшой локальный дождь (вероятность до ${maxRainHourly}%). Маленький складной зонт в рюкзаке не помешает.`;
  }

  // 2. Гардероб и слои одежды (по apparentTemperature / «Ощущается как»)
  const feelsLike = cur.apparentTemperature;
  let clothing = '';

  if (feelsLike < -20) {
    clothing = '🥶 Экстремальный мороз! Плотный пуховик, термобелье, теплая шапка, шарф и варежки. Не оставайтесь долго на холоде.';
  } else if (feelsLike < -10) {
    clothing = '❄️ Очень морозно. Зимняя куртка/пуховик, свитер, теплая шапка, шарф и перчатки.';
  } else if (feelsLike < -3) {
    clothing = '🧤 Зимняя погода. Теплая куртка, шапка, перчатки и утепленная обувь.';
  } else if (feelsLike < 5) {
    clothing = '🧣 Холодно и промозгло (около нуля). Демисезонная куртка или пальто, легкая шапка, непромокаемая обувь.';
  } else if (feelsLike < 12) {
    clothing = '🧥 Прохладно. Весенне-осенняя куртка, джемпер или толстовка, закрытая обувь.';
  } else if (feelsLike < 18) {
    clothing = '🦺 Свежо и комфортно. Ветровка, бомбер или плотное худи с джинсами.';
  } else if (feelsLike < 24) {
    clothing = '👕 Приятное тепло. Лонгслив, рубашка или футболка. На поздний вечер можно прихватить легкую кофту.';
  } else {
    clothing = '🩳 Жара! Легкая хлопковая одежда, шорты, футболка и головной убор от перегрева.';
  }

  // 3. Ветер
  let wind = '🍃 Ветер слабый, спокойная комфортная погода.';
  if (cur.windSpeed >= 15 || cur.windGusts >= 18) {
    wind = `🚨 Штормовые порывы ветра до ${cur.windGusts || cur.windSpeed} м/с! Осторожно рядом с деревьями и рекламными щитами, не оставляйте окна открытыми.`;
  } else if (cur.windSpeed >= 10 || cur.windGusts >= 13) {
    wind = `💨 Порывистый свежий ветер (до ${cur.windGusts || cur.windSpeed} м/с). Держите зонт крепче, берегитесь сквозняков.`;
  } else if (cur.windSpeed >= 6) {
    wind = `🌬️ Умеренный ощутимый ветер (${cur.windSpeed} м/с).`;
  }

  // 4. Солнце и УФ
  const uv = todayDaily ? todayDaily.uvIndexMax : 0;
  let sun = '🟢 УФ-индекс низкий: защита от солнца не требуется.';
  if (uv >= 8) {
    sun = `🔴 Очень высокий УФ-индекс (${uv})! Защита кожи обязательна: крем SPF 50+, очки, головной убор, избегайте солнца в полдень.`;
  } else if (uv >= 6) {
    sun = `🟠 Высокий УФ-индекс (${uv})! Нанесите крем SPF 30+, возьмите солнцезащитные очки и панаму/кепку.`;
  } else if (uv >= 3) {
    sun = `🟡 Умеренное солнце (УФ ${uv}). При долгом нахождении на улице рекомендуются солнцезащитные очки.`;
  }

  // 5. Давление и самочувствие
  let health = '✨ Атмосферное давление в пределах нормы.';
  if (cur.pressureMmHg < 742) {
    health = `📉 Пониженное давление (${cur.pressureMmHg} мм рт. ст.). Приближается циклон. У гипотоников возможна сонливость и слабость — пейте больше воды или чашку кофе.`;
  } else if (cur.pressureMmHg > 765) {
    health = `📈 Повышенное давление (${cur.pressureMmHg} мм рт. ст., антициклон). Метеочувствительным людям стоит избегать сильных физических нагрузок.`;
  }

  return { umbrella, clothing, wind, sun, health };
}

export function formatWeatherMessage(weather: WeatherData): string {
  const cur = weather.current;
  const today = weather.daily7Days[0];
  const advice = generateAdvice(weather);

  let hourlySnippet = '';
  if (weather.hourlyNext12h.length) {
    hourlySnippet = '\n📊 **Почасовой прогноз:**\n' +
      weather.hourlyNext12h
        .slice(0, 6)
        .map((h) => `• \`${h.time}\` ${h.weatherEmoji} ${h.temperature > 0 ? '+' : ''}${h.temperature}° (${h.precipitationProbability}% 🌧)`)
        .join('\n');
  }

  return (
    `📍 **${weather.cityName}**\n` +
    `${cur.weatherEmoji} **${cur.weatherDescription}**\n\n` +
    `🌡️ Температура: **${cur.temperature > 0 ? '+' : ''}${cur.temperature}°C** ` +
    `(ощущается как **${cur.apparentTemperature > 0 ? '+' : ''}${cur.apparentTemperature}°C**)\n` +
    `💧 Влажность: **${cur.humidity}%**\n` +
    `🧭 Давление: **${cur.pressureMmHg} мм рт. ст.**\n` +
    `💨 Ветер: **${cur.windSpeed} м/с** (порывы до ${cur.windGusts} м/с)\n` +
    (today ? `🌅 Восход: \`${today.sunrise}\` | Закат: \`${today.sunset}\`\n` : '') +
    hourlySnippet +
    `\n\n` +
    `───────────────\n` +
    `💡 **Советы метеоролога:**\n` +
    `${advice.umbrella}\n\n` +
    `${advice.clothing}\n\n` +
    `${advice.wind}\n` +
    (today && today.uvIndexMax >= 3 ? `\n${advice.sun}\n` : '') +
    (cur.pressureMmHg < 742 || cur.pressureMmHg > 765 ? `\n${advice.health}\n` : '')
  );
}

export function formatMorningBriefing(weather: WeatherData, userName: string): string {
  const today = weather.daily7Days[0];
  const advice = generateAdvice(weather);
  const cur = weather.current;

  return (
    `☀️ **Доброе утро, ${userName}!**\n` +
    `Метеосводка на сегодня для города **${weather.cityName}**:\n\n` +
    `${cur.weatherEmoji} Днём: **${today ? (today.tempMax > 0 ? '+' : '') + today.tempMax : cur.temperature}°C**, ` +
    `ночью до **${today ? (today.tempMin > 0 ? '+' : '') + today.tempMin : cur.temperature}°C**\n` +
    `🌡️ Сейчас: **${cur.temperature > 0 ? '+' : ''}${cur.temperature}°C** (ощущается как **${cur.apparentTemperature}°C**)\n\n` +
    `🎯 **Главный совет на день:**\n` +
    `${advice.umbrella}\n\n` +
    `👗 **Что надеть:**\n` +
    `${advice.clothing}\n\n` +
    (cur.windSpeed >= 10 ? `⚠️ ${advice.wind}\n\n` : '') +
    `Желаем отличного и продуктивного дня! 🚀`
  );
}

export function formatForecast3Days(weather: WeatherData): string {
  const days = weather.daily7Days.slice(0, 4);

  const lines = days.map((d, index) => {
    const label = index === 0 ? 'Сегодня' : index === 1 ? 'Завтра' : d.date;
    return (
      `📅 **${label}** (${d.date}):\n` +
      `${d.weatherEmoji} ${d.weatherDescription}\n` +
      `🌡️ Днём: **${d.tempMax > 0 ? '+' : ''}${d.tempMax}°C** | Ночью: **${d.tempMin > 0 ? '+' : ''}${d.tempMin}°C**\n` +
      `🌧️ Осадки: **${d.precipitationSum} мм** (вероятность ${d.precipitationProbabilityMax}%)\n` +
      `💨 Макс. ветер: **${d.windSpeedMax} м/с** | ☀️ УФ: **${d.uvIndexMax}**\n`
    );
  });

  return (
    `📍 **Прогноз погоды для ${weather.cityName}**\n\n` +
    lines.join('\n───────────────\n')
  );
}

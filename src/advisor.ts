import { WeatherData } from './weatherService';
import { Language, I18N_TEXTS } from './i18n';
import { escapeHtml } from './telegramSafe';

export interface WeatherAdvice {
  umbrella: string;
  clothing: string;
  wind: string;
  isStorm: boolean;
  sun: string;
}

export function generateAdvice(weather: WeatherData, lang: Language = 'ru'): WeatherAdvice {
  const cur = weather.current;
  const hourly = weather.hourlyNext12h;
  const todayDaily = weather.daily7Days[0];
  const isKy = lang === 'ky';
  const isEn = lang === 'en';

  // 1. Зонт / Кол чатыр / Umbrella (без ложных выводов о небе)
  let umbrella = isKy
    ? 'Жакынкы сааттарда жаан-чачын күтүлбөйт — кол чатыр керек эмес.'
    : isEn
    ? 'No precipitation expected in the coming hours — no umbrella needed.'
    : 'В ближайшие часы осадков не ожидается — зонт не понадобится.';

  const willRainHourly = hourly.find((h) => h.precipitationProbability >= 40 || h.precipitation > 0.2);
  const maxRainHourly = hourly.reduce((max, h) => (h.precipitationProbability > max ? h.precipitationProbability : max), 0);
  const isCurrentlyRaining = cur.precipitation > 0.1 || cur.weatherCode >= 51;

  if (isCurrentlyRaining) {
    if (cur.weatherCode >= 71 && cur.weatherCode <= 77) {
      umbrella = isKy
        ? 'Сыртта кар жаап жатат — кол чатыр же суу өтпөс кийим пайдалуу болот.'
        : isEn
        ? 'Snow falling outside — an umbrella or waterproof jacket recommended.'
        : 'На улице снегопад — зонт или влагозащитная куртка не помешают.';
    } else if (cur.weatherCode >= 80 && cur.weatherCode <= 99) {
      umbrella = isKy
        ? 'Катуу нөшөр же бороон — сөзсүз кол чатыр же жамгыр жамынма алыңыз!'
        : isEn
        ? 'Heavy rain or storm — definitely bring an umbrella or raincoat!'
        : 'Сильный ливень или гроза — обязательно возьмите зонт или дождевик!';
    } else {
      umbrella = isKy
        ? 'Сыртта жамгыр жаап жатат — кол чатыр алууну унутпаңыз!'
        : isEn
        ? 'It is raining outside — do not forget your umbrella!'
        : 'На улице идёт дождь — обязательно захватите зонт!';
    }
  } else if (willRainHourly) {
    umbrella = isKy
      ? `Саат ${willRainHourly.time} чамасында жамгыр күтүлөт (${willRainHourly.precipitationProbability}%) — кол чатыр ала жүрүңүз.`
      : isEn
      ? `Rain expected around ${willRainHourly.time} (${willRainHourly.precipitationProbability}%) — take an umbrella with you.`
      : `Около ${willRainHourly.time} ожидается дождь (${willRainHourly.precipitationProbability}%) — захватите зонт.`;
  } else if (maxRainHourly >= 25) {
    umbrella = isKy
      ? `Бир аз жамгыр жаашы мүмкүн (${maxRainHourly}% чейин) — чакан бүктөлмө кол чатыр ашыкча болбойт.`
      : isEn
      ? `Light localized rain possible (up to ${maxRainHourly}%) — a compact umbrella is recommended.`
      : `Возможен небольшой локальный дождь (до ${maxRainHourly}%) — компактный зонт не помешает.`;
  }

  // 2. Кийим кеңеши / Гардероб / Clothing
  const feelsLike = cur.apparentTemperature;
  let clothing = '';

  if (feelsLike < -15) {
    clothing = isKy
      ? 'Абдан суук: калың кышкы куртка, жылуу баш кийим, шарф жана мээлей.'
      : isEn
      ? 'Severe freeze: heavy winter coat, warm hat, scarf, and insulated gloves.'
      : 'Сильный мороз: тёплый пуховик, зимняя шапка, шарф и перчатки.';
  } else if (feelsLike < -5) {
    clothing = isKy
      ? 'Суук кышкы аба ырайы: жылуу куртка, свитер, баш кийим жана өтүк.'
      : isEn
      ? 'Cold winter weather: winter jacket, warm sweater, beanie, and winter boots.'
      : 'Зимний холод: тёплая куртка, свитер, шапка и зимняя обувь.';
  } else if (feelsLike < 5) {
    clothing = isKy
      ? 'Салкын жана нымдуу: демисезондук куртка же пальто, жабык бут кийим.'
      : isEn
      ? 'Cold and damp: demi-season jacket or coat, light hat, closed shoes.'
      : 'Холодно около нуля: демисезонная куртка или пальто, закрытая обувь.';
  } else if (feelsLike < 14) {
    clothing = isKy
      ? 'Серүүн: жазгы/күзгү куртка, джемпер же жылуу кофта.'
      : isEn
      ? 'Chilly: autumn/spring jacket, sweater or hoodie, closed shoes.'
      : 'Прохладно: куртка или плотное худи и закрытая обувь.';
  } else if (feelsLike < 21) {
    clothing = isKy
      ? 'Серүүн жана жагымдуу: ветровка, лонгслив же жеңил кофта.'
      : isEn
      ? 'Mild and comfortable: windbreaker, long-sleeve or light top.'
      : 'Комфортно: ветровка, лонгслив или лёгкая кофта.';
  } else {
    clothing = isKy
      ? 'Жылуу/ысык: жеңил пахта кийимдер, футболка жана күндөн калпак.'
      : isEn
      ? 'Warm weather: light cotton clothes, t-shirt, and sun protection.'
      : 'Тепло: лёгкая хлопковая одежда, футболка и защита от солнца.';
  }

  // 3. Шамал / Опасный ветер / Wind Alert
  const isStorm = cur.windSpeed >= 12 || cur.windGusts >= 15;
  const sp = cur.windGusts || cur.windSpeed;
  let wind = '';

  if (isStorm) {
    wind = isKy
      ? `🚨 <b>Эскертүү:</b> шамалдын күчөшү ${sp} м/с чейин — бак-дарактардан жана жеңил курулмалардан алыс болуңуз.`
      : isEn
      ? `🚨 <b>Alert:</b> wind gusts up to ${sp} m/s — be cautious near trees and billboards.`
      : `🚨 <b>Внимание:</b> порывы ветра до ${sp} м/с — будьте осторожны рядом с деревьями и щитами.`;
  } else if (cur.windSpeed >= 8 || cur.windGusts >= 10) {
    wind = isKy
      ? `💨 Сезилээрлик шамал (күчөшү ${sp} м/с чейин).`
      : isEn
      ? `💨 Brisk gusty wind (gusts up to ${sp} m/s).`
      : `💨 Ощутимый свежий ветер (порывы до ${sp} м/с).`;
  } else {
    wind = isKy ? '🍃 Жай, тынч шамал.' : isEn ? '🍃 Calm gentle breeze.' : '🍃 Слабый спокойный ветер.';
  }

  // 4. Күн жана УФ / UV
  const uv = todayDaily ? todayDaily.uvIndexMax : 0;
  let sun = isKy
    ? '🟢 УФ-индекс төмөн.'
    : isEn
    ? '🟢 UV index low.'
    : '🟢 УФ-индекс низкий.';

  if (uv >= 6) {
    sun = isKy
      ? `🟠 Жогорку УФ-индекс (${uv}): күндөн көз айнек жана SPF крем сунушталат.`
      : isEn
      ? `🟠 High UV index (${uv}): sunglasses and SPF recommended.`
      : `🟠 Высокий УФ-индекс (${uv}): рекомендуются солнцезащитные очки и крем SPF.`;
  }

  return { umbrella, clothing, wind, isStorm, sun };
}

/**
 * Главная компактная карточка погоды
 */
export function formatWeatherMessage(weather: WeatherData, lang: Language = 'ru'): string {
  const cur = weather.current;
  const advice = generateAdvice(weather, lang);
  const labels = I18N_TEXTS.weatherLabels;

  const stormLine = advice.isStorm ? `${advice.wind}\n\n` : '';

  return (
    `📍 <b>${escapeHtml(weather.cityName)}</b>\n` +
    `${cur.weatherEmoji} <b>${cur.temperature > 0 ? '+' : ''}${cur.temperature}°</b> · ${labels.feelsLike[lang]} <b>${cur.apparentTemperature > 0 ? '+' : ''}${cur.apparentTemperature}°</b>\n\n` +
    `${stormLine}` +
    `☂️ ${advice.umbrella}\n` +
    `🧥 ${advice.clothing}\n\n` +
    `<i>${labels.updatedAt[lang]} ${weather.fetchTimestamp} · ${labels.timeBishkek[lang]}</i>`
  );
}

/**
 * Экран подробных метеопоказателей
 */
export function formatWeatherDetailsMessage(weather: WeatherData, lang: Language = 'ru'): string {
  const cur = weather.current;
  const today = weather.daily7Days[0];
  const labels = I18N_TEXTS.weatherLabels;

  // Описание давления с учётом горной высоты Кыргызстана (Бишкек ~750-800 м, Нарын/Каракол ~1700-2000 м)
  const pressureDesc =
    lang === 'ky'
      ? `(тоолуу бийиктикке ылайыктуу)`
      : lang === 'en'
      ? `(standard for local elevation)`
      : `(норма для высоты региона)`;

  return (
    `📊 <b>${escapeHtml(weather.cityName)} · ${labels.detailsTitle[lang]}</b>\n\n` +
    `🌡️ ${labels.temp[lang]}: <b>${cur.temperature > 0 ? '+' : ''}${cur.temperature}°C</b> (${labels.feelsLike[lang]} <b>${cur.apparentTemperature > 0 ? '+' : ''}${cur.apparentTemperature}°C</b>)\n` +
    `💧 ${labels.humidity[lang]}: <b>${cur.humidity}%</b>\n` +
    `🧭 ${labels.pressure[lang]}: <b>${cur.pressureMmHg} ${labels.pressureUnit[lang]}</b> ${pressureDesc}\n` +
    `💨 ${labels.wind[lang]}: <b>${cur.windSpeed} ${labels.windSpeedUnit[lang]}</b> (${labels.windGusts[lang]} <b>${cur.windGusts} ${labels.windSpeedUnit[lang]}</b>)\n` +
    (today ? `🌅 ${labels.sunrise[lang]}: <b>${today.sunrise}</b> · ${labels.sunset[lang]}: <b>${today.sunset}</b>\n` : '') +
    (today ? `☀️ ${I18N_TEXTS.uvLabel[lang]}: <b>${today.uvIndexMax}</b>\n\n` : '\n') +
    `${labels.sourcesLabel[lang]}\n\n` +
    `<i>${labels.updatedAt[lang]} ${weather.fetchTimestamp} · ${labels.timeBishkek[lang]}</i>`
  );
}

/**
 * Экран почасового прогноза (на 8-10 часов вперёд)
 */
export function formatHourlyForecastMessage(weather: WeatherData, lang: Language = 'ru'): string {
  const labels = I18N_TEXTS.weatherLabels;
  const items = weather.hourlyNext12h.slice(0, 8);

  const lines = items.map((h) => {
    const tempStr = `${h.temperature > 0 ? '+' : ''}${h.temperature}°`;
    const rainStr = h.precipitationProbability > 0 ? `(${h.precipitationProbability}% 🌧)` : '';
    return `• <b>${h.time}</b> ${h.weatherEmoji} <b>${tempStr}</b> ${rainStr}`.trim();
  });

  return (
    `⏱️ <b>${escapeHtml(weather.cityName)} · ${labels.hourlyTitle[lang]}</b>\n\n` +
    lines.join('\n') +
    `\n\n<i>${labels.updatedAt[lang]} ${weather.fetchTimestamp} · ${labels.timeBishkek[lang]}</i>`
  );
}

const RU_MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const RU_WEEKDAYS = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

const KY_MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const KY_WEEKDAYS = ['Жекшемби', 'Дүйшөмбү', 'Шейшемби', 'Шаршемби', 'Бейшемби', 'Жума', 'Ишемби'];

const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EN_WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatDayHeader(dateStr: string, index: number, lang: Language): string {
  if (index === 0) {
    const parts = dateStr.split('-');
    const day = parseInt(parts[2] || '1', 10);
    const month = parseInt(parts[1] || '1', 10) - 1;
    if (lang === 'ky') return `Бүгүн, ${day}-${KY_MONTHS[month]}`;
    if (lang === 'en') return `Today, ${EN_MONTHS[month]} ${day}`;
    return `Сегодня, ${day} ${RU_MONTHS[month]}`;
  }

  if (index === 1) {
    const parts = dateStr.split('-');
    const day = parseInt(parts[2] || '1', 10);
    const month = parseInt(parts[1] || '1', 10) - 1;
    if (lang === 'ky') return `Эртең, ${day}-${KY_MONTHS[month]}`;
    if (lang === 'en') return `Tomorrow, ${EN_MONTHS[month]} ${day}`;
    return `Завтра, ${day} ${RU_MONTHS[month]}`;
  }

  // 3-й день: день недели + дата
  try {
    const d = new Date(`${dateStr}T12:00:00Z`);
    const day = d.getUTCDate();
    const month = d.getUTCMonth();
    const weekday = d.getUTCDay();

    if (lang === 'ky') return `${KY_WEEKDAYS[weekday]}, ${day}-${KY_MONTHS[month]}`;
    if (lang === 'en') return `${EN_WEEKDAYS[weekday]}, ${EN_MONTHS[month]} ${day}`;
    return `${RU_WEEKDAYS[weekday]}, ${day} ${RU_MONTHS[month]}`;
  } catch {
    return dateStr;
  }
}

/**
 * Прогноз строго на 3 дня (без дублирования дат)
 */
export function formatForecast3Days(weather: WeatherData, lang: Language = 'ru'): string {
  const days = weather.daily7Days.slice(0, 3); // Строго 3 дня!
  const title = I18N_TEXTS.forecastTitle[lang](weather.cityName);
  const precip = I18N_TEXTS.precipLabel[lang];
  const maxWind = I18N_TEXTS.maxWindLabel[lang];
  const isKy = lang === 'ky';
  const isEn = lang === 'en';

  const lines = days.map((d, index) => {
    const header = formatDayHeader(d.date, index, lang);

    const dayNight = isKy
      ? `🌡️ Күндүз: <b>${d.tempMax > 0 ? '+' : ''}${d.tempMax}°C</b> · Түнкүсүн: <b>${d.tempMin > 0 ? '+' : ''}${d.tempMin}°C</b>`
      : isEn
      ? `🌡️ Day: <b>${d.tempMax > 0 ? '+' : ''}${d.tempMax}°C</b> · Night: <b>${d.tempMin > 0 ? '+' : ''}${d.tempMin}°C</b>`
      : `🌡️ Днём: <b>${d.tempMax > 0 ? '+' : ''}${d.tempMax}°C</b> · Ночью: <b>${d.tempMin > 0 ? '+' : ''}${d.tempMin}°C</b>`;

    const mmUnit = isEn ? 'mm' : 'мм';
    const msUnit = isEn ? 'm/s' : 'м/с';

    const rainLine =
      d.precipitationProbabilityMax > 0
        ? `🌧️ ${precip}: <b>${d.precipitationSum} ${mmUnit}</b> (${d.precipitationProbabilityMax}%) · 💨 ${maxWind}: <b>${d.windSpeedMax} ${msUnit}</b>`
        : `🌧️ ${precip}: <b>0 ${mmUnit}</b> · 💨 ${maxWind}: <b>${d.windSpeedMax} ${msUnit}</b>`;

    return (
      `📅 <b>${header}:</b>\n` +
      `${d.weatherEmoji} ${d.weatherDescription}\n` +
      `${dayNight}\n` +
      `${rainLine}`
    );
  });

  return (
    `${title}\n\n` +
    lines.join('\n\n───────────────\n\n') +
    `\n\n<i>${I18N_TEXTS.weatherLabels.updatedAt[lang]} ${weather.fetchTimestamp} · ${I18N_TEXTS.weatherLabels.timeBishkek[lang]}</i>`
  );
}

/**
 * Утренний брифинг
 */
export function formatMorningBriefing(weather: WeatherData, userName: string, lang: Language = 'ru'): string {
  const today = weather.daily7Days[0];
  const advice = generateAdvice(weather, lang);
  const cur = weather.current;
  const isKy = lang === 'ky';
  const isEn = lang === 'en';

  const greeting = isKy
    ? `☀️ <b>Кутман таң, ${escapeHtml(userName)}!</b>\nБүгүнкү күнгө <b>${escapeHtml(weather.cityName)}</b> боюнча метеомаалымат:\n\n`
    : isEn
    ? `☀️ <b>Good morning, ${escapeHtml(userName)}!</b>\nToday's weather briefing for <b>${escapeHtml(weather.cityName)}</b>:\n\n`
    : `☀️ <b>Доброе утро, ${escapeHtml(userName)}!</b>\nМетеосводка на сегодня для <b>${escapeHtml(weather.cityName)}</b>:\n\n`;

  const dayNight = isKy
    ? `${cur.weatherEmoji} Күндүз: <b>${today ? (today.tempMax > 0 ? '+' : '') + today.tempMax : cur.temperature}°C</b>, түнкүсүн <b>${today ? (today.tempMin > 0 ? '+' : '') + today.tempMin : cur.temperature}°C</b> чейин\n`
    : isEn
    ? `${cur.weatherEmoji} Day: <b>${today ? (today.tempMax > 0 ? '+' : '') + today.tempMax : cur.temperature}°C</b>, Night down to <b>${today ? (today.tempMin > 0 ? '+' : '') + today.tempMin : cur.temperature}°C</b>\n`
    : `${cur.weatherEmoji} Днём: <b>${today ? (today.tempMax > 0 ? '+' : '') + today.tempMax : cur.temperature}°C</b>, ночью до <b>${today ? (today.tempMin > 0 ? '+' : '') + today.tempMin : cur.temperature}°C</b>\n`;

  const now = isKy
    ? `🌡️ Азыр: <b>${cur.temperature > 0 ? '+' : ''}${cur.temperature}°C</b> (${I18N_TEXTS.weatherLabels.feelsLike[lang]} <b>${cur.apparentTemperature > 0 ? '+' : ''}${cur.apparentTemperature}°C</b>)\n\n`
    : isEn
    ? `🌡️ Currently: <b>${cur.temperature > 0 ? '+' : ''}${cur.temperature}°C</b> (${I18N_TEXTS.weatherLabels.feelsLike[lang]} <b>${cur.apparentTemperature > 0 ? '+' : ''}${cur.apparentTemperature}°C</b>)\n\n`
    : `🌡️ Сейчас: <b>${cur.temperature > 0 ? '+' : ''}${cur.temperature}°C</b> (${I18N_TEXTS.weatherLabels.feelsLike[lang]} <b>${cur.apparentTemperature > 0 ? '+' : ''}${cur.apparentTemperature}°C</b>)\n\n`;

  return (
    greeting +
    dayNight +
    now +
    `☂️ ${advice.umbrella}\n` +
    `🧥 ${advice.clothing}\n\n` +
    (advice.isStorm ? `${advice.wind}\n\n` : '') +
    (isKy ? 'Күнүңүз ийгиликтүү өтсүн! 🚀' : isEn ? 'Have a great day! 🚀' : 'Желаем отличного дня! 🚀')
  );
}

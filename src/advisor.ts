import { WeatherData } from './weatherService';
import { Language, I18N_TEXTS } from './i18n';

export interface WeatherAdvice {
  umbrella: string;
  clothing: string;
  wind: string;
  sun: string;
  health: string;
}

export function generateAdvice(weather: WeatherData, lang: Language = 'ru'): WeatherAdvice {
  const cur = weather.current;
  const hourly = weather.hourlyNext12h;
  const todayDaily = weather.daily7Days[0];
  const isKy = lang === 'ky';
  const isEn = lang === 'en';

  // 1. Зонт / Кол чатыр / Umbrella
  let umbrella = isKy
    ? '☀️ Кол чатырдын кереги жок: жаан-чачын күтүлбөйт, күн ачык.'
    : isEn
    ? '☀️ No umbrella needed: dry weather and clear skies.'
    : '☀️ Зонт не нужен: осадков не ожидается, небо чистое.';

  const willRainHourly = hourly.find((h) => h.precipitationProbability >= 40 || h.precipitation > 0.2);
  const maxRainHourly = hourly.reduce((max, h) => (h.precipitationProbability > max ? h.precipitationProbability : max), 0);
  const isCurrentlyRaining = cur.precipitation > 0.1 || cur.weatherCode >= 51;

  if (isCurrentlyRaining) {
    if (cur.weatherCode >= 71 && cur.weatherCode <= 77) {
      umbrella = isKy
        ? '❄️ Сыртта кар жаап жатат — суу болбос үчүн кол чатыр пайдалуу болот.'
        : isEn
        ? '❄️ Snow is falling outside — an umbrella will keep you dry from wet snow.'
        : '❄️ На улице снегопад — зонт пригодится, если снег мокрый, чтобы не промокнуть.';
    } else if (cur.weatherCode >= 80 && cur.weatherCode <= 99) {
      umbrella = isKy
        ? '⛈️ Сөзсүз кол чатыр же жамгыр жамынма алыңыз! Нөшөрлөгөн жамгыр жаап жатат.'
        : isEn
        ? '⛈️ Definitely take an umbrella or raincoat! Heavy rain or storm outside.'
        : '⛈️ Обязательно возьмите зонт или дождевик! На улице ливень или гроза.';
    } else {
      umbrella = isKy
        ? '🌧️ Сыртта жамгыр жаап жатат — кол чатыр алууну унутпаңыз!'
        : isEn
        ? '🌧️ It is raining outside — be sure to grab an umbrella!'
        : '🌧️ На улице идёт дождь — обязательно захватите зонт!';
    }
  } else if (willRainHourly) {
    umbrella = isKy
      ? `☂️ Жаныңызга кол чатыр ала жүрүңүз! Саат ${willRainHourly.time} чамасында жамгыр жаашы мүмкүн (${willRainHourly.precipitationProbability}% ыктымалдуулук).`
      : isEn
      ? `☂️ Take an umbrella with you! Rain is expected around ${willRainHourly.time} (${willRainHourly.precipitationProbability}% probability).`
      : `☂️ Захватите зонт с собой! Около ${willRainHourly.time} ожидается дождь (вероятность ${willRainHourly.precipitationProbability}%).`;
  } else if (maxRainHourly >= 25) {
    umbrella = isKy
      ? `🌦️ Бир аз жамгыр жаашы ыктымал (${maxRainHourly}% чейин). Бүктөлмө чакан кол чатыр ашыкча болбойт.`
      : isEn
      ? `🌦️ Light rain possible (up to ${maxRainHourly}% chance). A compact umbrella might be handy.`
      : `🌦️ Возможен небольшой локальный дождь (вероятность до ${maxRainHourly}%). Маленький складной зонт в рюкзаке не помешает.`;
  }

  // 2. Кийим кеңеши / Гардероб / Clothing
  const feelsLike = cur.apparentTemperature;
  let clothing = '';

  if (feelsLike < -20) {
    clothing = isKy
      ? '🥶 Абдан катуу суук! Калың пуховик, термоич кийим, жылуу баш кийим, моюн орогуч жана мээлей кийиңиз.'
      : isEn
      ? '🥶 Extreme frost! Heavy down jacket, thermal underwear, warm hat, scarf, and mittens required.'
      : '🥶 Экстремальный мороз! Плотный пуховик, термобелье, теплая шапка, шарф и варежки. Не оставайтесь долго на холоде.';
  } else if (feelsLike < -10) {
    clothing = isKy
      ? '❄️ Катуу суук. Кышкы жылуу куртка, свитер, баш кийим, шарф жана кол кап кийиңиз.'
      : isEn
      ? '❄️ Very cold. Winter jacket, warm sweater, hat, scarf, and insulated boots.'
      : '❄️ Очень морозно. Зимняя куртка/пуховик, свитер, теплая шапка, шарф и перчатки.';
  } else if (feelsLike < -3) {
    clothing = isKy
      ? '🧤 Кышкы аба ырайы. Жылуу куртка, баш кийим, мээлей жана жылуу бут кийим.'
      : isEn
      ? '🧤 Winter weather. Warm coat, hat, gloves, and warm footwear.'
      : '🧤 Зимняя погода. Теплая куртка, шапка, перчатки и утепленная обувь.';
  } else if (feelsLike < 5) {
    clothing = isKy
      ? '🧣 Нымдуу суук (нөлгө жакын). Демисезондук куртка же пальто, жеңил баш кийим, суу өтпөс бут кийим.'
      : isEn
      ? '🧣 Cold and damp (near zero). Demi-season jacket or coat, light beanie, waterproof shoes.'
      : '🧣 Холодно и промозгло (около нуля). Демисезонная куртка или пальто, легкая шапка, непромокаемая обувь.';
  } else if (feelsLike < 12) {
    clothing = isKy
      ? '🧥 Салкын. Жазгы/күзгү куртка, джемпер же калың кофта кийиңиз.'
      : isEn
      ? '🧥 Chilly. Autumn/spring jacket, sweatshirt or hoodie, closed shoes.'
      : '🧥 Прохладно. Весенне-осенняя куртка, джемпер или толстовка, закрытая обувь.';
  } else if (feelsLike < 18) {
    clothing = isKy
      ? '🦺 Серүүн жана жагымдуу. Ветровка, худи же жеңил куртка джинсы менен.'
      : isEn
      ? '🦺 Fresh and mild. Windbreaker, light fleece jacket or hoodie with jeans.'
      : '🦺 Свежо и комфортно. Ветровка, бомбер или плотное худи с джинсами.';
  } else if (feelsLike < 24) {
    clothing = isKy
      ? '👕 Жылуу жана жагымдуу. Көйнөк, лонгслив же футболка. Кечинде жеңил кофта керек болушу мүмкүн.'
      : isEn
      ? '👕 Pleasantly warm. T-shirt, shirt or long-sleeve. A light top may be needed in the evening.'
      : '👕 Приятное тепло. Лонгслив, рубашка или футболка. На поздний вечер можно прихватить легкую кофту.';
  } else {
    clothing = isKy
      ? '🩳 Ысык! Жеңил пахта кийимдер, футболка, шорты жана күндөн калпак кийиңиз.'
      : isEn
      ? '🩳 Hot weather! Light cotton clothing, shorts, t-shirt, and a sun cap.'
      : '🩳 Жара! Легкая хлопковая одежда, шорты, футболка и головной убор от перегрева.';
  }

  // 3. Шамал / Ветер / Wind
  let wind = isKy
    ? '🍃 Шамал жай, тынч жана жагымдуу аба ырайы.'
    : isEn
    ? '🍃 Calm breeze, pleasant weather.'
    : '🍃 Ветер слабый, спокойная комфортная погода.';

  if (cur.windSpeed >= 15 || cur.windGusts >= 18) {
    const sp = cur.windGusts || cur.windSpeed;
    wind = isKy
      ? `🚨 Катуу бороондуу шамал ${sp} м/с чейин! Бак-дарактардан жана жеңил курулмалардан алыс болуңуз, терезелерди бекитиңиз.`
      : isEn
      ? `🚨 Severe storm wind gusts up to ${sp} m/s! Watch out for trees and billboards, keep windows shut.`
      : `🚨 Штормовые порывы ветра до ${sp} м/с! Осторожно рядом с деревьями и рекламными щитами, не оставляйте окна открытыми.`;
  } else if (cur.windSpeed >= 10 || cur.windGusts >= 13) {
    const sp = cur.windGusts || cur.windSpeed;
    wind = isKy
      ? `💨 Ылдам шамал (күчөшү ${sp} м/с чейин). Кол чатырды бекем кармаңыз.`
      : isEn
      ? `💨 Gusty brisk wind (up to ${sp} m/s). Hold your umbrella firmly.`
      : `💨 Порывистый свежий ветер (до ${sp} м/с). Держите зонт крепче, берегитесь сквозняков.`;
  } else if (cur.windSpeed >= 6) {
    wind = isKy
      ? `🌬️ Сезилээрлик орточо шамал (${cur.windSpeed} м/с).`
      : isEn
      ? `🌬️ Moderate breeze (${cur.windSpeed} m/s).`
      : `🌬️ Умеренный ощутимый ветер (${cur.windSpeed} м/с).`;
  }

  // 4. Күн жана УФ / Солнце и УФ / Sun & UV
  const uv = todayDaily ? todayDaily.uvIndexMax : 0;
  let sun = isKy
    ? '🟢 УФ-индекс төмөн: күндөн атайын коргонуу талап кылынбайт.'
    : isEn
    ? '🟢 UV index low: no sun protection required.'
    : '🟢 УФ-индекс низкий: защита от солнца не требуется.';

  if (uv >= 8) {
    sun = isKy
      ? `🔴 Абдан жогорку УФ-индекс (${uv})! Терини коргоо зарыл: SPF 50+ крем, көз айнек, панама, түштө күнгө чыкпаңыз.`
      : isEn
      ? `🔴 Very high UV index (${uv})! SPF 50+ sunscreen, sunglasses, and hat essential. Avoid midday sun.`
      : `🔴 Очень высокий УФ-индекс (${uv})! Защита кожи обязательна: крем SPF 50+, очки, головной убор, избегайте солнца в полдень.`;
  } else if (uv >= 6) {
    sun = isKy
      ? `🟠 Жогорку УФ-индекс (${uv})! SPF 30+ крем сүйкөп, күн көз айнек жана баш кийим кийиңиз.`
      : isEn
      ? `🟠 High UV index (${uv})! Wear SPF 30+ sunscreen, sunglasses, and a hat.`
      : `🟠 Высокий УФ-индекс (${uv})! Нанесите крем SPF 30+, возьмите солнцезащитные очки и панаму/кепку.`;
  } else if (uv >= 3) {
    sun = isKy
      ? `🟡 Орточо күн нуру (УФ ${uv}). Көчөдө көпкө жүрсөңүз, күн көз айнек сунушталат.`
      : isEn
      ? `🟡 Moderate UV (${uv}). Sunglasses recommended if staying outdoors.`
      : `🟡 Умеренное солнце (УФ ${uv}). При долгом нахождении на улице рекомендуются солнцезащитные очки.`;
  }

  // 5. Басым / Давление / Pressure
  let health = isKy
    ? '✨ Аба басымы нормада.'
    : isEn
    ? '✨ Atmospheric pressure is normal.'
    : '✨ Атмосферное давление в пределах нормы.';

  if (cur.pressureMmHg < 742) {
    health = isKy
      ? `📉 Төмөн басым (${cur.pressureMmHg} мм). Циклон келе жатат. Башыңыз ооруп же уйкуңуз келиши мүмкүн — көбүрөөк суу же кофе ичиңиз.`
      : isEn
      ? `📉 Low pressure (${cur.pressureMmHg} mmHg, cyclone). Sensitive individuals may experience fatigue or headaches.`
      : `📉 Пониженное давление (${cur.pressureMmHg} мм рт. ст.). Приближается циклон. У гипотоников возможна сонливость и слабость.`;
  } else if (cur.pressureMmHg > 765) {
    health = isKy
      ? `📈 Жогорку басым (${cur.pressureMmHg} мм, антициклон). Катуу күч келтирүүдөн сактаныңыз.`
      : isEn
      ? `📈 High pressure (${cur.pressureMmHg} mmHg, anticyclone). Avoid excessive physical exertion.`
      : `📈 Повышенное давление (${cur.pressureMmHg} мм рт. ст., антициклон). Метеочувствительным людям стоит избегать сильных нагрузок.`;
  }

  return { umbrella, clothing, wind, sun, health };
}

export function formatWeatherMessage(weather: WeatherData, lang: Language = 'ru'): string {
  const cur = weather.current;
  const today = weather.daily7Days[0];
  const advice = generateAdvice(weather, lang);
  const labels = I18N_TEXTS.weatherLabels;

  let hourlySnippet = '';
  if (weather.hourlyNext12h.length) {
    hourlySnippet =
      `\n${labels.hourlyTitle[lang]}\n` +
      weather.hourlyNext12h
        .slice(0, 6)
        .map((h) => `• \`${h.time}\` ${h.weatherEmoji} ${h.temperature > 0 ? '+' : ''}${h.temperature}° (${h.precipitationProbability}% 🌧)`)
        .join('\n');
  }

  return (
    `📍 **${weather.cityName}**\n` +
    `${cur.weatherEmoji} **${cur.weatherDescription}**\n\n` +
    `🌡️ ${labels.temp[lang]}: **${cur.temperature > 0 ? '+' : ''}${cur.temperature}°C** ` +
    `(${labels.feelsLike[lang]} **${cur.apparentTemperature > 0 ? '+' : ''}${cur.apparentTemperature}°C**)\n` +
    `💧 ${labels.humidity[lang]}: **${cur.humidity}%**\n` +
    `🧭 ${labels.pressure[lang]}: **${cur.pressureMmHg} ${labels.pressureUnit[lang]}**\n` +
    `💨 ${labels.wind[lang]}: **${cur.windSpeed} ${labels.windSpeedUnit[lang]}** (${labels.windGusts[lang]} ${cur.windGusts} ${labels.windSpeedUnit[lang]})\n` +
    (today ? `🌅 ${labels.sunrise[lang]}: \`${today.sunrise}\` | ${labels.sunset[lang]}: \`${today.sunset}\`\n` : '') +
    hourlySnippet +
    `\n\n` +
    `───────────────\n` +
    `${labels.adviceTitle[lang]}\n` +
    `${advice.umbrella}\n\n` +
    `${advice.clothing}\n\n` +
    `${advice.wind}\n` +
    (today && today.uvIndexMax >= 3 ? `\n${advice.sun}\n` : '') +
    (cur.pressureMmHg < 742 || cur.pressureMmHg > 765 ? `\n${advice.health}\n` : '') +
    `\n───────────────\n` +
    `${labels.source[lang]}`
  );
}

export function formatMorningBriefing(weather: WeatherData, userName: string, lang: Language = 'ru'): string {
  const today = weather.daily7Days[0];
  const advice = generateAdvice(weather, lang);
  const cur = weather.current;
  const isKy = lang === 'ky';
  const isEn = lang === 'en';

  const greeting = isKy
    ? `☀️ **Кутман таң, ${userName}!**\nБүгүнкү күнгө **${weather.cityName}** боюнча метеомаалымат:\n\n`
    : isEn
    ? `☀️ **Good morning, ${userName}!**\nToday's weather briefing for **${weather.cityName}**:\n\n`
    : `☀️ **Доброе утро, ${userName}!**\nМетеосводка на сегодня для **${weather.cityName}**:\n\n`;

  const dayNight = isKy
    ? `${cur.weatherEmoji} Күндүз: **${today ? (today.tempMax > 0 ? '+' : '') + today.tempMax : cur.temperature}°C**, түнкүсүн **${today ? (today.tempMin > 0 ? '+' : '') + today.tempMin : cur.temperature}°C** чейин\n`
    : isEn
    ? `${cur.weatherEmoji} Day: **${today ? (today.tempMax > 0 ? '+' : '') + today.tempMax : cur.temperature}°C**, Night down to **${today ? (today.tempMin > 0 ? '+' : '') + today.tempMin : cur.temperature}°C**\n`
    : `${cur.weatherEmoji} Днём: **${today ? (today.tempMax > 0 ? '+' : '') + today.tempMax : cur.temperature}°C**, ночью до **${today ? (today.tempMin > 0 ? '+' : '') + today.tempMin : cur.temperature}°C**\n`;

  const now = isKy
    ? `🌡️ Азыр: **${cur.temperature > 0 ? '+' : ''}${cur.temperature}°C** (сезилет **${cur.apparentTemperature}°C**)\n\n`
    : isEn
    ? `🌡️ Currently: **${cur.temperature > 0 ? '+' : ''}${cur.temperature}°C** (feels like **${cur.apparentTemperature}°C**)\n\n`
    : `🌡️ Сейчас: **${cur.temperature > 0 ? '+' : ''}${cur.temperature}°C** (ощущается как **${cur.apparentTemperature}°C**)\n\n`;

  const mainTipHeader = isKy ? '🎯 **Күндүн негизги кеңеши:**\n' : isEn ? '🎯 **Key tip for today:**\n' : '🎯 **Главный совет на день:**\n';
  const clothingHeader = isKy ? '👗 **Эмне кийүү керек:**\n' : isEn ? '👗 **What to wear:**\n' : '👗 **Что надеть:**\n';
  const wish = isKy ? 'Күнүңүз ийгиликтүү жана жемиштүү өтсүн! 🚀' : isEn ? 'Have a wonderful and productive day! 🚀' : 'Желаем отличного и продуктивного дня! 🚀';

  return (
    greeting +
    dayNight +
    now +
    mainTipHeader +
    `${advice.umbrella}\n\n` +
    clothingHeader +
    `${advice.clothing}\n\n` +
    (cur.windSpeed >= 10 ? `⚠️ ${advice.wind}\n\n` : '') +
    wish
  );
}

export function formatForecast3Days(weather: WeatherData, lang: Language = 'ru'): string {
  const days = weather.daily7Days.slice(0, 4);
  const title = I18N_TEXTS.forecastTitle[lang](weather.cityName);
  const precip = I18N_TEXTS.precipLabel[lang];
  const maxWind = I18N_TEXTS.maxWindLabel[lang];
  const uv = I18N_TEXTS.uvLabel[lang];
  const isKy = lang === 'ky';
  const isEn = lang === 'en';

  const lines = days.map((d, index) => {
    const label =
      index === 0
        ? I18N_TEXTS.todayLabel[lang]
        : index === 1
        ? I18N_TEXTS.tomorrowLabel[lang]
        : d.date;

    const dayNight = isKy
      ? `🌡️ Күндүз: **${d.tempMax > 0 ? '+' : ''}${d.tempMax}°C** | Түнкүсүн: **${d.tempMin > 0 ? '+' : ''}${d.tempMin}°C**`
      : isEn
      ? `🌡️ Day: **${d.tempMax > 0 ? '+' : ''}${d.tempMax}°C** | Night: **${d.tempMin > 0 ? '+' : ''}${d.tempMin}°C**`
      : `🌡️ Днём: **${d.tempMax > 0 ? '+' : ''}${d.tempMax}°C** | Ночью: **${d.tempMin > 0 ? '+' : ''}${d.tempMin}°C**`;

    return (
      `📅 **${label}** (${d.date}):\n` +
      `${d.weatherEmoji} ${d.weatherDescription}\n` +
      `${dayNight}\n` +
      `🌧️ ${precip}: **${d.precipitationSum} мм** (${d.precipitationProbabilityMax}%)\n` +
      `💨 ${maxWind}: **${d.windSpeedMax} м/с** | ☀️ ${uv}: **${d.uvIndexMax}**\n`
    );
  });

  return `${title}\n\n` + lines.join('\n───────────────\n');
}

import { bot, DEFAULT_TIMEZONE } from './config';
import { getUsersForNotification, getAllActiveUsers } from './db';
import { fetchWeatherData } from './weatherService';
import { formatMorningBriefing, generateAdvice } from './advisor';
import { safeSendMessage, escapeHtml } from './telegramSafe';

let schedulerInterval: NodeJS.Timeout | null = null;
let lastNotifiedMinute = '';
const alertedUsersStorm = new Map<number, number>(); // userId -> timestamp последнего алерта

function getLocalTimeHHMM(timeZone: string = DEFAULT_TIMEZONE): string {
  try {
    const formatter = new Intl.DateTimeFormat('ru-RU', {
      timeZone: timeZone || DEFAULT_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(new Date());
  } catch {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
}

export function startNotificationScheduler(): void {
  if (schedulerInterval) {
    return;
  }

  console.log(`⏰ [MeteoBot] Планировщик утренних брифингов запущен (часовой пояс: ${DEFAULT_TIMEZONE}).`);

  // Проверяем каждые 30 секунд
  schedulerInterval = setInterval(async () => {
    try {
      await checkMorningBriefings();
      await checkStormAlerts();
    } catch (err: any) {
      console.error('❌ [MeteoBot] Ошибка в цикле планировщика:', err?.message || err);
    }
  }, 30 * 1000);
}

export function stopNotificationScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('🛑 [MeteoBot] Планировщик остановлен.');
  }
}

async function checkMorningBriefings(): Promise<void> {
  const currentTime = getLocalTimeHHMM(DEFAULT_TIMEZONE);

  // Защита от повторной отправки в ту же самую минуту
  if (currentTime === lastNotifiedMinute) {
    return;
  }

  const users = getUsersForNotification(currentTime);
  if (!users.length) {
    return;
  }

  lastNotifiedMinute = currentTime;
  console.log(`📢 [MeteoBot] Отправка утренних брифингов для ${users.length} пользователей (время: ${currentTime})...`);

  for (const user of users) {
    if (!user.latitude || !user.longitude || !user.city_name) {
      continue;
    }

    try {
      const lang = user.language || 'ru';
      const weather = await fetchWeatherData(
        user.city_name,
        user.latitude,
        user.longitude,
        user.timezone,
        lang
      );
      const text = formatMorningBriefing(weather, user.first_name || 'друг', lang);
      await safeSendMessage(bot, user.id, text);
      // Небольшая задержка между отправками для соблюдения Telegram Rate Limits
      await new Promise((res) => setTimeout(res, 200));
    } catch (err: any) {
      console.error(`❌ [MeteoBot] Не удалось отправить брифинг пользователю ${user.id}:`, err?.message || err);
    }
  }
}

async function checkStormAlerts(): Promise<void> {
  const now = Date.now();
  const users = getAllActiveUsers().filter((u) => u.alert_storm === 1);

  for (const user of users) {
    if (!user.latitude || !user.longitude || !user.city_name) continue;

    // Не спамить: алерт не чаще раза в 4 часа
    const lastAlert = alertedUsersStorm.get(user.id) || 0;
    if (now - lastAlert < 4 * 60 * 60 * 1000) {
      continue;
    }

    try {
      const lang = user.language || 'ru';
      const weather = await fetchWeatherData(user.city_name, user.latitude, user.longitude, user.timezone, lang);
      const cur = weather.current;
      const advice = generateAdvice(weather, lang);

      const isExtremeWind = cur.windGusts >= 18 || cur.windSpeed >= 15;
      const isHeavyRain = cur.weatherCode >= 81 || cur.precipitation >= 8;

      if (isExtremeWind || isHeavyRain) {
        alertedUsersStorm.set(user.id, now);
        const alertTitle =
          lang === 'ky'
            ? '🚨 <b>ШАМАЛ/БОРООН ЖӨНҮНДӨ ЭСКЕРТҮҮ</b>'
            : lang === 'en'
            ? '🚨 <b>SEVERE WEATHER ALERT</b>'
            : '🚨 <b>ШТОРМОВОЕ ПРЕДУПРЕЖДЕНИЕ</b>';

        const alertMessage =
          `${alertTitle}\n` +
          `📍 <b>${escapeHtml(weather.cityName)}</b>\n\n` +
          `${isExtremeWind ? `${advice.wind}\n` : ''}` +
          `${isHeavyRain ? `⛈️ <b>Осадки:</b> сильный дождь (${cur.precipitation} мм).\n` : ''}\n` +
          (lang === 'ky' ? 'Сак болуңуз жана этияттаңыз!' : lang === 'en' ? 'Stay safe outdoors!' : 'Будьте аккуратны на улице!');

        await safeSendMessage(bot, user.id, alertMessage);
      }
    } catch {
      // Игнорируем сетевые сбои в фоновой проверке
    }
  }
}

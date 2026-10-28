import { bot } from './config';
import { getUsersForNotification, getAllActiveUsers } from './db';
import { fetchWeatherData } from './weatherService';
import { formatMorningBriefing, generateAdvice } from './advisor';

let schedulerInterval: NodeJS.Timeout | null = null;
let lastNotifiedMinute = '';
const alertedUsersStorm = new Map<number, number>(); // userId -> timestamp последнего алерта

export function startNotificationScheduler(): void {
  if (schedulerInterval) {
    return;
  }

  console.log('⏰ [MeteoBot] Планировщик утренних брифингов и алертов запущен.');

  // Проверяем каждую минуту (каждые 30 сек)
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
  const now = new Date();
  // Формат времени HH:MM
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${hours}:${minutes}`;

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
      const weather = await fetchWeatherData(
        user.city_name,
        user.latitude,
        user.longitude,
        user.timezone
      );
      const text = formatMorningBriefing(weather, user.first_name || 'друг');
      await bot.sendMessage(user.id, text, { parse_mode: 'Markdown' });
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
      const weather = await fetchWeatherData(user.city_name, user.latitude, user.longitude, user.timezone);
      const cur = weather.current;
      const advice = generateAdvice(weather);

      const isExtremeWind = cur.windGusts >= 18 || cur.windSpeed >= 15;
      const isHeavyRain = cur.weatherCode >= 81 || cur.precipitation >= 8;

      if (isExtremeWind || isHeavyRain) {
        alertedUsersStorm.set(user.id, now);
        const alertMessage = 
          `🚨 **ЭКСТРЕННОЕ ШТОРМОВОЕ ПРЕДУПРЕЖДЕНИЕ**\n` +
          `Город: **${weather.cityName}**\n\n` +
          `${isExtremeWind ? `💨 ${advice.wind}\n` : ''}` +
          `${isHeavyRain ? `⛈️ Ожидается сильнейший ливень (${cur.precipitation} мм)! Берегите обувь и вещи.\n` : ''}\n` +
          `Будьте аккуратны на улице!`;

        await bot.sendMessage(user.id, alertMessage, { parse_mode: 'Markdown' });
      }
    } catch {
      // Игнорируем сетевые сбои в фоновой проверке
    }
  }
}

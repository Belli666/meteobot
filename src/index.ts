import { bot, isTokenConfigured, BOT_TOKEN } from './config';
import { getDb } from './db';
import { initCommands } from './command';
import { startNotificationScheduler, stopNotificationScheduler } from './notifications';

const POLLING_RESTART_DELAY_MS = 5000;
let pollingRestartTimer: NodeJS.Timeout | null = null;
let pollingRestartInProgress = false;

function extractErrorDetails(err: any): string {
  return err?.response?.body?.description || err?.message || String(err);
}

function isPollingConnectionReset(err: any): boolean {
  const details = extractErrorDetails(err);
  return (
    err?.code === 'EFATAL' ||
    err?.code === 'ECONNRESET' ||
    details.includes('ECONNRESET') ||
    details.includes('socket hang up')
  );
}

function schedulePollingRestart(reason: string): void {
  if (pollingRestartInProgress || pollingRestartTimer) {
    return;
  }

  console.warn(`⚠️ [MeteoBot] Связь с Telegram прервана (${reason}). Перезапуск polling через 5 сек...`);

  pollingRestartTimer = setTimeout(async () => {
    pollingRestartTimer = null;
    pollingRestartInProgress = true;
    try {
      if (bot.isPolling()) {
        await bot.stopPolling();
      }
      await bot.startPolling({ restart: true });
      console.log('✅ [MeteoBot] Polling успешно восстановлен.');
    } catch (e: any) {
      console.error('❌ [MeteoBot] Не удалось восстановить polling:', extractErrorDetails(e));
      schedulePollingRestart('повторная ошибка');
    } finally {
      pollingRestartInProgress = false;
    }
  }, POLLING_RESTART_DELAY_MS);
}

async function startBot(): Promise<void> {
  console.log('==================================================');
  console.log('🚀 [MeteoBot] Инициализация метео-бота...');
  console.log('==================================================');

  // 1. Инициализация базы данных SQLite
  try {
    getDb();
    console.log('💾 [MeteoBot] База данных SQLite подключена.');
  } catch (err: any) {
    console.error('❌ [MeteoBot] Ошибка инициализации базы данных:', err);
    process.exit(1);
  }

  // 2. Регистрация обработчиков команд
  initCommands();
  console.log('⌨️  [MeteoBot] Обработчики команд и кнопок зарегистрированы.');

  // 3. Запуск планировщика уведомлений
  startNotificationScheduler();

  // 4. Проверка токена
  if (!isTokenConfigured()) {
    console.log('\n-------------------------------------------------------------');
    console.log('⏸️ [MeteoBot] Бот ожидает настройки токена:');
    console.log('1. Откройте файл /home/belli/meteobot/.env');
    console.log('2. Вставьте ваш токен в строку: BOT_TOKEN=...');
    console.log('3. Запустите бота командой: npm run dev');
    console.log('-------------------------------------------------------------\n');
    return;
  }

  // 5. Обработка ошибок polling
  bot.on('polling_error', (err: any) => {
    const details = extractErrorDetails(err);
    if (isPollingConnectionReset(err)) {
      schedulePollingRestart(details);
      return;
    }
    console.error('⚠️ [MeteoBot] Ошибка Polling:', details);
  });

  bot.on('error', (err: any) => {
    console.error('⚠️ [MeteoBot] Общая ошибка бота:', extractErrorDetails(err));
  });

  // 6. Запуск Telegram Polling
  try {
    console.log('📡 [MeteoBot] Подключение к Telegram Bot API...');
    const me = await bot.getMe();
    console.log(`✅ [MeteoBot] Бот @${me.username} успешно авторизован!`);
    await bot.startPolling();
    console.log(`🚀 [MeteoBot] Polling запущен, бот слушает сообщения.`);
  } catch (err: any) {
    const details = extractErrorDetails(err);
    console.error('❌ [MeteoBot] Ошибка при старте polling:', details);
    if (details.includes('401') || details.includes('Unauthorized')) {
      console.error('👉 Проверьте правильность BOT_TOKEN в файле .env');
    }
  }
}

// Graceful shutdown
function shutdown(signal: string): void {
  console.log(`\n🛑 [MeteoBot] Получен сигнал ${signal}. Завершение работы...`);
  stopNotificationScheduler();
  if (bot.isPolling()) {
    bot.stopPolling().finally(() => {
      console.log('👋 [MeteoBot] Polling остановлен. Пока!');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

// Защита процесса от падений при непредвиденных ошибках и сетевых сбоях
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ [MeteoBot] Неперехваченный отказ промиса:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ [MeteoBot] Неперехваченное исключение (процесс продолжает работу):', err);
});

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

startBot();

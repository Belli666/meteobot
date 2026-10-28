import dotenv from 'dotenv';
import path from 'path';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

export const BOT_TOKEN = process.env.BOT_TOKEN || '';
export const ADMIN_ID = Number(process.env.ADMIN_ID) || 0;
export const DATABASE_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'meteobot.sqlite');
export const DEFAULT_TIMEZONE = process.env.DEFAULT_TIMEZONE || 'Europe/Moscow';

export function isTokenConfigured(): boolean {
  return Boolean(BOT_TOKEN && BOT_TOKEN !== 'YOUR_TELEGRAM_BOT_TOKEN_HERE');
}

export function createBot(): TelegramBot {
  if (!isTokenConfigured()) {
    console.warn('\n⚠️ [MeteoBot] Внимание: переменная BOT_TOKEN не заполнена в .env файле!');
    console.warn('👉 Откройте файл /home/belli/meteobot/.env и вставьте токен от @BotFather.\n');
  }

  // Создаем экземпляр без автозапуска polling, чтобы управлять жизненным циклом явно
  return new TelegramBot(BOT_TOKEN || 'dummy_token', { polling: { autoStart: false } });
}

export const bot = createBot();

import dotenv from 'dotenv';
import path from 'path';
import TelegramBot from 'node-telegram-bot-api';

dotenv.config();

export const BOT_TOKEN = (process.env.BOT_TOKEN || '').trim();
export const ADMIN_ID = Number(process.env.ADMIN_ID) || 0;
export const DATABASE_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'meteobot.sqlite');

// Региональные настройки (Кыргызстан)
export const DEFAULT_COUNTRY = process.env.DEFAULT_COUNTRY || 'Кыргызстан';
export const DEFAULT_COUNTRY_CODE = process.env.DEFAULT_COUNTRY_CODE || 'KG';
export const DEFAULT_TIMEZONE = process.env.DEFAULT_TIMEZONE || 'Asia/Bishkek';
export const DEFAULT_CITY = process.env.DEFAULT_CITY || 'Бишкек';
export const DEFAULT_LATITUDE = parseFloat(process.env.DEFAULT_LATITUDE || '42.8746');
export const DEFAULT_LONGITUDE = parseFloat(process.env.DEFAULT_LONGITUDE || '74.5698');

// Источники метеоданных
export const WEATHER_PROVIDER = process.env.WEATHER_PROVIDER || 'open-meteo';
export const WEATHER_API_URL = process.env.WEATHER_API_URL || 'https://api.open-meteo.com/v1/forecast';
export const GEOCODING_API_URL = process.env.GEOCODING_API_URL || 'https://geocoding-api.open-meteo.com/v1/search';
export const AIR_QUALITY_API_URL = process.env.AIR_QUALITY_API_URL || 'https://air-quality-api.open-meteo.com/v1/air-quality';
export const KYRGYZHYDROMET_URL = process.env.KYRGYZHYDROMET_URL || 'https://meteo.kg';

// Безопасность и лимиты
export const RATE_LIMIT_USER_RPM = Number(process.env.RATE_LIMIT_USER_RPM) || 30;

export function isTokenConfigured(): boolean {
  return Boolean(BOT_TOKEN && BOT_TOKEN !== 'YOUR_TELEGRAM_BOT_TOKEN_HERE');
}

/**
 * Безопасное маскирование токена для логов (показывает только префикс и 4 последних символа)
 */
export function maskToken(token: string): string {
  if (!token || token.length < 10) return '***';
  const prefix = token.slice(0, 6);
  const suffix = token.slice(-4);
  return `${prefix}...${suffix}`;
}

export function createBot(): TelegramBot {
  if (!isTokenConfigured()) {
    console.warn('\n⚠️ [MeteoBot] Внимание: переменная BOT_TOKEN не заполнена в .env файле!');
    console.warn('👉 Откройте файл /home/belli/meteobot/.env и вставьте токен от @BotFather.\n');
  }

  return new TelegramBot(BOT_TOKEN || 'dummy_token', { polling: { autoStart: false } });
}

export const bot = createBot();

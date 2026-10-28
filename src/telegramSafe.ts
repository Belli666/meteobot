import TelegramBot from 'node-telegram-bot-api';

/**
 * Безопасное экранирование спецсимволов HTML для Telegram Bot API
 */
export function escapeHtml(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Очистка HTML тегов для аварийной отправки чистым текстом
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Безопасная отправка сообщения:
 * 1. Пробует отправить с форматированием HTML
 * 2. Если Telegram вернул ошибку парсинга — пробует отправить чистым текстом
 * 3. Перехватывает исключения, чтобы бот никогда не падал в silence
 */
export async function safeSendMessage(
  bot: TelegramBot,
  chatId: number | string,
  htmlText: string,
  options?: TelegramBot.SendMessageOptions
): Promise<TelegramBot.Message | null> {
  try {
    return await bot.sendMessage(chatId, htmlText, {
      parse_mode: 'HTML',
      ...options,
    });
  } catch (err: any) {
    const desc = err?.response?.body?.description || err?.message || String(err);
    console.warn(`⚠️ [safeSendMessage] Ошибка отправки HTML (${desc}). Отправка без разметки...`);
    try {
      const fallbackOptions = { ...options };
      delete fallbackOptions.parse_mode;
      return await bot.sendMessage(chatId, stripHtml(htmlText), fallbackOptions);
    } catch (fallbackErr: any) {
      console.error(`❌ [safeSendMessage] Не удалось отправить сообщение:`, fallbackErr?.message || fallbackErr);
      return null;
    }
  }
}

/**
 * Безопасное редактирование сообщения
 */
export async function safeEditMessageText(
  bot: TelegramBot,
  htmlText: string,
  options: TelegramBot.EditMessageTextOptions
): Promise<TelegramBot.Message | boolean | null> {
  try {
    return await bot.editMessageText(htmlText, {
      parse_mode: 'HTML',
      ...options,
    });
  } catch (err: any) {
    const desc = err?.response?.body?.description || err?.message || String(err);
    if (desc.includes('message is not modified')) {
      return true; // Не является ошибкой
    }
    console.warn(`⚠️ [safeEditMessageText] Ошибка редактирования HTML (${desc}). Отправка без разметки...`);
    try {
      const fallbackOptions = { ...options };
      delete fallbackOptions.parse_mode;
      return await bot.editMessageText(stripHtml(htmlText), fallbackOptions);
    } catch (fallbackErr: any) {
      console.error(`❌ [safeEditMessageText] Не удалось отредактировать сообщение:`, fallbackErr?.message || fallbackErr);
      return null;
    }
  }
}

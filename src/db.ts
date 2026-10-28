import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { DATABASE_PATH, DEFAULT_TIMEZONE } from './config';

export interface UserRecord {
  id: number;
  username: string | null;
  first_name: string;
  city_name: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  notify_enabled: number;
  notify_time: string;
  alert_rain: number;
  alert_storm: number;
  created_at?: string;
  updated_at?: string;
}

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  const dir = path.dirname(DATABASE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  dbInstance = new DatabaseSync(DATABASE_PATH);
  initSchema(dbInstance);
  return dbInstance;
}

function initSchema(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT,
      first_name TEXT,
      city_name TEXT,
      latitude REAL,
      longitude REAL,
      timezone TEXT DEFAULT 'Europe/Moscow',
      notify_enabled INTEGER DEFAULT 1,
      notify_time TEXT DEFAULT '07:30',
      alert_rain INTEGER DEFAULT 1,
      alert_storm INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_users_notify ON users(notify_enabled, notify_time);
  `);
}

export function getUser(telegramId: number): UserRecord | null {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const row = stmt.get(telegramId) as UserRecord | undefined;
  return row || null;
}

export function registerOrUpdateUser(
  telegramId: number,
  firstName: string,
  username?: string | null
): UserRecord {
  const db = getDb();
  const existing = getUser(telegramId);

  if (!existing) {
    const stmt = db.prepare(`
      INSERT INTO users (id, first_name, username, timezone, notify_enabled, notify_time, alert_rain, alert_storm)
      VALUES (?, ?, ?, ?, 1, '07:30', 1, 1)
    `);
    stmt.run(telegramId, firstName, username || null, DEFAULT_TIMEZONE);
    return getUser(telegramId)!;
  }

  // Обновляем имя/юзернейм при наличии изменений
  const stmt = db.prepare(`
    UPDATE users 
    SET first_name = ?, username = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(firstName, username || null, telegramId);
  return getUser(telegramId)!;
}

export function setUserLocation(
  telegramId: number,
  cityName: string,
  latitude: number,
  longitude: number,
  timezone: string = DEFAULT_TIMEZONE
): void {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE users 
    SET city_name = ?, latitude = ?, longitude = ?, timezone = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(cityName, latitude, longitude, timezone, telegramId);
}

export function updateUserSettings(
  telegramId: number,
  settings: Partial<Pick<UserRecord, 'notify_enabled' | 'notify_time' | 'alert_rain' | 'alert_storm'>>
): void {
  const db = getDb();
  const current = getUser(telegramId);
  if (!current) return;

  const notify_enabled = settings.notify_enabled !== undefined ? settings.notify_enabled : current.notify_enabled;
  const notify_time = settings.notify_time !== undefined ? settings.notify_time : current.notify_time;
  const alert_rain = settings.alert_rain !== undefined ? settings.alert_rain : current.alert_rain;
  const alert_storm = settings.alert_storm !== undefined ? settings.alert_storm : current.alert_storm;

  const stmt = db.prepare(`
    UPDATE users 
    SET notify_enabled = ?, notify_time = ?, alert_rain = ?, alert_storm = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(notify_enabled, notify_time, alert_rain, alert_storm, telegramId);
}

export function getUsersForNotification(timeHHMM: string): UserRecord[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT * FROM users 
    WHERE notify_enabled = 1 
      AND notify_time = ? 
      AND latitude IS NOT NULL 
      AND longitude IS NOT NULL
  `);
  return stmt.all(timeHHMM) as unknown as UserRecord[];
}

export function getAllActiveUsers(): UserRecord[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM users WHERE latitude IS NOT NULL AND longitude IS NOT NULL');
  return stmt.all() as unknown as UserRecord[];
}

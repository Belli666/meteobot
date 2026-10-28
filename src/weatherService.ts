import {
  WEATHER_API_URL,
  GEOCODING_API_URL,
  DEFAULT_TIMEZONE,
  DEFAULT_COUNTRY_CODE,
} from './config';
import { findLocalKyrgyzPlace } from './kyrgyzstanData';

import { Language, normalizeLang, WEATHER_CODE_TRANSLATIONS } from './i18n';

export interface GeocodeLocation {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  countryCode?: string;
  admin1?: string;
  timezone?: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  pressureMmHg: number;
  windSpeed: number;
  windGusts: number;
  windDirection: number;
  precipitation: number;
  weatherCode: number;
  weatherDescription: string;
  weatherEmoji: string;
  isDay: boolean;
  time: string;
}

export interface HourlyForecastItem {
  time: string;
  temperature: number;
  apparentTemperature: number;
  precipitationProbability: number;
  precipitation: number;
  weatherCode: number;
  weatherEmoji: string;
  uvIndex: number;
}

export interface DailyForecastItem {
  date: string;
  tempMin: number;
  tempMax: number;
  apparentMax: number;
  apparentMin: number;
  weatherCode: number;
  weatherDescription: string;
  weatherEmoji: string;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  cityName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  fetchTimestamp: string;
  current: CurrentWeather;
  hourlyNext12h: HourlyForecastItem[];
  daily7Days: DailyForecastItem[];
  providerSource: string;
}

export function getWeatherDescription(
  code: number,
  lang: Language = 'ru',
  isDay: boolean = true
): { description: string; emoji: string } {
  const normalized = normalizeLang(lang);
  const table = WEATHER_CODE_TRANSLATIONS[normalized] || WEATHER_CODE_TRANSLATIONS.ru;
  const meta = table[code] || {
    description: normalized === 'ky' ? 'Булуттуу' : normalized === 'en' ? 'Cloudy' : 'Облачно',
    emoji: isDay ? '🌤️' : '☁️',
  };

  let emoji = meta.emoji;
  if (!isDay) {
    if (code === 0) emoji = '🌙';
    else if (code === 1) emoji = '🌙☁️';
    else if (code === 2) emoji = '☁️';
  }

  return { description: meta.description, emoji };
}

/**
 * Поиск населенных пунктов строго в Кыргызстане (KG)
 */
export async function searchCities(query: string, lang: Language = 'ru'): Promise<GeocodeLocation[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  // 1. Сначала проверяем локальную базу городов и районов Кыргызстана
  const localMatch = findLocalKyrgyzPlace(trimmed, lang);
  if (localMatch) {
    return [
      {
        name: localMatch.displayName,
        latitude: localMatch.place.latitude,
        longitude: localMatch.place.longitude,
        country: 'Кыргызстан',
        countryCode: 'KG',
        admin1: localMatch.displayRegion,
        timezone: localMatch.place.timezone,
      },
    ];
  }

  // 2. Ищем через онлайн геокодер и СТРОГО фильтруем только Кыргызстан (KG)
  try {
    const url = `${GEOCODING_API_URL}?name=${encodeURIComponent(trimmed)}&count=20&language=ru&format=json`;
    const res = await fetch(url);
    if (!res.ok) {
      return [];
    }

    const data = (await res.json()) as { results?: Array<any> };
    if (!data.results || !data.results.length) {
      return [];
    }

    // Жесткая фильтрация: только Кыргызстан
    const kgOnly = data.results.filter((item) => {
      const code = (item.country_code || '').toUpperCase();
      const country = (item.country || '').toLowerCase();
      return code === 'KG' || country.includes('кыргыз') || country.includes('kyrgyz');
    });

    return kgOnly.map((item) => ({
      name: item.name,
      latitude: item.latitude,
      longitude: item.longitude,
      country: 'Кыргызстан',
      countryCode: 'KG',
      admin1: item.admin1 || 'Кыргызстан',
      timezone: item.timezone || DEFAULT_TIMEZONE,
    }));
  } catch (err) {
    console.error('Ошибка геокодирования:', err);
    return [];
  }
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ru`;
    const res = await fetch(url);
    if (res.ok) {
      const data = (await res.json()) as any;
      const city = data.city || data.locality || data.principalSubdivision;
      if (city) {
        const country = data.countryName ? `, ${data.countryName}` : '';
        return `${city}${country}`;
      }
    }
  } catch {
    // Резервный формат при отсутствии ответа
  }
  return `Геолокация (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`;
}

export async function fetchWeatherData(
  cityName: string,
  latitude: number,
  longitude: number,
  timezone: string = DEFAULT_TIMEZONE,
  lang: Language = 'ru'
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'rain',
      'showers',
      'snowfall',
      'weather_code',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'apparent_temperature',
      'uv_index',
      'is_day',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
    ].join(','),
    timezone: timezone || DEFAULT_TIMEZONE,
    forecast_days: '7',
  });

  const url = `${WEATHER_API_URL}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Ошибка прогноза Open-Meteo: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as any;
  const cur = data.current;
  const isCurDay = Boolean(cur.is_day);
  const curMeta = getWeatherDescription(cur.weather_code, lang, isCurDay);
  const pressureMmHg = Math.round(cur.surface_pressure * 0.750062);

  const current: CurrentWeather = {
    temperature: Math.round(cur.temperature_2m),
    apparentTemperature: Math.round(cur.apparent_temperature),
    humidity: cur.relative_humidity_2m,
    pressureMmHg,
    windSpeed: Math.round(cur.wind_speed_10m * 10) / 10,
    windGusts: Math.round(cur.wind_gusts_10m * 10) / 10,
    windDirection: cur.wind_direction_10m,
    precipitation: cur.precipitation,
    weatherCode: cur.weather_code,
    weatherDescription: curMeta.description,
    weatherEmoji: curMeta.emoji,
    isDay: isCurDay,
    time: cur.time,
  };

  const hourlyNext12h: HourlyForecastItem[] = [];
  const hourly = data.hourly;
  if (hourly && hourly.time) {
    const nowTimeStr = cur.time;
    let startIndex = hourly.time.findIndex((t: string) => t >= nowTimeStr);
    if (startIndex === -1) startIndex = 0;

    for (let i = startIndex; i < Math.min(startIndex + 12, hourly.time.length); i++) {
      const isDayHour = hourly.is_day ? Boolean(hourly.is_day[i]) : true;
      const hMeta = getWeatherDescription(hourly.weather_code[i], lang, isDayHour);
      hourlyNext12h.push({
        time: hourly.time[i].slice(11, 16),
        temperature: Math.round(hourly.temperature_2m[i]),
        apparentTemperature: Math.round(hourly.apparent_temperature[i]),
        precipitationProbability: hourly.precipitation_probability[i] || 0,
        precipitation: hourly.precipitation[i] || 0,
        weatherCode: hourly.weather_code[i],
        weatherEmoji: hMeta.emoji,
        uvIndex: hourly.uv_index ? hourly.uv_index[i] : 0,
      });
    }
  }

  const daily7Days: DailyForecastItem[] = [];
  const daily = data.daily;
  if (daily && daily.time) {
    for (let i = 0; i < daily.time.length; i++) {
      const dMeta = getWeatherDescription(daily.weather_code[i], lang, true);
      daily7Days.push({
        date: daily.time[i],
        tempMin: Math.round(daily.temperature_2m_min[i]),
        tempMax: Math.round(daily.temperature_2m_max[i]),
        apparentMin: Math.round(daily.apparent_temperature_min[i]),
        apparentMax: Math.round(daily.apparent_temperature_max[i]),
        weatherCode: daily.weather_code[i],
        weatherDescription: dMeta.description,
        weatherEmoji: dMeta.emoji,
        precipitationSum: Math.round(daily.precipitation_sum[i] * 10) / 10,
        precipitationProbabilityMax: daily.precipitation_probability_max[i] || 0,
        windSpeedMax: Math.round(daily.wind_speed_10m_max[i]),
        uvIndexMax: Math.round(daily.uv_index_max[i] || 0),
        sunrise: daily.sunrise[i].slice(11, 16),
        sunset: daily.sunset[i].slice(11, 16),
      });
    }
  }

  let fetchTimestamp = '';
  try {
    fetchTimestamp = new Intl.DateTimeFormat('ru-RU', {
      timeZone: data.timezone || timezone || DEFAULT_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());
  } catch {
    const d = new Date();
    fetchTimestamp = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  return {
    cityName,
    latitude,
    longitude,
    timezone: data.timezone || timezone,
    fetchTimestamp,
    current,
    hourlyNext12h,
    daily7Days,
    providerSource: 'Open-Meteo & Kyrgyzgidromet (meteo.kg)',
  };
}

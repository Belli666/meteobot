import {
  WEATHER_API_URL,
  GEOCODING_API_URL,
  DEFAULT_TIMEZONE,
  DEFAULT_COUNTRY_CODE,
} from './config';

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
  current: CurrentWeather;
  hourlyNext12h: HourlyForecastItem[];
  daily7Days: DailyForecastItem[];
  providerSource: string;
}

export function getWeatherDescription(code: number): { description: string; emoji: string } {
  switch (code) {
    case 0:
      return { description: 'Ясно', emoji: '☀️' };
    case 1:
      return { description: 'В основном ясно', emoji: '🌤️' };
    case 2:
      return { description: 'Переменная облачность', emoji: '⛅' };
    case 3:
      return { description: 'Пасмурно', emoji: '☁️' };
    case 45:
    case 48:
      return { description: 'Туман', emoji: '🌫️' };
    case 51:
      return { description: 'Легкая морось', emoji: '🌦️' };
    case 53:
      return { description: 'Морось', emoji: '🌦️' };
    case 55:
      return { description: 'Густая морось', emoji: '🌧️' };
    case 56:
    case 57:
      return { description: 'Ледяная морось', emoji: '🌧️' };
    case 61:
      return { description: 'Слабый дождь', emoji: '🌧️' };
    case 63:
      return { description: 'Умеренный дождь', emoji: '🌧️' };
    case 65:
      return { description: 'Сильный дождь', emoji: '🌧️' };
    case 66:
    case 67:
      return { description: 'Ледяной дождь', emoji: '🌨️' };
    case 71:
      return { description: 'Слабый снегопад', emoji: '🌨️' };
    case 73:
      return { description: 'Умеренный снегопад', emoji: '❄️' };
    case 75:
      return { description: 'Сильный снегопад', emoji: '❄️' };
    case 77:
      return { description: 'Снежная крупа', emoji: '❄️' };
    case 80:
      return { description: 'Кратковременный дождь', emoji: '🌦️' };
    case 81:
      return { description: 'Ливневый дождь', emoji: '🌧️' };
    case 82:
      return { description: 'Шквальный ливень', emoji: '⛈️' };
    case 85:
    case 86:
      return { description: 'Снегопад зарядами', emoji: '🌨️' };
    case 95:
      return { description: 'Гроза', emoji: '⚡' };
    case 96:
    case 99:
      return { description: 'Гроза с градом', emoji: '⛈️' };
    default:
      return { description: 'Облачно', emoji: '🌤️' };
  }
}

/**
 * Поиск населенных пунктов с приоритетом для Кыргызстана (KG)
 */
export async function searchCities(query: string): Promise<GeocodeLocation[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  // 1. Сначала ищем с фильтром по Кыргызстану (country_code=KG)
  try {
    const kgUrl = `${GEOCODING_API_URL}?name=${encodeURIComponent(trimmed)}&count=5&language=ru&format=json&country_code=${DEFAULT_COUNTRY_CODE}`;
    const kgRes = await fetch(kgUrl);
    if (kgRes.ok) {
      const kgData = (await kgRes.json()) as { results?: Array<any> };
      if (kgData.results && kgData.results.length > 0) {
        return kgData.results.map((item) => ({
          name: item.name,
          latitude: item.latitude,
          longitude: item.longitude,
          country: item.country || 'Кыргызстан',
          countryCode: item.country_code || 'KG',
          admin1: item.admin1,
          timezone: item.timezone || DEFAULT_TIMEZONE,
        }));
      }
    }
  } catch {
    // В случае сбоя переходим к общему поиску
  }

  // 2. Если в Кыргызстане точного совпадения нет — ищем шире, но сортируем KG наверх
  const generalUrl = `${GEOCODING_API_URL}?name=${encodeURIComponent(trimmed)}&count=6&language=ru&format=json`;
  const res = await fetch(generalUrl);
  if (!res.ok) {
    throw new Error(`Ошибка геокодирования: ${res.status}`);
  }

  const data = (await res.json()) as { results?: Array<any> };
  if (!data.results || !data.results.length) {
    return [];
  }

  // Сортируем так, чтобы Кыргызстан всегда был в начале списка
  const sorted = data.results.sort((a, b) => {
    const aIsKg = (a.country_code || '').toUpperCase() === DEFAULT_COUNTRY_CODE ? 1 : 0;
    const bIsKg = (b.country_code || '').toUpperCase() === DEFAULT_COUNTRY_CODE ? 1 : 0;
    return bIsKg - aIsKg;
  });

  return sorted.map((item) => ({
    name: item.name,
    latitude: item.latitude,
    longitude: item.longitude,
    country: item.country,
    countryCode: item.country_code,
    admin1: item.admin1,
    timezone: item.timezone || DEFAULT_TIMEZONE,
  }));
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
  timezone: string = DEFAULT_TIMEZONE
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
  const curMeta = getWeatherDescription(cur.weather_code);
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
    isDay: Boolean(cur.is_day),
    time: cur.time,
  };

  const hourlyNext12h: HourlyForecastItem[] = [];
  const hourly = data.hourly;
  if (hourly && hourly.time) {
    const nowTimeStr = cur.time;
    let startIndex = hourly.time.findIndex((t: string) => t >= nowTimeStr);
    if (startIndex === -1) startIndex = 0;

    for (let i = startIndex; i < Math.min(startIndex + 12, hourly.time.length); i++) {
      const hMeta = getWeatherDescription(hourly.weather_code[i]);
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
      const dMeta = getWeatherDescription(daily.weather_code[i]);
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

  return {
    cityName,
    latitude,
    longitude,
    timezone: data.timezone || timezone,
    current,
    hourlyNext12h,
    daily7Days,
    providerSource: 'Open-Meteo & Kyrgyzgidromet (meteo.kg)',
  };
}

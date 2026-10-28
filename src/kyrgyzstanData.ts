export interface KyrgyzPlace {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface KyrgyzRegion {
  id: string;
  name: string;
  emoji: string;
  centerPlace: KyrgyzPlace;
  places: KyrgyzPlace[];
}

export const KYRGYZ_REGIONS: KyrgyzRegion[] = [
  {
    id: 'bishkek',
    name: 'г. Бишкек',
    emoji: '🏛️',
    centerPlace: {
      id: 'bishkek_main',
      name: 'Бишкек',
      region: 'г. Бишкек',
      latitude: 42.8746,
      longitude: 74.5698,
      timezone: 'Asia/Bishkek',
    },
    places: [
      { id: 'bishkek_main', name: 'Бишкек', region: 'г. Бишкек', latitude: 42.8746, longitude: 74.5698, timezone: 'Asia/Bishkek' },
    ],
  },
  {
    id: 'osh_city',
    name: 'г. Ош',
    emoji: '⛰️',
    centerPlace: {
      id: 'osh_city_main',
      name: 'г. Ош',
      region: 'г. Ош',
      latitude: 40.5140,
      longitude: 72.8161,
      timezone: 'Asia/Bishkek',
    },
    places: [
      { id: 'osh_city_main', name: 'г. Ош', region: 'г. Ош', latitude: 40.5140, longitude: 72.8161, timezone: 'Asia/Bishkek' },
    ],
  },
  {
    id: 'chuy',
    name: 'Чуйская область',
    emoji: '🌾',
    centerPlace: {
      id: 'chuy_tokmok',
      name: 'Токмок',
      region: 'Чуйская область',
      latitude: 42.8419,
      longitude: 75.3015,
      timezone: 'Asia/Bishkek',
    },
    places: [
      { id: 'chuy_tokmok', name: 'Токмок', region: 'Чуйская область', latitude: 42.8419, longitude: 75.3015, timezone: 'Asia/Bishkek' },
      { id: 'chuy_karabalta', name: 'Кара-Балта', region: 'Чуйская область', latitude: 42.8144, longitude: 73.8478, timezone: 'Asia/Bishkek' },
      { id: 'chuy_kant', name: 'Кант', region: 'Чуйская область', latitude: 42.8908, longitude: 74.8508, timezone: 'Asia/Bishkek' },
      { id: 'chuy_sokuluk', name: 'Сокулук', region: 'Чуйская область', latitude: 42.8631, longitude: 74.2964, timezone: 'Asia/Bishkek' },
      { id: 'chuy_belovod', name: 'Беловодское', region: 'Чуйская область', latitude: 42.8300, longitude: 74.1100, timezone: 'Asia/Bishkek' },
      { id: 'chuy_kemin', name: 'Кемин', region: 'Чуйская область', latitude: 42.7844, longitude: 75.6942, timezone: 'Asia/Bishkek' },
    ],
  },
  {
    id: 'issyk_kul',
    name: 'Иссык-Кульская область',
    emoji: '🌊',
    centerPlace: {
      id: 'ik_karakol',
      name: 'Каракол',
      region: 'Иссык-Кульская область',
      latitude: 42.4907,
      longitude: 78.3936,
      timezone: 'Asia/Bishkek',
    },
    places: [
      { id: 'ik_karakol', name: 'Каракол', region: 'Иссык-Кульская область', latitude: 42.4907, longitude: 78.3936, timezone: 'Asia/Bishkek' },
      { id: 'ik_cholponata', name: 'Чолпон-Ата', region: 'Иссык-Кульская область', latitude: 42.6486, longitude: 77.0818, timezone: 'Asia/Bishkek' },
      { id: 'ik_balykchy', name: 'Балыкчы', region: 'Иссык-Кульская область', latitude: 42.4602, longitude: 76.1870, timezone: 'Asia/Bishkek' },
      { id: 'ik_bosteri', name: 'Бостери', region: 'Иссык-Кульская область', latitude: 42.6500, longitude: 77.1800, timezone: 'Asia/Bishkek' },
      { id: 'ik_tyup', name: 'Тюп', region: 'Иссык-Кульская область', latitude: 42.7300, longitude: 78.3600, timezone: 'Asia/Bishkek' },
      { id: 'ik_kyzylsuu', name: 'Кызыл-Суу', region: 'Иссык-Кульская область', latitude: 42.3400, longitude: 78.0100, timezone: 'Asia/Bishkek' },
    ],
  },
  {
    id: 'osh_oblast',
    name: 'Ошская область',
    emoji: '🏔️',
    centerPlace: {
      id: 'osh_uzgen',
      name: 'Узген',
      region: 'Ошская область',
      latitude: 40.7699,
      longitude: 73.3007,
      timezone: 'Asia/Bishkek',
    },
    places: [
      { id: 'osh_uzgen', name: 'Узген', region: 'Ошская область', latitude: 40.7699, longitude: 73.3007, timezone: 'Asia/Bishkek' },
      { id: 'osh_karasuu', name: 'Кара-Суу', region: 'Ошская область', latitude: 40.7047, longitude: 72.8667, timezone: 'Asia/Bishkek' },
      { id: 'osh_nookat', name: 'Ноокат', region: 'Ошская область', latitude: 40.2667, longitude: 72.6167, timezone: 'Asia/Bishkek' },
      { id: 'osh_aravan', name: 'Араван', region: 'Ошская область', latitude: 40.5100, longitude: 72.5000, timezone: 'Asia/Bishkek' },
      { id: 'osh_gulcha', name: 'Гульча', region: 'Ошская область', latitude: 40.3200, longitude: 73.4300, timezone: 'Asia/Bishkek' },
    ],
  },
  {
    id: 'jalal_abad',
    name: 'Джалал-Абадская область',
    emoji: '🌿',
    centerPlace: {
      id: 'ja_city',
      name: 'Джалал-Абад',
      region: 'Джалал-Абадская область',
      latitude: 40.9333,
      longitude: 72.9833,
      timezone: 'Asia/Bishkek',
    },
    places: [
      { id: 'ja_city', name: 'Джалал-Абад', region: 'Джалал-Абадская область', latitude: 40.9333, longitude: 72.9833, timezone: 'Asia/Bishkek' },
      { id: 'ja_toktogul', name: 'Токтогул', region: 'Джалал-Абадская область', latitude: 41.8708, longitude: 72.9406, timezone: 'Asia/Bishkek' },
      { id: 'ja_tashkumyr', name: 'Таш-Кумыр', region: 'Джалал-Абадская область', latitude: 41.3472, longitude: 72.2172, timezone: 'Asia/Bishkek' },
      { id: 'ja_bazarkorgon', name: 'Базар-Коргон', region: 'Джалал-Абадская область', latitude: 41.0378, longitude: 72.7486, timezone: 'Asia/Bishkek' },
      { id: 'ja_kochkorata', name: 'Кочкор-Ата', region: 'Джалал-Абадская область', latitude: 41.0350, longitude: 72.4850, timezone: 'Asia/Bishkek' },
      { id: 'ja_mayluusuu', name: 'Майлуу-Суу', region: 'Джалал-Абадская область', latitude: 41.2961, longitude: 72.4547, timezone: 'Asia/Bishkek' },
    ],
  },
  {
    id: 'naryn',
    name: 'Нарынская область',
    emoji: '⛰️',
    centerPlace: {
      id: 'naryn_city',
      name: 'Нарын',
      region: 'Нарынская область',
      latitude: 41.4287,
      longitude: 75.9911,
      timezone: 'Asia/Bishkek',
    },
    places: [
      { id: 'naryn_city', name: 'Нарын', region: 'Нарынская область', latitude: 41.4287, longitude: 75.9911, timezone: 'Asia/Bishkek' },
      { id: 'naryn_kochkor', name: 'Кочкор', region: 'Нарынская область', latitude: 42.2156, longitude: 75.7600, timezone: 'Asia/Bishkek' },
      { id: 'naryn_atbashy', name: 'Ат-Башы', region: 'Нарынская область', latitude: 41.1719, longitude: 75.8081, timezone: 'Asia/Bishkek' },
      { id: 'naryn_chaek', name: 'Чаек', region: 'Нарынская область', latitude: 41.9200, longitude: 74.6000, timezone: 'Asia/Bishkek' },
    ],
  },
  {
    id: 'talas',
    name: 'Таласская область',
    emoji: '🌾',
    centerPlace: {
      id: 'talas_city',
      name: 'Талас',
      region: 'Таласская область',
      latitude: 42.5228,
      longitude: 72.2425,
      timezone: 'Asia/Bishkek',
    },
    places: [
      { id: 'talas_city', name: 'Талас', region: 'Таласская область', latitude: 42.5228, longitude: 72.2425, timezone: 'Asia/Bishkek' },
      { id: 'talas_bakayata', name: 'Бакай-Ата', region: 'Таласская область', latitude: 42.4950, longitude: 71.9360, timezone: 'Asia/Bishkek' },
      { id: 'talas_kyzyladyr', name: 'Кызыл-Адыр', region: 'Таласская область', latitude: 42.6100, longitude: 71.6000, timezone: 'Asia/Bishkek' },
    ],
  },
  {
    id: 'batken',
    name: 'Баткенская область',
    emoji: '🏜️',
    centerPlace: {
      id: 'batken_city',
      name: 'Баткен',
      region: 'Баткенская область',
      latitude: 40.0553,
      longitude: 70.8194,
      timezone: 'Asia/Bishkek',
    },
    places: [
      { id: 'batken_city', name: 'Баткен', region: 'Баткенская область', latitude: 40.0553, longitude: 70.8194, timezone: 'Asia/Bishkek' },
      { id: 'batken_kyzylkiya', name: 'Кызыл-Кия', region: 'Баткенская область', latitude: 40.2570, longitude: 72.1278, timezone: 'Asia/Bishkek' },
      { id: 'batken_sulyukta', name: 'Сулюкта', region: 'Баткенская область', latitude: 39.9381, longitude: 69.5700, timezone: 'Asia/Bishkek' },
      { id: 'batken_razzakov', name: 'Раззаков (Исфана)', region: 'Баткенская область', latitude: 39.8406, longitude: 69.5319, timezone: 'Asia/Bishkek' },
      { id: 'batken_kadamjay', name: 'Кадамжай', region: 'Баткенская область', latitude: 40.1300, longitude: 71.7400, timezone: 'Asia/Bishkek' },
    ],
  },
];

// Быстрый плоский список всех мест КР для мгновенного локального поиска
export const ALL_KYRGYZ_PLACES: KyrgyzPlace[] = KYRGYZ_REGIONS.flatMap((r) => r.places);

export function findLocalKyrgyzPlace(query: string): KyrgyzPlace | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  // Точное совпадение
  const exact = ALL_KYRGYZ_PLACES.find(
    (p) => p.name.toLowerCase() === q || p.name.toLowerCase().includes(q)
  );
  if (exact) return exact;

  // Проверка по названию региона
  const regionMatch = KYRGYZ_REGIONS.find((r) => r.name.toLowerCase().includes(q));
  if (regionMatch) return regionMatch.centerPlace;

  return null;
}

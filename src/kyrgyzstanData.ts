import { Language } from './i18n';

export interface KyrgyzPlace {
  id: string;
  name: Record<Language, string>;
  region: Record<Language, string>;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface KyrgyzRegion {
  id: string;
  name: Record<Language, string>;
  emoji: string;
  centerPlace: KyrgyzPlace;
  places: KyrgyzPlace[];
}

export const KYRGYZ_REGIONS: KyrgyzRegion[] = [
  {
    id: 'bishkek',
    name: { ky: 'Бишкек шаары', ru: 'г. Бишкек', en: 'Bishkek City' },
    emoji: '🏛️',
    centerPlace: {
      id: 'bishkek_main',
      name: { ky: 'Бишкек', ru: 'Бишкек', en: 'Bishkek' },
      region: { ky: 'Бишкек шаары', ru: 'г. Бишкек', en: 'Bishkek City' },
      latitude: 42.8746,
      longitude: 74.5698,
      timezone: 'Asia/Bishkek',
    },
    places: [
      {
        id: 'bishkek_main',
        name: { ky: 'Бишкек', ru: 'Бишкек', en: 'Bishkek' },
        region: { ky: 'Бишкек шаары', ru: 'г. Бишкек', en: 'Bishkek City' },
        latitude: 42.8746,
        longitude: 74.5698,
        timezone: 'Asia/Bishkek',
      },
    ],
  },
  {
    id: 'osh_city',
    name: { ky: 'Ош шаары', ru: 'г. Ош', en: 'Osh City' },
    emoji: '⛰️',
    centerPlace: {
      id: 'osh_city_main',
      name: { ky: 'Ош', ru: 'г. Ош', en: 'Osh' },
      region: { ky: 'Ош шаары', ru: 'г. Ош', en: 'Osh City' },
      latitude: 40.5140,
      longitude: 72.8161,
      timezone: 'Asia/Bishkek',
    },
    places: [
      {
        id: 'osh_city_main',
        name: { ky: 'Ош', ru: 'г. Ош', en: 'Osh' },
        region: { ky: 'Ош шаары', ru: 'г. Ош', en: 'Osh City' },
        latitude: 40.5140,
        longitude: 72.8161,
        timezone: 'Asia/Bishkek',
      },
    ],
  },
  {
    id: 'chuy',
    name: { ky: 'Чүй облусу', ru: 'Чуйская область', en: 'Chuy Region' },
    emoji: '🌾',
    centerPlace: {
      id: 'chuy_tokmok',
      name: { ky: 'Токмок', ru: 'Токмок', en: 'Tokmok' },
      region: { ky: 'Чүй облусу', ru: 'Чуйская область', en: 'Chuy Region' },
      latitude: 42.8419,
      longitude: 75.3015,
      timezone: 'Asia/Bishkek',
    },
    places: [
      { id: 'chuy_tokmok', name: { ky: 'Токмок', ru: 'Токмок', en: 'Tokmok' }, region: { ky: 'Чүй облусу', ru: 'Чуйская область', en: 'Chuy Region' }, latitude: 42.8419, longitude: 75.3015, timezone: 'Asia/Bishkek' },
      { id: 'chuy_karabalta', name: { ky: 'Кара-Балта', ru: 'Кара-Балта', en: 'Kara-Balta' }, region: { ky: 'Чүй облусу', ru: 'Чуйская область', en: 'Chuy Region' }, latitude: 42.8144, longitude: 73.8478, timezone: 'Asia/Bishkek' },
      { id: 'chuy_kant', name: { ky: 'Кант', ru: 'Кант', en: 'Kant' }, region: { ky: 'Чүй облусу', ru: 'Чуйская область', en: 'Chuy Region' }, latitude: 42.8908, longitude: 74.8508, timezone: 'Asia/Bishkek' },
      { id: 'chuy_sokuluk', name: { ky: 'Сокулук', ru: 'Сокулук', en: 'Sokuluk' }, region: { ky: 'Чүй облусу', ru: 'Чуйская область', en: 'Chuy Region' }, latitude: 42.8631, longitude: 74.2964, timezone: 'Asia/Bishkek' },
      { id: 'chuy_belovod', name: { ky: 'Беловодское', ru: 'Беловодское', en: 'Belovodskoye' }, region: { ky: 'Чүй облусу', ru: 'Чуйская область', en: 'Chuy Region' }, latitude: 42.8300, longitude: 74.1100, timezone: 'Asia/Bishkek' },
      { id: 'chuy_kemin', name: { ky: 'Кемин', ru: 'Кемин', en: 'Kemin' }, region: { ky: 'Чүй облусу', ru: 'Чуйская область', en: 'Chuy Region' }, latitude: 42.7844, longitude: 75.6942, timezone: 'Asia/Bishkek' },
    ],
  },
  {
    id: 'issyk_kul',
    name: { ky: 'Ысык-Көл облусу', ru: 'Иссык-Кульская область', en: 'Issyk-Kul Region' },
    emoji: '🌊',
    centerPlace: {
      id: 'ik_karakol',
      name: { ky: 'Каракол', ru: 'Каракол', en: 'Karakol' },
      region: { ky: 'Ысык-Көл облусу', ru: 'Иссык-Кульская область', en: 'Issyk-Kul Region' },
      latitude: 42.4907,
      longitude: 78.3936,
      timezone: 'Asia/Bishkek',
    },
    places: [
      { id: 'ik_karakol', name: { ky: 'Каракол', ru: 'Каракол', en: 'Karakol' }, region: { ky: 'Ысык-Көл облусу', ru: 'Иссык-Кульская область', en: 'Issyk-Kul Region' }, latitude: 42.4907, longitude: 78.3936, timezone: 'Asia/Bishkek' },
      { id: 'ik_cholponata', name: { ky: 'Чолпон-Ата', ru: 'Чолпон-Ата', en: 'Cholpon-Ata' }, region: { ky: 'Ысык-Көл облусу', ru: 'Иссык-Кульская область', en: 'Issyk-Kul Region' }, latitude: 42.6486, longitude: 77.0818, timezone: 'Asia/Bishkek' },
      { id: 'ik_balykchy', name: { ky: 'Балыкчы', ru: 'Балыкчы', en: 'Balykchy' }, region: { ky: 'Ысык-Көл облусу', ru: 'Иссык-Кульская область', en: 'Issyk-Kul Region' }, latitude: 42.4602, longitude: 76.1870, timezone: 'Asia/Bishkek' },
      { id: 'ik_bosteri', name: { ky: 'Бостери', ru: 'Бостери', en: 'Bosteri' }, region: { ky: 'Ысык-Көл облусу', ru: 'Иссык-Кульская область', en: 'Issyk-Kul Region' }, latitude: 42.6500, longitude: 77.1800, timezone: 'Asia/Bishkek' },
      { id: 'ik_tyup', name: { ky: 'Түп', ru: 'Тюп', en: 'Tyup' }, region: { ky: 'Ысык-Көл облусу', ru: 'Иссык-Кульская область', en: 'Issyk-Kul Region' }, latitude: 42.7300, longitude: 78.3600, timezone: 'Asia/Bishkek' },
      { id: 'ik_kyzylsuu', name: { ky: 'Кызыл-Суу', ru: 'Кызыл-Суу', en: 'Kyzyl-Suu' }, region: { ky: 'Ысык-Көл облусу', ru: 'Иссык-Кульская область', en: 'Issyk-Kul Region' }, latitude: 42.3400, longitude: 78.0100, timezone: 'Asia/Bishkek' },
    ],
  },
  {
    id: 'osh_oblast',
    name: { ky: 'Ош облусу', ru: 'Ошская область', en: 'Osh Region' },
    emoji: '🏔️',
    centerPlace: {
      id: 'osh_uzgen',
      name: { ky: 'Өзгөн', ru: 'Узген', en: 'Uzgen' },
      region: { ky: 'Ош облусу', ru: 'Ошская область', en: 'Osh Region' },
      latitude: 40.7699,
      longitude: 73.3007,
      timezone: 'Asia/Bishkek',
    },
    places: [
      { id: 'osh_uzgen', name: { ky: 'Өзгөн', ru: 'Узген', en: 'Uzgen' }, region: { ky: 'Ош облусу', ru: 'Ошская область', en: 'Osh Region' }, latitude: 40.7699, longitude: 73.3007, timezone: 'Asia/Bishkek' },
      { id: 'osh_karasuu', name: { ky: 'Кара-Суу', ru: 'Кара-Суу', en: 'Kara-Suu' }, region: { ky: 'Ош облусу', ru: 'Ошская область', en: 'Osh Region' }, latitude: 40.7047, longitude: 72.8667, timezone: 'Asia/Bishkek' },
      { id: 'osh_nookat', name: { ky: 'Ноокат', ru: 'Ноокат', en: 'Nookat' }, region: { ky: 'Ош облусу', ru: 'Ошская область', en: 'Osh Region' }, latitude: 40.2667, longitude: 72.6167, timezone: 'Asia/Bishkek' },
      { id: 'osh_aravan', name: { ky: 'Араван', ru: 'Араван', en: 'Aravan' }, region: { ky: 'Ош облусу', ru: 'Ошская область', en: 'Osh Region' }, latitude: 40.5100, longitude: 72.5000, timezone: 'Asia/Bishkek' },
      { id: 'osh_gulcha', name: { ky: 'Гүлчө', ru: 'Гульча', en: 'Gulcha' }, region: { ky: 'Ош облусу', ru: 'Ошская область', en: 'Osh Region' }, latitude: 40.3200, longitude: 73.4300, timezone: 'Asia/Bishkek' },
    ],
  },
  {
    id: 'jalal_abad',
    name: { ky: 'Жалал-Абад облусу', ru: 'Джалал-Абадская область', en: 'Jalal-Abad Region' },
    emoji: '🌿',
    centerPlace: {
      id: 'ja_city',
      name: { ky: 'Жалал-Абад', ru: 'Джалал-Абад', en: 'Jalal-Abad' },
      region: { ky: 'Жалал-Абад облусу', ru: 'Джалал-Абадская область', en: 'Jalal-Abad Region' },
      latitude: 40.9333,
      longitude: 72.9833,
      timezone: 'Asia/Bishkek',
    },
    places: [
      { id: 'ja_city', name: { ky: 'Жалал-Абад', ru: 'Джалал-Абад', en: 'Jalal-Abad' }, region: { ky: 'Жалал-Абад облусу', ru: 'Джалал-Абадская область', en: 'Jalal-Abad Region' }, latitude: 40.9333, longitude: 72.9833, timezone: 'Asia/Bishkek' },
      { id: 'ja_toktogul', name: { ky: 'Токтогул', ru: 'Токтогул', en: 'Toktogul' }, region: { ky: 'Жалал-Абад облусу', ru: 'Джалал-Абадская область', en: 'Jalal-Abad Region' }, latitude: 41.8708, longitude: 72.9406, timezone: 'Asia/Bishkek' },
      { id: 'ja_tashkumyr', name: { ky: 'Таш-Көмүр', ru: 'Таш-Кумыр', en: 'Tash-Kumyr' }, region: { ky: 'Жалал-Абад облусу', ru: 'Джалал-Абадская область', en: 'Jalal-Abad Region' }, latitude: 41.3472, longitude: 72.2172, timezone: 'Asia/Bishkek' },
      { id: 'ja_bazarkorgon', name: { ky: 'Базар-Коргон', ru: 'Базар-Коргон', en: 'Bazar-Korgon' }, region: { ky: 'Жалал-Абад облусу', ru: 'Джалал-Абадская область', en: 'Jalal-Abad Region' }, latitude: 41.0378, longitude: 72.7486, timezone: 'Asia/Bishkek' },
      { id: 'ja_kochkorata', name: { ky: 'Кочкор-Ата', ru: 'Кочкор-Ата', en: 'Kochkor-Ata' }, region: { ky: 'Жалал-Абад облусу', ru: 'Джалал-Абадская область', en: 'Jalal-Abad Region' }, latitude: 41.0350, longitude: 72.4850, timezone: 'Asia/Bishkek' },
      { id: 'ja_mayluusuu', name: { ky: 'Майлуу-Суу', ru: 'Майлуу-Суу', en: 'Mailuu-Suu' }, region: { ky: 'Жалал-Абад облусу', ru: 'Джалал-Абадская область', en: 'Jalal-Abad Region' }, latitude: 41.2961, longitude: 72.4547, timezone: 'Asia/Bishkek' },
    ],
  },
  {
    id: 'naryn',
    name: { ky: 'Нарын облусу', ru: 'Нарынская область', en: 'Naryn Region' },
    emoji: '⛰️',
    centerPlace: {
      id: 'naryn_city',
      name: { ky: 'Нарын', ru: 'Нарын', en: 'Naryn' },
      region: { ky: 'Нарын облусу', ru: 'Нарынская область', en: 'Naryn Region' },
      latitude: 41.4287,
      longitude: 75.9911,
      timezone: 'Asia/Bishkek',
    },
    places: [
      { id: 'naryn_city', name: { ky: 'Нарын', ru: 'Нарын', en: 'Naryn' }, region: { ky: 'Нарын облусу', ru: 'Нарынская область', en: 'Naryn Region' }, latitude: 41.4287, longitude: 75.9911, timezone: 'Asia/Bishkek' },
      { id: 'naryn_kochkor', name: { ky: 'Кочкор', ru: 'Кочкор', en: 'Kochkor' }, region: { ky: 'Нарын облусу', ru: 'Нарынская область', en: 'Naryn Region' }, latitude: 42.2156, longitude: 75.7600, timezone: 'Asia/Bishkek' },
      { id: 'naryn_atbashy', name: { ky: 'Ат-Башы', ru: 'Ат-Башы', en: 'At-Bashy' }, region: { ky: 'Нарын облусу', ru: 'Нарынская область', en: 'Naryn Region' }, latitude: 41.1719, longitude: 75.8081, timezone: 'Asia/Bishkek' },
      { id: 'naryn_chaek', name: { ky: 'Чаек', ru: 'Чаек', en: 'Chaek' }, region: { ky: 'Нарын облусу', ru: 'Нарынская область', en: 'Naryn Region' }, latitude: 41.9200, longitude: 74.6000, timezone: 'Asia/Bishkek' },
    ],
  },
  {
    id: 'talas',
    name: { ky: 'Талас облусу', ru: 'Таласская область', en: 'Talas Region' },
    emoji: '🌾',
    centerPlace: {
      id: 'talas_city',
      name: { ky: 'Талас', ru: 'Талас', en: 'Talas' },
      region: { ky: 'Талас облусу', ru: 'Таласская область', en: 'Talas Region' },
      latitude: 42.5228,
      longitude: 72.2425,
      timezone: 'Asia/Bishkek',
    },
    places: [
      { id: 'talas_city', name: { ky: 'Талас', ru: 'Талас', en: 'Talas' }, region: { ky: 'Талас облусу', ru: 'Таласская область', en: 'Talas Region' }, latitude: 42.5228, longitude: 72.2425, timezone: 'Asia/Bishkek' },
      { id: 'talas_bakayata', name: { ky: 'Бакай-Ата', ru: 'Бакай-Ата', en: 'Bakai-Ata' }, region: { ky: 'Талас облусу', ru: 'Таласская область', en: 'Talas Region' }, latitude: 42.4950, longitude: 71.9360, timezone: 'Asia/Bishkek' },
      { id: 'talas_kyzyladyr', name: { ky: 'Кызыл-Адыр', ru: 'Кызыл-Адыр', en: 'Kyzyl-Adyr' }, region: { ky: 'Талас облусу', ru: 'Таласская область', en: 'Talas Region' }, latitude: 42.6100, longitude: 71.6000, timezone: 'Asia/Bishkek' },
    ],
  },
  {
    id: 'batken',
    name: { ky: 'Баткен облусу', ru: 'Баткенская область', en: 'Batken Region' },
    emoji: '🏜️',
    centerPlace: {
      id: 'batken_city',
      name: { ky: 'Баткен', ru: 'Баткен', en: 'Batken' },
      region: { ky: 'Баткен облусу', ru: 'Баткенская область', en: 'Batken Region' },
      latitude: 40.0553,
      longitude: 70.8194,
      timezone: 'Asia/Bishkek',
    },
    places: [
      { id: 'batken_city', name: { ky: 'Баткен', ru: 'Баткен', en: 'Batken' }, region: { ky: 'Баткен облусу', ru: 'Баткенская область', en: 'Batken Region' }, latitude: 40.0553, longitude: 70.8194, timezone: 'Asia/Bishkek' },
      { id: 'batken_kyzylkiya', name: { ky: 'Кызыл-Кыя', ru: 'Кызыл-Кия', en: 'Kyzyl-Kiya' }, region: { ky: 'Баткен облусу', ru: 'Баткенская область', en: 'Batken Region' }, latitude: 40.2570, longitude: 72.1278, timezone: 'Asia/Bishkek' },
      { id: 'batken_sulyukta', name: { ky: 'Сүлүктү', ru: 'Сулюкта', en: 'Sulyukta' }, region: { ky: 'Баткен облусу', ru: 'Баткенская область', en: 'Batken Region' }, latitude: 39.9381, longitude: 69.5700, timezone: 'Asia/Bishkek' },
      { id: 'batken_razzakov', name: { ky: 'Раззаков (Исфана)', ru: 'Раззаков (Исфана)', en: 'Razzakov (Isfana)' }, region: { ky: 'Баткен облусу', ru: 'Баткенская область', en: 'Batken Region' }, latitude: 39.8406, longitude: 69.5319, timezone: 'Asia/Bishkek' },
      { id: 'batken_kadamjay', name: { ky: 'Кадамжай', ru: 'Кадамжай', en: 'Kadamjay' }, region: { ky: 'Баткен облусу', ru: 'Баткенская область', en: 'Batken Region' }, latitude: 40.1300, longitude: 71.7400, timezone: 'Asia/Bishkek' },
    ],
  },
];

export const ALL_KYRGYZ_PLACES: KyrgyzPlace[] = KYRGYZ_REGIONS.flatMap((r) => r.places);

export function findLocalKyrgyzPlace(query: string, lang: Language = 'ru'): { place: KyrgyzPlace; displayName: string; displayRegion: string } | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  // Ищем совпадение по любому из 3 языков
  const exact = ALL_KYRGYZ_PLACES.find((p) =>
    p.name.ky.toLowerCase() === q ||
    p.name.ru.toLowerCase() === q ||
    p.name.en.toLowerCase() === q ||
    p.name.ky.toLowerCase().includes(q) ||
    p.name.ru.toLowerCase().includes(q) ||
    p.name.en.toLowerCase().includes(q)
  );

  if (exact) {
    return {
      place: exact,
      displayName: exact.name[lang] || exact.name.ru,
      displayRegion: exact.region[lang] || exact.region.ru,
    };
  }

  // Проверка по названию региона
  const regionMatch = KYRGYZ_REGIONS.find((r) =>
    r.name.ky.toLowerCase().includes(q) ||
    r.name.ru.toLowerCase().includes(q) ||
    r.name.en.toLowerCase().includes(q)
  );

  if (regionMatch) {
    return {
      place: regionMatch.centerPlace,
      displayName: regionMatch.centerPlace.name[lang] || regionMatch.centerPlace.name.ru,
      displayRegion: regionMatch.name[lang] || regionMatch.name.ru,
    };
  }

  return null;
}

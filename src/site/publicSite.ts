import { HOUSES } from '../data/houses';
import { HouseItem } from '../types';
import type { LegalDocType } from '../data/legal';

/** Release canonical host. Do not derive this from the request or the address bar. */
export const SITE_ORIGIN = 'https://karkasnik57.ru';

export interface PublicPage {
  path: string;
  kind: 'home' | 'catalog' | 'project' | 'contacts' | 'legal';
  title: string;
  description: string;
  h1: string;
  projectId?: string;
  legalDoc?: LegalDocType;
}

const PILOTS: Array<{ id: string; slug: string; h1: string; title: string; description: string }> = [
  {
    id: 'h1',
    slug: 'dachnyy-dom-4x4',
    h1: 'Дачный каркасный дом 4 × 4 м',
    title: 'Дачный каркасный дом 4 × 4 м — проект и комплектация | Каркасник',
    description:
      'Дом 4 × 4 м, 16 м², цена в каталоге 498 000 ₽. На странице визуализация проекта, состав карточки и то, что уже сказано о базовой цене.',
  },
  {
    id: 'h3',
    slug: 'dachnyy-dom-6x6',
    h1: 'Дачный каркасный дом 6 × 6 м',
    title: 'Дачный каркасный дом 6 × 6 м — проект и комплектация | Каркасник',
    description:
      'Дом 6 × 6 м, 36 м², цена в каталоге 580 000 ₽. На странице визуализация и состав карточки. Итог калькулятора может отличаться от цены каталога.',
  },
  {
    id: 'h5',
    slug: 'a-freym',
    h1: 'Каркасный дом А-фрейм',
    title: 'Каркасный дом А-фрейм — проект и комплектация | Каркасник',
    description:
      'Дом-шалаш, 32 м² по каталогу, цена 680 000 ₽. На странице визуализация, второй свет и состав карточки.',
  },
];

function pilotHouse(id: string): HouseItem {
  const house = HOUSES.find((item) => item.id === id);
  if (!house) throw new Error(`Catalog is missing project ${id}`);
  return house;
}

const PROJECT_PAGES: PublicPage[] = PILOTS.map((pilot) => ({
  path: `/proekty/${pilot.slug}/`,
  kind: 'project',
  title: pilot.title,
  description: pilot.description,
  h1: pilot.h1,
  projectId: pilot.id,
}));

export const PUBLIC_PAGES: PublicPage[] = [
  {
    path: '/',
    kind: 'home',
    title: 'Каркасник — Каркасные дома в Москве и МО от 498 000 ₽',
    description:
      'Каркасные дома под ключ в Москве и Московской области. Каталог проектов, калькулятор комплектации и заявка без предоплаты.',
    h1: 'Каркасный дом в Москве и области',
  },
  {
    path: '/proekty/',
    kind: 'catalog',
    title: 'Проекты каркасных домов с ценами | Каркасник',
    description:
      'Сравнение площади и цены каркасных домов в Москве и Московской области.',
    h1: 'Проекты каркасных домов с ценами',
  },
  ...PROJECT_PAGES,
  {
    path: '/kontakty/',
    kind: 'contacts',
    title: 'Контакты Каркасник — телефон, почта и адрес',
    description:
      'Телефон +7 (991) 181-69-15, почта karkasniiik@yandex.ru, адрес ул. Адмирала Корнилова, 63Б, поселение Мосрентген. Ежедневно с 9:00 до 20:00.',
    h1: 'Контакты',
  },
  {
    path: '/privacy',
    kind: 'legal',
    legalDoc: 'privacy',
    title: 'Политика обработки персональных данных | Каркасник',
    description: 'Как ООО «Каркасник» обрабатывает имя, телефон и данные заявки на сайте karkasnik57.ru.',
    h1: 'Политика обработки персональных данных',
  },
  {
    path: '/terms',
    kind: 'legal',
    legalDoc: 'terms',
    title: 'Пользовательское соглашение | Каркасник',
    description: 'Условия использования сайта karkasnik57.ru и подачи заявки на расчёт каркасного дома.',
    h1: 'Пользовательское соглашение',
  },
];

const BY_PATH = new Map(PUBLIC_PAGES.map((page) => [page.path, page]));

export function formatCatalogPrice(thousands: number): string {
  return `${new Intl.NumberFormat('ru-RU').format(thousands * 1000)} ₽`;
}

export function canonicalUrl(path: string): string {
  return path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
}

export function matchPublicPage(pathname: string): PublicPage | null {
  return BY_PATH.get(pathname) ?? null;
}

export function slashRedirect(pathname: string): string | null {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    const bare = pathname.slice(0, -1);
    if (BY_PATH.has(bare)) return bare;
  }
  if (pathname === '/' || pathname.endsWith('/')) return null;
  const withSlash = `${pathname}/`;
  return BY_PATH.has(withSlash) ? withSlash : null;
}

export function publishedProjectPath(houseId: string): string | null {
  return PROJECT_PAGES.find((page) => page.projectId === houseId)?.path ?? null;
}

export function projectPageById(houseId: string): PublicPage | null {
  return PROJECT_PAGES.find((page) => page.projectId === houseId) ?? null;
}

export function houseForPage(page: PublicPage): HouseItem | null {
  if (!page.projectId) return null;
  return pilotHouse(page.projectId);
}

export function robotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /login',
    'Disallow: /api/',
    '',
    `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
    '',
  ].join('\n');
}

export function sitemapXml(): string {
  const urls = PUBLIC_PAGES.map(
    (page) => `  <url><loc>${canonicalUrl(page.path)}</loc></url>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export const VISUALIZATION_CAPTION = 'Визуализация проекта, не фото построенного дома.';

/** Same sentence already published in the homepage FAQ for the 498 000 ₽ house. */
export const BASE_PRICE_NOTE =
  'Это цена готового дома из базового проекта под ключ: силовой каркас, кровля, наружная и внутренняя отделка, окна и двери. Оплата после установки.';

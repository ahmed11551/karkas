import fs from 'fs';
import type { NextFunction, Request, Response } from 'express';
import { COMPANY_CONFIG } from '../src/config/company';
import { HOUSES } from '../src/data/houses';
import { LEGAL_DOCS, LEGAL_UPDATED } from '../src/data/legal';
import {
  BASE_PRICE_NOTE,
  VISUALIZATION_CAPTION,
  canonicalUrl,
  formatCatalogPrice,
  houseForPage,
  matchPublicPage,
  publishedProjectPath,
  robotsTxt,
  sitemapXml,
  slashRedirect,
  type PublicPage,
} from '../src/site/publicSite';

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function catalogBody(): string {
  const page = matchPublicPage('/proekty/');
  if (!page) return '';
  const cards = HOUSES.map((house) => {
    const href = publishedProjectPath(house.id);
    const title = href
      ? `<a href="${esc(href)}">${esc(house.name.ru)}</a>`
      : esc(house.name.ru);
    const specs = house.specs.ru.map((spec) => `<li>${esc(spec)}</li>`).join('');
    return `<article>
      <h2>${title}</h2>
      <p>${esc(house.dimensions)} · ${house.area} м² · ${esc(formatCatalogPrice(house.price))}</p>
      <p>${esc(house.description.ru)}</p>
      <ul>${specs}</ul>
    </article>`;
  }).join('');
  return `<main>
    <nav aria-label="Хлебные крошки"><a href="/">Главная</a> / Проекты</nav>
    <h1>${esc(page.h1)}</h1>
    <p>${esc(page.description)}</p>
    <p><a href="/#calculator">Рассчитать комплектацию</a></p>
    ${cards}
  </main>`;
}

function projectBody(page: PublicPage): string {
  const house = houseForPage(page);
  if (!house) return '';
  const specs = house.specs.ru.map((spec) => `<li>${esc(spec)}</li>`).join('');
  const priceNote = house.id === 'h1' ? `<p>${esc(BASE_PRICE_NOTE)}</p>` : '';
  const siblings = ['h1', 'h3', 'h5']
    .filter((id) => id !== house.id)
    .map((id) => {
      const href = publishedProjectPath(id);
      const related = HOUSES.find((item) => item.id === id);
      if (!href || !related) return '';
      return `<li><a href="${esc(href)}">${esc(related.name.ru)}</a></li>`;
    })
    .join('');
  return `<main>
    <nav aria-label="Хлебные крошки"><a href="/">Главная</a> / <a href="/proekty/">Проекты</a> / ${esc(page.h1)}</nav>
    <h1>${esc(page.h1)}</h1>
    <p>${esc(formatCatalogPrice(house.price))} · ${esc(house.dimensions)} · ${house.area} м²</p>
    <p>${esc(house.description.ru)}</p>
    <figure>
      <img src="${esc(house.imageWebp)}" alt="${esc(`${page.h1}. ${VISUALIZATION_CAPTION}`)}" width="960" height="720" />
      <figcaption>${esc(VISUALIZATION_CAPTION)}</figcaption>
    </figure>
    <h2>Состав карточки</h2>
    <ul>${specs}</ul>
    ${priceNote}
    <p><a href="/#calculator">Рассчитать комплектацию</a></p>
    <h2>Другие проекты</h2>
    <ul>${siblings}</ul>
  </main>`;
}

function contactsBody(page: PublicPage): string {
  return `<main>
    <nav aria-label="Хлебные крошки"><a href="/">Главная</a> / ${esc(page.h1)}</nav>
    <h1>${esc(page.h1)}</h1>
    <p>Позвоните или напишите. Так договариваемся о выезде на участок.</p>
    <p><a href="${esc(COMPANY_CONFIG.phoneHref)}">${esc(COMPANY_CONFIG.phoneDisplay)}</a></p>
    <p><a href="mailto:${esc(COMPANY_CONFIG.email)}">${esc(COMPANY_CONFIG.email)}</a></p>
    <p><a href="${esc(COMPANY_CONFIG.socials.whatsappUrl)}">WhatsApp</a></p>
    <p>${esc(COMPANY_CONFIG.address.ru)}</p>
    <p>${esc(COMPANY_CONFIG.schedule.ru)}</p>
    <p><a href="/proekty/">Смотреть проекты</a></p>
  </main>`;
}

function legalBody(page: PublicPage): string {
  if (!page.legalDoc) return '';
  const doc = LEGAL_DOCS[page.legalDoc];
  const sections = doc.sections
    .map((section) => {
      const paragraphs = (section.paragraphs || []).map((paragraph) => `<p>${esc(paragraph.ru)}</p>`).join('');
      const items = section.items ? `<ul>${section.items.map((item) => `<li>${esc(item.ru)}</li>`).join('')}</ul>` : '';
      return `<section><h2>${esc(section.heading.ru)}</h2>${paragraphs}${items}</section>`;
    })
    .join('');
  const other = page.legalDoc === 'privacy' ? '/terms' : '/privacy';
  const otherTitle = LEGAL_DOCS[page.legalDoc === 'privacy' ? 'terms' : 'privacy'].title.ru;
  return `<main>
    <nav aria-label="Хлебные крошки"><a href="/">Главная</a> / ${esc(doc.title.ru)}</nav>
    <h1>${esc(doc.title.ru)}</h1>
    <p>${esc(COMPANY_CONFIG.legalName.ru)} · ${esc(COMPANY_CONFIG.regDetails.ru)} · ${esc(LEGAL_UPDATED.ru)}</p>
    ${sections}
    <p><a href="${other}">${esc(otherTitle)}</a></p>
  </main>`;
}

function pageBody(page: PublicPage): string {
  if (page.kind === 'catalog') return catalogBody();
  if (page.kind === 'project') return projectBody(page);
  if (page.kind === 'contacts') return contactsBody(page);
  if (page.kind === 'legal') return legalBody(page);
  return '';
}

function applyHead(template: string, page: PublicPage, body: string): string {
  const homeTitle = 'Каркасник — Каркасные дома в Москве и МО от 498 000 ₽';
  const homeDescription =
    'Премиальный интерактивный сервис и каталог каркасных дачных домов от 498 000 ₽ с живым калькулятором, 3D/SVG визуализатором, квизом и сезонными подарками.';
  const url = canonicalUrl(page.path);
  return template
    .replaceAll(homeTitle, page.title)
    .replaceAll(homeDescription, page.description)
    .replaceAll('href="https://karkasnik57.ru/"', `href="${url}"`)
    .replaceAll('content="https://karkasnik57.ru/"', `content="${url}"`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

export function notFoundHtml(): string {
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex" />
  <title>Страница не найдена — Каркасник</title>
</head>
<body>
  <main>
    <h1>Такой страницы нет</h1>
    <p><a href="/">На главную</a> · <a href="/proekty/">К проектам</a></p>
  </main>
</body>
</html>`;
}

function isDocumentRequest(req: Request): boolean {
  if (req.method !== 'GET' && req.method !== 'HEAD') return false;
  if (/\.[a-z0-9]+$/i.test(req.path)) return false;
  if (
    req.path.startsWith('/api/') ||
    req.path.startsWith('/assets/') ||
    req.path.startsWith('/src/') ||
    req.path.startsWith('/@') ||
    req.path.startsWith('/node_modules/') ||
    req.path.startsWith('/images/') ||
    req.path.startsWith('/icons/')
  ) {
    return false;
  }
  return true;
}

export function registerPublicDocuments(
  app: { get: Function; use: Function },
  options: {
    templatePath: string;
    transform?: (url: string, html: string) => Promise<string>;
  }
) {
  app.get('/robots.txt', (_req: Request, res: Response) => {
    res.type('text/plain; charset=utf-8').send(robotsTxt());
  });
  app.get('/sitemap.xml', (_req: Request, res: Response) => {
    res.type('application/xml; charset=utf-8').send(sitemapXml());
  });
  app.get('/sitemap_index.xml', (_req: Request, res: Response) => {
    res.status(404).type('text/plain; charset=utf-8').send('Not found');
  });

  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (!isDocumentRequest(req)) {
      next();
      return;
    }

    const redirect = slashRedirect(req.path);
    if (redirect) {
      res.redirect(301, redirect);
      return;
    }

    if (req.path === '/login') {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      next();
      return;
    }

    if (req.path === '/') {
      next();
      return;
    }

    const page = matchPublicPage(req.path);
    if (!page) {
      res.status(404).setHeader('X-Robots-Tag', 'noindex').type('html').send(notFoundHtml());
      return;
    }

    const body = pageBody(page);
    let html = applyHead(fs.readFileSync(options.templatePath, 'utf8'), page, body);
    if (options.transform) html = await options.transform(req.originalUrl, html);
    res.status(200).type('html').send(html);
  });
}

import React from 'react';
import { HOUSES } from '../data/houses';
import { Language } from '../types';
import { formatCatalogPrice, matchPublicPage, publishedProjectPath } from '../site/publicSite';

interface CatalogPageProps {
  lang: Language;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ lang }) => {
  const page = matchPublicPage('/proekty/');
  if (!page) return null;
  const ru = lang === 'ru';

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      <nav aria-label={ru ? 'Хлебные крошки' : 'Breadcrumb'} className="text-sm text-olive dark:text-cream-soft">
        <a href="/" className="hover:text-pine dark:hover:text-brass">
          {ru ? 'Главная' : 'Home'}
        </a>
        <span aria-hidden="true"> / </span>
        <span>{ru ? 'Проекты' : 'Projects'}</span>
      </nav>
      <h1 className="mt-6 max-w-3xl font-light text-4xl sm:text-5xl leading-tight text-ink dark:text-cream">
        {page.h1}
      </h1>
      <p className="mt-4 max-w-2xl text-base text-ink-soft dark:text-cream-soft">{page.description}</p>
      <p className="mt-6">
        <a
          href="/#calculator"
          className="inline-flex px-4 py-2.5 rounded-[12px] bg-forest text-cream text-sm dark:bg-cream dark:text-forest"
        >
          {ru ? 'Рассчитать комплектацию' : 'Calculate a specification'}
        </a>
      </p>
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
        {HOUSES.map((house) => {
          const href = publishedProjectPath(house.id);
          const name = house.name[lang];
          return (
            <article key={house.id}>
              {href ? (
                <a href={href} className="block">
                  <img
                    src={house.imageWebp}
                    alt={ru ? `${name}. Визуализация проекта` : `${name}. Project visualization`}
                    width={960}
                    height={720}
                    className="aspect-[4/3] w-full rounded-[20px] object-cover bg-cream"
                  />
                </a>
              ) : (
                <img
                  src={house.imageWebp}
                  alt={ru ? `${name}. Визуализация проекта` : `${name}. Project visualization`}
                  width={960}
                  height={720}
                  className="aspect-[4/3] w-full rounded-[20px] object-cover bg-cream"
                />
              )}
              <h2 className="mt-4 text-2xl font-light text-ink dark:text-cream">
                {href ? (
                  <a href={href} className="hover:text-pine dark:hover:text-brass">
                    {name}
                  </a>
                ) : (
                  name
                )}
              </h2>
              <p className="mt-2 text-sm text-ink-soft dark:text-cream-soft">
                {house.dimensions} · {house.area} м² · {formatCatalogPrice(house.price)}
              </p>
              <p className="mt-2 text-sm text-olive dark:text-cream-soft">{house.description[lang]}</p>
              <ul className="mt-3 space-y-1 text-sm text-ink dark:text-cream">
                {house.specs[lang].map((spec) => (
                  <li key={spec}>{spec}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </main>
  );
};

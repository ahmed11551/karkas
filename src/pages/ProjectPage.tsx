import React from 'react';
import { HouseItem, Language } from '../types';
import { HOUSES } from '../data/houses';
import {
  BASE_PRICE_NOTE,
  VISUALIZATION_CAPTION,
  formatCatalogPrice,
  projectPageById,
  publishedProjectPath,
} from '../site/publicSite';

interface ProjectPageProps {
  lang: Language;
  house: HouseItem;
  onCalculate: (house: HouseItem) => void;
}

export const ProjectPage: React.FC<ProjectPageProps> = ({ lang, house, onCalculate }) => {
  const page = projectPageById(house.id);
  if (!page) return null;
  const ru = lang === 'ru';
  const related = HOUSES.filter((item) => item.id !== house.id && publishedProjectPath(item.id));

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      <nav aria-label={ru ? 'Хлебные крошки' : 'Breadcrumb'} className="text-sm text-olive dark:text-cream-soft">
        <a href="/" className="hover:text-pine dark:hover:text-brass">
          {ru ? 'Главная' : 'Home'}
        </a>
        <span aria-hidden="true"> / </span>
        <a href="/proekty/" className="hover:text-pine dark:hover:text-brass">
          {ru ? 'Проекты' : 'Projects'}
        </a>
        <span aria-hidden="true"> / </span>
        <span>{page.h1}</span>
      </nav>
      <h1 className="mt-6 font-light text-4xl sm:text-5xl leading-tight text-ink dark:text-cream">{page.h1}</h1>
      <p className="mt-4 text-lg text-ink dark:text-cream">
        {formatCatalogPrice(house.price)} · {house.dimensions} · {house.area} м²
      </p>
      <p className="mt-3 text-base text-ink-soft dark:text-cream-soft">{house.description[lang]}</p>
      <figure className="mt-8">
        <img
          src={house.imageWebp}
          alt={`${page.h1}. ${VISUALIZATION_CAPTION}`}
          width={960}
          height={720}
          className="w-full rounded-[20px] object-cover bg-cream"
        />
        <figcaption className="mt-2 text-sm text-olive dark:text-cream-soft">{VISUALIZATION_CAPTION}</figcaption>
      </figure>
      <h2 className="mt-10 text-2xl font-light text-ink dark:text-cream">
        {ru ? 'Состав карточки' : 'What the card lists'}
      </h2>
      <ul className="mt-4 space-y-2 text-base text-ink dark:text-cream">
        {house.specs[lang].map((spec) => (
          <li key={spec}>{spec}</li>
        ))}
      </ul>
      {house.id === 'h1' && (
        <p className="mt-6 text-base text-ink-soft dark:text-cream-soft">{BASE_PRICE_NOTE}</p>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onCalculate(house)}
          className="px-4 py-2.5 rounded-[12px] bg-brass text-ink text-sm font-medium"
        >
          {ru ? 'Рассчитать этот дом' : 'Calculate this house'}
        </button>
        <a href="/proekty/" className="px-4 py-2.5 text-sm text-ink-soft dark:text-cream-soft">
          {ru ? 'Все проекты' : 'All projects'}
        </a>
      </div>
      <h2 className="mt-14 text-2xl font-light text-ink dark:text-cream">
        {ru ? 'Другие проекты' : 'Other projects'}
      </h2>
      <ul className="mt-4 space-y-2">
        {related.map((item) => (
          <li key={item.id}>
            <a href={publishedProjectPath(item.id) || '/proekty/'} className="text-pine dark:text-brass hover:underline">
              {item.name[lang]} · {formatCatalogPrice(item.price)}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
};

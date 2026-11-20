import React from 'react';
import { Language } from '../types';

interface BuiltProjectsProps {
  lang: Language;
}

const CASES = [
  {
    title: { ru: 'Дом 7,5×9 со вторым светом', en: '7.5×9 house with a double-height room' },
    text: {
      ru: 'Свайный фундамент 76 мм, обвязка 100×150, утепление пола 200 мм и стен 150 мм, имитация бруса, металлочерепица. Рассчитан на круглый год. Септик, электрику и воду можно смонтировать отдельно.',
      en: 'Screw piles, 200 mm floor insulation, 150 mm walls, timber cladding, metal tile roof. Built for year-round living. Septic, electrics, and water can be added separately.',
    },
  },
  {
    title: { ru: 'Двухэтажный дом 7,4×9', en: 'Two-storey house, 7.4×9' },
    text: {
      ru: 'Готовый проект с изменениями. Общая площадь 119 м², жилая 108 м². На первом этаже кухня-столовая, гостиная и санузел, на втором — холл и две спальни.',
      en: 'A standard project with changes. 119 m² total, 108 m² living. Ground floor: kitchen-dining, living room, bathroom. Upper floor: hall and two bedrooms.',
    },
  },
  {
    title: { ru: 'Одноэтажный дом 8×11', en: 'Single-storey house, 8×11' },
    text: {
      ru: 'Индивидуальный проект в комплектации «внешний контур»: три спальни и кухня-гостиная. Общая площадь 81 м², жилая 53 м². Отделку заказчик делал сам.',
      en: 'A custom shell build: three bedrooms and a kitchen-living room. 81 m² total, 53 m² living. The client finished the interior.',
    },
  },
] as const;

const PHOTOS = [
  { src: '/images/built/case-1.webp', alt: { ru: 'Сданный каркасный дом с крыльцом', en: 'Finished frame house with a porch' } },
  { src: '/images/built/case-2.webp', alt: { ru: 'Двухэтажный каркасный дом после строительства', en: 'Two-storey frame house after construction' } },
  { src: '/images/built/case-3.webp', alt: { ru: 'Каркасный дом с металлочерепицей', en: 'Frame house with a metal tile roof' } },
] as const;

export const BuiltProjects: React.FC<BuiltProjectsProps> = ({ lang }) => {
  return (
    <section id="built" className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mb-12">
        <span className="eyebrow text-brass-ink dark:text-brass-light">
          {lang === 'ru' ? 'Сданные объекты' : 'Completed builds'}
        </span>
        <h2 className="font-light text-4xl sm:text-5xl md:text-6xl leading-[1.02] tracking-[-0.02em] text-ink dark:text-cream mt-4 text-balance">
          {lang === 'ru' ? 'Дома, которые уже стоят' : 'Houses already built'}
        </h2>
        <p className="mt-4 text-sm sm:text-base text-ink-soft dark:text-cream-soft leading-relaxed max-w-2xl">
          {lang === 'ru'
            ? 'Три объекта с прошлого сайта: размеры, комплектация и фото построенных домов.'
            : 'Three builds from the previous site: sizes, specification, and photos of finished houses.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-8">
        {PHOTOS.map((photo) => (
          <figure key={photo.src} className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-forest">
            <img src={photo.src} alt={photo.alt[lang]} loading="lazy" decoding="async" className="w-full h-full object-cover" />
          </figure>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {CASES.map((item) => (
          <article key={item.title.ru} className="p-6 rounded-[20px] border border-ink/15 dark:border-cream/12">
            <h3 className="font-light text-2xl text-ink dark:text-cream">{item.title[lang]}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft dark:text-cream-soft">{item.text[lang]}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

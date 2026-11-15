import React, { useState } from 'react';
import { MapPin, CheckCircle2, Star } from 'lucide-react';
import { Language } from '../types';
import { COMPANY_CONFIG } from '../config/company';
import { playUiClick } from '../utils/sound';

interface PlotsMapProps {
  lang: Language;
}

interface PlotItem {
  id: string;
  location: string;
  district: string;
  houseModel: string;
  area: string;
  days: string;
  date: string;
  client: string;
  review: string;
  rating: number;
  x: number; // percentage coordinates on Moscow region map
  y: number;
}

const PLOTS: PlotItem[] = [
  {
    id: 'p1',
    location: 'КП «Истринские Холмы»',
    district: 'Истринский р-н (45 км)',
    houseModel: 'Шале с террасой 8×10',
    area: '80 м²',
    days: '2 дня',
    date: 'Октябрь 2026',
    client: 'Семья Воробьёвых',
    review: 'Собрали невероятно быстро. Бригада вежливая, никакого мусора на участке. Дом очень теплый!',
    rating: 5,
    x: 28,
    y: 38,
  },
  {
    id: 'p2',
    location: 'д. Шелепино',
    district: 'Дмитровский р-н (62 км)',
    houseModel: 'Барн 8×12 (2 этажа)',
    area: '110 м²',
    days: '3 дня',
    date: 'Сентябрь 2026',
    client: 'Артем и Елена Смирновы',
    review: 'Второй свет и остекление в пол выглядят на миллион! Металлочерепицу действительно дали в подарок.',
    rating: 5,
    x: 48,
    y: 20,
  },
  {
    id: 'p3',
    location: 'КП «Раменская Сказка»',
    district: 'Раменский р-н (42 км)',
    houseModel: 'Дачный дом 6×6 с верандой',
    area: '36 м²',
    days: '1 день',
    date: 'Август 2026',
    client: 'Мария Павловна',
    review: 'Оплатила только после подписания акта и проверки лазером всех углов. Спасибо за честность.',
    rating: 5,
    x: 72,
    y: 60,
  },
  {
    id: 'p4',
    location: 'СНТ «Ока»',
    district: 'Серпуховский р-н (85 км)',
    houseModel: 'А-фрейм 6×6',
    area: '32 м²',
    days: '2 дня',
    date: 'Июль 2026',
    client: 'Денис Кравцов',
    review: 'Все соседи приходили фотографировать наш треугольный домик. Доставили бесплатно, рекомендую.',
    rating: 5,
    x: 44,
    y: 82,
  },
  {
    id: 'p5',
    location: 'п. Обухово',
    district: 'Ногинский р-н (38 км)',
    houseModel: 'Дом с панорамной верандой',
    area: '24 м²',
    days: '1 день',
    date: 'Октябрь 2026',
    client: 'Ольга Николаевна',
    review: 'Идеальный дачный вариант. Сваи со скидкой 50% сэкономили почти 100 тысяч.',
    rating: 5,
    x: 78,
    y: 42,
  },
];

export const PlotsMap: React.FC<PlotsMapProps> = ({ lang }) => {
  const [selectedPlot, setSelectedPlot] = useState<PlotItem>(PLOTS[0]);

  return (
    <section className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="max-w-3xl">
          <span className="eyebrow text-brass-ink dark:text-brass-light">
            09 · {lang === 'ru' ? 'География и отзывы' : 'Built Projects & Locations'}
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.02] tracking-[-0.02em] text-ink dark:text-cream mt-4 text-balance">
            {lang === 'ru'
              ? 'Наши дома по всей Москве и Подмосковью'
              : 'Our Completed Homes Across Moscow Region'}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink-soft dark:text-cream-soft max-w-2xl leading-relaxed">
            {lang === 'ru'
              ? 'Более 38 000 построенных объектов с 2010 года. Посмотрите недавние сданные дома и реальные отзывы заказчиков.'
              : 'Over 38,000 houses erected since 2010. Explore recently handed-over plots and verified client impressions.'}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto eyebrow text-olive dark:text-cream-soft">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brass" aria-hidden="true" />
            {lang === 'ru' ? 'Сданный объект' : 'Handed over'}
          </span>
          <span aria-hidden="true">·</span>
          <span>{lang === 'ru' ? 'Доставка до 100 км бесплатно' : 'Free delivery up to 100 km'}</span>
        </div>
      </div>

      {/* 2-column dossier: map on the left, selected project on the right */}
      <div className="rounded-2xl border border-ink/15 dark:border-cream/12 p-5 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left: map canvas */}
        <div className="lg:col-span-7 relative bg-forest rounded-xl p-6 sm:p-8 min-h-[360px] sm:min-h-[420px] flex items-center justify-center border border-cream/10 overflow-hidden">
          {/* Regional ring contours (MKAD, A107, A108) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="12" fill="none" stroke="#E0C27F" strokeWidth="0.8" strokeDasharray="1,1" />
            <circle cx="50" cy="50" r="26" fill="none" stroke="#B9C4BE" strokeWidth="0.5" strokeDasharray="2,2" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="#B9C4BE" strokeWidth="0.5" strokeDasharray="3,3" />
            <text x="50" y="51" fill="#E0C27F" fontSize="3" fontWeight="bold" textAnchor="middle" letterSpacing="0.3">МОСКВА</text>
          </svg>

          {/* Plot pins */}
          {PLOTS.map((plot) => {
            const isSelected = selectedPlot.id === plot.id;
            return (
              <button
                key={plot.id}
                onClick={() => {
                  playUiClick('tick');
                  setSelectedPlot(plot);
                }}
                style={{ left: `${plot.x}%`, top: `${plot.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-300 group z-10 ${
                  isSelected ? 'scale-125 z-20' : 'hover:scale-110'
                }`}
                aria-label={`Выбрать ${plot.location}`}
                aria-pressed={isSelected}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-cream text-forest ring-4 ring-cream/25'
                      : 'bg-forest-raised text-cream border border-cream/40 hover:bg-cream hover:text-forest'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <span
                  className={`absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap pointer-events-none transition-all ${
                    isSelected
                      ? 'bg-cream text-forest opacity-100'
                      : 'bg-black/80 text-white opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {plot.location}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: selected project and review */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-8">
          <div>
            <div className="flex items-center justify-between gap-4 eyebrow text-olive dark:text-cream-soft mb-4">
              <span className="text-brass-ink dark:text-brass-light">{selectedPlot.district}</span>
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {lang === 'ru' ? 'Сдан и проверен' : 'Handed over & verified'}
              </span>
            </div>

            <h3 className="font-serif text-3xl sm:text-4xl leading-tight text-ink dark:text-cream">
              {selectedPlot.location}
            </h3>

            <dl className="mt-6 grid grid-cols-2 gap-px bg-ink/12 dark:bg-cream/10 border border-ink/12 dark:border-cream/10 rounded-xl overflow-hidden text-sm">
              <div className="bg-paper dark:bg-forest p-4">
                <dt className="eyebrow text-olive dark:text-cream-soft mb-1.5">
                  {lang === 'ru' ? 'Проект' : 'Project'}
                </dt>
                <dd className="font-medium text-ink dark:text-cream">{selectedPlot.houseModel}</dd>
              </div>
              <div className="bg-paper dark:bg-forest p-4">
                <dt className="eyebrow text-olive dark:text-cream-soft mb-1.5">
                  {lang === 'ru' ? 'Срок сборки' : 'Assembly time'}
                </dt>
                <dd className="font-medium text-brass-ink dark:text-brass-light">
                  {lang === 'ru' ? `${selectedPlot.days} на участке` : `${selectedPlot.days} on site`}
                </dd>
              </div>
            </dl>
          </div>

          {/* Testimonial: editorial quote with a brass rule, no tinted box */}
          <figure className="border-l-2 border-brass pl-5 sm:pl-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-sm text-ink dark:text-cream">{selectedPlot.client}</span>
              <div className="flex items-center gap-0.5 text-brass-ink dark:text-brass-light" aria-label={`${selectedPlot.rating} / 5`}>
                {[...Array(selectedPlot.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
            </div>

            <blockquote className="font-serif italic text-xl sm:text-2xl leading-snug text-ink dark:text-cream">
              «{selectedPlot.review}»
            </blockquote>

            <figcaption className="eyebrow text-olive dark:text-cream-soft">
              {lang === 'ru' ? 'Дата сдачи' : 'Handed over'}: {selectedPlot.date}
            </figcaption>
          </figure>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-ink/12 dark:border-cream/10 text-sm text-ink-soft dark:text-cream-soft">
            <span>{lang === 'ru' ? 'Хотите посмотреть готовый дом вживую?' : 'Want to see a finished house in person?'}</span>
            <a
              href={COMPANY_CONFIG.phoneHref}
              className="font-semibold text-ink dark:text-cream border-b border-ink/40 dark:border-cream/40 hover:border-ink dark:hover:border-cream pb-0.5 transition-colors"
            >
              {lang === 'ru' ? 'Записаться на экскурсию' : 'Book a site visit'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

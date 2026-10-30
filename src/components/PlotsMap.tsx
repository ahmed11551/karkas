import React, { useState } from 'react';
import { MapPin, CheckCircle2, Star, Calendar, Clock, Home } from 'lucide-react';
import { Language } from '../types';
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
    <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-xs font-semibold tracking-wider text-[#B27D18] dark:text-[#E6B860] uppercase">
            {lang === 'ru' ? 'География и отзывы' : 'Built Projects & Locations'}
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-neutral-900 dark:text-neutral-50 tracking-tight mt-2 text-balance">
            {lang === 'ru'
              ? 'Наши дома по всей Москве и Подмосковью'
              : 'Our Completed Homes Across Moscow Region'}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl">
            {lang === 'ru'
              ? 'Более 38 000 построенных объектов с 2010 года. Посмотрите недавние сданные дома и реальные отзывы заказчиков.'
              : 'Over 38,000 houses erected since 2010. Explore recently handed-over plots and verified client impressions.'}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto text-xs text-neutral-500 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E6B860]" />
            Сданный объект
          </span>
          <span>·</span>
          <span>Доставка до 100 км бесплатно</span>
        </div>
      </div>

      {/* 2-Column Interactive Map & Review Dossier */}
      <div className="glass-panel rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Interactive Map Vector Canvas */}
        <div className="lg:col-span-7 relative bg-gradient-to-br from-[#122A21] to-[#0A1813] rounded-2xl p-6 sm:p-8 min-h-[360px] sm:min-h-[420px] flex items-center justify-center border border-[#2F5A4B] overflow-hidden">
          {/* Subtle regional ring contours (MKAD, A107, A108) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 100 100">
            {/* Center MKAD */}
            <circle cx="50" cy="50" r="12" fill="none" stroke="#E6B860" strokeWidth="0.8" strokeDasharray="1,1" />
            {/* Betonka A107 */}
            <circle cx="50" cy="50" r="26" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="2,2" />
            {/* Big Ring A108 */}
            <circle cx="50" cy="50" r="42" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3,3" />
            <text x="50" y="51" fill="#E6B860" fontSize="3" fontWeight="bold" textAnchor="middle">МОСКВА</text>
          </svg>

          {/* Interactive Plot Location Pins */}
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
                  isSelected
                    ? 'scale-125 z-20'
                    : 'hover:scale-110'
                }`}
                aria-label={`Выбрать ${plot.location}`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                    isSelected
                      ? 'bg-[#E6B860] text-[#1E1705] ring-4 ring-[#E6B860]/40'
                      : 'bg-[#183B30] text-emerald-100 hover:bg-[#E6B860] hover:text-[#1E1705] border border-white/20'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <span
                  className={`absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap pointer-events-none transition-all ${
                    isSelected
                      ? 'bg-[#E6B860] text-[#1E1705] opacity-100'
                      : 'bg-black/80 text-white opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {plot.location}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Selected Plot Project Details & Client Review */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
              <span className="font-mono text-[#B27D18] dark:text-[#E6B860] font-semibold">
                {selectedPlot.district}
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Сдан и проверен
              </span>
            </div>

            <h3 className="font-display font-bold text-2xl text-neutral-900 dark:text-neutral-100">
              {selectedPlot.location}
            </h3>

            <div className="mt-4 p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-neutral-500 block">Проект:</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  {selectedPlot.houseModel}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Срок сборки:</span>
                <span className="font-semibold text-[#B27D18] dark:text-[#E6B860]">
                  {selectedPlot.days} на участке
                </span>
              </div>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="p-5 rounded-2xl bg-[#E6B860]/10 border border-[#E6B860]/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                {selectedPlot.client}
              </span>
              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(selectedPlot.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 italic leading-relaxed">
              «{selectedPlot.review}»
            </p>

            <span className="text-[11px] text-neutral-500 block pt-1">
              Дата сдачи: {selectedPlot.date}
            </span>
          </div>

          <div className="text-xs text-neutral-500 flex items-center justify-between pt-2">
            <span>Хотите посмотреть готовый дом вживую?</span>
            <a
              href="tel:+74951520242"
              className="font-semibold text-[#B27D18] dark:text-[#E6B860] hover:underline"
            >
              Записаться на экскурсию
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

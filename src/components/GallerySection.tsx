import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { Language } from '../types';
import { GALLERY, GALLERY_LABELS, GalleryCategory } from '../data/gallery';

interface GallerySectionProps {
  lang: Language;
}

const ORDER: GalleryCategory[] = ['houses', 'interiors', 'process', 'plans'];
const PAGE_SIZE = 12;

export const GallerySection: React.FC<GallerySectionProps> = ({ lang }) => {
  const [category, setCategory] = useState<GalleryCategory>('houses');
  const [shown, setShown] = useState(PAGE_SIZE);

  const photos = GALLERY[category];
  const visible = photos.slice(0, shown);

  const selectCategory = (next: GalleryCategory) => {
    setCategory(next);
    setShown(PAGE_SIZE);
  };

  return (
    <section id="gallery" className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mb-10">
        <span className="eyebrow inline-flex items-center gap-2 text-brass-ink dark:text-brass-light">
          <Camera className="w-3.5 h-3.5" aria-hidden="true" />
          {lang === 'ru' ? 'Наши объекты' : 'Our projects'}
        </span>
        <h2 className="font-light text-4xl sm:text-5xl md:text-6xl leading-[1.02] tracking-[-0.02em] text-ink dark:text-cream mt-4 text-balance">
          {lang === 'ru' ? 'Наши дома в фотографиях' : 'Our houses in photos'}
        </h2>
      </div>

      <div role="tablist" className="flex flex-wrap gap-2 mb-8">
        {ORDER.map((cat) => {
          const active = cat === category;
          return (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectCategory(cat)}
              className={`px-4 py-2 rounded-[12px] text-sm font-semibold border transition-all ${
                active
                  ? 'bg-ink text-paper border-ink dark:bg-cream dark:text-forest dark:border-cream'
                  : 'bg-transparent text-ink-soft dark:text-cream-soft border-ink/20 dark:border-cream/20 hover:text-ink dark:hover:text-cream'
              }`}
            >
              {lang === 'ru' ? GALLERY_LABELS[cat].ru : GALLERY_LABELS[cat].en}
              <span className="ml-1.5 opacity-60 tabular-nums">{GALLERY[cat].length}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {visible.map((photo) => (
          <figure key={photo.src} className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-forest">
            <img
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </figure>
        ))}
      </div>

      {shown < photos.length && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setShown((n) => n + PAGE_SIZE)}
            className="px-6 py-3 rounded-[12px] border border-ink/20 dark:border-cream/20 text-sm font-semibold text-ink dark:text-cream hover:bg-ink/5 dark:hover:bg-cream/5 transition-colors"
          >
            {lang === 'ru' ? `Показать ещё (${photos.length - shown})` : `Show more (${photos.length - shown})`}
          </button>
        </div>
      )}
    </section>
  );
};

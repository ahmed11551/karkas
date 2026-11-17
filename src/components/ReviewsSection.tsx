import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Language } from '../types';
import { REVIEWS } from '../data/reviews';

interface ReviewsSectionProps {
  lang: Language;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ lang }) => {
  // Reviews flagged with `needsCheck` stay out of the public page until they are confirmed.
  const published = REVIEWS.filter((review) => !review.needsCheck);

  return (
    <section id="reviews" className="py-20 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mb-12">
        <span className="eyebrow text-brass-ink dark:text-brass-light">
          {lang === 'ru' ? 'Отзывы клиентов' : 'Client reviews'}
        </span>
        <h2 className="font-light text-4xl sm:text-5xl md:text-6xl leading-[1.02] tracking-[-0.02em] text-ink dark:text-cream mt-4 text-balance">
          {lang === 'ru' ? 'Что говорят владельцы домов' : 'What homeowners say'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {published.map((review) => (
          <article
            key={review.id}
            className="p-6 rounded-[20px] border bg-forest text-cream border-cream/10 flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-cream">{review.name}</p>
                <p className="text-xs text-cream-soft mt-0.5">{review.date}</p>
              </div>
              <div className="flex gap-0.5 shrink-0" role="img" aria-label={`${review.rating} из 5`}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    aria-hidden="true"
                    className={`w-4 h-4 ${
                      i < review.rating ? 'fill-brass-light text-brass-light' : 'text-cream/25'
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-xs font-semibold text-brass-light">{review.project}</p>
            <p className="text-sm leading-relaxed text-cream-soft">{review.text}</p>

            {review.reply && (
              <div className="mt-auto pt-4 border-t border-cream/10">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-brass-light mb-1.5">
                  <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                  {lang === 'ru' ? 'Ответ компании' : 'Company reply'}
                </p>
                <p className="text-xs leading-relaxed text-cream-soft">{review.reply}</p>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

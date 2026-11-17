import React, { useState, useEffect } from 'react';
import { Play, Pause, CheckCircle2, Camera, Clock, MapPin, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { Language } from '../types';
import { playUiClick } from '../utils/sound';

interface ConstructionMediaProps {
  lang: Language;
  onOpenQuiz: () => void;
}

interface BuildStage {
  id: number;
  dayLabel: string;
  timeLabel: string;
  title: string;
  location: string;
  master: string;
  description: string;
  checks: string[];
  progress: number;
  imageWebp: string;
}

const BUILD_STAGES: BuildStage[] = [
  {
    id: 0,
    dayLabel: 'День 1 · Утро',
    timeLabel: '09:00 – 13:00',
    title: 'Монтаж свайного поля и двойной обвязки 150×150 мм',
    location: 'Истринский р-н, КП «Лесной Ручей»',
    master: 'Бригада Алексея Соколова (стаж 9 лет)',
    description:
      'Завинчиваем оцинкованные сваи ниже глубины промерзания (2.5 м), выводим горизонт по лазерному нивелиру с точностью до 1 мм, засыпаем ЦПС М300 и монтируем антисептированный венец из бруса 150×150 мм.',
    checks: ['Лазерный контроль диагоналей', 'Гидроизоляция оголовков в 2 слоя', 'Огнебиозащита Неомид'],
    progress: 25,
    imageWebp: '/images/construction/stage-1.webp',
  },
  {
    id: 1,
    dayLabel: 'День 1 · Вечер',
    timeLabel: '14:00 – 19:00',
    title: 'Возведение силового каркаса и стропильной системы',
    location: 'Истринский р-н, КП «Лесной Ручей»',
    master: 'Бригада Алексея Соколова (стаж 9 лет)',
    description:
      'Собираем стеновые щиты из сухого строганного бруса 150×50 мм камерной сушки. Врезаем силовые укосины, сдваиваем стойки в оконных и дверных проёмах, устанавливаем стропильные фермы крыши.',
    checks: ['Влажность древесины ≤ 14%', 'Шаг стоек 580 мм в распор под плиту', 'Оцинкованный крепеж'],
    progress: 55,
    imageWebp: '/images/construction/stage-2.webp',
  },
  {
    id: 2,
    dayLabel: 'День 2 · День',
    timeLabel: '09:00 – 18:00',
    title: 'Монтаж металлочерепицы, мембран и базальтового утепления',
    location: 'Истринский р-н, КП «Лесной Ручей»',
    master: 'Бригада Алексея Соколова (стаж 9 лет)',
    description:
      'Настилаем супердиффузионную мембрану Ондутис, бьём вентиляционный контрбрус и укладываем листы металлочерепицы 0.5 мм (подарок по акции). Заполняем стены и перекрытия негорючей базальтовой ватой.',
    checks: ['Перехлёст швов утеплителя', 'Проклейка пароизоляции скотчем', 'Вентзазор кровли 50 мм'],
    progress: 82,
    imageWebp: '/images/construction/stage-3.webp',
  },
  {
    id: 3,
    dayLabel: 'День 3 · Финал',
    timeLabel: '10:00 – 16:00',
    title: 'Установка окон ПВХ, чистовых полов и сдача ключей',
    location: 'Истринский р-н, КП «Лесной Ручей»',
    master: 'Бригада Алексея Соколова (стаж 9 лет)',
    description:
      'Монтируем двухкамерные энергосберегающие окна ПВХ, входную сейфовую дверь, настилаем шпунтованную доску пола 36 мм. Проводим уборку участка и подписываем акт приёмки — только после этого вы оплачиваете дом.',
    checks: ['Проверка тепловизором и уровнем', 'Чистый участок без строймусора', 'Оплата после приёмки'],
    progress: 100,
    imageWebp: '/images/construction/stage-4.webp',
  },
];

const STAGE_EN: Record<number, Partial<BuildStage>> = {
  0: {
    dayLabel: 'Day 1 · Morning',
    title: 'Installing the pile field and a 150×150 mm double bottom frame',
    location: 'Istra district, KP "Lesnoy Ruchey"',
    master: 'Crew of Alexey Sokolov (9 years of experience)',
    description:
      'We screw in galvanised piles below the freezing depth (2.5 m), level the base with a laser to 1 mm accuracy, backfill with CPS M300 and install an antiseptic 150×150 mm timber bottom frame.',
    checks: ['Laser check of diagonals', 'Pile heads waterproofed in 2 layers', 'Fire protection by Neomid'],
  },
  1: {
    dayLabel: 'Day 1 · Evening',
    title: 'Erecting the load-bearing frame and the rafter system',
    location: 'Istra district, KP "Lesnoy Ruchey"',
    master: 'Crew of Alexey Sokolov (9 years of experience)',
    description:
      'We assemble wall panels from kiln-dried planed timber 150×50 mm. We fit the diagonal braces, double the posts around window and door openings, and install the roof trusses.',
    checks: ['Timber moisture ≤ 14%', 'Post spacing 580 mm, braced under the slab', 'Galvanised fasteners'],
  },
  2: {
    dayLabel: 'Day 2 · Daytime',
    title: 'Installing metal tile, membranes and basalt insulation',
    location: 'Istra district, KP "Lesnoy Ruchey"',
    master: 'Crew of Alexey Sokolov (9 years of experience)',
    description:
      'We lay the Ondutis super-diffusion membrane, fix the ventilation battens and install 0.5 mm metal tile sheets (promotional gift). We fill walls and floors with non-combustible basalt wool.',
    checks: ['Insulation seams overlapped', 'Vapour barrier sealed with tape', 'Roof ventilation gap 50 mm'],
  },
  3: {
    dayLabel: 'Day 3 · Final',
    title: 'Installing PVC windows, finished floors and handing over the keys',
    location: 'Istra district, KP "Lesnoy Ruchey"',
    master: 'Crew of Alexey Sokolov (9 years of experience)',
    description:
      'We install double-glazed energy-saving PVC windows, a security entrance door and 36 mm tongue-and-groove floorboards. We clean the plot and sign the acceptance certificate — only then do you pay for the house.',
    checks: ['Thermal imaging and level check', 'Clean plot, no construction waste', 'Payment after acceptance'],
  },
};

export const ConstructionMedia: React.FC<ConstructionMediaProps> = ({ lang, onOpenQuiz }) => {
  const tx = (ru: string, en: string) => (lang === 'ru' ? ru : en);
  const stages: BuildStage[] =
    lang === 'en' ? BUILD_STAGES.map((s) => ({ ...s, ...STAGE_EN[s.id] })) : BUILD_STAGES;
  const [activeStage, setActiveStage] = useState<number>(3);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showWebpPhoto, setShowWebpPhoto] = useState<boolean>(false);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setActiveStage((prev) => {
        if (prev >= BUILD_STAGES.length - 1) {
          setIsPlaying(false);
          return 3;
        }
        return prev + 1;
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleTogglePlay = () => {
    playUiClick('tap');
    if (!isPlaying && activeStage === BUILD_STAGES.length - 1) {
      setActiveStage(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const stage = stages[activeStage];

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 cv-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="eyebrow text-brass-ink dark:text-brass-light">
            06 · {lang === 'ru' ? 'Видео-хроника и фоторепортажи со стройки (.webp)' : 'Live Construction Timelapse & Reportage (.webp)'}
          </span>
          <h2 className="font-light text-4xl sm:text-5xl md:text-6xl leading-[1.02] tracking-[-0.02em] text-ink dark:text-cream mt-4 text-balance">
            {lang === 'ru'
              ? 'Посмотрите, как растёт дом на участке за 1–3 дня'
              : 'Watch How a Turnkey House Rises in 1–3 Days'}
          </h2>
          <p className="mt-4 text-sm sm:text-base text-ink-soft dark:text-cream-soft max-w-2xl leading-relaxed">
            {lang === 'ru'
              ? 'Никаких затяжных строек на всё лето: привозим готовый домокомплект с завода и собираем в чистоте и тишине.'
              : 'Zero messy month-long construction sites: factory-cut kits assembled swiftly on your plot.'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              playUiClick('tap');
              setShowWebpPhoto((prev) => !prev);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-3 rounded-[12px] border border-ink/25 dark:border-cream/25 text-ink dark:text-cream hover:bg-ink hover:text-paper dark:hover:bg-cream dark:hover:text-forest font-medium text-xs transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5 text-brass-ink dark:text-brass-light" />
            <span>
              {showWebpPhoto
                ? tx('Схема сборки', 'Build diagram')
                : tx('Фото этапа (.webp)', 'Stage photo (.webp)')}
            </span>
          </button>

          <button
            onClick={handleTogglePlay}
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-[12px] bg-ink hover:bg-ink-soft text-paper dark:bg-cream dark:text-forest dark:hover:bg-cream-soft font-semibold text-sm transition-colors active:scale-95"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>{tx('Пауза таймлапса', 'Pause timelapse')}</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{tx('Запустить видео-таймлапс', 'Play video timelapse')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Interactive Video/Timelapse Player + Stage Dossier */}
      <div className="rounded-[20px] border border-ink/15 dark:border-cream/12 p-5 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left 7 Cols: Interactive Animated Construction Timelapse Viewport */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="relative rounded-xl overflow-hidden bg-forest border border-cream/10 aspect-[16/10] flex flex-col justify-between p-5">
            {/* WebP Stage Photo Layer */}
            {showWebpPhoto && (
              <picture className="absolute inset-0 w-full h-full z-0">
                <source srcSet={stage.imageWebp} type="image/webp" />
                <img
                  src={stage.imageWebp}
                  alt={stage.title}
                  width={800}
                  height={500}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover opacity-90 transition-all duration-500"
                />
              </picture>
            )}

            {/* Top Camera HUD */}
            <div className="flex items-center justify-between text-xs text-white/90 z-10">
              <div className="flex items-center gap-2 px-3 py-1 rounded-[12px] bg-black/50  border border-white/15">
                <Camera className="w-3.5 h-3.5 text-brass-light" />
                <span className="font-mono font-semibold">{stage.dayLabel}</span>
                <span className="text-white/40">|</span>
                <span className="font-mono text-brass-light">{stage.timeLabel}</span>
              </div>

              <div className="px-3 py-1 rounded-[12px] bg-black/50  border border-white/15 font-mono text-[11px] text-cream">
                {tx('Готовность', 'Progress')}: {stage.progress}%
              </div>
            </div>

            {/* Center Progressive Architectural SVG Build Scene */}
            {!showWebpPhoto && (
              <svg
                viewBox="0 0 400 220"
                className="w-full h-full my-auto select-none z-10"
                role="img"
                aria-label={tx('Таймлапс сборки каркасного дома', 'Timelapse of the frame house assembly')}
              >
                <path d="M0 185 Q 120 178 240 185 T 400 182 V 220 H 0 Z" fill="#1E4033" />
                <line x1="20" y1="184" x2="380" y2="184" stroke="#FCBD1C" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />

                <g className="transition-all duration-500">
                  {[80, 140, 200, 260, 320].map((x) => (
                    <g key={x}>
                      <rect x={x - 3} y="168" width="6" height="26" fill="#94A3B8" />
                      <rect x={x - 8} y="166" width="16" height="4" fill="#475569" />
                    </g>
                  ))}
                  <rect x="68" y="158" width="264" height="9" rx="1" fill="#D4A359" stroke="#8C6226" strokeWidth="1.5" />
                </g>

                {activeStage >= 1 && (
                  <g className="transition-all duration-500">
                    {[74, 108, 142, 176, 210, 244, 278, 318].map((x) => (
                      <rect key={x} x={x} y="88" width="6" height="70" fill="#E8C994" />
                    ))}
                    <rect x="70" y="84" width="260" height="6" fill="#D4A359" />
                    <line x1="78" y1="158" x2="142" y2="88" stroke="#C99A52" strokeWidth="3" />
                    <line x1="320" y1="158" x2="248" y2="88" stroke="#C99A52" strokeWidth="3" />
                    <path d="M60 86 L200 22 L340 86 Z" fill="none" stroke="#E8C994" strokeWidth="5" />
                    <line x1="130" y1="54" x2="130" y2="86" stroke="#E8C994" strokeWidth="3" />
                    <line x1="200" y1="22" x2="200" y2="86" stroke="#E8C994" strokeWidth="3" />
                    <line x1="270" y1="54" x2="270" y2="86" stroke="#E8C994" strokeWidth="3" />
                  </g>
                )}

                {activeStage >= 2 && (
                  <g className="transition-all duration-500">
                    <rect x="76" y="90" width="246" height="68" fill="#3D6B58" opacity="0.9" />
                    <path d="M54 88 L200 18 L346 88 Z" fill="#2F5A4B" stroke="#FCBD1C" strokeWidth="1.5" />
                    <line x1="100" y1="66" x2="300" y2="66" stroke="#4D8C76" strokeWidth="1.5" />
                    <line x1="145" y1="44" x2="255" y2="44" stroke="#4D8C76" strokeWidth="1.5" />
                  </g>
                )}

                {activeStage >= 3 && (
                  <g className="transition-all duration-500">
                    <rect x="72" y="88" width="256" height="70" fill="#F6E3C0" stroke="#C99A52" strokeWidth="1.5" />
                    {[102, 116, 130, 144].map((y) => (
                      <line key={y} x1="72" y1={y} x2="328" y2={y} stroke="#E0C59A" strokeWidth="1" />
                    ))}
                    <rect
                      x="96"
                      y="102"
                      width="48"
                      height="38"
                      rx="3"
                      fill="#FFD37A"
                      stroke="#2F5A4B"
                      strokeWidth="3"
                      style={{ filter: 'drop-shadow(0 0 10px rgba(255, 211, 122, 0.8))' }}
                    />
                    <line x1="120" y1="102" x2="120" y2="140" stroke="#2F5A4B" strokeWidth="2" />
                    <rect
                      x="168"
                      y="102"
                      width="48"
                      height="38"
                      rx="3"
                      fill="#FFD37A"
                      stroke="#2F5A4B"
                      strokeWidth="3"
                      style={{ filter: 'drop-shadow(0 0 10px rgba(255, 211, 122, 0.8))' }}
                    />
                    <line x1="192" y1="102" x2="192" y2="140" stroke="#2F5A4B" strokeWidth="2" />
                    <rect x="256" y="102" width="34" height="56" rx="2" fill="#214237" />
                    <circle cx="283" cy="130" r="2.5" fill="#FCBD1C" />
                  </g>
                )}
              </svg>
            )}

            {/* Bottom Stage Timeline Scrubber */}
            <div className="z-10 space-y-2 mt-auto">
              <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full bg-brass transition-all duration-500 rounded-full"
                  style={{ width: `${stage.progress}%` }}
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {stages.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      playUiClick('tap');
                      setIsPlaying(false);
                      setActiveStage(st.id);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all text-center truncate ${
                      activeStage === st.id
                        ? 'bg-cream text-forest shadow'
                        : 'bg-black/40  text-white/85 hover:bg-white/20'
                    }`}
                  >
                    {st.dayLabel}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Active Stage Engineering Report */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-olive dark:text-cream-soft mb-3">
              <MapPin className="w-3.5 h-3.5 text-brass-ink dark:text-brass-light" />
              <span>{stage.location}</span>
              <span>·</span>
              <Clock className="w-3.5 h-3.5 text-brass-ink dark:text-brass-light" />
              <span>{stage.timeLabel}</span>
            </div>

            <h3 className="font-light text-3xl sm:text-4xl leading-tight text-ink dark:text-cream">
              {stage.title}
            </h3>

            <p className="mt-4 text-sm text-ink-soft dark:text-cream-soft leading-relaxed">
              {stage.description}
            </p>
          </div>

          {/* Quality Checklist for this stage */}
          <div className="p-5 rounded-xl border border-ink/12 dark:border-cream/10 space-y-2.5">
            <span className="eyebrow text-ink dark:text-cream block">
              {tx('Технадзор этапа', 'Stage supervision')} ({stage.master}):
            </span>
            {stage.checks.map((ch, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-sm text-ink-soft dark:text-cream-soft">
                <CheckCircle2 className="w-4 h-4 text-brass-ink dark:text-brass-light shrink-0" />
                <span>{ch}</span>
              </div>
            ))}
          </div>

          {/* CTA to book live plot visit or get estimate */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-olive dark:text-cream-soft">
              <ShieldCheck className="w-4 h-4 text-brass-ink dark:text-brass-light shrink-0" />
              <span>{tx('Фотоотчёт каждого этапа в WhatsApp / Telegram', 'Photo report of each stage in WhatsApp / Telegram')}</span>
            </div>

            <button
              onClick={() => {
                playUiClick('tap');
                onOpenQuiz();
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-[12px] bg-brass hover:bg-brass-hover text-ink font-semibold text-sm transition-all whitespace-nowrap"
            >
              {tx('Заказать расчёт со сборкой', 'Order an estimate with assembly')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

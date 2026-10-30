import React, { useState, useEffect } from 'react';
import { Play, Pause, CheckCircle2, Camera, Clock, MapPin, ShieldCheck } from 'lucide-react';
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
  },
];

export const ConstructionMedia: React.FC<ConstructionMediaProps> = ({ lang, onOpenQuiz }) => {
  const [activeStage, setActiveStage] = useState<number>(3); // Show completed stage by default, or animate
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

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

  const stage = BUILD_STAGES[activeStage];

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="text-xs font-semibold tracking-wider text-[#B27D18] dark:text-[#E6B860] uppercase">
            {lang === 'ru' ? 'Видео-хроника и фоторепортажи со стройки' : 'Live Construction Timelapse & Reportage'}
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-neutral-900 dark:text-neutral-50 tracking-tight mt-2 text-balance">
            {lang === 'ru'
              ? 'Посмотрите, как растёт дом на участке за 1–3 дня'
              : 'Watch How a Turnkey House Rises in 1–3 Days'}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-2xl">
            {lang === 'ru'
              ? 'Никаких затяжных строек на всё лето: привозим готовый домокомплект с завода и собираем в чистоте и тишине.'
              : 'Zero messy month-long construction sites: factory-cut kits assembled swiftly on your plot.'}
          </p>
        </div>

        <button
          onClick={handleTogglePlay}
          className="self-start md:self-auto inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#E6B860] hover:bg-[#D4A043] text-[#1E1705] font-display font-semibold text-xs sm:text-sm gold-glow transition-all active:scale-95"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Пауза таймлапса</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Запустить видео-таймлапс сборки</span>
            </>
          )}
        </button>
      </div>

      {/* Main Interactive Video/Timelapse Player + Stage Dossier */}
      <div className="glass-panel rounded-3xl border border-neutral-200/90 dark:border-neutral-800 p-6 sm:p-10 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left 7 Cols: Interactive Animated Construction Timelapse Viewport */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#16362B] via-[#112820] to-[#0A1813] border border-[#2F5A4B] aspect-[16/10] flex flex-col justify-between p-5 shadow-2xl">
            {/* Top Camera HUD */}
            <div className="flex items-center justify-between text-xs text-white/90 z-10">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15">
                <Camera className="w-3.5 h-3.5 text-[#E6B860]" />
                <span className="font-mono font-semibold">{stage.dayLabel}</span>
                <span className="text-white/40">|</span>
                <span className="font-mono text-[#E6B860]">{stage.timeLabel}</span>
              </div>

              <div className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15 font-mono text-[11px] text-emerald-300">
                Готовность: {stage.progress}%
              </div>
            </div>

            {/* Center Progressive Architectural SVG Build Scene */}
            <svg viewBox="0 0 400 220" className="w-full h-full my-auto select-none" role="img" aria-label="Таймлапс сборки каркасного дома">
              {/* Landscape Ground */}
              <path d="M0 185 Q 120 178 240 185 T 400 182 V 220 H 0 Z" fill="#1E4033" />
              <line x1="20" y1="184" x2="380" y2="184" stroke="#E6B860" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />

              {/* STAGE 0+: Screw Piles & 150x150 Sill Timber */}
              <g className="transition-all duration-500">
                {[80, 140, 200, 260, 320].map((x) => (
                  <g key={x}>
                    <rect x={x - 3} y="168" width="6" height="26" fill="#94A3B8" />
                    <rect x={x - 8} y="166" width="16" height="4" fill="#475569" />
                  </g>
                ))}
                {/* 150x150 Sill Beam */}
                <rect x="68" y="158" width="264" height="9" rx="1" fill="#D4A359" stroke="#8C6226" strokeWidth="1.5" />
              </g>

              {/* STAGE 1+: Structural Stud Frame & Rafters */}
              {activeStage >= 1 && (
                <g className="transition-all duration-500">
                  {/* Outer & Inner Studs */}
                  {[74, 108, 142, 176, 210, 244, 278, 318].map((x) => (
                    <rect key={x} x={x} y="88" width="6" height="70" fill="#E8C994" />
                  ))}
                  {/* Top plate */}
                  <rect x="70" y="84" width="260" height="6" fill="#D4A359" />
                  {/* Diagonal wind braces */}
                  <line x1="78" y1="158" x2="142" y2="88" stroke="#C99A52" strokeWidth="3" />
                  <line x1="320" y1="158" x2="248" y2="88" stroke="#C99A52" strokeWidth="3" />
                  {/* Roof Rafter Trusses */}
                  <path d="M60 86 L200 22 L340 86 Z" fill="none" stroke="#E8C994" strokeWidth="5" />
                  <line x1="130" y1="54" x2="130" y2="86" stroke="#E8C994" strokeWidth="3" />
                  <line x1="200" y1="22" x2="200" y2="86" stroke="#E8C994" strokeWidth="3" />
                  <line x1="270" y1="54" x2="270" y2="86" stroke="#E8C994" strokeWidth="3" />
                </g>
              )}

              {/* STAGE 2+: Basalt Wool Insulation & Metal Tile Roof */}
              {activeStage >= 2 && (
                <g className="transition-all duration-500">
                  {/* Basalt wool infill between studs */}
                  <rect x="76" y="90" width="246" height="68" fill="#3D6B58" opacity="0.9" />
                  {/* Metal Tile Roof */}
                  <path d="M54 88 L200 18 L346 88 Z" fill="#2F5A4B" stroke="#E6B860" strokeWidth="1.5" />
                  <line x1="100" y1="66" x2="300" y2="66" stroke="#4D8C76" strokeWidth="1.5" />
                  <line x1="145" y1="44" x2="255" y2="44" stroke="#4D8C76" strokeWidth="1.5" />
                </g>
              )}

              {/* STAGE 3: Finished Timber Cladding, Glazed Windows & Warm Lights */}
              {activeStage >= 3 && (
                <g className="transition-all duration-500">
                  {/* Finished Cladding Facade */}
                  <rect x="72" y="88" width="256" height="70" fill="#F6E3C0" stroke="#C99A52" strokeWidth="1.5" />
                  {[102, 116, 130, 144].map((y) => (
                    <line key={y} x1="72" y1={y} x2="328" y2={y} stroke="#E0C59A" strokeWidth="1" />
                  ))}
                  {/* Glowing Panoramic Windows */}
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
                  {/* Entrance Steel Door */}
                  <rect x="256" y="102" width="34" height="56" rx="2" fill="#214237" />
                  <circle cx="283" cy="130" r="2.5" fill="#E6B860" />
                </g>
              )}
            </svg>

            {/* Bottom Stage Timeline Scrubber */}
            <div className="z-10 space-y-2">
              <div className="w-full h-1.5 rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full bg-[#E6B860] transition-all duration-500 rounded-full"
                  style={{ width: `${stage.progress}%` }}
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {BUILD_STAGES.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      playUiClick('tap');
                      setIsPlaying(false);
                      setActiveStage(st.id);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold transition-all text-center truncate ${
                      activeStage === st.id
                        ? 'bg-[#E6B860] text-[#1E1705] shadow'
                        : 'bg-white/10 text-white/75 hover:bg-white/20'
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
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-2">
              <MapPin className="w-3.5 h-3.5 text-[#B27D18] dark:text-[#E6B860]" />
              <span>{stage.location}</span>
              <span>·</span>
              <Clock className="w-3.5 h-3.5 text-[#B27D18] dark:text-[#E6B860]" />
              <span>{stage.timeLabel}</span>
            </div>

            <h3 className="font-display font-bold text-xl sm:text-2xl text-neutral-900 dark:text-neutral-100 leading-snug">
              {stage.title}
            </h3>

            <p className="mt-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {stage.description}
            </p>
          </div>

          {/* Quality Checklist for this stage */}
          <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-800 space-y-2">
            <span className="text-xs font-bold text-neutral-900 dark:text-neutral-200 block">
              Технадзор этапа ({stage.master}):
            </span>
            {stage.checks.map((ch, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-neutral-700 dark:text-neutral-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{ch}</span>
              </div>
            ))}
          </div>

          {/* CTA to book live plot visit or get estimate */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-[#B27D18] dark:text-[#E6B860] shrink-0" />
              <span>Фотоотчёт каждого этапа в WhatsApp / Telegram</span>
            </div>

            <button
              onClick={() => {
                playUiClick('tap');
                onOpenQuiz();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#183B30] hover:bg-[#122A21] text-[#E6B860] font-semibold text-xs transition-all whitespace-nowrap"
            >
              Заказать расчёт со сборкой
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

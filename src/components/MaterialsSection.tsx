import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ThermometerSnowflake, Sparkles, Layers } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { playUiClick } from '../utils/sound';

interface MaterialsSectionProps {
  lang: Language;
}

interface HotspotLayer {
  id: number;
  code: string;
  title: { ru: string; en: string };
  subtitle: { ru: string; en: string };
  spec: { ru: string; en: string };
  gost: string;
  lifespan: { ru: string; en: string };
  metrics: {
    thickness: { ru: string; en: string };
    densityOrGrade: { ru: string; en: string };
    thermalOrLoad: { ru: string; en: string };
  };
  pinX: number;
  pinY: number;
}

const HOTSPOTS: HotspotLayer[] = [
  {
    id: 0,
    code: '01',
    title: { ru: 'Кровля из металлочерепицы (Подарок)', en: 'Metal Tile Roofing (Free Gift)' },
    subtitle: { ru: 'Сталь 0.5 мм с полимерным покрытием + гидроизоляция', en: '0.5mm polymer-coated steel + membrane' },
    spec: {
      ru: 'Профиль Монтеррей с двойной капиллярной канавкой, контробрешеткой 40×50 мм для вентиляции подкровельного пространства.',
      en: 'Monterrey profile with dual capillary groove and 40×50mm counter-battens for roof ventilation.',
    },
    gost: 'ГОСТ Р 58153-2018',
    lifespan: { ru: 'Срок службы: 50+ лет', en: 'Lifespan: 50+ years' },
    metrics: {
      thickness: { ru: '0.50 мм сталь + 25 мкм полиэстер', en: '0.50mm steel + 25µm polyester' },
      densityOrGrade: { ru: 'Цинкование Zn 180 г/м²', en: 'Zinc coating 180 g/m²' },
      thermalOrLoad: { ru: 'Снеговая нагрузка до 240 кг/м²', en: 'Snow load up to 240 kg/m²' },
    },
    pinX: 195,
    pinY: 56,
  },
  {
    id: 1,
    code: '02',
    title: { ru: 'Вентилируемый фасад и мембрана Ондутис', en: 'Ventilated Cladding & Wind Barrier' },
    subtitle: { ru: 'Имитация бруса камерной сушки + диффузионная защита', en: 'Kiln-dried timber siding + wind membrane' },
    spec: {
      ru: 'Наружная обшивка через вентиляционный зазор защищает утеплитель от влаги и выдувания тепла при штормовом ветре.',
      en: 'External timber cladding mounted over an air gap shields insulation from moisture and wind chill.',
    },
    gost: 'ГОСТ 8242-88',
    lifespan: { ru: 'Ветрозащита: 100%', en: 'Wind protection: 100%' },
    metrics: {
      thickness: { ru: 'Профиль 16×140 мм + вентзазор 30 мм', en: '16×140mm profile + 30mm air gap' },
      densityOrGrade: { ru: 'Паропроницаемость 1200 г/(м²·сут)', en: 'Vapor permeability 1200 g/(m²·24h)' },
      thermalOrLoad: { ru: 'Водоупорность > 1000 мм вод. ст.', en: 'Water resistance > 1000mm WC' },
    },
    pinX: 122,
    pinY: 138,
  },
  {
    id: 2,
    code: '03',
    title: { ru: 'Силовой каркас камерной сушки', en: 'Kiln-Dried Structural Timber Frame' },
    subtitle: { ru: 'Строганный брус 150×50 мм влажностью до 14%', en: 'Planed 150×50mm studs, ≤14% moisture' },
    spec: {
      ru: 'Стойки с шагом 580 мм под плитный утеплитель в распор, укосины жесткости и ригели по скандинавской технологии.',
      en: 'Studs spaced at 580mm for tight friction-fit insulation, diagonal bracing, and Scandinavian header beams.',
    },
    gost: 'ГОСТ 8486-86 (Сорт 1)',
    lifespan: { ru: 'Геометрия без усадки', en: 'Zero shrinkage geometry' },
    metrics: {
      thickness: { ru: 'Сечение 150×50 / 100×50 мм', en: 'Section 150×50 / 100×50 mm' },
      densityOrGrade: { ru: 'Хвойный 1 сорт, влажность 12–14%', en: 'Grade-1 pine, 12–14% moisture' },
      thermalOrLoad: { ru: 'Шаг стоек 580 мм (в распор)', en: '580mm stud spacing (friction-fit)' },
    },
    pinX: 215,
    pinY: 162,
  },
  {
    id: 3,
    code: '04',
    title: { ru: 'Негорючее базальтовое утепление', en: 'Non-Combustible Basalt Wool' },
    subtitle: { ru: 'Каменная вата 100 / 150 / 200 мм с перехлёстом швов', en: '100 / 150 / 200mm rockwool with staggered seams' },
    spec: {
      ru: 'Экологичный базальтовый плитный утеплитель не дает усадки, не горит (класс НГ) и держит тепло до −35 °C.',
      en: 'High-density basalt rockwool slabs never sag, are fireproof (Class A1), and retain warmth down to −35 °C.',
    },
    gost: 'ГОСТ 9573-2012 (НГ)',
    lifespan: { ru: 'Эффект термоса зимой и летом', en: 'All-season thermal envelope' },
    metrics: {
      thickness: { ru: 'Контур 100 / 150 / 200 мм', en: '100 / 150 / 200 mm envelope' },
      densityOrGrade: { ru: 'Плотность 45 кг/м³ · Класс НГ', en: 'Density 45 kg/m³ · Non-combustible' },
      thermalOrLoad: { ru: 'Теплопроводность λ = 0.035 Вт/(м·К)', en: 'Thermal cond. λ = 0.035 W/(m·K)' },
    },
    pinX: 280,
    pinY: 190,
  },
  {
    id: 4,
    code: '05',
    title: { ru: 'Двойная обвязка и лаги пола 150×150 мм', en: 'Double Sill Plate & 150×150mm Floor Joists' },
    subtitle: { ru: 'Хвойный брус с глубокой огнебиозащитной пропиткой', en: 'Heavy pine timber with bio-fire treatment' },
    spec: {
      ru: 'Монолитная жесткость полов без скрипов и батутности. Обработка антисептиком Неомид в заводском цеху.',
      en: 'Rock-solid floor rigidity with zero bounce or creaking, factory-treated with deep antiseptic protection.',
    },
    gost: 'ГОСТ 20022.2-80',
    lifespan: { ru: 'Защита от влаги и грибка', en: 'Rot & moisture proof' },
    metrics: {
      thickness: { ru: 'Брус 150×150 мм + лаги 150×50 мм', en: '150×150mm beam + 150×50mm joists' },
      densityOrGrade: { ru: 'Антисептик Неомид 430 Eco', en: 'Neomid 430 Eco bio-shield' },
      thermalOrLoad: { ru: 'Нагрузка перекрытия 400 кг/м²', en: 'Floor load rating 400 kg/m²' },
    },
    pinX: 160,
    pinY: 256,
  },
  {
    id: 5,
    code: '06',
    title: { ru: 'Свайно-винтовой фундамент (−50% по акции)', en: 'Screw-Pile Foundation (50% Promo Off)' },
    subtitle: { ru: 'Стальные сваи Ø108 мм длиной 2500 мм ниже глубины промерзания', en: 'Ø108mm steel piles, 2500mm deep below frost line' },
    spec: {
      ru: 'Монтаж за 1 день на любом рельефе и грунте без грязи на участке. Заполнение полости сваи пескобетоном М300.',
      en: 'Installed in 1 day on any terrain with zero excavation mess. Filled internally with M300 dry concrete.',
    },
    gost: 'СП 24.13330.2021',
    lifespan: { ru: 'Нагрузка до 4.5 тонн на сваю', en: '4.5 tons load per pile' },
    metrics: {
      thickness: { ru: 'Труба Ø108×4 мм, лопасть Ø300×5 мм', en: 'Ø108×4mm shaft, Ø300×5mm blade' },
      densityOrGrade: { ru: 'Сталь Ст20 + эпоксидная эмаль + ЦПС М300', en: 'St20 steel + epoxy + M300 concrete' },
      thermalOrLoad: { ru: 'Несущая способность 4 500 кг / свая', en: 'Bearing capacity 4,500 kg / pile' },
    },
    pinX: 225,
    pinY: 312,
  },
];

export const MaterialsSection: React.FC<MaterialsSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [activeLayer, setActiveLayer] = useState<number>(3); // Selected layer
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null); // Hovered hotspot or layer
  const [focusMode, setFocusMode] = useState<boolean>(true); // Focus Mode enabled by default for Awwwards layer spotlight

  // The displayed layer prioritizes hover state for instant interactive inspection
  const displayedLayerIndex = hoveredLayer !== null ? hoveredLayer : activeLayer;
  const currentSpot = HOTSPOTS[displayedLayerIndex];

  // Helper for Focus Mode layer opacity: selected layer = 1, unselected layers become semi-transparent (0.18)
  const getLayerOpacity = (layerId: number) => {
    if (displayedLayerIndex === layerId) return 1;
    return focusMode ? 0.18 : 0.78;
  };

  // Calculate smart tooltip placement in % relative to 400x360 viewBox
  const getTooltipPositionStyle = (spot: HotspotLayer): React.CSSProperties => {
    const pinPct = (spot.pinX / 400) * 100;
    const isBottomHalf = spot.pinY > 210;
    const topPct = (spot.pinY / 360) * 100;

    return {
      // Keep the whole card inside the stage: the centre is clamped by half the card width (--tip-half) + gutter
      left: `clamp(calc(var(--tip-half) + 0.75rem), ${pinPct}%, calc(100% - var(--tip-half) - 0.75rem))`,
      top: isBottomHalf ? `${topPct - 4}%` : `${topPct + 5}%`,
      transform: isBottomHalf ? 'translate(-50%, -100%)' : 'translate(-50%, 0%)',
    };
  };

  return (
    <section id="materials" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="eyebrow text-brass-ink dark:text-brass-light">
              05 · {lang === 'ru' ? 'Интерактивный 3D-разрез конструкции' : 'Interactive 3D Structural Cutaway'}
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-[1.02] tracking-[-0.02em] text-ink dark:text-cream mt-4 text-balance">
              {t.specsSection.title}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-ink-soft dark:text-cream-soft max-w-2xl leading-relaxed">
              {lang === 'ru'
                ? 'Наведите курсор или нажмите на любую точку (01–06) на 3D-разрезе: выбранный слой подсвечивается в режиме фокуса, а остальные становятся полупрозрачными.'
                : 'Hover or click any numbered hotspot (01–06) on the 3D cutaway: the selected layer glows in Focus Mode while the rest of the house becomes semi-transparent.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <button
              type="button"
              onClick={() => {
                playUiClick('tap');
                setFocusMode((prev) => !prev);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all ${
                focusMode
                  ? 'bg-ink text-paper border-ink dark:bg-cream dark:text-forest dark:border-cream'
                  : 'bg-transparent text-ink-soft dark:text-cream-soft border-ink/20 dark:border-cream/20 hover:text-ink dark:hover:text-cream'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {lang === 'ru'
                  ? `Focus Mode: ${focusMode ? 'ВКЛ' : 'ВЫКЛ'}`
                  : `Focus Mode: ${focusMode ? 'ON' : 'OFF'}`}
              </span>
            </button>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ink/20 dark:border-cream/20 text-ink dark:text-cream text-xs font-semibold">
              <ThermometerSnowflake className="w-4 h-4" />
              <span>{lang === 'ru' ? 'Зимний контур до −35 °C' : 'Winter-rated to −35 °C'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Interactive 3D Isometric Wall/Roof/Foundation Cut-Away SVG + Pop-up Tooltips */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="relative rounded-2xl bg-forest border border-cream/10 p-4 sm:p-6 overflow-hidden">
              {/* Blueprint subtle grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#EFE9DC_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.07] pointer-events-none" />

              {/* Top Interactive Hint Bar */}
              <div className="relative z-10 flex items-center justify-between text-[11px] text-cream-soft mb-2 px-1">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brass-light" />
                  <span>
                    {lang === 'ru'
                      ? 'Режим рентген-фокуса активен · Выберите слой 01–06'
                      : 'X-Ray Focus Mode active · Select layer 01–06'}
                  </span>
                </span>
                <span className="font-mono text-brass-light font-semibold">
                  {currentSpot.code} / 06
                </span>
              </div>

              {/* 3D SVG Container with Floating Pop-up Tooltip Overlay */}
              <div
                className="relative"
                onMouseLeave={() => setHoveredLayer(null)}
              >
                <svg
                  viewBox="0 0 400 360"
                  className="w-full h-auto select-none"
                  role="img"
                  aria-label="Изометрический 3D-разрез каркасного дома с интерактивными точками"
                >
                  <defs>
                    <filter id="goldLayerGlow" x="-25%" y="-25%" width="150%" height="150%">
                      <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#E6B860" floodOpacity="0.85" />
                      <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#E6B860" floodOpacity="0.45" />
                    </filter>
                  </defs>

                  {/* LAYER 06: Screw Pile Foundation */}
                  <g
                    onMouseEnter={() => setHoveredLayer(5)}
                    onClick={() => {
                      playUiClick('tick');
                      setActiveLayer(5);
                    }}
                    className="cursor-pointer transition-all duration-500"
                    opacity={getLayerOpacity(5)}
                    filter={displayedLayerIndex === 5 ? 'url(#goldLayerGlow)' : undefined}
                  >
                    <path d="M50 280 L200 330 L350 280 L200 245 Z" fill="#1C3A2E" opacity="0.5" />
                    <rect
                      x="120"
                      y="268"
                      width="12"
                      height="65"
                      rx="2"
                      fill="#64748B"
                      stroke={displayedLayerIndex === 5 ? '#E6B860' : '#94A3B8'}
                      strokeWidth={displayedLayerIndex === 5 ? '2.5' : '1'}
                    />
                    <path d="M114 318 L138 324 M115 326 L137 331" stroke="#E6B860" strokeWidth="2" />
                    <rect
                      x="218"
                      y="282"
                      width="14"
                      height="66"
                      rx="2"
                      fill="#64748B"
                      stroke={displayedLayerIndex === 5 ? '#E6B860' : '#94A3B8'}
                      strokeWidth={displayedLayerIndex === 5 ? '2.5' : '1'}
                    />
                    <path d="M210 332 L240 338 M212 340 L238 345" stroke="#E6B860" strokeWidth="2.5" />
                    <rect x="114" y="264" width="24" height="5" rx="1" fill="#334155" />
                    <rect x="212" y="278" width="26" height="5" rx="1" fill="#334155" />
                  </g>

                  {/* LAYER 05: Double Sill Plate & 150x150mm Floor Joists */}
                  <g
                    onMouseEnter={() => setHoveredLayer(4)}
                    onClick={() => {
                      playUiClick('tick');
                      setActiveLayer(4);
                    }}
                    className="cursor-pointer transition-all duration-500"
                    opacity={getLayerOpacity(4)}
                    filter={displayedLayerIndex === 4 ? 'url(#goldLayerGlow)' : undefined}
                  >
                    <polygon
                      points="85,245 215,288 325,248 195,208"
                      fill="#C99A52"
                      stroke={displayedLayerIndex === 4 ? '#E6B860' : '#8C6226'}
                      strokeWidth={displayedLayerIndex === 4 ? '3' : '1.5'}
                    />
                    <polygon
                      points="85,245 215,288 215,270 85,227"
                      fill="#DFB674"
                      stroke="#8C6226"
                      strokeWidth="1.2"
                    />
                    <polygon
                      points="215,288 325,248 325,230 215,270"
                      fill="#B3833D"
                      stroke="#8C6226"
                      strokeWidth="1.2"
                    />
                  </g>

                  {/* LAYER 03: Kiln-Dried Structural Studs 150x50mm */}
                  <g
                    onMouseEnter={() => setHoveredLayer(2)}
                    onClick={() => {
                      playUiClick('tick');
                      setActiveLayer(2);
                    }}
                    className="cursor-pointer transition-all duration-500"
                    opacity={getLayerOpacity(2)}
                    filter={displayedLayerIndex === 2 ? 'url(#goldLayerGlow)' : undefined}
                  >
                    {[110, 155, 200, 245, 290].map((x, idx) => {
                      const yOff = idx * 10 - (idx > 2 ? (idx - 2) * 20 : 0);
                      return (
                        <rect
                          key={x}
                          x={x}
                          y={105 + yOff}
                          width="14"
                          height="135"
                          fill="#E8C994"
                          stroke={displayedLayerIndex === 2 ? '#E6B860' : '#9B7338'}
                          strokeWidth={displayedLayerIndex === 2 ? '2.5' : '1.2'}
                        />
                      );
                    })}
                    <line x1="115" y1="230" x2="210" y2="125" stroke="#D1A662" strokeWidth="8" opacity="0.85" />
                  </g>

                  {/* LAYER 04: Non-Combustible Basalt Wool Insulation */}
                  <g
                    onMouseEnter={() => setHoveredLayer(3)}
                    onClick={() => {
                      playUiClick('tick');
                      setActiveLayer(3);
                    }}
                    className="cursor-pointer transition-all duration-500"
                    opacity={getLayerOpacity(3)}
                    filter={displayedLayerIndex === 3 ? 'url(#goldLayerGlow)' : undefined}
                  >
                    <polygon
                      points="170,132 295,172 295,254 170,214"
                      fill="#3E6E5B"
                      stroke={displayedLayerIndex === 3 ? '#E6B860' : '#264A3C'}
                      strokeWidth={displayedLayerIndex === 3 ? '3' : '1.5'}
                    />
                    <line x1="185" y1="155" x2="280" y2="185" stroke="#89B59F" strokeWidth="1.5" strokeDasharray="6,4" />
                    <line x1="185" y1="180" x2="280" y2="210" stroke="#89B59F" strokeWidth="1.5" strokeDasharray="6,4" />
                    <line x1="185" y1="205" x2="280" y2="235" stroke="#89B59F" strokeWidth="1.5" strokeDasharray="6,4" />
                  </g>

                  {/* LAYER 02: External Cladding + Wind/Vapor Membrane */}
                  <g
                    onMouseEnter={() => setHoveredLayer(1)}
                    onClick={() => {
                      playUiClick('tick');
                      setActiveLayer(1);
                    }}
                    className="cursor-pointer transition-all duration-500"
                    opacity={getLayerOpacity(1)}
                    filter={displayedLayerIndex === 1 ? 'url(#goldLayerGlow)' : undefined}
                  >
                    <polygon
                      points="100,115 205,148 205,250 100,215"
                      fill="#7FB3C2"
                      opacity="0.88"
                      stroke={displayedLayerIndex === 1 ? '#E6B860' : '#4E8291'}
                      strokeWidth={displayedLayerIndex === 1 ? '2.5' : '1'}
                    />
                    <polygon
                      points="82,125 172,155 172,258 82,226"
                      fill="#F6E3C0"
                      stroke={displayedLayerIndex === 1 ? '#E6B860' : '#C99A52'}
                      strokeWidth={displayedLayerIndex === 1 ? '3' : '1.5'}
                    />
                    {[145, 165, 185, 205, 225].map((y) => (
                      <line key={y} x1="82" y1={y} x2="172" y2={y + 30} stroke="#C99A52" strokeWidth="1.2" />
                    ))}
                  </g>

                  {/* LAYER 01: Metal Tile Roofing System */}
                  <g
                    onMouseEnter={() => setHoveredLayer(0)}
                    onClick={() => {
                      playUiClick('tick');
                      setActiveLayer(0);
                    }}
                    className="cursor-pointer transition-all duration-500"
                    opacity={getLayerOpacity(0)}
                    filter={displayedLayerIndex === 0 ? 'url(#goldLayerGlow)' : undefined}
                  >
                    <polygon
                      points="65,112 200,26 335,112 210,148"
                      fill="#2F5A4B"
                      stroke={displayedLayerIndex === 0 ? '#E6B860' : '#1E3F33'}
                      strokeWidth={displayedLayerIndex === 0 ? '3' : '1.5'}
                    />
                    <line x1="110" y1="85" x2="235" y2="122" stroke="#4D8C76" strokeWidth="2" />
                    <line x1="140" y1="65" x2="265" y2="102" stroke="#4D8C76" strokeWidth="2" />
                    <line x1="170" y1="45" x2="295" y2="82" stroke="#4D8C76" strokeWidth="2" />
                  </g>

                  {/* INTERACTIVE NUMBERED HOTSPOT PINS (01 - 06) */}
                  {HOTSPOTS.map((spot) => {
                    const isFocused = displayedLayerIndex === spot.id;
                    const isHovered = hoveredLayer === spot.id;
                    return (
                      <g
                        key={spot.id}
                        onMouseEnter={() => {
                          playUiClick('tick');
                          setHoveredLayer(spot.id);
                        }}
                        onClick={() => {
                          playUiClick('tap');
                          setActiveLayer(spot.id);
                        }}
                        className="cursor-pointer transition-opacity duration-300"
                        opacity={isFocused ? 1 : focusMode ? 0.65 : 0.9}
                      >
                        {/* Outer animated halo ring when active or hovered */}
                        {isFocused && (
                          <>
                            <circle
                              cx={spot.pinX}
                              cy={spot.pinY}
                              r={isHovered ? '24' : '20'}
                              fill="#E6B860"
                              opacity={isHovered ? '0.38' : '0.24'}
                              className="transition-all duration-300"
                            />
                            <circle
                              cx={spot.pinX}
                              cy={spot.pinY}
                              r="17"
                              fill="none"
                              stroke="#E6B860"
                              strokeWidth="1.2"
                              strokeDasharray="3,3"
                            />
                          </>
                        )}
                        <circle
                          cx={spot.pinX}
                          cy={spot.pinY}
                          r={isFocused ? '14' : '12'}
                          fill={isFocused ? '#E6B860' : '#142E25'}
                          stroke="#E6B860"
                          strokeWidth="2"
                          className="transition-all duration-200"
                        />
                        <text
                          x={spot.pinX}
                          y={spot.pinY + 4}
                          textAnchor="middle"
                          fill={isFocused ? '#1E1705' : '#FFFFFF'}
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="JetBrains Mono, monospace"
                        >
                          {spot.code}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* POP-UP TOOLTIP OVERLAY ON 3D CUTAWAY */}
                <AnimatePresence mode="wait">
                  {hoveredLayer !== null && (
                    // Outer div owns positioning (Motion would overwrite a transform set on the animated element)
                    <div
                      key={`tooltip-${currentSpot.id}`}
                      style={getTooltipPositionStyle(currentSpot)}
                      className="hidden sm:block absolute z-30 w-80 pointer-events-none [--tip-half:10rem]"
                    >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.94, y: 4 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="p-4 rounded-2xl bg-forest/95 backdrop-blur-xl border border-cream/20 shadow-2xl text-cream space-y-2.5">
                        {/* Header row: Code + GOST + Lifespan (wraps instead of clipping) */}
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 border-b border-white/10 pb-2">
                          <span className="inline-flex min-w-0 items-center gap-1.5 font-mono text-[11px] font-bold leading-snug text-brass-light">
                            <span className="shrink-0 w-5 h-5 rounded-md bg-cream text-forest flex items-center justify-center text-[10px]">
                              {currentSpot.code}
                            </span>
                            <span className="break-words">{currentSpot.gost}</span>
                          </span>
                          <span className="shrink-0 whitespace-nowrap text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cream/10 text-cream-soft">
                            {currentSpot.lifespan[lang]}
                          </span>
                        </div>

                        {/* Title */}
                        <div>
                          <h5 className="font-serif text-base sm:text-lg text-cream leading-snug break-words">
                            {currentSpot.title[lang]}
                          </h5>
                          <p className="text-[11px] text-cream-soft mt-0.5 leading-snug">
                            {currentSpot.subtitle[lang]}
                          </p>
                        </div>

                        {/* 3 Technical Specification Metrics: label above value, full text wraps */}
                        <dl className="grid grid-cols-1 gap-2.5 bg-cream/5 p-3 rounded-xl border border-cream/10">
                          <div>
                            <dt className="text-[10px] leading-tight text-cream-soft">
                              {lang === 'ru' ? 'Сечение / Контур' : 'Section'}
                            </dt>
                            <dd className="mt-0.5 font-mono text-xs font-semibold leading-snug text-brass-light break-words">
                              {currentSpot.metrics.thickness[lang]}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] leading-tight text-cream-soft">
                              {lang === 'ru' ? 'Стандарт / Марка' : 'Grade'}
                            </dt>
                            <dd className="mt-0.5 text-xs font-semibold leading-snug text-white break-words">
                              {currentSpot.metrics.densityOrGrade[lang]}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] leading-tight text-cream-soft">
                              {lang === 'ru' ? 'Показатель' : 'Rating'}
                            </dt>
                            <dd className="mt-0.5 font-mono text-xs leading-snug text-brass-light break-words">
                              {currentSpot.metrics.thermalOrLoad[lang]}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </motion.div>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Persistent Active Hotspot Technical Summary Dock */}
              <div className="mt-3 p-4 rounded-xl bg-cream/5 border border-cream/15 text-cream">
                <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 mb-1.5">
                  <span className="min-w-0 font-mono text-xs font-bold leading-snug text-brass-light break-words">
                    УЗЕЛ {currentSpot.code} · {currentSpot.gost}
                  </span>
                  <span className="shrink-0 whitespace-nowrap text-[11px] px-2.5 py-0.5 rounded-full bg-brass/20 text-brass-light font-semibold">
                    {currentSpot.lifespan[lang]}
                  </span>
                </div>
                <h4 className="font-serif text-2xl leading-tight text-cream">
                  {currentSpot.title[lang]}
                </h4>
                <p className="text-xs text-cream-soft mt-1 leading-relaxed">
                  {currentSpot.spec[lang]}
                </p>

                {/* Inline Mini Specs Pills */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-[11px]">
                  <div className="bg-black/25 px-2.5 py-1.5 rounded-lg">
                    <span className="text-cream-soft block text-[10px]">
                      {lang === 'ru' ? 'Толщина / Сечение' : 'Dimensions'}
                    </span>
                    <span className="block font-mono font-semibold leading-snug text-brass-light break-words">
                      {currentSpot.metrics.thickness[lang]}
                    </span>
                  </div>
                  <div className="bg-black/25 px-2.5 py-1.5 rounded-lg">
                    <span className="text-cream-soft block text-[10px]">
                      {lang === 'ru' ? 'Материал и класс' : 'Material Grade'}
                    </span>
                    <span className="block font-semibold leading-snug text-white break-words">
                      {currentSpot.metrics.densityOrGrade[lang]}
                    </span>
                  </div>
                  <div className="bg-black/25 px-2.5 py-1.5 rounded-lg">
                    <span className="text-cream-soft block text-[10px]">
                      {lang === 'ru' ? 'Инженерный допуск' : 'Engineering Spec'}
                    </span>
                    <span className="block font-mono leading-snug text-brass-light break-words">
                      {currentSpot.metrics.thermalOrLoad[lang]}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 6-Layer Selector List with Hover Synchronization */}
          <div
            className="lg:col-span-6 space-y-3"
            onMouseLeave={() => setHoveredLayer(null)}
          >
            {HOTSPOTS.map((spot) => {
              const isSelected = displayedLayerIndex === spot.id;
              return (
                <button
                  key={spot.id}
                  onMouseEnter={() => setHoveredLayer(spot.id)}
                  onClick={() => {
                    playUiClick('tap');
                    setActiveLayer(spot.id);
                  }}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 ${
                    isSelected
                      ? 'bg-ink text-paper border-ink dark:bg-cream dark:text-forest dark:border-cream shadow-lg -translate-y-0.5'
                      : 'bg-transparent border-ink/12 dark:border-cream/10 hover:border-ink/40 dark:hover:border-cream/40 text-ink dark:text-cream'
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded-xl font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isSelected
                        ? 'bg-brass text-[#1E1705]'
                        : 'bg-brass/15 text-brass-ink dark:text-brass-light'
                    }`}
                  >
                    {spot.code}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3
                        className={`font-serif text-lg sm:text-xl leading-snug ${
                          isSelected ? 'text-paper dark:text-forest' : 'text-ink dark:text-cream'
                        }`}
                      >
                        {spot.title[lang]}
                      </h3>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ${
                          isSelected
                            ? 'bg-paper/10 text-brass-light dark:bg-forest/10 dark:text-brass-ink'
                            : 'border border-ink/15 dark:border-cream/15 text-olive dark:text-cream-soft'
                        }`}
                      >
                        {spot.gost}
                      </span>
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        isSelected ? 'text-paper/80 dark:text-forest/80' : 'text-ink-soft dark:text-cream-soft'
                      }`}
                    >
                      {spot.subtitle[lang]}
                    </p>
                    <div
                      className={`mt-2 pt-2 border-t flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono ${
                        isSelected
                          ? 'border-paper/15 text-brass-light dark:border-forest/15 dark:text-brass-ink'
                          : 'border-ink/12 dark:border-cream/10 text-olive dark:text-cream-soft'
                      }`}
                    >
                      <span>{spot.metrics.thickness[lang]}</span>
                      <span>·</span>
                      <span>{spot.metrics.thermalOrLoad[lang]}</span>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Bottom GOST verification note */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-olive dark:text-cream-soft px-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brass-ink dark:text-brass-light" />
                {lang === 'ru'
                  ? 'Все пиломатериалы проходят входной влагомерный контроль (≤ 14%)'
                  : 'All timber undergoes strict moisture inspection (≤ 14%)'}
              </span>
              <span className="font-mono text-brass-ink dark:text-brass-light">ГОСТ 8486-86</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

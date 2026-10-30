export type Language = 'ru' | 'en';
export type Theme = 'light' | 'dark';

export type HouseRoofStyle =
  | 'gable'
  | 'chalet'
  | 'aframe'
  | 'barn'
  | 'hip'
  | 'glassv'
  | 'two'
  | 'mans';

export interface HouseItem {
  id: string;
  name: {
    ru: string;
    en: string;
  };
  price: number; // in thousands (e.g. 498 means 498,000 ₽)
  style: HouseRoofStyle;
  area: number; // m²
  dimensions: string;
  floors: number;
  imageWebp: string; // Optimized .webp asset path
  webpSizeKb?: number;
  highlight?: {
    ru: string;
    en: string;
  };
  description: {
    ru: string;
    en: string;
  };
  specs: {
    ru: string[];
    en: string[];
  };
}

export interface CalculatorConfig {
  size: number; // 16, 36, 48, 54
  insulation: number; // 0 (100mm), 35 (150mm), 70 (200mm)
  foundation: number; // 1 (piles -50% = 90k), 0 (own foundation = 0)
  veranda: number; // 0 (without), 1 (with veranda = 60k)
  mortgageMode: boolean;
  downPaymentPercent: number; // e.g. 20%
  mortgageYears: number; // 1 to 20
}

export interface QuizQuestion {
  id: number;
  question: {
    ru: string;
    en: string;
  };
  hint?: {
    ru: string;
    en: string;
  };
  options: {
    ru: string;
    en: string;
  }[];
}

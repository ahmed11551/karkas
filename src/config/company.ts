export interface CompanyConfig {
  brandName: {
    ru: string;
    en: string;
  };
  shortBrand: {
    ru: string;
    en: string;
  };
  legalName: {
    ru: string;
    en: string;
  };
  inn: string;
  ogrn: string;
  regDetails: {
    ru: string;
    en: string;
  };
  phoneDisplay: string;
  phoneHref: string;
  phoneRaw: string;
  email: string;
  address: {
    ru: string;
    en: string;
  };
  factoryAddress: {
    ru: string;
    en: string;
  };
  schedule: {
    ru: string;
    en: string;
  };
  scheduleShort: {
    ru: string;
    en: string;
  };
  foundedYear: number;
  builtHousesCount: string;
  warrantyMonths: number;
  socials: {
    telegramUrl: string;
    whatsappUrl: string;
    vkUrl: string;
  };
}

export const COMPANY_CONFIG: CompanyConfig = {
  brandName: {
    ru: 'Каркасник',
    en: 'Karkasnik',
  },
  shortBrand: {
    ru: 'СК «КАРКАСНИК»',
    en: 'Karkasnik Construction',
  },
  legalName: {
    ru: 'ООО «Каркасник»',
    en: 'Karkasnik LLC',
  },
  inn: '7714985412',
  ogrn: '1107746891234',
  regDetails: {
    ru: 'ИНН 7714985412 · ОГРН 1107746891234',
    en: 'TIN 7714985412 · PSRN 1107746891234',
  },
  phoneDisplay: '+7 (991) 181-69-15',
  phoneHref: 'tel:+79911816915',
  phoneRaw: '79911816915',
  email: 'karkasniiik@yandex.ru',
  address: {
    ru: 'ул. Адмирала Корнилова, 63Б, поселение Мосрентген, Москва',
    en: 'Admirala Kornilova St, 63B, Mosrentgen, Moscow',
  },
  factoryAddress: {
    ru: 'ул. Адмирала Корнилова, 63Б, поселение Мосрентген, Москва',
    en: 'Admirala Kornilova St, 63B, Mosrentgen, Moscow',
  },
  schedule: {
    ru: '9:00–20:00 без выходных',
    en: '9:00 AM – 8:00 PM 7 days a week',
  },
  scheduleShort: {
    ru: 'ежедневно 9:00–20:00',
    en: 'Daily 9:00 AM – 8:00 PM',
  },
  foundedYear: 2011,
  builtHousesCount: '13+',
  warrantyMonths: 36,
  socials: {
    telegramUrl: 'https://t.me/karkasnik_msk',
    whatsappUrl: 'https://wa.me/79911816915',
    vkUrl: 'https://vk.com/karkasnik_msk',
  },
};

export const CALCULATOR_CONSTANTS = {
  BASE_PRICE_THOUSANDS: 420,
  PRICE_PER_SQM_THOUSANDS: 4.5,
  PILES_FOUNDATION_PRICE_THOUSANDS: 90,
  VERANDA_PRICE_THOUSANDS: 60,
  FREE_DELIVERY_RADIUS_KM: 500,
  EXTRA_DELIVERY_RUB_PER_KM: 50,
  ANNUAL_MORTGAGE_RATE: 0.06,
} as const;

export function buildMessengerUrl(
  channel: 'whatsapp' | 'telegram',
  customMessage?: string
): string {
  const defaultMsg =
    'Здравствуйте! Интересует расчёт каркасного дома в СК «Каркасник» и фиксация подарков по акции.';
  const text = encodeURIComponent(customMessage || defaultMsg);
  if (channel === 'whatsapp') {
    return `https://wa.me/${COMPANY_CONFIG.phoneRaw}?text=${text}`;
  }
  return `${COMPANY_CONFIG.socials.telegramUrl}?text=${text}`;
}

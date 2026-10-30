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
  phoneDisplay: '+7 (495) 152-02-42',
  phoneHref: 'tel:+74951520242',
  phoneRaw: '74951520242',
  email: 'info@karkasnik.ru',
  address: {
    ru: 'г. Москва, Варшавское шоссе, д. 42, оф. 310',
    en: 'Moscow, Varshavskoye Hwy, 42, Suite 310',
  },
  factoryAddress: {
    ru: 'Московская область, г.о. Домодедово, промзона «Житнево»',
    en: 'Moscow Region, Domodedovo, Zhitnevo Industrial Park',
  },
  schedule: {
    ru: '9:00–20:00 без выходных',
    en: '9:00 AM – 8:00 PM 7 days a week',
  },
  scheduleShort: {
    ru: 'ежедневно 9:00–20:00',
    en: 'Daily 9:00 AM – 8:00 PM',
  },
  foundedYear: 2010,
  builtHousesCount: '38 000+',
  warrantyMonths: 12,
  socials: {
    telegramUrl: 'https://t.me/karkasnik_msk',
    whatsappUrl: 'https://wa.me/74951520242',
    vkUrl: 'https://vk.com/karkasnik_msk',
  },
};

export const CALCULATOR_CONSTANTS = {
  BASE_PRICE_THOUSANDS: 420,
  PRICE_PER_SQM_THOUSANDS: 4.5,
  PILES_FOUNDATION_PRICE_THOUSANDS: 90,
  VERANDA_PRICE_THOUSANDS: 60,
  FREE_DELIVERY_RADIUS_KM: 100,
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

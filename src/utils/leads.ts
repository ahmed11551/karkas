export interface StoredLead {
  id: string;
  timestamp: string;
  source: 'hero_quick' | 'quiz_modal' | 'calculator' | 'catalog_spec';
  phone: string;
  houseTitle?: string;
  calculatedPrice?: number;
  giftsSelected?: string[];
  quizAnswers?: { [key: number]: string };
}

const STORAGE_KEY = 'karkasnik_leads_archive';

export const saveLead = (lead: Omit<StoredLead, 'id' | 'timestamp'>): StoredLead => {
  const newLead: StoredLead = {
    ...lead,
    id: 'LD-' + Date.now().toString(36).toUpperCase(),
    timestamp: new Date().toLocaleString('ru-RU', {
      dateStyle: 'short',
      timeStyle: 'short',
    }),
  };

  try {
    const existing = getStoredLeads();
    const updated = [newLead, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('leads_updated'));
  } catch {
    // ignore storage quota errors
  }

  return newLead;
};

export const getStoredLeads = (): StoredLead[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with 2 demo leads so the dashboard is immediately demonstrable
      const demo: StoredLead[] = [
        {
          id: 'LD-92X1A',
          timestamp: '30.10.2026, 11:24',
          source: 'calculator',
          phone: '+7 (916) 482-19-40',
          houseTitle: 'Дачный дом 6×6',
          calculatedPrice: 707000,
          giftsSelected: ['Металлочерепица 0 ₽', 'Сваи −50%', 'Шпунтованный пол'],
        },
        {
          id: 'LD-88K0F',
          timestamp: '30.10.2026, 09:15',
          source: 'quiz_modal',
          phone: '+7 (926) 773-04-12',
          houseTitle: 'Дом с панорамной верандой',
          calculatedPrice: 580000,
          giftsSelected: ['Металлочерепица 0 ₽', 'Сборка за 1-3 дня', 'Электрообогреватель'],
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
      return demo;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const exportLeadsCsv = (leads: StoredLead[]) => {
  const headers = ['ID', 'Дата', 'Источник', 'Телефон', 'Проект', 'Сумма (₽)', 'Бонусы'];
  const rows = leads.map((l) => [
    l.id,
    `"${l.timestamp}"`,
    l.source,
    `"${l.phone}"`,
    `"${l.houseTitle || 'Индивидуальный'}"`,
    l.calculatedPrice || 0,
    `"${(l.giftsSelected || []).join('; ')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `leads_karkasnik_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

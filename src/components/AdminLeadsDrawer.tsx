import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Download,
  Trash2,
  Shield,
  Phone,
  Clock,
  MessageCircle,
  Search,
  ArrowUpDown,
  Eye,
  LogOut,
  CheckCircle2,
  FileText,
  Sparkles,
  Terminal,
  Copy,
  Check,
  History,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import {
  StoredLead,
  LeadStatus,
  fetchProtectedLeads,
  updateLeadOnServer,
  deleteLeadOnServer,
  exportLeadsCsv,
  logoutAdmin,
  testUnauthorizedRequest,
  normalizeLeadStatus,
} from '../utils/leads';
import { COMPANY_CONFIG } from '../config/company';
import { playUiClick } from '../utils/sound';

interface AdminLeadsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  initialSelectedLeadId?: string | null;
}

const STATUS_META: Record<
  LeadStatus,
  { label: string; enLabel: string; badgeClass: string; activeBtnClass: string }
> = {
  new: {
    label: 'Новый (New)',
    enLabel: 'New',
    badgeClass: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
    activeBtnClass: 'bg-amber-500 text-neutral-950 border-amber-500 font-bold',
  },
  contacted: {
    label: 'Связались (Contacted)',
    enLabel: 'Contacted',
    badgeClass: 'bg-sky-500/15 text-sky-600 border-sky-500/30',
    activeBtnClass: 'bg-sky-500 text-white border-sky-500 font-bold',
  },
  negotiation: {
    label: 'Переговоры (Negotiation)',
    enLabel: 'Negotiation',
    badgeClass: 'bg-indigo-500/15 text-indigo-600 border-indigo-500/30',
    activeBtnClass: 'bg-indigo-600 text-white border-indigo-600 font-bold',
  },
  contract: {
    label: 'Договор (Contract)',
    enLabel: 'Contract',
    badgeClass: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
    activeBtnClass: 'bg-purple-600 text-white border-purple-600 font-bold',
  },
  completed: {
    label: 'Завершен / Сдан (Completed)',
    enLabel: 'Completed',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
    activeBtnClass: 'bg-emerald-600 text-white border-emerald-600 font-bold',
  },
};

const ALL_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'negotiation',
  'contract',
  'completed',
];

type LeadSource = StoredLead['source'];

const SOURCE_LABELS: Record<LeadSource, string> = {
  hero_quick: 'Быстрая заявка',
  quiz_modal: 'Квиз',
  calculator: 'Калькулятор',
  catalog_spec: 'Каталог',
};

const dayStartMs = (value: string) => new Date(`${value}T00:00:00`).getTime();
const dayEndMs = (value: string) => new Date(`${value}T23:59:59.999`).getTime();

export const AdminLeadsDrawer: React.FC<AdminLeadsDrawerProps> = ({
  isOpen,
  onClose,
  onLogout,
  initialSelectedLeadId,
}) => {
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'price_desc'>('newest');
  const [sourceFilter, setSourceFilter] = useState<'all' | LeadSource>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedLead, setSelectedLead] = useState<StoredLead | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [forbiddenError, setForbiddenError] = useState<string | null>(null);
  const [apiTestToast, setApiTestToast] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  const loadLeadsFromApi = async () => {
    const res = await fetchProtectedLeads();
    if (res.status === 403) {
      setForbiddenError(res.error || '403 Forbidden: Access denied without valid admin_token');
      setLeads([]);
      return;
    }
    setForbiddenError(null);
    setLeads(res.leads);

    if (initialSelectedLeadId) {
      const found = res.leads.find((l) => l.id === initialSelectedLeadId);
      if (found) {
        setSelectedLead(found);
        setNotesDraft(found.managerNotes || '');
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadLeadsFromApi();
    }
    const handleUpdate = () => {
      if (isOpen) loadLeadsFromApi();
    };
    window.addEventListener('leads_updated', handleUpdate);
    return () => window.removeEventListener('leads_updated', handleUpdate);
  }, [isOpen, initialSelectedLeadId]);

  // Filtered and sorted leads
  const filteredLeads = useMemo(() => {
    const fromMs = dateFrom ? dayStartMs(dateFrom) : null;
    const toMs = dateTo ? dayEndMs(dateTo) : null;
    const q = search.trim().toLowerCase();

    const list = leads.filter((l) => {
      const currentStatus = normalizeLeadStatus(l.status);
      if (statusFilter !== 'all' && currentStatus !== statusFilter) return false;
      if (sourceFilter !== 'all' && l.source !== sourceFilter) return false;
      if (fromMs !== null || toMs !== null) {
        if (!l.createdAtMs) return false;
        if (fromMs !== null && l.createdAtMs < fromMs) return false;
        if (toMs !== null && l.createdAtMs > toMs) return false;
      }
      if (!q) return true;
      const inPhone = l.phone.toLowerCase().includes(q);
      const inName = (l.clientName || '').toLowerCase().includes(q);
      const inHouse = (l.houseTitle || '').toLowerCase().includes(q);
      const inId = l.id.toLowerCase().includes(q);
      const inNotes = (l.managerNotes || '').toLowerCase().includes(q);
      return inPhone || inName || inHouse || inId || inNotes;
    });

    return [...list].sort((a, b) => {
      if (sortOrder === 'price_desc') {
        return (b.calculatedPrice || 0) - (a.calculatedPrice || 0);
      }
      const timeA = a.createdAtMs || 0;
      const timeB = b.createdAtMs || 0;
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [leads, search, statusFilter, sourceFilter, dateFrom, dateTo, sortOrder]);

  const hasActiveFilters =
    search.trim() !== '' || statusFilter !== 'all' || sourceFilter !== 'all' || dateFrom !== '' || dateTo !== '';

  const resetFilters = () => {
    playUiClick('tick');
    setSearch('');
    setStatusFilter('all');
    setSourceFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  if (!isOpen) return null;

  const handleStatusChange = async (lead: StoredLead, newStatus: LeadStatus) => {
    playUiClick('tick');
    const updated = await updateLeadOnServer(lead.id, { status: newStatus });
    if (updated) {
      setLeads((prev) =>
        prev.map((item) => (item.id === lead.id ? { ...item, status: newStatus } : item))
      );
      if (selectedLead?.id === lead.id) {
        setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    playUiClick('tap');
    const updated = await updateLeadOnServer(selectedLead.id, { managerNotes: notesDraft });
    if (!updated) return;
    setLeads((prev) =>
      prev.map((item) =>
        item.id === selectedLead.id ? { ...item, managerNotes: notesDraft } : item
      )
    );
    setSelectedLead((prev) => (prev ? { ...prev, managerNotes: notesDraft } : null));
  };

  const handleDeleteLead = async (id: string) => {
    playUiClick('tick');
    const removed = await deleteLeadOnServer(id);
    if (!removed) return;
    setLeads((prev) => prev.filter((l) => l.id !== id));
    if (selectedLead?.id === id) setSelectedLead(null);
  };

  const buildWhatsAppUrl = (lead: StoredLead) => {
    let digits = lead.phone.replace(/\D/g, '');
    if (digits.startsWith('8') && digits.length === 11) {
      digits = '7' + digits.slice(1);
    }
    if (!digits || digits.length < 10) {
      digits = COMPANY_CONFIG.phoneRaw;
    }
    const sizeText = lead.calculatorParams?.size ? `${lead.calculatorParams.size} м²` : '36 м²';
    const insText = lead.calculatorParams?.insulation || '150 мм';
    const priceText = lead.calculatedPrice
      ? `${lead.calculatedPrice.toLocaleString('ru-RU')} ₽`
      : 'по смете';

    const message = `Здравствуйте${lead.clientName ? `, ${lead.clientName}` : ''}! Это инженер компании «Каркасник». Вижу вашу заявку ${lead.id}: проект «${lead.houseTitle || 'Каркасный дом'}» (${sizeText}, утепление ${insText}) на сумму ≈ ${priceText}. Подскажите, когда удобно обсудить детали участка и закрепить 4 подарка?`;
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  };

  const buildManagerScript = (lead: StoredLead) => {
    const size = lead.calculatorParams?.size || 36;
    const ins = lead.calculatorParams?.insulation || '150 мм (Осень-Зима)';
    const found = lead.calculatorParams?.foundation || 'Свайно-винтовой (−50%)';
    const ver = lead.calculatorParams?.veranda || 'Без веранды';
    const price = (lead.calculatedPrice || 707000).toLocaleString('ru-RU');
    return `«Здравствуйте! Вижу ваш расчет на сайте: проект "${lead.houseTitle || 'Дачный дом'}", площадь ${size} м², утепление ${ins}, фундамент: ${found}, комплектация: ${ver}. Итоговая зафиксированная смета составляет ${price} ₽ вместе с металлочерепицей в подарок. Давайте проверим подъездные пути к вашему участку!»`;
  };

  const handleTest403 = async () => {
    playUiClick('tick');
    const res = await testUnauthorizedRequest();
    setApiTestToast(`Аудит запроса без токена → HTTP ${res.status}: ${res.message}`);
    setTimeout(() => setApiTestToast(null), 5000);
  };

  const counts = {
    all: leads.length,
    new: leads.filter((l) => normalizeLeadStatus(l.status) === 'new').length,
    contacted: leads.filter((l) => normalizeLeadStatus(l.status) === 'contacted').length,
    negotiation: leads.filter((l) => normalizeLeadStatus(l.status) === 'negotiation').length,
    contract: leads.filter((l) => normalizeLeadStatus(l.status) === 'contract').length,
    completed: leads.filter((l) => normalizeLeadStatus(l.status) === 'completed').length,
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="CRM-Панель управления лидами"
      data-lenis-prevent
      className="fixed inset-0 z-50 flex justify-end bg-forest/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-paper text-ink w-full max-w-7xl h-full shadow-2xl border-l border-ink/15 p-4 sm:p-7 flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top CRM Header */}
        <div className="pb-4 border-b border-ink/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-forest text-brass-light flex items-center justify-center border border-forest">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl text-ink ">
                  CRM-Система · Реестр заявок отдела продаж
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-mono text-[10px] font-bold border border-emerald-500/30">
                  СЕССИЯ ПОДТВЕРЖДЕНА
                </span>
              </div>
              <p className="text-xs text-olive ">
                Защищенный контур {COMPANY_CONFIG.legalName.ru} · Синхронизация API + резервный архив · Всего заявок: {leads.length}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTest403}
              className="px-3 py-1.5 rounded-xl bg-ink/10 hover:bg-ink/15 text-ink-soft text-xs font-mono flex items-center gap-1.5 transition-colors"
              title="Проверить ответ сервера 403 Forbidden при запросе без токена"
            >
              <Terminal className="w-3.5 h-3.5 text-brass-ink " />
              <span>Аудит 403 API</span>
            </button>

            <button
              onClick={() => {
                playUiClick('tick');
                exportLeadsCsv(filteredLeads);
              }}
              disabled={filteredLeads.length === 0}
              title="Экспорт заявок, которые видны с текущими фильтрами"
              className="px-3.5 py-1.5 rounded-xl bg-ink hover:bg-ink-soft disabled:opacity-40 disabled:cursor-not-allowed text-paper text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Экспорт CSV ({filteredLeads.length})</span>
            </button>

            <button
              onClick={() => {
                playUiClick('tap');
                void logoutAdmin().then(() => {
                  onLogout();
                  onClose();
                });
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Выйти и удалить кнопку CRM из DOM"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Выйти</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-olive hover:text-ink "
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 403 Diagnostic Toast Banner */}
        {apiTestToast && (
          <div className="mt-3 p-3 rounded-2xl bg-forest text-emerald-400 font-mono text-xs flex items-center justify-between border border-emerald-500/30">
            <span>🛡️ {apiTestToast}</span>
            <button onClick={() => setApiTestToast(null)} className="text-cream-soft hover:text-cream">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter Bar: 5-Stage Status Pipeline Tabs + Search + Date/Price Sort */}
        <div className="my-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'all', label: 'Все', count: counts.all },
                { id: 'new', label: 'Новые (New)', count: counts.new },
                { id: 'contacted', label: 'Связались (Contacted)', count: counts.contacted },
                { id: 'negotiation', label: 'Переговоры (Negotiation)', count: counts.negotiation },
                { id: 'contract', label: 'Договор (Contract)', count: counts.contract },
                { id: 'completed', label: 'Сдан (Completed)', count: counts.completed },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  playUiClick('tick');
                  setStatusFilter(tab.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                  statusFilter === tab.id
                    ? 'bg-ink text-paper border-ink shadow-sm'
                    : 'bg-white/70 text-ink-soft border-ink/15 '
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-md bg-black/10 font-mono text-[10px]">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-olive absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Поиск по заявкам"
                placeholder="Поиск по имени, телефону, проекту, заметкам, ID..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-ink/15 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brass/50"
              />
            </div>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as 'all' | LeadSource)}
              aria-label="Фильтр по источнику заявки"
              className="px-3 py-2 rounded-xl bg-white border border-ink/15 text-xs font-semibold text-ink-soft focus:outline-none focus:ring-2 focus:ring-brass/50"
            >
              <option value="all">Все источники</option>
              {(Object.keys(SOURCE_LABELS) as LeadSource[]).map((src) => (
                <option key={src} value={src}>
                  {SOURCE_LABELS[src]}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-1.5 text-xs text-ink-soft">
              <span className="sr-only sm:not-sr-only">с</span>
              <input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => setDateFrom(e.target.value)}
                aria-label="Заявки с даты"
                className="px-2.5 py-2 rounded-xl bg-white border border-ink/15 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brass/50"
              />
            </label>
            <label className="flex items-center gap-1.5 text-xs text-ink-soft">
              <span className="sr-only sm:not-sr-only">по</span>
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
                aria-label="Заявки по дату"
                className="px-2.5 py-2 rounded-xl bg-white border border-ink/15 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brass/50"
              />
            </label>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2 rounded-xl bg-ink/10 hover:bg-ink/15 text-xs font-semibold text-ink-soft flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Сбросить</span>
              </button>
            )}

            <button
              onClick={() => {
                playUiClick('tick');
                setSortOrder((prev) =>
                  prev === 'newest' ? 'oldest' : prev === 'oldest' ? 'price_desc' : 'newest'
                );
              }}
              className="px-3 py-2 rounded-xl bg-white border border-ink/15 text-xs font-semibold text-ink-soft flex items-center gap-1.5 hover:border-brass transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-brass-ink " />
              <span>
                {sortOrder === 'newest'
                  ? 'Дата: сначала новые'
                  : sortOrder === 'oldest'
                    ? 'Дата: сначала старые'
                    : 'По сумме сметы'}
              </span>
            </button>
          </div>
        </div>

        {/* Main Workspace Split: Lead Table + Detail View Side Panel */}
        {forbiddenError ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 max-w-md space-y-3">
              <div className="font-mono text-2xl font-bold text-rose-500">403 FORBIDDEN</div>
              <p className="text-xs text-ink-soft ">{forbiddenError}</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden min-h-0">
            {/* Left / Main Column: Detailed CRM Lead Table */}
            <div
              className={`${
                selectedLead ? 'lg:col-span-7' : 'lg:col-span-12'
              } overflow-y-auto rounded-2xl border border-ink/15 bg-white/60 `}
            >
              {filteredLeads.length === 0 ? (
                <div className="py-16 text-center text-xs text-olive">
                  По выбранным фильтрам заявок не найдено
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 z-10 bg-paper-deep backdrop-blur-md text-[11px] uppercase tracking-wider text-olive border-b border-ink/15 ">
                    <tr>
                      <th className="py-3 px-3.5">Дата (Date)</th>
                      <th className="py-3 px-3.5">Телефон (Phone)</th>
                      <th className="py-3 px-3.5">Проект (Project Name)</th>
                      <th className="py-3 px-3.5">Параметры (Size / Insulation)</th>
                      <th className="py-3 px-3.5">Статус (Status)</th>
                      <th className="py-3 px-3.5 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/15 ">
                    {filteredLeads.map((lead) => {
                      const st: LeadStatus = normalizeLeadStatus(lead.status);
                      const isSelected = selectedLead?.id === lead.id;

                      return (
                        <tr
                          key={lead.id}
                          onClick={() => {
                            playUiClick('tick');
                            setSelectedLead(lead);
                            setNotesDraft(lead.managerNotes || '');
                          }}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-brass/15'
                              : 'hover:bg-paper-deep '
                          }`}
                        >
                          {/* Col 1: Date & ID */}
                          <td className="py-3.5 px-3.5 align-top whitespace-nowrap">
                            <span className="font-mono font-bold text-brass-ink block">
                              {lead.id}
                            </span>
                            <span className="text-[11px] text-olive flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {lead.timestamp}
                            </span>
                          </td>

                          {/* Col 2: Phone & Name */}
                          <td className="py-3.5 px-3.5 align-top">
                            <div className="font-semibold text-ink ">
                              {lead.clientName || 'Клиент сайта'}
                            </div>
                            <a
                              href={`tel:${lead.phone.replace(/\D/g, '')}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-ink-soft hover:text-brass-ink font-mono text-[11px] inline-flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="w-3 h-3 text-brass-ink" />
                              <span>{lead.phone}</span>
                            </a>
                          </td>

                          {/* Col 3: Selected Project & Price */}
                          <td className="py-3.5 px-3.5 align-top">
                            <div className="font-semibold text-ink ">
                              {lead.houseTitle || 'Индивидуальный расчёт'}
                            </div>
                            {lead.calculatedPrice && (
                              <span className="font-mono font-bold text-ink text-xs mt-0.5 block">
                                ≈ {lead.calculatedPrice.toLocaleString('ru-RU')} ₽
                              </span>
                            )}
                          </td>

                          {/* Col 4: Calculator Choices (Size, Insulation, Foundation, Veranda) */}
                          <td className="py-3.5 px-3.5 align-top">
                            {lead.calculatorParams ? (
                              <div className="flex flex-wrap gap-1">
                                <span className="px-2 py-0.5 rounded-md bg-ink/10 text-ink font-mono text-[10px] font-semibold">
                                  {lead.calculatorParams.size} м²
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 font-mono text-[10px]">
                                  {lead.calculatorParams.insulation}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-brass-ink text-[10px]">
                                  {lead.calculatorParams.veranda}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-olive">
                                36 м² · 150 мм (Осень-Зима)
                              </span>
                            )}
                          </td>

                          {/* Col 5: Status Dropdown (New -> Contacted -> Negotiation -> Contract -> Completed) */}
                          <td
                            className="py-3.5 px-3.5 align-top"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="relative inline-block w-44">
                              <select
                                value={st}
                                onChange={(e) =>
                                  handleStatusChange(lead, e.target.value as LeadStatus)
                                }
                                aria-label={`Статус заявки ${lead.id}`}
                                className={`w-full appearance-none pl-2.5 pr-7 py-1.5 rounded-xl text-[11px] font-semibold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-brass/50 transition-colors ${STATUS_META[st].badgeClass} bg-white `}
                              >
                                {ALL_STATUSES.map((statusOption) => (
                                  <option
                                    key={statusOption}
                                    value={statusOption}
                                    className="bg-white text-ink "
                                  >
                                    {STATUS_META[statusOption].label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-3.5 h-3.5 pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-70" />
                            </div>
                          </td>

                          {/* Col 6: Quick WhatsApp & Detail View Trigger */}
                          <td
                            className="py-3.5 px-3.5 align-top text-right whitespace-nowrap"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="inline-flex items-center gap-1.5">
                              <a
                                href={buildWhatsAppUrl(lead)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => playUiClick('tap')}
                                className="px-2.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-[11px] inline-flex items-center gap-1 shadow-xs transition-all"
                                title="Написать в WhatsApp (Write in WhatsApp)"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span className="hidden xl:inline">Написать в WhatsApp</span>
                              </a>
                              <button
                                onClick={() => {
                                  playUiClick('tick');
                                  setSelectedLead(lead);
                                  setNotesDraft(lead.managerNotes || '');
                                }}
                                className="p-1.5 rounded-xl bg-ink/10 hover:bg-ink hover:text-paper text-ink-soft transition-colors"
                                title="Открыть полную историю расчетов (Detail View)"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Right Column: Detail View Side Panel (Full Calculation History & Lead Details) */}
            {selectedLead && (
              <div className="lg:col-span-5 rounded-2xl border border-brass/50 bg-white p-5 overflow-y-auto flex flex-col justify-between space-y-4 shadow-xl">
                <div className="space-y-4">
                  {/* Lead Card Header */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-ink/15 ">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-brass-ink ">
                          DETAIL VIEW · {selectedLead.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            STATUS_META[normalizeLeadStatus(selectedLead.status)].badgeClass
                          }`}
                        >
                          {STATUS_META[normalizeLeadStatus(selectedLead.status)].label}
                        </span>
                      </div>
                      <h4 className="font-serif text-base text-ink mt-1">
                        {selectedLead.clientName || 'Клиент сайта'} · {selectedLead.phone}
                      </h4>
                    </div>
                    <button
                      onClick={() => setSelectedLead(null)}
                      className="p-1 rounded-lg text-olive hover:text-ink "
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Ready-to-Read Sales Manager Script */}
                  <div className="p-3.5 rounded-2xl bg-forest text-cream border border-cream/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-brass-light flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Готовый скрипт для звонка менеджеру</span>
                      </span>
                      <button
                        onClick={() => {
                          playUiClick('tick');
                          navigator.clipboard?.writeText(buildManagerScript(selectedLead));
                          setCopiedScript(true);
                          setTimeout(() => setCopiedScript(false), 2000);
                        }}
                        className="text-[10px] text-cream-soft hover:text-cream flex items-center gap-1"
                      >
                        {copiedScript ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Скопировано</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Копировать</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-cream leading-relaxed italic">
                      {buildManagerScript(selectedLead)}
                    </p>
                  </div>

                  {/* Current Calculator Parameters Breakdown */}
                  <div className="p-3.5 rounded-2xl bg-paper-deep border border-ink/15 space-y-2 text-xs">
                    <div className="font-semibold text-ink flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-brass-ink " />
                      <span>Текущий выбор в калькуляторе (Calculator Choices)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div>
                        <span className="text-olive block">Проект:</span>
                        <span className="font-semibold text-ink ">
                          {selectedLead.houseTitle || 'Индивидуальный'}
                        </span>
                      </div>
                      <div>
                        <span className="text-olive block">Сумма сметы:</span>
                        <span className="font-mono font-bold text-brass-ink ">
                          {(selectedLead.calculatedPrice || 707000).toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                      <div>
                        <span className="text-olive block">Площадь (Size):</span>
                        <span className="font-semibold">
                          {selectedLead.calculatorParams?.size || 36} м²
                        </span>
                      </div>
                      <div>
                        <span className="text-olive block">Утепление (Insulation):</span>
                        <span className="font-semibold">
                          {selectedLead.calculatorParams?.insulation || '150 мм (Осень-Зима)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-olive block">Фундамент:</span>
                        <span className="font-semibold">
                          {selectedLead.calculatorParams?.foundation || 'Свайно-винтовой (−50%)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-olive block">Терраса / Доставка:</span>
                        <span className="font-semibold">
                          {selectedLead.calculatorParams?.veranda || 'Без веранды'} (
                          {selectedLead.calculatorParams?.distanceKm ?? 45} км от МКАД)
                        </span>
                      </div>
                    </div>
                    {selectedLead.utm && Object.keys(selectedLead.utm).length > 0 && (
                      <div className="pt-2 mt-2 border-t border-ink/15 ">
                        <span className="text-[10px] font-mono uppercase text-olive block mb-1">
                          UTM-атрибуция источника:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(selectedLead.utm).map(([key, val]) =>
                            val ? (
                              <span
                                key={key}
                                className="px-2 py-0.5 rounded bg-ink/10 font-mono text-[10px] text-ink-soft "
                              >
                                {key}: {val}
                              </span>
                            ) : null
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Full Calculation History Timeline */}
                  <div className="p-3.5 rounded-2xl bg-paper-deep border border-ink/15 space-y-2.5 text-xs">
                    <div className="font-semibold text-ink flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-brass-ink " />
                      <span>Полная история расчетов клиента (Calculation History)</span>
                    </div>
                    <div className="space-y-2 pl-2 border-l-2 border-brass/50">
                      {(selectedLead.calculationHistory && selectedLead.calculationHistory.length > 0
                        ? selectedLead.calculationHistory
                        : [
                            {
                              timestamp: selectedLead.timestamp,
                              action: 'Фиксация сметы на сайте',
                              houseTitle: selectedLead.houseTitle || 'Каркасный дом',
                              calculatedPrice: selectedLead.calculatedPrice || 707000,
                              size: selectedLead.calculatorParams?.size || 36,
                              insulation:
                                selectedLead.calculatorParams?.insulation || '150 мм (Осень-Зима)',
                              foundation:
                                selectedLead.calculatorParams?.foundation ||
                                'Свайно-винтовой (−50%)',
                              veranda: selectedLead.calculatorParams?.veranda || 'Без веранды',
                            },
                          ]
                      ).map((entry, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-white border border-ink/15 text-[11px]"
                        >
                          <div className="flex items-center justify-between text-olive font-mono text-[10px]">
                            <span>{entry.timestamp}</span>
                            <span className="text-brass-ink font-bold">
                              {entry.calculatedPrice.toLocaleString('ru-RU')} ₽
                            </span>
                          </div>
                          <div className="font-semibold text-ink mt-0.5">
                            {entry.action} — {entry.houseTitle}
                          </div>
                          <div className="text-olive font-mono text-[10px] mt-0.5">
                            {entry.size} м² · {entry.insulation} · {entry.veranda}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5-Stage Status Dropdown & Pipeline inside Detail Card */}
                  <div>
                    <label className="text-[11px] font-semibold text-olive block mb-1.5">
                      Статус сделки (New → Contacted → Negotiation → Contract → Completed):
                    </label>
                    <select
                      value={normalizeLeadStatus(selectedLead.status)}
                      onChange={(e) =>
                        handleStatusChange(selectedLead, e.target.value as LeadStatus)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-paper-deep border border-ink/20 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brass/50"
                    >
                      {ALL_STATUSES.map((stOpt) => (
                        <option key={stOpt} value={stOpt}>
                          {STATUS_META[stOpt].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Manager Notes */}
                  <div>
                    <label className="text-[11px] font-semibold text-olive block mb-1">
                      Комментарий менеджера по участку / договору:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        placeholder="Например: Участок в Истре, перезвонить в 18:00..."
                        className="flex-1 px-3 py-2 rounded-xl bg-paper-deep border border-ink/15 text-xs text-ink "
                      />
                      <button
                        onClick={handleSaveNotes}
                        className="px-3 py-2 rounded-xl bg-ink text-paper text-xs font-semibold hover:bg-ink-soft shrink-0"
                      >
                        Сохранить
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Actions: Write in WhatsApp + Delete */}
                <div className="pt-3 border-t border-ink/15 flex items-center justify-between gap-2">
                  <a
                    href={buildWhatsAppUrl(selectedLead)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Написать в WhatsApp (Write in WhatsApp)</span>
                  </a>

                  <button
                    onClick={() => handleDeleteLead(selectedLead.id)}
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors"
                    title="Удалить заявку"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="pt-3 border-t border-ink/15 flex flex-wrap items-center justify-between gap-2 text-[11px] text-olive">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Защита API: все запросы к /api/leads без токена возвращают 403 Forbidden</span>
          </span>
          <span className="font-mono">SSE Real-Time Notifications: Active</span>
        </div>
      </div>
    </div>
  );
};

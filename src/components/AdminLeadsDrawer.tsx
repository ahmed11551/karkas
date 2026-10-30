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
} from 'lucide-react';
import {
  StoredLead,
  LeadStatus,
  fetchProtectedLeads,
  updateLeadOnServer,
  deleteLeadOnServer,
  exportLeadsCsv,
  clearAdminToken,
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
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30',
    activeBtnClass: 'bg-amber-500 text-neutral-950 border-amber-500 font-bold',
  },
  contacted: {
    label: 'Связались (Contacted)',
    enLabel: 'Contacted',
    badgeClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30',
    activeBtnClass: 'bg-sky-500 text-white border-sky-500 font-bold',
  },
  negotiation: {
    label: 'Переговоры (Negotiation)',
    enLabel: 'Negotiation',
    badgeClass: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
    activeBtnClass: 'bg-indigo-600 text-white border-indigo-600 font-bold',
  },
  contract: {
    label: 'Договор (Contract)',
    enLabel: 'Contract',
    badgeClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30',
    activeBtnClass: 'bg-purple-600 text-white border-purple-600 font-bold',
  },
  completed: {
    label: 'Завершен / Сдан (Completed)',
    enLabel: 'Completed',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30',
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
    const list = leads.filter((l) => {
      const currentStatus = normalizeLeadStatus(l.status);
      const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;
      const q = search.trim().toLowerCase();
      if (!q) return matchesStatus;
      const inPhone = l.phone.toLowerCase().includes(q);
      const inName = (l.clientName || '').toLowerCase().includes(q);
      const inHouse = (l.houseTitle || '').toLowerCase().includes(q);
      const inId = l.id.toLowerCase().includes(q);
      return matchesStatus && (inPhone || inName || inHouse || inId);
    });

    return [...list].sort((a, b) => {
      if (sortOrder === 'price_desc') {
        return (b.calculatedPrice || 0) - (a.calculatedPrice || 0);
      }
      const timeA = a.createdAtMs || 0;
      const timeB = b.createdAtMs || 0;
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [leads, search, statusFilter, sortOrder]);

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
    await updateLeadOnServer(selectedLead.id, { managerNotes: notesDraft });
    setLeads((prev) =>
      prev.map((item) =>
        item.id === selectedLead.id ? { ...item, managerNotes: notesDraft } : item
      )
    );
    setSelectedLead((prev) => (prev ? { ...prev, managerNotes: notesDraft } : null));
  };

  const handleDeleteLead = async (id: string) => {
    playUiClick('tick');
    await deleteLeadOnServer(id);
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
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-7xl h-full shadow-2xl border-l border-white/20 p-4 sm:p-7 flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top CRM Header */}
        <div className="pb-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#183B30] text-[#E6B860] flex items-center justify-center border border-[#2F5A4B] shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg sm:text-xl text-neutral-900 dark:text-neutral-100">
                  CRM-Система · Реестр заявок отдела продаж
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                  ADMIN_TOKEN VERIFIED
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Защищенный контур {COMPANY_CONFIG.legalName.ru} · Синхронизация API + резервный архив · Всего заявок: {leads.length}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTest403}
              className="px-3 py-1.5 rounded-xl bg-neutral-200/80 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
              title="Проверить ответ сервера 403 Forbidden при запросе без токена"
            >
              <Terminal className="w-3.5 h-3.5 text-[#B27D18] dark:text-[#E6B860]" />
              <span>Аудит 403 API</span>
            </button>

            <button
              onClick={() => {
                playUiClick('tick');
                exportLeadsCsv(leads);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#E6B860] hover:bg-[#D4A043] text-[#1E1705] text-xs font-semibold flex items-center gap-1.5 transition-all gold-glow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Экспорт CSV</span>
            </button>

            <button
              onClick={() => {
                playUiClick('tap');
                clearAdminToken();
                onLogout();
                onClose();
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Выйти и удалить кнопку CRM из DOM"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Выйти</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 403 Diagnostic Toast Banner */}
        {apiTestToast && (
          <div className="mt-3 p-3 rounded-2xl bg-neutral-900 text-emerald-400 font-mono text-xs flex items-center justify-between border border-emerald-500/30">
            <span>🛡️ {apiTestToast}</span>
            <button onClick={() => setApiTestToast(null)} className="text-neutral-400 hover:text-white">
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
                    ? 'bg-[#183B30] text-[#E6B860] border-[#183B30] dark:border-[#E6B860] shadow-sm'
                    : 'bg-white/70 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <span>{tab.label}</span>
                <span className="px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/10 font-mono text-[10px]">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по телефону, проекту, ID..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#E6B860]"
              />
            </div>

            <button
              onClick={() => {
                playUiClick('tick');
                setSortOrder((prev) =>
                  prev === 'newest' ? 'oldest' : prev === 'oldest' ? 'price_desc' : 'newest'
                );
              }}
              className="px-3 py-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-200 flex items-center gap-1.5 hover:border-[#E6B860] transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#B27D18] dark:text-[#E6B860]" />
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
              <p className="text-xs text-neutral-600 dark:text-neutral-300">{forbiddenError}</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 overflow-hidden min-h-0">
            {/* Left / Main Column: Detailed CRM Lead Table */}
            <div
              className={`${
                selectedLead ? 'lg:col-span-7' : 'lg:col-span-12'
              } overflow-y-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/50`}
            >
              {filteredLeads.length === 0 ? (
                <div className="py-16 text-center text-xs text-neutral-500">
                  По выбранным фильтрам заявок не найдено
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 z-10 bg-neutral-100/95 dark:bg-neutral-800/95 backdrop-blur-md text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700">
                    <tr>
                      <th className="py-3 px-3.5">Дата (Date)</th>
                      <th className="py-3 px-3.5">Телефон (Phone)</th>
                      <th className="py-3 px-3.5">Проект (Project Name)</th>
                      <th className="py-3 px-3.5">Параметры (Size / Insulation)</th>
                      <th className="py-3 px-3.5">Статус (Status)</th>
                      <th className="py-3 px-3.5 text-right">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200/70 dark:divide-neutral-800">
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
                              ? 'bg-[#E6B860]/15 dark:bg-[#E6B860]/10'
                              : 'hover:bg-neutral-100/80 dark:hover:bg-neutral-800/40'
                          }`}
                        >
                          {/* Col 1: Date & ID */}
                          <td className="py-3.5 px-3.5 align-top whitespace-nowrap">
                            <span className="font-mono font-bold text-[#B27D18] dark:text-[#E6B860] block">
                              {lead.id}
                            </span>
                            <span className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {lead.timestamp}
                            </span>
                          </td>

                          {/* Col 2: Phone & Name */}
                          <td className="py-3.5 px-3.5 align-top">
                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {lead.clientName || 'Клиент сайта'}
                            </div>
                            <a
                              href={`tel:${lead.phone.replace(/\D/g, '')}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-neutral-600 dark:text-neutral-300 hover:text-[#B27D18] dark:hover:text-[#E6B860] font-mono text-[11px] inline-flex items-center gap-1 mt-0.5"
                            >
                              <Phone className="w-3 h-3 text-[#E6B860]" />
                              <span>{lead.phone}</span>
                            </a>
                          </td>

                          {/* Col 3: Selected Project & Price */}
                          <td className="py-3.5 px-3.5 align-top">
                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {lead.houseTitle || 'Индивидуальный расчёт'}
                            </div>
                            {lead.calculatedPrice && (
                              <span className="font-mono font-bold text-[#142E25] dark:text-[#E6B860] text-xs mt-0.5 block">
                                ≈ {lead.calculatedPrice.toLocaleString('ru-RU')} ₽
                              </span>
                            )}
                          </td>

                          {/* Col 4: Calculator Choices (Size, Insulation, Foundation, Veranda) */}
                          <td className="py-3.5 px-3.5 align-top">
                            {lead.calculatorParams ? (
                              <div className="flex flex-wrap gap-1">
                                <span className="px-2 py-0.5 rounded-md bg-neutral-200/80 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-mono text-[10px] font-semibold">
                                  {lead.calculatorParams.size} м²
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[10px]">
                                  {lead.calculatorParams.insulation}
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-[#B27D18] dark:text-[#E6B860] text-[10px]">
                                  {lead.calculatorParams.veranda}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[11px] text-neutral-400">
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
                                className={`w-full appearance-none pl-2.5 pr-7 py-1.5 rounded-xl text-[11px] font-semibold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E6B860] transition-colors ${STATUS_META[st].badgeClass} bg-white dark:bg-neutral-900`}
                              >
                                {ALL_STATUSES.map((statusOption) => (
                                  <option
                                    key={statusOption}
                                    value={statusOption}
                                    className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
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
                                className="p-1.5 rounded-xl bg-neutral-200/70 dark:bg-neutral-800 hover:bg-[#E6B860] hover:text-[#1E1705] text-neutral-700 dark:text-neutral-200 transition-colors"
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
              <div className="lg:col-span-5 rounded-2xl border border-[#E6B860]/40 bg-white dark:bg-[#10211B] p-5 overflow-y-auto flex flex-col justify-between space-y-4 shadow-xl">
                <div className="space-y-4">
                  {/* Lead Card Header */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-neutral-200 dark:border-neutral-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#B27D18] dark:text-[#E6B860]">
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
                      <h4 className="font-display font-bold text-base text-neutral-900 dark:text-white mt-1">
                        {selectedLead.clientName || 'Клиент сайта'} · {selectedLead.phone}
                      </h4>
                    </div>
                    <button
                      onClick={() => setSelectedLead(null)}
                      className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Ready-to-Read Sales Manager Script */}
                  <div className="p-3.5 rounded-2xl bg-[#183B30] text-white border border-[#2F5A4B] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#E6B860] flex items-center gap-1">
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
                        className="text-[10px] text-emerald-200 hover:text-white flex items-center gap-1"
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
                    <p className="text-xs text-emerald-50/95 leading-relaxed italic">
                      {buildManagerScript(selectedLead)}
                    </p>
                  </div>

                  {/* Current Calculator Parameters Breakdown */}
                  <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/70 space-y-2 text-xs">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#B27D18] dark:text-[#E6B860]" />
                      <span>Текущий выбор в калькуляторе (Calculator Choices)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div>
                        <span className="text-neutral-400 block">Проект:</span>
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          {selectedLead.houseTitle || 'Индивидуальный'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block">Сумма сметы:</span>
                        <span className="font-mono font-bold text-[#B27D18] dark:text-[#E6B860]">
                          {(selectedLead.calculatedPrice || 707000).toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block">Площадь (Size):</span>
                        <span className="font-semibold">
                          {selectedLead.calculatorParams?.size || 36} м²
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block">Утепление (Insulation):</span>
                        <span className="font-semibold">
                          {selectedLead.calculatorParams?.insulation || '150 мм (Осень-Зима)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block">Фундамент:</span>
                        <span className="font-semibold">
                          {selectedLead.calculatorParams?.foundation || 'Свайно-винтовой (−50%)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block">Терраса / Доставка:</span>
                        <span className="font-semibold">
                          {selectedLead.calculatorParams?.veranda || 'Без веранды'} (
                          {selectedLead.calculatorParams?.distanceKm ?? 45} км от МКАД)
                        </span>
                      </div>
                    </div>
                    {selectedLead.utm && Object.keys(selectedLead.utm).length > 0 && (
                      <div className="pt-2 mt-2 border-t border-neutral-200 dark:border-neutral-700/70">
                        <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                          UTM-атрибуция источника:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(selectedLead.utm).map(([key, val]) =>
                            val ? (
                              <span
                                key={key}
                                className="px-2 py-0.5 rounded bg-neutral-200/80 dark:bg-neutral-900 font-mono text-[10px] text-neutral-700 dark:text-neutral-300"
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
                  <div className="p-3.5 rounded-2xl bg-neutral-100/80 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60 space-y-2.5 text-xs">
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-[#B27D18] dark:text-[#E6B860]" />
                      <span>Полная история расчетов клиента (Calculation History)</span>
                    </div>
                    <div className="space-y-2 pl-2 border-l-2 border-[#E6B860]/50">
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
                          className="p-2.5 rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-200/70 dark:border-neutral-800 text-[11px]"
                        >
                          <div className="flex items-center justify-between text-neutral-400 font-mono text-[10px]">
                            <span>{entry.timestamp}</span>
                            <span className="text-[#B27D18] dark:text-[#E6B860] font-bold">
                              {entry.calculatedPrice.toLocaleString('ru-RU')} ₽
                            </span>
                          </div>
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
                            {entry.action} — {entry.houseTitle}
                          </div>
                          <div className="text-neutral-500 dark:text-neutral-400 font-mono text-[10px] mt-0.5">
                            {entry.size} м² · {entry.insulation} · {entry.veranda}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5-Stage Status Dropdown & Pipeline inside Detail Card */}
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-500 block mb-1.5">
                      Статус сделки (New → Contacted → Negotiation → Contract → Completed):
                    </label>
                    <select
                      value={normalizeLeadStatus(selectedLead.status)}
                      onChange={(e) =>
                        handleStatusChange(selectedLead, e.target.value as LeadStatus)
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#E6B860]"
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
                    <label className="text-[11px] font-semibold text-neutral-500 block mb-1">
                      Комментарий менеджера по участку / договору:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        placeholder="Например: Участок в Истре, перезвонить в 18:00..."
                        className="flex-1 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100"
                      />
                      <button
                        onClick={handleSaveNotes}
                        className="px-3 py-2 rounded-xl bg-[#183B30] text-[#E6B860] text-xs font-semibold hover:opacity-90 shrink-0"
                      >
                        Сохранить
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Bottom Actions: Write in WhatsApp + Delete */}
                <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2">
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
        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500">
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

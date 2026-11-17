import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  LogOut,
  Copy,
  Check,
  RotateCcw,
  RefreshCw,
  BellRing,
  ChevronLeft,
  FileText,
  History,
  Sparkles,
} from 'lucide-react';
import {
  StoredLead,
  LeadStatus,
  LEAD_STATUS_ORDER,
  fetchProtectedLeads,
  updateLeadOnServer,
  deleteLeadOnServer,
  exportLeadsCsv,
  logoutAdmin,
  testUnauthorizedRequest,
  normalizeLeadStatus,
} from '../utils/leads';
import { playUiClick } from '../utils/sound';

interface AdminLeadsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  initialSelectedLeadId?: string | null;
}

type LeadSource = StoredLead['source'];
type SortOrder = 'newest' | 'oldest' | 'price_desc';

const STATUS_META: Record<LeadStatus, { label: string; badge: string; dot: string }> = {
  new: { label: 'Новый', badge: 'bg-brass/25 text-ink border-brass/70', dot: 'bg-brass' },
  contacted: { label: 'Связались', badge: 'bg-sky-100 text-sky-900 border-sky-300', dot: 'bg-sky-500' },
  negotiation: { label: 'Переговоры', badge: 'bg-indigo-100 text-indigo-900 border-indigo-300', dot: 'bg-indigo-500' },
  contract: { label: 'Договор', badge: 'bg-purple-100 text-purple-900 border-purple-300', dot: 'bg-purple-500' },
  completed: { label: 'Сдан', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300', dot: 'bg-emerald-600' },
  lost: { label: 'Отказ', badge: 'bg-ink/10 text-olive border-ink/25', dot: 'bg-olive' },
};

const SOURCE_LABELS: Record<LeadSource, string> = {
  hero_quick: 'Быстрая форма',
  quiz_modal: 'Квиз',
  calculator: 'Калькулятор',
  catalog_spec: 'Каталог',
};

const CLOSED_STATUSES: LeadStatus[] = ['completed', 'lost'];

const dayStartMs = (value: string) => new Date(`${value}T00:00:00`).getTime();
const dayEndMs = (value: string) => new Date(`${value}T23:59:59.999`).getTime();

/** Local calendar day as YYYY-MM-DD (the format used by date inputs and followUpAt). */
const todayIso = (): string => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatIsoDay = (iso: string): string => {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
};

const formatMoney = (value?: number): string | null =>
  typeof value === 'number' && value > 0 ? `${value.toLocaleString('ru-RU')} ₽` : null;

/** WhatsApp needs a full Russian mobile/landline number. Returns null when the number is not usable. */
const whatsappDigits = (phone: string): string | null => {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  return digits.length >= 10 && digits.length <= 15 ? digits : null;
};

const hasCalcData = (lead: StoredLead): boolean =>
  Boolean(
    lead.calculatedPrice ||
      lead.calculatorParams?.size ||
      lead.calculatorParams?.insulation ||
      lead.calculatorParams?.foundation ||
      lead.calculatorParams?.veranda
  );

/** Message text only uses facts from the lead. Missing parts are left out, never replaced by guesses. */
const buildWhatsAppText = (lead: StoredLead): string => {
  const greeting = `Здравствуйте${lead.clientName ? `, ${lead.clientName}` : ''}!`;
  const project = lead.houseTitle ? ` проект «${lead.houseTitle}»` : '';
  const price = formatMoney(lead.calculatedPrice);
  const calc = price ? `, расчёт ≈ ${price}` : '';
  return `${greeting} Это инженер компании «Каркасник». Вижу вашу заявку ${lead.id}${project ? `:${project}` : ''}${calc}. Подскажите, когда удобно обсудить детали участка и расчёт?`;
};

/** Call script built only from recorded values. Returns null when the lead has no calculation. */
const buildCallScript = (lead: StoredLead): string | null => {
  if (!hasCalcData(lead)) return null;
  const p = lead.calculatorParams || {};
  const parts = [
    lead.houseTitle ? `проект «${lead.houseTitle}»` : null,
    p.size ? `площадь ${p.size} м²` : null,
    p.insulation ? `утепление ${p.insulation}` : null,
    p.foundation ? `фундамент: ${p.foundation}` : null,
    p.veranda ? `комплектация: ${p.veranda}` : null,
  ].filter(Boolean);
  const price = formatMoney(lead.calculatedPrice);
  const priceText = price ? ` Расчёт на сайте: ${price}.` : '';
  return `Здравствуйте! Вижу ваш расчёт на сайте: ${parts.join(', ')}.${priceText} Давайте уточним детали и подъездные пути к участку.`;
};

const matchesQuery = (lead: StoredLead, query: string): boolean => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const digitsQuery = q.replace(/\D/g, '');
  const phoneDigits = lead.phone.replace(/\D/g, '');
  if (digitsQuery.length >= 4 && phoneDigits.includes(digitsQuery)) return true;
  return [lead.id, lead.clientName, lead.houseTitle, lead.managerNotes, lead.phone]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(q));
};

const isDue = (lead: StoredLead, today: string): boolean =>
  Boolean(lead.followUpAt) && !CLOSED_STATUSES.includes(normalizeLeadStatus(lead.status)) && (lead.followUpAt as string) <= today;

type Toast = { tone: 'ok' | 'err'; text: string } | null;

export const AdminLeadsDrawer: React.FC<AdminLeadsDrawerProps> = ({
  isOpen,
  onClose,
  onLogout,
  initialSelectedLeadId,
}) => {
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [loading, setLoading] = useState(false);
  const [forbiddenError, setForbiddenError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LeadStatus>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | LeadSource>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [dueOnly, setDueOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const [copied, setCopied] = useState<'phone' | 'script' | null>(null);
  const [toast, setToast] = useState<Toast>(null);

  const today = todayIso();

  const showToast = useCallback((tone: 'ok' | 'err', text: string) => {
    setToast({ tone, text });
    window.setTimeout(() => setToast((current) => (current?.text === text ? null : current)), 3500);
  }, []);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    const res = await fetchProtectedLeads();
    setLoading(false);
    if (res.status === 403 || res.status === 401) {
      setForbiddenError(res.error || 'Доступ запрещён: нужна авторизация администратора.');
      setLeads([]);
      return;
    }
    if (res.status !== 200) {
      showToast('err', res.error || 'Не удалось загрузить заявки.');
      return;
    }
    setForbiddenError(null);
    setLeads(res.leads);
    setLastUpdated(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
  }, [showToast]);

  useEffect(() => {
    if (!isOpen) return;
    void loadLeads();
    const handleUpdate = () => void loadLeads();
    window.addEventListener('leads_updated', handleUpdate);
    return () => window.removeEventListener('leads_updated', handleUpdate);
  }, [isOpen, loadLeads]);

  useEffect(() => {
    if (!isOpen || !initialSelectedLeadId) return;
    setSelectedId(initialSelectedLeadId);
  }, [isOpen, initialSelectedLeadId]);

  const selectedLead = useMemo(
    () => leads.find((l) => l.id === selectedId) ?? null,
    [leads, selectedId]
  );

  // The notes draft belongs to one lead. It is filled once that lead is actually loaded,
  // so an id opened before the list arrives cannot start with an empty draft.
  const [draftOwnerId, setDraftOwnerId] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedLead || draftOwnerId === selectedLead.id) return;
    setDraftOwnerId(selectedLead.id);
    setNotesDraft(selectedLead.managerNotes || '');
    setDeleteArmed(false);
  }, [selectedLead, draftOwnerId]);

  // Escape closes the detail card first, then the whole panel.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (selectedId) {
        setSelectedId(null);
      } else {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, selectedId, onClose]);

  const notesDirty = selectedLead ? notesDraft !== (selectedLead.managerNotes || '') : false;

  const requestSelect = (id: string | null) => {
    if (id === selectedId) return;
    if (notesDirty && !window.confirm('Заметка не сохранена. Перейти к другой заявке без сохранения?')) return;
    playUiClick('tick');
    setSelectedId(id);
  };

  const patchLocal = (id: string, patch: Partial<StoredLead>) =>
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  const changeStatus = async (lead: StoredLead, status: LeadStatus) => {
    if (status === normalizeLeadStatus(lead.status)) return;
    playUiClick('tick');
    const previous = lead.status;
    patchLocal(lead.id, { status });
    const res = await updateLeadOnServer(lead.id, { status });
    if (!res.ok) {
      patchLocal(lead.id, { status: previous });
      showToast('err', res.error);
      return;
    }
    showToast('ok', `Статус: ${STATUS_META[status].label}`);
  };

  const changeFollowUp = async (lead: StoredLead, followUpAt: string | null) => {
    playUiClick('tick');
    const previous = lead.followUpAt;
    patchLocal(lead.id, { followUpAt: followUpAt ?? undefined });
    const res = await updateLeadOnServer(lead.id, { followUpAt: followUpAt ?? '' });
    if (!res.ok) {
      patchLocal(lead.id, { followUpAt: previous });
      showToast('err', res.error);
      return;
    }
    showToast('ok', followUpAt ? `Перезвонить: ${formatIsoDay(followUpAt)}` : 'Дата перезвона снята');
  };

  const saveNotes = async () => {
    if (!selectedLead || !notesDirty) return;
    playUiClick('tap');
    setSavingNotes(true);
    const res = await updateLeadOnServer(selectedLead.id, { managerNotes: notesDraft });
    setSavingNotes(false);
    if (!res.ok) {
      showToast('err', res.error);
      return;
    }
    showToast('ok', 'Заметка сохранена');
  };

  const removeLead = async (lead: StoredLead) => {
    if (!deleteArmed) {
      setDeleteArmed(true);
      return;
    }
    playUiClick('tick');
    const res = await deleteLeadOnServer(lead.id);
    if (!res.ok) {
      showToast('err', res.error);
      return;
    }
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    setSelectedId(null);
    showToast('ok', `Заявка ${lead.id} удалена`);
  };

  const copyText = async (text: string, kind: 'phone' | 'script') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      showToast('err', 'Не удалось скопировать. Выделите текст вручную.');
    }
  };

  // Filtering and sorting.
  const counts = useMemo(() => {
    const byStatus = Object.fromEntries(LEAD_STATUS_ORDER.map((s) => [s, 0])) as Record<LeadStatus, number>;
    leads.forEach((l) => {
      byStatus[normalizeLeadStatus(l.status)] += 1;
    });
    return byStatus;
  }, [leads]);

  const kpi = useMemo(() => {
    const startToday = dayStartMs(today);
    return {
      createdToday: leads.filter((l) => (l.createdAtMs || 0) >= startToday).length,
      dueCallbacks: leads.filter((l) => isDue(l, today)).length,
      open: leads.filter((l) => !CLOSED_STATUSES.includes(normalizeLeadStatus(l.status))).length,
    };
  }, [leads, today]);

  const filteredLeads = useMemo(() => {
    const fromMs = dateFrom ? dayStartMs(dateFrom) : null;
    const toMs = dateTo ? dayEndMs(dateTo) : null;
    const list = leads.filter((l) => {
      if (statusFilter !== 'all' && normalizeLeadStatus(l.status) !== statusFilter) return false;
      if (sourceFilter !== 'all' && l.source !== sourceFilter) return false;
      if (dueOnly && !isDue(l, today)) return false;
      if (fromMs !== null || toMs !== null) {
        if (!l.createdAtMs) return false;
        if (fromMs !== null && l.createdAtMs < fromMs) return false;
        if (toMs !== null && l.createdAtMs > toMs) return false;
      }
      return matchesQuery(l, search);
    });
    return [...list].sort((a, b) => {
      if (sortOrder === 'price_desc') {
        // Leads without a calculated price go to the bottom instead of pretending to be zero.
        return (b.calculatedPrice || -1) - (a.calculatedPrice || -1);
      }
      const ta = a.createdAtMs || 0;
      const tb = b.createdAtMs || 0;
      return sortOrder === 'newest' ? tb - ta : ta - tb;
    });
  }, [leads, search, statusFilter, sourceFilter, dateFrom, dateTo, dueOnly, sortOrder, today]);

  const hasActiveFilters =
    search.trim() !== '' || statusFilter !== 'all' || sourceFilter !== 'all' || dateFrom !== '' || dateTo !== '' || dueOnly;

  const resetFilters = () => {
    playUiClick('tick');
    setSearch('');
    setStatusFilter('all');
    setSourceFilter('all');
    setDateFrom('');
    setDateTo('');
    setDueOnly(false);
  };

  if (!isOpen) return null;

  const sortLabel =
    sortOrder === 'newest' ? 'Сначала новые' : sortOrder === 'oldest' ? 'Сначала старые' : 'По сумме сметы';

  const renderFollowUpBadge = (lead: StoredLead) => {
    if (!lead.followUpAt || CLOSED_STATUSES.includes(normalizeLeadStatus(lead.status))) return null;
    const overdue = lead.followUpAt < today;
    const isToday = lead.followUpAt === today;
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold border ${
          overdue
            ? 'bg-rose-100 text-rose-800 border-rose-300'
            : isToday
              ? 'bg-brass/30 text-ink border-brass'
              : 'bg-ink/5 text-ink-soft border-ink/15'
        }`}
      >
        <BellRing className="w-3 h-3" aria-hidden="true" />
        {overdue ? `Просрочено ${formatIsoDay(lead.followUpAt)}` : isToday ? 'Перезвонить сегодня' : formatIsoDay(lead.followUpAt)}
      </span>
    );
  };

  const renderPhoneLink = (lead: StoredLead, className: string) => (
    <a
      href={`tel:${lead.phone.replace(/\D/g, '')}`}
      onClick={(e) => e.stopPropagation()}
      className={className}
    >
      <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span className="font-mono">{lead.phone}</span>
    </a>
  );

  const renderWhatsAppButton = (lead: StoredLead, compact: boolean) => {
    const digits = whatsappDigits(lead.phone);
    const base = compact
      ? 'inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-[10px] text-[11px] font-semibold'
      : 'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[12px] text-xs font-semibold';
    if (!digits) {
      return (
        <span
          className={`${base} bg-ink/10 text-olive cursor-not-allowed`}
          title="Номер не похож на мобильный или городской. Позвоните по телефону."
        >
          <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>WhatsApp недоступен</span>
        </span>
      );
    }
    return (
      <a
        href={`https://wa.me/${digits}?text=${encodeURIComponent(buildWhatsAppText(lead))}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          e.stopPropagation();
          playUiClick('tap');
        }}
        className={`${base} bg-[#25D366] hover:bg-[#1EBE5D] text-white transition-colors`}
        title="Написать в WhatsApp"
      >
        <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
        <span>WhatsApp</span>
      </a>
    );
  };

  const renderStatusSelect = (lead: StoredLead, className: string) => {
    const st = normalizeLeadStatus(lead.status);
    return (
      <select
        value={st}
        onChange={(e) => void changeStatus(lead, e.target.value as LeadStatus)}
        aria-label={`Статус заявки ${lead.id}`}
        className={`${className} rounded-[10px] text-[11px] font-semibold border focus:outline-none focus:ring-2 focus:ring-brass/60 cursor-pointer ${STATUS_META[st].badge}`}
      >
        {LEAD_STATUS_ORDER.map((opt) => (
          <option key={opt} value={opt} className="bg-white text-ink">
            {STATUS_META[opt].label}
          </option>
        ))}
      </select>
    );
  };

  const selectedScript = selectedLead ? buildCallScript(selectedLead) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="CRM: заявки"
      data-lenis-prevent
      className="fixed inset-0 z-50 flex justify-end bg-forest/70 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-paper text-ink w-full max-w-7xl h-full border-l border-ink/15 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: identity, live numbers, global actions */}
        <header className="px-4 sm:px-6 pt-4 pb-3 border-b border-ink/15 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-[10px] bg-forest text-brass-light flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-semibold leading-tight truncate">CRM: заявки клиентов</h2>
                <p className="text-[11px] text-olive font-mono">
                  {lastUpdated ? `обновлено ${lastUpdated}` : 'загрузка…'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => void loadLeads()}
                disabled={loading}
                className="p-2 rounded-[10px] text-olive hover:text-ink hover:bg-ink/5 disabled:opacity-50 transition-colors"
                aria-label="Обновить список"
                title="Обновить список"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => {
                  playUiClick('tick');
                  void logoutAdmin().then(() => {
                    onLogout();
                    onClose();
                  });
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Выйти</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-[10px] text-olive hover:text-ink hover:bg-ink/5 transition-colors"
                aria-label="Закрыть CRM"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-xl">
            {[
              { label: 'Новых сегодня', value: kpi.createdToday, tone: 'text-ink' },
              { label: 'К перезвону', value: kpi.dueCallbacks, tone: kpi.dueCallbacks > 0 ? 'text-rose-700' : 'text-ink' },
              { label: 'В работе', value: kpi.open, tone: 'text-ink' },
            ].map((item) => (
              <div key={item.label} className="rounded-[12px] border border-ink/15 bg-paper-deep px-3 py-2">
                <div className={`text-xl sm:text-2xl font-light tabular-nums leading-none ${item.tone}`}>{item.value}</div>
                <div className="text-[11px] text-olive mt-1 leading-tight">{item.label}</div>
              </div>
            ))}
          </div>
        </header>

        {forbiddenError ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="p-6 rounded-[20px] bg-rose-50 border border-rose-300 max-w-md space-y-3">
              <div className="font-mono text-2xl font-bold text-rose-700">403 FORBIDDEN</div>
              <p className="text-sm text-ink-soft">{forbiddenError}</p>
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-[10px] bg-ink text-paper text-sm font-semibold">
                Закрыть
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="px-4 sm:px-6 py-3 border-b border-ink/10 space-y-3">
              <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label="Фильтр по статусу">
                {(
                  [{ id: 'all' as const, label: 'Все', count: leads.length }, ...LEAD_STATUS_ORDER.map((s) => ({ id: s, label: STATUS_META[s].label, count: counts[s] }))]
                ).map((tab) => {
                  const active = statusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => {
                        playUiClick('tick');
                        setStatusFilter(tab.id);
                      }}
                      className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold border transition-colors ${
                        active ? 'bg-ink text-paper border-ink' : 'bg-white text-ink-soft border-ink/15 hover:border-ink/40'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`font-mono text-[10px] ${active ? 'text-paper/80' : 'text-olive'}`}>{tab.count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
                  <Search className="w-3.5 h-3.5 text-olive absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Поиск по заявкам"
                    placeholder="Имя, телефон, проект, заметка, ID"
                    className="w-full h-9 pl-9 pr-3 rounded-[10px] bg-white border border-ink/15 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brass/60"
                  />
                </div>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value as 'all' | LeadSource)}
                  aria-label="Источник заявки"
                  className="h-9 px-2.5 rounded-[10px] bg-white border border-ink/15 text-xs font-semibold text-ink-soft focus:outline-none focus:ring-2 focus:ring-brass/60"
                >
                  <option value="all">Все источники</option>
                  {(Object.keys(SOURCE_LABELS) as LeadSource[]).map((src) => (
                    <option key={src} value={src}>
                      {SOURCE_LABELS[src]}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={dateFrom}
                  max={dateTo || undefined}
                  onChange={(e) => setDateFrom(e.target.value)}
                  aria-label="Заявки с даты"
                  className="h-9 px-2 rounded-[10px] bg-white border border-ink/15 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brass/60"
                />
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  onChange={(e) => setDateTo(e.target.value)}
                  aria-label="Заявки по дату"
                  className="h-9 px-2 rounded-[10px] bg-white border border-ink/15 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brass/60"
                />
                <button
                  type="button"
                  onClick={() => {
                    playUiClick('tick');
                    setDueOnly((v) => !v);
                  }}
                  aria-pressed={dueOnly}
                  className={`h-9 px-3 rounded-[10px] text-xs font-semibold border inline-flex items-center gap-1.5 transition-colors ${
                    dueOnly ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-ink-soft border-ink/15 hover:border-ink/40'
                  }`}
                >
                  <BellRing className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>К перезвону</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playUiClick('tick');
                    setSortOrder((prev) => (prev === 'newest' ? 'oldest' : prev === 'oldest' ? 'price_desc' : 'newest'));
                  }}
                  className="h-9 px-3 rounded-[10px] bg-white border border-ink/15 text-xs font-semibold text-ink-soft inline-flex items-center gap-1.5 hover:border-ink/40 transition-colors"
                  title="Сменить сортировку"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-olive" aria-hidden="true" />
                  <span>{sortLabel}</span>
                </button>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="h-9 px-3 rounded-[10px] bg-ink/10 hover:bg-ink/15 text-xs font-semibold text-ink-soft inline-flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Сбросить</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    playUiClick('tick');
                    exportLeadsCsv(filteredLeads);
                  }}
                  disabled={filteredLeads.length === 0}
                  className="ml-auto h-9 px-3.5 rounded-[10px] bg-ink hover:bg-ink-soft disabled:opacity-40 text-paper text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                  title="Экспорт заявок с текущими фильтрами"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>CSV ({filteredLeads.length})</span>
                </button>
              </div>
            </div>

            {/* Workspace: list + detail */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-5 p-0 lg:p-5">
              <section
                aria-label="Список заявок"
                className={`${selectedLead ? 'lg:col-span-7' : 'lg:col-span-12'} min-h-0 overflow-y-auto lg:rounded-[20px] lg:border lg:border-ink/15 bg-white/60`}
              >
                {filteredLeads.length === 0 ? (
                  <div className="py-16 px-6 text-center text-sm text-olive">
                    {leads.length === 0
                      ? 'Заявок пока нет. Они появятся здесь сразу после отправки с сайта.'
                      : 'По выбранным фильтрам заявок нет.'}
                  </div>
                ) : (
                  <>
                    {/* Desktop/tablet: table */}
                    <table className="hidden md:table w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 z-10 bg-paper-deep text-[11px] uppercase tracking-wide text-olive border-b border-ink/15">
                        <tr>
                          <th scope="col" className="py-2.5 px-3">Поступила</th>
                          <th scope="col" className="py-2.5 px-3">Клиент</th>
                          <th scope="col" className="py-2.5 px-3">Проект и смета</th>
                          <th scope="col" className="py-2.5 px-3">Статус</th>
                          <th scope="col" className="py-2.5 px-3 text-right">Связь</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/10">
                        {filteredLeads.map((lead) => {
                          const isSelected = selectedId === lead.id;
                          return (
                            <tr
                              key={lead.id}
                              onClick={() => requestSelect(lead.id)}
                              className={`cursor-pointer transition-colors ${isSelected ? 'bg-brass/15' : 'hover:bg-paper-deep'}`}
                            >
                              <td className="py-3 px-3 align-top whitespace-nowrap">
                                <span className="font-mono text-[11px] text-ink-soft block">{lead.id}</span>
                                <span className="text-[11px] text-olive flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3" aria-hidden="true" />
                                  {lead.timestamp}
                                </span>
                              </td>
                              <td className="py-3 px-3 align-top">
                                <div className="font-semibold text-ink">{lead.clientName || 'Имя не указано'}</div>
                                {renderPhoneLink(lead, 'text-ink-soft hover:text-ink inline-flex items-center gap-1 mt-0.5 text-[11px]')}
                                <div className="mt-1">{renderFollowUpBadge(lead)}</div>
                              </td>
                              <td className="py-3 px-3 align-top">
                                <div className="font-semibold text-ink">{lead.houseTitle || 'Проект не выбран'}</div>
                                <div className="text-[11px] text-olive mt-0.5">
                                  {formatMoney(lead.calculatedPrice) ? (
                                    <span className="font-mono font-semibold text-ink">≈ {formatMoney(lead.calculatedPrice)}</span>
                                  ) : (
                                    'расчёта не было'
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-3 align-top" onClick={(e) => e.stopPropagation()}>
                                {renderStatusSelect(lead, 'w-36 px-2 py-1.5')}
                              </td>
                              <td className="py-3 px-3 align-top text-right" onClick={(e) => e.stopPropagation()}>
                                <div className="inline-flex items-center gap-1.5">
                                  {renderWhatsAppButton(lead, true)}
                                  <button
                                    type="button"
                                    onClick={() => requestSelect(lead.id)}
                                    className="px-2.5 py-1.5 rounded-[10px] bg-ink/10 hover:bg-ink hover:text-paper text-ink-soft text-[11px] font-semibold transition-colors"
                                  >
                                    Открыть
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Phone: cards */}
                    <ul className="md:hidden divide-y divide-ink/10">
                      {filteredLeads.map((lead) => {
                        const st = normalizeLeadStatus(lead.status);
                        return (
                          <li key={lead.id}>
                            <div className="p-4 space-y-2.5">
                              <button type="button" onClick={() => requestSelect(lead.id)} className="w-full text-left space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${STATUS_META[st].badge}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[st].dot}`} aria-hidden="true" />
                                    {STATUS_META[st].label}
                                  </span>
                                  <span className="text-[11px] text-olive font-mono">{lead.timestamp}</span>
                                </div>
                                <div className="font-semibold text-ink">{lead.clientName || 'Имя не указано'}</div>
                                <div className="text-xs text-ink-soft">{lead.houseTitle || 'Проект не выбран'}</div>
                                <div className="text-xs font-mono text-ink">
                                  {formatMoney(lead.calculatedPrice) ? `≈ ${formatMoney(lead.calculatedPrice)}` : 'расчёта не было'}
                                </div>
                              </button>
                              {renderFollowUpBadge(lead)}
                              <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                {renderPhoneLink(lead, 'inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] border border-ink/20 text-xs font-semibold text-ink')}
                                {renderWhatsAppButton(lead, false)}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </section>

              {/* Detail card: side panel on desktop, full-screen sheet on phones */}
              {selectedLead && (
                <aside
                  aria-label={`Заявка ${selectedLead.id}`}
                  className="fixed inset-0 z-[60] lg:static lg:z-auto lg:col-span-5 min-h-0 overflow-y-auto bg-paper lg:rounded-[20px] lg:border lg:border-ink/15 p-4 sm:p-5 space-y-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => requestSelect(null)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-olive hover:text-ink lg:hidden"
                    >
                      <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                      <span>К списку</span>
                    </button>
                    <div className="hidden lg:block font-mono text-[11px] text-olive">{selectedLead.id}</div>
                    <button
                      type="button"
                      onClick={() => requestSelect(null)}
                      className="hidden lg:inline-flex p-1.5 rounded-[10px] text-olive hover:text-ink hover:bg-ink/5"
                      aria-label="Закрыть карточку"
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold border ${STATUS_META[normalizeLeadStatus(selectedLead.status)].badge}`}>
                        {STATUS_META[normalizeLeadStatus(selectedLead.status)].label}
                      </span>
                      <span className="text-[11px] text-olive font-mono">
                        {selectedLead.id} · {selectedLead.timestamp}
                      </span>
                    </div>
                    <h3 className="text-xl font-light leading-tight">{selectedLead.clientName || 'Имя не указано'}</h3>
                    {renderPhoneLink(selectedLead, 'inline-flex items-center gap-2 text-base font-semibold text-ink')}
                    <div className="text-[11px] text-olive">Источник: {SOURCE_LABELS[selectedLead.source]}</div>
                  </div>

                  {/* Contact actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${selectedLead.phone.replace(/\D/g, '')}`}
                      className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-[12px] bg-ink text-paper text-xs font-semibold"
                    >
                      <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Позвонить</span>
                    </a>
                    {renderWhatsAppButton(selectedLead, false)}
                    <button
                      type="button"
                      onClick={() => void copyText(selectedLead.phone, 'phone')}
                      className="col-span-2 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-[12px] border border-ink/20 text-xs font-semibold text-ink hover:border-ink/50"
                    >
                      {copied === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied === 'phone' ? 'Номер скопирован' : 'Копировать номер'}</span>
                    </button>
                  </div>

                  {/* Status and callback */}
                  <div className="p-4 rounded-[12px] border border-ink/15 bg-white space-y-3">
                    <div>
                      <label htmlFor="crm-status" className="text-[11px] font-semibold text-olive block mb-1.5">
                        Статус
                      </label>
                      {renderStatusSelect(selectedLead, 'w-full px-3 py-2.5')}
                    </div>
                    <div>
                      <label htmlFor="crm-followup" className="text-[11px] font-semibold text-olive block mb-1.5">
                        Перезвонить
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          id="crm-followup"
                          type="date"
                          value={selectedLead.followUpAt || ''}
                          min={today}
                          onChange={(e) => e.target.value && void changeFollowUp(selectedLead, e.target.value)}
                          className="h-9 px-2.5 rounded-[10px] bg-paper-deep border border-ink/15 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brass/60"
                        />
                        {selectedLead.followUpAt && (
                          <button
                            type="button"
                            onClick={() => void changeFollowUp(selectedLead, null)}
                            className="h-9 px-3 rounded-[10px] text-xs font-semibold text-ink-soft hover:text-ink border border-ink/15"
                          >
                            Снять
                          </button>
                        )}
                        {renderFollowUpBadge(selectedLead)}
                      </div>
                    </div>
                  </div>

                  {/* Calculation: only what was really recorded */}
                  <div className="p-4 rounded-[12px] border border-ink/15 bg-paper-deep space-y-3">
                    <div className="text-xs font-semibold flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-olive" aria-hidden="true" />
                      <span>Расчёт</span>
                    </div>
                    {hasCalcData(selectedLead) ? (
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                        <div className="col-span-2">
                          <dt className="text-olive text-[11px]">Проект</dt>
                          <dd className="font-semibold">{selectedLead.houseTitle || 'не выбран'}</dd>
                        </div>
                        <div>
                          <dt className="text-olive text-[11px]">Смета</dt>
                          <dd className="font-mono font-semibold">{formatMoney(selectedLead.calculatedPrice) || 'не посчитана'}</dd>
                        </div>
                        <div>
                          <dt className="text-olive text-[11px]">Площадь</dt>
                          <dd className="font-semibold">{selectedLead.calculatorParams?.size ? `${selectedLead.calculatorParams.size} м²` : 'не указана'}</dd>
                        </div>
                        <div>
                          <dt className="text-olive text-[11px]">Утепление</dt>
                          <dd className="font-semibold">{selectedLead.calculatorParams?.insulation || 'не указано'}</dd>
                        </div>
                        <div>
                          <dt className="text-olive text-[11px]">Фундамент</dt>
                          <dd className="font-semibold">{selectedLead.calculatorParams?.foundation || 'не указан'}</dd>
                        </div>
                        <div>
                          <dt className="text-olive text-[11px]">Комплектация</dt>
                          <dd className="font-semibold">{selectedLead.calculatorParams?.veranda || 'не указана'}</dd>
                        </div>
                        {typeof selectedLead.calculatorParams?.distanceKm === 'number' && (
                          <div>
                            <dt className="text-olive text-[11px]">Расстояние от МКАД</dt>
                            <dd className="font-semibold">{selectedLead.calculatorParams.distanceKm} км</dd>
                          </div>
                        )}
                        {selectedLead.calculatorParams?.mortgageMode && (
                          <div>
                            <dt className="text-olive text-[11px]">Ипотека, платёж</dt>
                            <dd className="font-semibold">
                              {selectedLead.calculatorParams.monthlyPayment
                                ? `${selectedLead.calculatorParams.monthlyPayment.toLocaleString('ru-RU')} ₽/мес`
                                : 'не указан'}
                            </dd>
                          </div>
                        )}
                      </dl>
                    ) : (
                      <p className="text-xs text-ink-soft leading-relaxed">
                        Клиент не делал расчёт на сайте: заявка с быстрой формы. Уточните объект, площадь и участок по телефону.
                      </p>
                    )}

                    {selectedScript && (
                      <div className="pt-3 border-t border-ink/10 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-olive flex items-center gap-1">
                            <Sparkles className="w-3 h-3" aria-hidden="true" />
                            Скрипт для звонка
                          </span>
                          <button
                            type="button"
                            onClick={() => void copyText(selectedScript, 'script')}
                            className="text-[11px] font-semibold text-ink-soft hover:text-ink inline-flex items-center gap-1"
                          >
                            {copied === 'script' ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                            <span>{copied === 'script' ? 'Скопировано' : 'Копировать'}</span>
                          </button>
                        </div>
                        <p className="text-xs text-ink-soft leading-relaxed">{selectedScript}</p>
                      </div>
                    )}
                  </div>

                  {/* Calculation history, only when the server has entries */}
                  {selectedLead.calculationHistory && selectedLead.calculationHistory.length > 0 && (
                    <div className="p-4 rounded-[12px] border border-ink/15 bg-white space-y-2.5">
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-olive" aria-hidden="true" />
                        <span>История</span>
                      </div>
                      <ol className="space-y-2 border-l-2 border-brass/60 pl-3">
                        {selectedLead.calculationHistory.map((entry, idx) => (
                          <li key={idx} className="text-[11px] space-y-0.5">
                            <div className="flex items-center justify-between gap-2 text-olive font-mono">
                              <span>{entry.timestamp}</span>
                              {formatMoney(entry.calculatedPrice) && <span className="text-ink font-semibold">{formatMoney(entry.calculatedPrice)}</span>}
                            </div>
                            <div className="font-semibold text-ink">{entry.action}</div>
                            {[entry.houseTitle, entry.size ? `${entry.size} м²` : null, entry.insulation].filter(Boolean).length > 0 && (
                              <div className="text-olive">
                                {[entry.houseTitle, entry.size ? `${entry.size} м²` : null, entry.insulation].filter(Boolean).join(' · ')}
                              </div>
                            )}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="p-4 rounded-[12px] border border-ink/15 bg-white space-y-2">
                    <label htmlFor="crm-notes" className="text-[11px] font-semibold text-olive block">
                      Заметка менеджера
                    </label>
                    <textarea
                      id="crm-notes"
                      value={notesDraft}
                      onChange={(e) => setNotesDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') void saveNotes();
                      }}
                      rows={3}
                      maxLength={2000}
                      placeholder="Участок, договорённости, когда перезвонить"
                      className="w-full px-3 py-2 rounded-[10px] bg-paper-deep border border-ink/15 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brass/60"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-olive">{notesDirty ? 'Есть несохранённые изменения' : 'Всё сохранено'}</span>
                      <button
                        type="button"
                        onClick={() => void saveNotes()}
                        disabled={!notesDirty || savingNotes}
                        className="h-9 px-4 rounded-[10px] bg-ink text-paper text-xs font-semibold disabled:opacity-40"
                      >
                        {savingNotes ? 'Сохраняю…' : 'Сохранить'}
                      </button>
                    </div>
                  </div>

                  {selectedLead.giftsSelected && selectedLead.giftsSelected.length > 0 && (
                    <div className="text-xs text-ink-soft">
                      <span className="text-[11px] font-semibold text-olive block mb-1">Подарки в заявке</span>
                      {selectedLead.giftsSelected.join(' · ')}
                    </div>
                  )}

                  {selectedLead.utm && Object.values(selectedLead.utm).some(Boolean) && (
                    <div className="text-[11px] text-ink-soft">
                      <span className="font-semibold text-olive block mb-1">Источник (UTM)</span>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(selectedLead.utm)
                          .filter(([, v]) => Boolean(v))
                          .map(([key, val]) => (
                            <span key={key} className="px-2 py-0.5 rounded bg-ink/10 font-mono text-[10px]">
                              {key}: {val}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Destructive action: two steps */}
                  <div className="pt-3 border-t border-ink/15 flex items-center justify-between gap-2">
                    {deleteArmed ? (
                      <>
                        <span className="text-xs text-rose-700 font-semibold">Удалить заявку безвозвратно?</span>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => setDeleteArmed(false)} className="px-3 py-2 rounded-[10px] text-xs font-semibold border border-ink/20">
                            Отмена
                          </button>
                          <button
                            type="button"
                            onClick={() => void removeLead(selectedLead)}
                            className="px-3 py-2 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Удалить</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] text-olive">Заявка с сайта, id {selectedLead.id}</span>
                        <button
                          type="button"
                          onClick={() => void removeLead(selectedLead)}
                          className="px-3 py-2 rounded-[10px] text-xs font-semibold text-rose-700 hover:bg-rose-50 inline-flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Удалить</span>
                        </button>
                      </>
                    )}
                  </div>
                </aside>
              )}
            </div>
          </>
        )}

        {/* Footer: quiet diagnostics */}
        <footer className="px-4 sm:px-6 py-2 border-t border-ink/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-olive">
          <button
            type="button"
            onClick={async () => {
              const res = await testUnauthorizedRequest();
              showToast('ok', `Запрос без авторизации → HTTP ${res.status}`);
            }}
            className="underline-offset-2 hover:underline"
          >
            Проверить защиту API
          </button>
          <span>
            Всего заявок: {leads.length}
            {hasActiveFilters ? ` · показано: ${filteredLeads.length}` : ''}
          </span>
        </footer>

        {/* Toast */}
        {toast && (
          <div
            role="status"
            aria-live="polite"
            className={`absolute bottom-14 left-1/2 -translate-x-1/2 px-4 py-2 rounded-[12px] text-xs font-semibold shadow-none border ${
              toast.tone === 'ok'
                ? 'bg-forest text-cream border-cream/20'
                : 'bg-rose-600 text-white border-rose-700'
            }`}
          >
            {toast.text}
          </div>
        )}
      </div>
    </div>
  );
};

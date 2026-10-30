import React, { useState, useEffect } from 'react';
import { X, Download, Trash2, Shield, Phone, Clock, FileSpreadsheet, Check } from 'lucide-react';
import { StoredLead, getStoredLeads, exportLeadsCsv } from '../utils/leads';
import { playUiClick } from '../utils/sound';

interface AdminLeadsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLeadsDrawer: React.FC<AdminLeadsDrawerProps> = ({ isOpen, onClose }) => {
  const [leads, setLeads] = useState<StoredLead[]>([]);
  const [search, setSearch] = useState('');

  const refreshLeads = () => {
    setLeads(getStoredLeads());
  };

  useEffect(() => {
    refreshLeads();
    const handleUpdate = () => refreshLeads();
    window.addEventListener('leads_updated', handleUpdate);
    return () => window.removeEventListener('leads_updated', handleUpdate);
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = leads.filter(
    (l) =>
      l.phone.includes(search) ||
      (l.houseTitle && l.houseTitle.toLowerCase().includes(search.toLowerCase())) ||
      l.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleClearAll = () => {
    if (window.confirm('Очистить локальный архив заявок?')) {
      localStorage.removeItem('karkasnik_leads_archive');
      refreshLeads();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-xl h-full shadow-2xl border-l border-white/20 p-6 sm:p-8 flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E6B860]/20 flex items-center justify-center text-[#B27D18] dark:text-[#E6B860]">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-neutral-900 dark:text-neutral-100">
                  CRM-Панель Лидов
                </h3>
                <span className="text-xs text-neutral-500">
                  Всего заявок: {leads.length}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playUiClick('tick');
                  exportLeadsCsv(leads);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#E6B860] hover:bg-[#D4A043] text-[#1E1705] text-xs font-semibold flex items-center gap-1.5 transition-all gold-glow"
                title="Экспорт в Excel / CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="my-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по телефону или проекту..."
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#E6B860]"
            />
          </div>
        </div>

        {/* Lead List Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              Заявок не найдено
            </div>
          ) : (
            filtered.map((lead) => (
              <div
                key={lead.id}
                className="p-4 rounded-2xl bg-white/70 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#B27D18] dark:text-[#E6B860]">
                    {lead.id}
                  </span>
                  <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {lead.timestamp}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <a
                    href={`tel:${lead.phone.replace(/\D/g, '')}`}
                    className="font-bold text-sm text-neutral-900 dark:text-neutral-100 hover:text-[#B27D18] dark:hover:text-[#E6B860] flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#E6B860]" />
                    <span>{lead.phone}</span>
                  </a>

                  {lead.calculatedPrice && (
                    <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                      ≈ {lead.calculatedPrice.toLocaleString('ru-RU')} ₽
                    </span>
                  )}
                </div>

                {lead.houseTitle && (
                  <div className="text-neutral-600 dark:text-neutral-300">
                    <span className="text-neutral-400">Проект: </span>
                    <span className="font-medium">{lead.houseTitle}</span>
                  </div>
                )}

                {lead.giftsSelected && lead.giftsSelected.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1">
                    {lead.giftsSelected.map((g, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px]"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer controls */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          <button
            onClick={handleClearAll}
            className="text-neutral-400 hover:text-rose-500 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Очистить архив</span>
          </button>
          <span>Синхронизировано локально</span>
        </div>
      </div>
    </div>
  );
};

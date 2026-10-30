import React, { useState } from 'react';
import { MessageCircle, Send, X, PhoneCall } from 'lucide-react';
import { playUiClick } from '../utils/sound';

export const MessengerFloating: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-5 z-40 flex flex-col items-end gap-2.5">
      {isOpen && (
        <div className="glass-panel p-4 rounded-2xl shadow-2xl border border-white/20 mb-2 w-64 space-y-2.5 animate-fade-in text-neutral-900 dark:text-neutral-100">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
            <span className="text-xs font-bold font-display">Напишите инженеру:</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <a
            href="https://t.me/telegram"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playUiClick('tap')}
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] text-xs font-semibold transition-colors"
          >
            <Send className="w-4 h-4 shrink-0" />
            <span>Telegram (ответим за 2 мин)</span>
          </a>

          <a
            href="https://wa.me/74951520242"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playUiClick('tap')}
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] text-xs font-semibold transition-colors"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>WhatsApp (расчёт сметы)</span>
          </a>

          <a
            href="tel:+74951520242"
            onClick={() => playUiClick('tap')}
            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#E6B860]/15 hover:bg-[#E6B860]/25 text-[#B27D18] dark:text-[#E6B860] text-xs font-semibold transition-colors"
          >
            <PhoneCall className="w-4 h-4 shrink-0" />
            <span>+7 (495) 152-02-42</span>
          </a>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => {
          playUiClick('tick');
          setIsOpen(!isOpen);
        }}
        className="w-13 h-13 rounded-full bg-[#183B30] hover:bg-[#122A21] text-[#E6B860] border border-[#E6B860]/40 shadow-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 relative"
        aria-label="Быстрая связь в мессенджерах"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#E6B860] animate-pulse" />
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};

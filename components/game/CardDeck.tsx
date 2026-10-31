'use client';

import React from 'react';
import { SpecialCard } from '@/lib/types';
import { SPECIAL_CARDS } from '@/lib/storage';
import { Crown, Sparkles, Hand, Swords } from 'lucide-react';
import { sound } from '@/lib/sound';

interface CardDeckProps {
  onUseCard: (cardId: SpecialCard['id']) => void;
  userGems: number;
  disabled?: boolean;
  activeCard?: SpecialCard['id'] | null;
}

export default function CardDeck({
  onUseCard,
  userGems,
  disabled = false,
  activeCard,
}: CardDeckProps) {
  const getIcon = (id: SpecialCard['id']) => {
    switch (id) {
      case 'shah_gol':
        return <Crown className="w-5 h-5 text-amber-400" />;
      case 'booye_gol':
        return <Sparkles className="w-5 h-5 text-pink-400" />;
      case 'daste_khali':
        return <Hand className="w-5 h-5 text-cyan-400" />;
      case 'duel':
        return <Swords className="w-5 h-5 text-rose-400" />;
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none">
      {SPECIAL_CARDS.map((card) => {
        const isActive = activeCard === card.id;
        const canAfford = userGems >= card.costInGems;

        return (
          <button
            key={card.id}
            disabled={disabled || !canAfford}
            onClick={() => {
              sound.playCardFlip();
              onUseCard(card.id);
            }}
            title={`${card.nameFa} - ${card.descriptionFa}`}
            className={`relative group flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 text-xs font-medium whitespace-nowrap active:scale-95 ${
              isActive
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : canAfford
                ? 'bg-slate-900/80 border-slate-700 hover:border-amber-500/50 hover:bg-slate-800 text-slate-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="p-1 rounded-lg bg-black/40 border border-white/5">
              {getIcon(card.id)}
            </div>

            <div className="text-right">
              <div className="font-bold">{card.nameFa}</div>
              <div className="flex items-center gap-1 text-[10px] text-cyan-400">
                <span>{card.costInGems}</span>
                <span className="text-[9px]">💎</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

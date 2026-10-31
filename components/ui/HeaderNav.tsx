'use client';

import React, { useState } from 'react';
import { UserWallet } from '@/lib/types';
import { sound } from '@/lib/sound';
import { formatNumber } from '@/lib/utils';
import {
  Coins,
  Gem,
  Plus,
  ShoppingBag,
  User,
  Volume2,
  VolumeX,
  HelpCircle,
  Crown,
  Sparkles,
} from 'lucide-react';

interface HeaderNavProps {
  wallet: UserWallet;
  level: number;
  onOpenWallet: () => void;
  onOpenShop: () => void;
  onOpenProfile: () => void;
  onOpenHelp: () => void;
  onOpenLeaderboard: () => void;
  onOpenEvents: () => void;
}

export default function HeaderNav({
  wallet,
  level,
  onOpenWallet,
  onOpenShop,
  onOpenProfile,
  onOpenHelp,
  onOpenLeaderboard,
  onOpenEvents,
}: HeaderNavProps) {
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/20 bg-[#07090f]/90 backdrop-blur-md px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-xl select-none">
      {/* Brand & Logo */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-lg sm:text-xl">
            🌸
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-sm sm:text-base text-white tracking-wide">
              گل یا پوچ ۳D
            </span>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
              PRO
            </span>
          </div>
          <p className="text-[10px] text-slate-400 hidden lg:block">
            اولین پلتفرم مسابقات آنلاین و سه‌بعدی
          </p>
        </div>
      </div>

      {/* Center / Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Leaderboard button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenLeaderboard();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 text-amber-300 transition-all text-xs font-bold"
          title="تابلوی امتیازات جهانی و دوستانه"
        >
          <span className="text-sm">🏆</span>
          <span className="hidden sm:inline">رتبه‌بندی</span>
        </button>

        {/* Special Events & Daily Challenges button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenEvents();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500/20 to-amber-500/20 border border-rose-500/40 hover:border-rose-400 text-rose-300 transition-all text-xs font-bold"
          title="چالش‌های روزانه و تورنمنت‌های ویژه"
        >
          <span className="text-sm animate-pulse">🔥</span>
          <span className="hidden sm:inline">رویدادها</span>
        </button>

        {/* Coins button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenWallet();
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 text-amber-300 transition-all group"
          title="افزایش موجودی سکه"
        >
          <Coins className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="font-black font-num text-xs sm:text-sm" suppressHydrationWarning>
            {formatNumber(wallet.coins)}
          </span>
          <div className="w-3.5 h-3.5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[9px] ml-0.5">
            <Plus className="w-2.5 h-2.5" />
          </div>
        </button>

        {/* Gems */}
        <div
          onClick={() => {
            sound.playClick();
            onOpenWallet();
          }}
          className="cursor-pointer hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-cyan-300"
          title="موجودی الماس‌های سلطنتی"
        >
          <Gem className="w-4 h-4 text-cyan-400" />
          <span className="font-black font-num text-xs sm:text-sm" suppressHydrationWarning>
            {formatNumber(wallet.gems)}
          </span>
        </div>

        {/* Shop Button */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenShop();
          }}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-amber-600/20 border border-amber-500/40 hover:border-amber-400 text-amber-200 transition-all text-xs font-bold"
        >
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span className="hidden md:inline">فروشگاه</span>
        </button>

        {/* User Profile */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenProfile();
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-white transition-all text-xs font-bold"
        >
          <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">
            👑
          </div>
          <span className="hidden sm:inline">لول {level}</span>
        </button>

        {/* Help / Guide */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenHelp();
          }}
          className="w-8 h-8 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          title="راهنمای قوانین بازی و کارت‌ها"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Sound toggle */}
        <button
          onClick={() => {
            const next = !isMuted;
            sound.setMuted(next);
            setIsMuted(next);
          }}
          className="w-8 h-8 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          title={isMuted ? 'فعال کردن صدا' : 'قطع صدا'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>
    </header>
  );
}

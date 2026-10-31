'use client';

import React from 'react';
import { UserStats, UserWallet } from '@/lib/types';
import { sound } from '@/lib/sound';
import { formatNumber } from '@/lib/utils';
import {
  X,
  User,
  Trophy,
  Award,
  Zap,
  Target,
  Flame,
  Coins,
  ShieldCheck,
  Star,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  wallet: UserWallet;
  level: number;
  xp: number;
  unlocks?: import('@/lib/storage').UnlockedState;
  onUpdateUnlocks?: (newUnlocks: import('@/lib/storage').UnlockedState) => void;
}

const ACHIEVEMENTS = [
  {
    id: 'first_win',
    title: 'نخستین شکار گل',
    desc: 'یک بازی را با موفقیت ببرید',
    reward: 1000,
    done: true,
  },
  {
    id: 'streak_3',
    title: 'طوفان پیروزی',
    desc: '۳ دست پیاپی بدون باخت بازی کنید',
    reward: 3500,
    done: true,
  },
  {
    id: 'shah_master',
    title: 'استاد شاه‌گل',
    desc: 'با کارت شاه‌گل در اولین ضربه حدس درست بزنید',
    reward: 10000,
    done: true,
  },
  {
    id: 'high_roller',
    title: 'سرمایه‌دار بزرگ',
    desc: 'مجموع بردهای خود را به بیش از ۵۰,۰۰۰ سکه برسانید',
    reward: 20000,
    done: true,
  },
];

export default function ProfileModal({
  isOpen,
  onClose,
  stats,
  wallet,
  level,
  xp,
  unlocks,
  onUpdateUnlocks,
}: ProfileModalProps) {
  if (!isOpen) return null;

  const winRate =
    stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  const xpNeeded = level * 1000;
  const xpPercent = Math.min(100, Math.round((xp / xpNeeded) * 100));

  let rankTitle = 'مبتدی جویای نام';
  let rankBadge = '🥉';
  let rankColor = 'text-amber-600';

  if (level >= 20) {
    rankTitle = 'گرند مستر گل یا پوچ ایران';
    rankBadge = '💎';
    rankColor = 'text-cyan-400';
  } else if (level >= 10) {
    rankTitle = 'شاه‌گل‌باز حرفه‌ای';
    rankBadge = '🥇';
    rankColor = 'text-amber-400';
  } else if (level >= 5) {
    rankTitle = 'سلطان بلوف پایتخت';
    rankBadge = '🥈';
    rankColor = 'text-slate-300';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-[#111625] to-[#090c14] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                شناسنامه و پروفایل حرفه‌ای
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  لول {level}
                </span>
              </h2>
              <p className="text-xs text-slate-400">کارنامه رتبه‌بندی، نرخ برد و افتخارات</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main User Identity Badge */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/30 flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-300 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-3xl">
                  {rankBadge}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded-md">
                Lvl {level}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white">بازیکن برتر (Master Player)</h3>
                <span className={`text-xs font-bold ${rankColor}`}>{rankTitle}</span>
              </div>

              {/* XP Bar */}
              <div className="mt-2">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>پیشرفت به سطح بعدی:</span>
                  <span className="font-num text-amber-300" suppressHydrationWarning>
                    {formatNumber(xp)} / {formatNumber(xpNeeded)} XP
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 text-center">
              <Target className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-[11px] text-slate-400">تعداد مسابقات</div>
              <div className="text-base font-black text-white font-num mt-0.5">
                {stats.gamesPlayed}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 text-center">
              <Trophy className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <div className="text-[11px] text-slate-400">نرخ پیروزی</div>
              <div className="text-base font-black text-emerald-400 font-num mt-0.5">{winRate}٪</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 text-center">
              <Flame className="w-5 h-5 text-rose-400 mx-auto mb-1" />
              <div className="text-[11px] text-slate-400">بیشترین برد متوالی</div>
              <div className="text-base font-black text-rose-400 font-num mt-0.5">
                {stats.bestStreak} دست
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 text-center">
              <Coins className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <div className="text-[11px] text-slate-400">مجموع بردهای نقدی</div>
              <div className="text-base font-black text-amber-300 font-num mt-0.5" suppressHydrationWarning>
                {formatNumber(stats.totalCoinsWon)}
              </div>
            </div>
          </div>

          {/* 3D Character & Avatar Customization */}
          {unlocks && onUpdateUnlocks && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-3">
              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-400" />
                تنظیمات کاراکتر سه‌بعدی و هوش مصنوعی مسابقات:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* User Gender */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400">جنسیت شما:</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        sound.playClick();
                        onUpdateUnlocks({ ...unlocks, userGender: 'male' });
                      }}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        unlocks.userGender === 'male'
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      👨 مرد
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        onUpdateUnlocks({ ...unlocks, userGender: 'female' });
                      }}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        unlocks.userGender === 'female'
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      👩 زن
                    </button>
                  </div>
                </div>

                {/* Opponent Gender */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400">جنسیت حریف:</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        sound.playClick();
                        onUpdateUnlocks({ ...unlocks, opponentGender: 'female' });
                      }}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        unlocks.opponentGender === 'female'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      👩 زن
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        onUpdateUnlocks({ ...unlocks, opponentGender: 'male' });
                      }}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        unlocks.opponentGender === 'male'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      👨 مرد
                    </button>
                  </div>
                </div>

                {/* Character Style */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400">سبک طراحی:</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        sound.playClick();
                        onUpdateUnlocks({ ...unlocks, userStyle: 'anime' });
                      }}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        unlocks.userStyle === 'anime'
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      ✨ انیمه
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        onUpdateUnlocks({ ...unlocks, userStyle: 'human' });
                      }}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        unlocks.userStyle === 'human'
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      👤 انسان
                    </button>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/5 flex items-center justify-between">
                  <span className="text-slate-400">سطح فریب و هوش:</span>
                  <div className="flex gap-1">
                    {(['casual', 'pro', 'grandmaster'] as const).map((d) => (
                      <button
                        key={d}
                        onClick={() => {
                          sound.playClick();
                          onUpdateUnlocks({ ...unlocks, difficulty: d });
                        }}
                        className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                          unlocks.difficulty === d
                            ? d === 'grandmaster'
                              ? 'bg-rose-600 text-white shadow-md'
                              : d === 'pro'
                              ? 'bg-amber-500 text-black shadow-md'
                              : 'bg-emerald-600 text-white shadow-md'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {d === 'casual' ? 'آسان' : d === 'pro' ? 'حرفه‌ای' : 'استاد'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Achievements */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              افتخارات و مدال‌های کسب شده:
            </h4>
            <div className="space-y-2">
              {ACHIEVEMENTS.map((ach) => (
                <div
                  key={ach.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{ach.title}</div>
                      <div className="text-[11px] text-slate-400">{ach.desc}</div>
                    </div>
                  </div>
                  <div className="text-xs font-black text-amber-400 font-num flex items-center gap-1" suppressHydrationWarning>
                    <span>+{formatNumber(ach.reward)}</span>
                    <span>🪙</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

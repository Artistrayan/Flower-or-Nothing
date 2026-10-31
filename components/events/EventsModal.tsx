'use client';

import React, { useState } from 'react';
import { DailyChallenge, SpecialEvent, UserWallet } from '@/lib/types';
import { sound } from '@/lib/sound';
import { formatNumber } from '@/lib/utils';
import {
  X,
  Sparkles,
  Calendar,
  Flame,
  CheckCircle2,
  Clock,
  Gift,
  Coins,
  Gem,
  Award,
  ChevronLeft,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenges: DailyChallenge[];
  onUpdateChallenges: (challenges: DailyChallenge[]) => void;
  events: SpecialEvent[];
  onUpdateEvents: (events: SpecialEvent[]) => void;
  wallet: UserWallet;
  onUpdateWallet: (wallet: UserWallet) => void;
  onAddTransaction: (tx: {
    type: 'daily_reward' | 'win';
    amount: number;
    descriptionFa: string;
  }) => void;
  onSelectEventMode: (mode: SpecialEvent['mode']) => void;
}

export default function EventsModal({
  isOpen,
  onClose,
  challenges,
  onUpdateChallenges,
  events,
  onUpdateEvents,
  wallet,
  onUpdateWallet,
  onAddTransaction,
  onSelectEventMode,
}: EventsModalProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'events'>('daily');

  if (!isOpen) return null;

  const handleClaimChallenge = (challengeId: string) => {
    const ch = challenges.find((c) => c.id === challengeId);
    if (!ch || !ch.isCompleted || ch.isClaimed) return;

    sound.playCoinsWin();
    sound.playVictory();
    confetti({ particleCount: 50, spread: 70 });

    const newWallet: UserWallet = {
      ...wallet,
      coins: wallet.coins + ch.rewardCoins,
      gems: wallet.gems + ch.rewardGems,
    };
    onUpdateWallet(newWallet);

    onAddTransaction({
      type: 'daily_reward',
      amount: ch.rewardCoins,
      descriptionFa: `پاداش تکمیل چالش: ${ch.titleFa} (+${formatNumber(ch.rewardCoins)} سکه ${
        ch.rewardGems ? `+${ch.rewardGems} الماس` : ''
      })`,
    });

    const updated = challenges.map((c) =>
      c.id === challengeId ? { ...c, isClaimed: true } : c
    );
    onUpdateChallenges(updated);
  };

  const handleJoinEvent = (eventId: string) => {
    sound.playClick();
    const evt = events.find((e) => e.id === eventId);
    if (!evt) return;

    const updated = events.map((e) =>
      e.id === eventId ? { ...e, isJoined: true, currentPoints: e.currentPoints + 30 } : e
    );
    onUpdateEvents(updated);
    onClose();
    onSelectEventMode(evt.mode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#111625] to-[#090c14] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Calendar className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                رویدادهای ویژه و چالش‌های روزانه
                <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/30">
                  زمان‌دار
                </span>
              </h2>
              <p className="text-xs text-slate-400">ماموریت‌های روزانه با جوایز سکه، الماس، XP و تورنمنت‌های فصلی</p>
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

        {/* Tab switchers: Daily Challenges vs Special Events */}
        <div className="flex border-b border-white/5 bg-slate-950/60 px-6 gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('daily');
            }}
            className={`py-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'daily'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            چالش‌های روزانه (Daily Quests)
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('events');
            }}
            className={`py-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'events'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4" />
            تورنمنت‌های ویژه (Special Events)
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'daily' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-3 rounded-2xl border border-white/5">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>زمان باقی‌مانده تا ریست چالش‌ها:</span>
                  <strong className="text-amber-300 font-num">۱۴:۴۵:۲۲</strong>
                </span>
                <span className="text-emerald-400 font-bold">
                  {challenges.filter((c) => c.isCompleted).length} از {challenges.length} تکمیل شده
                </span>
              </div>

              <div className="space-y-3">
                {challenges.map((ch) => {
                  const progressPct = Math.min(100, Math.round((ch.current / ch.target) * 100));

                  return (
                    <div
                      key={ch.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
                        ch.isClaimed
                          ? 'bg-slate-950/40 border-slate-900 opacity-60'
                          : ch.isCompleted
                          ? 'bg-amber-500/10 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                          : 'bg-slate-900/70 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                          {ch.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-white">{ch.titleFa}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{ch.descFa}</p>

                          {/* Progress bar */}
                          <div className="mt-2 flex items-center gap-2">
                            <div className="w-36 h-2 rounded-full bg-slate-800 overflow-hidden border border-white/5">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-num text-slate-400">
                              {ch.current} / {ch.target}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Reward & Claim button */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <div className="text-right text-xs">
                          <div className="font-bold text-amber-400 font-num" suppressHydrationWarning>
                            +{formatNumber(ch.rewardCoins)} 🪙
                          </div>
                          {ch.rewardGems > 0 && (
                            <div className="text-cyan-400 font-bold font-num text-[11px]">
                              +{ch.rewardGems} 💎
                            </div>
                          )}
                        </div>

                        {ch.isClaimed ? (
                          <div className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-500 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            دریافت شد
                          </div>
                        ) : ch.isCompleted ? (
                          <button
                            onClick={() => handleClaimChallenge(ch.id)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-black text-xs shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95 transition-all flex items-center gap-1.5"
                          >
                            <Gift className="w-4 h-4" />
                            دریافت جایزه
                          </button>
                        ) : (
                          <div className="px-3 py-1.5 rounded-xl bg-slate-800/60 text-slate-400 text-xs font-medium">
                            در حال پیشرفت
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-4">
              {events.map((evt) => {
                const progressPct = Math.min(
                  100,
                  Math.round((evt.currentPoints / evt.targetPoints) * 100)
                );

                return (
                  <div
                    key={evt.id}
                    className={`relative p-5 rounded-3xl border border-white/10 bg-gradient-to-r ${evt.bannerGradient} overflow-hidden shadow-xl space-y-4`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/40 border border-white/10 text-amber-300 text-[10px] font-bold mb-2">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>پایان رویداد در {evt.endsInHours} ساعت</span>
                        </div>
                        <h3 className="text-base font-black text-white flex items-center gap-2">
                          <span>{evt.badge}</span>
                          <span>{evt.titleFa}</span>
                        </h3>
                        <p className="text-xs text-slate-200/90 mt-1 leading-relaxed max-w-lg">
                          {evt.descFa}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-black/60 border border-amber-500/30 text-center shrink-0">
                        <div className="text-[10px] text-amber-300">جایزه بزرگ رویداد:</div>
                        <div className="text-base font-black text-amber-400 font-num" suppressHydrationWarning>
                          {formatNumber(evt.grandPrizeCoins)} 🪙
                        </div>
                        <div className="text-[9px] text-cyan-300 mt-0.5">{evt.rewardTitleFa}</div>
                      </div>
                    </div>

                    {/* Progress to target */}
                    <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex-1 w-full">
                        <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                          <span>امتیاز جمع‌آوری شده در رویداد:</span>
                          <span className="font-num text-amber-300">
                            {evt.currentPoints} / {evt.targetPoints} امتیاز
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-900/80 overflow-hidden border border-white/10">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-yellow-200 rounded-full transition-all"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoinEvent(evt.id)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-black text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <Zap className="w-4 h-4 fill-black" />
                        <span>{evt.isJoined ? 'ورود به مسابقه رویداد' : 'شرکت در رویداد'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

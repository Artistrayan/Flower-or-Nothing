'use client';

import React, { useState } from 'react';
import { UserWallet, WalletTransaction } from '@/lib/types';
import { sound } from '@/lib/sound';
import { formatNumber } from '@/lib/utils';
import {
  X,
  Coins,
  Gem,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  RotateCw,
  Gift,
  ShieldCheck,
  Percent,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: UserWallet;
  onUpdateWallet: (newWallet: UserWallet) => void;
  transactions: WalletTransaction[];
  onAddTransaction: (tx: Omit<WalletTransaction, 'id' | 'timestamp'>) => void;
}

const WHEEL_PRIZES = [
  { label: '۱,۰۰۰', coins: 1000, gems: 0, color: '#3b82f6' },
  { label: '۲,۵۰۰', coins: 2500, gems: 0, color: '#10b981' },
  { label: '💎 ۵', coins: 0, gems: 5, color: '#06b6d4' },
  { label: '۵,۰۰۰', coins: 5000, gems: 0, color: '#f59e0b' },
  { label: '۱۰,۰۰۰', coins: 10000, gems: 2, color: '#8b5cf6' },
  { label: '💎 ۲۰', coins: 0, gems: 20, color: '#ec4899' },
  { label: '۲۵,۰۰۰', coins: 25000, gems: 5, color: '#ef4444' },
  { label: '۵۰,۰۰۰ 👑', coins: 50000, gems: 10, color: '#eab308' },
];

export default function WalletModal({
  isOpen,
  onClose,
  wallet,
  onUpdateWallet,
  transactions,
  onAddTransaction,
}: WalletModalProps) {
  const [activeTab, setActiveTab] = useState<'balance' | 'wheel' | 'history'>('balance');
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<(typeof WHEEL_PRIZES)[0] | null>(null);

  if (!isOpen) return null;

  const handleClaimFreeBonus = (amount: number, gemCount: number = 0) => {
    sound.playCoinsWin();
    const newWallet: UserWallet = {
      ...wallet,
      coins: wallet.coins + amount,
      gems: wallet.gems + gemCount,
    };
    onUpdateWallet(newWallet);
    onAddTransaction({
      type: 'daily_reward',
      amount,
      descriptionFa: `بونوس شارژ سریع (+${formatNumber(amount)} سکه)`,
    });
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setWonPrize(null);

    // Pick random index
    const prizeIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);
    const sliceAngle = 360 / WHEEL_PRIZES.length;
    // Calculate final angle (extra spins + target slice)
    const extraRounds = 5 + Math.floor(Math.random() * 3);
    const targetDeg = extraRounds * 360 + (360 - (prizeIndex * sliceAngle + sliceAngle / 2));

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current % 4 === 0) sound.playWheelTick();
    }, 40);

    setWheelRotation(targetDeg);

    setTimeout(() => {
      clearInterval(interval);
      setIsSpinning(false);
      const prize = WHEEL_PRIZES[prizeIndex];
      setWonPrize(prize);
      sound.playVictory();
      sound.playCoinsWin();

      const newWallet: UserWallet = {
        ...wallet,
        coins: wallet.coins + prize.coins,
        gems: wallet.gems + prize.gems,
        lastDailyClaim: Date.now(),
      };
      onUpdateWallet(newWallet);

      onAddTransaction({
        type: 'daily_reward',
        amount: prize.coins,
        descriptionFa: `جایزه گردونه شانس (+${formatNumber(prize.coins)} سکه ${
          prize.gems ? `+${prize.gems} الماس` : ''
        })`,
      });

      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
      });
    }, 3800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#111625] to-[#090c14] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Coins className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                کیف پول و خزانه اختصاصی
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  امن و فوری
                </span>
              </h2>
              <p className="text-xs text-slate-400">مدیریت دارایی‌ها، گردونه شانس و تاریخچه تراکنش‌ها</p>
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

        {/* Tab Navigation */}
        <div className="flex border-b border-white/5 bg-slate-950/40 px-6 gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('balance');
            }}
            className={`py-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'balance'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            موجودی و شارژ
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('wheel');
            }}
            className={`py-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'wheel'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCw className="w-4 h-4" />
            گردونه شانس روزانه
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('history');
            }}
            className={`py-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            تراکنش‌ها و کارمزد
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'balance' && (
            <div className="space-y-6">
              {/* Balances summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-amber-300/80 mb-1 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      موجودی سکه طلا
                    </div>
                    <div className="text-2xl font-black text-amber-400 font-num" suppressHydrationWarning>
                      {formatNumber(wallet.coins)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">قابل استفاده برای ورودی مسابقات</div>
                  </div>
                  <div className="text-3xl">🪙</div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-cyan-900/20 to-slate-900 border border-cyan-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-cyan-300/80 mb-1 flex items-center gap-1">
                      <Gem className="w-3.5 h-3.5" />
                      موجودی الماس سلطنتی
                    </div>
                    <div className="text-2xl font-black text-cyan-400 font-num" suppressHydrationWarning>
                      {formatNumber(wallet.gems)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">خرید کارت‌های بلوف و شاه‌گل</div>
                  </div>
                  <div className="text-3xl">💎</div>
                </div>
              </div>

              {/* Instant Bonus Options */}
              <div>
                <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-400" />
                  بسته‌های شارژ فوری سکه (آزمایشی و بونوس):
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleClaimFreeBonus(10000, 2)}
                    className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-amber-500/60 text-right group transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-300">بسته برنزی</span>
                      <span className="text-xs text-amber-400 font-bold">رایگان</span>
                    </div>
                    <div className="text-lg font-black text-white font-num">+۱۰,۰۰۰ سکه</div>
                    <div className="text-xs text-cyan-400 mt-0.5">+۲ الماس 💎</div>
                  </button>

                  <button
                    onClick={() => handleClaimFreeBonus(50000, 10)}
                    className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 text-right group transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-br-lg">
                      ویژه
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-300">بسته طلایی</span>
                      <span className="text-xs text-amber-400 font-bold">بونوس</span>
                    </div>
                    <div className="text-lg font-black text-amber-400 font-num">+۵۰,۰۰۰ سکه</div>
                    <div className="text-xs text-cyan-400 mt-0.5">+۱۰ الماس 💎</div>
                  </button>

                  <button
                    onClick={() => handleClaimFreeBonus(200000, 30)}
                    className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 text-right group transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-300">بسته VIP دایموند</span>
                      <span className="text-xs text-cyan-400 font-bold">مخصوص گرند مستر</span>
                    </div>
                    <div className="text-lg font-black text-cyan-300 font-num">+۲۰۰,۰۰۰ سکه</div>
                    <div className="text-xs text-cyan-400 mt-0.5">+۳۰ الماس 💎</div>
                  </button>
                </div>
              </div>

              {/* Commission policy explanation */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
                <Percent className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">شفافیت کمیسیون پلتفرم: </span>
                  در هر مسابقه، بسته به سطح تالار انتخابی بین ۴٪ تا ۷٪ از کل پات جایزه به عنوان کارمزد میزبانی، سرورهای بلادرنگ و امنیت بازی کسر می‌گردد و مابقی بلافاصله به کیف پول برنده واریز می‌شود.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wheel' && (
            <div className="flex flex-col items-center justify-center py-2 space-y-6">
              <div className="text-center">
                <h3 className="text-base font-black text-amber-300 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  گردونه شانس روزانه گل یا پوچ
                </h3>
                <p className="text-xs text-slate-400 mt-1">هر ۲۴ ساعت یک بار شانس خود را محک بزنید و سکه و الماس برنده شوید!</p>
              </div>

              {/* The Wheel */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                {/* Needle pointer on top */}
                <div className="absolute -top-3 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[22px] border-t-amber-400 filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]" />

                <div
                  className="w-full h-full rounded-full border-4 border-amber-500/80 shadow-[0_0_35px_rgba(245,158,11,0.3)] relative overflow-hidden transition-transform duration-[3800ms] ease-out"
                  style={{ transform: `rotate(${wheelRotation}deg)` }}
                >
                  {WHEEL_PRIZES.map((prize, idx) => {
                    const angle = (360 / WHEEL_PRIZES.length) * idx;
                    return (
                      <div
                        key={idx}
                        className="absolute w-1/2 h-full top-0 right-0 origin-left flex items-center justify-center"
                        style={{
                          transform: `rotate(${angle}deg)`,
                          backgroundColor: prize.color,
                        }}
                      >
                        <div
                          className="text-[11px] font-black text-white transform -rotate-90 translate-x-12 select-none"
                          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                        >
                          {prize.label}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Center hub */}
                <div className="absolute z-10 w-14 h-14 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center shadow-lg">
                  <span className="text-base">🎯</span>
                </div>
              </div>

              {wonPrize && (
                <div className="p-3 bg-amber-500/20 border border-amber-400 rounded-xl text-center animate-bounce">
                  <div className="text-xs text-amber-200">تبریک! برنده شدید:</div>
                  <div className="text-lg font-black text-amber-300 font-num" suppressHydrationWarning>
                    {formatNumber(wonPrize.coins)} سکه {wonPrize.gems > 0 ? `+ ${formatNumber(wonPrize.gems)} الماس` : ''}
                  </div>
                </div>
              )}

              <button
                disabled={isSpinning}
                onClick={spinWheel}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-50 active:scale-95 transition-all flex items-center gap-2"
              >
                <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                {isSpinning ? 'در حال چرخش...' : 'چرخش گردونه شانس'}
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>آخرین تراکنش‌ها (ورودی، بردها و کمیسیون)</span>
                <span className="text-[11px] text-amber-400">{transactions.length} رکورد</span>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">تراکنشی یافت نشد.</div>
              ) : (
                <div className="divide-y divide-white/5 bg-slate-950/60 rounded-2xl border border-white/5 overflow-hidden">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            tx.type === 'win' || tx.type === 'daily_reward' || tx.type === 'deposit'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {tx.type === 'win' || tx.type === 'daily_reward' || tx.type === 'deposit' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-200">{tx.descriptionFa}</div>
                          <div className="text-[10px] text-slate-400 font-num" suppressHydrationWarning>
                            {new Date(tx.timestamp).toLocaleTimeString('fa-IR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`font-black font-num ${
                          tx.type === 'win' || tx.type === 'daily_reward' || tx.type === 'deposit'
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                        suppressHydrationWarning
                      >
                        {tx.type === 'win' || tx.type === 'daily_reward' || tx.type === 'deposit' ? '+' : '-'}
                        {formatNumber(tx.amount)} 🪙
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

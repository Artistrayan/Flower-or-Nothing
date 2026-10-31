'use client';

import React, { useState } from 'react';
import {
  HAND_SKINS,
  JEWEL_SKINS,
  BLUFF_POSES,
  ARENA_SKINS,
  UnlockedState,
  saveUnlocks,
} from '@/lib/storage';
import { UserWallet } from '@/lib/types';
import { sound } from '@/lib/sound';
import { formatNumber } from '@/lib/utils';
import {
  X,
  ShoppingBag,
  Hand,
  Sparkles,
  Smile,
  Shield,
  Check,
  Coins,
  Crown,
  Eye,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: UserWallet;
  onUpdateWallet: (newWallet: UserWallet) => void;
  unlocks: UnlockedState;
  onUpdateUnlocks: (newUnlocks: UnlockedState) => void;
  onAddTransaction: (tx: { type: 'shop_purchase'; amount: number; descriptionFa: string }) => void;
}

export default function ShopModal({
  isOpen,
  onClose,
  wallet,
  onUpdateWallet,
  unlocks,
  onUpdateUnlocks,
  onAddTransaction,
}: ShopModalProps) {
  const [activeCategory, setActiveCategory] = useState<'hands' | 'jewels' | 'poses' | 'arenas'>(
    'hands'
  );

  if (!isOpen) return null;

  const handleBuyOrEquipHand = (skinId: string, price: number) => {
    const isUnlocked = unlocks.handSkins.includes(skinId);
    if (isUnlocked) {
      sound.playClick();
      const updated = { ...unlocks, selectedHand: skinId };
      onUpdateUnlocks(updated);
      saveUnlocks(updated);
      return;
    }

    if (wallet.coins < price) {
      sound.playClick();
      alert('موجودی سکه برای خرید این مدل کافی نیست!');
      return;
    }

    sound.playCoinsWin();
    const newWallet = { ...wallet, coins: wallet.coins - price };
    onUpdateWallet(newWallet);

    const updated = {
      ...unlocks,
      handSkins: [...unlocks.handSkins, skinId],
      selectedHand: skinId,
    };
    onUpdateUnlocks(updated);
    saveUnlocks(updated);

    const item = HAND_SKINS.find((h) => h.id === skinId);
    onAddTransaction({
      type: 'shop_purchase',
      amount: price,
      descriptionFa: `خرید اسکین دست: ${item?.nameFa || skinId}`,
    });

    confetti({ particleCount: 40, spread: 60 });
  };

  const handleBuyOrEquipJewel = (jewelId: string, price: number) => {
    const isUnlocked = unlocks.jewelSkins.includes(jewelId);
    if (isUnlocked) {
      sound.playGolFound();
      const updated = { ...unlocks, selectedJewel: jewelId };
      onUpdateUnlocks(updated);
      saveUnlocks(updated);
      return;
    }

    if (wallet.coins < price) {
      sound.playClick();
      alert('موجودی سکه کافی نیست!');
      return;
    }

    sound.playCoinsWin();
    const newWallet = { ...wallet, coins: wallet.coins - price };
    onUpdateWallet(newWallet);

    const updated = {
      ...unlocks,
      jewelSkins: [...unlocks.jewelSkins, jewelId],
      selectedJewel: jewelId,
    };
    onUpdateUnlocks(updated);
    saveUnlocks(updated);

    const item = JEWEL_SKINS.find((j) => j.id === jewelId);
    onAddTransaction({
      type: 'shop_purchase',
      amount: price,
      descriptionFa: `خرید مدل گل: ${item?.nameFa || jewelId}`,
    });

    confetti({ particleCount: 40, spread: 60 });
  };

  const handleBuyOrEquipPose = (poseId: string, price: number) => {
    const isUnlocked = unlocks.poses.includes(poseId);
    if (isUnlocked) {
      sound.playClick();
      const updated = { ...unlocks, selectedPose: poseId };
      onUpdateUnlocks(updated);
      saveUnlocks(updated);
      return;
    }

    if (wallet.coins < price) {
      sound.playClick();
      alert('موجودی سکه کافی نیست!');
      return;
    }

    sound.playCoinsWin();
    const newWallet = { ...wallet, coins: wallet.coins - price };
    onUpdateWallet(newWallet);

    const updated = {
      ...unlocks,
      poses: [...unlocks.poses, poseId],
      selectedPose: poseId,
    };
    onUpdateUnlocks(updated);
    saveUnlocks(updated);

    const item = BLUFF_POSES.find((p) => p.id === poseId);
    onAddTransaction({
      type: 'shop_purchase',
      amount: price,
      descriptionFa: `خرید پوزیشن بلوف: ${item?.nameFa || poseId}`,
    });
  };

  const handleBuyOrEquipArena = (arenaId: string, price: number) => {
    const isUnlocked = unlocks.arenas.includes(arenaId);
    if (isUnlocked) {
      sound.playClick();
      const updated = { ...unlocks, selectedArena: arenaId };
      onUpdateUnlocks(updated);
      saveUnlocks(updated);
      return;
    }

    if (wallet.coins < price) {
      sound.playClick();
      alert('موجودی سکه کافی نیست!');
      return;
    }

    sound.playCoinsWin();
    const newWallet = { ...wallet, coins: wallet.coins - price };
    onUpdateWallet(newWallet);

    const updated = {
      ...unlocks,
      arenas: [...unlocks.arenas, arenaId],
      selectedArena: arenaId,
    };
    onUpdateUnlocks(updated);
    saveUnlocks(updated);

    const item = ARENA_SKINS.find((a) => a.id === arenaId);
    onAddTransaction({
      type: 'shop_purchase',
      amount: price,
      descriptionFa: `خرید محیط و میز: ${item?.nameFa || arenaId}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#111625] to-[#090c14] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                فروشگاه مدل‌ها و پوزیشن‌های اختصاصی
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  سه‌بعدی و VIP
                </span>
              </h2>
              <p className="text-xs text-slate-400">خرید و تجهیز اسکین‌های دست، گل، پوزیشن‌های بلوف و میزها</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-amber-500/30 text-amber-400 font-num font-bold text-xs">
              <Coins className="w-4 h-4 text-amber-400" />
              <span suppressHydrationWarning>{formatNumber(wallet.coins)}</span>
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
        </div>

        {/* Categories Bar */}
        <div className="flex border-b border-white/5 bg-slate-950/50 px-6 gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              sound.playClick();
              setActiveCategory('hands');
            }}
            className={`py-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeCategory === 'hands'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hand className="w-4 h-4" />
            مدل‌های سه‌بعدی دست
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveCategory('jewels');
            }}
            className={`py-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeCategory === 'jewels'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            مدل‌های گُل (گوهر و سکه)
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveCategory('poses');
            }}
            className={`py-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeCategory === 'poses'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smile className="w-4 h-4" />
            پوزیشن‌ها و ژست‌های بلوف
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveCategory('arenas');
            }}
            className={`py-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
              activeCategory === 'arenas'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            میزها و محیط‌های بازی
          </button>
        </div>

        {/* Items Grid */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeCategory === 'hands' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {HAND_SKINS.map((item) => {
                const isUnlocked = unlocks.handSkins.includes(item.id);
                const isEquipped = unlocks.selectedHand === item.id;

                return (
                  <div
                    key={item.id}
                    className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isEquipped
                        ? 'bg-amber-500/10 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : isUnlocked
                        ? 'bg-slate-900/80 border-slate-700 hover:border-slate-500'
                        : 'bg-slate-950/70 border-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    <div>
                      {/* Top icon preview */}
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-white/10 shadow-inner"
                          style={{ backgroundColor: `${item.previewColor}25` }}
                        >
                          <span style={{ color: item.previewColor }}>✊</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            item.rarity === 'legendary'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : item.rarity === 'epic'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.rarity}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-white mb-1">{item.nameFa}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {item.descriptionFa}
                      </p>
                    </div>

                    <button
                      onClick={() => handleBuyOrEquipHand(item.id, item.price)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                        isEquipped
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isUnlocked
                          ? 'bg-slate-800 hover:bg-slate-700 text-white'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-4 h-4" />
                          تجهیز شده
                        </>
                      ) : isUnlocked ? (
                        'انتخاب برای بازی'
                      ) : (
                        <>
                          <span suppressHydrationWarning>خرید با {formatNumber(item.price)}</span>
                          <Coins className="w-3.5 h-3.5 text-black" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeCategory === 'jewels' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {JEWEL_SKINS.map((item) => {
                const isUnlocked = unlocks.jewelSkins.includes(item.id);
                const isEquipped = unlocks.selectedJewel === item.id;

                return (
                  <div
                    key={item.id}
                    className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isEquipped
                        ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : isUnlocked
                        ? 'bg-slate-900/80 border-slate-700 hover:border-slate-500'
                        : 'bg-slate-950/70 border-slate-800 hover:border-cyan-500/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border border-white/10"
                          style={{ backgroundColor: `${item.glowColor}25` }}
                        >
                          <Sparkles className="w-6 h-6" style={{ color: item.glowColor }} />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-800 text-slate-300">
                          {item.rarity}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-white mb-1">{item.nameFa}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                        {item.descriptionFa}
                      </p>
                    </div>

                    <button
                      onClick={() => handleBuyOrEquipJewel(item.id, item.price)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                        isEquipped
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                          : isUnlocked
                          ? 'bg-slate-800 hover:bg-slate-700 text-white'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-md'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-4 h-4" />
                          تجهیز شده
                        </>
                      ) : isUnlocked ? (
                        'انتخاب برای بازی'
                      ) : (
                        <>
                          <span suppressHydrationWarning>خرید با {formatNumber(item.price)}</span>
                          <Coins className="w-3.5 h-3.5 text-black" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeCategory === 'poses' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BLUFF_POSES.map((item) => {
                const isUnlocked = unlocks.poses.includes(item.id);
                const isEquipped = unlocks.selectedPose === item.id;

                return (
                  <div
                    key={item.id}
                    className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isEquipped
                        ? 'bg-amber-500/10 border-amber-400'
                        : isUnlocked
                        ? 'bg-slate-900/80 border-slate-700'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl">
                          🎭
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">{item.nameFa}</h4>
                          <span className="text-[10px] text-amber-400">ژست روانشناختی بلوف</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.descriptionFa}</p>
                    </div>

                    <button
                      onClick={() => handleBuyOrEquipPose(item.id, item.price)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                        isEquipped
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : isUnlocked
                          ? 'bg-slate-800 hover:bg-slate-700 text-white'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black'
                      }`}
                      suppressHydrationWarning
                    >
                      {isEquipped ? 'فعال روی میز' : isUnlocked ? 'فعال‌سازی' : `خرید با ${formatNumber(item.price)} سکه`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeCategory === 'arenas' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ARENA_SKINS.map((item) => {
                const isUnlocked = unlocks.arenas.includes(item.id);
                const isEquipped = unlocks.selectedArena === item.id;

                return (
                  <div
                    key={item.id}
                    className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isEquipped
                        ? 'bg-amber-500/10 border-amber-400'
                        : isUnlocked
                        ? 'bg-slate-900/80 border-slate-700'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl">
                          🏛️
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">{item.nameFa}</h4>
                          <span className="text-[10px] text-emerald-400">میز رسمی سه‌بعدی</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">{item.descriptionFa}</p>
                    </div>

                    <button
                      onClick={() => handleBuyOrEquipArena(item.id, item.price)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                        isEquipped
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isUnlocked
                          ? 'bg-slate-800 hover:bg-slate-700 text-white'
                          : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black'
                      }`}
                      suppressHydrationWarning
                    >
                      {isEquipped ? 'میز جاری' : isUnlocked ? 'انتخاب میز' : `خرید با ${formatNumber(item.price)} سکه`}
                    </button>
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

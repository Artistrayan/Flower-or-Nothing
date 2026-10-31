'use client';

import React, { useState } from 'react';
import { GameMode, StakeRoom, UserWallet } from '@/lib/types';
import { STAKE_ROOMS } from '@/lib/storage';
import { sound } from '@/lib/sound';
import { formatNumber } from '@/lib/utils';
import {
  Users,
  User,
  Shield,
  Coins,
  Percent,
  Play,
  KeyRound,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';

interface RoomLobbyProps {
  onStartMatch: (mode: GameMode, room: StakeRoom, isPrivateRoom: boolean) => void;
  wallet: UserWallet;
  onOpenWallet: () => void;
}

export default function RoomLobby({ onStartMatch, wallet, onOpenWallet }: RoomLobbyProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>('1v1');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('room_novice');
  const [privateCode, setPrivateCode] = useState<string>('');
  const [isMatchmaking, setIsMatchmaking] = useState<boolean>(false);
  const [matchmakingCountdown, setMatchmakingCountdown] = useState<number>(3);

  const selectedRoom = STAKE_ROOMS.find((r) => r.id === selectedRoomId) || STAKE_ROOMS[0];

  // Number of players based on mode
  const playerCount = selectedMode === '1v1' ? 2 : selectedMode === '2v2' ? 4 : 6;
  const totalPot = selectedRoom.entryFee * playerCount;
  const commissionAmount = Math.round(totalPot * (selectedRoom.commissionPercent / 100));
  const netWinnerPot = totalPot - commissionAmount;

  const handleStartGame = (isPrivate: boolean = false) => {
    if (wallet.coins < selectedRoom.entryFee) {
      sound.playClick();
      alert('موجودی سکه شما برای ورود به این میز کافی نیست! لطفاً کیف پول خود را شارژ کنید.');
      onOpenWallet();
      return;
    }

    sound.playClick();
    setIsMatchmaking(true);
    let count = 3;
    setMatchmakingCountdown(count);

    const interval = setInterval(() => {
      count -= 1;
      setMatchmakingCountdown(count);
      sound.playWheelTick();
      if (count <= 0) {
        clearInterval(interval);
        setIsMatchmaking(false);
        sound.playVictory();
        onStartMatch(selectedMode, selectedRoom, isPrivate);
      }
    }, 800);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Hero Banner with luxury Persian noir styling */}
      <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/30 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-right space-y-2 max-w-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>پلتفرم مسابقات آنلاین و سه‌بعدی گل یا پوچ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              میزهای حرفه‌ای، بلوف‌های سنگین و جوایز میلیونی
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              دست حریف را بخوانید، با کارت‌های شانس تاکتیک بزنید، کمیسیون شفاف پلتفرم را ببینید و کل پات میز را به جیب بزنید!
            </p>
          </div>

          {/* Quick Pot Calculator Card */}
          <div className="w-full sm:w-auto min-w-[260px] p-4 rounded-2xl bg-black/60 border border-amber-500/30 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>ورودی هر نفر:</span>
              <span className="font-bold text-amber-400 font-num" suppressHydrationWarning>
                {formatNumber(selectedRoom.entryFee)} سکه
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-rose-400" />
                کارمزد پلتفرم ({selectedRoom.commissionPercent}٪):
              </span>
              <span className="text-rose-400 font-num" suppressHydrationWarning>-{formatNumber(commissionAmount)}</span>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">جایزه خالص برنده:</span>
              <span className="text-base font-black text-emerald-400 font-num" suppressHydrationWarning>
                {formatNumber(netWinnerPot)} 🪙
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mode Selector Tabs (1v1, 2v2, Group) */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-400" />
          ۱. انتخاب مدل بازی:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* 1v1 Mode */}
          <button
            onClick={() => {
              sound.playClick();
              setSelectedMode('1v1');
            }}
            className={`p-4 rounded-2xl border text-right transition-all flex items-center gap-4 ${
              selectedMode === '1v1'
                ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-2xl">
              ⚔️
            </div>
            <div>
              <div className="font-black text-sm text-white flex items-center gap-1.5">
                <span>دو نفره (۱ به ۱)</span>
                {selectedMode === '1v1' && (
                  <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-black">
                    انتخاب شده
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">دوئل مستقیم روبرو، ۲ دست روی میز</p>
            </div>
          </button>

          {/* 2v2 Team Mode */}
          <button
            onClick={() => {
              sound.playClick();
              setSelectedMode('2v2');
            }}
            className={`p-4 rounded-2xl border text-right transition-all flex items-center gap-4 ${
              selectedMode === '2v2'
                ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-2xl">
              🤝
            </div>
            <div>
              <div className="font-black text-sm text-white flex items-center gap-1.5">
                <span>چهار نفره (۲ به ۲ تیمی)</span>
                {selectedMode === '2v2' && (
                  <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-black">
                    انتخاب شده
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">بازی تیمی، پاس گل به یار و همفکری</p>
            </div>
          </button>

          {/* Speed Mode */}
          <button
            onClick={() => {
              sound.playClick();
              setSelectedMode('speed');
            }}
            className={`p-4 rounded-2xl border text-right transition-all flex items-center gap-4 ${
              selectedMode === 'speed'
                ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-2xl text-cyan-400">
              ⚡
            </div>
            <div>
              <div className="font-black text-sm text-white flex items-center gap-1.5">
                <span>حالت سرعت (Speed Rush)</span>
                {selectedMode === 'speed' && (
                  <span className="text-[10px] bg-cyan-400 text-black px-1.5 py-0.2 rounded font-black">
                    ۶۰ ثانیه
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">حدس‌های برق‌آسا و متوالی قبل از اتمام تایمر</p>
            </div>
          </button>

          {/* Survivor Mode */}
          <button
            onClick={() => {
              sound.playClick();
              setSelectedMode('survivor');
            }}
            className={`p-4 rounded-2xl border text-right transition-all flex items-center gap-4 ${
              selectedMode === 'survivor'
                ? 'bg-rose-500/20 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-2xl text-rose-400">
              🔥
            </div>
            <div>
              <div className="font-black text-sm text-white flex items-center gap-1.5">
                <span>حالت بازمانده (Survivor)</span>
                {selectedMode === 'survivor' && (
                  <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded font-black">
                    حذفی
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">حذف دور به دور تا بقای ۱ برنده نهایی</p>
            </div>
          </button>

          {/* Group Party Mode */}
          <button
            onClick={() => {
              sound.playClick();
              setSelectedMode('group');
            }}
            className={`p-4 rounded-2xl border text-right transition-all flex items-center gap-4 ${
              selectedMode === 'group'
                ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center text-2xl">
              👑
            </div>
            <div>
              <div className="font-black text-sm text-white flex items-center gap-1.5">
                <span>گروهی و مهمانی (۶ نفره)</span>
                {selectedMode === 'group' && (
                  <span className="text-[10px] bg-amber-400 text-black px-1.5 py-0.2 rounded font-black">
                    انتخاب شده
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">میز شلوغ، حذف مرحله به مرحله پوچ‌ها</p>
            </div>
          </button>
        </div>
      </div>

      {/* Stake Rooms Selector */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-400" />
          ۲. انتخاب تالار و مبلغ ورودی مسابقه:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {STAKE_ROOMS.map((room) => {
            const isSelected = selectedRoomId === room.id;
            const canAfford = wallet.coins >= room.entryFee;

            return (
              <button
                key={room.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedRoomId(room.id);
                }}
                className={`relative p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]'
                    : canAfford
                    ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{room.badge}</span>
                    <span className="text-[10px] text-slate-400 font-num">
                      کارمزد: {room.commissionPercent}٪
                    </span>
                  </div>
                  <h4 className="font-black text-sm text-white">{room.nameFa}</h4>
                  <div className="text-amber-400 font-black text-base font-num mt-1" suppressHydrationWarning>
                    {formatNumber(room.entryFee)} 🪙
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>جایزه خالص:</span>
                  <span className="text-emerald-400 font-bold font-num" suppressHydrationWarning>
                    {formatNumber(
                      room.entryFee * playerCount -
                      Math.round(room.entryFee * playerCount * (room.commissionPercent / 100))
                    )}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action / Matchmaking Launch Bar */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Private room code option */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <KeyRound className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="کد اتاق خصوصی (اختیاری)..."
            value={privateCode}
            onChange={(e) => setPrivateCode(e.target.value)}
            className="bg-black/60 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none w-48 font-num text-center"
          />
        </div>

        {/* Big CTA Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            disabled={isMatchmaking}
            onClick={() => handleStartGame(Boolean(privateCode))}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black text-base shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {isMatchmaking ? (
              <>
                <Zap className="w-5 h-5 animate-spin" />
                <span>در حال مچ‌میکینگ و یافتن حریف ({matchmakingCountdown})...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-black" />
                <span suppressHydrationWarning>شروع مسابقه آنلاین ({formatNumber(selectedRoom.entryFee)} سکه)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

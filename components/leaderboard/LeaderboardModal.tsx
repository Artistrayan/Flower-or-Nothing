'use client';

import React, { useState } from 'react';
import { LeaderboardEntry, UserStats } from '@/lib/types';
import { formatNumber } from '@/lib/utils';
import {
  MOCK_GLOBAL_CHAMPIONS,
  MOCK_FRIENDS_LEADERBOARD,
  getDivisionBadgeFa,
} from '@/lib/scoring';
import { sound } from '@/lib/sound';
import {
  X,
  Trophy,
  Users,
  Globe,
  Medal,
  Flame,
  Target,
  Sparkles,
  Zap,
} from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
}

export default function LeaderboardModal({
  isOpen,
  onClose,
  stats,
}: LeaderboardModalProps) {
  const [tab, setTab] = useState<'global' | 'friends'>('global');

  if (!isOpen) return null;

  const userDivisionBadge = getDivisionBadgeFa(stats.division);
  const winRate =
    stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  // Insert player's live entry into leaderboards
  const userEntry: LeaderboardEntry = {
    rank: tab === 'global' ? 4 : 2,
    playerId: 'user_player',
    playerName: 'شما (بازیکن حرفه‌ای)',
    avatar: '👑',
    ratingMMR: stats.ratingMMR,
    trophies: stats.trophies,
    winRate,
    matchesWon: stats.gamesWon,
    division: stats.division,
    isUser: true,
  };

  const currentList =
    tab === 'global'
      ? [
          MOCK_GLOBAL_CHAMPIONS[0],
          MOCK_GLOBAL_CHAMPIONS[1],
          MOCK_GLOBAL_CHAMPIONS[2],
          userEntry,
          ...MOCK_GLOBAL_CHAMPIONS.slice(3),
        ]
      : [
          MOCK_FRIENDS_LEADERBOARD[0],
          userEntry,
          ...MOCK_FRIENDS_LEADERBOARD.slice(1),
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#111625] to-[#090c14] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                تابلوی امتیازات و رتبه‌بندی قهرمانان
                <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                  فصل جاری
                </span>
              </h2>
              <p className="text-xs text-slate-400">سیستم امتیازدهی بر اساس MMR، کاپ، نرخ برد و چالش‌های خاص</p>
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

        {/* Player's Live Standing Banner */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border-b border-white/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow">
              {userDivisionBadge.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">جایگاه شما در رتبه‌بندی</span>
                <span className={`text-xs font-bold ${userDivisionBadge.color}`}>
                  {userDivisionBadge.label}
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                <span>
                  امتیاز مهارت (MMR):{' '}
                  <strong className="text-amber-400 font-num">{stats.ratingMMR}</strong>
                </span>
                <span>
                  کاپ قهرمانی:{' '}
                  <strong className="text-cyan-400 font-num">{stats.trophies} 🏆</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">نرخ برد</div>
            <div className="text-base font-black text-emerald-400 font-num">{winRate}٪</div>
          </div>
        </div>

        {/* Tab switchers: Global vs Friends */}
        <div className="flex border-b border-white/5 bg-slate-950/60 px-6 gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setTab('global');
            }}
            className={`py-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
              tab === 'global'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            رتبه‌بندی جهانی (Global)
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setTab('friends');
            }}
            className={`py-3 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
              tab === 'friends'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            رتبه‌بندی دوستان و کلوب
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-2 flex-1 divide-y divide-white/5">
          {currentList.map((entry, idx) => {
            const isUser = entry.isUser;
            const rankNum = idx + 1;
            const divBadge = getDivisionBadgeFa(entry.division);

            return (
              <div
                key={entry.playerId}
                className={`pt-2.5 pb-2.5 px-3 rounded-2xl flex items-center justify-between text-xs transition-all ${
                  isUser
                    ? 'bg-amber-500/15 border border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'hover:bg-slate-900/60'
                }`}
              >
                {/* Left: Rank & Player info */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black font-num text-xs ${
                      rankNum === 1
                        ? 'bg-amber-500 text-black shadow-md'
                        : rankNum === 2
                        ? 'bg-slate-300 text-black shadow-md'
                        : rankNum === 3
                        ? 'bg-amber-700 text-white shadow-md'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {rankNum}
                  </div>

                  <div className="text-xl">{entry.avatar}</div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-black ${isUser ? 'text-amber-300' : 'text-white'}`}>
                        {entry.playerName}
                      </span>
                      {entry.specialBadge && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/30">
                          {entry.specialBadge}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className={divBadge.color}>
                        {divBadge.icon} {divBadge.label}
                      </span>
                      <span>•</span>
                      <span>{entry.matchesWon} پیروزی</span>
                    </div>
                  </div>
                </div>

                {/* Right: MMR and Trophies */}
                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className="text-amber-400 font-black font-num text-sm" suppressHydrationWarning>
                      {formatNumber(entry.trophies)} 🏆
                    </div>
                    <div className="text-[10px] text-slate-400 font-num">
                      MMR: {entry.ratingMMR}
                    </div>
                  </div>
                  <div className="hidden sm:block text-center w-12">
                    <div className="text-emerald-400 font-black font-num">{entry.winRate}٪</div>
                    <div className="text-[9px] text-slate-500">برد</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

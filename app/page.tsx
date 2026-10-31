'use client';

import React, { useState, useEffect } from 'react';
import HeaderNav from '@/components/ui/HeaderNav';
import RoomLobby from '@/components/game/RoomLobby';
import GameBoard from '@/components/game/GameBoard';
import WalletModal from '@/components/wallet/WalletModal';
import ShopModal from '@/components/shop/ShopModal';
import ProfileModal from '@/components/profile/ProfileModal';
import HelpModal from '@/components/ui/HelpModal';
import LeaderboardModal from '@/components/leaderboard/LeaderboardModal';
import EventsModal from '@/components/events/EventsModal';
import {
  GameMode,
  StakeRoom,
  UserWallet,
  UserStats,
  WalletTransaction,
  DailyChallenge,
  SpecialEvent,
} from '@/lib/types';
import {
  DEFAULT_WALLET,
  DEFAULT_STATS,
  DEFAULT_UNLOCKS,
  DEFAULT_TRANSACTIONS,
  DEFAULT_DAILY_CHALLENGES,
  DEFAULT_SPECIAL_EVENTS,
  getStoredWallet,
  saveWallet,
  getStoredStats,
  saveStats,
  getStoredUnlocks,
  saveUnlocks,
  getStoredTransactions,
  addTransaction,
  getStoredChallenges,
  saveChallenges,
  getStoredEvents,
  saveEvents,
  UnlockedState,
  STAKE_ROOMS,
} from '@/lib/storage';

export default function Home() {
  const [wallet, setWallet] = useState<UserWallet>(DEFAULT_WALLET);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [unlocks, setUnlocks] = useState<UnlockedState>(DEFAULT_UNLOCKS);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(DEFAULT_TRANSACTIONS);
  const [challenges, setChallenges] = useState<DailyChallenge[]>(DEFAULT_DAILY_CHALLENGES);
  const [events, setEvents] = useState<SpecialEvent[]>(DEFAULT_SPECIAL_EVENTS);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setWallet(getStoredWallet());
    setStats(getStoredStats());
    setUnlocks(getStoredUnlocks());
    setTransactions(getStoredTransactions());
    setChallenges(getStoredChallenges());
    setEvents(getStoredEvents());
    setIsMounted(true);
  }, []);

  // Modals state
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isEventsOpen, setIsEventsOpen] = useState(false);

  // Match state
  const [currentMatch, setCurrentMatch] = useState<{
    isActive: boolean;
    mode: GameMode;
    room: StakeRoom;
    isPrivate: boolean;
  } | null>(null);

  const handleUpdateWallet = (newWallet: UserWallet) => {
    setWallet(newWallet);
    saveWallet(newWallet);
  };

  const handleUpdateStats = (newStats: UserStats) => {
    setStats(newStats);
    saveStats(newStats);
  };

  const handleUpdateUnlocks = (newUnlocks: UnlockedState) => {
    setUnlocks(newUnlocks);
    saveUnlocks(newUnlocks);
  };

  const handleUpdateChallenges = (newChallenges: DailyChallenge[]) => {
    setChallenges(newChallenges);
    saveChallenges(newChallenges);
  };

  const handleUpdateEvents = (newEvents: SpecialEvent[]) => {
    setEvents(newEvents);
    saveEvents(newEvents);
  };

  const handleAddTransaction = (tx: Omit<WalletTransaction, 'id' | 'timestamp'>) => {
    const created = addTransaction(tx);
    setTransactions((prev) => [created, ...prev]);
  };

  const handleStartMatch = (mode: GameMode, room: StakeRoom, isPrivate: boolean) => {
    const modeName =
      mode === '1v1'
        ? '۲ نفره'
        : mode === '2v2'
        ? '۴ نفره تیمی'
        : mode === 'speed'
        ? 'سرعت ۶۰ ثانیه'
        : mode === 'survivor'
        ? 'بازمانده حذفی'
        : 'گروهی';

    const updatedWallet = { ...wallet, coins: Math.max(0, wallet.coins - room.entryFee) };
    handleUpdateWallet(updatedWallet);
    handleAddTransaction({
      type: 'entry_fee',
      amount: room.entryFee,
      descriptionFa: `ورودی مسابقه در ${room.nameFa} (${modeName})`,
    });
    setCurrentMatch({
      isActive: true,
      mode,
      room,
      isPrivate,
    });
  };

  const handleStartEventMode = (eventMode: GameMode) => {
    const defaultRoom = STAKE_ROOMS[0];
    handleStartMatch(eventMode, defaultRoom, false);
  };

  const handleExitMatch = () => {
    setCurrentMatch(null);
  };

  // Derive user level from stats
  const level = Math.max(1, Math.floor(stats.gamesWon / 2) + 1);
  const xp = (stats.gamesWon * 350 + stats.gamesPlayed * 100) % (level * 1000);

  return (
    <div className="min-h-screen bg-[#07090f] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Header Bar */}
      <HeaderNav
        wallet={wallet}
        level={level}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenShop={() => setIsShopOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenEvents={() => setIsEventsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 flex flex-col justify-center">
        {currentMatch && currentMatch.isActive ? (
          <GameBoard
            mode={currentMatch.mode}
            room={currentMatch.room}
            wallet={wallet}
            onUpdateWallet={handleUpdateWallet}
            onAddTransaction={handleAddTransaction}
            stats={stats}
            onUpdateStats={handleUpdateStats}
            onExitMatch={handleExitMatch}
            selectedSkinId={unlocks.selectedHand}
            selectedJewelId={unlocks.selectedJewel}
            selectedArenaId={unlocks.selectedArena}
            selectedPoseId={unlocks.selectedPose}
            initialUserGender={unlocks.userGender}
            initialOpponentGender={unlocks.opponentGender}
            initialCharacterStyle={unlocks.userStyle}
            initialDifficulty={unlocks.difficulty}
          />
        ) : (
          <RoomLobby
            onStartMatch={handleStartMatch}
            wallet={wallet}
            onOpenWallet={() => setIsWalletOpen(true)}
          />
        )}
      </main>

      {/* Footer Info */}
      <footer className="w-full border-t border-white/5 py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>سرورهای مسابقات آنلاین فعال • مچ‌میکینگ بلادرنگ و تابلوی امتیازات زنده</span>
        </div>
        <div>
          <span>گل یا پوچ آنلاین حرفه‌ای ۳D • سیستم امتیازدهی و رنکینگ پیشرفته</span>
        </div>
      </footer>

      {/* Modals */}
      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        wallet={wallet}
        onUpdateWallet={handleUpdateWallet}
        transactions={transactions}
        onAddTransaction={handleAddTransaction}
      />

      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        wallet={wallet}
        onUpdateWallet={handleUpdateWallet}
        unlocks={unlocks}
        onUpdateUnlocks={handleUpdateUnlocks}
        onAddTransaction={handleAddTransaction}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        stats={stats}
        wallet={wallet}
        level={level}
        xp={xp}
        unlocks={unlocks}
        onUpdateUnlocks={handleUpdateUnlocks}
      />

      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        stats={stats}
      />

      <EventsModal
        isOpen={isEventsOpen}
        onClose={() => setIsEventsOpen(false)}
        challenges={challenges}
        onUpdateChallenges={handleUpdateChallenges}
        events={events}
        onUpdateEvents={handleUpdateEvents}
        wallet={wallet}
        onUpdateWallet={handleUpdateWallet}
        onAddTransaction={handleAddTransaction}
        onSelectEventMode={handleStartEventMode}
      />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

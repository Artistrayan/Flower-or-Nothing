'use client';

import React, { useState, useEffect, useRef } from 'react';
import ThreeGameCanvas from './ThreeGameCanvas';
import CardDeck from './CardDeck';
import { formatNumber } from '@/lib/utils';
import {
  GameMode,
  StakeRoom,
  HandState,
  SpecialCard,
  UserWallet,
  UserStats,
  Gender,
  CharacterStyle,
  DifficultyLevel,
} from '@/lib/types';
import { calculateMMRChange, getDivisionTier } from '@/lib/scoring';
import { sound } from '@/lib/sound';
import {
  Coins,
  Hand,
  Sparkles,
  RotateCcw,
  Volume2,
  VolumeX,
  ArrowRight,
  Flame,
  Timer,
  Users,
  Shuffle,
  Eye,
  SlidersHorizontal,
  UserCheck,
  Sparkle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GameBoardProps {
  mode: GameMode;
  room: StakeRoom;
  wallet: UserWallet;
  onUpdateWallet: (newWallet: UserWallet) => void;
  onAddTransaction: (tx: {
    type: 'win' | 'entry_fee' | 'commission_rake';
    amount: number;
    descriptionFa: string;
  }) => void;
  stats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onExitMatch: () => void;
  selectedSkinId: string;
  selectedJewelId: string;
  selectedArenaId: string;
  selectedPoseId: string;
  initialUserGender?: Gender;
  initialOpponentGender?: Gender;
  initialCharacterStyle?: CharacterStyle;
  initialDifficulty?: DifficultyLevel;
}

function createInitialHands(
  mode: GameMode,
  role: 'player_guessing' | 'player_hiding',
  handCountOverride?: number
): HandState[] {
  let handCount = mode === '1v1' ? 2 : mode === '2v2' ? 4 : mode === 'speed' ? 3 : 6;
  if (handCountOverride) handCount = handCountOverride;

  const initialHands: HandState[] = [];
  const secretGolIndex = Math.floor(Math.random() * handCount);

  for (let i = 0; i < handCount; i++) {
    const isLeft = i % 2 === 0;
    let owner = `مشت ${i + 1}`;
    if (mode === '1v1') owner = i === 0 ? 'مشت چپ' : 'مشت راست';
    if (mode === '2v2') owner = i < 2 ? (i === 0 ? 'یار کمکی (چپ)' : 'شما (راست)') : `حریف ${i - 1}`;
    if (mode === 'survivor') owner = i === 0 ? 'شما (بازمانده ۱)' : `بازمانده ${i + 1}`;

    initialHands.push({
      id: i,
      ownerId: i < 2 ? 'player_1' : i < 4 ? 'player_2' : 'player_3',
      ownerName: owner,
      handSide: isLeft ? 'left' : 'right',
      hasGol: role === 'player_guessing' ? i === secretGolIndex : false,
      isOpened: false,
      isEliminated: false,
      isTargeted: false,
    });
  }
  return initialHands;
}

export default function GameBoard({
  mode,
  room,
  wallet,
  onUpdateWallet,
  onAddTransaction,
  stats,
  onUpdateStats,
  onExitMatch,
  selectedSkinId,
  selectedJewelId,
  selectedArenaId,
  initialUserGender = 'male',
  initialOpponentGender = 'female',
  initialCharacterStyle = 'anime',
  initialDifficulty = 'pro',
}: GameBoardProps) {
  // Game Flow State
  const [round, setRound] = useState<number>(1);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);

  // Target score based on mode
  const targetScore = mode === 'speed' ? 99 : mode === 'survivor' ? 3 : mode === 'group' ? 1 : 3;

  // Turn Role
  const [turnRole, setTurnRole] = useState<'player_guessing' | 'player_hiding'>(
    mode === 'speed' ? 'player_guessing' : 'player_guessing'
  );
  const [gamePhase, setGamePhase] = useState<'hiding' | 'reading' | 'guessing' | 'revealed' | 'ended'>(
    'reading'
  );

  // Character & Style State
  const [userGender, setUserGender] = useState<Gender>(initialUserGender);
  const [opponentGender, setOpponentGender] = useState<Gender>(initialOpponentGender);
  const [characterStyle, setCharacterStyle] = useState<CharacterStyle>(initialCharacterStyle);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty);
  const [showConfigBar, setShowConfigBar] = useState<boolean>(false);

  // 3D Animation & Expression States
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [characterEmotion, setCharacterEmotion] = useState<'neutral' | 'bluff' | 'shock' | 'triumph'>('neutral');
  const [gazeDirection, setGazeDirection] = useState<'left' | 'right' | 'center'>('center');
  const [playerSleightCount, setPlayerSleightCount] = useState<number>(0);

  const [selectedHandId, setSelectedHandId] = useState<number | null>(null);
  const [highlightedHandId, setHighlightedHandId] = useState<number | null>(null);
  const [activeCard, setActiveCard] = useState<SpecialCard['id'] | null>(null);
  const [isShahGolActive, setIsShahGolActive] = useState<boolean>(false);
  const [cameraView, setCameraView] = useState<'front' | 'top' | 'cinematic'>('front');
  const [roundMessage, setRoundMessage] = useState<string>('دست‌ها روی میز مستقر شدند. نوبت حدس شماست!');
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  // Speed Mode specific states
  const [speedSecondsLeft, setSpeedSecondsLeft] = useState<number>(60);
  const [speedCombo, setSpeedCombo] = useState<number>(1);

  // Survivor Mode specific states
  const [survivorsLeft, setSurvivorsLeft] = useState<number>(6);

  // Advanced Scoring & Rating
  const [matchResultRating, setMatchResultRating] = useState<{
    mmrDelta: number;
    trophyDelta: number;
    grade: string;
  } | null>(null);

  // Platform Economics
  const playerCount = mode === '1v1' ? 2 : mode === '2v2' ? 4 : mode === 'speed' ? 1 : 6;
  const totalPot =
    mode === 'speed' ? room.entryFee * 2.5 : room.entryFee * (mode === 'survivor' ? 6 : playerCount);
  const commissionAmount = Math.round(totalPot * (room.commissionPercent / 100));
  const netWinnerPot = totalPot - commissionAmount;

  // Hands Configuration
  const [hands, setHands] = useState<HandState[]>(() =>
    createInitialHands(mode, 'player_guessing')
  );

  // Trigger shuffle sequence on start of a round
  const triggerShuffleSequence = (currentHands: HandState[]) => {
    setIsShuffling(true);
    setCharacterEmotion('bluff');
    setGazeDirection('center');

    const duration = difficulty === 'grandmaster' ? 2800 : difficulty === 'casual' ? 1600 : 2200;
    const diffFa = difficulty === 'grandmaster' ? 'استاد اعظم (۶ جابجایی فوق سریع)' : difficulty === 'casual' ? 'آسان (۲ جابجایی)' : 'حرفه‌ای (۴ جابجایی با فریب)';

    setRoundMessage(`🔀 حریف در حال جابجایی و شعبده دست‌هاست (${diffFa}). حرکت دست‌ها را دنبال کنید!`);

    setTimeout(() => {
      setIsShuffling(false);
      sound.playFistThud();

      const golHand = currentHands.find((h) => h.hasGol);
      const isGolLeft = golHand?.handSide === 'left';

      // Opponent Deceptive Gaze and Body Language Engine based on difficulty
      if (difficulty === 'casual') {
        // Honest tell: looks at the hand with flower 75% of the time
        setGazeDirection(Math.random() < 0.75 ? (isGolLeft ? 'left' : 'right') : 'center');
        setCharacterEmotion('neutral');
        setRoundMessage('دست‌ها مستقر شدند. نگاه حریف نشانه‌ای از جای گل است!');
      } else if (difficulty === 'pro') {
        // 50% bluff: looks at empty hand to trick player
        const willBluff = Math.random() < 0.5;
        if (willBluff) {
          setGazeDirection(isGolLeft ? 'right' : 'left'); // fake glance
          setCharacterEmotion('bluff');
          setRoundMessage('دست‌ها مستقر شدند! حریف با نگاه موذیانه سعی در فریب شما دارد.');
        } else {
          setGazeDirection(isGolLeft ? 'left' : 'right');
          setCharacterEmotion('neutral');
          setRoundMessage('دست‌ها روی میز نشستند. کدام مشت گل را پنهان کرده است؟');
        }
      } else {
        // Grandmaster: 75% deceptive reverse bluff + cold stare!
        const willDoubleBluff = Math.random() < 0.75;
        if (willDoubleBluff) {
          setGazeDirection(isGolLeft ? 'right' : 'left'); // strong fake tell
          setCharacterEmotion('bluff');
          setRoundMessage('استاد اعظم با اعتمادبه‌نفس بالا روی دست خالی خیره شده! فریب نخورید!');
        } else {
          setGazeDirection('center');
          setCharacterEmotion('bluff');
          setRoundMessage('استاد اعظم مستقیماً به چشمان شما خیره شده! فقط ردیابی حرکت دست‌ها نجات‌بخش است.');
        }
      }
    }, duration);
  };

  // Initialize hands for a new round
  const setupRound = (
    role: 'player_guessing' | 'player_hiding',
    survivorCountOverride?: number
  ) => {
    const initialHands = createInitialHands(mode, role, survivorCountOverride);
    setHands(initialHands);
    setSelectedHandId(null);
    setHighlightedHandId(null);
    setActiveCard(null);
    setIsShahGolActive(false);
    setCharacterEmotion('neutral');
    setPlayerSleightCount(0);

    if (role === 'player_hiding') {
      setGamePhase('hiding');
      setRoundMessage('گل را در یکی از دستان خود پنهان کنید (روی یکی از مشت‌ها کلیک کنید)');
    } else {
      setGamePhase('reading');
      triggerShuffleSequence(initialHands);
    }
  };

  // Run initial shuffle on component mount
  useEffect(() => {
    if (turnRole === 'player_guessing') {
      triggerShuffleSequence(hands);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Advanced Match Finish & Scoring System Handler
  const handleFinishMatch = React.useCallback(
    (isVictory: boolean, finalScore: number) => {
      setGamePhase('ended');

      const { mmrChange, trophyChange, performanceGrade } = calculateMMRChange({
        isWin: isVictory,
        isShahGol: isShahGolActive,
        cleanSweep: opponentScore === 0,
        winStreak: stats.winStreak,
        mode,
        speedScore: finalScore,
        difficulty,
      });

      setMatchResultRating({
        mmrDelta: mmrChange,
        trophyDelta: trophyChange,
        grade: performanceGrade,
      });

      const newTrophies = Math.max(0, stats.trophies + trophyChange);
      const newDivision = getDivisionTier(newTrophies);
      const newMMR = Math.max(800, stats.ratingMMR + mmrChange);

      if (isVictory) {
        sound.playCoinsWin();
        sound.playVictory();
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.4 } });

        const newWallet = { ...wallet, coins: wallet.coins + netWinnerPot };
        onUpdateWallet(newWallet);
        onAddTransaction({
          type: 'win',
          amount: netWinnerPot,
          descriptionFa: `پیروزی در مسابقه ${room.nameFa} (${
            mode === 'speed' ? 'حالت سرعت' : mode === 'survivor' ? 'حالت بازمانده' : 'عادی'
          }) - سطح ${difficulty === 'grandmaster' ? 'استاد اعظم' : difficulty === 'casual' ? 'آسان' : 'حرفه‌ای'}`,
        });

        onUpdateStats({
          ...stats,
          gamesPlayed: stats.gamesPlayed + 1,
          gamesWon: stats.gamesWon + 1,
          winStreak: stats.winStreak + 1,
          bestStreak: Math.max(stats.bestStreak, stats.winStreak + 1),
          totalCoinsWon: stats.totalCoinsWon + netWinnerPot,
          ratingMMR: newMMR,
          trophies: newTrophies,
          division: newDivision,
          speedHighScore:
            mode === 'speed' ? Math.max(stats.speedHighScore, finalScore) : stats.speedHighScore,
          survivorWins: mode === 'survivor' ? stats.survivorWins + 1 : stats.survivorWins,
          teamWins: mode === '2v2' ? stats.teamWins + 1 : stats.teamWins,
        });
      } else {
        onUpdateStats({
          ...stats,
          gamesPlayed: stats.gamesPlayed + 1,
          winStreak: 0,
          ratingMMR: newMMR,
          trophies: newTrophies,
          division: newDivision,
        });
      }
    },
    [
      isShahGolActive,
      opponentScore,
      stats,
      mode,
      difficulty,
      netWinnerPot,
      room.nameFa,
      wallet,
      onUpdateWallet,
      onAddTransaction,
      onUpdateStats,
    ]
  );

  // Speed Mode Countdown Timer Effect
  useEffect(() => {
    if (mode !== 'speed' || gamePhase === 'ended') return;

    const timer = setInterval(() => {
      setSpeedSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishMatch(playerScore >= 4, playerScore);
          return 0;
        }
        if (prev <= 10) {
          sound.playWheelTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, gamePhase, playerScore, handleFinishMatch]);

  // When player selects a hand
  const handleHandClick = (handId: number) => {
    sound.playClick();
    const hand = hands.find((h) => h.id === handId);
    if (!hand || hand.isOpened || isShuffling) return;

    if (gamePhase === 'hiding' && turnRole === 'player_hiding') {
      // Player assigns the Gol to this hand
      setHands((prev) =>
        prev.map((h) => ({
          ...h,
          hasGol: h.id === handId,
        }))
      );
      sound.playGolFound();
      setRoundMessage('گل در دست انتخابی قرار گرفت. می‌توانید شعبده جابجایی بزنید یا تأیید کنید.');
      return;
    }

    if (gamePhase === 'reading' || gamePhase === 'guessing') {
      setSelectedHandId(handId);
      setGamePhase('guessing');
      sound.startSuspense();
      setRoundMessage(`مشت شماره ${handId + 1} انتخاب شد. تصمیم شما چیست؟ پوچ یا گل؟`);
    }
  };

  // Player performs interactive 3D Sleight-of-hand / Shuffle during hiding phase
  const handlePlayerSleightShuffle = () => {
    if (isShuffling) return;
    setIsShuffling(true);
    sound.playSleightClasp();
    setRoundMessage('🔀 شما در حال شعبده‌بازی و جابجایی دست‌ها هستید تا هوش مصنوعی را گمراه کنید...');

    setTimeout(() => {
      setIsShuffling(false);
      sound.playFistThud();
      // Swap Gol between hands 0 and 1
      setHands((prev) =>
        prev.map((h) => {
          if (h.id === 0) return { ...h, hasGol: !h.hasGol };
          if (h.id === 1) return { ...h, hasGol: !h.hasGol };
          return h;
        })
      );
      setPlayerSleightCount((c) => c + 1);
      setRoundMessage('✨ جابجایی با مهارت انجام شد! شانس فریب حریف دوچندان شد.');
    }, 2000);
  };

  // Confirm hiding and let Opponent AI guess
  const handleConfirmHiding = () => {
    const chosenHand = hands.find((h) => h.hasGol);
    if (!chosenHand) {
      setRoundMessage('لطفاً ابتدا روی یکی از مشت‌ها کلیک کنید تا گل پنهان شود.');
      return;
    }
    setGamePhase('reading');
    setRoundMessage('گل مستقر شد! حریف در حال خواندن زبان بدن و حرکات شماست...');
    setTimeout(() => {
      opponentAiGuess(chosenHand.id);
    }, 2200);
  };

  // Pass to teammate in 2v2 Mode
  const handlePassToTeammate = () => {
    if (mode !== '2v2' || gamePhase !== 'hiding') return;
    sound.playCardFlip();
    setHands((prev) =>
      prev.map((h) => ({
        ...h,
        hasGol: h.id === 0,
      }))
    );
    setRoundMessage('🤝 پاس گل با موفقیت به دست هم‌تیمی رد شد! حریف کاملاً گمراه شد.');
    setTimeout(() => {
      setGamePhase('reading');
      setTimeout(() => opponentAiGuess(0), 2000);
    }, 1200);
  };

  // Action A: Guess "POOCH" (Empty)
  const handleGuessPooch = () => {
    if (selectedHandId === null) return;
    sound.stopSuspense();
    const target = hands.find((h) => h.id === selectedHandId);
    if (!target) return;

    if (target.hasGol) {
      // OOPS! It was the flower!
      sound.playGolFound();
      setCharacterEmotion('triumph');
      setHands((prev) =>
        prev.map((h) => (h.id === selectedHandId ? { ...h, isOpened: true } : h))
      );
      setGamePhase('revealed');
      setRoundMessage('💥 پوچ نبود! گل در این دست بود و نوبت سوخت!');
      setOpponentScore((s) => s + 1);
      setSpeedCombo(1);

      if (mode === 'survivor') {
        setRoundMessage('💀 شما در این دور از مسابقه بازمانده حذف شدید!');
        handleFinishMatch(false, playerScore);
        return;
      }

      checkRoundFinish(playerScore, opponentScore + 1);
    } else {
      // Safe! Pooch correctly identified
      sound.playPoochOpen();
      setHands((prev) =>
        prev.map((h) =>
          h.id === selectedHandId ? { ...h, isOpened: true, isEliminated: true } : h
        )
      );

      const remainingClosed = hands.filter(
        (h) => h.id !== selectedHandId && !h.isOpened && !h.isEliminated
      );

      if (remainingClosed.length === 1) {
        sound.playVictory();
        sound.playGasp();
        setCharacterEmotion('shock');
        const scoreToAdd = mode === 'speed' ? speedCombo : 1;
        const newScore = playerScore + scoreToAdd;
        setPlayerScore(newScore);
        setSpeedCombo((c) => Math.min(4, c + 1));
        setRoundMessage(`🎉 عالی بود! گل پیدا شد (+${scoreToAdd} امتیاز)`);
        setHands((prev) => prev.map((h) => ({ ...h, isOpened: true })));

        if (mode === 'speed') {
          setTimeout(() => {
            setupRound('player_guessing');
          }, 800);
        } else {
          setGamePhase('revealed');
          checkRoundFinish(newScore, opponentScore);
        }
      } else {
        setRoundMessage('✅ دست پوچ بود! یک پوچ حذف شد. دست بعدی را انتخاب کنید.');
        setSelectedHandId(null);
        setGamePhase('reading');
      }
    }
  };

  // Action B: Guess "GOL" (Declare Jewel is in this hand)
  const handleDeclareGol = () => {
    if (selectedHandId === null) return;
    sound.stopSuspense();
    const target = hands.find((h) => h.id === selectedHandId);
    if (!target) return;

    if (target.hasGol) {
      // BINGO! Direct Hit
      sound.playGolFound();
      sound.playVictory();
      sound.playGasp();
      setCharacterEmotion('shock');
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.5 } });

      const points = isShahGolActive ? 2 : mode === 'speed' ? speedCombo * 2 : 1;
      const newScore = playerScore + points;
      setPlayerScore(newScore);
      setSpeedCombo((c) => Math.min(4, c + 1));

      setRoundMessage(
        isShahGolActive
          ? '👑 شاه‌گل با موفقیت زده شد! امتیاز دوبل (+۲ امتیاز)!'
          : `🌸 گل شکار شد! (+${points} امتیاز)`
      );

      if (isShahGolActive) {
        onUpdateStats({
          ...stats,
          shahGolSuccessCount: stats.shahGolSuccessCount + 1,
        });
      }

      setHands((prev) => prev.map((h) => ({ ...h, isOpened: true })));

      if (mode === 'speed') {
        setTimeout(() => {
          setupRound('player_guessing');
        }, 800);
      } else if (mode === 'survivor') {
        const nextSurvivors = Math.max(2, survivorsLeft - 2);
        setSurvivorsLeft(nextSurvivors);

        if (nextSurvivors <= 2 && round >= 2) {
          handleFinishMatch(true, newScore);
        } else {
          setGamePhase('revealed');
          setRoundMessage(`🔥 صعود به دور بعد! ${nextSurvivors} بازمانده باقی ماندند.`);
        }
      } else {
        setGamePhase('revealed');
        checkRoundFinish(newScore, opponentScore);
      }
    } else {
      // WRONG!
      sound.playPoochOpen();
      setCharacterEmotion('triumph');
      setHands((prev) => prev.map((h) => ({ ...h, isOpened: true })));
      setGamePhase('revealed');
      setRoundMessage('❌ اشتباه بود! دست خالی بود.');
      setOpponentScore((s) => s + 1);
      setSpeedCombo(1);

      if (mode === 'survivor') {
        setRoundMessage('💀 حدس اشتباه! شما از تورنمنت بازمانده حذف شدید.');
        handleFinishMatch(false, playerScore);
        return;
      }

      checkRoundFinish(playerScore, opponentScore + 1);
    }
  };

  // Opponent AI guessing logic influenced by difficulty & player sleight of hand
  const opponentAiGuess = (actualGolId: number) => {
    // Base find probability based on difficulty
    let findChance = difficulty === 'grandmaster' ? 0.65 : difficulty === 'casual' ? 0.25 : 0.45;
    // Each sleight of hand shuffle by player reduces AI find chance by 20%
    findChance = Math.max(0.12, findChance - playerSleightCount * 0.2);

    const willFind = Math.random() < findChance;
    let chosenId = actualGolId;
    if (!willFind) {
      const otherIds = hands.filter((h) => h.id !== actualGolId).map((h) => h.id);
      if (otherIds.length > 0) {
        chosenId = otherIds[Math.floor(Math.random() * otherIds.length)];
      }
    }

    setSelectedHandId(chosenId);
    sound.playFistThud();

    setTimeout(() => {
      setHands((prev) => prev.map((h) => ({ ...h, isOpened: true })));
      if (chosenId === actualGolId) {
        sound.playGolFound();
        setCharacterEmotion('triumph');
        setOpponentScore((s) => s + 1);
        setRoundMessage('حریف با موفقیت گل شما را پیدا کرد! (+۱ حریف)');
        checkRoundFinish(playerScore, opponentScore + 1);
      } else {
        sound.playVictory();
        sound.playGasp();
        setCharacterEmotion('shock');
        setPlayerScore((s) => s + 1);
        setRoundMessage('حریف به پوچ زد! بلوف شما گرفت و دست شما برنده شد (+۱ شما)');
        checkRoundFinish(playerScore + 1, opponentScore);
      }
      setGamePhase('revealed');
    }, 1800);
  };

  // Check round target
  const checkRoundFinish = (pScore: number, oScore: number) => {
    if (pScore >= targetScore || oScore >= targetScore) {
      setTimeout(() => {
        handleFinishMatch(pScore >= targetScore, pScore);
      }, 1500);
    }
  };

  // Next Round Handler
  const handleNextRound = () => {
    sound.playClick();
    setRound((r) => r + 1);

    if (mode === 'survivor') {
      setupRound('player_guessing', survivorsLeft);
      return;
    }

    const nextRole = turnRole === 'player_guessing' ? 'player_hiding' : 'player_guessing';
    setTurnRole(nextRole);
    setupRound(nextRole);
  };

  // Tactical Cards Handler
  const handleUseCard = (cardId: SpecialCard['id']) => {
    if (gamePhase !== 'reading' && gamePhase !== 'guessing') return;
    setActiveCard(cardId);

    if (cardId === 'shah_gol') {
      setIsShahGolActive(true);
      setRoundMessage('👑 کارت شاه‌گل فعال شد! مستقیماً روی مشتی که فکر می‌کنید گل است ضربه بزنید.');
    } else if (cardId === 'booye_gol') {
      const golHand = hands.find((h) => h.hasGol);
      if (golHand) {
        setHighlightedHandId(golHand.id);
        setRoundMessage('🌸 حس ششم فعال شد! ارتعاش و بوی گل را در این مشت احساس کنید.');
        setTimeout(() => setHighlightedHandId(null), 4000);
      }
    } else if (cardId === 'daste_khali') {
      const emptyHands = hands.filter((h) => !h.hasGol && !h.isOpened);
      if (emptyHands.length > 0) {
        const picked = emptyHands[0];
        sound.playPoochOpen();
        setHands((prev) =>
          prev.map((h) => (h.id === picked.id ? { ...h, isOpened: true, isEliminated: true } : h))
        );
        setRoundMessage(
          `✋ کارت دست خالی اجرا شد: مشت شماره ${picked.id + 1} با موفقیت بدون ریسک باز شد.`
        );
      }
    } else if (cardId === 'duel') {
      setRoundMessage('⚔️ دوئل فعال شد! تمام حواس‌ها متمرکز بر حدس اول است.');
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-80px)] min-h-[640px] flex flex-col justify-between overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-950 shadow-2xl">
      {/* 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <ThreeGameCanvas
          hands={hands}
          selectedHandId={selectedHandId}
          onHandClick={handleHandClick}
          selectedSkinId={selectedSkinId}
          selectedJewelId={selectedJewelId}
          selectedArenaId={selectedArenaId}
          selectedPoseId="pose_classic"
          cameraView={cameraView}
          isHidingPhase={gamePhase === 'hiding'}
          highlightedHandId={highlightedHandId}
          opponentGender={opponentGender}
          userGender={userGender}
          characterStyle={characterStyle}
          difficulty={difficulty}
          isShuffling={isShuffling}
          characterEmotion={characterEmotion}
          gazeDirection={gazeDirection}
        />
      </div>

      {/* Top HUD */}
      <div className="relative z-10 p-3 sm:p-5 flex items-center justify-between pointer-events-none">
        {/* Left: Exit Match & Sound & Config Settings */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => {
              sound.playClick();
              onExitMatch();
            }}
            className="px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <ArrowRight className="w-4 h-4" />
            <span>خروج</span>
          </button>

          <button
            onClick={() => {
              const nextMute = !isMuted;
              sound.setMuted(nextMute);
              setIsMuted(nextMute);
            }}
            className="w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 flex items-center justify-center transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Quick Character & Difficulty Bar Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setShowConfigBar((v) => !v);
            }}
            className={`px-3 py-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all ${
              showConfigBar
                ? 'bg-amber-500 text-black border-amber-400 font-bold'
                : 'bg-slate-900/80 hover:bg-slate-800 border-white/10 text-amber-400'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>تنظیم کاراکتر و هوش</span>
          </button>
        </div>

        {/* Center: Live Pot, Mode Badge & Timer */}
        <div className="flex flex-col items-center pointer-events-auto">
          <div className="px-4 sm:px-5 py-2 rounded-2xl bg-black/75 border border-amber-500/40 shadow-lg flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-amber-400 font-black font-num text-xs sm:text-sm" suppressHydrationWarning>
              <Coins className="w-4 h-4" />
              <span>پات: {formatNumber(totalPot)}</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold font-num" suppressHydrationWarning>
              <span>جایزه: {formatNumber(netWinnerPot)}</span>
            </div>

            {mode === 'speed' && (
              <div className="flex items-center gap-1 bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-lg border border-cyan-500/30 font-num font-black">
                <Timer className="w-3.5 h-3.5 animate-spin" />
                <span>{speedSecondsLeft}s</span>
              </div>
            )}

            {mode === 'survivor' && (
              <div className="flex items-center gap-1 bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-lg border border-rose-500/30 font-num font-black">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>{survivorsLeft} بازمانده</span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-amber-200/80 mt-1 font-bold flex items-center gap-2">
            <span>
              {mode === 'speed'
                ? '⚡ حالت رعدآسای سرعت'
                : mode === 'survivor'
                ? '🔥 حالت حذفی بازمانده'
                : mode === '2v2'
                ? '🤝 حالت تیمی ۲ به ۲'
                : 'مسابقه ۱ به ۱'}
            </span>
            <span className="text-slate-400">•</span>
            <span
              className={
                difficulty === 'grandmaster'
                  ? 'text-rose-400 font-black'
                  : difficulty === 'casual'
                  ? 'text-emerald-400 font-bold'
                  : 'text-amber-400 font-bold'
              }
            >
              {difficulty === 'grandmaster'
                ? '🔴 استاد اعظم'
                : difficulty === 'casual'
                ? '🟢 آسان'
                : '🟡 حرفه‌ای'}
            </span>
          </div>
        </div>

        {/* Right: Scoreboard & Camera switch */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-black/75 border border-white/10 text-xs">
            <div className="text-center">
              <div className="text-[10px] text-slate-400">{userGender === 'female' ? '👩 شما' : '👨 شما'}</div>
              <div className="text-base font-black text-amber-400 font-num">{playerScore}</div>
            </div>
            {mode !== 'speed' && (
              <>
                <span className="text-slate-600 font-bold">:</span>
                <div className="text-center">
                  <div className="text-[10px] text-slate-400">{opponentGender === 'female' ? '👩 حریف' : '👨 حریف'}</div>
                  <div className="text-base font-black text-rose-400 font-num">{opponentScore}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Quick Config Drawer (Gender, Anime Style, Difficulty) */}
      {showConfigBar && (
        <div className="relative z-20 self-center max-w-2xl w-full mx-4 px-4 py-3 rounded-2xl bg-slate-900/95 border border-amber-500/40 backdrop-blur-xl shadow-2xl flex flex-wrap items-center justify-around gap-3 text-xs animate-fade-in pointer-events-auto">
          {/* User Gender */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">جنسیت شما:</span>
            <button
              onClick={() => {
                sound.playClick();
                setUserGender('male');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                userGender === 'male' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'
              }`}
            >
              👨 مرد
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setUserGender('female');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                userGender === 'female' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'
              }`}
            >
              👩 زن
            </button>
          </div>

          {/* Opponent Gender */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">حریف ۳D:</span>
            <button
              onClick={() => {
                sound.playClick();
                setOpponentGender('female');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                opponentGender === 'female' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              👩 زن
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setOpponentGender('male');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                opponentGender === 'male' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              👨 مرد
            </button>
          </div>

          {/* Character Style */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">سبک:</span>
            <button
              onClick={() => {
                sound.playClick();
                setCharacterStyle('anime');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                characterStyle === 'anime' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              ✨ انیمه
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setCharacterStyle('human');
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                characterStyle === 'human' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              👤 رئال
            </button>
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">هوش حریف:</span>
            {(['casual', 'pro', 'grandmaster'] as DifficultyLevel[]).map((d) => (
              <button
                key={d}
                onClick={() => {
                  sound.playClick();
                  setDifficulty(d);
                }}
                className={`px-2 py-1 rounded-lg font-bold transition-all ${
                  difficulty === d
                    ? d === 'grandmaster'
                      ? 'bg-rose-600 text-white'
                      : d === 'pro'
                      ? 'bg-amber-500 text-black'
                      : 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {d === 'casual' ? 'آسان' : d === 'pro' ? 'حرفه‌ای' : 'استاد اعظم'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Middle Banner: Prompt and Teammate Hints */}
      <div className="relative z-10 self-center max-w-xl px-4 pointer-events-none space-y-2">
        <div className="px-5 py-2.5 rounded-2xl bg-black/85 border border-amber-500/30 backdrop-blur-md shadow-xl text-center animate-fade-in pointer-events-auto">
          <p className="text-xs sm:text-sm font-bold text-slate-100 flex items-center justify-center gap-2">
            {roundMessage}
          </p>
        </div>

        {mode === '2v2' && gamePhase === 'hiding' && turnRole === 'player_hiding' && (
          <div className="flex justify-center pointer-events-auto">
            <button
              onClick={handlePassToTeammate}
              className="px-4 py-2 rounded-xl bg-purple-600/80 hover:bg-purple-500 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 transition-all active:scale-95 border border-purple-400/40"
            >
              <Users className="w-4 h-4" />
              <span>پاس گل مخفیانه به هم‌تیمی 🤝</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom Consolidated Dock */}
      <div className="relative z-10 p-3 sm:p-5 space-y-3 pointer-events-auto max-w-3xl mx-auto w-full">
        {/* Hiding Phase Hand Selectors & Interactive Sleight of Hand Button */}
        {gamePhase === 'hiding' && turnRole === 'player_hiding' && (
          <div className="flex flex-col items-center gap-2 animate-fade-in">
            <div className="text-xs font-bold text-amber-300">
              روی یکی از دستان خود کلیک کنید تا گل پنهان شود:
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {hands.map((h) => {
                const isSelected = h.hasGol;
                return (
                  <button
                    key={h.id}
                    onClick={() => handleHandClick(h.id)}
                    className={`px-5 py-2.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-black border-2 border-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    }`}
                  >
                    <span>{h.handSide === 'left' ? '👈 مشت چپ شما' : '👉 مشت راست شما'}</span>
                    {isSelected ? <Sparkles className="w-4 h-4 fill-black" /> : null}
                  </button>
                );
              })}

              {/* Interactive Sleight of Hand Shuffle */}
              {hands.some((h) => h.hasGol) && (
                <button
                  onClick={handlePlayerSleightShuffle}
                  disabled={isShuffling}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all disabled:opacity-50 border border-purple-400/40"
                >
                  <Shuffle className="w-4 h-4 animate-spin" />
                  <span>🔀 شعبده‌بازی و جابجایی دست‌ها ({playerSleightCount})</span>
                </button>
              )}

              {/* Ready / Confirm Button */}
              {hands.some((h) => h.hasGol) && (
                <button
                  onClick={handleConfirmHiding}
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-black text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                >
                  <span>آماده‌ام! نوبت حدس حریف است ✔️</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Reading Phase: Hand Selectors when no hand chosen yet */}
        {gamePhase === 'reading' && selectedHandId === null && (
          <div className="flex flex-col items-center gap-2 animate-fade-in">
            <div className="text-xs font-bold text-slate-300">
              روی مشت ۳بعدی کلیک کنید یا دست مورد نظر را جهت بررسی انتخاب نمایید:
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {hands
                .filter((h) => !h.isOpened && !h.isEliminated)
                .map((h) => (
                  <button
                    key={h.id}
                    onClick={() => handleHandClick(h.id)}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-slate-600/80 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                  >
                    <span>
                      {h.handSide === 'left'
                        ? '👈 انتخاب مشت چپ'
                        : h.handSide === 'right'
                        ? '👉 انتخاب مشت راست'
                        : `انتخاب ${h.ownerName}`}
                    </span>
                    <Hand className="w-4 h-4 text-cyan-400" />
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Guessing Actions when hand is selected */}
        {gamePhase === 'guessing' && selectedHandId !== null && (
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/40 text-xs shadow-lg">
              <span className="text-slate-400">مشت انتخاب شده:</span>
              <span className="font-black text-amber-400">
                {hands.find((h) => h.id === selectedHandId)?.handSide === 'left'
                  ? '👈 مشت دست چپ'
                  : hands.find((h) => h.id === selectedHandId)?.handSide === 'right'
                  ? '👉 مشت دست راست'
                  : hands.find((h) => h.id === selectedHandId)?.ownerName}
              </span>
              <button
                onClick={() => {
                  setSelectedHandId(null);
                  setGamePhase('reading');
                  sound.playClick();
                }}
                className="mr-2 text-[11px] text-cyan-400 hover:text-cyan-300 underline font-bold"
              >
                تغییر دست 🔄
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 w-full">
              <button
                onClick={handleGuessPooch}
                className="flex-1 max-w-[200px] py-3 px-4 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-slate-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                <Hand className="w-5 h-5 text-cyan-400" />
                <span>این پوچه! ✋</span>
              </button>

              <button
                onClick={handleDeclareGol}
                className="flex-1 max-w-[200px] py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-95 transition-all"
              >
                <Sparkles className="w-5 h-5 fill-black" />
                <span>این گُله! 🌸</span>
              </button>
            </div>
          </div>
        )}

        {/* Revealed Phase: Next Round Button */}
        {gamePhase === 'revealed' && mode !== 'speed' && (
          <div className="flex justify-center animate-bounce">
            <button
              onClick={handleNextRound}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-black text-sm shadow-xl flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>شروع دور بعدی ({round + 1})</span>
            </button>
          </div>
        )}

        {/* Tactical Card Deck */}
        <div className="pt-1">
          <CardDeck
            activeCard={activeCard}
            onUseCard={handleUseCard}
            userGems={wallet.gems}
            disabled={gamePhase !== 'reading' && gamePhase !== 'guessing'}
          />
        </div>

        {/* Match Result Overlay with Advanced Scoring */}
        {gamePhase === 'ended' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="relative max-w-md w-full p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 text-center space-y-5 shadow-2xl">
              <div className="text-5xl">
                {playerScore >= targetScore || (mode === 'speed' && playerScore >= 4) ? '🏆' : '💀'}
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">
                  {playerScore >= targetScore || (mode === 'speed' && playerScore >= 4)
                    ? 'پیروزی قاطع در مسابقه!'
                    : 'پایان مسابقه'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  امتیاز نهایی شما: {playerScore} {mode !== 'speed' && `(حریف: ${opponentScore})`}
                </p>
              </div>

              {/* Advanced Scoring Card */}
              {matchResultRating && (
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-around text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">تغییر امتیاز MMR</div>
                    <div
                      className={`text-base font-black font-num ${
                        matchResultRating.mmrDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {matchResultRating.mmrDelta >= 0 ? '+' : ''}
                      {matchResultRating.mmrDelta}
                    </div>
                  </div>

                  <div className="h-8 w-px bg-white/10" />

                  <div>
                    <div className="text-[10px] text-slate-400">کاپ قهرمانی</div>
                    <div
                      className={`text-base font-black font-num ${
                        matchResultRating.trophyDelta >= 0 ? 'text-cyan-400' : 'text-rose-400'
                      }`}
                    >
                      {matchResultRating.trophyDelta >= 0 ? '+' : ''}
                      {matchResultRating.trophyDelta} 🏆
                    </div>
                  </div>

                  <div className="h-8 w-px bg-white/10" />

                  <div>
                    <div className="text-[10px] text-slate-400">سطح عملکرد</div>
                    <div className="text-base font-black text-amber-400 font-num">
                      {matchResultRating.grade}
                    </div>
                  </div>
                </div>
              )}

              {/* Pot Payout Banner */}
              {playerScore >= targetScore || (mode === 'speed' && playerScore >= 4) ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
                  <div className="text-xs text-amber-300">واریز جایزه به کیف پول شما:</div>
                  <div className="text-2xl font-black text-amber-400 font-num" suppressHydrationWarning>
                    +{formatNumber(netWinnerPot)} سکه 🪙
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                  متأسفانه این مسابقه را واگذار کردید. برای دور بعد آماده شوید!
                </div>
              )}

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    sound.playClick();
                    onExitMatch();
                  }}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-black text-sm shadow-xl active:scale-95 transition-all"
                >
                  بازگشت به لابی مسابقات
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

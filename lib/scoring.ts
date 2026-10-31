import { DivisionTier, LeaderboardEntry, UserStats } from './types';

export function calculateMMRChange({
  isWin,
  isShahGol,
  cleanSweep,
  winStreak,
  mode,
  speedScore = 0,
  difficulty = 'pro',
}: {
  isWin: boolean;
  isShahGol?: boolean;
  cleanSweep?: boolean;
  winStreak?: number;
  mode: string;
  speedScore?: number;
  difficulty?: import('./types').DifficultyLevel;
}): { mmrChange: number; trophyChange: number; performanceGrade: string } {
  let mmrDelta = 0;
  let trophyDelta = 0;
  let grade = 'B';

  const diffMultiplier = difficulty === 'grandmaster' ? 1.5 : difficulty === 'casual' ? 0.8 : 1.0;

  if (mode === 'speed') {
    // In Speed mode, points are earned directly based on score achieved within 60s
    mmrDelta = Math.min(65, Math.round(speedScore * 3.5 * diffMultiplier));
    trophyDelta = Math.round(speedScore * 4 * diffMultiplier);
    grade = speedScore >= 8 ? 'S+' : speedScore >= 5 ? 'A' : 'B';
    return { mmrChange: mmrDelta, trophyChange: trophyDelta, performanceGrade: grade };
  }

  if (isWin) {
    mmrDelta = Math.round(25 * diffMultiplier);
    trophyDelta = Math.round(30 * diffMultiplier);
    grade = 'A';

    // Bonus for Shah Gol on first strike
    if (isShahGol) {
      mmrDelta += Math.round(15 * diffMultiplier);
      trophyDelta += Math.round(20 * diffMultiplier);
      grade = 'S';
    }

    // Bonus for flawless round
    if (cleanSweep) {
      mmrDelta += Math.round(10 * diffMultiplier);
      trophyDelta += Math.round(15 * diffMultiplier);
      grade = grade === 'S' ? 'S+' : 'A+';
    }

    // Streak bonus
    if (winStreak && winStreak >= 3) {
      const streakBonus = Math.min(20, (winStreak - 2) * 5);
      mmrDelta += streakBonus;
      trophyDelta += streakBonus;
    }

    // Survivor mode high stakes
    if (mode === 'survivor') {
      mmrDelta += Math.round(30 * diffMultiplier);
      trophyDelta += Math.round(45 * diffMultiplier);
      grade = 'S+';
    }
  } else {
    // Loss
    mmrDelta = difficulty === 'grandmaster' ? -18 : difficulty === 'casual' ? -10 : -15;
    trophyDelta = difficulty === 'grandmaster' ? -22 : difficulty === 'casual' ? -12 : -18;
    grade = 'C';
  }

  return { mmrChange: mmrDelta, trophyChange: trophyDelta, performanceGrade: grade };
}

export function getDivisionTier(trophies: number): DivisionTier {
  if (trophies >= 3000) return 'grandmaster';
  if (trophies >= 2500) return 'diamond';
  if (trophies >= 2000) return 'platinum';
  if (trophies >= 1500) return 'gold';
  if (trophies >= 1000) return 'silver';
  return 'bronze';
}

export function getDivisionBadgeFa(tier: DivisionTier): { label: string; icon: string; color: string } {
  switch (tier) {
    case 'grandmaster':
      return { label: 'گرند مستر ایران', icon: '👑', color: 'text-amber-400' };
    case 'diamond':
      return { label: 'الماس VIP', icon: '💎', color: 'text-cyan-400' };
    case 'platinum':
      return { label: 'پلاتین برتر', icon: '⚡', color: 'text-purple-400' };
    case 'gold':
      return { label: 'طلای قهرمانی', icon: '🥇', color: 'text-amber-300' };
    case 'silver':
      return { label: 'نقره پیشتاز', icon: '🥈', color: 'text-slate-300' };
    case 'bronze':
    default:
      return { label: 'برنز مبارز', icon: '🥉', color: 'text-amber-600' };
  }
}

export const MOCK_GLOBAL_CHAMPIONS: LeaderboardEntry[] = [
  {
    rank: 1,
    playerId: 'p_top1',
    playerName: 'مهران دست‌طلا (M.Modiri)',
    avatar: '👑',
    ratingMMR: 3450,
    trophies: 3620,
    winRate: 88,
    matchesWon: 412,
    division: 'grandmaster',
    specialBadge: 'قهرمان فصل',
  },
  {
    rank: 2,
    playerId: 'p_top2',
    playerName: 'سهراب شاه‌گل',
    avatar: '🦁',
    ratingMMR: 3280,
    trophies: 3340,
    winRate: 84,
    matchesWon: 375,
    division: 'grandmaster',
    specialBadge: 'سلطان شاه‌گل',
  },
  {
    rank: 3,
    playerId: 'p_top3',
    playerName: 'کوروش چشم‌عقابی',
    avatar: '🦅',
    ratingMMR: 3120,
    trophies: 3190,
    winRate: 81,
    matchesWon: 320,
    division: 'grandmaster',
  },
  {
    rank: 4,
    playerId: 'p_top4',
    playerName: 'آریا بلوف‌شکن',
    avatar: '⚡',
    ratingMMR: 2940,
    trophies: 2880,
    winRate: 78,
    matchesWon: 290,
    division: 'diamond',
  },
  {
    rank: 5,
    playerId: 'p_top5',
    playerName: 'شاهین مافیا',
    avatar: '🎩',
    ratingMMR: 2810,
    trophies: 2750,
    winRate: 76,
    matchesWon: 265,
    division: 'diamond',
  },
  {
    rank: 6,
    playerId: 'p_top6',
    playerName: 'نازنین ذهن‌خوان',
    avatar: '🔮',
    ratingMMR: 2690,
    trophies: 2610,
    winRate: 75,
    matchesWon: 240,
    division: 'diamond',
  },
  {
    rank: 7,
    playerId: 'p_top7',
    playerName: 'داریوش تک‌دست',
    avatar: '🗡️',
    ratingMMR: 2420,
    trophies: 2350,
    winRate: 72,
    matchesWon: 210,
    division: 'platinum',
  },
];

export const MOCK_FRIENDS_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    playerId: 'p_f1',
    playerName: 'کامران (هم‌باشگاهی)',
    avatar: '😎',
    ratingMMR: 2150,
    trophies: 2090,
    winRate: 68,
    matchesWon: 145,
    division: 'platinum',
  },
  {
    rank: 2,
    playerId: 'p_f2',
    playerName: 'رضا لوتی',
    avatar: '🔥',
    ratingMMR: 1980,
    trophies: 1920,
    winRate: 65,
    matchesWon: 120,
    division: 'gold',
  },
  {
    rank: 3,
    playerId: 'p_f3',
    playerName: 'فرزاد تیزدست',
    avatar: '🦊',
    ratingMMR: 1720,
    trophies: 1680,
    winRate: 61,
    matchesWon: 95,
    division: 'gold',
  },
  {
    rank: 4,
    playerId: 'p_f4',
    playerName: 'سینا پات‌کِش',
    avatar: '🎲',
    ratingMMR: 1450,
    trophies: 1390,
    winRate: 55,
    matchesWon: 70,
    division: 'silver',
  },
];

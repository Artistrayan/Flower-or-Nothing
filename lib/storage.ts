import {
  StakeRoom,
  HandSkin,
  JewelSkin,
  ArenaSkin,
  BluffPose,
  SpecialCard,
  UserWallet,
  UserStats,
  WalletTransaction,
} from './types';

export const STAKE_ROOMS: StakeRoom[] = [
  {
    id: 'room_novice',
    name: 'Novice Table',
    nameFa: 'میز مبتدی',
    entryFee: 500,
    commissionPercent: 7,
    minLevel: 1,
    badge: '🥉',
    color: '#10B981',
    gradient: 'from-emerald-900/60 to-slate-900',
  },
  {
    id: 'room_bronze',
    name: 'Tehran Teahouse',
    nameFa: 'کافه طهران',
    entryFee: 2500,
    commissionPercent: 6,
    minLevel: 2,
    badge: '🥉',
    color: '#CD7F32',
    gradient: 'from-amber-950/60 to-slate-900',
  },
  {
    id: 'room_silver',
    name: 'Underground Club',
    nameFa: 'کلوب زیرزمینی',
    entryFee: 10000,
    commissionPercent: 5,
    minLevel: 5,
    badge: '🥈',
    color: '#94A3B8',
    gradient: 'from-slate-800/80 to-slate-950',
  },
  {
    id: 'room_gold',
    name: 'Casino Royale',
    nameFa: 'کازینو رویال',
    entryFee: 50000,
    commissionPercent: 5,
    minLevel: 10,
    badge: '🥇',
    color: '#F59E0B',
    gradient: 'from-amber-600/30 to-slate-950',
  },
  {
    id: 'room_diamond',
    name: 'Grandmaster Penthouse',
    nameFa: 'پنت‌هاوس گرند مستر',
    entryFee: 250000,
    commissionPercent: 4,
    minLevel: 20,
    badge: '💎',
    color: '#06B6D4',
    gradient: 'from-cyan-900/50 to-slate-950',
  },
];

export const HAND_SKINS: HandSkin[] = [
  {
    id: 'hand_classic',
    name: 'Classic Touch',
    nameFa: 'دست طبیعی کلاسیک',
    type: 'classic',
    price: 0,
    unlocked: true,
    rarity: 'common',
    descriptionFa: 'دست طبیعی با پوست طبیعی و خطوط کف دست واقع‌گرایانه',
    previewColor: '#e0ac69',
  },
  {
    id: 'hand_midas_gold',
    name: 'Midas Gold Touch',
    nameFa: 'پنجه طلایی میداس',
    type: 'midas_gold',
    price: 15000,
    unlocked: false,
    rarity: 'legendary',
    descriptionFa: 'ساخته شده از طلای خالص ۲۴ عیار با انعکاس نور خیره‌کننده',
    previewColor: '#f59e0b',
  },
  {
    id: 'hand_cyber_mech',
    name: 'Cyber Mech 2099',
    nameFa: 'دست سایبر مکانیکی',
    type: 'cyber_mech',
    price: 8000,
    unlocked: false,
    rarity: 'epic',
    descriptionFa: 'آلیاژ تیتانیوم با فیبر کربن تیره و ال‌ای‌دی‌های نئونی کوانتومی',
    previewColor: '#06b6d4',
  },
  {
    id: 'hand_gangster_ink',
    name: 'Gangster Tattoo',
    nameFa: 'دست تاتودار لوتی',
    type: 'gangster_ink',
    price: 4500,
    unlocked: false,
    rarity: 'rare',
    descriptionFa: 'پوست با نقوش تاتو و انگشتر نقره کهن برای ایجاد رعب در دل حریف',
    previewColor: '#64748b',
  },
  {
    id: 'hand_noir_velvet',
    name: 'Noir Velvet Mafia',
    nameFa: 'دستکش مخمل پدرخوانده',
    type: 'noir_velvet',
    price: 25000,
    unlocked: false,
    rarity: 'legendary',
    descriptionFa: 'دستکش مخمل مشکی مات با نگین یاقوت سرخ سلطنتی',
    previewColor: '#be123c',
  },
];

export const JEWEL_SKINS: JewelSkin[] = [
  {
    id: 'jewel_diamond',
    name: 'Royal Diamond',
    nameFa: 'الماس تراش‌خورده برلیان',
    type: 'diamond',
    price: 0,
    unlocked: true,
    rarity: 'common',
    descriptionFa: 'الماس شفاف درخشان با انکسار نور کریستالی خیره‌کننده',
    glowColor: '#38bdf8',
  },
  {
    id: 'jewel_ancient_coin',
    name: 'Achaemenid Daric',
    nameFa: 'سکه زرین هخامنشی',
    type: 'ancient_coin',
    price: 5000,
    unlocked: false,
    rarity: 'rare',
    descriptionFa: 'سکه عتیقه ۲۵۰۰ ساله طلا با نقش کماندار باستانی',
    glowColor: '#fbbf24',
  },
  {
    id: 'jewel_cyber_rose',
    name: 'Cyber Hologram Rose',
    nameFa: 'گل رز نئونی سایبری',
    type: 'cyber_rose',
    price: 12000,
    unlocked: false,
    rarity: 'epic',
    descriptionFa: 'رز نوری هولوگرافیک با ذرات معلق پالس زننده',
    glowColor: '#ec4899',
  },
  {
    id: 'jewel_quantum_cube',
    name: 'Quantum Tesseract',
    nameFa: 'تسراکت کوانتومی',
    type: 'quantum_cube',
    price: 30000,
    unlocked: false,
    rarity: 'legendary',
    descriptionFa: 'مکعب چهاربعدی چرخان با انرژی درونی آبی نئونی',
    glowColor: '#a855f7',
  },
  {
    id: 'jewel_ruby_agate',
    name: 'Yemeni Ruby Agate',
    nameFa: 'عقیق سرخ یمنی',
    type: 'ruby_agate',
    price: 3000,
    unlocked: false,
    rarity: 'rare',
    descriptionFa: 'نگین طبیعی خوش‌رنگ با درخشش سنتی و حسی از خوش‌اقبالی',
    glowColor: '#f43f5e',
  },
];

export const BLUFF_POSES: BluffPose[] = [
  {
    id: 'pose_classic',
    name: 'Standard Fists',
    nameFa: 'مشت‌های کلاسیک روبرو',
    poseType: 'classic',
    price: 0,
    unlocked: true,
    descriptionFa: 'استقرار مستقیم دو دست روی میز با فاصله معین',
  },
  {
    id: 'pose_tap',
    name: 'Nerve-Wracking Finger Tap',
    nameFa: 'ضربه ریتمیک با انگشت',
    poseType: 'tap_fingers',
    price: 4000,
    unlocked: false,
    descriptionFa: 'کوبیدن انگشت روی میز برای برهم زدن تمرکز و ایجاد دلهره در حریف',
  },
  {
    id: 'pose_shifty',
    name: 'Shifty Angle Bluff',
    nameFa: 'زاویه کج و بلوف نگاه',
    poseType: 'shifty_peek',
    price: 8500,
    unlocked: false,
    descriptionFa: 'قرار دادن یک دست جلوتر برای فریب بصری و سنجش واکنش چشم رقیب',
  },
  {
    id: 'pose_cross',
    name: 'Crossed Arms Guard',
    nameFa: 'دستان ضربدری محافظه‌کار',
    poseType: 'crossed_arms',
    price: 15000,
    unlocked: false,
    descriptionFa: 'وضعیت دفاعی رازآلود که خواندن زبان بدن را غیرممکن می‌کند',
  },
];

export const ARENA_SKINS: ArenaSkin[] = [
  {
    id: 'arena_vip',
    name: 'VIP Casino Velvet',
    nameFa: 'میز کازینوی مخمل سبز و چوب ماهون',
    type: 'vip_casino',
    price: 0,
    unlocked: true,
    descriptionFa: 'میز رسمی بین‌المللی با پارچه سبز نمدی و قاب طلایی',
    tableColor: 0x22110c,
    clothColor: 0x064e3b,
  },
  {
    id: 'arena_cyber',
    name: 'Cyber Underground',
    nameFa: 'اتاق زیرزمینی نئونی',
    type: 'cyber_underground',
    price: 10000,
    unlocked: false,
    descriptionFa: 'فضای تکنولوژیک تاریک با خطوط نور آبی و رفلکس‌های شیشه‌ای تیره',
    tableColor: 0x0a0f1d,
    clothColor: 0x0f172a,
  },
  {
    id: 'arena_teahouse',
    name: 'Old Tehran Teahouse',
    nameFa: 'قهوه‌خانه طهران قدیم',
    type: 'traditional_teahouse',
    price: 6000,
    unlocked: false,
    descriptionFa: 'میز سنتی چوبی کهنه با ترمه فیروزه‌ای و حس و حال نوستالژیک',
    tableColor: 0x3d2314,
    clothColor: 0x0e7490,
  },
  {
    id: 'arena_penthouse',
    name: 'Penthouse High Roller',
    nameFa: 'پنت‌هاوس سرمایه‌داران',
    type: 'grandmaster_penthouse',
    price: 25000,
    unlocked: false,
    descriptionFa: 'میز سنگ مرمر مشکی رگه‌دار با پرداخت لوکس طلایی',
    tableColor: 0x111111,
    clothColor: 0x1c1917,
  },
];

export const SPECIAL_CARDS: SpecialCard[] = [
  {
    id: 'shah_gol',
    nameFa: 'کارت شاه‌گل 👑',
    icon: 'Crown',
    descriptionFa: 'با اولین ضربه مستقیم گل را مشخص کنید؛ اگر درست باشد، امتیاز ۲ برابر می‌گیرید!',
    costInGems: 15,
    count: 2,
  },
  {
    id: 'booye_gol',
    nameFa: 'کارت بوی گل 🌸',
    icon: 'Sparkles',
    descriptionFa: 'حس ششم فعال می‌شود: ارتعاش دست مشکوک را با پالس نوری حس کنید.',
    costInGems: 10,
    count: 3,
  },
  {
    id: 'daste_khali',
    nameFa: 'کارت دست خالی ✋',
    icon: 'Hand',
    descriptionFa: 'حریف مجبور می‌شود یکی از دست‌های بدون گل خود را باز کند.',
    costInGems: 8,
    count: 3,
  },
  {
    id: 'duel',
    nameFa: 'کارت دوئل ⚔️',
    icon: 'Swords',
    descriptionFa: 'در بازی ۴ نفره، یاران کنار رفته و دوئل مرگبار تک‌به‌تک انجام می‌شود.',
    costInGems: 20,
    count: 1,
  },
];

const WALLET_KEY = 'gyp_wallet_v1';
const STATS_KEY = 'gyp_stats_v1';
const UNLOCKS_KEY = 'gyp_unlocks_v1';
const CARDS_KEY = 'gyp_cards_v1';
const TXS_KEY = 'gyp_transactions_v1';

export const DEFAULT_WALLET: UserWallet = { coins: 15000, gems: 50, lastDailyClaim: 0 };

export function getStoredWallet(): UserWallet {
  if (typeof window === 'undefined') return DEFAULT_WALLET;
  try {
    const raw = localStorage.getItem(WALLET_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveWallet(DEFAULT_WALLET);
  return DEFAULT_WALLET;
}

export function saveWallet(wallet: UserWallet) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
  } catch {}
}

export const DEFAULT_DAILY_CHALLENGES: import('./types').DailyChallenge[] = [
  {
    id: 'ch_win_games',
    titleFa: 'پیروزی‌های پی‌درپی',
    descFa: '۲ مسابقه را در هر مدلی با پیروزی به پایان برسانید',
    target: 2,
    current: 1,
    rewardCoins: 3000,
    rewardGems: 4,
    rewardXp: 400,
    isCompleted: false,
    isClaimed: false,
    icon: '🏆',
  },
  {
    id: 'ch_shah_gol',
    titleFa: 'ضربه کاری شاه‌گل',
    descFa: 'با کارت شاه‌گل در اولین ضربه حدس کاملاً درست بزنید',
    target: 1,
    current: 0,
    rewardCoins: 5000,
    rewardGems: 8,
    rewardXp: 600,
    isCompleted: false,
    isClaimed: false,
    icon: '👑',
  },
  {
    id: 'ch_speed_rush',
    titleFa: 'ماراتن رکورد سرعت',
    descFa: 'در حالت ۶۰ ثانیه‌ای سرعت، حداقل ۴ امتیاز کسب کنید',
    target: 4,
    current: 3,
    rewardCoins: 4500,
    rewardGems: 5,
    rewardXp: 500,
    isCompleted: false,
    isClaimed: false,
    icon: '⚡',
  },
  {
    id: 'ch_survivor_hero',
    titleFa: 'بقا در رینگ مرگ',
    descFa: 'در مسابقه حذفی بازمانده به فینال برسید یا برنده شوید',
    target: 1,
    current: 1,
    rewardCoins: 8000,
    rewardGems: 12,
    rewardXp: 900,
    isCompleted: true,
    isClaimed: false,
    icon: '🔥',
  },
];

export const DEFAULT_SPECIAL_EVENTS: import('./types').SpecialEvent[] = [
  {
    id: 'evt_grandmaster_cup',
    titleFa: 'جام طلایی گرند مستر طهران',
    descFa: 'بزرگترین تورنمنت هفته با پات جایزه نیم میلیونی و حضور برترین بازیکنان رنک الماس و گرند مستر',
    mode: 'survivor',
    bannerGradient: 'from-amber-600 via-amber-800 to-slate-950',
    endsInHours: 14,
    grandPrizeCoins: 500000,
    rewardTitleFa: 'نشان زرین جام طهران + ۲۰۰ الماس',
    currentPoints: 240,
    targetPoints: 500,
    isJoined: true,
    badge: '👑',
  },
  {
    id: 'evt_speed_championship',
    titleFa: 'ماراتن شبانه گل یا پوچ سرعتی',
    descFa: 'رقابت ۶۰ ثانیه‌ای حدس رعدآسا؛ هر حدس درست امتیاز رویداد را دوبرابر می‌کند',
    mode: 'speed',
    bannerGradient: 'from-cyan-600 via-blue-900 to-slate-950',
    endsInHours: 6,
    grandPrizeCoins: 200000,
    rewardTitleFa: 'تندیس آذرخش سایبر + ۸۰ الماس',
    currentPoints: 120,
    targetPoints: 300,
    isJoined: false,
    badge: '⚡',
  },
  {
    id: 'evt_duo_clash',
    titleFa: 'نبرد اتحادیه‌ها (چالش تیمی ۲ به ۲)',
    descFa: 'همراه با یار کمکی، پاس گل‌های غیرقابل خواندن بدهید و جام تیمی را ببرید',
    mode: '2v2',
    bannerGradient: 'from-purple-600 via-indigo-950 to-slate-950',
    endsInHours: 36,
    grandPrizeCoins: 350000,
    rewardTitleFa: 'حلقه یاقوت سرخ دوئل + ۱۲۰ الماس',
    currentPoints: 0,
    targetPoints: 400,
    isJoined: false,
    badge: '🤝',
  },
];

const CHALLENGES_KEY = 'gyp_challenges_v1';
const EVENTS_KEY = 'gyp_events_v1';

export function getStoredChallenges(): import('./types').DailyChallenge[] {
  if (typeof window === 'undefined') return DEFAULT_DAILY_CHALLENGES;
  try {
    const raw = localStorage.getItem(CHALLENGES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveChallenges(DEFAULT_DAILY_CHALLENGES);
  return DEFAULT_DAILY_CHALLENGES;
}

export function saveChallenges(challenges: import('./types').DailyChallenge[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHALLENGES_KEY, JSON.stringify(challenges));
  } catch {}
}

export function getStoredEvents(): import('./types').SpecialEvent[] {
  if (typeof window === 'undefined') return DEFAULT_SPECIAL_EVENTS;
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveEvents(DEFAULT_SPECIAL_EVENTS);
  return DEFAULT_SPECIAL_EVENTS;
}

export function saveEvents(events: import('./types').SpecialEvent[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch {}
}

export const DEFAULT_STATS: UserStats = {
  gamesPlayed: 14,
  gamesWon: 11,
  winStreak: 4,
  bestStreak: 7,
  totalCoinsWon: 85000,
  shahGolSuccessCount: 3,
  ratingMMR: 1680,
  trophies: 1720,
  division: 'gold',
  speedHighScore: 6,
  survivorWins: 2,
  teamWins: 5,
};

export function getStoredStats(): UserStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (raw) return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {}
  saveStats(DEFAULT_STATS);
  return DEFAULT_STATS;
}

export function saveStats(stats: UserStats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export interface UnlockedState {
  handSkins: string[];
  jewelSkins: string[];
  arenas: string[];
  poses: string[];
  selectedHand: string;
  selectedJewel: string;
  selectedArena: string;
  selectedPose: string;
  userGender: import('./types').Gender;
  userStyle: import('./types').CharacterStyle;
  opponentGender: import('./types').Gender;
  opponentStyle: import('./types').CharacterStyle;
  difficulty: import('./types').DifficultyLevel;
}

export const DEFAULT_UNLOCKS: UnlockedState = {
  handSkins: ['hand_classic'],
  jewelSkins: ['jewel_diamond'],
  arenas: ['arena_vip'],
  poses: ['pose_classic'],
  selectedHand: 'hand_classic',
  selectedJewel: 'jewel_diamond',
  selectedArena: 'arena_vip',
  selectedPose: 'pose_classic',
  userGender: 'male',
  userStyle: 'anime',
  opponentGender: 'female',
  opponentStyle: 'anime',
  difficulty: 'pro',
};

export function getStoredUnlocks(): UnlockedState {
  if (typeof window === 'undefined') return DEFAULT_UNLOCKS;
  try {
    const raw = localStorage.getItem(UNLOCKS_KEY);
    if (raw) return { ...DEFAULT_UNLOCKS, ...JSON.parse(raw) };
  } catch {}
  saveUnlocks(DEFAULT_UNLOCKS);
  return DEFAULT_UNLOCKS;
}

export function saveUnlocks(unlocks: UnlockedState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(UNLOCKS_KEY, JSON.stringify(unlocks));
  } catch {}
}

export const DEFAULT_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx_welcome',
    type: 'deposit',
    amount: 15000,
    timestamp: 1700000000000,
    descriptionFa: 'هدیه خوش‌آمدگویی افتتاح حساب VIP',
  },
  {
    id: 'tx_win1',
    type: 'win',
    amount: 4700,
    timestamp: 1700003600000,
    descriptionFa: 'پیروزی در کافه طهران (کسر ۶٪ کمیسیون میز)',
  },
];

export function getStoredTransactions(): WalletTransaction[] {
  if (typeof window === 'undefined') return DEFAULT_TRANSACTIONS;
  try {
    const raw = localStorage.getItem(TXS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveTransactions(DEFAULT_TRANSACTIONS);
  return DEFAULT_TRANSACTIONS;
}

export function saveTransactions(txs: WalletTransaction[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TXS_KEY, JSON.stringify(txs.slice(0, 30)));
  } catch {}
}

export function addTransaction(tx: Omit<WalletTransaction, 'id' | 'timestamp'>) {
  const current = getStoredTransactions();
  const newTx: WalletTransaction = {
    ...tx,
    id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: Date.now(),
  };
  saveTransactions([newTx, ...current]);
  return newTx;
}

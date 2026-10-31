export type GameMode = '1v1' | '2v2' | 'group' | 'speed' | 'survivor';

export type Gender = 'male' | 'female';
export type CharacterStyle = 'anime' | 'human';
export type DifficultyLevel = 'casual' | 'pro' | 'grandmaster';

export type GamePhase =
  | 'lobby'
  | 'matchmaking'
  | 'hiding'       // Player/Dealer is choosing which hand hides the "Gol"
  | 'shuffling'    // Dramatic 3D sleight-of-hand shell shuffle
  | 'bluffing'     // Teasing, conversation, card play, posture
  | 'guessing'     // Guesser picking empty hands ("Pooch") or declaring the "Gol"
  | 'revealing'    // Hands opening up with 3D animations & particles
  | 'round_result' // Round end score & animations
  | 'match_over';  // Match end pot payout after platform rake

export interface StakeRoom {
  id: string;
  name: string;
  nameFa: string;
  entryFee: number;
  commissionPercent: number; // e.g. 5 = 5% platform commission
  minLevel: number;
  badge: string;
  color: string;
  gradient: string;
}

export interface HandSkin {
  id: string;
  name: string;
  nameFa: string;
  type: 'classic' | 'midas_gold' | 'cyber_mech' | 'gangster_ink' | 'noir_velvet';
  price: number;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  descriptionFa: string;
  previewColor: string;
}

export interface JewelSkin {
  id: string;
  name: string;
  nameFa: string;
  type: 'diamond' | 'ancient_coin' | 'cyber_rose' | 'quantum_cube' | 'ruby_agate';
  price: number;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  descriptionFa: string;
  glowColor: string;
}

export interface ArenaSkin {
  id: string;
  name: string;
  nameFa: string;
  type: 'vip_casino' | 'cyber_underground' | 'traditional_teahouse' | 'grandmaster_penthouse';
  price: number;
  unlocked: boolean;
  descriptionFa: string;
  tableColor: number;
  clothColor: number;
}

export interface BluffPose {
  id: string;
  name: string;
  nameFa: string;
  poseType: 'classic' | 'tap_fingers' | 'crossed_arms' | 'shifty_peek';
  price: number;
  unlocked: boolean;
  descriptionFa: string;
}

export interface SpecialCard {
  id: 'shah_gol' | 'booye_gol' | 'daste_khali' | 'duel';
  nameFa: string;
  icon: string;
  descriptionFa: string;
  costInGems: number;
  count: number;
}

export interface HandState {
  id: number;
  ownerId: string;
  ownerName: string;
  handSide: 'left' | 'right';
  hasGol: boolean;
  isOpened: boolean;
  isEliminated: boolean; // marked as Pooch and opened safely
  isTargeted: boolean;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  team: 'A' | 'B';
  isHost?: boolean;
  isBot?: boolean;
  level: number;
  bluffRate: number; // 0 to 1
  selectedHandSkin: string;
  gender?: Gender;
  characterStyle?: CharacterStyle;
}

export interface UserWallet {
  coins: number;
  gems: number;
  lastDailyClaim?: number;
}

export interface WalletTransaction {
  id: string;
  type: 'win' | 'entry_fee' | 'commission_rake' | 'daily_reward' | 'shop_purchase' | 'deposit';
  amount: number;
  timestamp: number;
  descriptionFa: string;
}

export type DivisionTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'grandmaster';

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  winStreak: number;
  bestStreak: number;
  totalCoinsWon: number;
  shahGolSuccessCount: number;
  // Advanced Scoring & MMR
  ratingMMR: number;       // e.g. 1450 MMR
  trophies: number;        // e.g. 1280 trophies
  division: DivisionTier;
  speedHighScore: number;  // max score in 60s speed mode
  survivorWins: number;    // times won Survivor battle royale
  teamWins: number;        // 2v2 team victories
}

export interface DailyChallenge {
  id: string;
  titleFa: string;
  descFa: string;
  target: number;
  current: number;
  rewardCoins: number;
  rewardGems: number;
  rewardXp: number;
  isCompleted: boolean;
  isClaimed: boolean;
  icon: string;
}

export interface SpecialEvent {
  id: string;
  titleFa: string;
  descFa: string;
  mode: GameMode;
  bannerGradient: string;
  endsInHours: number;
  grandPrizeCoins: number;
  rewardTitleFa: string;
  currentPoints: number;
  targetPoints: number;
  isJoined: boolean;
  badge: string;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerName: string;
  avatar: string;
  ratingMMR: number;
  trophies: number;
  winRate: number;
  matchesWon: number;
  division: DivisionTier;
  isUser?: boolean;
  specialBadge?: string;
}

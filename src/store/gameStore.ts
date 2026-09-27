import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserCareerStats } from '../types/game';
import { UserProfile } from '../types/auth';

const STORAGE_KEYS = {
  USER_PROFILE: '@morabaraba_user_profile',
  IS_ONBOARDED: '@morabaraba_is_onboarded',
  CAREER_STATS: '@morabaraba_career_stats',
};

const DEFAULT_STATS: UserCareerStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  gamesLost: 0,
  millsFormed: 0,
  cowsCaptured: 0,
  flownCowCount: 0,
  winStreak: 0,
  eloRating: 1200,
};

export interface LeaderboardEntry {
  rank: number;
  gamerTag: string;
  country: string;
  countryCode: string;
  province: string;
  town: string;
  elo: number;
  winRate: number;
  wins: number;
  title: string;
}

export const INITIAL_REGIONAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, gamerTag: 'Kgosi_Sipho', country: 'South Africa', countryCode: 'ZA', province: 'Gauteng', town: 'Soweto', elo: 2180, winRate: 84, wins: 242, title: 'Grandmaster' },
  { rank: 2, gamerTag: 'Mambo_Tinashe', country: 'Zimbabwe', countryCode: 'ZW', province: 'Harare', town: 'Harare Central', elo: 2095, winRate: 81, wins: 198, title: 'Warrior Chief' },
  { rank: 3, gamerTag: 'Mophato_Kabo', country: 'Botswana', countryCode: 'BW', province: 'South-East', town: 'Gaborone', elo: 2040, winRate: 79, wins: 176, title: 'Vanguard' },
  { rank: 4, gamerTag: 'Inyatsi_Sibusiso', country: 'Eswatini', countryCode: 'SZ', province: 'Hhohho', town: 'Mbabane', elo: 1980, winRate: 76, wins: 154, title: 'Tactician' },
  { rank: 5, gamerTag: 'Tau_Maseru', country: 'Lesotho', countryCode: 'LS', province: 'Maseru District', town: 'Maseru', elo: 1920, winRate: 74, wins: 140, title: 'Tactician' },
  { rank: 6, gamerTag: 'Eagle_Lusaka', country: 'Zambia', countryCode: 'ZM', province: 'Lusaka', town: 'Lusaka', elo: 1890, winRate: 72, wins: 125, title: 'Champion' },
  { rank: 7, gamerTag: 'Lake_Chikondi', country: 'Malawi', countryCode: 'MW', province: 'Southern Region', town: 'Blantyre', elo: 1830, winRate: 70, wins: 110, title: 'Champion' },
  { rank: 8, gamerTag: 'Veldt_Lethabo', country: 'South Africa', countryCode: 'ZA', province: 'Limpopo', town: 'Polokwane', elo: 1790, winRate: 68, wins: 98, title: 'Warrior' },
];

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return null;
    return parsed as UserProfile;
  } catch {
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    await AsyncStorage.setItem(STORAGE_KEYS.IS_ONBOARDED, 'true');
  } catch (e) {
    console.error('Error saving user profile', e);
  }
}

export async function clearUserProfile(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  } catch (e) {
    console.error('Error clearing profile', e);
  }
}

export async function getIsOnboarded(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(STORAGE_KEYS.IS_ONBOARDED);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function markOnboarded(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.IS_ONBOARDED, 'true');
  } catch (e) {
    console.error('Error setting onboarded state', e);
  }
}

export async function getCareerStats(): Promise<UserCareerStats> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.CAREER_STATS);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_STATS;
    return {
      gamesPlayed: typeof parsed.gamesPlayed === 'number' ? parsed.gamesPlayed : DEFAULT_STATS.gamesPlayed,
      gamesWon: typeof parsed.gamesWon === 'number' ? parsed.gamesWon : DEFAULT_STATS.gamesWon,
      gamesLost: typeof parsed.gamesLost === 'number' ? parsed.gamesLost : DEFAULT_STATS.gamesLost,
      millsFormed: typeof parsed.millsFormed === 'number' ? parsed.millsFormed : DEFAULT_STATS.millsFormed,
      cowsCaptured: typeof parsed.cowsCaptured === 'number' ? parsed.cowsCaptured : DEFAULT_STATS.cowsCaptured,
      flownCowCount: typeof parsed.flownCowCount === 'number' ? parsed.flownCowCount : DEFAULT_STATS.flownCowCount,
      winStreak: typeof parsed.winStreak === 'number' ? parsed.winStreak : DEFAULT_STATS.winStreak,
      eloRating: typeof parsed.eloRating === 'number' ? parsed.eloRating : DEFAULT_STATS.eloRating,
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export async function recordGameResult(
  won: boolean,
  millsFormed: number,
  cowsCaptured: number,
  didFly: boolean
): Promise<UserCareerStats> {
  try {
    const current = await getCareerStats();
    const safeMills = Number.isFinite(millsFormed) ? millsFormed : 0;
    const safeCows = Number.isFinite(cowsCaptured) ? cowsCaptured : 0;
    const currentElo = Number.isFinite(current.eloRating) ? current.eloRating : 1200;

    const newStats: UserCareerStats = {
      gamesPlayed: (current.gamesPlayed || 0) + 1,
      gamesWon: (current.gamesWon || 0) + (won ? 1 : 0),
      gamesLost: (current.gamesLost || 0) + (won ? 0 : 1),
      millsFormed: (current.millsFormed || 0) + safeMills,
      cowsCaptured: (current.cowsCaptured || 0) + safeCows,
      flownCowCount: (current.flownCowCount || 0) + (didFly ? 1 : 0),
      winStreak: won ? (current.winStreak || 0) + 1 : 0,
      eloRating: Math.max(800, currentElo + (won ? 25 : -18)),
    };
    await AsyncStorage.setItem(STORAGE_KEYS.CAREER_STATS, JSON.stringify(newStats));
    return newStats;
  } catch {
    return DEFAULT_STATS;
  }
}

export async function clearAllGameData(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE),
      AsyncStorage.removeItem(STORAGE_KEYS.IS_ONBOARDED),
      AsyncStorage.removeItem(STORAGE_KEYS.CAREER_STATS),
    ]);
  } catch (e) {
    console.error('Error clearing game data', e);
  }
}

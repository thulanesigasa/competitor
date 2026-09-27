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
    return raw ? JSON.parse(raw) : null;
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
    return raw ? JSON.parse(raw) : DEFAULT_STATS;
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
    const newStats: UserCareerStats = {
      gamesPlayed: current.gamesPlayed + 1,
      gamesWon: current.gamesWon + (won ? 1 : 0),
      gamesLost: current.gamesLost + (won ? 0 : 1),
      millsFormed: current.millsFormed + millsFormed,
      cowsCaptured: current.cowsCaptured + cowsCaptured,
      flownCowCount: current.flownCowCount + (didFly ? 1 : 0),
      winStreak: won ? current.winStreak + 1 : 0,
      eloRating: Math.max(800, current.eloRating + (won ? 25 : -18)),
    };
    await AsyncStorage.setItem(STORAGE_KEYS.CAREER_STATS, JSON.stringify(newStats));
    return newStats;
  } catch {
    return DEFAULT_STATS;
  }
}

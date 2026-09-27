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

export const INITIAL_REGIONAL_LEADERBOARD: LeaderboardEntry[] = [];

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

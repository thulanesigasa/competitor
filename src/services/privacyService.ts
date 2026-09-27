import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionSecurityService } from './sessionSecurityService';

const PRIVACY_MODE_KEY = '@morabaraba_privacy_mode_v1';
const LEADERBOARD_DISCOVERY_KEY = '@morabaraba_leaderboard_discovery_v1';
const STATS_VISIBILITY_KEY = '@morabaraba_stats_visibility_v1';
const BIOMETRIC_ENABLED_KEY = '@morabaraba_biometric_enabled_v1';
const PRIVACY_SHIELD_KEY = '@morabaraba_privacy_shield_v1';
const LOCK_TIMEOUT_KEY = '@morabaraba_lock_timeout_v1';
const BLOCKED_USERS_KEY = '@morabaraba_blocked_users_v1';
const DESIRED_REGION_KEY = '@morabaraba_desired_challenge_region_v1';

export interface BlockedCompetitor {
  id: string;
  gamerTag: string;
  blockedAt: string;
}

export interface DesiredChallengeRegion {
  province: string;
  town: string;
}

export interface LockTimeoutOption {
  seconds: number;
  label: string;
  description: string;
}

export const LOCK_TIMEOUT_OPTIONS: LockTimeoutOption[] = [
  { seconds: 0, label: 'Immediately', description: 'Locks as soon as Morabaraba is minimized' },
  { seconds: 60, label: '1 Minute', description: 'Locks after 1 minute in the background' },
  { seconds: 300, label: '5 Minutes', description: 'Locks after 5 minutes of inactivity' },
  { seconds: 900, label: '15 Minutes', description: 'Locks after 15 minutes of inactivity' },
  { seconds: 1800, label: '30 Minutes', description: 'Locks after 30 minutes of inactivity' },
  { seconds: -1, label: 'Never', description: 'Inactivity auto-lock is disabled' },
];

export const PrivacyService = {
  // 1. Privacy Mode (Incognito Matchmaking)
  getPrivacyMode: async (): Promise<boolean> => {
    try {
      const val = await AsyncStorage.getItem(PRIVACY_MODE_KEY);
      return val === 'true';
    } catch {
      return false;
    }
  },
  setPrivacyMode: async (enabled: boolean): Promise<void> => {
    await AsyncStorage.setItem(PRIVACY_MODE_KEY, String(enabled));
    await SessionSecurityService.recordAuditEvent(
      'PRIVACY_MODE_TOGGLED',
      `Incognito matchmaking ${enabled ? 'enabled' : 'disabled'}`
    );
  },

  // 2. Leaderboard Discoverability
  getLeaderboardDiscoverable: async (): Promise<boolean> => {
    try {
      const val = await AsyncStorage.getItem(LEADERBOARD_DISCOVERY_KEY);
      return val !== 'false'; // Default to true
    } catch {
      return true;
    }
  },
  setLeaderboardDiscoverable: async (enabled: boolean): Promise<void> => {
    await AsyncStorage.setItem(LEADERBOARD_DISCOVERY_KEY, String(enabled));
  },

  // 3. Stats Public Visibility
  getStatsVisibility: async (): Promise<boolean> => {
    try {
      const val = await AsyncStorage.getItem(STATS_VISIBILITY_KEY);
      return val !== 'false'; // Default to true
    } catch {
      return true;
    }
  },
  setStatsVisibility: async (enabled: boolean): Promise<void> => {
    await AsyncStorage.setItem(STATS_VISIBILITY_KEY, String(enabled));
  },

  // 4. Biometrics / Fingerprint
  getBiometricEnabled: async (): Promise<boolean> => {
    try {
      const val = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      return val === 'true';
    } catch {
      return false;
    }
  },
  setBiometricEnabled: async (enabled: boolean): Promise<void> => {
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, String(enabled));
  },

  // 5. App Switcher Privacy Shield
  getPrivacyShieldEnabled: async (): Promise<boolean> => {
    try {
      const val = await AsyncStorage.getItem(PRIVACY_SHIELD_KEY);
      return val !== 'false'; // Default to enabled for safety
    } catch {
      return true;
    }
  },
  setPrivacyShieldEnabled: async (enabled: boolean): Promise<void> => {
    await AsyncStorage.setItem(PRIVACY_SHIELD_KEY, String(enabled));
  },

  // 6. Lock Timeout
  getLockTimeoutSeconds: async (): Promise<number> => {
    try {
      const val = await AsyncStorage.getItem(LOCK_TIMEOUT_KEY);
      return val ? Number(val) : 300; // Default: 5 minutes
    } catch {
      return 300;
    }
  },
  setLockTimeoutSeconds: async (seconds: number): Promise<void> => {
    await AsyncStorage.setItem(LOCK_TIMEOUT_KEY, String(seconds));
  },

  // 7. Blocked Competitors
  getBlockedCompetitors: async (): Promise<BlockedCompetitor[]> => {
    try {
      const raw = await AsyncStorage.getItem(BLOCKED_USERS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  },
  blockCompetitor: async (id: string, gamerTag: string): Promise<void> => {
    const list = await PrivacyService.getBlockedCompetitors();
    if (!list.some((u) => u.id === id)) {
      const updated = [
        ...list,
        { id, gamerTag, blockedAt: new Date().toISOString() },
      ];
      await AsyncStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(updated));
      await SessionSecurityService.recordAuditEvent(
        'COMPETITOR_BLOCKED',
        `Blocked competitor @${gamerTag} (${id.substring(0, 8)})`
      );
    }
  },
  unblockCompetitor: async (id: string): Promise<void> => {
    const list = await PrivacyService.getBlockedCompetitors();
    const target = list.find((u) => u.id === id);
    const updated = list.filter((u) => u.id !== id);
    await AsyncStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(updated));
    if (target) {
      await SessionSecurityService.recordAuditEvent(
        'COMPETITOR_UNBLOCKED',
        `Unblocked competitor @${target.gamerTag}`
      );
    }
  },
  isCompetitorBlocked: async (id: string): Promise<boolean> => {
    const list = await PrivacyService.getBlockedCompetitors();
    return list.some((u) => u.id === id);
  },

  // 8. Desired Challenge Region (Separate from residence)
  getDesiredChallengeRegion: async (): Promise<DesiredChallengeRegion> => {
    try {
      const raw = await AsyncStorage.getItem(DESIRED_REGION_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return { province: 'Gauteng', town: 'Johannesburg' };
  },
  setDesiredChallengeRegion: async (region: DesiredChallengeRegion): Promise<void> => {
    await AsyncStorage.setItem(DESIRED_REGION_KEY, JSON.stringify(region));
    await SessionSecurityService.recordAuditEvent(
      'CHALLENGE_REGION_UPDATED',
      `Target challenge region set to ${region.town}, ${region.province}`
    );
  },
};

export default PrivacyService;

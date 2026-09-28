import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const AUDIT_LOGS_KEY = '@morabaraba_audit_logs_v1';
const SESSION_ID_KEY = '@morabaraba_device_session_id_v1';

export interface DeviceSessionInfo {
  sessionId: string;
  deviceName: string;
  osVersion: string;
  appVersion: string;
  lastActive: string;
  isCurrentDevice: boolean;
}

export interface SecurityAuditEvent {
  id: string;
  timestamp: string;
  action:
    | 'PIN_CONFIGURED'
    | 'PIN_VERIFIED'
    | 'PIN_FAILED'
    | 'PIN_REMOVED'
    | 'BIOMETRIC_ENABLED'
    | 'BIOMETRIC_DISABLED'
    | 'TERMINAL_LOCKED'
    | 'TERMINAL_UNLOCKED'
    | 'CHALLENGE_REGION_UPDATED'
    | 'USER_TAG_UPDATED'
    | 'DATA_EXPORT_AES256'
    | 'DATA_EXPORT_JSON'
    | 'SESSIONS_REVOKED'
    | 'PRIVACY_MODE_TOGGLED'
    | 'COMPETITOR_BLOCKED'
    | 'COMPETITOR_UNBLOCKED';
  details: string;
}

export const SessionSecurityService = {
  /**
   * Retrieves or initializes a unique session ID for this hardware device.
   */
  getCurrentDeviceInfo: async (): Promise<DeviceSessionInfo> => {
    let sessionId = await AsyncStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substring(2, 12);
      await AsyncStorage.setItem(SESSION_ID_KEY, sessionId);
    }

    const deviceName =
      Platform.OS === 'android'
        ? 'Android Competitor Terminal'
        : Platform.OS === 'ios'
        ? 'iOS Apple Device'
        : 'Web Workstation';

    return {
      sessionId,
      deviceName,
      osVersion: `${Platform.OS.toUpperCase()} ${Platform.Version || '14.0'}`,
      appVersion: 'v1.0.4 (Southern African Arena)',
      lastActive: 'Active Now',
      isCurrentDevice: true,
    };
  },

  /**
   * Records a security audit event in local persistent storage.
   */
  recordAuditEvent: async (
    action: SecurityAuditEvent['action'],
    details: string
  ): Promise<void> => {
    try {
      const logs = await SessionSecurityService.getAuditLogs();
      const newEvent: SecurityAuditEvent = {
        id: 'audit_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
        timestamp: new Date().toISOString(),
        action,
        details,
      };
      const updated = [newEvent, ...logs].slice(0, 50); // Keep last 50 events
      await AsyncStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('[SessionSecurityService] Failed to record audit event:', e);
    }
  },

  /**
   * Fetches the local security audit trail.
   */
  getAuditLogs: async (): Promise<SecurityAuditEvent[]> => {
    try {
      const raw = await AsyncStorage.getItem(AUDIT_LOGS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
    return [];
  },

  /**
   * Clears the local security audit trail.
   */
  clearAuditLogs: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(AUDIT_LOGS_KEY);
    } catch {}
  },

  /**
   * Revokes all active sessions across devices via Supabase Auth.
   */
  revokeAllSessions: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      await supabase.auth.signOut({ scope: 'others' });
      await SessionSecurityService.recordAuditEvent(
        'SESSIONS_REVOKED',
        'Terminated all remote competitor hardware sessions'
      );
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to revoke remote sessions' };
    }
  },
};

export default SessionSecurityService;

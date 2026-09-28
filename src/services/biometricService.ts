import * as LocalAuthentication from 'expo-local-authentication';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  cancelled?: boolean;
}

export interface BiometricCapability {
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  biometricLabel: string;
}

export const BiometricService = {
  /**
   * Inspects device biometric hardware and enrollment status.
   */
  getCapability: async (): Promise<BiometricCapability> => {
    try {
      const [hasHardware, isEnrolled, supportedTypes] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        LocalAuthentication.supportedAuthenticationTypesAsync(),
      ]);

      let biometricLabel = 'Biometric';
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricLabel = 'Face ID';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricLabel = 'Fingerprint';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricLabel = 'Iris Scanner';
      }

      return {
        hasHardware,
        isEnrolled,
        supportedTypes,
        biometricLabel,
      };
    } catch (err: any) {
      console.warn('[BiometricService] getCapability error:', err);
      return {
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
        biometricLabel: 'Fingerprint',
      };
    }
  },

  /**
   * Fast check if biometric unlock is completely ready for use.
   */
  isBiometricReady: async (): Promise<boolean> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) return false;
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return isEnrolled;
    } catch {
      return false;
    }
  },

  /**
   * Prompts the user with native biometric dialog.
   * Disables OS device fallback so custom 4-digit PIN is preserved.
   */
  authenticate: async (options?: {
    promptMessage?: string;
    cancelLabel?: string;
    fallbackLabel?: string;
  }): Promise<BiometricAuthResult> => {
    try {
      const ready = await BiometricService.isBiometricReady();
      if (!ready) {
        return {
          success: false,
          error: 'Biometric hardware is not available or no fingerprint is enrolled.',
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: options?.promptMessage || 'Scan fingerprint to unlock Morabaraba Terminal',
        cancelLabel: options?.cancelLabel || 'Use PIN',
        fallbackLabel: options?.fallbackLabel || 'Use PIN',
        disableDeviceFallback: true, // Preserve application-level 4-digit PIN
      });

      if (result.success) {
        return { success: true };
      }

      const isCancelled =
        result.error === 'user_cancel' ||
        result.error === 'app_cancel' ||
        result.error === 'system_cancel' ||
        result.error === 'user_fallback';

      let errorMessage = 'Biometric scan failed';
      if (result.error === 'lockout') {
        errorMessage = 'Too many attempts. Biometrics temporarily locked.';
      } else if (result.error === 'not_enrolled') {
        errorMessage = 'No biometric credentials registered on device.';
      } else if (result.error === 'user_fallback') {
        errorMessage = 'PIN fallback requested';
      }

      return {
        success: false,
        cancelled: isCancelled,
        error: isCancelled ? undefined : errorMessage,
      };
    } catch (err: any) {
      console.warn('[BiometricService] authenticate error:', err);
      return {
        success: false,
        error: err?.message || 'Authentication error occurred',
      };
    }
  },
};

export default BiometricService;

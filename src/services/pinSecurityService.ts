import AsyncStorage from '@react-native-async-storage/async-storage';

export const PIN_HASH_KEY = '@morabaraba_security_pin_hash_v1';
export const PIN_SALT_KEY = '@morabaraba_security_pin_salt_v1';
export const PIN_ENABLED_KEY = '@morabaraba_security_pin_enabled_v1';
export const PIN_FAILED_ATTEMPTS_KEY = '@morabaraba_pin_failed_attempts_v1';
export const PIN_LOCKOUT_UNTIL_KEY = '@morabaraba_pin_lockout_until_v1';

/**
 * Standard pure TypeScript SHA-256 implementation (FIPS 180-4).
 * Fully self-contained, zero external dependency, 100% crash-safe across all React Native runtimes.
 */
export function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i = 0, j = 0;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: { [key: number]: boolean } = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = true;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return ''; // ASCII check
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words.push((asciiBitLength / maxWord) | 0);
  words.push(asciiBitLength);

  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];

      const s0 = i >= 16 ? rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3) : 0;
      const s1 = i >= 16 ? rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10) : 0;
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const s0_h = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const s1_h = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);

      const temp1 =
        i < 16
          ? (w[i] = w[i])
          : (w[i] = ((w[i - 16] + s0 + w[i - 7] + s1) | 0));

      const temp2 = (hash[7] + s1_h + ch + k[i] + temp1) | 0;
      const temp3 = (s0_h + maj) | 0;

      hash = [(temp2 + temp3) | 0, hash[0], hash[1], hash[2], (hash[3] + temp2) | 0, hash[4], hash[5], hash[6]];
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }

  return result;
}

export function generateCryptoSalt(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let salt = '';
  for (let i = 0; i < length; i++) {
    const r = Math.floor(Math.random() * chars.length);
    salt += chars.charAt(r);
  }
  return salt;
}

export interface PinVerificationResult {
  success: boolean;
  error?: string;
  isLockedOut?: boolean;
  remainingSeconds?: number;
  attemptsRemaining?: number;
}

export const PinSecurityService = {
  /**
   * Check if a 4-digit PIN is currently configured.
   */
  isPinConfigured: async (): Promise<boolean> => {
    try {
      const enabled = await AsyncStorage.getItem(PIN_ENABLED_KEY);
      const hash = await AsyncStorage.getItem(PIN_HASH_KEY);
      return enabled === 'true' && !!hash;
    } catch {
      return false;
    }
  },

  /**
   * Sets up a new 4-digit security PIN.
   */
  setPin: async (pin: string): Promise<boolean> => {
    if (!/^\d{4}$/.test(pin)) {
      throw new Error('PIN must be exactly 4 numeric digits');
    }
    try {
      const salt = generateCryptoSalt(32);
      const hash = sha256(`${pin}:${salt}`);
      await AsyncStorage.setItem(PIN_SALT_KEY, salt);
      await AsyncStorage.setItem(PIN_HASH_KEY, hash);
      await AsyncStorage.setItem(PIN_ENABLED_KEY, 'true');
      await AsyncStorage.removeItem(PIN_FAILED_ATTEMPTS_KEY);
      await AsyncStorage.removeItem(PIN_LOCKOUT_UNTIL_KEY);
      return true;
    } catch (e) {
      console.warn('[PinSecurityService] setPin error:', e);
      return false;
    }
  },

  /**
   * Verifies an entered PIN against the stored hash.
   */
  verifyPin: async (pin: string): Promise<PinVerificationResult> => {
    try {
      // 1. Check Lockout State
      const lockoutUntilStr = await AsyncStorage.getItem(PIN_LOCKOUT_UNTIL_KEY);
      if (lockoutUntilStr) {
        const lockoutUntil = Number(lockoutUntilStr);
        const now = Date.now();
        if (now < lockoutUntil) {
          const remainingSecs = Math.ceil((lockoutUntil - now) / 1000);
          return {
            success: false,
            isLockedOut: true,
            remainingSeconds: remainingSecs,
            error: `PIN entry is temporarily locked. Try again in ${remainingSecs} seconds.`,
          };
        } else {
          // Lockout expired
          await AsyncStorage.removeItem(PIN_LOCKOUT_UNTIL_KEY);
        }
      }

      // 2. Fetch Stored Hash & Salt
      const salt = await AsyncStorage.getItem(PIN_SALT_KEY);
      const storedHash = await AsyncStorage.getItem(PIN_HASH_KEY);

      if (!salt || !storedHash) {
        return { success: false, error: 'No PIN is configured on this device.' };
      }

      // 3. Compute Hash
      const computedHash = sha256(`${pin}:${salt}`);
      if (computedHash === storedHash) {
        // Success: Reset failed attempts
        await AsyncStorage.removeItem(PIN_FAILED_ATTEMPTS_KEY);
        await AsyncStorage.removeItem(PIN_LOCKOUT_UNTIL_KEY);
        return { success: true };
      }

      // 4. Handle Failed Attempt
      const attemptsStr = await AsyncStorage.getItem(PIN_FAILED_ATTEMPTS_KEY);
      const failedAttempts = (attemptsStr ? Number(attemptsStr) : 0) + 1;
      await AsyncStorage.setItem(PIN_FAILED_ATTEMPTS_KEY, String(failedAttempts));

      if (failedAttempts >= 10) {
        const lockoutUntil = Date.now() + 300 * 1000;
        await AsyncStorage.setItem(PIN_LOCKOUT_UNTIL_KEY, String(lockoutUntil));
        return {
          success: false,
          isLockedOut: true,
          remainingSeconds: 300,
          error: 'Maximum attempts exceeded. Passcode locked for 5 minutes.',
        };
      } else if (failedAttempts >= 5) {
        const lockoutUntil = Date.now() + 30 * 1000;
        await AsyncStorage.setItem(PIN_LOCKOUT_UNTIL_KEY, String(lockoutUntil));
        return {
          success: false,
          isLockedOut: true,
          remainingSeconds: 30,
          error: 'Passcode locked for 30 seconds.',
        };
      }

      const attemptsRemaining = 5 - (failedAttempts % 5);
      return {
        success: false,
        attemptsRemaining,
        error: `Incorrect PIN. ${attemptsRemaining} ${attemptsRemaining === 1 ? 'attempt' : 'attempts'} remaining before temporary lock.`,
      };
    } catch (e: any) {
      console.warn('[PinSecurityService] verifyPin error:', e);
      return { success: false, error: e?.message || 'Verification failed' };
    }
  },

  /**
   * Changes the 4-digit PIN after verifying the current PIN.
   */
  changePin: async (currentPin: string, newPin: string): Promise<{ success: boolean; error?: string }> => {
    const verify = await PinSecurityService.verifyPin(currentPin);
    if (!verify.success) {
      return { success: false, error: verify.error || 'Current PIN incorrect' };
    }
    const setSuccess = await PinSecurityService.setPin(newPin);
    if (setSuccess) {
      return { success: true };
    }
    return { success: false, error: 'Failed to update PIN in secure storage' };
  },

  /**
   * Completely removes the 4-digit PIN after verifying current PIN.
   */
  removePin: async (currentPin: string): Promise<{ success: boolean; error?: string }> => {
    const verify = await PinSecurityService.verifyPin(currentPin);
    if (!verify.success) {
      return { success: false, error: verify.error || 'Current PIN incorrect' };
    }
    try {
      await AsyncStorage.removeItem(PIN_HASH_KEY);
      await AsyncStorage.removeItem(PIN_SALT_KEY);
      await AsyncStorage.removeItem(PIN_ENABLED_KEY);
      await AsyncStorage.removeItem(PIN_FAILED_ATTEMPTS_KEY);
      await AsyncStorage.removeItem(PIN_LOCKOUT_UNTIL_KEY);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Failed to remove PIN' };
    }
  },
};

export default PinSecurityService;

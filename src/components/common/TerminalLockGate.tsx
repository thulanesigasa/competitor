import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  AppState,
  AppStateStatus,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, METRICS, SPACING } from '../../constants/theme';
import { Text } from '../Typography';
import {
  FingerprintSvg,
  LockSvg,
  BackspaceSvg,
  ShieldSvg,
} from './SvgIcons';
import { PinSecurityService } from '../../services/pinSecurityService';
import { PrivacyService } from '../../services/privacyService';
import { BiometricService } from '../../services/biometricService';
import { SessionSecurityService } from '../../services/sessionSecurityService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const TerminalLockGate: React.FC = () => {
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isPinConfigured, setIsPinConfigured] = useState<boolean>(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(false);
  const [isBiometricReady, setIsBiometricReady] = useState<boolean>(false);
  const [privacyShieldEnabled, setPrivacyShieldEnabled] = useState<boolean>(true);
  const [showPrivacyShield, setShowPrivacyShield] = useState<boolean>(false);

  // PIN Keypad State
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isLockedOut, setIsLockedOut] = useState<boolean>(false);
  const [lockoutRemainingSec, setLockoutRemainingSec] = useState<number>(0);

  // Inactivity tracking
  const lastBackgroundTime = useRef<number | null>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const lockoutIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAuthenticatingBiometricRef = useRef<boolean>(false);

  // Trigger shake animation on invalid PIN entry
  const triggerShake = useCallback((callback?: () => void) => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -12, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 12, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -4, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start(() => {
      if (callback) callback();
    });
  }, [shakeAnim]);

  // Biometric Unlock Prompt
  const promptBiometricUnlock = useCallback(async () => {
    if (isAuthenticatingBiometricRef.current) return;
    isAuthenticatingBiometricRef.current = true;

    try {
      const res = await BiometricService.authenticate({
        promptMessage: 'Scan fingerprint to unlock Morabaraba Terminal',
        cancelLabel: 'Use 4-Digit PIN',
        fallbackLabel: 'Use 4-Digit PIN',
      });

      if (res.success) {
        setPin('');
        setErrorMessage(null);
        setIsLocked(false);
        await SessionSecurityService.recordAuditEvent(
          'TERMINAL_UNLOCKED',
          'Unlocked via biometric fingerprint scan'
        );
      } else if (!res.cancelled && res.error) {
        setErrorMessage(res.error);
        triggerShake();
      }
    } catch (err: any) {
      console.warn('[TerminalLockGate] Biometric error:', err);
    } finally {
      isAuthenticatingBiometricRef.current = false;
    }
  }, [triggerShake]);

  // Initial Security Configuration Check
  const evaluateInitialLockState = useCallback(async () => {
    try {
      const [pinActive, bioActive, bioReady, shieldActive] = await Promise.all([
        PinSecurityService.isPinConfigured(),
        PrivacyService.getBiometricEnabled(),
        BiometricService.isBiometricReady(),
        PrivacyService.getPrivacyShieldEnabled(),
      ]);

      setIsPinConfigured(pinActive);
      setIsBiometricEnabled(bioActive);
      setIsBiometricReady(bioReady);
      setPrivacyShieldEnabled(shieldActive);

      const requiresLock = pinActive || (bioActive && bioReady);
      if (requiresLock) {
        setIsLocked(true);
        // Automatically prompt biometric if available
        if (bioActive && bioReady) {
          setTimeout(() => {
            promptBiometricUnlock();
          }, 350);
        }
      } else {
        setIsLocked(false);
      }
    } catch (e) {
      console.warn('[TerminalLockGate] Init evaluation failed:', e);
      setIsLocked(false);
    } finally {
      setIsInitializing(false);
    }
  }, [promptBiometricUnlock]);

  useEffect(() => {
    evaluateInitialLockState();
  }, [evaluateInitialLockState]);

  // Listen to AppState for Background Inactivity Auto-Lock
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'inactive' || nextAppState === 'background') {
        lastBackgroundTime.current = Date.now();
        if (privacyShieldEnabled) {
          setShowPrivacyShield(true);
        }
      } else if (nextAppState === 'active') {
        setShowPrivacyShield(false);

        // Re-read security configs in case user updated settings
        const [pinActive, bioActive, bioReady, timeoutSecs, shieldActive] = await Promise.all([
          PinSecurityService.isPinConfigured(),
          PrivacyService.getBiometricEnabled(),
          BiometricService.isBiometricReady(),
          PrivacyService.getLockTimeoutSeconds(),
          PrivacyService.getPrivacyShieldEnabled(),
        ]);

        setIsPinConfigured(pinActive);
        setIsBiometricEnabled(bioActive);
        setIsBiometricReady(bioReady);
        setPrivacyShieldEnabled(shieldActive);

        const lockEligible = pinActive || (bioActive && bioReady);
        if (!lockEligible) return;

        // If never auto-lock is selected, don't lock on background resume
        if (timeoutSecs === -1) return;

        if (lastBackgroundTime.current !== null) {
          const elapsedSecs = (Date.now() - lastBackgroundTime.current) / 1000;
          if (timeoutSecs === 0 || elapsedSecs >= timeoutSecs) {
            setIsLocked(true);
            setPin('');
            setErrorMessage(null);
            if (bioActive && bioReady) {
              setTimeout(() => {
                promptBiometricUnlock();
              }, 300);
            }
          }
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
      if (lockoutIntervalRef.current) {
        clearInterval(lockoutIntervalRef.current);
      }
    };
  }, [privacyShieldEnabled, promptBiometricUnlock]);

  // Handle Numeric Keypad Presses
  const handleDigitPress = (digit: string) => {
    if (isVerifying || isLockedOut) return;
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMessage(null);

      if (nextPin.length === 4) {
        verifyEnteredPin(nextPin);
      }
    }
  };

  // Handle Backspace
  const handleBackspace = () => {
    if (isVerifying || isLockedOut) return;
    if (pin.length > 0) {
      setPin((prev) => prev.slice(0, -1));
      setErrorMessage(null);
    }
  };

  // Verify PIN submission against PinSecurityService
  const verifyEnteredPin = async (candidatePin: string) => {
    setIsVerifying(true);
    try {
      const res = await PinSecurityService.verifyPin(candidatePin);

      if (res.success) {
        setPin('');
        setErrorMessage(null);
        setIsLocked(false);
        setIsLockedOut(false);
        await SessionSecurityService.recordAuditEvent(
          'TERMINAL_UNLOCKED',
          'Unlocked via 4-digit security PIN'
        );
      } else {
        if (res.isLockedOut && res.remainingSeconds) {
          setIsLockedOut(true);
          setLockoutRemainingSec(res.remainingSeconds);
          setErrorMessage(res.error || `Locked out for ${res.remainingSeconds}s`);
          startLockoutCountdown(res.remainingSeconds);
        } else {
          setErrorMessage(res.error || 'Incorrect security PIN');
        }

        triggerShake(() => {
          setPin('');
        });
      }
    } catch (e: any) {
      setErrorMessage(e?.message || 'Verification failed');
      triggerShake(() => setPin(''));
    } finally {
      setIsVerifying(false);
    }
  };

  // Lockout countdown timer
  const startLockoutCountdown = (initialSecs: number) => {
    if (lockoutIntervalRef.current) {
      clearInterval(lockoutIntervalRef.current);
    }

    let remaining = initialSecs;
    lockoutIntervalRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        if (lockoutIntervalRef.current) {
          clearInterval(lockoutIntervalRef.current);
          lockoutIntervalRef.current = null;
        }
        setIsLockedOut(false);
        setLockoutRemainingSec(0);
        setErrorMessage(null);
      } else {
        setLockoutRemainingSec(remaining);
        setErrorMessage(`Security lockout active. Retry in ${remaining}s`);
      }
    }, 1000);
  };

  // App Switcher Privacy Shield Backdrop (covers screen in background)
  if (showPrivacyShield && !isLocked) {
    return (
      <View style={[StyleSheet.absoluteFill, styles.privacyShieldOverlay]}>
        <View style={styles.brandShieldCard}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <Text variant="h3" weight="800" color={COLORS.textPrimary} style={styles.shieldTitle}>
            MORABARABA
          </Text>
          <View style={styles.shieldBadge}>
            <ShieldSvg size={14} color="#64748B" />
            <Text variant="caption" color={COLORS.textSecondary} style={styles.shieldSubtitle}>
              Protected by Terminal Privacy Shield
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Not locked or still initializing initial check
  if (!isLocked || isInitializing) {
    return null;
  }

  const hasBiometric = isBiometricEnabled && isBiometricReady;
  const hasPin = isPinConfigured;

  return (
    <View style={[StyleSheet.absoluteFill, styles.gateContainer]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        {/* Brand Emblem (Rule 15 & 19: 50x50 in 68x68 container) */}
        <View style={styles.headerBlock}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          <Text variant="label" weight="800" color={COLORS.accent} style={styles.brandTag}>
            SECURITY ENCLAVE
          </Text>
          <Text variant="h2" weight="900" color={COLORS.textPrimary} style={styles.lockTitle}>
            TERMINAL LOCKED
          </Text>
          <Text variant="caption" color={COLORS.textSecondary} style={styles.lockSubtitle}>
            {hasBiometric && hasPin
              ? 'Scan fingerprint or enter 4-digit PIN to access terminal'
              : hasBiometric
              ? 'Scan your fingerprint to unlock Morabaraba'
              : 'Enter your 4-digit security PIN to continue'}
          </Text>
        </View>

        {/* PIN Indicators (if PIN configured) */}
        {hasPin && (
          <Animated.View
            style={[
              styles.pinDotsRow,
              { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <View
                  key={index}
                  style={[
                    styles.pinDot,
                    isFilled && styles.pinDotFilled,
                    errorMessage ? styles.pinDotError : null,
                  ]}
                />
              );
            })}
          </Animated.View>
        )}

        {/* Status / Error Message */}
        <View style={styles.messageBox}>
          {errorMessage ? (
            <Text variant="caption" weight="600" color="#DC2626" style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : isLockedOut ? (
            <Text variant="caption" weight="700" color="#DC2626" style={styles.errorText}>
              {`Lockout active. Try again in ${lockoutRemainingSec}s`}
            </Text>
          ) : (
            <View style={styles.statusIndicator}>
              <LockSvg size={14} color="#64748B" />
              <Text variant="caption" color={COLORS.textSecondary} style={styles.statusText}>
                Encrypted terminal session
              </Text>
            </View>
          )}
        </View>

        {/* Biometric Quick Trigger Bar (Dual Option Prominence) */}
        {hasBiometric && (
          <TouchableOpacity
            style={styles.biometricTriggerButton}
            onPress={promptBiometricUnlock}
            activeOpacity={0.8}
            accessibilityLabel="Scan fingerprint to unlock"
            accessibilityRole="button"
          >
            <View style={styles.biometricIconBadge}>
              <FingerprintSvg size={22} color={COLORS.accent} />
            </View>
            <View style={styles.biometricTextGroup}>
              <Text variant="h3" weight="800" color={COLORS.textPrimary} style={styles.bioButtonTitle}>
                Scan Fingerprint
              </Text>
              <Text variant="caption" color={COLORS.textSecondary}>
                Tap to re-trigger biometric sensor
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Numeric Keypad (If PIN configured) */}
        {hasPin ? (
          <View style={styles.keypadGrid}>
            <View style={styles.keypadRow}>
              {['1', '2', '3'].map((digit) => (
                <TouchableOpacity
                  key={digit}
                  style={[styles.keypadKey, isLockedOut && styles.keypadKeyDisabled]}
                  onPress={() => handleDigitPress(digit)}
                  disabled={isLockedOut || isVerifying}
                  activeOpacity={0.7}
                  accessibilityLabel={`Key ${digit}`}
                >
                  <Text variant="h2" weight="700" color={COLORS.textPrimary}>
                    {digit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.keypadRow}>
              {['4', '5', '6'].map((digit) => (
                <TouchableOpacity
                  key={digit}
                  style={[styles.keypadKey, isLockedOut && styles.keypadKeyDisabled]}
                  onPress={() => handleDigitPress(digit)}
                  disabled={isLockedOut || isVerifying}
                  activeOpacity={0.7}
                  accessibilityLabel={`Key ${digit}`}
                >
                  <Text variant="h2" weight="700" color={COLORS.textPrimary}>
                    {digit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.keypadRow}>
              {['7', '8', '9'].map((digit) => (
                <TouchableOpacity
                  key={digit}
                  style={[styles.keypadKey, isLockedOut && styles.keypadKeyDisabled]}
                  onPress={() => handleDigitPress(digit)}
                  disabled={isLockedOut || isVerifying}
                  activeOpacity={0.7}
                  accessibilityLabel={`Key ${digit}`}
                >
                  <Text variant="h2" weight="700" color={COLORS.textPrimary}>
                    {digit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.keypadRow}>
              {/* Bottom Left: Fingerprint Trigger if supported, else empty */}
              {hasBiometric ? (
                <TouchableOpacity
                  style={[styles.keypadKey, styles.keypadAuxKey]}
                  onPress={promptBiometricUnlock}
                  activeOpacity={0.7}
                  accessibilityLabel="Trigger biometric scan"
                >
                  <FingerprintSvg size={24} color={COLORS.accent} />
                </TouchableOpacity>
              ) : (
                <View style={styles.keypadKeyEmpty} />
              )}

              {/* Bottom Center: 0 */}
              <TouchableOpacity
                style={[styles.keypadKey, isLockedOut && styles.keypadKeyDisabled]}
                onPress={() => handleDigitPress('0')}
                disabled={isLockedOut || isVerifying}
                activeOpacity={0.7}
                accessibilityLabel="Key 0"
              >
                <Text variant="h2" weight="700" color={COLORS.textPrimary}>
                  0
                </Text>
              </TouchableOpacity>

              {/* Bottom Right: Backspace */}
              <TouchableOpacity
                style={[styles.keypadKey, styles.keypadAuxKey]}
                onPress={handleBackspace}
                disabled={isLockedOut || isVerifying || pin.length === 0}
                activeOpacity={0.7}
                accessibilityLabel="Backspace"
              >
                <BackspaceSvg
                  size={22}
                  color={pin.length > 0 ? COLORS.textPrimary : '#CBD5E1'}
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Biometric-only fallback view if user enabled biometrics without PIN */
          <View style={styles.biometricOnlyContainer}>
            <View style={styles.biometricLargeCircle}>
              <FingerprintSvg size={54} color={COLORS.accent} />
            </View>
            <TouchableOpacity
              style={styles.biometricPrimaryScanButton}
              onPress={promptBiometricUnlock}
              activeOpacity={0.8}
            >
              <Text variant="body" weight="700" color="#FFFFFF">
                Scan Fingerprint
              </Text>
            </TouchableOpacity>
            <Text variant="caption" color={COLORS.textMuted} style={styles.biometricHint}>
              Passcode backup can be configured in Safety & Security
            </Text>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  gateContainer: {
    backgroundColor: '#FFFFFF', // 60% Dominant Background
    zIndex: 99999,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  privacyShieldOverlay: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999999,
  },
  brandShieldCard: {
    alignItems: 'center',
  },
  shieldTitle: {
    letterSpacing: 2,
    marginTop: 12,
  },
  shieldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  shieldSubtitle: {
    fontSize: 12,
  },
  headerBlock: {
    alignItems: 'center',
    marginTop: 12,
  },
  logoContainer: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: '#F8FAFC', // 30% Surface Panel
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  logoImage: {
    width: METRICS.brandLogoModal, // 50x50 per Rule 15 & 19
    height: METRICS.brandLogoModal,
    borderRadius: 12,
  },
  brandTag: {
    letterSpacing: 1.5,
    marginBottom: 4,
    fontSize: 11,
  },
  lockTitle: {
    letterSpacing: 1,
    fontSize: 20,
    marginBottom: 6,
  },
  lockSubtitle: {
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  pinDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
    marginVertical: 16,
  },
  pinDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: COLORS.textPrimary,
    borderColor: COLORS.textPrimary,
  },
  pinDotError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEE2E2',
  },
  messageBox: {
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 12,
  },
  biometricTriggerButton: {
    width: Math.min(SCREEN_WIDTH - 48, 340),
    backgroundColor: '#F8FAFC', // 30% Surface
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  biometricIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(229, 169, 60, 0.12)', // 10% Accent Tint
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  biometricTextGroup: {
    flex: 1,
  },
  bioButtonTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  keypadGrid: {
    width: Math.min(SCREEN_WIDTH - 48, 320),
    marginBottom: 16,
    gap: 12,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  keypadKey: {
    width: 76,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#F8FAFC', // 30% Surface
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  keypadKeyDisabled: {
    opacity: 0.4,
  },
  keypadAuxKey: {
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  keypadKeyEmpty: {
    width: 76,
    height: 60,
  },
  biometricOnlyContainer: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 48,
  },
  biometricLargeCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(229, 169, 60, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.3)',
  },
  biometricPrimaryScanButton: {
    width: 220,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  biometricHint: {
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 18,
  },
});

export default TerminalLockGate;

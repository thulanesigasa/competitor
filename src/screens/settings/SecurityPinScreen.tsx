import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Text } from '../../components/Typography';
import { Header } from '../../components/common/Header';
import { BackspaceSvg, CheckCircleSvg, LockSvg } from '../../components/common/SvgIcons';
import { PinSecurityService } from '../../services/pinSecurityService';
import { SessionSecurityService } from '../../services/sessionSecurityService';
import { useThemedAlert } from '../../components/common/ThemedAlert';

type PinFlow = 'idle' | 'setup' | 'change' | 'remove';

export const SecurityPinScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [isPinSet, setIsPinSet] = useState<boolean>(false);
  const [flow, setFlow] = useState<PinFlow>('idle');
  const [step, setStep] = useState<number>(1);
  const [pin, setPin] = useState<string>('');
  const [firstPin, setFirstPin] = useState<string>('');
  const [currentPinAttempt, setCurrentPinAttempt] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const { showAlert } = useThemedAlert();
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkPinStatus();
  }, []);

  const checkPinStatus = async () => {
    const configured = await PinSecurityService.isPinConfigured();
    setIsPinSet(configured);
  };

  const triggerShake = (callback?: () => void) => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -4, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  const handleStartFlow = (mode: PinFlow) => {
    setFlow(mode);
    setStep(1);
    setPin('');
    setFirstPin('');
    setCurrentPinAttempt('');
    setErrorMessage(null);
    setIsProcessing(false);
  };

  const handleCancelFlow = () => {
    setFlow('idle');
    setStep(1);
    setPin('');
    setFirstPin('');
    setCurrentPinAttempt('');
    setErrorMessage(null);
    setIsProcessing(false);
  };

  const handleKeyPress = (digit: string) => {
    if (isProcessing) return;
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setErrorMessage(null);

      if (nextPin.length === 4) {
        handlePinSubmitted(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    if (isProcessing) return;
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setErrorMessage(null);
    }
  };

  const handlePinSubmitted = async (completedPin: string) => {
    setIsProcessing(true);

    if (flow === 'setup') {
      if (step === 1) {
        // Validation: No trivial 4 identical digits (e.g. 0000, 1111)
        if (/^(\d)\1{3}$/.test(completedPin)) {
          setErrorMessage('PIN cannot be 4 identical digits (e.g. 0000, 1111)');
          triggerShake(() => {
            setPin('');
            setIsProcessing(false);
          });
          return;
        }

        setFirstPin(completedPin);
        setPin('');
        setStep(2);
        setIsProcessing(false);
      } else {
        if (completedPin === firstPin) {
          const success = await PinSecurityService.setPin(completedPin);
          if (success) {
            await SessionSecurityService.recordAuditEvent(
              'PIN_CONFIGURED',
              'Created 4-digit security PIN'
            );
            await checkPinStatus();
            setIsProcessing(false);
            setFlow('idle');
            showAlert({
              title: 'PIN Configured',
              message: 'Your 4-digit security PIN is now active and protected with salted SHA-256.',
            });
          } else {
            setErrorMessage('Failed to configure PIN. Try again.');
            triggerShake(() => {
              setPin('');
              setIsProcessing(false);
            });
          }
        } else {
          setErrorMessage('PINs do not match. Please try again.');
          triggerShake(() => {
            setPin('');
            setIsProcessing(false);
          });
        }
      }
    } else if (flow === 'change') {
      if (step === 1) {
        // Verify current PIN
        const res = await PinSecurityService.verifyPin(completedPin);
        if (res.success) {
          setCurrentPinAttempt(completedPin);
          setPin('');
          setStep(2);
          setIsProcessing(false);
        } else {
          setErrorMessage(res.error || 'Incorrect current PIN.');
          triggerShake(() => {
            setPin('');
            setIsProcessing(false);
          });
        }
      } else if (step === 2) {
        // Enter new PIN (no trivial 4 identical digits)
        if (/^(\d)\1{3}$/.test(completedPin)) {
          setErrorMessage('PIN cannot be 4 identical digits (e.g. 0000, 1111)');
          triggerShake(() => {
            setPin('');
            setIsProcessing(false);
          });
          return;
        }
        setFirstPin(completedPin);
        setPin('');
        setStep(3);
        setIsProcessing(false);
      } else {
        // Confirm new PIN
        if (completedPin === firstPin) {
          const res = await PinSecurityService.changePin(currentPinAttempt, completedPin);
          if (res.success) {
            await SessionSecurityService.recordAuditEvent(
              'PIN_CONFIGURED',
              'Updated 4-digit security PIN'
            );
            await checkPinStatus();
            setIsProcessing(false);
            setFlow('idle');
            showAlert({
              title: 'PIN Updated',
              message: 'Your new security PIN has been successfully saved.',
            });
          } else {
            setErrorMessage(res.error || 'Failed to update PIN.');
            triggerShake(() => {
              setPin('');
              setIsProcessing(false);
            });
          }
        } else {
          setErrorMessage('New PINs do not match.');
          triggerShake(() => {
            setPin('');
            setIsProcessing(false);
          });
        }
      }
    } else if (flow === 'remove') {
      const res = await PinSecurityService.removePin(completedPin);
      if (res.success) {
        await SessionSecurityService.recordAuditEvent(
          'PIN_REMOVED',
          'Removed 4-digit security PIN'
        );
        await checkPinStatus();
        setIsProcessing(false);
        setFlow('idle');
        showAlert({
          title: 'PIN Removed',
          message: 'Security PIN has been removed from this device.',
        });
      } else {
        setErrorMessage(res.error || 'Incorrect PIN.');
        triggerShake(() => {
          setPin('');
          setIsProcessing(false);
        });
      }
    }
  };

  const getFlowTitle = () => {
    if (flow === 'setup') {
      return step === 1 ? 'Enter 4-Digit Security PIN' : 'Confirm Security PIN';
    }
    if (flow === 'change') {
      if (step === 1) return 'Enter Current PIN';
      if (step === 2) return 'Enter New 4-Digit PIN';
      return 'Confirm New PIN';
    }
    if (flow === 'remove') {
      return 'Enter Current PIN to Remove';
    }
    return '4-Digit Security PIN';
  };

  const getFlowSubtitle = () => {
    if (flow === 'setup') {
      return step === 1
        ? 'Choose a 4-digit PIN to safeguard your competitor profile.'
        : 'Re-enter your 4-digit PIN to ensure accuracy.';
    }
    if (flow === 'change') {
      if (step === 1) return 'Verify your current PIN before setting a new passcode.';
      if (step === 2) return 'Select a new 4-digit PIN.';
      return 'Confirm your new 4-digit PIN.';
    }
    if (flow === 'remove') {
      return 'Passcode verification is required to deactivate PIN protection.';
    }
    return 'Protect your career records and online sessions with a hardware-hashed passcode.';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <Header
        title="SECURITY PIN"
        showBack
        onBack={() => {
          if (flow !== 'idle') {
            handleCancelFlow();
          } else {
            navigation.goBack();
          }
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {flow === 'idle' ? (
          <View style={styles.idleContainer}>
            <View style={styles.statusBox}>
              <View style={styles.iconCircle}>
                <LockSvg size={28} color={isPinSet ? '#D97706' : '#64748B'} strokeWidth={2} />
              </View>
              <Text variant="h2" weight="800" color="#0F172A" style={styles.statusTitle}>
                {isPinSet ? 'PIN Protection Active' : 'No PIN Configured'}
              </Text>
              <Text variant="body" color={colors.textSecondary} style={styles.statusDesc}>
                {isPinSet
                  ? 'Your terminal is fortified with a 4-digit PIN hashed using salted SHA-256.'
                  : 'Add a 4-digit passcode for quick, secure authentication without typing your password.'}
              </Text>
            </View>

            <View style={styles.actionsBox}>
              {!isPinSet ? (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => handleStartFlow('setup')}
                  activeOpacity={0.8}
                >
                  <Text variant="body" weight="700" color="#FFFFFF">
                    Configure 4-Digit PIN
                  </Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => handleStartFlow('change')}
                    activeOpacity={0.8}
                  >
                    <Text variant="body" weight="700" color="#FFFFFF">
                      Change Security PIN
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => handleStartFlow('remove')}
                    activeOpacity={0.8}
                  >
                    <Text variant="body" weight="700" color="#0F172A">
                      Remove PIN Protection
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <View style={styles.enclaveDetails}>
              <Text variant="label" weight="800" color={colors.textTertiary} style={styles.specHeader}>
                CRYPTOGRAPHIC ENCLAVE SPECS
              </Text>
              <View style={styles.specRow}>
                <Text variant="caption" color={colors.textSecondary}>Hash Standard</Text>
                <Text variant="caption" weight="700" color="#0F172A">SHA-256 (FIPS 180-4)</Text>
              </View>
              <View style={styles.specRow}>
                <Text variant="caption" color={colors.textSecondary}>Salt Length</Text>
                <Text variant="caption" weight="700" color="#0F172A">256-bit Pseudo-Random</Text>
              </View>
              <View style={styles.specRow}>
                <Text variant="caption" color={colors.textSecondary}>Lockout Policy</Text>
                <Text variant="caption" weight="700" color="#0F172A">5 fails = 30s • 10 fails = 5m</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.pinEntryContainer}>
            <Text variant="h2" weight="800" color="#0F172A" style={styles.entryTitle}>
              {getFlowTitle()}
            </Text>
            <Text variant="body" color={colors.textSecondary} style={styles.entrySubtitle}>
              {getFlowSubtitle()}
            </Text>

            {/* PIN Dots */}
            <Animated.View
              style={[
                styles.dotsRow,
                { transform: [{ translateX: shakeAnim }] },
              ]}
            >
              {[0, 1, 2, 3].map((idx) => {
                const filled = pin.length > idx;
                return (
                  <View
                    key={idx}
                    style={[
                      styles.dot,
                      filled && styles.dotFilled,
                    ]}
                  />
                );
              })}
            </Animated.View>

            {errorMessage ? (
              <Text variant="caption" weight="600" color="#DC2626" style={styles.errorText}>
                {errorMessage}
              </Text>
            ) : null}

            {/* Numeric Keypad */}
            <View style={styles.keypad}>
              {[
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['', '0', 'back'],
              ].map((row, rIdx) => (
                <View key={rIdx} style={styles.keypadRow}>
                  {row.map((item, cIdx) => {
                    if (item === '') {
                      return <View key={cIdx} style={styles.keypadKeyEmpty} />;
                    }
                    if (item === 'back') {
                      return (
                        <TouchableOpacity
                          key={cIdx}
                          style={styles.keypadKey}
                          onPress={handleBackspace}
                          activeOpacity={0.7}
                        >
                          <BackspaceSvg size={22} color="#0F172A" strokeWidth={2} />
                        </TouchableOpacity>
                      );
                    }
                    return (
                      <TouchableOpacity
                        key={cIdx}
                        style={styles.keypadKey}
                        onPress={() => handleKeyPress(item)}
                        activeOpacity={0.7}
                      >
                        <Text variant="h2" weight="700" color="#0F172A">
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.cancelLink}
              onPress={handleCancelFlow}
              activeOpacity={0.7}
            >
              <Text variant="caption" weight="700" color={colors.textSecondary}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
  },
  idleContainer: {
    paddingTop: 16,
  },
  statusBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 22,
    marginBottom: 8,
  },
  statusDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  actionsBox: {
    gap: 12,
    marginVertical: 24,
  },
  primaryBtn: {
    height: 52,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtn: {
    height: 52,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enclaveDetails: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 23, 42, 0.06)',
  },
  specHeader: {
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 12,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  pinEntryContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  entryTitle: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  entrySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 20,
    marginVertical: 20,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    borderColor: '#D97706',
    backgroundColor: '#D97706',
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  keypad: {
    width: '100%',
    maxWidth: 280,
    marginTop: 24,
    gap: 12,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keypadKey: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadKeyEmpty: {
    width: 72,
    height: 72,
  },
  cancelLink: {
    marginTop: 24,
    padding: 12,
  },
});

export default SecurityPinScreen;

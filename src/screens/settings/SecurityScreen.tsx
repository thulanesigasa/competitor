import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Text } from '../../components/Typography';
import { Header } from '../../components/common/Header';
import { UiverseSwitch } from '../../components/common/UiverseSwitch';
import { ChevronRightSvg } from '../../components/common/SvgIcons';
import { PrivacyService, LOCK_TIMEOUT_OPTIONS } from '../../services/privacyService';
import { PinSecurityService } from '../../services/pinSecurityService';
import { useThemedAlert } from '../../components/common/ThemedAlert';

export const SecurityScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [isPinSet, setIsPinSet] = useState<boolean>(false);
  const [lockTimeoutSeconds, setLockTimeoutSeconds] = useState<number>(300);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const [privacyShieldEnabled, setPrivacyShieldEnabled] = useState<boolean>(true);
  const { showAlert } = useThemedAlert();

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    const [pinConfigured, timeout, bio, shield] = await Promise.all([
      PinSecurityService.isPinConfigured(),
      PrivacyService.getLockTimeoutSeconds(),
      PrivacyService.getBiometricEnabled(),
      PrivacyService.getPrivacyShieldEnabled(),
    ]);
    setIsPinSet(pinConfigured);
    setLockTimeoutSeconds(timeout);
    setBiometricEnabled(bio);
    setPrivacyShieldEnabled(shield);
  };

  const currentTimeout =
    LOCK_TIMEOUT_OPTIONS.find((o) => o.seconds === lockTimeoutSeconds) ||
    LOCK_TIMEOUT_OPTIONS[2];

  const handleToggleBiometric = async (val: boolean) => {
    setBiometricEnabled(val);
    await PrivacyService.setBiometricEnabled(val);
  };

  const handleTogglePrivacyShield = async (val: boolean) => {
    setPrivacyShieldEnabled(val);
    await PrivacyService.setPrivacyShieldEnabled(val);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <Header
        title="SAFETY & SECURITY"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.headerBlock}>
          <Text variant="h2" weight="800" color={colors.textPrimary} style={styles.title}>
            Terminal Security
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Configure hardware security barriers, fallback 4-digit PIN verification, and automatic inactivity lockouts.
          </Text>
        </View>

        {/* Access Controls */}
        <View style={styles.sectionBlock}>
          <Text variant="label" weight="800" color={colors.textTertiary} style={styles.sectionHeader}>
            ACCESS CONTROLS
          </Text>

          {/* 1. Inactivity Lock */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('InactivityLock')}
            activeOpacity={0.75}
            accessibilityRole="button"
          >
            <View style={styles.rowTitleBox}>
              <Text variant="h3" style={styles.rowTitle}>
                Inactivity Lock
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.rowDescription}>
                {`Locks automatically after ${currentTimeout.label.toLowerCase()} • Tap to change`}
              </Text>
            </View>
            <ChevronRightSvg size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* 2. 4-Digit Security PIN */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('SecurityPin')}
            activeOpacity={0.75}
            accessibilityRole="button"
          >
            <View style={styles.rowTitleBox}>
              <Text variant="h3" style={styles.rowTitle}>
                4-Digit Security PIN
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.rowDescription}>
                {isPinSet
                  ? 'PIN active • Tap to change, remove, or inspect hardware hash'
                  : 'Passcode backup for opening Morabaraba terminal securely'}
              </Text>
            </View>
            <ChevronRightSvg size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* 3. Fingerprint / Biometric Unlock */}
          <View style={styles.actionRow}>
            <View style={styles.rowTitleBox}>
              <Text variant="h3" style={styles.rowTitle}>
                Fingerprint Unlock
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.rowDescription}>
                Require biometric fingerprint scan whenever the competitor terminal awakens
              </Text>
            </View>
            <UiverseSwitch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              accessibilityLabel="Toggle fingerprint unlock"
            />
          </View>

          <View style={styles.rowDivider} />

          {/* 4. App Switcher Privacy Shield */}
          <View style={styles.actionRow}>
            <View style={styles.rowTitleBox}>
              <Text variant="h3" style={styles.rowTitle}>
                App Switcher Privacy Shield
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.rowDescription}>
                Obfuscates board and gamer data when switching apps or minimizing to background
              </Text>
            </View>
            <UiverseSwitch
              value={privacyShieldEnabled}
              onValueChange={handleTogglePrivacyShield}
              accessibilityLabel="Toggle app switcher privacy shield"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
  },
  headerBlock: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionBlock: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowTitleBox: {
    flex: 1,
    paddingRight: 16,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  rowDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
    marginVertical: 4,
  },
});

export default SecurityScreen;

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
import { CheckCircleSvg } from '../../components/common/SvgIcons';
import { PrivacyService, LOCK_TIMEOUT_OPTIONS, LockTimeoutOption } from '../../services/privacyService';

export const InactivityLockScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [currentSeconds, setCurrentSeconds] = useState<number>(300);

  useEffect(() => {
    PrivacyService.getLockTimeoutSeconds().then(setCurrentSeconds);
  }, []);

  const handleSelectOption = async (option: LockTimeoutOption) => {
    setCurrentSeconds(option.seconds);
    await PrivacyService.setLockTimeoutSeconds(option.seconds);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <Header
        title="INACTIVITY LOCK"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text variant="h2" weight="800" color={colors.textPrimary} style={styles.title}>
            Inactivity Auto-Lock
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Select how quickly Morabaraba locks after being minimized or left unattended. Once locked, your 4-digit PIN or fingerprint is required to resume.
          </Text>
        </View>

        <View style={styles.sectionBlock}>
          <Text variant="label" weight="800" color={colors.textTertiary} style={styles.sectionHeader}>
            TIMEOUT DURATION
          </Text>

          {LOCK_TIMEOUT_OPTIONS.map((option, index) => {
            const isSelected = currentSeconds === option.seconds;
            return (
              <React.Fragment key={option.seconds}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={[
                    styles.optionRow,
                    isSelected && styles.optionRowActive,
                  ]}
                  onPress={() => handleSelectOption(option)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                >
                  <View style={styles.optionContent}>
                    <Text
                      variant="h3"
                      style={[
                        styles.optionTitle,
                        isSelected && styles.optionTitleActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text variant="caption" color={colors.textSecondary} style={styles.optionDescription}>
                      {option.description}
                    </Text>
                  </View>
                  <View style={styles.indicatorContainer}>
                    {isSelected ? (
                      <CheckCircleSvg size={20} color="#0F172A" strokeWidth={2.5} />
                    ) : (
                      <View style={styles.unselectedRadio} />
                    )}
                  </View>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>

        <View style={styles.footerNote}>
          <Text variant="caption" color={colors.textTertiary} style={styles.footerText}>
            Enforced by hardware-backed SHA-256 Android Keystore & local enclave
          </Text>
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
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  optionRowActive: {
    opacity: 1,
  },
  optionContent: {
    flex: 1,
    paddingRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  optionTitleActive: {
    color: '#0F172A',
  },
  optionDescription: {
    fontSize: 13,
  },
  indicatorContainer: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
  },
  footerNote: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 23, 42, 0.06)',
  },
  footerText: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
});

export default InactivityLockScreen;

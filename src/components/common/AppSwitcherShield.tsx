import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  AppState,
  AppStateStatus,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../Typography';
import { ShieldSvg } from './SvgIcons';
import { colors } from '../../theme/colors';
import { PrivacyService } from '../../services/privacyService';

export const AppSwitcherShield: React.FC = () => {
  const [isMasked, setIsMasked] = useState<boolean>(false);
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    // Check initial preference
    PrivacyService.getPrivacyShieldEnabled().then(setEnabled);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      PrivacyService.getPrivacyShieldEnabled().then((isEnabled) => {
        if (!isEnabled) {
          setIsMasked(false);
          return;
        }
        if (nextAppState === 'inactive' || nextAppState === 'background') {
          setIsMasked(true);
        } else if (nextAppState === 'active') {
          setIsMasked(false);
        }
      });
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, []);

  if (!isMasked || !enabled) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.content}>
        {/* Brand Container per Rule 15 / 19 */}
        <View style={styles.logoOuter}>
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text variant="h2" weight="800" color="#0F172A" style={styles.title}>
          Morabaraba
        </Text>

        <Text variant="caption" color="#64748B" style={styles.subtitle}>
          Southern African Strategic Arena
        </Text>

        <View style={styles.badgeRow}>
          <ShieldSvg size={14} color="#D97706" strokeWidth={2.5} />
          <Text variant="caption" weight="700" color="#D97706" style={styles.shieldText}>
            PRIVACY SHIELD ACTIVE
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF', // 60% Dominant Canvas
    zIndex: 999999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoOuter: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  title: {
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    letterSpacing: 0.2,
    marginBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(229, 169, 60, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.25)',
  },
  shieldText: {
    fontSize: 10,
    letterSpacing: 0.8,
  },
});

export default AppSwitcherShield;

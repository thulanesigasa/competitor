import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  AppState,
  AppStateStatus,
} from 'react-native';
import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, METRICS, SPACING } from '../../constants/theme';

const SNOOZE_KEY = '@morabaraba_update_snooze_time';
const SNOOZE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export const UpdateModal: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Check update on startup
    checkForUpdate();

    // Check update on foreground resume
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkForUpdate();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const checkForUpdate = async () => {
    if (__DEV__) return; // Skip in local development

    try {
      // Check snooze timestamp
      const snoozeTimeStr = await AsyncStorage.getItem(SNOOZE_KEY);
      if (snoozeTimeStr) {
        const snoozeTime = parseInt(snoozeTimeStr, 10);
        if (Date.now() - snoozeTime < SNOOZE_DURATION_MS) {
          return; // Still snoozed
        }
      }

      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        setModalVisible(true);
      }
    } catch {
      // Silent catch for network drops
    }
  };

  const handleUpdateNow = async () => {
    setIsUpdating(true);
    try {
      await Updates.reloadAsync();
    } catch {
      setIsUpdating(false);
      setModalVisible(false);
    }
  };

  const handleRemindMeLater = async () => {
    try {
      await AsyncStorage.setItem(SNOOZE_KEY, Date.now().toString());
    } catch {
      // Ignore storage error
    }
    setModalVisible(false);
  };

  if (!modalVisible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={modalVisible}
      onRequestClose={handleRemindMeLater}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* 50x50 brand logo inside 68x68 container per Rule 15 & 19 */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.title}>UPDATE AVAILABLE</Text>
          <Text style={styles.description}>
            A new version of Morabaraba is ready with enhanced board responsiveness and regional ranking updates.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.updateButton}
              activeOpacity={0.8}
              onPress={handleUpdateNow}
              disabled={isUpdating}
            >
              <Text style={styles.updateButtonText}>
                {isUpdating ? 'Reloading...' : 'Update Now'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.snoozeButton}
              activeOpacity={0.8}
              onPress={handleRemindMeLater}
              disabled={isUpdating}
            >
              <Text style={styles.snoozeButtonText}>Remind Me Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  container: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoContainer: {
    width: 68,
    height: 68,
    borderRadius: 0,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoImage: {
    width: METRICS.brandLogoModal,
    height: METRICS.brandLogoModal,
    borderRadius: 0,
  },
  title: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  description: {
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  actions: {
    width: '100%',
    gap: SPACING.xs,
  },
  updateButton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  snoozeButton: {
    width: '100%',
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  snoozeButtonText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
});

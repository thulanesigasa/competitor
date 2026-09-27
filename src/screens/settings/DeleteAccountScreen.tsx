import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Text } from '../../components/Typography';
import { Header } from '../../components/common/Header';
import { CheckSvg } from '../../components/common/SvgIcons';
import { useThemedAlert } from '../../components/common/ThemedAlert';
import { authService } from '../../services/authService';
import { clearUserProfile } from '../../store/gameStore';
import { supabase } from '../../lib/supabase';

export const DeleteAccountScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [confirmedCheck, setConfirmedCheck] = useState<boolean>(false);
  const [confirmInput, setConfirmInput] = useState<string>('');
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const { showAlert } = useThemedAlert();

  const isConfirmed = confirmedCheck && confirmInput.trim().toUpperCase() === 'DELETE';

  const handleExecuteDelete = () => {
    if (!isConfirmed) {
      showAlert({
        title: 'Confirmation Required',
        message: 'Please check the acknowledgement box and type DELETE into the text field.',
      });
      return;
    }

    showAlert({
      title: 'Permanent Data Erasure',
      message: 'This will irreversibly delete your competitor profile, career statistics, match logs, and ranking history.\n\nAre you absolutely certain?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: async () => {
            setIsPurging(true);
            try {
              const currentProfile = await authService.getCurrentProfile();
              if (currentProfile?.id) {
                // Delete user records in Supabase
                await supabase.from('career_stats').delete().eq('user_id', currentProfile.id);
                await supabase.from('profiles').delete().eq('id', currentProfile.id);
              }
              await authService.signOut();
              await clearUserProfile();

              showAlert({
                title: 'Account Erased',
                message: 'Your account and competitor data have been completely purged.',
              });

              navigation.reset({
                index: 0,
                routes: [{ name: 'Onboarding' }],
              });
            } catch (e: any) {
              showAlert({
                title: 'Notice',
                message: e?.message || 'Failed to complete data purge.',
              });
            } finally {
              setIsPurging(false);
            }
          },
        },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <Header
        title="DELETE ACCOUNT & PURGE"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introHeader}>
          <Text variant="h2" weight="800" color={colors.textPrimary} style={styles.mainTitle}>
            Permanent Data Purge
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.leadParagraph}>
            In compliance with POPIA (Protection of Personal Information Act) and GDPR (Article 17: Right to Erasure), you may permanently purge your account and all associated competitor data.
          </Text>
        </View>

        <View style={styles.bodySection}>
          <Text variant="label" weight="800" color={colors.textTertiary} style={styles.sectionHeader}>
            WHAT WILL BE PERMANENTLY ERASED
          </Text>

          <View style={styles.eraseItem}>
            <Text variant="caption" weight="700" color={colors.textPrimary} style={styles.eraseTitle}>
              Cloud Profile & Identity
            </Text>
            <Text variant="caption" color={colors.textSecondary}>
              Your gamer tag, full name, cellphone, date of birth, and regional location.
            </Text>
          </View>

          <View style={styles.eraseItem}>
            <Text variant="caption" weight="700" color={colors.textPrimary} style={styles.eraseTitle}>
              Career Statistics & Leaderboard Rank
            </Text>
            <Text variant="caption" color={colors.textSecondary}>
              Victories, matches played, win rate %, mills formed, win streak, and cultural tier.
            </Text>
          </View>

          <View style={styles.eraseItem}>
            <Text variant="caption" weight="700" color={colors.textPrimary} style={styles.eraseTitle}>
              Device Security Enclave & Keys
            </Text>
            <Text variant="caption" color={colors.textSecondary}>
              Local 4-digit security PIN hashes, master AES-256 keys, and session audit history.
            </Text>
          </View>
        </View>

        {/* Confirmation Form */}
        <View style={styles.confirmSection}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setConfirmedCheck(!confirmedCheck)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkboxBox, confirmedCheck && styles.checkboxActive]}>
              {confirmedCheck && <CheckSvg size={14} color="#FFFFFF" strokeWidth={2.5} />}
            </View>
            <Text variant="caption" color={colors.textSecondary} style={styles.checkboxLabel}>
              I understand that this action is irreversible and all my career records will be destroyed immediately.
            </Text>
          </TouchableOpacity>

          <View style={styles.typeConfirmBox}>
            <Text variant="caption" weight="700" color={colors.textPrimary} style={{ marginBottom: 6 }}>
              Type DELETE to confirm:
            </Text>
            <TextInput
              style={styles.deleteInput}
              value={confirmInput}
              onChangeText={setConfirmInput}
              placeholder="DELETE"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[styles.deleteButton, !isConfirmed && styles.deleteButtonDisabled]}
            onPress={handleExecuteDelete}
            disabled={!isConfirmed || isPurging}
            activeOpacity={0.8}
          >
            {isPurging ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text variant="body" weight="700" color="#FFFFFF">
                Permanently Delete My Account
              </Text>
            )}
          </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
  },
  introHeader: {
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 24,
    marginBottom: 6,
  },
  leadParagraph: {
    fontSize: 14,
    lineHeight: 20,
  },
  bodySection: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 16,
  },
  eraseItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.06)',
  },
  eraseTitle: {
    fontSize: 14,
    marginBottom: 2,
  },
  confirmSection: {
    marginTop: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  typeConfirmBox: {
    marginBottom: 24,
  },
  deleteInput: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 1,
  },
  deleteButton: {
    height: 52,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.4,
  },
});

export default DeleteAccountScreen;

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Text } from '../../components/Typography';
import { Header } from '../../components/common/Header';
import { DownloadSvg, LockSvg, FileTextSvg } from '../../components/common/SvgIcons';
import { useThemedAlert } from '../../components/common/ThemedAlert';
import { getUserProfile, getCareerStats } from '../../store/gameStore';
import { EncryptionService } from '../../services/encryptionService';
import { SessionSecurityService } from '../../services/sessionSecurityService';

export const ExportDataScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const { showAlert } = useThemedAlert();

  const handleExport = async (encrypted: boolean) => {
    setIsExporting(true);
    try {
      const profile = await getUserProfile();
      const stats = await getCareerStats();
      const session = await SessionSecurityService.getCurrentDeviceInfo();

      const exportBundle = {
        app: 'Morabaraba Competitor Arena',
        version: '1.0.3',
        exportDate: new Date().toISOString(),
        profile: {
          id: profile?.id,
          gamerTag: profile?.gamerTag,
          name: profile?.name,
          surname: profile?.surname,
          email: profile?.email,
          cellphone: profile?.cellphone,
          dob: profile?.dob,
          country: profile?.country,
          province: profile?.province,
          town: profile?.town,
        },
        careerStats: stats,
        deviceMetadata: {
          deviceName: session.deviceName,
          osVersion: session.osVersion,
        },
      };

      let outputContent: string;
      if (encrypted) {
        outputContent = await EncryptionService.encryptCareerData(exportBundle);
        await SessionSecurityService.recordAuditEvent(
          'DATA_EXPORT_AES256',
          'Generated AES-256-CBC encrypted backup'
        );
      } else {
        outputContent = JSON.stringify(exportBundle, null, 2);
        await SessionSecurityService.recordAuditEvent(
          'DATA_EXPORT_JSON',
          'Generated standard JSON data export'
        );
      }

      await Share.share({
        title: encrypted ? 'Morabaraba_Encrypted_Backup.aes' : 'Morabaraba_Career_Data.json',
        message: outputContent,
      });

      showAlert({
        title: encrypted ? 'Encrypted Archive Exported' : 'Career Data Exported',
        message: encrypted
          ? 'Your career archive has been encrypted with your device master key (AES-256-CBC) and prepared for vaulting.'
          : 'Your career records and profile data have been generated in standard JSON format.',
      });
    } catch (e: any) {
      showAlert({
        title: 'Export Error',
        message: e?.message || 'Failed to prepare career export.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <Header
        title="EXPORT CAREER DATA"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text variant="h2" weight="800" color={colors.textPrimary} style={styles.title}>
            Data Portability
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Exercise complete ownership over your competitor records. Export match history, mills formed, and tactical statistics in encrypted or standard formats.
          </Text>
        </View>

        {/* Option 1: AES-256 Encrypted */}
        <View style={styles.optionCard}>
          <View style={styles.optionHeader}>
            <View style={styles.iconCircle}>
              <LockSvg size={20} color="#D97706" strokeWidth={2} />
            </View>
            <View style={styles.optionTitleBlock}>
              <Text variant="h3" style={styles.cardTitle}>
                Hardware-Encrypted (AES-256-CBC)
              </Text>
              <Text variant="caption" color={colors.textTertiary}>
                FIPS 197 standard • SHA-256 HMAC integrity
              </Text>
            </View>
          </View>

          <Text variant="body" color={colors.textSecondary} style={styles.cardDesc}>
            Generates a tamper-proof encrypted archive protected by your device master key. Recommended for cold-storage backups and secure offline vaulting.
          </Text>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => handleExport(true)}
            activeOpacity={0.8}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <View style={styles.btnContent}>
                <DownloadSvg size={16} color="#FFFFFF" strokeWidth={2} />
                <Text variant="body" weight="700" color="#FFFFFF">
                  Export AES-256 Backup
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Option 2: Standard JSON */}
        <View style={styles.optionCard}>
          <View style={styles.optionHeader}>
            <View style={styles.iconCircle}>
              <FileTextSvg size={20} color="#0F172A" strokeWidth={2} />
            </View>
            <View style={styles.optionTitleBlock}>
              <Text variant="h3" style={styles.cardTitle}>
                Standard Open JSON
              </Text>
              <Text variant="caption" color={colors.textTertiary}>
                ECMA-404 universal portable format
              </Text>
            </View>
          </View>

          <Text variant="body" color={colors.textSecondary} style={styles.cardDesc}>
            Human-readable, unencrypted data file containing your match totals, win rate %, and identity metadata for integration with external analysis spreadsheets.
          </Text>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => handleExport(false)}
            activeOpacity={0.8}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#0F172A" />
            ) : (
              <View style={styles.btnContent}>
                <DownloadSvg size={16} color="#0F172A" strokeWidth={2} />
                <Text variant="body" weight="700" color="#0F172A">
                  Export Standard JSON
                </Text>
              </View>
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
  optionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    padding: 20,
    marginBottom: 20,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTitleBlock: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  primaryBtn: {
    height: 48,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtn: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default ExportDataScreen;

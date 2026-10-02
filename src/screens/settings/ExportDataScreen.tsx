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
        version: '1.0.4',
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
        <View style={styles.sectionBlock}>
          <Text variant="label" weight="800" color={colors.textTertiary} style={styles.sectionHeader}>
            HARDWARE-ENCRYPTED (AES-256-CBC)
          </Text>
          <Text variant="h3" style={styles.rowTitle}>
            Hardware-Encrypted Archive (AES-256-CBC)
          </Text>
          <Text variant="caption" color={colors.textTertiary} style={styles.rowSubtitle}>
            FIPS 197 standard • SHA-256 HMAC integrity
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.bodyDesc}>
            Generates a tamper-proof encrypted archive protected by your device master key. Recommended for cold-storage backups and secure offline vaulting.
          </Text>

          <TouchableOpacity
            style={styles.textActionRow}
            onPress={() => handleExport(true)}
            activeOpacity={0.7}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Text variant="body" weight="800" color={colors.accentHover}>
                Export AES-256 Backup →
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.rowDivider} />

        {/* Option 2: Standard JSON */}
        <View style={styles.sectionBlock}>
          <Text variant="label" weight="800" color={colors.textTertiary} style={styles.sectionHeader}>
            STANDARD OPEN JSON FORMAT
          </Text>
          <Text variant="h3" style={styles.rowTitle}>
            Standard JSON Export
          </Text>
          <Text variant="caption" color={colors.textTertiary} style={styles.rowSubtitle}>
            ECMA-404 universal portable format
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.bodyDesc}>
            Human-readable, unencrypted data file containing your match totals, win rate %, and identity metadata for integration with external analysis spreadsheets.
          </Text>

          <TouchableOpacity
            style={styles.textActionRow}
            onPress={() => handleExport(false)}
            activeOpacity={0.7}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <Text variant="body" weight="800" color={colors.accentHover}>
                Export Standard JSON →
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
    paddingVertical: 12,
  },
  sectionHeader: {
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 12,
    marginBottom: 8,
  },
  bodyDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  textActionRow: {
    paddingVertical: 8,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
    marginVertical: 12,
  },
});

export default ExportDataScreen;

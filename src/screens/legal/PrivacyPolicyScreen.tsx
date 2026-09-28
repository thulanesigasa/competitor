import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Text } from '../../components/Typography';
import { Header } from '../../components/common/Header';

export const PrivacyPolicyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <Header
        title="PRIVACY POLICY"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introHeader}>
          <Text variant="caption" color={colors.textSecondary} style={styles.lastUpdated}>
            Effective Date: September 28, 2026 • Version 1.0.4
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.leadParagraph}>
            Your security, game session confidentiality, and privacy are paramount. This Privacy Policy details the exact nature of data processed across our Southern African Morabaraba network, how match records are safeguarded, and your statutory rights under POPIA and GDPR.
          </Text>
        </View>

        {/* Section 1 */}
        <View style={styles.sectionBlock}>
          <Text variant="h3" weight="800" color={colors.textPrimary} style={styles.sectionHeading}>
            1. Core Privacy Commitments
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.sectionBody}>
            At Morabaraba Arena, we are dedicated to authentic traditional gameplay free from commercial surveillance and intrusive tracking:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="body" color={colors.textSecondary} style={styles.bulletItem}>
              • <Text weight="700" color={colors.textPrimary}>Zero Advertising Networks:</Text> We do not bundle commercial ad SDKs, user profiling trackers, or marketing surveillance scripts.
            </Text>
            <Text variant="body" color={colors.textSecondary} style={styles.bulletItem}>
              • <Text weight="700" color={colors.textPrimary}>No Sale of Personal Data:</Text> Your identity, cellphone, matchmaking logs, and tactical moves are never sold or rented to third parties.
            </Text>
            <Text variant="body" color={colors.textSecondary} style={styles.bulletItem}>
              • <Text weight="700" color={colors.textPrimary}>Target Challenge Region Autonomy:</Text> You have absolute control to set your desired matchmaking province without revealing your physical address.
            </Text>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.sectionBlock}>
          <Text variant="h3" weight="800" color={colors.textPrimary} style={styles.sectionHeading}>
            2. Data We Process
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.sectionBody}>
            We strictly limit data processing to what is essential for fair, synchronized online play:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="body" color={colors.textSecondary} style={styles.bulletItem}>
              • <Text weight="700" color={colors.textPrimary}>Account Credentials:</Text> Gamer tag, encrypted authentication tokens, and contact coordinates stored via Supabase Postgres with Row Level Security.
            </Text>
            <Text variant="body" color={colors.textSecondary} style={styles.bulletItem}>
              • <Text weight="700" color={colors.textPrimary}>Match Records & Ratings:</Text> Total matches played, victories, win rate %, mill formations, cow captures, and Southern African cultural rank tier.
            </Text>
            <Text variant="body" color={colors.textSecondary} style={styles.bulletItem}>
              • <Text weight="700" color={colors.textPrimary}>Realtime Telemetry:</Text> Ephemeral board states and broadcast move events during live battleground rooms.
            </Text>
          </View>
        </View>

        {/* Section 3 */}
        <View style={styles.sectionBlock}>
          <Text variant="h3" weight="800" color={colors.textPrimary} style={styles.sectionHeading}>
            3. Data Retention & Erasure Rights
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.sectionBody}>
            In compliance with POPIA section 14 and GDPR Article 17, you hold the right to export your entire career history in AES-256 or JSON formats, or permanently purge your account directly from the settings menu.
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
  },
  introHeader: {
    marginBottom: 24,
  },
  lastUpdated: {
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  leadParagraph: {
    fontSize: 14,
    lineHeight: 22,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionHeading: {
    fontSize: 16,
    marginBottom: 8,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  bulletList: {
    paddingLeft: 4,
    gap: 8,
  },
  bulletItem: {
    fontSize: 13,
    lineHeight: 20,
  },
});

export default PrivacyPolicyScreen;

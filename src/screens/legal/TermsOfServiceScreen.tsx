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

export const TermsOfServiceScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <Header
        title="TERMS OF SERVICE"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introHeader}>
          <Text variant="caption" color={colors.textSecondary} style={styles.lastUpdated}>
            Effective Date: September 27, 2026 • Version 1.0.3
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.leadParagraph}>
            Welcome to Morabaraba Competitor Arena. By participating in ranked matches, hosting battleground rooms, or utilizing our regional matchmaking, you agree to these Terms of Service.
          </Text>
        </View>

        {/* Section 1 */}
        <View style={styles.sectionBlock}>
          <Text variant="h3" weight="800" color={colors.textPrimary} style={styles.sectionHeading}>
            1. Authentic Morabaraba Fair Play
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.sectionBody}>
            Morabaraba is an ancient Southern African board game rooted in strategy, honor, and mutual respect. All competitors agree to abide by traditional rules:
          </Text>
          <View style={styles.bulletList}>
            <Text variant="body" color={colors.textSecondary} style={styles.bulletItem}>
              • <Text weight="700" color={colors.textPrimary}>Placing Phase Integrity:</Text> Each competitor places exactly 12 cows onto empty board intersections in turn.
            </Text>
            <Text variant="body" color={colors.textSecondary} style={styles.bulletItem}>
              • <Text weight="700" color={colors.textPrimary}>Moving & Flying Rules:</Text> Standard moves to adjacent points until reduced to three cows, where upon the flying phase is initiated.
            </Text>
            <Text variant="body" color={colors.textSecondary} style={styles.bulletItem}>
              • <Text weight="700" color={colors.textPrimary}>Mill Shooting Etiquette:</Text> Forming a mill (three aligned cows) grants the right to capture one opponent cow not currently in a mill, unless no free cows remain.
            </Text>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.sectionBlock}>
          <Text variant="h3" weight="800" color={colors.textPrimary} style={styles.sectionHeading}>
            2. Anti-Cheating & Automation Prohibitions
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.sectionBody}>
            Any unauthorized use of game-engine bots, algorithmic move solvers, packet tampering, or artificial ping manipulation will result in immediate disqualification and permanent account termination.
          </Text>
        </View>

        {/* Section 3 */}
        <View style={styles.sectionBlock}>
          <Text variant="h3" weight="800" color={colors.textPrimary} style={styles.sectionHeading}>
            3. Disconnection & Forfeit Rules
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.sectionBody}>
            In live battleground matches, intentional disconnection, app termination, or stalling beyond the allowable turn clock constitutes an automatic forfeit, awarding victory to the standing opponent.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.sectionBlock}>
          <Text variant="h3" weight="800" color={colors.textPrimary} style={styles.sectionHeading}>
            4. Cultural Ranking Sportsmanship
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.sectionBody}>
            Southern African cultural titles (such as Umfana, Murwisi, Iqhawe, Induna, and Kgosi) reflect martial mastery and community integrity. Respect towards challengers across all regional provinces is mandatory.
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

export default TermsOfServiceScreen;

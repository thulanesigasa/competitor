import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/common/Header';
import { Text } from '../../components/Typography';
import { colors } from '../../theme/colors';
import { TOP_8_PRIZES, WEEKLY_PRIZE_POOL_ZAR } from '../../services/tournamentService';
import { CheckCircleSvg } from '../../components/common/SvgIcons';

export const TournamentInfoScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const steps = [
    {
      num: '01',
      title: 'Duel in Live Ranked Battles',
      desc: 'Enter the online arena via Host Public Room, Public Lobby, or Private 4-Digit PIN. Every online victory boosts your ELO rating and climbs your standing on the Global Leaderboard.',
    },
    {
      num: '02',
      title: 'Climb the Global Leaderboard',
      desc: 'Standings are calculated in real time throughout the week based on your competitive win rate percentage, total match wins, and match volume across Southern Africa.',
    },
    {
      num: '03',
      title: 'Sunday 23:59:59 Hard Cutoff',
      desc: 'Every Sunday at precisely 23:59:59 SAST, the active tournament window locks. A cryptographic snapshot of the Global Leaderboard is taken to permanently record the Top 8 finalists.',
    },
    {
      num: '04',
      title: 'VIP Pro Pass Cash Qualification',
      desc: 'Climbing the leaderboard is 100% free and open to every competitor. To claim and receive cash disbursements from the weekly prize pool, an active VIP Pro Tournament Pass is required.',
    },
    {
      num: '05',
      title: 'Automated Payout Disbursement',
      desc: 'Immediately following the Sunday 23:59:59 cutoff, verified Top 8 winners receive automated email instructions to finalize secure direct bank transfer payouts.',
    },
  ];

  const integrityRules = [
    'Strict anti-collusion algorithms monitor abnormal win-trading and duplicate-device matchmaking.',
    'Only online duels contribute to competitive tournament standings (offline Pass & Play is unranked practice).',
    'Disconnections during active online duels forfeit the match to ensure fair play.',
    'Every competitor duels under authentic Southern African Morabaraba rules with zero pay-to-win mechanics.',
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="WEEKLY TOURNAMENT"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Section */}
        <Text variant="label" weight="900" color={colors.accentHover} style={styles.kicker}>
          SOUTHERN AFRICAN GRAND CONTEST
        </Text>
        <Text variant="h1" weight="900" color={colors.textPrimary} style={styles.title}>
          Weekly Tournament
        </Text>
        <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
          The premier weekly tactical arena where competitors across Southern Africa duel in ranked Morabaraba battles for cash prizes and regional supremacy.
        </Text>

        <View style={styles.divider} />

        {/* Schedule Section */}
        <Text variant="label" weight="900" color={colors.textPrimary} style={styles.sectionHeading}>
          TOURNAMENT SCHEDULE & ACTIVE WINDOW
        </Text>
        <View style={styles.scheduleRow}>
          <Text variant="body" weight="800" color={colors.accentHover} style={styles.scheduleTime}>
            STARTS: Monday 08:00:00 (SAST)
          </Text>
          <Text variant="body" weight="800" color={colors.textPrimary} style={styles.scheduleTime}>
            ENDS: Sunday 23:59:59 (SAST)
          </Text>
        </View>
        <Text variant="body" color={colors.textSecondary} style={styles.bodyParagraph}>
          The tournament arena opens every Monday morning at 8:00 AM and runs continuously for seven full days until Sunday at 23:59:59. Matches played outside this active window roll into practice or the subsequent weekly cycle.
        </Text>

        <View style={styles.divider} />

        {/* What the Tournament is About */}
        <Text variant="label" weight="900" color={colors.textPrimary} style={styles.sectionHeading}>
          WHAT THE TOURNAMENT IS ABOUT
        </Text>
        <Text variant="body" color={colors.textSecondary} style={styles.bodyParagraph}>
          The Morabaraba Weekly Grand Tournament is designed to celebrate authentic Southern African strategic mastery. Competitors face off in live peer-to-peer duels where every cow placed, mill closed, and opponent counter captured impacts your standing on the Global Leaderboard.
        </Text>
        <Text variant="body" color={colors.textSecondary} style={[styles.bodyParagraph, { marginTop: 8 }]}>
          With an official R{WEEKLY_PRIZE_POOL_ZAR}.00 weekly prize pool distributed among the Top 8 highest-ranked competitors, every single move on the board carries genuine competitive weight.
        </Text>

        <View style={styles.divider} />

        {/* How It Works */}
        <Text variant="label" weight="900" color={colors.textPrimary} style={styles.sectionHeading}>
          HOW IT WORKS (5-STEP PROCESS)
        </Text>
        {steps.map((s, idx) => (
          <View key={idx} style={styles.stepItem}>
            <View style={styles.stepHeader}>
              <Text variant="caption" weight="900" color={colors.accentHover} style={styles.stepNumber}>
                STEP {s.num}
              </Text>
              <Text variant="body" weight="800" color={colors.textPrimary} style={styles.stepTitle}>
                {s.title}
              </Text>
            </View>
            <Text variant="body" color={colors.textSecondary} style={styles.stepDesc}>
              {s.desc}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        {/* Weekly Prize Pool Breakdown */}
        <Text variant="label" weight="900" color={colors.textPrimary} style={styles.sectionHeading}>
          WEEKLY TOP 8 CASH ALLOCATION (R{WEEKLY_PRIZE_POOL_ZAR}.00 POOL)
        </Text>
        <Text variant="caption" color={colors.textSecondary} style={styles.sectionSubheading}>
          Official cash distribution locked at Sunday 23:59:59 cutoff:
        </Text>

        {TOP_8_PRIZES.map((item) => (
          <View key={item.rank} style={styles.prizeRow}>
            <View style={styles.prizeRankGroup}>
              <Text
                variant="caption"
                weight="800"
                color={
                  item.rank === 1
                    ? colors.accent
                    : item.rank === 2
                    ? '#64748B'
                    : item.rank === 3
                    ? '#B45309'
                    : colors.textSecondary
                }
                style={styles.prizeRankNumber}
              >
                #{item.rank}
              </Text>
              <Text variant="caption" weight="600" color={colors.textPrimary}>
                {item.title}
              </Text>
            </View>
            <Text variant="caption" weight="800" color={colors.accentHover}>
              R{item.amountZar}.00
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        {/* Fair Play & Integrity */}
        <Text variant="label" weight="900" color={colors.textPrimary} style={styles.sectionHeading}>
          FAIR PLAY & INTEGRITY STANDARDS
        </Text>
        {integrityRules.map((rule, idx) => (
          <View key={idx} style={styles.ruleRow}>
            <View style={styles.ruleIcon}>
              <CheckCircleSvg size={14} color={colors.accentHover} />
            </View>
            <Text variant="body" color={colors.textSecondary} style={styles.ruleText}>
              {rule}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        {/* Actions */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.battleButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Battleground' })}
          >
            <Text variant="body" weight="900" color="#FFFFFF" style={styles.buttonText}>
              ENTER TOURNAMENT BATTLEGROUND →
            </Text>
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
  scroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
  },
  kicker: {
    letterSpacing: 1,
    marginBottom: 4,
    fontSize: 10.5,
  },
  title: {
    fontSize: 26,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subtitle: {
    lineHeight: 20,
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    marginVertical: 18,
  },
  sectionHeading: {
    letterSpacing: 0.8,
    marginBottom: 8,
    fontSize: 12,
  },
  sectionSubheading: {
    lineHeight: 18,
    fontSize: 12,
    marginBottom: 10,
  },
  scheduleRow: {
    marginBottom: 10,
  },
  scheduleTime: {
    fontSize: 13,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  bodyParagraph: {
    lineHeight: 21,
    fontSize: 13,
  },
  stepItem: {
    marginTop: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  stepNumber: {
    letterSpacing: 0.8,
    marginRight: 8,
    fontSize: 11,
  },
  stepTitle: {
    fontSize: 13.5,
  },
  stepDesc: {
    lineHeight: 20,
    fontSize: 12.5,
  },
  prizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.06)',
  },
  prizeRankGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prizeRankNumber: {
    width: 28,
    fontSize: 12,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  ruleIcon: {
    marginRight: 10,
    marginTop: 3,
  },
  ruleText: {
    flex: 1,
    lineHeight: 19,
    fontSize: 12.5,
  },
  actionContainer: {
    marginTop: 12,
  },
  battleButton: {
    height: 48,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    letterSpacing: 0.8,
    fontSize: 12,
  },
});

export default TournamentInfoScreen;

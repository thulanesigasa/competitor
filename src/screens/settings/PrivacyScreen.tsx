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
import { PrivacyService, BlockedCompetitor } from '../../services/privacyService';
import { ChevronRightSvg } from '../../components/common/SvgIcons';

export const PrivacyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [privacyMode, setPrivacyMode] = useState<boolean>(false);
  const [discoverable, setDiscoverable] = useState<boolean>(true);
  const [statsVisible, setStatsVisible] = useState<boolean>(true);
  const [blockedUsers, setBlockedUsers] = useState<BlockedCompetitor[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const [pMode, disc, stats, blocked] = await Promise.all([
      PrivacyService.getPrivacyMode(),
      PrivacyService.getLeaderboardDiscoverable(),
      PrivacyService.getStatsVisibility(),
      PrivacyService.getBlockedCompetitors(),
    ]);
    setPrivacyMode(pMode);
    setDiscoverable(disc);
    setStatsVisible(stats);
    setBlockedUsers(blocked);
  };

  const handleTogglePrivacyMode = async (val: boolean) => {
    setPrivacyMode(val);
    await PrivacyService.setPrivacyMode(val);
  };

  const handleToggleDiscoverable = async (val: boolean) => {
    setDiscoverable(val);
    await PrivacyService.setLeaderboardDiscoverable(val);
  };

  const handleToggleStatsVisible = async (val: boolean) => {
    setStatsVisible(val);
    await PrivacyService.setStatsVisibility(val);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <Header
        title="PRIVACY & SAFETY"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Typography */}
        <View style={styles.headerBlock}>
          <Text variant="h2" weight="800" color={colors.textPrimary} style={styles.title}>
            Competitor Privacy
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Control your match presence, leaderboard discoverability, and regional challenger restrictions across the Southern African arena.
          </Text>
        </View>

        {/* 1. MATCHMAKING & IDENTITY PRIVACY */}
        <View style={styles.sectionBlock}>
          <Text variant="label" weight="800" color={colors.textTertiary} style={styles.sectionHeader}>
            MATCHMAKING & IDENTITY
          </Text>

          {/* Privacy Mode (Incognito) */}
          <View style={styles.actionRow}>
            <View style={styles.rowTitleBox}>
              <Text variant="h3" style={styles.rowTitle}>
                Private Matchmaking Mode
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.rowDescription}>
                Masks your gamer tag during casual public matches to prevent targeted scouting.
              </Text>
            </View>
            <UiverseSwitch
              value={privacyMode}
              onValueChange={handleTogglePrivacyMode}
              accessibilityLabel="Toggle private matchmaking mode"
            />
          </View>

          <View style={styles.rowDivider} />

          {/* Public Leaderboard Discoverability */}
          <View style={styles.actionRow}>
            <View style={styles.rowTitleBox}>
              <Text variant="h3" style={styles.rowTitle}>
                Public Leaderboard Discoverability
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.rowDescription}>
                Allows fellow competitors across Southern Africa to view your standing and challenge you.
              </Text>
            </View>
            <UiverseSwitch
              value={discoverable}
              onValueChange={handleToggleDiscoverable}
              accessibilityLabel="Toggle public leaderboard discoverability"
            />
          </View>

          <View style={styles.rowDivider} />

          {/* Career Stats Visibility */}
          <View style={styles.actionRow}>
            <View style={styles.rowTitleBox}>
              <Text variant="h3" style={styles.rowTitle}>
                Public Career Statistics
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.rowDescription}>
                Displays your win rate %, victories, and mill formation metrics on public profile cards.
              </Text>
            </View>
            <UiverseSwitch
              value={statsVisible}
              onValueChange={handleToggleStatsVisible}
              accessibilityLabel="Toggle public career stats"
            />
          </View>
        </View>

        {/* 2. CHALLENGER RESTRICTIONS */}
        <View style={styles.sectionBlock}>
          <Text variant="label" weight="800" color={colors.textTertiary} style={styles.sectionHeader}>
            CHALLENGER RESTRICTIONS
          </Text>

          {/* Blocked Accounts */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('BlockedUsers')}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={`Blocked accounts. ${blockedUsers.length} accounts blocked.`}
          >
            <View style={styles.rowTitleBox}>
              <Text variant="h3" style={styles.rowTitle}>
                Blocked Competitors
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.rowDescription}>
                {blockedUsers.length > 0
                  ? `${blockedUsers.length} ${blockedUsers.length === 1 ? 'competitor' : 'competitors'} restricted from challenging you`
                  : 'Zero competitors blocked • Tap to manage restrictions'}
              </Text>
            </View>
            <ChevronRightSvg size={18} color="#94A3B8" />
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

export default PrivacyScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import {
  INITIAL_REGIONAL_LEADERBOARD,
  LeaderboardEntry,
} from '../../store/gameStore';

const COUNTRY_FILTERS = [
  'All Nations',
  'South Africa',
  'Zimbabwe',
  'Zambia',
  'Botswana',
  'Malawi',
  'Lesotho',
  'Eswatini',
];

export const LeaderboardScreen: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('All Nations');

  const filteredList: LeaderboardEntry[] =
    selectedFilter === 'All Nations'
      ? INITIAL_REGIONAL_LEADERBOARD
      : INITIAL_REGIONAL_LEADERBOARD.filter(
          (entry) => entry.country.toLowerCase() === selectedFilter.toLowerCase()
        );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="LEADERBOARD"
        subtitle="SOUTHERN AFRICAN RANKINGS"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Country Filter Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
        >
          {COUNTRY_FILTERS.map((country) => (
            <TouchableOpacity
              key={country}
              onPress={() => setSelectedFilter(country)}
              style={[
                styles.filterChip,
                selectedFilter === country && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === country && styles.filterTextActive,
                ]}
              >
                {country}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Competitor Rankings */}
        <View style={styles.rankingsList}>
          {filteredList.map((entry) => (
            <View key={entry.gamerTag} style={styles.rankRow}>
              {/* Rank Number */}
              <View
                style={[
                  styles.rankBadge,
                  entry.rank === 1 && styles.rankBadgeGold,
                  entry.rank === 2 && styles.rankBadgeSilver,
                  entry.rank === 3 && styles.rankBadgeBronze,
                ]}
              >
                <Text
                  style={[
                    styles.rankNumber,
                    entry.rank <= 3 && styles.rankNumberTop,
                  ]}
                >
                  #{entry.rank}
                </Text>
              </View>

              {/* Player Info */}
              <View style={styles.playerDetails}>
                <View style={styles.nameRow}>
                  <Text style={styles.gamerTag}>{entry.gamerTag}</Text>
                  <Text style={styles.countryCode}>[{entry.countryCode}]</Text>
                </View>
                <Text style={styles.locationText}>
                  {entry.town}, {entry.province}
                </Text>
              </View>

              {/* Elo & Stats */}
              <View style={styles.statsColumn}>
                <Text style={styles.eloScore}>{entry.elo} ELO</Text>
                <Text style={styles.winRate}>{entry.winRate}% WR ({entry.wins}W)</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 90,
  },
  filtersScroll: {
    flexGrow: 0,
    marginBottom: SPACING.md,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: 'rgba(229, 169, 60, 0.12)',
    borderColor: COLORS.accent,
  },
  filterText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.accentHover,
    fontWeight: '800',
  },
  rankingsList: {
    gap: SPACING.xs,
  },
  rankRow: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankBadgeGold: {
    backgroundColor: COLORS.accent,
  },
  rankBadgeSilver: {
    backgroundColor: '#94A3B8',
  },
  rankBadgeBronze: {
    backgroundColor: '#B45309',
  },
  rankNumber: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  rankNumberTop: {
    color: COLORS.white,
  },
  playerDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gamerTag: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  countryCode: {
    color: COLORS.accentHover,
    fontSize: 11,
    fontWeight: '700',
  },
  locationText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  statsColumn: {
    alignItems: 'flex-end',
  },
  eloScore: {
    color: COLORS.accentHover,
    fontSize: 14,
    fontWeight: '900',
  },
  winRate: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});

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
              {/* Rank Number - Pure clean typography */}
              <Text
                style={[
                  styles.rankNumber,
                  entry.rank === 1 && styles.rankNumberGold,
                  entry.rank === 2 && styles.rankNumberSilver,
                  entry.rank === 3 && styles.rankNumberBronze,
                ]}
              >
                #{entry.rank}
              </Text>

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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
    paddingBottom: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 6,
  },
  filterChipActive: {
    borderBottomColor: COLORS.accent,
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
    gap: 0,
  },
  rankRow: {
    paddingVertical: 14,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankNumber: {
    width: 44,
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '800',
  },
  rankNumberGold: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: '900',
  },
  rankNumberSilver: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '900',
  },
  rankNumberBronze: {
    color: '#B45309',
    fontSize: 14,
    fontWeight: '900',
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

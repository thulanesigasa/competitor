import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { Header } from '../../components/common/Header';
import { LeaderboardEntry } from '../../store/gameStore';
import { leaderboardService } from '../../services/leaderboardService';
import {
  tournamentService,
  TOP_8_PRIZES,
  getPrizeForRank,
} from '../../services/tournamentService';
import {
  TrophySvg,
  ClockSvg,
  CloseSvg,
  CrownSvg,
  ShieldSvg,
  ChevronRightSvg,
} from '../../components/common/SvgIcons';

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
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showPrizeModal, setShowPrizeModal] = useState(false);

  const currentTournament = tournamentService.getCurrentTournament();
  const [countdownText, setCountdownText] = useState(
    tournamentService.getTimeRemaining().formatted
  );

  useEffect(() => {
    const updateCountdown = () => {
      const remaining = tournamentService.getTimeRemaining();
      setCountdownText(remaining.formatted);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedFilter]);

  const loadLeaderboard = async () => {
    try {
      setIsLoading(true);
      const liveData = await leaderboardService.getRegionalLeaderboard(selectedFilter);
      setRankings(liveData || []);
    } catch {
      setRankings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadLeaderboard();
    setIsRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="LEADERBOARD"
        subtitle="SOUTHERN AFRICAN RANKINGS"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent]}
          />
        }
      >
        {/* Weekly Tournament Banner */}
        <View style={styles.tournamentBanner}>
          <View style={styles.bannerHeader}>
            <View style={styles.bannerBadgeRow}>
              <View style={styles.liveIndicatorDot} />
              <Text style={styles.bannerLiveTag}>WEEKLY TOURNAMENT</Text>
            </View>
            <View style={styles.clockTag}>
              <ClockSvg size={12} color={COLORS.accent} />
              <Text style={styles.clockText}>LOCKS IN: {countdownText}</Text>
            </View>
          </View>

          <View style={styles.bannerBody}>
            <View style={styles.trophyIconBox}>
              <TrophySvg size={24} color={COLORS.accent} />
            </View>
            <View style={styles.bannerTextCol}>
              <Text style={styles.bannerTitle}>R500 GRAND PRIZE POOL</Text>
              <Text style={styles.bannerSubtitle}>
                Top 8 ranked competitors win cash payouts • Week {currentTournament.weekNumber}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.bannerActionBtn}
            activeOpacity={0.8}
            onPress={() => setShowPrizeModal(true)}
          >
            <Text style={styles.bannerActionText}>VIEW TOP 8 PRIZE BREAKDOWN</Text>
            <ChevronRightSvg size={14} color={COLORS.accent} />
          </TouchableOpacity>
        </View>

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
        {rankings.length > 0 ? (
          <View style={styles.rankingsList}>
            {rankings.map((entry) => {
              const prize = getPrizeForRank(entry.rank);
              return (
                <View key={`${entry.gamerTag}-${entry.rank}`} style={styles.rankRow}>
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
                      {entry.town ? `${entry.town}, ` : ''}{entry.province} • {entry.country}
                    </Text>
                  </View>

                  {/* Prize Badge if Top 8 */}
                  {prize !== null && (
                    <View style={styles.prizePill}>
                      <Text style={styles.prizePillLabel}>PRIZE</Text>
                      <Text style={styles.prizePillValue}>R{prize}</Text>
                    </View>
                  )}

                  {/* Performance Stats with 10-Tier Dynamic Title */}
                  <View style={styles.statsColumn}>
                    <Text style={styles.eloScore}>{entry.title.toUpperCase()}</Text>
                    <Text style={styles.winRate}>{entry.winRate}% Win Rate ({entry.wins}W)</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>NO RANKED COMPETITORS YET</Text>
            <Text style={styles.emptySubtitle}>
              {selectedFilter === 'All Nations'
                ? 'No match statistics recorded on the live database yet. Compete in online battleground rooms to claim the #1 ranking!'
                : `No ranked competitors recorded yet in ${selectedFilter}. Host or join a battle room to claim the top spot!`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Prize Breakdown Modal */}
      <Modal
        visible={showPrizeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPrizeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <TrophySvg size={20} color={COLORS.accent} />
                <Text style={styles.modalTitle}>R500 WEEKLY PRIZE POOL</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowPrizeModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <CloseSvg size={18} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSubtitle}>
                Weekly Tournament cycle runs Monday 00:00:00 to Sunday 23:59:59 SAST. Top 8 leaderboard finishers receive guaranteed cash payouts.
              </Text>

              {/* Prize Grid */}
              <View style={styles.prizeGrid}>
                {TOP_8_PRIZES.map((item) => (
                  <View
                    key={item.rank}
                    style={[
                      styles.prizeCard,
                      item.rank === 1 && styles.prizeCardFirst,
                      item.rank === 2 && styles.prizeCardSecond,
                      item.rank === 3 && styles.prizeCardThird,
                    ]}
                  >
                    <Text
                      style={[
                        styles.prizeRank,
                        item.rank <= 3 && styles.prizeRankTop,
                      ]}
                    >
                      RANK #{item.rank}
                    </Text>
                    <Text
                      style={[
                        styles.prizeAmount,
                        item.rank === 1 && styles.prizeAmountGold,
                      ]}
                    >
                      R{item.amountZar}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Tournament Rules / Verification Notes */}
              <View style={styles.rulesContainer}>
                <View style={styles.ruleItem}>
                  <ShieldSvg size={16} color={COLORS.accent} />
                  <View style={styles.ruleTextCol}>
                    <Text style={styles.ruleHeading}>Online Matches Only</Text>
                    <Text style={styles.ruleDesc}>
                      Leaderboard standing and win rates are calculated exclusively from Public and Private Online matches. Offline Pass & Play and vs CPU matches do not alter rankings.
                    </Text>
                  </View>
                </View>

                <View style={styles.ruleItem}>
                  <CrownSvg size={16} color={COLORS.accent} />
                  <View style={styles.ruleTextCol}>
                    <Text style={styles.ruleHeading}>VIP Pro Tournament Pass Required</Text>
                    <Text style={styles.ruleDesc}>
                      Top 8 competitors must hold an active VIP Pro Tournament Pass (R150/mo) at the Sunday 23:59:59 lock to be eligible to claim and receive their cash payout.
                    </Text>
                  </View>
                </View>

                <View style={styles.ruleItem}>
                  <ClockSvg size={16} color={COLORS.accent} />
                  <View style={styles.ruleTextCol}>
                    <Text style={styles.ruleHeading}>Automated Sunday Settlement</Text>
                    <Text style={styles.ruleDesc}>
                      At Sunday 23:59:59 SAST, tournament standings freeze automatically. Registered winners receive email notifications and direct payment distribution.
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                activeOpacity={0.8}
                onPress={() => setShowPrizeModal(false)}
              >
                <Text style={styles.modalCloseBtnText}>CLOSE BREAKDOWN</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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

  // Weekly Tournament Banner
  tournamentBanner: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  bannerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  bannerLiveTag: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.accentHover,
    letterSpacing: 0.8,
  },
  clockTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  clockText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
  },
  bannerBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginVertical: 4,
  },
  trophyIconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  bannerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: SPACING.sm,
    marginTop: SPACING.sm,
  },
  bannerActionText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.accentHover,
    letterSpacing: 0.4,
  },

  // Filters
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

  // Rankings
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
    width: 38,
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
  prizePill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(229, 169, 60, 0.35)',
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginRight: SPACING.sm,
    alignItems: 'center',
  },
  prizePillLabel: {
    fontSize: 7.5,
    fontWeight: '800',
    color: COLORS.accentHover,
    letterSpacing: 0.4,
  },
  prizePillValue: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  statsColumn: {
    alignItems: 'flex-end',
  },
  eloScore: {
    color: COLORS.accentHover,
    fontSize: 13,
    fontWeight: '900',
  },
  winRate: {
    color: COLORS.textSecondary,
    fontSize: 10.5,
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    marginTop: SPACING.md,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: SPACING.xs,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.12)',
    padding: SPACING.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  modalSubtitle: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: SPACING.md,
  },
  prizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.md,
  },
  prizeCard: {
    width: '23%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  prizeCardFirst: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(229, 169, 60, 0.08)',
  },
  prizeCardSecond: {
    borderColor: '#94A3B8',
  },
  prizeCardThird: {
    borderColor: '#D97706',
  },
  prizeRank: {
    fontSize: 8.5,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.4,
  },
  prizeRankTop: {
    color: COLORS.accentHover,
    fontWeight: '900',
  },
  prizeAmount: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  prizeAmountGold: {
    color: COLORS.accentHover,
  },
  rulesContainer: {
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(15, 23, 42, 0.08)',
    paddingTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  ruleItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  ruleTextCol: {
    flex: 1,
  },
  ruleHeading: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  ruleDesc: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  modalCloseBtn: {
    height: 44,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  modalCloseBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
});

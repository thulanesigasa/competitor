import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Text } from '../../components/Typography';
import { Header } from '../../components/common/Header';
import {
  walletService,
  UserWallet,
  MONTHLY_SUBSCRIPTION_PRICE,
} from '../../services/walletService';
import {
  CheckCircleSvg,
  AlertTriangleSvg,
  CrownSvg,
} from '../../components/common/SvgIcons';
import { TOP_8_PRIZES, WEEKLY_PRIZE_POOL_ZAR } from '../../services/tournamentService';

export const VipPassScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    loadWalletData();
    const unsub = walletService.subscribeWallet((updated) => {
      setWallet(updated);
    });
    return () => unsub();
  }, []);

  const loadWalletData = async () => {
    setIsLoading(true);
    try {
      const data = await walletService.getWallet();
      setWallet(data);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setFeedbackMessage(null);
    setIsProcessing(true);
    try {
      const result = await walletService.subscribeMonthly();
      if (result.success) {
        setWallet(result.wallet);
        setFeedbackMessage({
          type: 'success',
          text: 'VIP Pro Tournament Pass activated. You are eligible to claim Top 8 Weekly Tournament cash prizes.',
        });
      } else {
        setFeedbackMessage({
          type: 'error',
          text: result.error || 'Failed to activate VIP Pro Pass.',
        });
      }
    } catch (e: any) {
      setFeedbackMessage({
        type: 'error',
        text: e?.message || 'Error processing VIP subscription.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    setFeedbackMessage(null);
    setIsProcessing(true);
    try {
      const updated = await walletService.cancelSubscription();
      setWallet(updated);
      setFeedbackMessage({
        type: 'success',
        text: 'VIP Pro Pass auto-renewal cancelled. You can continue playing unranked and ranked duels freely.',
      });
    } catch (e: any) {
      setFeedbackMessage({
        type: 'error',
        text: e?.message || 'Failed to cancel subscription.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const benefits = [
    {
      title: 'Top 8 Cash Prize Eligibility',
      desc: `Exclusive right to claim your share of the R${WEEKLY_PRIZE_POOL_ZAR}.00 weekly grand cash prize pool when placing in positions 1 to 8 on the Global Leaderboard.`,
    },
    {
      title: 'Golden Crown Emblem',
      desc: 'Distinctive VIP Pro arena identity showcased across live battle lobbies and Global Leaderboard standings.',
    },
    {
      title: 'Automated Sunday Payouts',
      desc: 'Top 8 finalists are automatically recorded at Sunday 23:59:59 and receive direct email notifications to finalize bank payout disbursement.',
    },
    {
      title: 'All-Arena Battle Access',
      desc: 'Unrestricted online matchmaking access across Morabaraba and all upcoming strategy board games (Chess, Checkers).',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <Header
        title="VIP PRO PASS"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro Block */}
        <View style={styles.headerBlock}>
          <Text variant="label" weight="900" color={colors.accentHover} style={styles.badgeLabel}>
            WEEKLY TOURNAMENT ACCESS
          </Text>
          <Text variant="h1" weight="900" color={colors.textPrimary} style={styles.title}>
            VIP Pro Pass
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Unlock Top 8 cash prize claiming privileges in the R{WEEKLY_PRIZE_POOL_ZAR}.00 weekly grand tournament (Monday 08:00 to Sunday 23:59:59).
          </Text>
        </View>

        {/* Feedback Message (pure body notice, no card box) */}
        {feedbackMessage && (
          <View style={styles.feedbackRow}>
            {feedbackMessage.type === 'success' ? (
              <CheckCircleSvg size={16} color={colors.accentHover} />
            ) : (
              <AlertTriangleSvg size={16} color="#DC2626" />
            )}
            <Text
              variant="caption"
              weight="700"
              color={feedbackMessage.type === 'success' ? colors.accentHover : '#DC2626'}
              style={{ marginLeft: 8, flex: 1 }}
            >
              {feedbackMessage.text}
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Membership Status (pure body typography, no card divs) */}
            <View style={styles.statusSection}>
              <View style={styles.statusHeader}>
                <View style={styles.statusTitleRow}>
                  <CrownSvg size={20} color={colors.accent} strokeWidth={2.5} />
                  <Text variant="h3" weight="800" color={colors.textPrimary} style={{ marginLeft: 8 }}>
                    {wallet?.isSubscribed ? 'VIP Pro Member' : 'Free Competitor Tier'}
                  </Text>
                </View>
                <Text
                  variant="caption"
                  weight="800"
                  color={wallet?.isSubscribed ? colors.accentHover : colors.textTertiary}
                >
                  {wallet?.isSubscribed ? 'ACTIVE' : 'FREE TIER'}
                </Text>
              </View>

              <Text variant="body" color={colors.textSecondary} style={styles.statusDescription}>
                {wallet?.isSubscribed
                  ? 'Your VIP Pro Pass is active. If you finish in the Top 8 on the Global Leaderboard at Sunday 23:59:59, your cash prize will be disbursed directly.'
                  : 'Free tier active. You can duel and climb the Global Leaderboard freely, but a VIP Pro Pass is required to claim the Top 8 weekly tournament cash prizes.'}
              </Text>

              {wallet?.isSubscribed && wallet.subscriptionExpiry && (
                <Text variant="caption" color={colors.textSecondary} style={styles.expiryText}>
                  Renewal date:{' '}
                  <Text variant="caption" weight="700" color={colors.textPrimary}>
                    {new Date(wallet.subscriptionExpiry).toLocaleDateString()}
                  </Text>
                </Text>
              )}
            </View>

            <View style={styles.divider} />

            {/* Tournament Guide Link */}
            <TouchableOpacity
              style={styles.tournamentActionRow}
              activeOpacity={0.7}
              onPress={() => navigation.navigate('TournamentInfo')}
            >
              <View style={styles.tournamentRowLeft}>
                <Text variant="label" weight="900" color={colors.accentHover} style={styles.tournamentKicker}>
                  WEEKLY TOURNAMENT
                </Text>
                <Text variant="body" weight="800" color={colors.textPrimary} style={styles.tournamentTitle}>
                  Tournament Guide & Schedule
                </Text>
                <Text variant="caption" color={colors.textSecondary} style={styles.tournamentSubtitle}>
                  Starts 8:00 AM Monday to 23:59:59 Sunday • How it works →
                </Text>
              </View>
              <Text variant="body" weight="800" color={colors.accentHover} style={styles.tournamentArrow}>
                →
              </Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Weekly Prize Pool Breakdown (pure body rows, no prizeGrid div) */}
            <View style={styles.prizeSection}>
              <Text variant="label" weight="900" color={colors.textPrimary} style={styles.sectionHeader}>
                WEEKLY TOP 8 CASH ALLOCATION (R{WEEKLY_PRIZE_POOL_ZAR}.00 POOL)
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={styles.sectionSubtitle}>
                Official cash allocation for Top 8 Global Leaderboard rank finishers at Sunday 23:59:59 cutoff:
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
            </View>

            <View style={styles.divider} />

            {/* Benefits List (pure body rows) */}
            <View style={styles.benefitsSection}>
              <Text variant="label" weight="900" color={colors.textPrimary} style={styles.sectionHeader}>
                VIP PRO BENEFITS
              </Text>
              {benefits.map((b, idx) => (
                <View key={idx} style={styles.benefitRow}>
                  <View style={styles.benefitIcon}>
                    <CheckCircleSvg size={16} color={colors.accent} />
                  </View>
                  <View style={styles.benefitTextGroup}>
                    <Text variant="body" weight="700" color={colors.textPrimary} style={styles.benefitTitle}>
                      {b.title}
                    </Text>
                    <Text variant="caption" color={colors.textSecondary} style={styles.benefitDesc}>
                      {b.desc}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              {wallet?.isSubscribed ? (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  disabled={isProcessing}
                  activeOpacity={0.75}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#DC2626" />
                  ) : (
                    <Text variant="caption" weight="800" color="#DC2626" style={styles.buttonLabel}>
                      CANCEL VIP PRO RENEWAL
                    </Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.subscribeButton}
                  onPress={handleSubscribe}
                  disabled={isProcessing}
                  activeOpacity={0.85}
                >
                  {isProcessing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text variant="caption" weight="900" color="#FFFFFF" style={styles.buttonLabel}>
                      ACTIVATE VIP PRO • R{MONTHLY_SUBSCRIPTION_PRICE.toFixed(2)} / MONTH
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
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
  headerBlock: {
    marginBottom: 8,
  },
  badgeLabel: {
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
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
    marginBottom: 8,
  },
  statusSection: {
    paddingVertical: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDescription: {
    lineHeight: 20,
    fontSize: 13,
  },
  expiryText: {
    marginTop: 8,
    fontSize: 12,
  },
  tournamentActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  tournamentRowLeft: {
    flex: 1,
  },
  tournamentKicker: {
    letterSpacing: 0.8,
    marginBottom: 3,
    fontSize: 10.5,
  },
  tournamentTitle: {
    fontSize: 14,
    marginBottom: 3,
  },
  tournamentSubtitle: {
    lineHeight: 18,
    fontSize: 12,
  },
  tournamentArrow: {
    fontSize: 18,
    marginLeft: 12,
  },
  prizeSection: {
    paddingVertical: 4,
  },
  sectionHeader: {
    letterSpacing: 0.8,
    marginBottom: 4,
    fontSize: 11.5,
  },
  sectionSubtitle: {
    lineHeight: 18,
    fontSize: 12,
    marginBottom: 12,
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
  benefitsSection: {
    paddingVertical: 4,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  benefitIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  benefitTextGroup: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 13.5,
    marginBottom: 2,
  },
  benefitDesc: {
    lineHeight: 18,
    fontSize: 12.5,
  },
  actionsContainer: {
    marginTop: 8,
  },
  subscribeButton: {
    backgroundColor: colors.accent,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    letterSpacing: 0.8,
  },
});

export default VipPassScreen;

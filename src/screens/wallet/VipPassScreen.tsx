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
} from '../../components/common/SvgIcons';

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
          text: 'Congratulations! VIP Pro Pass activated. You now keep 100% of all match pot winnings with 0% platform rake.',
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
        text: 'VIP Pro Pass renewal cancelled. Standard Pay-As-You-Go rate (88% payout) restored.',
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
      title: '100% Pot Winnings',
      desc: 'Zero platform commission deducted from your duel victories (standard players pay 12% rake).',
    },
    {
      title: 'Golden Crown Insignia',
      desc: 'Distinctive VIP Pro arena identity showcased across battle lobbies and leaderboard standings.',
    },
    {
      title: 'Unrestricted Duel Staking',
      desc: 'Host and challenge high-stakes rooms without rake penalties cutting into your returns.',
    },
    {
      title: 'Priority Move Verification',
      desc: 'Dedicated low-latency server validation and rapid escrow settlement on game completion.',
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
          <Text variant="h2" weight="800" color={colors.textPrimary} style={styles.title}>
            VIP Pro Membership
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Eliminate platform commissions and retain 100% of duel stakes across all wagered Morabaraba battles.
          </Text>
        </View>

        {/* Feedback Message */}
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

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.accent} />
          </View>
        ) : (
          <View style={styles.sectionBlock}>
            {/* 1. CURRENT MEMBERSHIP STATUS */}
            <Text variant="label" weight="800" color={colors.textTertiary} style={styles.sectionHeader}>
              CURRENT STATUS
            </Text>

            <View style={styles.statusRow}>
              <View style={{ flex: 1 }}>
                <Text variant="h3" weight="800" color={colors.textPrimary}>
                  {wallet?.isSubscribed ? 'VIP Pro Member' : 'Standard Player (Pay-As-You-Go)'}
                </Text>
                <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                  {wallet?.isSubscribed
                    ? `Active • Renews monthly (0% Platform Rake)`
                    : `88% Payout Rate (12% Platform Rake)`}
                </Text>
              </View>
            </View>

            <View style={styles.rowDivider} />

            {/* 2. RAKE COMMISSION COMPARISON */}
            <Text variant="label" weight="800" color={colors.textTertiary} style={[styles.sectionHeader, { marginTop: 24 }]}>
              COMMISSION STRUCTURE
            </Text>

            <View style={styles.compareItem}>
              <View style={styles.compareTitleBox}>
                <Text variant="h3" style={styles.rowTitle}>
                  Pay-As-You-Go (Standard)
                </Text>
                <Text variant="caption" color={colors.textSecondary} style={styles.rowDescription}>
                  Winner receives 88% of match pot • 12% platform rake retained
                </Text>
              </View>
              <Text variant="caption" weight="700" color={colors.textSecondary}>
                88% Payout
              </Text>
            </View>

            <View style={styles.rowDivider} />

            <View style={styles.compareItem}>
              <View style={styles.compareTitleBox}>
                <Text variant="h3" style={styles.rowTitle}>
                  VIP Pro Pass (R{MONTHLY_SUBSCRIPTION_PRICE.toFixed(0)}/mo)
                </Text>
                <Text variant="caption" color={colors.textSecondary} style={styles.rowDescription}>
                  Winner receives 100% of match pot • 0% platform rake retained
                </Text>
              </View>
              <Text variant="caption" weight="800" color={colors.accentHover}>
                100% Payout
              </Text>
            </View>

            <View style={styles.rowDivider} />

            {/* 3. VIP PRO PRIVILEGES */}
            <Text variant="label" weight="800" color={colors.textTertiary} style={[styles.sectionHeader, { marginTop: 24 }]}>
              MEMBER PRIVILEGES
            </Text>

            {benefits.map((b, idx) => (
              <React.Fragment key={b.title}>
                <View style={styles.perkRow}>
                  <View style={{ flex: 1 }}>
                    <Text variant="h3" style={styles.rowTitle}>
                      {b.title}
                    </Text>
                    <Text variant="caption" color={colors.textSecondary} style={styles.rowDescription}>
                      {b.desc}
                    </Text>
                  </View>
                </View>
                {idx < benefits.length - 1 && <View style={styles.rowDivider} />}
              </React.Fragment>
            ))}

            <View style={styles.rowDivider} />

            {/* 4. SUBSCRIPTION ACTIONS (Clickable text, zero button divs) */}
            <Text variant="label" weight="800" color={colors.textTertiary} style={[styles.sectionHeader, { marginTop: 24 }]}>
              SUBSCRIPTION ACTION
            </Text>

            {isProcessing ? (
              <View style={styles.processingRow}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: 8 }}>
                  Processing subscription update...
                </Text>
              </View>
            ) : wallet?.isSubscribed ? (
              <View style={styles.actionContainer}>
                <Text variant="body" color={colors.textSecondary} style={styles.actionSubtext}>
                  Your VIP Pro membership is currently active. You keep 100% of all match winnings with 0% platform commission on every duel.
                </Text>

                <TouchableOpacity
                  style={styles.textActionLinkRow}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                >
                  <Text variant="body" weight="700" color="#DC2626">
                    Cancel VIP Pro Subscription →
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.actionContainer}>
                <Text variant="body" color={colors.textSecondary} style={styles.actionSubtext}>
                  Subscription cost: R{MONTHLY_SUBSCRIPTION_PRICE.toFixed(2)} / month. Debited from your available ZAR Match Wallet (Available: R{wallet ? wallet.balance.toFixed(2) : '0.00'}).
                </Text>

                {wallet && wallet.balance < MONTHLY_SUBSCRIPTION_PRICE ? (
                  <View style={styles.insufficientBox}>
                    <Text variant="caption" color={colors.textSecondary} style={{ marginBottom: 6 }}>
                      Your match balance is R{wallet.balance.toFixed(2)}. You need R{MONTHLY_SUBSCRIPTION_PRICE.toFixed(2)} to activate VIP Pro.
                    </Text>
                    <TouchableOpacity
                      style={styles.textActionLinkRow}
                      onPress={() => navigation.navigate('ZarWallet')}
                      activeOpacity={0.7}
                    >
                      <Text variant="body" weight="800" color={colors.accentHover}>
                        Top up ZAR Match Wallet now →
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.textActionLinkRow}
                    onPress={handleSubscribe}
                    activeOpacity={0.7}
                  >
                    <Text variant="body" weight="800" color={colors.accentHover}>
                      Activate VIP Pro Pass (R{MONTHLY_SUBSCRIPTION_PRICE.toFixed(0)}/mo) →
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
  },
  headerBlock: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingBox: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 12,
  },
  statusRow: {
    paddingVertical: 12,
  },
  compareItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  compareTitleBox: {
    flex: 1,
    paddingRight: 16,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  rowDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  perkRow: {
    paddingVertical: 12,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
    marginVertical: 4,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionContainer: {
    paddingVertical: 8,
  },
  actionSubtext: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  insufficientBox: {
    marginTop: 4,
  },
  textActionLinkRow: {
    paddingVertical: 8,
  },
});

export default VipPassScreen;

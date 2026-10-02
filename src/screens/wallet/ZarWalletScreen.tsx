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
  WalletTransaction,
} from '../../services/walletService';
import {
  WalletSvg,
  CheckCircleSvg,
  ChevronRightSvg,
  AlertTriangleSvg,
} from '../../components/common/SvgIcons';

export const ZarWalletScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'balance' | 'transactions'>('balance');
  const [isLoading, setIsLoading] = useState<boolean>(true);
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
      const [walletData, txList] = await Promise.all([
        walletService.getWallet(),
        walletService.getTransactions(),
      ]);
      setWallet(walletData);
      setTransactions(txList);
    } catch {
      // keep fallback
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async (amount: number) => {
    setFeedbackMessage(null);
    try {
      const updated = await walletService.depositFunds(amount);
      setWallet(updated);
      const txList = await walletService.getTransactions();
      setTransactions(txList);
      setFeedbackMessage({
        type: 'success',
        text: `Successfully topped up R${amount.toFixed(2)} to your ZAR Match Wallet.`,
      });
    } catch (e: any) {
      setFeedbackMessage({
        type: 'error',
        text: e?.message || 'Failed to complete deposit.',
      });
    }
  };

  const depositTiers = [
    { amount: 50, label: '+ R50.00 Quick Top-up', desc: 'Standard entry-level duel stake' },
    { amount: 100, label: '+ R100.00 Popular Top-up', desc: 'Sufficient for multiple wagered battles' },
    { amount: 200, label: '+ R200.00 Tournament Top-up', desc: 'High-stakes challenger reserve' },
    { amount: 500, label: '+ R500.00 Champion Top-up', desc: 'Elite arena competitor balance' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <Header
        title="ZAR MATCH WALLET"
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
            Match Ledger & Wallet
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Manage your South African Rand (ZAR) competitive match balance, add funds, and inspect escrow settlements.
          </Text>
        </View>

        {/* Text-Based Switcher (Clickable text, zero button containers) */}
        <View style={styles.textNavRow}>
          <TouchableOpacity
            onPress={() => {
              setActiveTab('balance');
              setFeedbackMessage(null);
            }}
            activeOpacity={0.7}
            style={styles.textNavItem}
          >
            <Text
              variant="body"
              weight={activeTab === 'balance' ? '800' : '600'}
              color={activeTab === 'balance' ? colors.textPrimary : colors.textTertiary}
              style={styles.textNavLabel}
            >
              BALANCE & PLANS
            </Text>
            {activeTab === 'balance' && <View style={styles.activeTextUnderline} />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setActiveTab('transactions');
              setFeedbackMessage(null);
            }}
            activeOpacity={0.7}
            style={styles.textNavItem}
          >
            <Text
              variant="body"
              weight={activeTab === 'transactions' ? '800' : '600'}
              color={activeTab === 'transactions' ? colors.textPrimary : colors.textTertiary}
              style={styles.textNavLabel}
            >
              TRANSACTIONS
            </Text>
            {activeTab === 'transactions' && <View style={styles.activeTextUnderline} />}
          </TouchableOpacity>
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
        ) : activeTab === 'balance' ? (
          <View style={styles.sectionBlock}>
            {/* 1. AVAILABLE MATCH BALANCE (Direct in screen body) */}
            <Text variant="label" weight="800" color={colors.textTertiary} style={styles.sectionHeader}>
              AVAILABLE MATCH BALANCE
            </Text>

            <View style={styles.balanceDisplayRow}>
              <View style={styles.balanceIconWrap}>
                <WalletSvg size={28} color={colors.accent} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text variant="h1" weight="900" color={colors.textPrimary} style={styles.balanceAmountText}>
                  R{wallet ? wallet.balance.toFixed(2) : '0.00'}
                </Text>
                {wallet && wallet.escrowedBalance > 0 ? (
                  <Text variant="caption" weight="600" color={colors.textSecondary} style={{ marginTop: 2 }}>
                    (R{wallet.escrowedBalance.toFixed(2)} in play in active match)
                  </Text>
                ) : (
                  <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                    Ready for competitive match staking
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.rowDivider} />

            {/* 2. TOP-UP PLANS (Clickable text actions, no button divs) */}
            <Text variant="label" weight="800" color={colors.textTertiary} style={[styles.sectionHeader, { marginTop: 24 }]}>
              QUICK TOP-UP PLANS (ZAR)
            </Text>
            <Text variant="caption" color={colors.textSecondary} style={{ marginBottom: 12 }}>
              Tap any top-up plan below to credit your match balance instantly:
            </Text>

            {depositTiers.map((tier, idx) => (
              <React.Fragment key={tier.amount}>
                <TouchableOpacity
                  style={styles.textActionRow}
                  onPress={() => handleDeposit(tier.amount)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowTitleBox}>
                    <Text variant="h3" style={styles.rowTitle}>
                      {tier.label}
                    </Text>
                    <Text variant="caption" color={colors.textSecondary} style={styles.rowDescription}>
                      {tier.desc}
                    </Text>
                  </View>
                  <Text variant="caption" weight="800" color={colors.accentHover} style={styles.clickActionText}>
                    Top Up →
                  </Text>
                </TouchableOpacity>
                {idx < depositTiers.length - 1 && <View style={styles.rowDivider} />}
              </React.Fragment>
            ))}

            <View style={styles.rowDivider} />

            {/* 3. RULES & PLATFORM RAKE POLICIES */}
            <Text variant="label" weight="800" color={colors.textTertiary} style={[styles.sectionHeader, { marginTop: 24 }]}>
              ESCROW & PAYOUT RULES
            </Text>
            <Text variant="body" color={colors.textSecondary} style={styles.infoParagraph}>
              Under standard Pay-As-You-Go, the match winner receives 88% of the total pot, with a 12% platform rake deducted at match conclusion.
            </Text>

            <TouchableOpacity
              style={styles.navLinkRow}
              onPress={() => navigation.navigate('VipPass')}
              activeOpacity={0.7}
            >
              <Text variant="caption" weight="800" color={colors.accentHover}>
                Want 0% platform rake? Learn about VIP Pro Pass →
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.sectionBlock}>
            {/* TRANSACTIONS TAB (Direct in screen body) */}
            <Text variant="label" weight="800" color={colors.textTertiary} style={styles.sectionHeader}>
              TRANSACTION AUDIT LOG
            </Text>

            {transactions.length > 0 ? (
              transactions.map((tx, idx) => (
                <React.Fragment key={tx.id}>
                  <View style={styles.txRow}>
                    <View style={styles.txLeft}>
                      <Text variant="h3" style={styles.rowTitle}>
                        {tx.description}
                      </Text>
                      <Text variant="caption" color={colors.textSecondary} style={styles.rowDescription}>
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text
                      variant="body"
                      weight="800"
                      color={tx.amount > 0 ? colors.accentHover : colors.textPrimary}
                      style={styles.txAmountText}
                    >
                      {tx.amount > 0 ? `+R${tx.amount.toFixed(2)}` : `-R${Math.abs(tx.amount).toFixed(2)}`}
                    </Text>
                  </View>
                  {idx < transactions.length - 1 && <View style={styles.rowDivider} />}
                </React.Fragment>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text variant="body" color={colors.textSecondary}>
                  No recent wallet transactions found.
                </Text>
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
  textNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
  },
  textNavItem: {
    paddingVertical: 10,
    marginRight: 24,
    position: 'relative',
  },
  textNavLabel: {
    fontSize: 13,
    letterSpacing: 0.8,
  },
  activeTextUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.accentHover,
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
  balanceDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  balanceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceAmountText: {
    fontSize: 32,
    letterSpacing: -0.5,
  },
  textActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  rowTitleBox: {
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
  clickActionText: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
    marginVertical: 4,
  },
  infoParagraph: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  navLinkRow: {
    paddingVertical: 8,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  txLeft: {
    flex: 1,
    paddingRight: 16,
  },
  txAmountText: {
    fontSize: 15,
  },
  emptyState: {
    paddingVertical: 24,
  },
});

export default ZarWalletScreen;

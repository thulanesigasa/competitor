import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { WalletSvg, CrownSvg, CheckSvg, AlertTriangleSvg } from '../common/SvgIcons';
import {
  walletService,
  UserWallet,
  WalletTransaction,
  MONTHLY_SUBSCRIPTION_PRICE,
} from '../../services/walletService';

interface WalletSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onBalanceUpdated?: (wallet: UserWallet) => void;
}

export const WalletSubscriptionModal: React.FC<WalletSubscriptionModalProps> = ({
  visible,
  onClose,
  onBalanceUpdated,
}) => {
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'wallet' | 'transactions'>('wallet');
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (visible) {
      loadWalletData();
    }
  }, [visible]);

  const loadWalletData = async () => {
    setIsLoading(true);
    setFeedbackMessage(null);
    try {
      const data = await walletService.getWallet();
      const txs = await walletService.getTransactions();
      setWallet(data);
      setTransactions(txs);
      if (onBalanceUpdated) onBalanceUpdated(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async (amount: number) => {
    setFeedbackMessage(null);
    const updated = await walletService.depositFunds(amount);
    setWallet(updated);
    const txs = await walletService.getTransactions();
    setTransactions(txs);
    setFeedbackMessage({
      type: 'success',
      text: `Successfully topped up R${amount.toFixed(2)} to your wallet balance.`,
    });
    if (onBalanceUpdated) onBalanceUpdated(updated);
  };

  const handleSubscribe = async () => {
    setFeedbackMessage(null);
    const result = await walletService.subscribeMonthly();
    if (result.success) {
      setWallet(result.wallet);
      const txs = await walletService.getTransactions();
      setTransactions(txs);
      setFeedbackMessage({
        type: 'success',
        text: 'Congratulations! You are now a VIP Pro Member. Enjoy 100% pot payouts with 0% platform commission!',
      });
      if (onBalanceUpdated) onBalanceUpdated(result.wallet);
    } else {
      setFeedbackMessage({
        type: 'error',
        text: result.error || 'Failed to activate VIP subscription.',
      });
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.headerTitleBox}>
                  <WalletSvg size={22} color={COLORS.accentHover} strokeWidth={2.2} />
                  <Text style={styles.modalTitle}>WALLET & VIP PASS</Text>
                </View>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={[styles.tabItem, activeTab === 'wallet' && styles.tabItemActive]}
                  onPress={() => setActiveTab('wallet')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabLabel, activeTab === 'wallet' && styles.tabLabelActive]}>
                    BALANCE & PLANS
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabItem, activeTab === 'transactions' && styles.tabItemActive]}
                  onPress={() => setActiveTab('transactions')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabLabel, activeTab === 'transactions' && styles.tabLabelActive]}>
                    TRANSACTIONS
                  </Text>
                </TouchableOpacity>
              </View>

              {feedbackMessage && (
                <View
                  style={[
                    styles.feedbackBanner,
                    feedbackMessage.type === 'error' ? styles.feedbackError : styles.feedbackSuccess,
                  ]}
                >
                  <Text
                    style={[
                      styles.feedbackText,
                      feedbackMessage.type === 'error' ? styles.feedbackTextError : styles.feedbackTextSuccess,
                    ]}
                  >
                    {feedbackMessage.text}
                  </Text>
                </View>
              )}

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.accent} />
                </View>
              ) : activeTab === 'wallet' ? (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
                  {/* Balance Display Card */}
                  <View style={styles.balanceCard}>
                    <Text style={styles.balanceLabel}>AVAILABLE MATCH BALANCE</Text>
                    <Text style={styles.balanceValue}>R{wallet?.balance.toFixed(2) || '0.00'}</Text>
                    {wallet && wallet.escrowedBalance > 0 && (
                      <Text style={styles.escrowNotice}>
                        (R{wallet.escrowedBalance.toFixed(2)} currently escrowed in active battle)
                      </Text>
                    )}

                    <Text style={styles.depositLabel}>QUICK TOP-UP (TEST DEPOSIT)</Text>
                    <View style={styles.topUpRow}>
                      {[50, 100, 200, 500].map((amt) => (
                        <TouchableOpacity
                          key={amt}
                          style={styles.topUpChip}
                          onPress={() => handleDeposit(amt)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.topUpChipText}>+R{amt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* VIP Pro Subscription Card */}
                  <View
                    style={[
                      styles.subscriptionCard,
                      wallet?.isSubscribed && styles.subscriptionCardActive,
                    ]}
                  >
                    <View style={styles.subHeaderRow}>
                      <View style={styles.crownCircle}>
                        <CrownSvg size={20} color={COLORS.accentHover} strokeWidth={2.2} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.subTitle}>VIP PRO PASS</Text>
                        <Text style={styles.subPrice}>R{MONTHLY_SUBSCRIPTION_PRICE.toFixed(2)} / MONTH</Text>
                      </View>
                      {wallet?.isSubscribed && (
                        <View style={styles.activeBadge}>
                          <CheckSvg size={14} color="#FFFFFF" strokeWidth={2.5} />
                          <Text style={styles.activeBadgeText}>ACTIVE</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.subBenefit}>
                      Keep 100% of all battleground pot winnings with 0% platform commission on every duel.
                    </Text>

                    <View style={styles.comparisonBox}>
                      <View style={styles.compareRow}>
                        <Text style={styles.compareKey}>Pay As You Go:</Text>
                        <Text style={styles.compareValue}>88% Winnings (12% Platform Fee)</Text>
                      </View>
                      <View style={styles.compareRow}>
                        <Text style={styles.compareKey}>VIP Pro Pass:</Text>
                        <Text style={[styles.compareValue, { color: COLORS.accentHover, fontWeight: '800' }]}>
                          100% Winnings (0% Platform Fee)
                        </Text>
                      </View>
                    </View>

                    {wallet?.isSubscribed ? (
                      <View style={styles.subscribedStatusBox}>
                        <Text style={styles.subscribedStatusText}>
                          Your VIP pass is active. You keep 100% of all match winnings.
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.subscribeBtn}
                        onPress={handleSubscribe}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.subscribeBtnText}>
                          ACTIVATE VIP PASS (R{MONTHLY_SUBSCRIPTION_PRICE.toFixed(0)}) →
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </ScrollView>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <View key={tx.id} style={styles.txRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.txDesc}>{tx.description}</Text>
                          <Text style={styles.txDate}>
                            {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.txAmount,
                            tx.amount > 0 ? styles.txAmountPositive : styles.txAmountNegative,
                          ]}
                        >
                          {tx.amount > 0 ? `+R${tx.amount.toFixed(2)}` : `-R${Math.abs(tx.amount).toFixed(2)}`}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No recent wallet transactions.</Text>
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
    marginBottom: SPACING.sm,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: COLORS.accentHover,
    fontWeight: '900',
  },
  scrollBody: {
    paddingBottom: SPACING.md,
  },
  loadingContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginVertical: 4,
  },
  escrowNotice: {
    fontSize: 11,
    color: COLORS.accentHover,
    fontWeight: '600',
    marginBottom: 6,
  },
  depositLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 6,
  },
  topUpRow: {
    flexDirection: 'row',
    gap: 8,
  },
  topUpChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.12)',
  },
  topUpChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.accentHover,
  },
  subscriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
  },
  subscriptionCardActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(229, 169, 60, 0.04)',
  },
  subHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  crownCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(229, 169, 60, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  subPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.accentHover,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subBenefit: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  comparisonBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
  },
  compareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  compareKey: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  compareValue: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subscribeBtn: {
    height: 44,
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subscribedStatusBox: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  subscribedStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
    textAlign: 'center',
  },
  feedbackBanner: {
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  feedbackSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  feedbackError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  feedbackText: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
  feedbackTextSuccess: {
    color: '#059669',
  },
  feedbackTextError: {
    color: '#DC2626',
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.06)',
  },
  txDesc: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  txDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '900',
  },
  txAmountPositive: {
    color: '#10B981',
  },
  txAmountNegative: {
    color: COLORS.textPrimary,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});

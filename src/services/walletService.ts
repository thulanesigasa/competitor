import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserWallet {
  balance: number; // Available balance in ZAR
  escrowedBalance: number; // Locked stake during match
  isSubscribed: boolean; // R150/mo subscription status
  isSubscriber?: boolean; // Convenience alias for isSubscribed
  subscriptionExpiry?: string | null; // ISO string
}

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'stake_escrow' | 'stake_refund' | 'win_payout' | 'subscription_fee';
  amount: number;
  description: string;
  timestamp: number;
  potAmount?: number;
  platformFee?: number;
}

const STORAGE_KEYS = {
  WALLET: '@morabaraba_user_wallet',
  TRANSACTIONS: '@morabaraba_wallet_transactions',
};

const DEFAULT_WALLET: UserWallet = {
  balance: 100.0, // Initial testing balance in ZAR
  escrowedBalance: 0.0,
  isSubscribed: false,
  isSubscriber: false,
  subscriptionExpiry: null,
};

export const MONTHLY_SUBSCRIPTION_PRICE = 150.0;
export const PLATFORM_FEE_RATE = 0.12; // 12% platform fee for Pay-As-You-Go
export const WINNER_PAYOUT_RATE = 0.88; // 88% payout for Pay-As-You-Go

export const walletService = {
  /**
   * Retrieves the current user wallet state from persistent storage.
   */
  async getWallet(): Promise<UserWallet> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.WALLET);
      if (!raw) {
        await AsyncStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(DEFAULT_WALLET));
        return DEFAULT_WALLET;
      }
      const parsed = JSON.parse(raw);
      const isSub = typeof parsed.isSubscribed === 'boolean' ? parsed.isSubscribed : false;
      return {
        balance: typeof parsed.balance === 'number' ? parsed.balance : DEFAULT_WALLET.balance,
        escrowedBalance:
          typeof parsed.escrowedBalance === 'number' ? parsed.escrowedBalance : 0,
        isSubscribed: isSub,
        isSubscriber: isSub,
        subscriptionExpiry: parsed.subscriptionExpiry || null,
      };
    } catch {
      return DEFAULT_WALLET;
    }
  },

  listeners: new Set<(wallet: UserWallet) => void>(),

  /**
   * Subscribe to wallet changes in real-time.
   */
  subscribeWallet(listener: (wallet: UserWallet) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },

  /**
   * Saves updated wallet state and notifies listeners.
   */
  async saveWallet(wallet: UserWallet): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(wallet));
      this.listeners.forEach((listener) => {
        try {
          listener(wallet);
        } catch (e) {
          console.error('Error in wallet listener', e);
        }
      });
    } catch (e) {
      console.error('Failed to save wallet', e);
    }
  },

  /**
   * Top up / deposit funds into wallet balance.
   */
  async depositFunds(amount: number): Promise<UserWallet> {
    const wallet = await this.getWallet();
    const updated: UserWallet = {
      ...wallet,
      balance: Math.round((wallet.balance + amount) * 100) / 100,
    };
    await this.saveWallet(updated);
    await this.recordTransaction({
      id: `dep-${Date.now()}`,
      type: 'deposit',
      amount,
      description: `Deposit Top-up (+R${amount.toFixed(2)})`,
      timestamp: Date.now(),
    });
    return updated;
  },

  /**
   * Activate the R150/month VIP Pro Subscription.
   * Enables 100% match winnings with 0% platform rake.
   */
  async subscribeMonthly(): Promise<{ success: boolean; wallet: UserWallet; error?: string }> {
    const wallet = await this.getWallet();
    if (wallet.isSubscribed) {
      return { success: true, wallet };
    }

    if (wallet.balance < MONTHLY_SUBSCRIPTION_PRICE) {
      return {
        success: false,
        wallet,
        error: `Insufficient balance (R${wallet.balance.toFixed(2)}). You need R${MONTHLY_SUBSCRIPTION_PRICE.toFixed(2)} to activate the monthly VIP Pro Pass. Please top up your wallet.`,
      };
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const updated: UserWallet = {
      ...wallet,
      balance: Math.round((wallet.balance - MONTHLY_SUBSCRIPTION_PRICE) * 100) / 100,
      isSubscribed: true,
      subscriptionExpiry: expiryDate.toISOString(),
    };

    await this.saveWallet(updated);
    await this.recordTransaction({
      id: `sub-${Date.now()}`,
      type: 'subscription_fee',
      amount: -MONTHLY_SUBSCRIPTION_PRICE,
      description: 'Monthly VIP Pro Pass Subscription (100% Payout / 0% Platform Fee)',
      timestamp: Date.now(),
    });

    return { success: true, wallet: updated };
  },

  /**
   * Cancel VIP subscription (reverts to Pay-As-You-Go).
   */
  async cancelSubscription(): Promise<UserWallet> {
    const wallet = await this.getWallet();
    const updated: UserWallet = {
      ...wallet,
      isSubscribed: false,
      subscriptionExpiry: null,
    };
    await this.saveWallet(updated);
    return updated;
  },

  /**
   * Lock in / escrow player stake for an active or hosting match.
   */
  async escrowStake(
    stakeAmount: number,
    description?: string
  ): Promise<{ success: boolean; wallet: UserWallet; error?: string }> {
    const wallet = await this.getWallet();
    if (wallet.balance < stakeAmount) {
      return {
        success: false,
        wallet,
        error: `Insufficient balance (R${wallet.balance.toFixed(2)}). You need at least R${stakeAmount.toFixed(2)} to enter this battle.`,
      };
    }

    const updated: UserWallet = {
      ...wallet,
      balance: Math.round((wallet.balance - stakeAmount) * 100) / 100,
      escrowedBalance: Math.round((wallet.escrowedBalance + stakeAmount) * 100) / 100,
    };

    await this.saveWallet(updated);
    await this.recordTransaction({
      id: `escrow-${Date.now()}`,
      type: 'stake_escrow',
      amount: -stakeAmount,
      description: description || `Match Stake Escrowed (R${stakeAmount.toFixed(2)})`,
      timestamp: Date.now(),
    });

    return { success: true, wallet: updated };
  },

  /**
   * Refund escrowed stake if room is cancelled, abandoned, or challenger declined.
   */
  async refundEscrow(stakeAmount: number, description?: string): Promise<UserWallet> {
    const wallet = await this.getWallet();
    const actualRefund = Math.min(wallet.escrowedBalance, stakeAmount);
    const updated: UserWallet = {
      ...wallet,
      balance: Math.round((wallet.balance + actualRefund) * 100) / 100,
      escrowedBalance: Math.max(0, Math.round((wallet.escrowedBalance - actualRefund) * 100) / 100),
    };

    await this.saveWallet(updated);
    if (actualRefund > 0) {
      await this.recordTransaction({
        id: `refund-${Date.now()}`,
        type: 'stake_refund',
        amount: actualRefund,
        description: description || `Stake Refunded (+R${actualRefund.toFixed(2)})`,
        timestamp: Date.now(),
      });
    }

    return updated;
  },

  /**
   * Resolves match payout upon battle conclusion:
   * - Pro Subscribers: 100% of Pot (0% platform rake).
   * - Pay-As-You-Go: 88% of Pot (12% company platform fee).
   * E.g. R5 + R5 = R10 pot -> Winner gets R8.80, Company gets R1.20.
   */
  async resolveMatchPayout(
    paramsOrStake: number | { stakeAmount: number; isWinner: boolean },
    isWinnerArg?: boolean
  ): Promise<{
    payout: number;
    platformFee: number;
    totalPot: number;
    wallet: UserWallet;
    isSubscribed: boolean;
    isSubscriber: boolean;
    netPayout: number;
    rakeAmount: number;
    newBalance: number;
  }> {
    const stakeAmount =
      typeof paramsOrStake === 'number' ? paramsOrStake : paramsOrStake.stakeAmount;
    const isWinner =
      typeof paramsOrStake === 'number' ? Boolean(isWinnerArg) : paramsOrStake.isWinner;

    const wallet = await this.getWallet();
    const totalPot = Math.round(stakeAmount * 2 * 100) / 100;

    // Release escrow
    const nextEscrow = Math.max(
      0,
      Math.round((wallet.escrowedBalance - stakeAmount) * 100) / 100
    );

    if (!isWinner) {
      const updated: UserWallet = {
        ...wallet,
        escrowedBalance: nextEscrow,
      };
      await this.saveWallet(updated);
      return {
        payout: 0,
        platformFee: 0,
        totalPot,
        wallet: updated,
        isSubscribed: updated.isSubscribed,
        isSubscriber: updated.isSubscribed,
        netPayout: 0,
        rakeAmount: 0,
        newBalance: updated.balance,
      };
    }

    let payout = 0;
    let platformFee = 0;

    if (wallet.isSubscribed) {
      // 100% payout to subscriber
      payout = totalPot;
      platformFee = 0;
    } else {
      // Pay-As-You-Go: 88% winner, 12% company commission
      platformFee = Math.round(totalPot * PLATFORM_FEE_RATE * 100) / 100;
      payout = Math.round((totalPot - platformFee) * 100) / 100;
    }

    const updated: UserWallet = {
      ...wallet,
      balance: Math.round((wallet.balance + payout) * 100) / 100,
      escrowedBalance: nextEscrow,
    };

    await this.saveWallet(updated);
    await this.recordTransaction({
      id: `payout-${Date.now()}`,
      type: 'win_payout',
      amount: payout,
      description: wallet.isSubscribed
        ? `Match Victory Payout (+R${payout.toFixed(2)}) - 100% Pro Pass Pot`
        : `Match Victory Payout (+R${payout.toFixed(2)}) - Pay As You Go (Pot: R${totalPot.toFixed(2)}, Fee: R${platformFee.toFixed(2)})`,
      timestamp: Date.now(),
      potAmount: totalPot,
      platformFee,
    });

    return {
      payout,
      platformFee,
      totalPot,
      wallet: updated,
      isSubscribed: updated.isSubscribed,
      isSubscriber: updated.isSubscribed,
      netPayout: payout,
      rakeAmount: platformFee,
      newBalance: updated.balance,
    };
  },

  /**
   * Retrieves transaction history.
   */
  async getTransactions(): Promise<WalletTransaction[]> {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  /**
   * Records a transaction in local history.
   */
  async recordTransaction(tx: WalletTransaction): Promise<void> {
    try {
      const current = await this.getTransactions();
      const updated = [tx, ...current.slice(0, 49)]; // Keep last 50
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to record transaction', e);
    }
  },
};

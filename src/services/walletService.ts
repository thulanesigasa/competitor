import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionSecurityService } from './sessionSecurityService';

export interface UserWallet {
  balance: number; // Purged (always 0)
  escrowedBalance: number; // Purged (always 0)
  isSubscribed: boolean; // R150/mo VIP Pro Pass status
  isSubscriber?: boolean; // Convenience alias
  subscriptionExpiry?: string | null; // ISO string
}

export interface VipSubscriptionInfo {
  isVipPro: boolean;
  expiryDate: string | null;
  formattedExpiry: string;
  monthlyPriceZar: number;
  eligibleForTop8CashPrizes: boolean;
}

const STORAGE_KEYS = {
  WALLET: '@morabaraba_user_wallet_v2',
  SUBSCRIPTION: '@morabaraba_vip_subscription_v2',
};

const DEFAULT_WALLET: UserWallet = {
  balance: 0.0,
  escrowedBalance: 0.0,
  isSubscribed: false,
  isSubscriber: false,
  subscriptionExpiry: null,
};

export const MONTHLY_SUBSCRIPTION_PRICE = 150.0;

export const walletService = {
  listeners: new Set<(wallet: UserWallet) => void>(),

  /**
   * Retrieves the current user VIP Pro subscription state.
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
        balance: 0.0, // ZAR match wallet balance purged
        escrowedBalance: 0.0, // Match escrow purged
        isSubscribed: isSub,
        isSubscriber: isSub,
        subscriptionExpiry: parsed.subscriptionExpiry || null,
      };
    } catch {
      return DEFAULT_WALLET;
    }
  },

  /**
   * Subscribe to VIP Pro status changes in real-time.
   */
  subscribeWallet(listener: (wallet: UserWallet) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  },

  /**
   * Saves updated subscription state and notifies listeners.
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
   * Subscribes user to the VIP Pro Tournament Pass (R150/month).
   * Grants Top 8 weekly cash prize eligibility.
   */
  async subscribeMonthly(): Promise<{ success: boolean; wallet: UserWallet; error?: string }> {
    try {
      const current = await this.getWallet();
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);

      const updated: UserWallet = {
        ...current,
        balance: 0.0,
        escrowedBalance: 0.0,
        isSubscribed: true,
        isSubscriber: true,
        subscriptionExpiry: expiry.toISOString(),
      };

      await this.saveWallet(updated);
      await SessionSecurityService.recordAuditEvent(
        'DATA_EXPORT_JSON',
        'VIP Pro Tournament Pass activated (30-day cycle). Eligible for Top 8 cash prizes.'
      );

      return { success: true, wallet: updated };
    } catch (err: any) {
      return { success: false, wallet: DEFAULT_WALLET, error: err?.message || 'Subscription failed' };
    }
  },

  /**
   * Cancels VIP Pro Pass auto-renewal.
   */
  async cancelSubscription(): Promise<UserWallet> {
    const current = await this.getWallet();
    const updated: UserWallet = {
      ...current,
      isSubscribed: false,
      isSubscriber: false,
      subscriptionExpiry: null,
    };
    await this.saveWallet(updated);
    return updated;
  },

  /**
   * Convenient toggle for developer / QA staging to switch between Free and VIP Pro.
   */
  async toggleVipStatus(): Promise<UserWallet> {
    const current = await this.getWallet();
    if (current.isSubscribed) {
      return await this.cancelSubscription();
    } else {
      const res = await this.subscribeMonthly();
      return res.wallet;
    }
  },

  /**
   * Legacy stub methods to ensure complete backward-compatibility while wagering is purged.
   */
  async escrowStake(_stake: number, _desc: string): Promise<boolean> {
    return true; // Match wagering purged; entry is always approved
  },

  async refundEscrow(_amount: number, _desc: string): Promise<UserWallet> {
    return await this.getWallet();
  },

  async resolveMatchPayout(_stake: number, _isWinner: boolean): Promise<any> {
    return { winnerPayout: 0, platformFee: 0, isVip: false };
  },

  async getTransactions(): Promise<any[]> {
    return [];
  },

  async depositFunds(_amount: number): Promise<UserWallet> {
    return await this.getWallet();
  },
};

export default walletService;

import React, { useState, useEffect } from 'react';
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
import { useThemedAlert } from '../../components/common/ThemedAlert';
import { UserProfile } from '../../types/auth';
import { UserCareerStats } from '../../types/game';
import {
  clearUserProfile,
  getCareerStats,
  getUserProfile,
} from '../../store/gameStore';
import { authService } from '../../services/authService';
import { getRankFromStats, RANK_TIERS } from '../../constants/ranks';

interface ProfileScreenProps {
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout }) => {
  const { showAlert } = useThemedAlert();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserCareerStats | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const liveProfile = await authService.getCurrentProfile();
    const profile = liveProfile || (await getUserProfile());
    const career = await getCareerStats();
    setUser(profile);
    setStats(career);
  };

  const handleLogout = () => {
    showAlert({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of this competitor profile?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await authService.signOut();
            await clearUserProfile();
            onLogout();
          },
        },
      ],
    });
  };

  const winRate =
    stats && stats.gamesPlayed > 0
      ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
      : 0;

  const rankInfo = getRankFromStats(
    winRate,
    stats?.gamesWon || 0,
    stats?.gamesPlayed || 0
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="GAMER PROFILE"
        rightActionLabel="Sign Out"
        onRightAction={handleLogout}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header (Direct Body Canvas) */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {user?.gamerTag ? user.gamerTag.charAt(0).toUpperCase() : 'M'}
            </Text>
          </View>
          <Text style={styles.gamerTag}>{user?.gamerTag || 'Competitor'}</Text>
          <Text style={styles.fullName}>
            {user?.name || 'Local'} {user?.surname || 'Competitor'}
          </Text>
          <Text style={styles.location}>
            {user?.town ? `${user.town}, ` : ''}{user?.province || 'Gauteng'} •{' '}
            {user?.country || 'South Africa'}
          </Text>

          <View style={[styles.rankChip, { borderColor: rankInfo.badgeColor }]}>
            <Text style={[styles.rankChipText, { color: rankInfo.badgeColor }]}>
              TIER {rankInfo.tier}: {rankInfo.title.toUpperCase()} ({rankInfo.culturalTitle.toUpperCase()})
            </Text>
          </View>
        </View>

        {/* Career Stats Grid (Direct Body Metrics) */}
        <Text style={styles.sectionTitle}>CAREER PERFORMANCE</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats?.gamesPlayed || 0}</Text>
            <Text style={styles.statLabel}>MATCHES</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats?.gamesWon || 0}</Text>
            <Text style={styles.statLabel}>VICTORIES</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{winRate}%</Text>
            <Text style={styles.statLabel}>WIN RATE</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats?.millsFormed || 0}</Text>
            <Text style={styles.statLabel}>MILLS FORMED</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats?.cowsCaptured || 0}</Text>
            <Text style={styles.statLabel}>COWS CAPTURED</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats?.winStreak || 0}</Text>
            <Text style={styles.statLabel}>WIN STREAK</Text>
          </View>
        </View>

        {/* Identity Details (Direct Body Rows) */}
        <Text style={styles.sectionTitle}>GAMER DETAILS</Text>
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Email</Text>
            <Text style={styles.detailValue}>{user?.email || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Cellphone</Text>
            <Text style={styles.detailValue}>{user?.cellphone || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Date of Birth</Text>
            <Text style={styles.detailValue}>{user?.dob || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Region Code</Text>
            <Text style={styles.detailValue}>{user?.countryCode || 'ZA'}</Text>
          </View>
        </View>

        {/* 10-Tier Rank Progression */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>
          SOUTHERN AFRICAN RANK TIERS (10 TIERS)
        </Text>
        <View style={styles.tiersContainer}>
          {RANK_TIERS.map((tier) => {
            const isCurrent = rankInfo.tier === tier.tier;
            return (
              <View
                key={tier.tier}
                style={[
                  styles.tierRow,
                  isCurrent && styles.tierRowCurrent,
                ]}
              >
                <View style={styles.tierLeft}>
                  <Text style={[styles.tierNumber, isCurrent && { color: COLORS.accent }]}>
                    #{tier.tier}
                  </Text>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={[styles.tierTitle, isCurrent && { color: COLORS.accent }]}>
                      {tier.title} ({tier.culturalTitle})
                    </Text>
                    <Text style={styles.tierDesc}>{tier.description}</Text>
                  </View>
                </View>
                <Text style={[styles.tierReq, isCurrent && { color: COLORS.accent, fontWeight: '800' }]}>
                  {tier.minWinRate}% WR
                </Text>
              </View>
            );
          })}
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
    marginBottom: SPACING.lg,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  avatarInitial: {
    color: COLORS.accentHover,
    fontSize: 28,
    fontWeight: '900',
  },
  gamerTag: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  fullName: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  location: {
    color: COLORS.accentHover,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  eloText: {
    marginTop: 8,
    color: COLORS.accentHover,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    paddingVertical: SPACING.sm,
  },
  statBox: {
    width: '33.33%',
    paddingVertical: 10,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.accentHover,
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
  },
  detailsSection: {
    paddingVertical: SPACING.xs,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
  },
  detailKey: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  detailValue: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  rankChip: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  rankChipText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  tiersContainer: {
    borderTopWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
  },
  tierRowCurrent: {
    backgroundColor: 'rgba(229, 169, 60, 0.08)',
    paddingHorizontal: 6,
  },
  tierLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  tierNumber: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textMuted,
    width: 24,
  },
  tierTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  tierDesc: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  tierReq: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

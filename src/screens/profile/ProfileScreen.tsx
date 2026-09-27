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
    const profile = await getUserProfile();
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
          <Text style={styles.gamerTag}>{user?.gamerTag || 'Morabaraba Warrior'}</Text>
          <Text style={styles.fullName}>
            {user?.name || 'Local'} {user?.surname || 'Competitor'}
          </Text>
          <Text style={styles.location}>
            {user?.town || 'Johannesburg'}, {user?.province || 'Gauteng'} •{' '}
            {user?.country || 'South Africa'}
          </Text>
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
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
import { getRankFromStats } from '../../constants/ranks';
import {
  ChevronRightSvg,
  EditSvg,
  MapPinSvg,
  ShieldSvg,
  LockSvg,
  DownloadSvg,
  SmartphoneSvg,
  TrashSvg,
  FileTextSvg,
  BlockSvg,
} from '../../components/common/SvgIcons';
import { PrivacyService, DesiredChallengeRegion } from '../../services/privacyService';
import { SOUTHERN_AFRICAN_COUNTRIES } from '../../constants/regions';

interface ProfileScreenProps {
  navigation?: any;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation: navProp, onLogout }) => {
  const localNavigation = useNavigation<any>();
  const navigation = navProp || localNavigation;
  const { showAlert } = useThemedAlert();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserCareerStats | null>(null);
  const [desiredRegion, setDesiredRegion] = useState<DesiredChallengeRegion>({
    province: 'Gauteng',
    town: 'Johannesburg',
  });

  // Edit Modals State
  const [editTagVisible, setEditTagVisible] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isSavingTag, setIsSavingTag] = useState(false);

  const [editRegionVisible, setEditRegionVisible] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('Gauteng');
  const [selectedTown, setSelectedTown] = useState('Johannesburg');
  const [isSavingRegion, setIsSavingRegion] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const liveProfile = await authService.getCurrentProfile();
    const profile = liveProfile || (await getUserProfile());
    const career = await getCareerStats();
    const region = await PrivacyService.getDesiredChallengeRegion();

    setUser(profile);
    setStats(career);
    setDesiredRegion(region);
    setSelectedProvince(region.province);
    setSelectedTown(region.town);
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

  const handleOpenEditTag = () => {
    setNewTagInput(user?.gamerTag || '');
    setEditTagVisible(true);
  };

  const handleSaveGamerTag = async () => {
    const tag = newTagInput.trim();
    if (tag.length < 3) {
      showAlert({
        title: 'Invalid Tag',
        message: 'Gamer tag must be at least 3 characters.',
      });
      return;
    }

    setIsSavingTag(true);
    const res = await authService.updateGamerTag(tag);
    setIsSavingTag(false);

    if (res.success) {
      setEditTagVisible(false);
      await loadProfile();
      showAlert({
        title: 'Tag Updated',
        message: `Your public gamer tag is now @${tag}.`,
      });
    } else {
      showAlert({
        title: 'Update Error',
        message: res.error || 'Failed to update gamer tag.',
      });
    }
  };

  const handleOpenEditRegion = () => {
    setSelectedProvince(desiredRegion.province);
    setSelectedTown(desiredRegion.town);
    setEditRegionVisible(true);
  };

  const handleSaveChallengeRegion = async () => {
    setIsSavingRegion(true);
    await PrivacyService.setDesiredChallengeRegion({
      province: selectedProvince,
      town: selectedTown,
    });
    setDesiredRegion({ province: selectedProvince, town: selectedTown });
    setIsSavingRegion(false);
    setEditRegionVisible(false);
    showAlert({
      title: 'Challenge Arena Updated',
      message: `Your preferred matchmaking location is now set to ${selectedTown}, ${selectedProvince}.`,
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

  // Available provinces and towns for South Africa
  const saCountry = SOUTHERN_AFRICAN_COUNTRIES.find((c) => c.code === 'ZA') || SOUTHERN_AFRICAN_COUNTRIES[0];
  const activeProvinceObj =
    saCountry.provinces.find((p) => p.name === selectedProvince) || saCountry.provinces[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="GAMER PROFILE"
        rightActionLabel="Sign Out"
        onRightAction={handleLogout}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header (Direct Body Canvas) */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {user?.gamerTag ? user.gamerTag.charAt(0).toUpperCase() : 'M'}
            </Text>
          </View>
          <Text style={styles.gamerTag}>@{user?.gamerTag || 'Competitor'}</Text>
          <Text style={styles.fullName}>
            {user?.name || 'Local'} {user?.surname || 'Competitor'}
          </Text>
          <Text style={styles.location}>
            {user?.town ? `${user.town}, ` : ''}{user?.province || 'Gauteng'} •{' '}
            {user?.country || 'South Africa'}
          </Text>

          <Text style={styles.rankTitleOrange}>
            {rankInfo.title}
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

        {/* Identity Details */}
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


        {/* ================================================================ */}
        {/* ALL SETTINGS DIRECTLY IN THE SCREEN BODY (ZERO ENCLOSING DIVS)    */}
        {/* ================================================================ */}

        {/* 1. PREFERENCES & CHALLENGE ARENA */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.xl }]}>
          PREFERENCES & CHALLENGE ARENA
        </Text>
        <View style={styles.settingsSection}>
          {/* Edit User Tag */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleOpenEditTag}
            activeOpacity={0.75}
          >
            <View style={styles.rowTitleBox}>
              <Text style={styles.rowTitle}>Gamer Tag</Text>
              <Text style={styles.rowSubtitle}>
                @{user?.gamerTag || 'Competitor'} • Tap to customize your handle
              </Text>
            </View>
            <EditSvg size={16} color={COLORS.accentHover} strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          {/* Target Challenge Location */}
          <TouchableOpacity
            style={styles.actionRow}
            onPress={handleOpenEditRegion}
            activeOpacity={0.75}
          >
            <View style={styles.rowTitleBox}>
              <Text style={styles.rowTitle}>Target Challenge Arena</Text>
              <Text style={styles.rowSubtitle}>
                {desiredRegion.town}, {desiredRegion.province} • Regional battleground preference
              </Text>
            </View>
            <MapPinSvg size={16} color={COLORS.accentHover} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* 2. PRIVACY & SAFETY */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>
          PRIVACY & SAFETY
        </Text>
        <View style={styles.settingsSection}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('Privacy')}
            activeOpacity={0.75}
          >
            <View style={styles.rowTitleBox}>
              <Text style={styles.rowTitle}>Privacy Settings</Text>
              <Text style={styles.rowSubtitle}>
                Incognito matchmaking, leaderboard discoverability, stats visibility
              </Text>
            </View>
            <ChevronRightSvg size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('BlockedUsers')}
            activeOpacity={0.75}
          >
            <View style={styles.rowTitleBox}>
              <Text style={styles.rowTitle}>Blocked Competitors</Text>
              <Text style={styles.rowSubtitle}>
                Restricted players blocked from challenging you
              </Text>
            </View>
            <ChevronRightSvg size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* 3. SAFETY & SECURITY */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>
          SAFETY & SECURITY
        </Text>
        <View style={styles.settingsSection}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('Security')}
            activeOpacity={0.75}
          >
            <View style={styles.rowTitleBox}>
              <Text style={styles.rowTitle}>Terminal Security Controls</Text>
              <Text style={styles.rowSubtitle}>
                Inactivity lock, 4-digit PIN, fingerprint unlock, app switcher shield
              </Text>
            </View>
            <ChevronRightSvg size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* 4. DATA & ACCOUNT */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>
          DATA & ACCOUNT
        </Text>
        <View style={styles.settingsSection}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('ExportData')}
            activeOpacity={0.75}
          >
            <View style={styles.rowTitleBox}>
              <Text style={styles.rowTitle}>Export Career Data</Text>
              <Text style={styles.rowSubtitle}>
                Hardware-encrypted (AES-256-CBC) backup & standard JSON
              </Text>
            </View>
            <ChevronRightSvg size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('DeviceSessions')}
            activeOpacity={0.75}
          >
            <View style={styles.rowTitleBox}>
              <Text style={styles.rowTitle}>Device Sessions & Security Audit</Text>
              <Text style={styles.rowSubtitle}>
                Active terminal hardware authorizations and event trail
              </Text>
            </View>
            <ChevronRightSvg size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('DeleteAccount')}
            activeOpacity={0.75}
          >
            <View style={styles.rowTitleBox}>
              <Text style={[styles.rowTitle, { color: '#DC2626' }]}>
                Delete Account & Purge Data
              </Text>
              <Text style={styles.rowSubtitle}>
                POPIA / GDPR irreversible deletion of records
              </Text>
            </View>
            <ChevronRightSvg size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* 5. LEGAL & FAIR PLAY */}
        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg }]}>
          LEGAL & FAIR PLAY
        </Text>
        <View style={styles.settingsSection}>
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('PrivacyPolicy')}
            activeOpacity={0.75}
          >
            <View style={styles.rowTitleBox}>
              <Text style={styles.rowTitle}>Privacy Policy</Text>
              <Text style={styles.rowSubtitle}>
                Security telemetry & player data protection • Version 1.0.3
              </Text>
            </View>
            <ChevronRightSvg size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => navigation.navigate('TermsOfService')}
            activeOpacity={0.75}
          >
            <View style={styles.rowTitleBox}>
              <Text style={styles.rowTitle}>Terms of Service</Text>
              <Text style={styles.rowSubtitle}>
                Traditional Morabaraba rules, anti-cheating & ranking sportsmanship
              </Text>
            </View>
            <ChevronRightSvg size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal: Edit Gamer Tag */}
      <Modal
        visible={editTagVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditTagVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Gamer Tag</Text>
            <Text style={styles.modalSubtitle}>
              Choose a unique handle for live battleground rooms and leaderboards.
            </Text>

            <TextInput
              style={styles.tagInput}
              value={newTagInput}
              onChangeText={setNewTagInput}
              placeholder="e.g. ParamountEagle"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditTagVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveGamerTag}
                disabled={isSavingTag}
                activeOpacity={0.8}
              >
                {isSavingTag ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Tag</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Edit Challenge Arena Region */}
      <Modal
        visible={editRegionVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditRegionVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <Text style={styles.modalTitle}>Target Challenge Arena</Text>
            <Text style={styles.modalSubtitle}>
              Select the region you wish to challenge competitors in. This is separate from your residential location.
            </Text>

            <Text style={styles.pickerLabel}>SELECT PROVINCE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
              {saCountry.provinces.map((prov) => {
                const isSelected = selectedProvince === prov.name;
                return (
                  <TouchableOpacity
                    key={prov.name}
                    style={[styles.pill, isSelected && styles.pillActive]}
                    onPress={() => {
                      setSelectedProvince(prov.name);
                      setSelectedTown(prov.towns[0]);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      {prov.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={[styles.pickerLabel, { marginTop: 14 }]}>SELECT TOWN / CITY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsScroll}>
              {activeProvinceObj.towns.map((town) => {
                const isSelected = selectedTown === town;
                return (
                  <TouchableOpacity
                    key={town}
                    style={[styles.pill, isSelected && styles.pillActive]}
                    onPress={() => setSelectedTown(town)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      {town}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={[styles.modalBtnRow, { marginTop: 24 }]}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditRegionVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveChallengeRegion}
                disabled={isSavingRegion}
                activeOpacity={0.8}
              >
                {isSavingRegion ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Update Arena</Text>
                )}
              </TouchableOpacity>
            </View>
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
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  rankTitleOrange: {
    color: COLORS.accentHover,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 4,
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
  settingsSection: {
    borderTopWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  actionRow: {
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
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 8,
  },
  modalContentLarge: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 16,
  },
  tagInput: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.15)',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  pillsScroll: {
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ProfileScreen;

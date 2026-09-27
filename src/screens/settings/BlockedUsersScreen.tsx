import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Text } from '../../components/Typography';
import { Header } from '../../components/common/Header';
import { BlockSvg, CheckSvg } from '../../components/common/SvgIcons';
import { PrivacyService, BlockedCompetitor } from '../../services/privacyService';
import { useThemedAlert } from '../../components/common/ThemedAlert';

export const BlockedUsersScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedCompetitor[]>([]);
  const [newTagInput, setNewTagInput] = useState<string>('');
  const { showAlert } = useThemedAlert();

  useEffect(() => {
    loadBlocked();
  }, []);

  const loadBlocked = async () => {
    const list = await PrivacyService.getBlockedCompetitors();
    setBlockedUsers(list);
  };

  const handleUnblock = async (id: string, tag: string) => {
    showAlert({
      title: 'Unblock Competitor',
      message: `Are you sure you want to unblock @${tag}? They will be able to challenge you in public rooms again.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          style: 'default',
          onPress: async () => {
            await PrivacyService.unblockCompetitor(id);
            await loadBlocked();
          },
        },
      ],
    });
  };

  const handleAddBlock = async () => {
    const tag = newTagInput.trim().replace(/^@/, '');
    if (!tag) {
      showAlert({
        title: 'Gamer Tag Required',
        message: 'Please enter the gamer tag of the competitor you wish to restrict.',
      });
      return;
    }

    const syntheticId = 'usr_' + Math.random().toString(36).substring(2, 10);
    await PrivacyService.blockCompetitor(syntheticId, tag);
    setNewTagInput('');
    await loadBlocked();
    showAlert({
      title: 'Competitor Restricted',
      message: `@${tag} has been added to your blocked list.`,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <Header
        title="BLOCKED COMPETITORS"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        <View style={styles.introHeader}>
          <Text variant="body" color={colors.textSecondary} style={styles.leadParagraph}>
            Blocked competitors cannot challenge you to live Morabaraba matches or join your hosted public rooms.
          </Text>
        </View>

        {/* Quick Block Input */}
        <View style={styles.addSection}>
          <Text variant="label" weight="800" color={colors.textTertiary} style={styles.sectionHeader}>
            RESTRICT A COMPETITOR
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={newTagInput}
              onChangeText={setNewTagInput}
              placeholder="Enter gamer tag (e.g. EagleWarrior)"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.blockBtn}
              onPress={handleAddBlock}
              activeOpacity={0.8}
            >
              <Text variant="caption" weight="700" color="#FFFFFF">
                Block
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Blocked List */}
        <View style={styles.bodySection}>
          <Text variant="label" weight="800" color={colors.textTertiary} style={styles.sectionHeader}>
            BLOCKED ACCOUNTS ({blockedUsers.length})
          </Text>

          {blockedUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text variant="h3" weight="800" color={colors.textPrimary} style={styles.emptyTitle}>
                No Blocked Competitors
              </Text>
              <Text variant="body" color={colors.textSecondary} style={styles.emptySubtitle}>
                Your challenge arena is open to all competitors across Southern Africa.
              </Text>
            </View>
          ) : (
            blockedUsers.map((item, index) => (
              <View key={item.id}>
                <View style={styles.userRow}>
                  <View style={styles.userInfo}>
                    <View style={styles.avatarPlaceholder}>
                      <BlockSvg size={16} color="#64748B" strokeWidth={2} />
                    </View>
                    <View style={styles.nameBlock}>
                      <Text variant="h3" style={styles.userName}>
                        @{item.gamerTag}
                      </Text>
                      <Text variant="caption" color={colors.textSecondary}>
                        Restricted from live matchmaking
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.unblockButton}
                    onPress={() => handleUnblock(item.id, item.gamerTag)}
                    activeOpacity={0.8}
                  >
                    <Text variant="caption" weight="700" color="#0F172A">
                      Unblock
                    </Text>
                  </TouchableOpacity>
                </View>
                {index < blockedUsers.length - 1 && <View style={styles.rowDivider} />}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 48,
  },
  introHeader: {
    marginBottom: 24,
  },
  leadParagraph: {
    fontSize: 14,
    lineHeight: 20,
  },
  addSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#0F172A',
  },
  blockBtn: {
    height: 48,
    paddingHorizontal: 20,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodySection: {
    marginBottom: 24,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameBlock: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  unblockButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.15)',
    backgroundColor: '#FFFFFF',
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
  },
});

export default BlockedUsersScreen;

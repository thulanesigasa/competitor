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
import { SOUTHERN_AFRICAN_COUNTRIES } from '../../constants/regions';
import { PrivacyService } from '../../services/privacyService';
import { CheckCircleSvg, AlertTriangleSvg } from '../../components/common/SvgIcons';

export const ChallengeArenaScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedProvince, setSelectedProvince] = useState<string>('Gauteng');
  const [selectedTown, setSelectedTown] = useState<string>('Johannesburg');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const saCountry =
    SOUTHERN_AFRICAN_COUNTRIES.find((c) => c.code === 'ZA') || SOUTHERN_AFRICAN_COUNTRIES[0];
  const activeProvinceObj =
    saCountry.provinces.find((p) => p.name === selectedProvince) || saCountry.provinces[0];

  useEffect(() => {
    loadCurrentArena();
  }, []);

  const loadCurrentArena = async () => {
    setIsLoading(true);
    try {
      const region = await PrivacyService.getDesiredChallengeRegion();
      setSelectedProvince(region.province);
      setSelectedTown(region.town);
    } catch {
      // fallback defaults
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveArena = async () => {
    setFeedbackMessage(null);
    setIsSaving(true);
    try {
      await PrivacyService.setDesiredChallengeRegion({
        province: selectedProvince,
        town: selectedTown,
      });
      setFeedbackMessage({
        type: 'success',
        text: `Target Challenge Arena successfully updated to ${selectedTown}, ${selectedProvince}.`,
      });
    } catch (e: any) {
      setFeedbackMessage({
        type: 'error',
        text: e?.message || 'Failed to update challenge arena location.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <Header
        title="TARGET CHALLENGE ARENA"
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
            Arena Matchmaking Preference
          </Text>
          <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Configure the Southern African regional battleground territory where you seek challengers. This preference operates independently from your residential address.
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
          <>
            {/* 1. CURRENT SELECTION (Part of the body, zero card divs) */}
            <View style={styles.sectionBlock}>
              <Text variant="label" weight="800" color={colors.textTertiary} style={styles.sectionHeader}>
                ACTIVE REGIONAL SETTING
              </Text>
              <Text variant="h3" style={styles.rowTitle}>
                {selectedTown}, {selectedProvince}
              </Text>
              <Text variant="caption" color={colors.textSecondary}>
                Opponents within this regional territory receive priority queueing in casual and high-stakes duels.
              </Text>
            </View>

            <View style={styles.rowDivider} />

            {/* 2. PROVINCE SELECTOR */}
            <View style={styles.sectionBlock}>
              <Text variant="label" weight="800" color={colors.textTertiary} style={styles.sectionHeader}>
                SELECT PROVINCE
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={{ marginBottom: 12 }}>
                Tap a province below to configure your target battleground:
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.provinceScroll}
              >
                {saCountry.provinces.map((prov) => {
                  const isSelected = selectedProvince === prov.name;
                  return (
                    <TouchableOpacity
                      key={prov.name}
                      style={styles.provinceChip}
                      onPress={() => {
                        setSelectedProvince(prov.name);
                        setSelectedTown(prov.towns[0]);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        variant="body"
                        weight={isSelected ? '800' : '500'}
                        color={isSelected ? colors.textPrimary : colors.textSecondary}
                        style={styles.provinceChipText}
                      >
                        {prov.name}
                      </Text>
                      {isSelected && <View style={styles.activeTextUnderline} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.rowDivider} />

            {/* 3. TOWN / CITY SELECTOR */}
            <View style={styles.sectionBlock}>
              <Text variant="label" weight="800" color={colors.textTertiary} style={styles.sectionHeader}>
                SELECT TOWN / CITY
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={{ marginBottom: 12 }}>
                Regional arena hubs within {selectedProvince}:
              </Text>

              <View style={styles.townsList}>
                {activeProvinceObj.towns.map((town, idx) => {
                  const isSelected = selectedTown === town;
                  return (
                    <React.Fragment key={town}>
                      <TouchableOpacity
                        style={styles.townRow}
                        onPress={() => setSelectedTown(town)}
                        activeOpacity={0.7}
                      >
                        <Text
                          variant="body"
                          weight={isSelected ? '800' : '500'}
                          color={isSelected ? colors.textPrimary : colors.textSecondary}
                        >
                          {town}
                        </Text>
                        {isSelected && (
                          <Text variant="caption" weight="800" color={colors.accentHover}>
                            Selected ✓
                          </Text>
                        )}
                      </TouchableOpacity>
                      {idx < activeProvinceObj.towns.length - 1 && <View style={styles.rowDivider} />}
                    </React.Fragment>
                  );
                })}
              </View>
            </View>

            <View style={styles.rowDivider} />

            {/* 4. UPDATE ACTION (Clickable text, zero button divs) */}
            <View style={styles.sectionBlock}>
              <Text variant="label" weight="800" color={colors.textTertiary} style={styles.sectionHeader}>
                CONFIRMATION
              </Text>
              <Text variant="caption" color={colors.textSecondary} style={{ marginBottom: 12 }}>
                Apply your selected town and province as the primary battleground search preference:
              </Text>

              <TouchableOpacity
                style={styles.textActionLinkRow}
                onPress={handleSaveArena}
                activeOpacity={0.7}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                  <Text variant="body" weight="800" color={colors.accentHover}>
                    Update Arena →
                  </Text>
                )}
              </TouchableOpacity>
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
    paddingVertical: 12,
  },
  sectionHeader: {
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
    marginVertical: 8,
  },
  provinceScroll: {
    paddingVertical: 4,
  },
  provinceChip: {
    paddingVertical: 8,
    marginRight: 20,
    position: 'relative',
  },
  provinceChipText: {
    fontSize: 14,
  },
  activeTextUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.accentHover,
  },
  townsList: {
    paddingTop: 4,
  },
  townRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  textActionLinkRow: {
    paddingVertical: 8,
  },
});

export default ChallengeArenaScreen;

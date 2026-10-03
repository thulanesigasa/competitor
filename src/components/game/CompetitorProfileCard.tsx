import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../Typography';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme';
import { CompetitorProfile } from '../../types/game';
import { getRankFromStats } from '../../constants/ranks';

interface CompetitorProfileCardProps {
  profile: CompetitorProfile;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  isActionLoading?: boolean;
}

export const CompetitorProfileCard: React.FC<CompetitorProfileCardProps> = ({
  profile,
  subtitle,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  isActionLoading = false,
}) => {
  const rankInfo = getRankFromStats(
    profile.winRate,
    profile.wins,
    profile.matchesPlayed
  );
  const displayTitle = rankInfo.title.toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          <Text variant="h3" weight="900" color="#FFFFFF">
            {profile.gamerTag.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.infoCol}>
          <View style={styles.tagRow}>
            <Text variant="h3" weight="900" color={colors.textPrimary}>
              {profile.gamerTag}
            </Text>
            <View style={[styles.titleChip, { borderColor: rankInfo.badgeColor }]}>
              <Text variant="caption" weight="800" color={rankInfo.badgeColor}>
                {displayTitle}
              </Text>
            </View>
          </View>

          <Text variant="caption" color={colors.textSecondary} style={styles.locationText}>
            {profile.country} • {profile.province} {profile.town ? `(${profile.town})` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.statsDivider} />

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text variant="caption" color={colors.textSecondary}>WIN RATE</Text>
          <Text variant="body" weight="800" color={colors.textPrimary}>
            {profile.winRate}%
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text variant="caption" color={colors.textSecondary}>VICTORIES</Text>
          <Text variant="body" weight="800" color={colors.textPrimary}>
            {profile.wins}
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text variant="caption" color={colors.textSecondary}>TOTAL MATCHES</Text>
          <Text variant="body" weight="800" color={colors.textPrimary}>
            {profile.matchesPlayed}
          </Text>
        </View>
      </View>


      {subtitle && (
        <Text variant="caption" color={colors.textSecondary} style={styles.customSubtitle}>
          {subtitle}
        </Text>
      )}

      {(actionLabel || secondaryActionLabel) && (
        <View style={styles.actionsRow}>
          {secondaryActionLabel && onSecondaryAction && (
            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.8}
              onPress={onSecondaryAction}
              disabled={isActionLoading}
            >
              <Text variant="body" weight="700" color={colors.textSecondary}>
                {secondaryActionLabel}
              </Text>
            </TouchableOpacity>
          )}

          {actionLabel && onAction && (
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.8}
              onPress={onAction}
              disabled={isActionLoading}
            >
              <Text variant="body" weight="800" color="#FFFFFF">
                {isActionLoading ? 'Connecting...' : actionLabel}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    padding: spacing.md,
    marginVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  titleChip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  locationText: {
    marginTop: 2,
  },
  statsDivider: {
    height: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.06)',
    marginVertical: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  statItem: {
    alignItems: 'center',
  },

  customSubtitle: {
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  primaryBtn: {
    flex: 1,
    height: 44,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

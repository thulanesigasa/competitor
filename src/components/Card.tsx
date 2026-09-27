import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, radius, shadow } from '../theme';
import { Text } from './Typography';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'highlighted' | 'dark' | 'outline';
  padding?: number;
  onPress?: () => void;
  showChevron?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = spacing.md,
  onPress,
  showChevron = false,
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'highlighted':
        return {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.accentBorder,
          borderWidth: 1,
        };
      case 'dark':
        return {
          backgroundColor: colors.surfaceSecondary,
          borderColor: colors.borderMuted,
          borderWidth: 1,
        };
      case 'outline':
        return {
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
        };
      default:
        return {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
        };
    }
  };

  const content = (
    <View style={styles.contentWrapper}>
      <View style={{ flex: 1 }}>{children}</View>
      {showChevron && (
        <View style={styles.chevron}>
          <Text variant="body" weight="700" color={colors.textSecondary}>
            →
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.card, shadow.sm, getVariantStyle(), { padding }, style]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, shadow.sm, getVariantStyle(), { padding }, style]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: spacing.sm,
  },
});

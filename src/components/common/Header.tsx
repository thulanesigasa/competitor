import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme';
import { Text } from '../Typography';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightActionLabel?: string;
  onRightAction?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack,
  onBack,
  rightActionLabel,
  onRightAction,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {showBack && onBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            accessibilityLabel="Go back"
          >
            <Text variant="body" weight="700" color={colors.accentHover} style={styles.backText}>
              ← Back
            </Text>
          </TouchableOpacity>
        ) : (
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.brandLogo}
            resizeMode="cover"
          />
        )}

        <View style={styles.titleContainer}>
          <Text variant="body" weight="800" color={colors.textPrimary} style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text variant="caption" weight="600" color={colors.textMuted} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {rightActionLabel && onRightAction ? (
          <TouchableOpacity
            style={styles.rightButton}
            onPress={onRightAction}
            activeOpacity={0.7}
          >
            <Text variant="caption" weight="700" color={colors.accentHover}>
              {rightActionLabel}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.08)',
    elevation: 0,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 12,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  brandLogo: {
    width: 24,
    height: 24,
    borderRadius: 0,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 2,
  },
  backText: {
    letterSpacing: 0.3,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.sm / 2,
  },
  title: {
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  rightButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  placeholder: {
    width: 24,
  },
});


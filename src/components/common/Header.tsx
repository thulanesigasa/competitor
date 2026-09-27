import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { COLORS, METRICS, SPACING } from '../../constants/theme';

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
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.brandLogo}
            resizeMode="cover"
          />
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
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
            <Text style={styles.rightButtonText}>{rightActionLabel}</Text>
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
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 12,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm,
  },
  brandLogo: {
    width: METRICS.brandLogoHeader,
    height: METRICS.brandLogoHeader,
    borderRadius: 5,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backText: {
    color: COLORS.accent,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  title: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  rightButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  rightButtonText: {
    color: COLORS.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  placeholder: {
    width: METRICS.brandLogoHeader,
  },
});

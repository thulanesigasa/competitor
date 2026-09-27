import React from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Text } from '../Typography';
import { colors } from '../../theme/colors';
import { spacing, shadow } from '../../theme';

export interface DropdownOption {
  label: string;
  value: string;
  subLabel?: string;
  badge?: string;
}

export interface ThemedDropdownProps {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  hint?: string;
  containerStyle?: ViewStyle;
}

export const ThemedDropdown: React.FC<ThemedDropdownProps> = ({
  label,
  placeholder = 'Select an option...',
  options,
  selectedValue,
  onSelect,
  isOpen,
  onToggle,
  hint,
  containerStyle,
}) => {
  const selectedOption = options.find((opt) => opt.value === selectedValue);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          variant="caption"
          weight="700"
          color={colors.textSecondary}
          style={styles.label}
        >
          {label}
        </Text>
      )}

      {/* Trigger Button */}
      <TouchableOpacity
        style={[
          styles.triggerBox,
          shadow.sm,
          isOpen && styles.triggerBoxOpen,
        ]}
        onPress={onToggle}
        activeOpacity={0.8}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
        accessibilityState={{ expanded: isOpen }}
      >
        <View style={styles.selectedContent}>
          {selectedOption?.badge && (
            <View style={styles.badge}>
              <Text variant="caption" weight="800" color={colors.accentHover}>
                {selectedOption.badge}
              </Text>
            </View>
          )}
          <Text
            variant="body"
            weight={selectedOption ? '600' : '400'}
            color={selectedOption ? colors.textPrimary : '#94A3B8'}
            numberOfLines={1}
            style={styles.selectedText}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
          {selectedOption?.subLabel && (
            <Text
              variant="caption"
              weight="600"
              color={colors.textSecondary}
              style={styles.selectedSubLabel}
            >
              {selectedOption.subLabel}
            </Text>
          )}
        </View>

        {/* SVG Chevron */}
        <View style={[styles.chevronWrapper, isOpen && styles.chevronWrapperOpen]}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path
              d={isOpen ? 'M18 15L12 9L6 15' : 'M6 9L12 15L18 9'}
              stroke={isOpen ? colors.accent : colors.textSecondary}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      </TouchableOpacity>

      {/* Dropdown Menu List */}
      {isOpen && (
        <View style={[styles.menuContainer, shadow.md]}>
          <ScrollView
            style={styles.menuScroll}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            {options.map((option, index) => {
              const isSelected = option.value === selectedValue;
              const isLast = index === options.length - 1;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.menuItem,
                    isSelected && styles.menuItemActive,
                    isLast && styles.menuItemLast,
                  ]}
                  onPress={() => {
                    onSelect(option.value);
                    onToggle();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemLeft}>
                    {option.badge && (
                      <View style={[styles.badge, isSelected && styles.badgeActive]}>
                        <Text
                          variant="caption"
                          weight="800"
                          color={isSelected ? colors.accentHover : colors.textSecondary}
                        >
                          {option.badge}
                        </Text>
                      </View>
                    )}
                    <Text
                      variant="body"
                      weight={isSelected ? '700' : '500'}
                      color={isSelected ? colors.accentHover : colors.textPrimary}
                    >
                      {option.label}
                    </Text>
                  </View>

                  <View style={styles.itemRight}>
                    {option.subLabel && (
                      <Text
                        variant="caption"
                        weight={isSelected ? '700' : '500'}
                        color={isSelected ? colors.accentHover : colors.textSecondary}
                        style={styles.itemSubLabel}
                      >
                        {option.subLabel}
                      </Text>
                    )}
                    {isSelected && (
                      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M20 6L9 17L4 12"
                          stroke={colors.accent}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </Svg>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {hint && !isOpen && (
        <Text variant="caption" color={colors.textSecondary} style={styles.hint}>
          {hint}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
  },
  triggerBox: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
  },
  triggerBoxOpen: {
    borderColor: colors.accent,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  selectedContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  selectedText: {
    fontSize: 14,
  },
  selectedSubLabel: {
    marginLeft: spacing.sm,
  },
  badge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: spacing.sm,
  },
  badgeActive: {
    backgroundColor: '#FFFBEB',
    borderColor: colors.accent,
  },
  chevronWrapper: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
  },
  chevronWrapperOpen: {
    backgroundColor: '#FFFBEB',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.accent,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    maxHeight: 220,
    overflow: 'hidden',
  },
  menuScroll: {
    maxHeight: 220,
  },
  menuItem: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.04)',
    backgroundColor: '#FFFFFF',
  },
  menuItemActive: {
    backgroundColor: '#FFFDF5',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemSubLabel: {
    marginRight: 4,
  },
  hint: {
    marginTop: spacing.sm / 2,
    paddingHorizontal: 2,
  },
});

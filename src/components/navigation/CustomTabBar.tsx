import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors } from '../../theme/colors';
import { Text } from '../Typography';
import {
  BattlegroundTabSvg,
  OfflineTabSvg,
  LeaderboardTabSvg,
  ProfileTabSvg,
} from './TabIcons';

const getTabSvgIcon = (routeName: string, color: string) => {
  switch (routeName) {
    case 'Battleground':
      return <BattlegroundTabSvg size={16} color={color} strokeWidth={2} />;
    case 'Offline':
      return <OfflineTabSvg size={16} color={color} strokeWidth={2} />;
    case 'Leaderboard':
      return <LeaderboardTabSvg size={16} color={color} strokeWidth={2} />;
    case 'Profile':
      return <ProfileTabSvg size={16} color={color} strokeWidth={2} />;
    default:
      return <OfflineTabSvg size={16} color={color} strokeWidth={2} />;
  }
};

const getTabLabel = (routeName: string) => {
  switch (routeName) {
    case 'Battleground':
      return 'BATTLE';
    case 'Offline':
      return 'OFFLINE';
    case 'Leaderboard':
      return 'RANKS';
    case 'Profile':
      return 'PROFILE';
    default:
      return routeName.toUpperCase();
  }
};

/**
 * Rule 20 Custom Bottom Tab Bar
 * Fully centered floating pill architecture with bounded 280px width,
 * dynamic horizontal centering via useWindowDimensions(), soft drop shadow,
 * 16px tab SVGs, and active indicator dot.
 */
export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { width } = useWindowDimensions();
  const leftOffset = Math.max(0, (width - 280) / 2);

  return (
    <View
      style={[
        styles.pillContainer,
        {
          left: leftOffset,
        },
      ]}
    >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const color = isFocused ? colors.accent : '#94A3B8';
          const label = getTabLabel(route.name);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
            >
              {getTabSvgIcon(route.name, color)}
              <View style={styles.labelWrapper}>
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isFocused ? colors.accent : '#64748B',
                      fontWeight: isFocused ? '700' : '500',
                    },
                  ]}
                >
                  {label}
                </Text>
                {isFocused ? (
                  <View style={styles.focusedDot} />
                ) : (
                  <View style={styles.dotPlaceholder} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 24,
    width: 280,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 4,
    paddingBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    borderTopWidth: 0,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  labelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 8.5,
    marginTop: 1,
    letterSpacing: 0.5,
  },
  focusedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 2,
  },
  dotPlaceholder: {
    width: 4,
    height: 4,
    marginTop: 2,
  },
});

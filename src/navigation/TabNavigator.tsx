import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../constants/theme';
import { BattlegroundScreen } from '../screens/battleground/BattlegroundScreen';
import { OfflineScreen } from '../screens/offline/OfflineScreen';
import { LeaderboardScreen } from '../screens/leaderboard/LeaderboardScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

interface TabNavigatorProps {
  onLogout: () => void;
}

export const TabNavigator: React.FC<TabNavigatorProps> = ({ onLogout }) => {
  const { width } = useWindowDimensions();
  const pillWidth = Math.min(width - 32, 330);
  const horizontalMargin = (width - pillWidth) / 2;

  return (
    <Tab.Navigator
      initialRouteName="Offline"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 28 : 24,
          left: horizontalMargin,
          right: horizontalMargin,
          width: pillWidth,
          height: 52,
          paddingTop: 4,
          paddingBottom: 4,
          borderRadius: 16,
          backgroundColor: COLORS.surface,
          borderWidth: 1,
          borderColor: COLORS.border,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          elevation: 5,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
        },
      }}
    >
      <Tab.Screen
        name="Battleground"
        component={BattlegroundScreen}
        options={{
          tabBarButton: (props) => (
            <TabPillButton {...props} label="BATTLE" />
          ),
        }}
      />
      <Tab.Screen
        name="Offline"
        component={OfflineScreen}
        options={{
          tabBarButton: (props) => (
            <TabPillButton {...props} label="OFFLINE" />
          ),
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarButton: (props) => (
            <TabPillButton {...props} label="RANKS" />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        children={() => <ProfileScreen onLogout={onLogout} />}
        options={{
          tabBarButton: (props) => (
            <TabPillButton {...props} label="PROFILE" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

interface TabPillButtonProps {
  label: string;
  accessibilityState?: { selected?: boolean };
  onPress?: any;
}

const TabPillButton: React.FC<TabPillButtonProps> = ({
  label,
  accessibilityState,
  onPress,
}) => {
  const focused = accessibilityState?.selected;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.tabButton}
    >
      <Text
        style={[
          styles.tabLabel,
          {
            color: focused ? COLORS.accent : COLORS.textMuted,
            fontWeight: focused ? '800' : '600',
          },
        ]}
      >
        {label}
      </Text>
      {focused ? <View style={styles.focusedDot} /> : <View style={styles.dotPlaceholder} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  tabLabel: {
    fontSize: 9.5,
    letterSpacing: 0.8,
  },
  focusedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    marginTop: 3,
  },
  dotPlaceholder: {
    width: 4,
    height: 4,
    marginTop: 3,
  },
});

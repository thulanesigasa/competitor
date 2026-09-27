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
  const pillWidth = 280;
  const horizontalMargin = (width - 280) / 2;

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
          width: 280,
          height: 50,
          paddingTop: 4,
          paddingBottom: 4,
          borderRadius: 16,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: 'rgba(15, 23, 42, 0.08)',
          borderTopWidth: 0,
          elevation: 5,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.08,
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
            color: focused ? COLORS.accent : '#64748B',
            fontWeight: focused ? '700' : '500',
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
    fontSize: 8.5,
    letterSpacing: 0.6,
  },
  focusedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
    marginTop: 2,
  },
  dotPlaceholder: {
    width: 4,
    height: 4,
    marginTop: 2,
  },
});

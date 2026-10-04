import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants/theme';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { SignUpScreen } from '../screens/auth/SignUpScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { TabNavigator } from './TabNavigator';
import { UserProfile } from '../types/auth';
import { getIsOnboarded, getUserProfile } from '../store/gameStore';

import { PrivacyScreen } from '../screens/settings/PrivacyScreen';
import { SecurityScreen } from '../screens/settings/SecurityScreen';
import { BlockedUsersScreen } from '../screens/settings/BlockedUsersScreen';
import { DeviceSessionsScreen } from '../screens/settings/DeviceSessionsScreen';
import { DeleteAccountScreen } from '../screens/settings/DeleteAccountScreen';
import { ExportDataScreen } from '../screens/settings/ExportDataScreen';
import { InactivityLockScreen } from '../screens/settings/InactivityLockScreen';
import { SecurityPinScreen } from '../screens/settings/SecurityPinScreen';
import { ChallengeArenaScreen } from '../screens/settings/ChallengeArenaScreen';
import { PrivacyPolicyScreen } from '../screens/legal/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from '../screens/legal/TermsOfServiceScreen';
import { VipPassScreen } from '../screens/wallet/VipPassScreen';
import { GameDetailScreen } from '../screens/games/GameDetailScreen';
import { TournamentInfoScreen } from '../screens/tournament/TournamentInfoScreen';
import { AppSwitcherShield } from '../components/common/AppSwitcherShield';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkInitialState();
  }, []);

  const checkInitialState = async () => {
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 1500));
    try {
      await Promise.race([
        (async () => {
          const user = await getUserProfile();
          const onboarded = await getIsOnboarded();
          setCurrentUser(user);
          setHasCompletedOnboarding(onboarded || user !== null);
        })(),
        timeoutPromise,
      ]);
    } catch {
      // Default initial state
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  // Determine initial route accurately based on current state
  const initialRouteName = currentUser
    ? 'MainTabs'
    : hasCompletedOnboarding
    ? 'Login'
    : 'Onboarding';

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRouteName}
          screenOptions={{ headerShown: false, animation: 'fade' }}
        >
          <Stack.Screen name="MainTabs">
            {(props) => (
              <TabNavigator
                onLogout={() => {
                  setCurrentUser(null);
                  props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                }}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="Onboarding">
            {(props) => (
              <OnboardingScreen
                onSwipeToSignUp={() => props.navigation.navigate('SignUp')}
                onNavigateToLogin={() => props.navigation.navigate('Login')}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="SignUp">
            {(props) => (
              <SignUpScreen
                onSignUpSuccess={(user) => {
                  setCurrentUser(user);
                  props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs' }],
                  });
                }}
                onNavigateToLogin={() => props.navigation.navigate('Login')}
                onNavigateBack={() => {
                  if (props.navigation.canGoBack()) {
                    props.navigation.goBack();
                  } else {
                    props.navigation.navigate('Onboarding');
                  }
                }}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen
                onLoginSuccess={(user) => {
                  setCurrentUser(user);
                  props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs' }],
                  });
                }}
                onNavigateToSignUp={() => props.navigation.navigate('SignUp')}
              />
            )}
          </Stack.Screen>

          {/* Settings & Privacy Screens */}
          <Stack.Screen name="Privacy" component={PrivacyScreen} />
          <Stack.Screen name="Security" component={SecurityScreen} />
          <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
          <Stack.Screen name="DeviceSessions" component={DeviceSessionsScreen} />
          <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
          <Stack.Screen name="ExportData" component={ExportDataScreen} />
          <Stack.Screen name="InactivityLock" component={InactivityLockScreen} />
          <Stack.Screen name="SecurityPin" component={SecurityPinScreen} />
          <Stack.Screen name="ChallengeArena" component={ChallengeArenaScreen} />

          {/* VIP Pro Tournament Pass Screen */}
          <Stack.Screen name="VipPass" component={VipPassScreen} />

          {/* Tournament Guide Screen */}
          <Stack.Screen name="TournamentInfo" component={TournamentInfoScreen} />

          {/* Games Guide Screen */}
          <Stack.Screen name="GameDetail" component={GameDetailScreen} />

          {/* Legal Screens */}
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <AppSwitcherShield />
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

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

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkInitialState();
  }, []);

  const checkInitialState = async () => {
    try {
      const user = await getUserProfile();
      const onboarded = await getIsOnboarded();
      setCurrentUser(user);
      setHasCompletedOnboarding(onboarded || user !== null);
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

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {currentUser ? (
          <Stack.Screen name="MainTabs">
            {() => <TabNavigator onLogout={() => setCurrentUser(null)} />}
          </Stack.Screen>
        ) : !hasCompletedOnboarding ? (
          <>
            <Stack.Screen name="Onboarding">
              {(props) => (
                <OnboardingScreen
                  onSwipeToSignUp={() => {
                    setHasCompletedOnboarding(true);
                    props.navigation.navigate('SignUp');
                  }}
                  onNavigateToLogin={() => {
                    setHasCompletedOnboarding(true);
                    props.navigation.navigate('Login');
                  }}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="SignUp">
              {(props) => (
                <SignUpScreen
                  onSignUpSuccess={(user) => setCurrentUser(user)}
                  onNavigateToLogin={() => props.navigation.navigate('Login')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  onLoginSuccess={(user) => setCurrentUser(user)}
                  onNavigateToSignUp={() => props.navigation.navigate('SignUp')}
                />
              )}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen name="SignUp">
              {(props) => (
                <SignUpScreen
                  onSignUpSuccess={(user) => setCurrentUser(user)}
                  onNavigateToLogin={() => props.navigation.navigate('Login')}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  onLoginSuccess={(user) => setCurrentUser(user)}
                  onNavigateToSignUp={() => props.navigation.navigate('SignUp')}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
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

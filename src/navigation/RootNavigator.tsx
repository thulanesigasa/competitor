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

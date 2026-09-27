import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing, radius, shadow } from '../../theme';
import { Text } from '../../components/Typography';
import { Header } from '../../components/common/Header';
import { useThemedAlert } from '../../components/common/ThemedAlert';
import { getUserProfile, saveUserProfile } from '../../store/gameStore';
import { UserProfile } from '../../types/auth';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onNavigateToSignUp: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onNavigateToSignUp,
}) => {
  const { showAlert } = useThemedAlert();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim()) {
      showAlert({ title: 'Missing Input', message: 'Please enter your Gamer Tag or Email.' });
      return;
    }
    if (!password.trim() || password.length < 8) {
      showAlert({ title: 'Invalid Password', message: 'Please enter your password (minimum 8 characters).' });
      return;
    }

    // Check stored profile or create session
    const existing = await getUserProfile();
    if (
      existing &&
      (existing.email.toLowerCase() === identifier.trim().toLowerCase() ||
        existing.gamerTag.toLowerCase() === identifier.trim().toLowerCase())
    ) {
      onLoginSuccess(existing);
      return;
    }

    // Default player session fallback
    const sessionUser: UserProfile = existing || {
      id: `user_${Date.now()}`,
      name: 'Warrior',
      surname: 'Player',
      dob: '2000-01-01',
      cellphone: '+27 820000000',
      country: 'South Africa',
      countryCode: 'ZA',
      province: 'Gauteng',
      town: 'Johannesburg',
      gamerTag: identifier.trim(),
      email: identifier.includes('@') ? identifier.trim() : `${identifier.trim()}@morabaraba.africa`,
      createdAt: new Date().toISOString(),
    };

    await saveUserProfile(sessionUser);
    onLoginSuccess(sessionUser);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <Header
        title="SIGN IN"
        showBack
        onBack={onNavigateToSignUp}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandBox}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text variant="h2" weight="900" style={styles.brandTitle}>
              MORABARABA
            </Text>
            <Text variant="caption" weight="700" color={colors.accentHover} style={styles.brandSubtitle}>
              ENTER THE COMPETITIVE ARENA
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text variant="caption" weight="700" color={colors.textSecondary} style={styles.inputLabel}>
                GAMER TAG OR EMAIL
              </Text>
              <View style={[styles.inputWrapper, shadow.sm]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. KlipKing_01 or email@domain.com"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  value={identifier}
                  onChangeText={setIdentifier}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption" weight="700" color={colors.textSecondary} style={styles.inputLabel}>
                PASSWORD
              </Text>
              <View style={[styles.inputWrapper, shadow.sm]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your 8+ character password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.toggleVisibilityBtn}
                >
                  <Text variant="label" weight="700" color={colors.textSecondary}>
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, shadow.sm]}
              activeOpacity={0.8}
              onPress={handleLogin}
            >
              <Text variant="body" weight="800" color="#FFFFFF">
                Sign In to Arena →
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.switchAuth}
            onPress={onNavigateToSignUp}
            activeOpacity={0.7}
          >
            <Text variant="body" color={colors.textSecondary}>
              New competitor?{' '}
              <Text variant="body" weight="700" color={colors.accent}>
                Register Now
              </Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 0,
    marginBottom: spacing.sm,
  },
  brandTitle: {
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  brandSubtitle: {
    letterSpacing: 1,
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  toggleVisibilityBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: colors.textPrimary,
    fontSize: 14,
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    height: 50,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: 8,
  },
  switchAuth: {
    alignSelf: 'center',
    paddingVertical: spacing.lg,
  },
});


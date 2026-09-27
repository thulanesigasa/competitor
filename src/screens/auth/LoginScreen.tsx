import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { COLORS, METRICS, SPACING } from '../../constants/theme';
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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header
        title="SIGN IN"
        showBack
        onBack={onNavigateToSignUp}
      />

      <View style={styles.content}>
        <View style={styles.brandBox}>
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.logo}
            resizeMode="cover"
          />
          <Text style={styles.brandTitle}>MORABARABA</Text>
          <Text style={styles.brandSubtitle}>ENTER THE COMPETITIVE ARENA</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.fieldLabel}>GAMER TAG OR EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. KlipKing_01 or email@domain.com"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            value={identifier}
            onChangeText={setIdentifier}
          />

          <Text style={styles.fieldLabel}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your 8+ character password"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={handleLogin}
          >
            <Text style={styles.primaryButtonText}>Sign In to Arena →</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.switchAuth}
          onPress={onNavigateToSignUp}
          activeOpacity={0.7}
        >
          <Text style={styles.switchAuthText}>
            New competitor? <Text style={styles.switchAuthLink}>Register Now</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logo: {
    width: METRICS.brandLogoModal,
    height: METRICS.brandLogoModal,
    borderRadius: 0,
    marginBottom: SPACING.xs,
  },
  brandTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandSubtitle: {
    color: COLORS.accentHover,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: 14,
    marginBottom: SPACING.xs,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  switchAuth: {
    alignSelf: 'center',
    paddingVertical: SPACING.lg,
  },
  switchAuthText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  switchAuthLink: {
    color: COLORS.accent,
    fontWeight: '700',
  },
});

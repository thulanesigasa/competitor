import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { COLORS, METRICS, SPACING } from '../../constants/theme';
import { Header } from '../../components/common/Header';
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
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!identifier.trim()) {
      Alert.alert('Missing Input', 'Please enter your Gamer Tag or Email.');
      return;
    }
    if (!password.trim() || password.length < 8) {
      Alert.alert('Invalid Password', 'Please enter your password (minimum 8 characters).');
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
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />
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

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>GAMER TAG OR EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. KlipKing_01 or email@domain.com"
            placeholderTextColor={COLORS.textSecondary}
            autoCapitalize="none"
            value={identifier}
            onChangeText={setIdentifier}
          />

          <Text style={styles.fieldLabel}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your 8+ character password"
            placeholderTextColor={COLORS.textSecondary}
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
    borderRadius: 12,
    marginBottom: SPACING.xs,
  },
  brandTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  brandSubtitle: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fieldLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: SPACING.sm,
    color: COLORS.white,
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
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  switchAuth: {
    alignSelf: 'center',
    paddingVertical: SPACING.lg,
  },
  switchAuthText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
  switchAuthLink: {
    color: COLORS.accent,
    fontWeight: '700',
  },
});

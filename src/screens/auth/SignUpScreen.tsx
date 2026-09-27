import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { COLORS, METRICS, SPACING } from '../../constants/theme';
import { SOUTHERN_AFRICAN_COUNTRIES } from '../../constants/regions';
import { Header } from '../../components/common/Header';
import {
  PasswordStrengthMeter,
  evaluatePasswordStrength,
} from '../../components/common/PasswordStrengthMeter';
import { UserProfile } from '../../types/auth';
import { saveUserProfile } from '../../store/gameStore';

interface SignUpScreenProps {
  onSignUpSuccess: (user: UserProfile) => void;
  onNavigateToLogin: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onSignUpSuccess,
  onNavigateToLogin,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Personal Details
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [dob, setDob] = useState('');
  const [dialCode, setDialCode] = useState('+27');
  const [cellphone, setCellphone] = useState('');

  // Step 2: Location & Gamer Tag
  const [selectedCountryName, setSelectedCountryName] = useState('South Africa');
  const [selectedProvince, setSelectedProvince] = useState('Gauteng');
  const [town, setTown] = useState('');
  const [gamerTag, setGamerTag] = useState('');

  // Step 3: Security & Credentials
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const currentCountry =
    SOUTHERN_AFRICAN_COUNTRIES.find((c) => c.name === selectedCountryName) ||
    SOUTHERN_AFRICAN_COUNTRIES[0];

  // Step 1 Validation
  const handleNextStep1 = () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter your first name.');
      return;
    }
    if (!surname.trim()) {
      Alert.alert('Required Field', 'Please enter your surname.');
      return;
    }
    if (!dob.trim()) {
      Alert.alert('Required Field', 'Please enter your date of birth (YYYY-MM-DD).');
      return;
    }
    if (!cellphone.trim() || cellphone.trim().length < 7) {
      Alert.alert('Invalid Number', 'Please enter a valid cellphone number.');
      return;
    }
    setCurrentStep(2);
  };

  // Step 2 Validation
  const handleNextStep2 = () => {
    if (!selectedCountryName) {
      Alert.alert('Required Field', 'Please select your country.');
      return;
    }
    if (!selectedProvince) {
      Alert.alert('Required Field', 'Please select your province or region.');
      return;
    }
    if (!town.trim()) {
      Alert.alert('Required Field', 'Please enter your town or city.');
      return;
    }
    if (!gamerTag.trim() || gamerTag.trim().length < 3) {
      Alert.alert('Gamer Tag Required', 'Your gamer tag must be at least 3 characters.');
      return;
    }
    setCurrentStep(3);
  };

  // Step 3 Validation & Final Submission
  const handleFinalSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      Alert.alert('Email Mismatch', 'Email and Confirm Email do not match.');
      return;
    }

    const { hasMinLength } = evaluatePasswordStrength(password);
    if (!hasMinLength) {
      Alert.alert(
        'Weak Password',
        'Your password must contain at least 8 characters with letters, numbers, and symbols.'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Password and Confirm Password do not match.');
      return;
    }

    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      surname: surname.trim(),
      dob: dob.trim(),
      cellphone: `${dialCode} ${cellphone.trim()}`,
      country: selectedCountryName,
      countryCode: currentCountry.code,
      province: selectedProvince,
      town: town.trim(),
      gamerTag: gamerTag.trim(),
      email: email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    await saveUserProfile(newUser);
    onSignUpSuccess(newUser);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surface} />
      <Header
        title="PLAYER REGISTRATION"
        subtitle={`STEP ${currentStep} OF 3`}
        showBack={currentStep > 1}
        onBack={() => setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as any) : 1))}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step Indicator */}
        <View style={styles.stepHeader}>
          {[1, 2, 3].map((step) => {
            const isCompleted = step < currentStep;
            const isCurrent = step === currentStep;
            return (
              <View key={step} style={styles.stepTrackItem}>
                <View
                  style={[
                    styles.stepBadge,
                    isCurrent && styles.stepBadgeCurrent,
                    isCompleted && styles.stepBadgeCompleted,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNumber,
                      (isCurrent || isCompleted) && styles.stepNumberActive,
                    ]}
                  >
                    {isCompleted ? '✓' : `0${step}`}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isCurrent && styles.stepLabelActive,
                  ]}
                >
                  {step === 1 ? 'Personal' : step === 2 ? 'Location' : 'Security'}
                </Text>
              </View>
            );
          })}
        </View>

        {/* STEP 1: Personal Details */}
        {currentStep === 1 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>
            <Text style={styles.sectionSubtitle}>
              Please enter your full legal identity for regional esports compliance.
            </Text>

            <Text style={styles.fieldLabel}>FIRST NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sipho"
              placeholderTextColor={COLORS.textSecondary}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.fieldLabel}>SURNAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Dlamini"
              placeholderTextColor={COLORS.textSecondary}
              value={surname}
              onChangeText={setSurname}
            />

            <Text style={styles.fieldLabel}>DATE OF BIRTH (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2002-08-15"
              placeholderTextColor={COLORS.textSecondary}
              value={dob}
              onChangeText={setDob}
            />

            <Text style={styles.fieldLabel}>CELLPHONE NUMBER</Text>
            <View style={styles.phoneRow}>
              {/* Dial Code Selector Buttons */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.dialCodeScroll}
              >
                {SOUTHERN_AFRICAN_COUNTRIES.map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    onPress={() => setDialCode(c.dialCode)}
                    style={[
                      styles.dialCodeOption,
                      dialCode === c.dialCode && styles.dialCodeOptionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dialCodeText,
                        dialCode === c.dialCode && styles.dialCodeTextActive,
                      ]}
                    >
                      {c.code} {c.dialCode}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TextInput
              style={styles.input}
              placeholder="e.g. 821234567"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="phone-pad"
              value={cellphone}
              onChangeText={setCellphone}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={handleNextStep1}
            >
              <Text style={styles.primaryButtonText}>Continue to Location →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: Location & Gamer Tag */}
        {currentStep === 2 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>SOUTHERN AFRICAN LOCATION</Text>
            <Text style={styles.sectionSubtitle}>
              Catering strictly for Southern Africa to foster local community competition.
            </Text>

            <Text style={styles.fieldLabel}>COUNTRY</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
            >
              {SOUTHERN_AFRICAN_COUNTRIES.map((c) => (
                <TouchableOpacity
                  key={c.code}
                  onPress={() => {
                    setSelectedCountryName(c.name);
                    setSelectedProvince(c.provinces[0]?.name || '');
                  }}
                  style={[
                    styles.selectorChip,
                    selectedCountryName === c.name && styles.selectorChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedCountryName === c.name && styles.chipTextActive,
                    ]}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>PROVINCE / REGION</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
            >
              {currentCountry.provinces.map((p) => (
                <TouchableOpacity
                  key={p.name}
                  onPress={() => setSelectedProvince(p.name)}
                  style={[
                    styles.selectorChip,
                    selectedProvince === p.name && styles.selectorChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedProvince === p.name && styles.chipTextActive,
                    ]}
                  >
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>TOWN / CITY</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Soweto, Mutare, Gaborone..."
              placeholderTextColor={COLORS.textSecondary}
              value={town}
              onChangeText={setTown}
            />

            <Text style={styles.fieldLabel}>GAMER TAG (ONLINE ALIAS)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. KlipKing_01"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="none"
              value={gamerTag}
              onChangeText={setGamerTag}
            />
            <Text style={styles.hintText}>
              Your Gamer Tag is visible to opponents in the Wi-Fi Battleground and Leaderboard.
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={handleNextStep2}
            >
              <Text style={styles.primaryButtonText}>Continue to Security →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3: Security & Credentials */}
        {currentStep === 3 && (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>SECURITY & CREDENTIALS</Text>
            <Text style={styles.sectionSubtitle}>
              Protect your gamer profile with 8+ character password validation.
            </Text>

            <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="gamer@morabaraba.africa"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.fieldLabel}>CONFIRM EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter your email"
              placeholderTextColor={COLORS.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={confirmEmail}
              onChangeText={setConfirmEmail}
            />

            <Text style={styles.fieldLabel}>PASSWORD (8+ CHARACTERS)</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimum 8 letters & numbers"
              placeholderTextColor={COLORS.textSecondary}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <PasswordStrengthMeter password={password} />

            <Text style={styles.fieldLabel}>CONFIRM PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              placeholderTextColor={COLORS.textSecondary}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={handleFinalSubmit}
            >
              <Text style={styles.primaryButtonText}>Create Gamer Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Link back to Login */}
        <TouchableOpacity
          style={styles.switchAuth}
          onPress={onNavigateToLogin}
          activeOpacity={0.7}
        >
          <Text style={styles.switchAuthText}>
            Already registered? <Text style={styles.switchAuthLink}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  stepTrackItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepBadgeCurrent: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.surface,
  },
  stepBadgeCompleted: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  stepNumber: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  stepNumberActive: {
    color: COLORS.white,
  },
  stepLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  stepLabelActive: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  formSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: SPACING.md,
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
  phoneRow: {
    marginBottom: 6,
  },
  dialCodeScroll: {
    flexGrow: 0,
    marginBottom: 4,
  },
  dialCodeOption: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  dialCodeOptionActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.surfaceLight,
  },
  dialCodeText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  dialCodeTextActive: {
    color: COLORS.accent,
  },
  chipsScroll: {
    flexGrow: 0,
    marginBottom: SPACING.xs,
  },
  selectorChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  selectorChipActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.surfaceLight,
  },
  chipText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  hintText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
    marginBottom: SPACING.sm,
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
    paddingVertical: SPACING.md,
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

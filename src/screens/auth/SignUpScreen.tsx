import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  BackHandler,
} from 'react-native';
import { COLORS, METRICS, SPACING } from '../../constants/theme';
import { SOUTHERN_AFRICAN_COUNTRIES } from '../../constants/regions';
import { Header } from '../../components/common/Header';
import { useThemedAlert } from '../../components/common/ThemedAlert';
import {
  PasswordStrengthMeter,
  evaluatePasswordStrength,
} from '../../components/common/PasswordStrengthMeter';
import { UserProfile } from '../../types/auth';
import { saveUserProfile } from '../../store/gameStore';

interface SignUpScreenProps {
  onSignUpSuccess: (user: UserProfile) => void;
  onNavigateToLogin: () => void;
  onNavigateBack?: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onSignUpSuccess,
  onNavigateToLogin,
  onNavigateBack,
}) => {
  const { showAlert } = useThemedAlert();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Personal Details
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [dob, setDob] = useState('');
  const [dialCode, setDialCode] = useState('+27');
  const [cellphone, setCellphone] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);

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

  // Hardware Back Handler: return to previous step, or back to onboarding if on step 1
  useEffect(() => {
    const onBackPress = () => {
      if (showCountryPicker) {
        setShowCountryPicker(false);
        return true;
      }
      if (currentStep > 1) {
        setCurrentStep((prev) => ((prev - 1) as any));
        return true;
      }
      if (onNavigateBack) {
        onNavigateBack();
        return true;
      }
      return false;
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backSub.remove();
  }, [currentStep, onNavigateBack, showCountryPicker]);

  const currentCountry =
    SOUTHERN_AFRICAN_COUNTRIES.find((c) => c.name === selectedCountryName) ||
    SOUTHERN_AFRICAN_COUNTRIES[0];

  // Step 1 Validation with automatic zero sanitization
  const handleNextStep1 = () => {
    if (!name.trim()) {
      showAlert({ title: 'Required Field', message: 'Please enter your first name.' });
      return;
    }
    if (!surname.trim()) {
      showAlert({ title: 'Required Field', message: 'Please enter your surname.' });
      return;
    }
    if (!dob.trim()) {
      showAlert({ title: 'Required Field', message: 'Please enter your date of birth (YYYY-MM-DD).' });
      return;
    }
    const cleanDigits = cellphone.replace(/\D/g, '');
    const sanitizedNumber = cleanDigits.replace(/^0+/, '');
    if (!sanitizedNumber || sanitizedNumber.length < 7) {
      showAlert({ title: 'Invalid Number', message: 'Please enter a valid cellphone number (e.g. 082 123 4567 or 82 123 4567).' });
      return;
    }
    setCurrentStep(2);
  };

  // Step 2 Validation
  const handleNextStep2 = () => {
    if (!selectedCountryName) {
      showAlert({ title: 'Required Field', message: 'Please select your country.' });
      return;
    }
    if (!selectedProvince) {
      showAlert({ title: 'Required Field', message: 'Please select your province or region.' });
      return;
    }
    if (!town.trim()) {
      showAlert({ title: 'Required Field', message: 'Please enter your town or city.' });
      return;
    }
    if (!gamerTag.trim() || gamerTag.trim().length < 3) {
      showAlert({ title: 'Gamer Tag Required', message: 'Your gamer tag must be at least 3 characters.' });
      return;
    }
    setCurrentStep(3);
  };

  // Step 3 Validation & Final Submission with zero sanitizer
  const handleFinalSubmit = async () => {
    if (!email.trim() || !email.includes('@')) {
      showAlert({ title: 'Invalid Email', message: 'Please enter a valid email address.' });
      return;
    }
    if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
      showAlert({ title: 'Email Mismatch', message: 'Email and Confirm Email do not match.' });
      return;
    }

    const { hasMinLength } = evaluatePasswordStrength(password);
    if (!hasMinLength) {
      showAlert({
        title: 'Weak Password',
        message: 'Your password must contain at least 8 characters with letters, numbers, and symbols.',
      });
      return;
    }

    if (password !== confirmPassword) {
      showAlert({ title: 'Password Mismatch', message: 'Password and Confirm Password do not match.' });
      return;
    }

    // Automatically strip leading zero(s) so backend/database stores clean regional number
    const cleanDigits = cellphone.replace(/\D/g, '');
    const sanitizedPhone = cleanDigits.replace(/^0+/, '');

    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      surname: surname.trim(),
      dob: dob.trim(),
      cellphone: `${dialCode} ${sanitizedPhone}`,
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
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <Header
        title="PLAYER REGISTRATION"
        subtitle={`STEP ${currentStep} OF 3`}
        showBack={true}
        onBack={() => {
          if (currentStep > 1) {
            setCurrentStep((prev) => ((prev - 1) as any));
          } else if (onNavigateBack) {
            onNavigateBack();
          } else {
            onNavigateToLogin();
          }
        }}
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
                      isCompleted && styles.stepNumberCompleted,
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
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.fieldLabel}>SURNAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Dlamini"
              placeholderTextColor={COLORS.textMuted}
              value={surname}
              onChangeText={setSurname}
            />

            <Text style={styles.fieldLabel}>DATE OF BIRTH (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2002-08-15"
              placeholderTextColor={COLORS.textMuted}
              value={dob}
              onChangeText={setDob}
            />

            {/* Split Country Code Dropdown + Cellphone Input */}
            <Text style={styles.fieldLabel}>CELLPHONE NUMBER</Text>
            <View style={styles.phoneSplitRow}>
              <TouchableOpacity
                style={styles.countryPickerButton}
                activeOpacity={0.7}
                onPress={() => setShowCountryPicker(true)}
              >
                <Text style={styles.countryPickerButtonText}>{dialCode} ▼</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.phoneInput}
                placeholder="e.g. 082 123 4567 or 82 123 4567"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                value={cellphone}
                onChangeText={setCellphone}
              />
            </View>
            <Text style={styles.phoneHelperText}>
              Leading zero will be automatically formatted for database storage.
            </Text>

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
                    setDialCode(c.dialCode);
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
                    {c.name} ({c.dialCode})
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
              placeholderTextColor={COLORS.textMuted}
              value={town}
              onChangeText={setTown}
            />

            <Text style={styles.fieldLabel}>GAMER TAG (ONLINE ALIAS)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. KlipKing_01"
              placeholderTextColor={COLORS.textMuted}
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
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.fieldLabel}>CONFIRM EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter your email"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={confirmEmail}
              onChangeText={setConfirmEmail}
            />

            <Text style={styles.fieldLabel}>PASSWORD (8+ CHARACTERS)</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimum 8 letters & numbers"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <PasswordStrengthMeter password={password} />

            <Text style={styles.fieldLabel}>CONFIRM PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              placeholderTextColor={COLORS.textMuted}
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

      {/* Split Country Code Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCountryPicker(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>SELECT COUNTRY CODE</Text>
            <Text style={styles.modalSubtitle}>
              Select your Southern African regional dialing code.
            </Text>
            <ScrollView style={styles.countryModalScroll}>
              {SOUTHERN_AFRICAN_COUNTRIES.map((c) => {
                const isSelected = dialCode === c.dialCode;
                return (
                  <TouchableOpacity
                    key={c.code}
                    style={[
                      styles.countryModalItem,
                      isSelected && styles.countryModalItemActive,
                    ]}
                    onPress={() => {
                      setDialCode(c.dialCode);
                      setSelectedCountryName(c.name);
                      setSelectedProvince(c.provinces[0]?.name || '');
                      setShowCountryPicker(false);
                    }}
                  >
                    <View>
                      <Text
                        style={[
                          styles.countryModalName,
                          isSelected && styles.countryModalNameActive,
                        ]}
                      >
                        {c.name}
                      </Text>
                      <Text style={styles.countryModalCode}>Region: {c.code}</Text>
                    </View>
                    <Text
                      style={[
                        styles.countryModalDial,
                        isSelected && styles.countryModalDialActive,
                      ]}
                    >
                      {c.dialCode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowCountryPicker(false)}
            >
              <Text style={styles.modalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingVertical: SPACING.xs,
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
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
  },
  stepBadgeCurrent: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(229, 169, 60, 0.12)',
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
    color: COLORS.accentHover,
  },
  stepNumberCompleted: {
    color: COLORS.white,
  },
  stepLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '500',
  },
  stepLabelActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  formSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
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
  phoneSplitRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 4,
  },
  countryPickerButton: {
    height: 48,
    paddingHorizontal: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryPickerButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  phoneInput: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  phoneHelperText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  chipsScroll: {
    flexGrow: 0,
    marginBottom: SPACING.xs,
  },
  selectorChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    marginRight: 8,
  },
  selectorChipActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(229, 169, 60, 0.12)',
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: COLORS.accentHover,
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
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  switchAuth: {
    alignSelf: 'center',
    paddingVertical: SPACING.md,
  },
  switchAuthText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  switchAuthLink: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    maxHeight: '75%',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  countryModalScroll: {
    maxHeight: 280,
  },
  countryModalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.06)',
  },
  countryModalItemActive: {
    backgroundColor: 'rgba(229, 169, 60, 0.1)',
  },
  countryModalName: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  countryModalNameActive: {
    color: COLORS.accentHover,
    fontWeight: '700',
  },
  countryModalCode: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  countryModalDial: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  countryModalDialActive: {
    color: COLORS.accentHover,
    fontWeight: '800',
  },
  modalCloseBtn: {
    backgroundColor: COLORS.surface,
    marginTop: SPACING.sm,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
  },
  modalCloseBtnText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
});

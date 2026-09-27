import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  BackHandler,
  Image,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors } from '../../theme/colors';
import { spacing, radius, shadow } from '../../theme';
import { Text } from '../../components/Typography';
import { Header } from '../../components/common/Header';
import { useThemedAlert } from '../../components/common/ThemedAlert';
import { ThemedDropdown } from '../../components/common/ThemedDropdown';
import {
  PasswordStrengthMeter,
  evaluatePasswordStrength,
} from '../../components/common/PasswordStrengthMeter';
import { UserProfile } from '../../types/auth';
import { saveUserProfile } from '../../store/gameStore';
import { SOUTHERN_AFRICAN_COUNTRIES } from '../../constants/regions';

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

  // Keyboard Navigation Refs
  const firstNameRef = useRef<TextInput>(null);
  const surnameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const townRef = useRef<TextInput>(null);
  const gamerTagRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const confirmEmailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // Step 1: Personal Details
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [dob, setDob] = useState('');
  const [dialCode, setDialCode] = useState('+27');
  const [cellphone, setCellphone] = useState('');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateValue, setDateValue] = useState<Date>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d;
  });

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      setDateValue(selectedDate);
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      setDob(`${yyyy}-${mm}-${dd}`);
      setTimeout(() => {
        phoneRef.current?.focus();
      }, 300);
    }
  };

  // Step 2: Location & Gamer Tag
  const [selectedCountryName, setSelectedCountryName] = useState('South Africa');
  const [selectedProvince, setSelectedProvince] = useState('Gauteng');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isProvinceDropdownOpen, setIsProvinceDropdownOpen] = useState(false);
  const [town, setTown] = useState('');
  const [gamerTag, setGamerTag] = useState('');

  // Step 3: Security & Credentials
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Hardware Back Handler: return to previous step, or back to onboarding if on step 1
  useEffect(() => {
    const onBackPress = () => {
      if (showCountryPicker) {
        setShowCountryPicker(false);
        return true;
      }
      if (isCountryDropdownOpen) {
        setIsCountryDropdownOpen(false);
        return true;
      }
      if (isProvinceDropdownOpen) {
        setIsProvinceDropdownOpen(false);
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
  }, [currentStep, onNavigateBack, showCountryPicker, isCountryDropdownOpen, isProvinceDropdownOpen]);

  const currentCountry =
    SOUTHERN_AFRICAN_COUNTRIES.find((c) => c.name === selectedCountryName) ||
    SOUTHERN_AFRICAN_COUNTRIES[0];

  const countryDropdownOptions = useMemo(
    () =>
      SOUTHERN_AFRICAN_COUNTRIES.map((c) => ({
        label: c.name,
        value: c.name,
        subLabel: c.dialCode,
        badge: c.code,
      })),
    []
  );

  const provinceDropdownOptions = useMemo(
    () =>
      currentCountry.provinces.map((p) => ({
        label: p.name,
        value: p.name,
        subLabel: `${p.towns.length} towns`,
      })),
    [currentCountry]
  );

  const handleCountrySelect = (countryName: string) => {
    setSelectedCountryName(countryName);
    const found = SOUTHERN_AFRICAN_COUNTRIES.find((c) => c.name === countryName);
    if (found) {
      setDialCode(found.dialCode);
      setSelectedProvince(found.provinces[0]?.name || '');
    }
  };

  const handleProvinceSelect = (provinceName: string) => {
    setSelectedProvince(provinceName);
  };

  const toggleCountryDropdown = () => {
    setIsProvinceDropdownOpen(false);
    setIsCountryDropdownOpen((prev) => !prev);
  };

  const toggleProvinceDropdown = () => {
    setIsCountryDropdownOpen(false);
    setIsProvinceDropdownOpen((prev) => !prev);
  };

  // Real-time zero-stripping phone handler
  const handlePhoneChange = (val: string) => {
    const digitsOnly = val.replace(/[^\d]/g, '');
    const clean = digitsOnly.replace(/^0+/, '');
    setCellphone(clean);
  };

  // Step 1 Validation
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
    if (!cellphone || cellphone.length < 7) {
      showAlert({ title: 'Invalid Number', message: 'Please enter a valid cellphone number.' });
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

  // Step 3 Validation & Final Submission
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

    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      surname: surname.trim(),
      dob: dob.trim(),
      cellphone: `${dialCode} ${cellphone}`,
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
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
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
        showsVerticalScrollIndicator={false}
      >
        {/* Step Indicator Section matching bible_fun_facts reference */}
        <View style={styles.stepIndicatorSection}>
          <View style={styles.stepPillsRow}>
            {[1, 2, 3].map((s) => {
              const isPassed = currentStep > s;
              const isCurrent = currentStep === s;
              return (
                <View key={s} style={styles.stepPillItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      isPassed && styles.stepCircleCompleted,
                      isCurrent && styles.stepCircleActive,
                    ]}
                  >
                    {isPassed ? (
                      <Image
                        source={require('../../../assets/icon.png')}
                        style={styles.stepVerifiedLogo}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text
                        variant="caption"
                        weight="700"
                        style={[
                          styles.stepCircleText,
                          isCurrent && styles.stepCircleTextActive,
                        ]}
                      >
                        {s}
                      </Text>
                    )}
                  </View>
                  {s < 3 && (
                    <View
                      style={[
                        styles.stepConnectorLine,
                        isPassed && styles.stepConnectorLineActive,
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>

          <View style={styles.stepTitleContainer}>
            <Text variant="caption" weight="700" color={colors.accent}>
              STEP {currentStep} OF 3
            </Text>
            <Text variant="h3" style={styles.stepHeading}>
              {currentStep === 1 && 'Personal Identity & Contact'}
              {currentStep === 2 && 'Regional Location & Gamer Tag'}
              {currentStep === 3 && 'Security & Password Credentials'}
            </Text>
          </View>
        </View>

        {/* STEP 1: Personal Details */}
        {currentStep === 1 && (
          <View style={styles.stepContentSection}>
            <View style={styles.inputGroup}>
              <Text variant="caption" weight="700" color={colors.textSecondary} style={styles.inputLabel}>
                FIRST NAME
              </Text>
              <View style={[styles.inputWrapper, shadow.sm]}>
                <TextInput
                  ref={firstNameRef}
                  style={styles.textInput}
                  placeholder="e.g. Sipho"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                  returnKeyType="next"
                  onSubmitEditing={() => surnameRef.current?.focus()}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption" weight="700" color={colors.textSecondary} style={styles.inputLabel}>
                SURNAME / LAST NAME
              </Text>
              <View style={[styles.inputWrapper, shadow.sm]}>
                <TextInput
                  ref={surnameRef}
                  style={styles.textInput}
                  placeholder="e.g. Dlamini"
                  placeholderTextColor="#94A3B8"
                  value={surname}
                  onChangeText={setSurname}
                  returnKeyType="next"
                  onSubmitEditing={() => setShowDatePicker(true)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption" weight="700" color={colors.textSecondary} style={styles.inputLabel}>
                DATE OF BIRTH
              </Text>
              <TouchableOpacity
                style={[styles.inputWrapper, shadow.sm, styles.datePickerBtn]}
                activeOpacity={0.8}
                onPress={() => setShowDatePicker(true)}
              >
                <Text
                  variant="body"
                  color={dob ? colors.textPrimary : '#94A3B8'}
                  weight={dob ? '600' : '400'}
                  style={styles.datePickerText}
                >
                  {dob ? dob : 'Select Date of Birth (Tap to pick)'}
                </Text>
                <Text variant="caption" color={colors.accentHover} weight="800">
                  {dob ? 'CHANGE' : 'SELECT ▼'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dateValue}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={new Date()}
                  onChange={onDateChange}
                />
              )}
            </View>

            {/* Split Country Code + Phone with real-time zero stripper */}
            <View style={styles.inputGroup}>
              <Text variant="caption" weight="700" color={colors.textSecondary} style={styles.inputLabel}>
                CELLPHONE NUMBER
              </Text>
              <View style={styles.phoneRow}>
                <TouchableOpacity
                  style={[styles.countryCodeBtn, shadow.sm]}
                  onPress={() => setShowCountryPicker(true)}
                  activeOpacity={0.8}
                >
                  <Text variant="body" weight="700" color={colors.textPrimary}>
                    {dialCode}
                  </Text>
                  <Text variant="caption" weight="700" color="#94A3B8">
                    ▼
                  </Text>
                </TouchableOpacity>

                <View style={[styles.phoneInputWrapper, shadow.sm]}>
                  <TextInput
                    ref={phoneRef}
                    style={styles.textInput}
                    placeholder="82 123 4567"
                    placeholderTextColor="#94A3B8"
                    value={cellphone}
                    onChangeText={handlePhoneChange}
                    keyboardType="number-pad"
                    returnKeyType="done"
                    onSubmitEditing={handleNextStep1}
                  />
                  {cellphone.length >= 7 && (
                    <Image
                      source={require('../../../assets/icon.png')}
                      style={styles.verifiedLogo}
                      resizeMode="contain"
                    />
                  )}
                </View>
              </View>
              <Text variant="caption" color={colors.textSecondary} style={styles.phoneHint}>
                Leading zero (0) will be automatically excluded.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, shadow.sm]}
              activeOpacity={0.85}
              onPress={handleNextStep1}
            >
              <Text variant="h3" style={styles.primaryBtnText}>
                Continue to Location →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2: Location & Gamer Tag */}
        {currentStep === 2 && (
          <View style={styles.stepContentSection}>
            <ThemedDropdown
              label="COUNTRY"
              placeholder="Select Country..."
              options={countryDropdownOptions}
              selectedValue={selectedCountryName}
              onSelect={handleCountrySelect}
              isOpen={isCountryDropdownOpen}
              onToggle={toggleCountryDropdown}
              hint="Select your Southern African region"
            />

            <ThemedDropdown
              label="PROVINCE / REGION"
              placeholder="Select Province / Region..."
              options={provinceDropdownOptions}
              selectedValue={selectedProvince}
              onSelect={handleProvinceSelect}
              isOpen={isProvinceDropdownOpen}
              onToggle={toggleProvinceDropdown}
              hint={`Provinces in ${selectedCountryName}`}
            />

            <View style={styles.inputGroup}>
              <Text variant="caption" weight="700" color={colors.textSecondary} style={styles.inputLabel}>
                TOWN / CITY
              </Text>
              <View style={[styles.inputWrapper, shadow.sm]}>
                <TextInput
                  ref={townRef}
                  style={styles.textInput}
                  placeholder="e.g. Soweto, Mutare, Gaborone..."
                  placeholderTextColor="#94A3B8"
                  value={town}
                  onChangeText={setTown}
                  returnKeyType="next"
                  onSubmitEditing={() => gamerTagRef.current?.focus()}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption" weight="700" color={colors.textSecondary} style={styles.inputLabel}>
                GAMER TAG (ONLINE ALIAS)
              </Text>
              <View style={[styles.inputWrapper, shadow.sm]}>
                <TextInput
                  ref={gamerTagRef}
                  style={styles.textInput}
                  placeholder="e.g. KlipKing_01"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  value={gamerTag}
                  onChangeText={setGamerTag}
                  returnKeyType="done"
                  onSubmitEditing={handleNextStep2}
                />
              </View>
              <Text variant="caption" color={colors.textSecondary} style={styles.phoneHint}>
                Your Gamer Tag is visible to opponents in the Wi-Fi Battleground and Leaderboard.
              </Text>
            </View>

            <View style={styles.stepBtnRow}>
              <TouchableOpacity
                style={[styles.secondaryBtn, shadow.sm]}
                onPress={() => setCurrentStep(1)}
                activeOpacity={0.8}
              >
                <Text variant="h3" style={styles.secondaryBtnText}>
                  ← Back
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryBtnFlex, shadow.sm]}
                activeOpacity={0.85}
                onPress={handleNextStep2}
              >
                <Text variant="h3" style={styles.primaryBtnText}>
                  Continue to Security →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* STEP 3: Security & Credentials */}
        {currentStep === 3 && (
          <View style={styles.stepContentSection}>
            <View style={styles.inputGroup}>
              <Text variant="caption" weight="700" color={colors.textSecondary} style={styles.inputLabel}>
                EMAIL ADDRESS
              </Text>
              <View style={[styles.inputWrapper, shadow.sm]}>
                <TextInput
                  ref={emailRef}
                  style={styles.textInput}
                  placeholder="gamer@morabaraba.africa"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmEmailRef.current?.focus()}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption" weight="700" color={colors.textSecondary} style={styles.inputLabel}>
                CONFIRM EMAIL ADDRESS
              </Text>
              <View style={[styles.inputWrapper, shadow.sm]}>
                <TextInput
                  ref={confirmEmailRef}
                  style={styles.textInput}
                  placeholder="Re-enter your email"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={confirmEmail}
                  onChangeText={setConfirmEmail}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption" weight="700" color={colors.textSecondary} style={styles.inputLabel}>
                PASSWORD (8+ CHARACTERS)
              </Text>
              <View style={[styles.inputWrapper, shadow.sm]}>
                <TextInput
                  ref={passwordRef}
                  style={styles.textInput}
                  placeholder="Minimum 8 letters & numbers"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text variant="label" weight="700" color={colors.textSecondary}>
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </Text>
                </TouchableOpacity>
              </View>
              <PasswordStrengthMeter password={password} />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="caption" weight="700" color={colors.textSecondary} style={styles.inputLabel}>
                CONFIRM PASSWORD
              </Text>
              <View style={[styles.inputWrapper, shadow.sm]}>
                <TextInput
                  ref={confirmPasswordRef}
                  style={styles.textInput}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleFinalSubmit}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text variant="label" weight="700" color={colors.textSecondary}>
                    {showConfirmPassword ? 'HIDE' : 'SHOW'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.stepBtnRow}>
              <TouchableOpacity
                style={[styles.secondaryBtn, shadow.sm]}
                onPress={() => setCurrentStep(2)}
                activeOpacity={0.8}
              >
                <Text variant="h3" style={styles.secondaryBtnText}>
                  ← Back
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryBtnFlex, shadow.sm]}
                activeOpacity={0.85}
                onPress={handleFinalSubmit}
              >
                <Text variant="h3" style={styles.primaryBtnText}>
                  Create Account ✓
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Link back to Login */}
        <TouchableOpacity
          style={styles.switchAuth}
          onPress={onNavigateToLogin}
          activeOpacity={0.7}
        >
          <Text variant="body" color={colors.textSecondary} align="center">
            Already registered?{' '}
            <Text variant="body" color={colors.accent} weight="700">
              Sign In
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Country Code Modal matching bible_fun_facts reference */}
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
          <View style={[styles.modalCard, shadow.lg]}>
            <Text variant="h2" align="center" style={styles.modalTitle}>
              Select Country Code
            </Text>
            <Text variant="caption" align="center" color={colors.textSecondary} style={styles.modalSubtitle}>
              Select your Southern African regional dialing code.
            </Text>

            <ScrollView style={styles.countryModalScroll} showsVerticalScrollIndicator={false}>
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
                    activeOpacity={0.7}
                  >
                    <View>
                      <Text
                        variant="body"
                        weight={isSelected ? '700' : '500'}
                        color={isSelected ? colors.accentHover : colors.textPrimary}
                      >
                        {c.name}
                      </Text>
                      <Text variant="caption" color={colors.textSecondary}>
                        Region: {c.code}
                      </Text>
                    </View>
                    <Text
                      variant="h3"
                      weight="800"
                      color={isSelected ? colors.accentHover : colors.textPrimary}
                    >
                      {c.dialCode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalCloseBtn, shadow.sm]}
              onPress={() => setShowCountryPicker(false)}
              activeOpacity={0.8}
            >
              <Text variant="body" weight="700" color={colors.textPrimary}>
                Done
              </Text>
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
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  stepIndicatorSection: {
    marginBottom: spacing.lg,
  },
  stepPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  stepPillItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'rgba(15, 23, 42, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(229, 169, 60, 0.12)',
  },
  stepCircleCompleted: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  stepCircleText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  stepCircleTextActive: {
    color: colors.accentHover,
  },
  stepVerifiedLogo: {
    width: 14,
    height: 14,
    borderRadius: 0,
  },
  stepConnectorLine: {
    width: 36,
    height: 2,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    marginHorizontal: 4,
  },
  stepConnectorLineActive: {
    backgroundColor: colors.accent,
  },
  stepTitleContainer: {
    alignItems: 'center',
  },
  stepHeading: {
    color: colors.textPrimary,
    marginTop: 2,
  },
  stepContentSection: {
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
  datePickerBtn: {
    justifyContent: 'space-between',
  },
  datePickerText: {
    fontSize: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: colors.textPrimary,
    fontSize: 14,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  countryCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 48,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  countryChevron: {
    transform: [{ rotate: '90deg' }],
  },
  phoneInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  phoneHint: {
    marginTop: 4,
    paddingHorizontal: 4,
  },
  verifiedLogo: {
    width: 16,
    height: 16,
    borderRadius: 0,
  },
  chipsScroll: {
    flexGrow: 0,
    marginTop: 4,
  },
  selectorChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  selectorChipActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(229, 169, 60, 0.12)',
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: colors.accent,
    height: 50,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 8,
  },
  primaryBtnFlex: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.accent,
    height: 50,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  stepBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  secondaryBtn: {
    flexDirection: 'row',
    height: 50,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  secondaryBtnText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  switchAuth: {
    alignSelf: 'center',
    paddingVertical: spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '75%',
  },
  modalTitle: {
    color: colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    marginBottom: spacing.md,
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
    borderRadius: radius.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(15, 23, 42, 0.04)',
  },
  countryModalItemActive: {
    backgroundColor: 'rgba(229, 169, 60, 0.1)',
  },
  modalCloseBtn: {
    backgroundColor: colors.surfaceSecondary,
    marginTop: spacing.md,
    height: 44,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});

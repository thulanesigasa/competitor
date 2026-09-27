export interface UserProfile {
  id: string;
  name: string;
  surname: string;
  dob: string;
  cellphone: string;
  country: string;
  countryCode: string;
  province: string;
  town: string;
  gamerTag: string;
  email: string;
  createdAt: string;
}

export interface RegistrationStep1Data {
  name: string;
  surname: string;
  dob: string;
  countryDialCode: string;
  cellphone: string;
}

export interface RegistrationStep2Data {
  country: string;
  province: string;
  town: string;
  gamerTag: string;
}

export interface RegistrationStep3Data {
  email: string;
  confirmEmail: string;
  password: string;
  confirmPassword: string;
}

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: string;
  hasMinLength: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  hasUpperLower: boolean;
}

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../constants/theme';
import { PasswordStrengthResult } from '../../types/auth';

interface PasswordStrengthMeterProps {
  password: string;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const hasUpperLower = /[a-z]/.test(password) && /[A-Z]/.test(password);

  let score = 0;
  if (hasMinLength) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;
  if (hasUpperLower) score += 1;

  let label = 'Weak';
  if (!hasMinLength) {
    label = 'Minimum 8 characters required';
  } else if (score === 1) {
    label = 'Weak — add numbers & symbols';
  } else if (score === 2) {
    label = 'Fair — add special symbols';
  } else if (score === 3) {
    label = 'Strong — almost bulletproof';
  } else if (score === 4) {
    label = 'Bulletproof security';
  }

  return {
    score,
    label,
    hasMinLength,
    hasNumber,
    hasSpecial,
    hasUpperLower,
  };
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const { score, label } = evaluatePasswordStrength(password);

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        {[1, 2, 3, 4].map((step) => {
          const isActive = password.length > 0 && score >= step;
          return (
            <View
              key={step}
              style={[
                styles.segment,
                {
                  backgroundColor: isActive ? COLORS.accent : COLORS.surfaceLight,
                },
              ]}
            />
          );
        })}
      </View>
      {password.length > 0 && (
        <Text style={styles.label}>{label}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  barContainer: {
    flexDirection: 'row',
    height: 4,
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  label: {
    marginTop: 6,
    fontSize: 11,
    color: COLORS.accent,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

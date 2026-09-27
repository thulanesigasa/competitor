/**
 * 60-30-10 Design System Color Tokens
 * Matching the gold standard bible_fun_facts architecture:
 * - 60% Dominant Background: Clean Crisp Canvas (#FFFFFF / #F8FAFC)
 * - 30% Panel / Surface: Pure White (#FFFFFF) & Hairline Border (rgba(15, 23, 42, 0.08))
 * - 10% Accent: Morabaraba Gold / Orange (#E5A93C) & Soft Tint (rgba(229, 169, 60, 0.16))
 */

export const colors = {
  // 60% Dominant Background
  background: '#FFFFFF',
  backgroundSecondary: '#F8FAFC',

  // 30% Panel & Surface
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  surfaceElevated: '#FFFFFF',
  border: 'rgba(15, 23, 42, 0.08)',
  borderMuted: 'rgba(15, 23, 42, 0.04)',

  // 10% Accent - Radiant Gold / Orange
  accent: '#E5A93C',
  accentDark: '#D97706',
  accentHover: '#F59E0B',
  accentSoft: 'rgba(229, 169, 60, 0.14)',
  accentBorder: 'rgba(229, 169, 60, 0.35)',

  // Neutral Typography (Monochromatic within surfaces)
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textMuted: '#94A3B8',
  mutedText: '#94A3B8',

  // Aliases for compatibility
  white: '#FFFFFF',
  orange: '#E5A93C',
  darkSlate: '#0F172A',
  text: '#0F172A',
  secondaryText: '#64748B',
};


// Strict 60-30-10 Design System & Rule 15 Spacing
export const COLORS = {
  // 60% Dominant Background (Crisp White Canvas)
  background: '#FFFFFF',
  
  // 30% Surface / Panel / Board
  surface: '#F8FAFC',
  surfaceLight: '#F1F5F9',
  border: 'rgba(15, 23, 42, 0.08)',
  borderActive: '#E5A93C',

  // 10% Accent (Radiant Gold / Orange)
  accent: '#E5A93C',
  accentHover: '#D97706',
  accentSubtle: 'rgba(229, 169, 60, 0.12)',

  // Contrast & Typography
  white: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',

  // Board & Pieces
  boardBackground: '#F8FAFC',
  boardLines: '#94A3B8',
  player1: '#E5A93C',      // Gold / Ochre Cows
  player2: '#0F172A',      // Dark Slate / Charcoal Cows (High contrast on white board)
  vertexEmpty: '#E2E8F0',  // Empty board intersection ring
} as const;

export const SPACING = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 56,
  huge: 64,
} as const;

export const METRICS = {
  androidStatusBar: 24,
  androidAppBar: 56,
  androidNavBar: 104, // 56 + 48
  iosStatusBar: 54,
  iosNavBar: 96,
  iosTabBar: 56,
  iosHomeIndicator: 34,
  brandLogoHeader: 24,
  brandLogoAuth: 28,
  brandLogoModal: 50,
} as const;

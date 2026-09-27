// Strict 60-30-10 Design System & Rule 15 Spacing
export const COLORS = {
  // 60% Dominant Background
  background: '#0A0E17',
  
  // 30% Surface / Panel / Board
  surface: '#161F30',
  surfaceLight: '#1E2C44',
  border: 'rgba(255, 255, 255, 0.08)',
  borderActive: 'rgba(229, 169, 60, 0.4)',

  // 10% Accent (Radiant Gold / Ochre)
  accent: '#E5A93C',
  accentHover: '#F5B84C',
  accentSubtle: 'rgba(229, 169, 60, 0.15)',

  // Contrast & Typography
  white: '#FFFFFF',
  textMuted: '#8B9BB4',
  textSecondary: '#64748B',

  // Pieces
  player1: '#E5A93C',      // Gold / Ochre Cows
  player2: '#FFFFFF',      // Pure Ivory White Cows
  vertexEmpty: '#24324D',  // Board intersection ring
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

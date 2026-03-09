/**
 * SaintSal Labs — Design System
 * Dark-first, gold accent, Perplexity-level polish
 */

export const Colors = {
  // Core
  bg: '#0A0A0F',
  bgSecondary: '#111118',
  bgTertiary: '#1A1A24',
  bgCard: '#14141E',
  bgInput: '#1C1C28',
  bgElevated: '#1E1E2A',

  // Brand
  gold: '#D4A017',
  goldLight: '#F5C842',
  goldDim: '#8B6914',
  amber: '#F5A623',
  green: '#00D68F',
  greenVisor: '#39FF14',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textTertiary: '#6B6B7B',
  textMuted: '#4A4A5A',

  // Accent
  blue: '#4A9EFF',
  purple: '#8B5CF6',
  red: '#FF4757',
  orange: '#FF8C42',
  teal: '#2DD4BF',

  // Borders
  border: '#2A2A3A',
  borderLight: '#3A3A4A',
  borderFocus: '#D4A017',

  // Overlay
  overlay: 'rgba(0,0,0,0.7)',
  glassBg: 'rgba(20,20,30,0.85)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  gold: {
    shadowColor: '#D4A017',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// SAL Tier colors
export const TierColors = {
  mini: '#4A9EFF',
  pro: '#D4A017',
  max: '#8B5CF6',
  max_fast: '#FF4757',
} as const;

// Vertical accent colors
export const VerticalColors = {
  finance: '#00D68F',
  sports: '#FF8C42',
  real_estate: '#4A9EFF',
  news: '#8B5CF6',
  medical: '#FF4757',
  tech: '#2DD4BF',
} as const;

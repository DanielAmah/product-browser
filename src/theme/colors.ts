/**
 * Semantic color tokens
 *
 * Use these tokens instead of hex literals in components.
 * Inspired by Shop app's clean, modern aesthetic.
 */

export const colors = {
  // Primary brand colors
  primary: '#000000',
  primaryLight: '#333333',
  primaryDark: '#000000',

  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  backgroundTertiary: '#EBEBEB',

  // Surface colors (cards, modals)
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text colors
  textPrimary: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',
  textDisabled: '#CCCCCC',

  // Border colors
  border: '#E5E5E5',
  borderLight: '#F0F0F0',
  borderDark: '#CCCCCC',

  // Status colors
  success: '#34C759',
  successLight: '#E8F9ED',
  error: '#FF3B30',
  errorLight: '#FFEBEA',
  warning: '#FF9500',
  warningLight: '#FFF4E5',

  // Sale/discount color
  sale: '#FF3B30',

  // Interactive states
  pressed: 'rgba(0, 0, 0, 0.05)',
  disabled: '#F5F5F5',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Skeleton/placeholder
  skeleton: '#E5E5E5',
  skeletonHighlight: '#F0F0F0',

  // Tab bar
  tabBarActive: '#000000',
  tabBarInactive: '#999999',

  // Badge
  badge: '#FF3B30',
  badgeText: '#FFFFFF',
} as const;

export type ColorToken = keyof typeof colors;

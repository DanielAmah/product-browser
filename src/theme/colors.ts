export const colors = {
  primary: '#000000',
  primaryLight: '#333333',
  primaryDark: '#000000',

  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  backgroundTertiary: '#EBEBEB',

  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  textPrimary: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',
  textDisabled: '#CCCCCC',

  border: '#E5E5E5',
  borderLight: '#F0F0F0',
  borderDark: '#CCCCCC',

  success: '#34C759',
  successLight: '#E8F9ED',
  error: '#FF3B30',
  errorLight: '#FFEBEA',
  warning: '#FF9500',
  warningLight: '#FFF4E5',

  sale: '#FF3B30',

  pressed: 'rgba(0, 0, 0, 0.05)',
  disabled: '#F5F5F5',

  overlay: 'rgba(0, 0, 0, 0.5)',

  skeleton: '#E5E5E5',
  skeletonHighlight: '#F0F0F0',

  tabBarActive: '#000000',
  tabBarInactive: '#999999',

  badge: '#FF3B30',
  badgeText: '#FFFFFF',
} as const;

export type ColorToken = keyof typeof colors;

// 4px grid
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
  sectionLg: 48,
} as const;

export type SpacingToken = keyof typeof spacing;

export const layout = {
  screenPadding: spacing.lg,
  cardRadius: 12,
  buttonRadius: 8,
  pillRadius: 20,
  inputRadius: 8,
  thumbnailSize: 60,
  cardImageHeight: 180,
  tabBarHeight: 49,
  headerHeight: 44,
} as const;

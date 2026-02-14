/**
 * Spacing scale based on 4px grid
 *
 * Consistent spacing creates visual rhythm and hierarchy.
 */

export const spacing = {
  /** 0px */
  none: 0,
  /** 2px - Minimal spacing for tight elements */
  xxs: 2,
  /** 4px - Base unit */
  xs: 4,
  /** 8px - Small spacing */
  sm: 8,
  /** 12px - Medium-small spacing */
  md: 12,
  /** 16px - Standard spacing */
  lg: 16,
  /** 20px - Medium-large spacing */
  xl: 20,
  /** 24px - Large spacing */
  xxl: 24,
  /** 32px - Extra large spacing */
  xxxl: 32,
  /** 40px - Section spacing */
  section: 40,
  /** 48px - Large section spacing */
  sectionLg: 48,
} as const;

export type SpacingToken = keyof typeof spacing;

/**
 * Common layout dimensions
 */
export const layout = {
  /** Screen horizontal padding */
  screenPadding: spacing.lg,
  /** Card border radius */
  cardRadius: 12,
  /** Button border radius */
  buttonRadius: 8,
  /** Pill/chip border radius */
  pillRadius: 20,
  /** Input border radius */
  inputRadius: 8,
  /** Image thumbnail size */
  thumbnailSize: 60,
  /** Product card image height */
  cardImageHeight: 180,
  /** Tab bar height */
  tabBarHeight: 49,
  /** Header height */
  headerHeight: 44,
} as const;

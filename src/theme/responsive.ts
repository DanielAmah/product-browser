/**
 * Responsive utilities
 *
 * Detects device form factor and provides scaled values.
 * iPad threshold: 768px (standard iPad portrait width).
 */

import {Dimensions} from 'react-native';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const IS_TABLET = SCREEN_WIDTH >= 768;

/**
 * Returns the phone value on iPhone or the tablet value on iPad.
 */
export function responsive<T>(phone: T, tablet: T): T {
  return IS_TABLET ? tablet : phone;
}

export const isTablet = IS_TABLET;

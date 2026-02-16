import {Dimensions} from 'react-native';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const IS_TABLET = SCREEN_WIDTH >= 768;

export function responsive<T>(phone: T, tablet: T): T {
  return IS_TABLET ? tablet : phone;
}

export const isTablet = IS_TABLET;

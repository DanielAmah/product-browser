/**
 * Navigation Types
 *
 * Type-safe navigation with React Navigation.
 * Every navigation.navigate() call is compile-time checked.
 */

import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';

/**
 * Products Stack - nested in Products tab
 */
export type ProductsStackParamList = {
  ProductList: undefined;
  ProductDetail: {productId: string};
};

/**
 * Cart Stack - nested in Cart tab
 */
export type CartStackParamList = {
  Cart: undefined;
};

/**
 * Root Tab Navigator
 */
export type RootTabParamList = {
  ProductsTab: NavigatorScreenParams<ProductsStackParamList>;
  CartTab: NavigatorScreenParams<CartStackParamList>;
};

/**
 * Composite screen props for screens that need both stack + tab navigation
 */

// ProductListScreen can navigate within stack and across tabs
export type ProductListScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProductsStackParamList, 'ProductList'>,
  BottomTabScreenProps<RootTabParamList>
>;

// ProductDetailScreen can navigate within stack and across tabs
export type ProductDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProductsStackParamList, 'ProductDetail'>,
  BottomTabScreenProps<RootTabParamList>
>;

// CartScreen is a tab screen
export type CartScreenProps = BottomTabScreenProps<RootTabParamList, 'CartTab'>;

/**
 * Declare global navigation types for useNavigation hook
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}

import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';

export type ProductsStackParamList = {
  ProductList: undefined;
  ProductDetail: {productId: string};
};

export type CartStackParamList = {
  Cart: undefined;
};

export type RootTabParamList = {
  ProductsTab: NavigatorScreenParams<ProductsStackParamList>;
  CartTab: NavigatorScreenParams<CartStackParamList>;
};

// Composite screen props — stack + tab navigation in one type

export type ProductListScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProductsStackParamList, 'ProductList'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type ProductDetailScreenProps = CompositeScreenProps<
  NativeStackScreenProps<ProductsStackParamList, 'ProductDetail'>,
  BottomTabScreenProps<RootTabParamList>
>;

export type CartScreenProps = BottomTabScreenProps<RootTabParamList, 'CartTab'>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}

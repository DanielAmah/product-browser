import React from 'react';
import {StyleSheet, View, Platform} from 'react-native';
import {NavigationContainer, LinkingOptions} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Store, ShoppingBag} from 'lucide-react-native';

import type {
  RootTabParamList,
  ProductsStackParamList,
  CartStackParamList,
} from './types';
import {ProductListScreen, ProductDetailScreen, CartScreen} from '@screens';
import {useCartStore, selectTotalItems} from '@store/cartStore';
import {colors, spacing} from '@theme';
import {Badge} from '@components/Badge';

const Tab = createBottomTabNavigator<RootTabParamList>();
const ProductsStack = createNativeStackNavigator<ProductsStackParamList>();
const CartStack = createNativeStackNavigator<CartStackParamList>();

function ProductsStackNavigator() {
  return (
    <ProductsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.textPrimary,
        },
        headerTitleAlign: 'center',
        headerTintColor: colors.primary,
        headerBackTitle: '',
        headerShadowVisible: false,
      }}>
      <ProductsStack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{
          title: 'Shop',
          headerTitleAlign: 'center',
        }}
      />
      <ProductsStack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{
          title: '',
        }}
      />
    </ProductsStack.Navigator>
  );
}

function CartStackNavigator() {
  return (
    <CartStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '700',
          color: colors.textPrimary,
        },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
      }}>
      <CartStack.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: 'Cart',
        }}
      />
    </CartStack.Navigator>
  );
}

function CartTabIcon({color, size}: {color: string; size: number}) {
  const totalItems = useCartStore(selectTotalItems);

  return (
    <View style={styles.iconContainer}>
      <ShoppingBag
        size={size - 2}
        color={color}
        strokeWidth={1.8}
      />
      {totalItems > 0 && <Badge count={totalItems} />}
    </View>
  );
}

const linking: LinkingOptions<RootTabParamList> = {
  prefixes: ['reactiv://'],
  config: {
    screens: {
      ProductsTab: {
        screens: {
          ProductList: 'products',
          ProductDetail: 'products/:productId',
        },
      },
      CartTab: {
        screens: {
          Cart: 'cart',
        },
      },
    },
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer linking={linking}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: colors.tabBarActive,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: styles.tabBarItem,
        }}>
        <Tab.Screen
          name="ProductsTab"
          component={ProductsStackNavigator}
          options={{
            title: 'Shop',
            tabBarIcon: ({color, size}) => (
              <Store size={size - 2} color={color} strokeWidth={1.8} />
            ),
            tabBarAccessibilityLabel: 'Shop tab',
          }}
        />
        <Tab.Screen
          name="CartTab"
          component={CartStackNavigator}
          options={{
            title: 'Cart',
            tabBarIcon: ({color, size}) => (
              <CartTabIcon color={color} size={size} />
            ),
            tabBarAccessibilityLabel: 'Cart tab',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopColor: colors.borderLight,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.xs,
    height: Platform.OS === 'ios' ? 88 : 64,
    elevation: 0,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  tabBarItem: {
    paddingTop: 4,
  },
  iconContainer: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

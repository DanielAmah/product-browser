/**
 * RootNavigator
 *
 * Main navigation setup with BottomTabs and nested stacks.
 * Includes type-safe navigation and deep link configuration.
 */

import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {NavigationContainer, LinkingOptions} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import type {
  RootTabParamList,
  ProductsStackParamList,
  CartStackParamList,
} from './types';
import {ProductListScreen, ProductDetailScreen, CartScreen} from '@screens';
import {useCartStore, selectTotalItems} from '@store/cartStore';
import {colors, spacing, textStyles} from '@theme';
import {Badge} from '@components/Badge';

// Create navigators
const Tab = createBottomTabNavigator<RootTabParamList>();
const ProductsStack = createNativeStackNavigator<ProductsStackParamList>();
const CartStack = createNativeStackNavigator<CartStackParamList>();

/**
 * Products Stack Navigator
 */
function ProductsStackNavigator() {
  return (
    <ProductsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          ...textStyles.h3,
          color: colors.textPrimary,
        },
        headerTintColor: colors.primary,
        headerBackTitle: '',
        headerShadowVisible: false,
      }}>
      <ProductsStack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{
          title: 'Shop',
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

/**
 * Cart Stack Navigator
 */
function CartStackNavigator() {
  return (
    <CartStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTitleStyle: {
          ...textStyles.h3,
          color: colors.textPrimary,
        },
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

/**
 * Tab Bar Icon Components
 */
interface TabIconProps {
  focused: boolean;
  color: string;
  size: number;
}

function ShopIcon({focused, color}: TabIconProps) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.iconText, {color}]}>
        {focused ? '🏠' : '🏠'}
      </Text>
    </View>
  );
}

function CartIcon({focused, color}: TabIconProps) {
  const totalItems = useCartStore(selectTotalItems);

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.iconText, {color}]}>
        {focused ? '🛒' : '🛒'}
      </Text>
      {totalItems > 0 && <Badge count={totalItems} />}
    </View>
  );
}

/**
 * Deep linking configuration
 */
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

/**
 * Root Navigator Component
 */
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
        }}>
        <Tab.Screen
          name="ProductsTab"
          component={ProductsStackNavigator}
          options={{
            title: 'Shop',
            tabBarIcon: ShopIcon,
            tabBarAccessibilityLabel: 'Shop tab',
          }}
        />
        <Tab.Screen
          name="CartTab"
          component={CartStackNavigator}
          options={{
            title: 'Cart',
            tabBarIcon: CartIcon,
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
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: spacing.xs,
    height: 60,
  },
  tabBarLabel: {
    ...textStyles.caption,
    marginBottom: spacing.xs,
  },
  iconContainer: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
  },
});

/**
 * QuantityStepper Component
 *
 * Quantity control with increment/decrement buttons.
 * Shows trash icon when quantity is 1 and decrement is pressed.
 */

import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {colors, spacing, layout, textStyles} from '@theme';

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const QuantityStepper = React.memo<QuantityStepperProps>(
  ({quantity, onIncrement, onDecrement}) => {
    const isRemoveAction = quantity === 1;

    return (
      <View style={styles.container}>
        <Pressable
          style={({pressed}) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={onDecrement}
          accessibilityRole="button"
          accessibilityLabel={
            isRemoveAction ? 'Remove item from cart' : 'Decrease quantity'
          }
          accessibilityHint={
            isRemoveAction
              ? 'Removes this item from your cart'
              : 'Decreases quantity by one'
          }>
          <Text style={styles.buttonText}>{isRemoveAction ? '🗑️' : '−'}</Text>
        </Pressable>

        <View
          style={styles.quantityContainer}
          accessibilityLabel={`Quantity: ${quantity}`}>
          <Text style={styles.quantity}>{quantity}</Text>
        </View>

        <Pressable
          style={({pressed}) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={onIncrement}
          accessibilityRole="button"
          accessibilityLabel="Increase quantity"
          accessibilityHint="Increases quantity by one">
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
    );
  },
);

QuantityStepper.displayName = 'QuantityStepper';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: layout.buttonRadius,
    overflow: 'hidden',
  },
  button: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.pressed,
  },
  buttonText: {
    ...textStyles.body,
    fontSize: 18,
    color: colors.textPrimary,
  },
  quantityContainer: {
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    ...textStyles.label,
    color: colors.textPrimary,
  },
});

import React from 'react';
import {View, Text, StyleSheet, Pressable, Platform} from 'react-native';
import {ShoppingBag} from 'lucide-react-native';
import {colors, spacing} from '@theme';

interface AddToCartButtonProps {
  label: string;
  accessibilityLabel: string;
  disabled: boolean;
  bottomInset: number;
  onPress: () => void;
}

export function AddToCartButton({
  label,
  accessibilityLabel,
  disabled,
  bottomInset,
  onPress,
}: AddToCartButtonProps) {
  return (
    <View
      style={[
        styles.buttonContainer,
        {paddingBottom: bottomInset || spacing.lg},
      ]}>
      <Pressable
        style={({pressed}) => [
          styles.addToCartButton,
          disabled && styles.buttonDisabled,
          pressed && !disabled && styles.buttonPressed,
        ]}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{disabled}}>
        {!disabled && (
          <ShoppingBag
            size={20}
            color={colors.textInverse}
            strokeWidth={2}
            style={styles.buttonIcon}
          />
        )}
        <Text
          style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
          {label}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -3},
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  addToCartButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonDisabled: {
    backgroundColor: colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonPressed: {
    backgroundColor: colors.primaryLight,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textInverse,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  buttonTextDisabled: {
    color: colors.textTertiary,
  },
});

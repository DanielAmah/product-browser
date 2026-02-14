/**
 * VariantSelector Component
 *
 * Displays option pills for variant selection.
 * Supports multiple option axes (Color, Size, etc.).
 */

import React, {useCallback} from 'react';
import {View, Text, StyleSheet, Pressable, ScrollView} from 'react-native';
import type {ProductOption} from '@apptypes/product';
import {colors, spacing, layout, textStyles} from '@theme';

interface VariantSelectorProps {
  options: ProductOption[];
  selectedOptions: Record<string, string>;
  optionAvailability: Record<string, Record<string, boolean>>;
  onSelectOption: (optionName: string, value: string) => void;
}

interface OptionPillProps {
  value: string;
  isSelected: boolean;
  isAvailable: boolean;
  onPress: () => void;
}

const OptionPill = React.memo<OptionPillProps>(
  ({value, isSelected, isAvailable, onPress}) => {
    return (
      <Pressable
        style={({pressed}) => [
          styles.pill,
          isSelected && styles.pillSelected,
          !isAvailable && styles.pillUnavailable,
          pressed && styles.pillPressed,
        ]}
        onPress={onPress}
        disabled={!isAvailable}
        accessibilityRole="radio"
        accessibilityState={{
          selected: isSelected,
          disabled: !isAvailable,
        }}
        accessibilityLabel={`${value}${!isAvailable ? ', unavailable' : ''}`}>
        <Text
          style={[
            styles.pillText,
            isSelected && styles.pillTextSelected,
            !isAvailable && styles.pillTextUnavailable,
          ]}>
          {value}
        </Text>
      </Pressable>
    );
  },
);

OptionPill.displayName = 'OptionPill';

export const VariantSelector = React.memo<VariantSelectorProps>(
  ({options, selectedOptions, optionAvailability, onSelectOption}) => {
    return (
      <View style={styles.container}>
        {options.map(option => (
          <View key={option.id} style={styles.optionGroup}>
            <Text style={styles.optionLabel}>{option.name}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillsContainer}
              accessibilityRole="radiogroup"
              accessibilityLabel={`${option.name} options`}>
              {option.values.map(value => {
                const isSelected = selectedOptions[option.name] === value;
                const isAvailable =
                  optionAvailability[option.name]?.[value] ?? false;

                return (
                  <OptionPill
                    key={value}
                    value={value}
                    isSelected={isSelected}
                    isAvailable={isAvailable}
                    onPress={() => onSelectOption(option.name, value)}
                  />
                );
              })}
            </ScrollView>
          </View>
        ))}
      </View>
    );
  },
);

VariantSelector.displayName = 'VariantSelector';

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  optionGroup: {
    gap: spacing.sm,
  },
  optionLabel: {
    ...textStyles.label,
    color: colors.textPrimary,
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  pill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: layout.pillRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  pillUnavailable: {
    borderColor: colors.borderLight,
    backgroundColor: colors.backgroundSecondary,
  },
  pillPressed: {
    opacity: 0.8,
  },
  pillText: {
    ...textStyles.buttonSmall,
    color: colors.textPrimary,
  },
  pillTextSelected: {
    color: colors.textInverse,
  },
  pillTextUnavailable: {
    color: colors.textDisabled,
  },
});

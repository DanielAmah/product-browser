import React, {useCallback, useRef} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import type {ProductOption} from '@apptypes/product';
import {colors, spacing} from '@theme';

interface VariantSelectorProps {
  options: ProductOption[];
  selectedOptions: Record<string, string>;
  optionAvailability: Record<string, Record<string, boolean>>;
  onSelectOption: (optionName: string, value: string) => void;
}

interface OptionPillProps {
  optionName: string;
  value: string;
  isSelected: boolean;
  isAvailable: boolean;
  onSelectOption: (optionName: string, value: string) => void;
}

const DEBOUNCE_MS = 300;

const OptionPill = React.memo<OptionPillProps>(
  ({optionName, value, isSelected, isAvailable, onSelectOption}) => {
    const lastPress = useRef(0);

    const handlePress = useCallback(() => {
      const now = Date.now();
      if (now - lastPress.current < DEBOUNCE_MS) {
        return;
      }
      lastPress.current = now;
      onSelectOption(optionName, value);
    }, [onSelectOption, optionName, value]);

    return (
      <Pressable
        style={({pressed}) => [
          styles.pill,
          isSelected && styles.pillSelected,
          !isAvailable && styles.pillUnavailable,
          pressed && styles.pillPressed,
        ]}
        onPress={handlePress}
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
            <View
              style={styles.pillsContainer}
              accessibilityRole="radiogroup"
              accessibilityLabel={`${option.name} options`}>
              {option.values.map(value => {
                const isSelected = selectedOptions[option.name] === value;
                const isAvailable =
                  optionAvailability[option.name]?.[value] ?? false;

                return (
                  <OptionPill
                    key={value}
                    optionName={option.name}
                    value={value}
                    isSelected={isSelected}
                    isAvailable={isAvailable}
                    onSelectOption={onSelectOption}
                  />
                );
              })}
            </View>
          </View>
        ))}
      </View>
    );
  },
);

VariantSelector.displayName = 'VariantSelector';

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  optionGroup: {
    gap: spacing.sm,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1.5,
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
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  pillTextSelected: {
    color: colors.textInverse,
  },
  pillTextUnavailable: {
    color: colors.textDisabled,
    textDecorationLine: 'line-through',
  },
});

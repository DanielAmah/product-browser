import React, {useState, memo} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {ChevronDown, ChevronUp, CheckCircle, XCircle} from 'lucide-react-native';
import type {Product, Variant} from '@apptypes/product';
import {isOnSale, calculateDiscountPercentage} from '@utils/currency';
import {PriceDisplay} from '@components/PriceDisplay';
import {VariantSelector} from '@components/VariantSelector';
import {colors, spacing} from '@theme';

interface ProductInfoProps {
  product: Product;
  selectedVariant: Variant | undefined;
  selectedOptions: Record<string, string>;
  optionAvailability: Record<string, Record<string, boolean>>;
  onSelectOption: (optionName: string, value: string) => void;
}

export const ProductInfo = memo(function ProductInfo({
  product,
  selectedVariant,
  selectedOptions,
  optionAvailability,
  onSelectOption,
}: ProductInfoProps) {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const onSale =
    selectedVariant?.compareAtPrice &&
    isOnSale(selectedVariant.compareAtPrice, selectedVariant.price);
  const discountPct =
    onSale && selectedVariant?.compareAtPrice
      ? calculateDiscountPercentage(
          selectedVariant.compareAtPrice,
          selectedVariant.price,
        )
      : 0;

  const isAvailable = selectedVariant?.availableForSale ?? product.availableForSale;

  return (
    <View style={styles.content}>
      <Text style={styles.title} accessibilityRole="header">
        {product.title}
      </Text>

      <Text style={styles.vendor}>{product.vendor}</Text>

      {selectedVariant && (
        <View style={styles.priceSection}>
          <PriceDisplay
            price={selectedVariant.price}
            compareAtPrice={selectedVariant.compareAtPrice}
            size="large"
          />
          {onSale && (
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>Save {discountPct}%</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.availabilityRow}>
        {isAvailable ? (
          <>
            <CheckCircle size={16} color={colors.success} strokeWidth={2} />
            <Text style={styles.availableText}>In Stock</Text>
          </>
        ) : (
          <>
            <XCircle size={16} color={colors.error} strokeWidth={2} />
            <Text style={styles.unavailableText}>Out of Stock</Text>
          </>
        )}
      </View>

      {product.options.length > 0 && (
        <View style={styles.variantSection}>
          <VariantSelector
            options={product.options}
            selectedOptions={selectedOptions}
            optionAvailability={optionAvailability}
            onSelectOption={onSelectOption}
          />
        </View>
      )}

      <View style={styles.divider} />

      {product.description ? (
        <View style={styles.section}>
          <Pressable
            style={styles.sectionHeader}
            onPress={() => setDescriptionExpanded(prev => !prev)}
            accessibilityRole="button"
            accessibilityState={{expanded: descriptionExpanded}}
            accessibilityLabel="Product Details">
            <Text style={styles.sectionTitle}>Product Details</Text>
            {descriptionExpanded ? (
              <ChevronUp size={20} color={colors.textSecondary} strokeWidth={2} />
            ) : (
              <ChevronDown size={20} color={colors.textSecondary} strokeWidth={2} />
            )}
          </Pressable>
          {descriptionExpanded && (
            <Text style={styles.description}>{product.description}</Text>
          )}
        </View>
      ) : null}

      {product.tags && product.tags.length > 0 && (
        <>
          <View style={styles.divider} />
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsRow}>
              {product.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 30,
    marginBottom: 4,
  },
  vendor: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    marginBottom: 16,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  saveBadge: {
    backgroundColor: colors.sale,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  saveBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  availableText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.success,
  },
  unavailableText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.error,
  },
  variantSection: {
    marginTop: 20,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  description: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 24,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});

/**
 * ImageCarousel Component
 *
 * Horizontal image pager with page indicator dots.
 */

import React, {useState, useCallback} from 'react';
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import type {ProductImage} from '@apptypes/product';
import {colors, spacing} from '@theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH;

interface ImageCarouselProps {
  images: ProductImage[];
  productTitle: string;
}

export function ImageCarousel({images, productTitle}: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SCREEN_WIDTH);
      setActiveIndex(index);
    },
    [],
  );

  if (images.length === 0) {
    return (
      <View style={[styles.container, styles.placeholder]}>
        <View style={styles.placeholderInner} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        accessibilityRole="adjustable"
        accessibilityLabel={`Product images, ${images.length} total, showing image ${activeIndex + 1}`}>
        {images.map((image, index) => (
          <Image
            key={image.id}
            source={{uri: image.url}}
            style={styles.image}
            resizeMode="cover"
            accessibilityLabel={`${productTitle}, image ${index + 1} of ${images.length}`}
          />
        ))}
      </ScrollView>

      {/* Page Indicator Dots */}
      {images.length > 1 && (
        <View style={styles.dotsContainer}>
          {images.map((image, index) => (
            <View
              key={image.id}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: colors.backgroundSecondary,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderInner: {
    width: '50%',
    height: '50%',
    backgroundColor: colors.skeleton,
    borderRadius: 8,
  },
  image: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
});

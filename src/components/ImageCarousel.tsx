import React, {useState, useCallback, useMemo, useRef, useEffect, memo} from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
} from 'react-native';
import type {ProductImage} from '@apptypes/product';
import {getSquareImageUrl} from '@utils/image';
import {colors, spacing} from '@theme';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH * 0.95;
const THUMBNAIL_SIZE = 56;

interface ImageCarouselProps {
  images: ProductImage[];
  productTitle: string;
  /** When set, the carousel smoothly scrolls to this image */
  focusImageId?: string;
}

export const ImageCarousel = memo(function ImageCarousel({
  images,
  productTitle,
  focusImageId,
}: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isAnimating = useRef(false);

  const squareImages = useMemo(
    () =>
      images.map(img => ({
        ...img,
        url: getSquareImageUrl(img.url, 1200),
      })),
    [images],
  );

  const thumbnailImages = useMemo(
    () =>
      images.map(img => ({
        ...img,
        url: getSquareImageUrl(img.url, 120),
      })),
    [images],
  );

  // Scroll to the focused image when variant changes
  useEffect(() => {
    if (!focusImageId) {
      return;
    }
    const idx = squareImages.findIndex(img => img.id === focusImageId);
    if (idx >= 0 && idx !== activeIndex) {
      isAnimating.current = true;
      setActiveIndex(idx);
      scrollRef.current?.scrollTo({x: idx * SCREEN_WIDTH, animated: true});
      setTimeout(() => {
        isAnimating.current = false;
      }, 400);
    }
  }, [focusImageId, squareImages]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isAnimating.current) {
        return;
      }
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SCREEN_WIDTH);
      setActiveIndex(index);
    },
    [],
  );

  const scrollToIndex = useCallback((index: number) => {
    isAnimating.current = true;
    setActiveIndex(index);
    scrollRef.current?.scrollTo({x: index * SCREEN_WIDTH, animated: true});
    setTimeout(() => {
      isAnimating.current = false;
    }, 400);
  }, []);

  if (squareImages.length === 0) {
    return (
      <View style={[styles.container, styles.placeholder]}>
        <View style={styles.placeholderInner} />
      </View>
    );
  }

  return (
    <View>
      <View style={styles.container}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          decelerationRate="fast"
          accessibilityRole="adjustable"
          accessibilityLabel={`Product images, ${squareImages.length} total, showing image ${activeIndex + 1}`}>
          {squareImages.map((image, index) => (
            <Image
              key={image.id}
              source={{uri: image.url}}
              style={styles.image}
              resizeMode="cover"
              accessibilityLabel={`${productTitle}, image ${index + 1} of ${squareImages.length}`}
            />
          ))}
        </ScrollView>

        {squareImages.length > 1 && (
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {activeIndex + 1} / {squareImages.length}
            </Text>
          </View>
        )}
      </View>

      {squareImages.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailStrip}>
          {thumbnailImages.map((image, index) => (
            <Pressable
              key={image.id}
              onPress={() => scrollToIndex(index)}
              accessibilityLabel={`View image ${index + 1}`}
              accessibilityRole="button">
              <Image
                source={{uri: image.url}}
                style={[
                  styles.thumbnail,
                  index === activeIndex && styles.thumbnailActive,
                ]}
                resizeMode="cover"
              />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
});

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
  counter: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  thumbnailStrip: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.backgroundSecondary,
  },
  thumbnailActive: {
    borderColor: colors.primary,
  },
});

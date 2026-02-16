import {getSquareImageUrl} from '../../utils/image';

describe('getSquareImageUrl', () => {
  test('replaces embedded dimensions with a square crop', () => {
    const url = 'https://cdn.shopify.com/s/files/1/image_1180x400.jpg';
    expect(getSquareImageUrl(url)).toBe(
      'https://cdn.shopify.com/s/files/1/image_600x600.jpg',
    );
  });

  test('accepts a custom size', () => {
    const url = 'https://cdn.shopify.com/s/files/1/image_1180x400.png';
    expect(getSquareImageUrl(url, 300)).toBe(
      'https://cdn.shopify.com/s/files/1/image_300x300.png',
    );
  });

  test('preserves query params', () => {
    const url = 'https://cdn.shopify.com/s/files/1/img_800x600.jpg?v=123';
    expect(getSquareImageUrl(url, 500)).toContain('_500x500.jpg?v=123');
  });

  test('returns the original URL when no dimension pattern is found', () => {
    const url = 'https://cdn.shopify.com/s/files/1/img.jpg';
    expect(getSquareImageUrl(url)).toBe(url);
  });

  test('only replaces the last dimension segment (before the extension)', () => {
    const url = 'https://cdn.shopify.com/s/files/1/path_100x200/image_300x400.jpg';
    expect(getSquareImageUrl(url)).toBe(
      'https://cdn.shopify.com/s/files/1/path_100x200/image_600x600.jpg',
    );
  });
});

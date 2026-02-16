import React from 'react';
import {render} from '@testing-library/react-native';
import {ImageCarousel} from '../../components/ImageCarousel';
import type {ProductImage} from '../../types/product';

jest.mock('../../utils/image', () => ({
  getSquareImageUrl: (url: string) => url,
}));

const images: ProductImage[] = [
  {id: 'a', url: 'https://cdn.example.com/a.jpg'},
  {id: 'b', url: 'https://cdn.example.com/b.jpg'},
  {id: 'c', url: 'https://cdn.example.com/c.jpg'},
];

describe('ImageCarousel', () => {
  it('renders all images in the scroll view', () => {
    const {getAllByLabelText} = render(
      <ImageCarousel images={images} productTitle="Widget" />,
    );
    // each image gets an a11y label like "Widget - image N of 3"
    const imgs = getAllByLabelText(/Widget/);
    expect(imgs.length).toBeGreaterThanOrEqual(3);
  });

  it('shows the image counter', () => {
    const {getByLabelText} = render(
      <ImageCarousel images={images} productTitle="Widget" />,
    );
    // counter badge, e.g. "1 of 3" or a11y "3 total"
    expect(getByLabelText(/3 total/)).toBeDefined();
  });

  it('handles a single image without crashing', () => {
    const {toJSON} = render(
      <ImageCarousel images={[images[0]]} productTitle="Solo" />,
    );
    expect(toJSON()).not.toBeNull();
  });

  it('handles empty images gracefully', () => {
    const {toJSON} = render(
      <ImageCarousel images={[]} productTitle="Empty" />,
    );
    // should still render (placeholder or empty container)
    expect(toJSON()).not.toBeNull();
  });

  it('renders a thumbnail strip for multi-image products', () => {
    const {getAllByLabelText} = render(
      <ImageCarousel images={images} productTitle="Widget" />,
    );
    // thumbnails have a11y label like "View image 1", "View image 2"
    const thumbnails = getAllByLabelText(/View image/);
    expect(thumbnails.length).toBe(3);
  });
});

/**
 * Currency Utilities Tests
 */

import {
  parseMoney,
  formatPrice,
  formatPriceForVoiceOver,
  isOnSale,
  calculateDiscountPercentage,
} from '../../utils/currency';
import type {Money} from '../../types/product';

describe('currency utilities', () => {
  describe('parseMoney', () => {
    it('parses a valid money amount', () => {
      const money: Money = {amount: '28.96', currencyCode: 'CAD'};
      expect(parseMoney(money)).toBe(28.96);
    });

    it('parses zero amount', () => {
      const money: Money = {amount: '0.00', currencyCode: 'CAD'};
      expect(parseMoney(money)).toBe(0);
    });

    it('parses "0.0" as zero', () => {
      const money: Money = {amount: '0.0', currencyCode: 'CAD'};
      expect(parseMoney(money)).toBe(0);
    });

    it('parses large amounts', () => {
      const money: Money = {amount: '1234.56', currencyCode: 'CAD'};
      expect(parseMoney(money)).toBe(1234.56);
    });
  });

  describe('formatPrice', () => {
    it('formats CAD price correctly', () => {
      const money: Money = {amount: '28.96', currencyCode: 'CAD'};
      const formatted = formatPrice(money);
      expect(formatted).toContain('28.96');
      expect(formatted).toContain('CAD');
    });

    it('formats zero price', () => {
      const money: Money = {amount: '0.00', currencyCode: 'CAD'};
      const formatted = formatPrice(money);
      expect(formatted).toContain('0.00');
    });
  });

  describe('formatPriceForVoiceOver', () => {
    it('formats whole dollar amounts', () => {
      const money: Money = {amount: '28.00', currencyCode: 'CAD'};
      const result = formatPriceForVoiceOver(money);
      expect(result).toBe('28 dollars Canadian');
    });

    it('formats dollars and cents', () => {
      const money: Money = {amount: '28.96', currencyCode: 'CAD'};
      const result = formatPriceForVoiceOver(money);
      expect(result).toBe('28 dollars and 96 cents Canadian');
    });

    it('formats zero correctly', () => {
      const money: Money = {amount: '0.00', currencyCode: 'CAD'};
      const result = formatPriceForVoiceOver(money);
      expect(result).toBe('0 dollars Canadian');
    });
  });

  describe('isOnSale', () => {
    it('returns false for null compareAtPrice', () => {
      expect(isOnSale(null)).toBe(false);
    });

    it('returns false for "0.0" compareAtPrice', () => {
      const compareAt: Money = {amount: '0.0', currencyCode: 'CAD'};
      expect(isOnSale(compareAt)).toBe(false);
    });

    it('returns false for "0.00" compareAtPrice', () => {
      const compareAt: Money = {amount: '0.00', currencyCode: 'CAD'};
      expect(isOnSale(compareAt)).toBe(false);
    });

    it('returns true for positive compareAtPrice', () => {
      const compareAt: Money = {amount: '45.00', currencyCode: 'CAD'};
      expect(isOnSale(compareAt)).toBe(true);
    });
  });

  describe('calculateDiscountPercentage', () => {
    it('calculates correct discount percentage', () => {
      const original: Money = {amount: '100.00', currencyCode: 'CAD'};
      const sale: Money = {amount: '75.00', currencyCode: 'CAD'};
      expect(calculateDiscountPercentage(original, sale)).toBe(25);
    });

    it('returns 0 for zero original price', () => {
      const original: Money = {amount: '0.00', currencyCode: 'CAD'};
      const sale: Money = {amount: '50.00', currencyCode: 'CAD'};
      expect(calculateDiscountPercentage(original, sale)).toBe(0);
    });

    it('rounds to nearest integer', () => {
      const original: Money = {amount: '100.00', currencyCode: 'CAD'};
      const sale: Money = {amount: '66.67', currencyCode: 'CAD'};
      expect(calculateDiscountPercentage(original, sale)).toBe(33);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { parseReceiptText, getMockDemoReceipt, generateId } from '@/lib/ocr';

describe('OCR Parsing', () => {
  describe('parseReceiptText', () => {
    it('should parse simple receipt text', () => {
      const text = `Downtown Cafe
2024-01-15

Grilled Chicken Sandwich   $12.99
Iced Latte                 $5.49
Iced Latte                 $5.49

Subtotal                   $23.97
Tax                        $2.40
Total                      $26.37`;

      const receipt = parseReceiptText(text);

      expect(receipt.merchantName).toBeDefined();
      expect(receipt.date).toBeDefined();
      expect(receipt.lineItems.length).toBe(3);
      expect(receipt.subtotal).toBe(23.97);
      expect(receipt.tax).toBe(2.40);
      expect(receipt.total).toBe(26.37);
    });

    it('should extract quantities from items', () => {
      const text = `Coffee Shop

2x Espresso                 $6.98
3@2.50 Donut               $7.50

Subtotal                   $14.48
Tax                        $1.45
Total                      $15.93`;

      const receipt = parseReceiptText(text);

      const espresso = receipt.lineItems.find((item) => item.name.includes('Espresso'));
      expect(espresso?.quantity).toBe(2);

      const donut = receipt.lineItems.find((item) => item.name.includes('Donut'));
      expect(donut?.quantity).toBe(3);
    });

    it('should detect discount items', () => {
      const text = `Restaurant

Steak Dinner               $25.00
Discount - COUP-2024       -$5.00

Subtotal                   $20.00
Tax                        $2.00
Total                      $22.00`;

      const receipt = parseReceiptText(text);

      const discount = receipt.lineItems.find((item) => item.isDiscount);
      expect(discount).toBeDefined();
      expect(discount?.lineTotal).toBe(-5);
    });

    it('should handle missing tax', () => {
      const text = `Simple Shop

Bread                      $5.00
Milk                       $3.50

Subtotal                   $8.50`;

      const receipt = parseReceiptText(text);

      expect(receipt.subtotal).toBe(8.50);
      expect(receipt.tax).toBeUndefined();
      expect(receipt.lineItems.length).toBe(2);
    });

    it('should ignore header/footer lines', () => {
      const text = `THANK YOU FOR YOUR PURCHASE

Bagel                      $4.99
Coffee                     $3.99

SUBTOTAL                   $8.98
SALES TAX                  $0.89
VISA PAYMENT ACCEPTED
THANK YOU`;

      const receipt = parseReceiptText(text);

      // Should not parse "THANK YOU FOR YOUR PURCHASE" or "VISA PAYMENT ACCEPTED" as items
      expect(receipt.lineItems.length).toBe(2);
      expect(receipt.lineItems.some((item) => item.name.includes('THANK'))).toBe(false);
    });

    it('should generate unique IDs for each item', () => {
      const text = `Shop

Item1                      $10.00
Item2                      $15.00`;

      const receipt = parseReceiptText(text);

      const ids = receipt.lineItems.map((item) => item.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('getMockDemoReceipt', () => {
    it('should return a valid receipt structure', () => {
      const receipt = getMockDemoReceipt();

      expect(receipt.merchantName).toBeDefined();
      expect(receipt.currency).toBe('USD');
      expect(receipt.lineItems.length).toBeGreaterThan(0);
      expect(receipt.subtotal).toBeGreaterThan(0);
      expect(receipt.tax).toBeGreaterThan(0);
      expect(receipt.total).toBeGreaterThan(0);
    });

    it('should have valid line items', () => {
      const receipt = getMockDemoReceipt();

      receipt.lineItems.forEach((item) => {
        expect(item.id).toBeDefined();
        expect(item.name).toBeDefined();
        expect(item.name.length).toBeGreaterThan(0);
        expect(item.quantity).toBeGreaterThan(0);
        expect(item.lineTotal).toBeDefined();
        expect(Number.isFinite(item.lineTotal)).toBe(true);
      });
    });

    it('should include both regular and discount items', () => {
      const receipt = getMockDemoReceipt();

      const hasRegular = receipt.lineItems.some((item) => !item.isDiscount && item.lineTotal > 0);
      const hasDiscount = receipt.lineItems.some((item) => item.isDiscount && item.lineTotal < 0);

      expect(hasRegular).toBe(true);
      expect(hasDiscount).toBe(true);
    });

    it('should have consistent totals', () => {
      const receipt = getMockDemoReceipt();

      // Calculate subtotal from line items
      const calculatedSubtotal = receipt.lineItems.reduce(
        (sum, item) => sum + item.lineTotal,
        0
      );

      expect(Math.abs(calculatedSubtotal - (receipt.subtotal || 0))).toBeLessThan(0.01);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      const id3 = generateId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should include item_ prefix', () => {
      const id = generateId();
      expect(id).toMatch(/^item_/);
    });
  });
});

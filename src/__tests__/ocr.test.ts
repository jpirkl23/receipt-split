import { describe, it, expect } from 'vitest';
import {
  parseReceiptText,
  getMockDemoReceipt,
  generateId,
} from '@/lib/ocr';

describe('OCR and Parsing', () => {
  it('should parse a simple receipt', () => {
    const text = `Downtown Deli
    2024-01-15
    
    Grilled Chicken Sandwich 12.99
    Iced Latte 5.49
    Caesar Salad 11.99
    
    Subtotal 30.47
    Tax 2.44
    Total 32.91`;

    const receipt = parseReceiptText(text);

    expect(receipt.merchantName).toBe('Downtown Deli');
    expect(receipt.date).toBe('2024-01-15');
    expect(receipt.lineItems.length).toBeGreaterThan(0);
    expect(receipt.subtotal).toBeDefined();
  });

  it('should identify discounts', () => {
    const text = `Restaurant
    Item 1 10.00
    Discount -2.00
    Subtotal 8.00`;

    const receipt = parseReceiptText(text);
    const discount = receipt.lineItems.find((item) => item.isDiscount);

    expect(discount).toBeDefined();
    expect(discount?.isDiscount).toBe(true);
    expect(discount?.lineTotal).toBeLessThan(0);
  });

  it('should parse quantities', () => {
    const text = `Coffee Shop
    2x Cappuccino 10.00
    Item 2@5.00
    Total 20.00`;

    const receipt = parseReceiptText(text);
    const item1 = receipt.lineItems.find((item) => item.name.includes('Cappuccino'));

    expect(item1).toBeDefined();
    expect(item1?.quantity).toBeGreaterThan(1);
  });

  it('should return mock demo receipt', () => {
    const receipt = getMockDemoReceipt();

    expect(receipt.merchantName).toBe('Downtown Deli & Cafe');
    expect(receipt.lineItems.length).toBeGreaterThan(0);
    expect(receipt.currency).toBe('USD');
    expect(receipt.subtotal).toBeGreaterThan(0);
  });

  it('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();

    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^item_/);
    expect(id2).toMatch(/^item_/);
  });

  it('should extract prices', () => {
    const text = `Store
    Apple 1.99
    Orange 2.50
    Banana 0.99`;

    const receipt = parseReceiptText(text);

    expect(receipt.lineItems.some((item) => item.lineTotal === 1.99)).toBe(true);
    expect(receipt.lineItems.some((item) => item.lineTotal === 2.50)).toBe(true);
    expect(receipt.lineItems.some((item) => item.lineTotal === 0.99)).toBe(true);
  });
});

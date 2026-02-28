import { describe, it, expect } from 'vitest';
import {
  roundToCents,
  calculateTax,
  calculateTip,
  getPersonPretaxSubtotal,
  getTotalPretaxSubtotal,
  distributeTax,
  distributeTip,
  calculateResults,
  validateTotals,
} from '@/lib/math';
import { Receipt, Person, TipConfig, TaxConfig, LineItem } from '@/types';

describe('Math Engine', () => {
  // Test 1: Basic 2-person split
  it('should split a receipt between 2 people equally', () => {
    const receipt: Receipt = {
      merchantName: 'Test Restaurant',
      currency: 'USD',
      subtotal: 50.00,
      tax: 5.00,
      tip: 0,
      total: 55.00,
      lineItems: [
        {
          id: '1',
          rawText: 'Item 1',
          name: 'Item 1',
          quantity: 1,
          unitPrice: 25.00,
          lineTotal: 25.00,
          isDiscount: false,
          confidence: 0.95,
        },
        {
          id: '2',
          rawText: 'Item 2',
          name: 'Item 2',
          quantity: 1,
          unitPrice: 25.00,
          lineTotal: 25.00,
          isDiscount: false,
          confidence: 0.95,
        },
      ],
    };

    const people: Person[] = [
      {
        id: 'p1',
        name: 'Alice',
        assignedItemIds: ['1'],
      },
      {
        id: 'p2',
        name: 'Bob',
        assignedItemIds: ['2'],
      },
    ];

    const tipConfig: TipConfig = {
      percentage: 20,
      basis: 'pretax',
    };

    const taxConfig: TaxConfig = {
      basis: 'percentage',
      percentage: 10,
    };

    const results = calculateResults(receipt, people, tipConfig, taxConfig);

    expect(results.personBreakdowns).toHaveLength(2);
    expect(results.personBreakdowns[0].pretaxSubtotal).toBe(25.00);
    expect(results.personBreakdowns[1].pretaxSubtotal).toBe(25.00);
    
    // Each person should pay 20% tip on their subtotal
    expect(results.personBreakdowns[0].tipShare).toBe(5.00); // 20% of 25
    expect(results.personBreakdowns[1].tipShare).toBe(5.00);
    
    // Total tip should be 10.00
    expect(results.tip).toBe(10.00);
  });

  // Test 2: 3-person uneven split
  it('should split uneven amounts among 3 people', () => {
    const receipt: Receipt = {
      currency: 'USD',
      subtotal: 90.00,
      tax: 0,
      total: 90.00,
      lineItems: [
        {
          id: '1',
          rawText: 'Expensive Item',
          name: 'Expensive Item',
          quantity: 1,
          unitPrice: 50.00,
          lineTotal: 50.00,
          isDiscount: false,
          confidence: 0.95,
        },
        {
          id: '2',
          rawText: 'Item 2',
          name: 'Item 2',
          quantity: 1,
          unitPrice: 25.00,
          lineTotal: 25.00,
          isDiscount: false,
          confidence: 0.95,
        },
        {
          id: '3',
          rawText: 'Item 3',
          name: 'Item 3',
          quantity: 1,
          unitPrice: 15.00,
          lineTotal: 15.00,
          isDiscount: false,
          confidence: 0.95,
        },
      ],
    };

    const people: Person[] = [
      { id: 'p1', name: 'Alice', assignedItemIds: ['1'] },
      { id: 'p2', name: 'Bob', assignedItemIds: ['2'] },
      { id: 'p3', name: 'Charlie', assignedItemIds: ['3'] },
    ];

    const tipConfig: TipConfig = { percentage: 0, basis: 'pretax' };
    const taxConfig: TaxConfig = { basis: 'percentage', percentage: 0 };

    const results = calculateResults(receipt, people, tipConfig, taxConfig);

    expect(results.personBreakdowns[0].pretaxSubtotal).toBe(50.00);
    expect(results.personBreakdowns[1].pretaxSubtotal).toBe(25.00);
    expect(results.personBreakdowns[2].pretaxSubtotal).toBe(15.00);
  });

  // Test 3: Discount handling
  it('should handle discounts correctly', () => {
    const receipt: Receipt = {
      currency: 'USD',
      subtotal: 48.00,
      tax: 0,
      total: 48.00,
      lineItems: [
        {
          id: '1',
          rawText: 'Item 1',
          name: 'Item 1',
          quantity: 1,
          unitPrice: 50.00,
          lineTotal: 50.00,
          isDiscount: false,
          confidence: 0.95,
        },
        {
          id: '2',
          rawText: 'Discount -2.00',
          name: 'Discount',
          quantity: 1,
          unitPrice: -2.00,
          lineTotal: -2.00,
          isDiscount: true,
          confidence: 0.95,
        },
      ],
    };

    const people: Person[] = [
      { id: 'p1', name: 'Alice', assignedItemIds: ['1', '2'] },
    ];

    const tipConfig: TipConfig = { percentage: 0, basis: 'pretax' };
    const taxConfig: TaxConfig = { basis: 'percentage', percentage: 0 };

    const results = calculateResults(receipt, people, tipConfig, taxConfig);

    expect(results.personBreakdowns[0].pretaxSubtotal).toBe(48.00);
  });

  // Test 4: Missing tax (user inputs percentage)
  it('should calculate tax from percentage when not provided', () => {
    const receipt: Receipt = {
      currency: 'USD',
      subtotal: 100.00,
      tax: undefined,
      total: 100.00,
      lineItems: [
        {
          id: '1',
          rawText: 'Item',
          name: 'Item',
          quantity: 1,
          unitPrice: 100.00,
          lineTotal: 100.00,
          isDiscount: false,
          confidence: 0.95,
        },
      ],
    };

    const people: Person[] = [
      { id: 'p1', name: 'Alice', assignedItemIds: ['1'] },
    ];

    const tipConfig: TipConfig = { percentage: 0, basis: 'pretax' };
    const taxConfig: TaxConfig = { basis: 'percentage', percentage: 10 };

    const results = calculateResults(receipt, people, tipConfig, taxConfig);

    expect(results.tax).toBe(10.00); // 10% of 100
  });

  // Test 5: Missing tip (user inputs percentage)
  it('should calculate tip from percentage when not provided', () => {
    const receipt: Receipt = {
      currency: 'USD',
      subtotal: 100.00,
      tax: 10.00,
      tip: undefined,
      total: 110.00,
      lineItems: [
        {
          id: '1',
          rawText: 'Item',
          name: 'Item',
          quantity: 1,
          unitPrice: 100.00,
          lineTotal: 100.00,
          isDiscount: false,
          confidence: 0.95,
        },
      ],
    };

    const people: Person[] = [
      { id: 'p1', name: 'Alice', assignedItemIds: ['1'] },
    ];

    const tipConfig: TipConfig = { percentage: 20, basis: 'pretax' };
    const taxConfig: TaxConfig = { basis: 'fixed', fixedAmount: 10 };

    const results = calculateResults(receipt, people, tipConfig, taxConfig);

    expect(results.tip).toBe(20.00); // 20% of 100
  });

  // Test 6: Manual tip override
  it('should use manual tip amount when set', () => {
    const receipt: Receipt = {
      currency: 'USD',
      subtotal: 100.00,
      tax: 10.00,
      tip: undefined,
      total: 110.00,
      lineItems: [
        {
          id: '1',
          rawText: 'Item',
          name: 'Item',
          quantity: 1,
          unitPrice: 100.00,
          lineTotal: 100.00,
          isDiscount: false,
          confidence: 0.95,
        },
      ],
    };

    const people: Person[] = [
      { id: 'p1', name: 'Alice', assignedItemIds: ['1'] },
    ];

    const tipConfig: TipConfig = { percentage: 20, basis: 'manual', customAmount: 15.00 };
    const taxConfig: TaxConfig = { basis: 'fixed', fixedAmount: 10 };

    const results = calculateResults(receipt, people, tipConfig, taxConfig);

    expect(results.tip).toBe(15.00);
  });

  // Test 7: Rounding edge case
  it('should handle rounding correctly with Largest Remainder Method', () => {
    const receipt: Receipt = {
      currency: 'USD',
      subtotal: 100.00,
      tax: 0,
      total: 100.00,
      lineItems: [
        { id: '1', rawText: 'Item', name: 'Item', quantity: 1, unitPrice: 33.33, lineTotal: 33.33, isDiscount: false, confidence: 0.95 },
        { id: '2', rawText: 'Item', name: 'Item', quantity: 1, unitPrice: 33.33, lineTotal: 33.33, isDiscount: false, confidence: 0.95 },
        { id: '3', rawText: 'Item', name: 'Item', quantity: 1, unitPrice: 33.34, lineTotal: 33.34, isDiscount: false, confidence: 0.95 },
      ],
    };

    const people: Person[] = [
      { id: 'p1', name: 'Alice', assignedItemIds: ['1'] },
      { id: 'p2', name: 'Bob', assignedItemIds: ['2'] },
      { id: 'p3', name: 'Charlie', assignedItemIds: ['3'] },
    ];

    const tipConfig: TipConfig = { percentage: 15, basis: 'pretax' };
    const taxConfig: TaxConfig = { basis: 'percentage', percentage: 0 };

    const results = calculateResults(receipt, people, tipConfig, taxConfig);

    // Verify the total is correct (should not have rounding errors > 0.01)
    const sum = results.personBreakdowns.reduce((acc, p) => acc + p.total, 0);
    expect(Math.abs(sum - results.total)).toBeLessThanOrEqual(0.01);
  });

  // Test 8: Large group (8 people)
  it('should handle 8 people split', () => {
    const receipt: Receipt = {
      currency: 'USD',
      subtotal: 160.00,
      tax: 0,
      total: 160.00,
      lineItems: Array.from({ length: 8 }, (_, i) => ({
        id: String(i + 1),
        rawText: `Item ${i + 1}`,
        name: `Item ${i + 1}`,
        quantity: 1,
        unitPrice: 20.00,
        lineTotal: 20.00,
        isDiscount: false,
        confidence: 0.95,
      })),
    };

    const people: Person[] = Array.from({ length: 8 }, (_, i) => ({
      id: `p${i + 1}`,
      name: `Person ${i + 1}`,
      assignedItemIds: [String(i + 1)],
    }));

    const tipConfig: TipConfig = { percentage: 18, basis: 'pretax' };
    const taxConfig: TaxConfig = { basis: 'percentage', percentage: 0 };

    const results = calculateResults(receipt, people, tipConfig, taxConfig);

    expect(results.personBreakdowns).toHaveLength(8);
    expect(results.personBreakdowns.every((p) => p.total === 23.60)).toBe(true); // 20 + 18% tip
  });

  // Test 9: Quantity split
  it('should handle items with quantities', () => {
    const receipt: Receipt = {
      currency: 'USD',
      subtotal: 50.00,
      tax: 0,
      total: 50.00,
      lineItems: [
        {
          id: '1',
          rawText: '2x Coffee',
          name: 'Coffee',
          quantity: 2,
          unitPrice: 5.00,
          lineTotal: 10.00,
          isDiscount: false,
          confidence: 0.95,
        },
        {
          id: '2',
          rawText: '3x Sandwich',
          name: 'Sandwich',
          quantity: 3,
          unitPrice: 13.33,
          lineTotal: 40.00,
          isDiscount: false,
          confidence: 0.95,
        },
      ],
    };

    const people: Person[] = [
      { id: 'p1', name: 'Alice', assignedItemIds: ['1'] },
      { id: 'p2', name: 'Bob', assignedItemIds: ['2'] },
    ];

    const tipConfig: TipConfig = { percentage: 0, basis: 'pretax' };
    const taxConfig: TaxConfig = { basis: 'percentage', percentage: 0 };

    const results = calculateResults(receipt, people, tipConfig, taxConfig);

    expect(results.personBreakdowns[0].pretaxSubtotal).toBe(10.00);
    expect(results.personBreakdowns[1].pretaxSubtotal).toBe(40.00);
  });

  // Test 10: Receipt total validation
  it('should validate receipt totals correctly', () => {
    const receipt: Receipt = {
      currency: 'USD',
      subtotal: 100.00,
      tax: 10.00,
      tip: 10.00,
      total: 120.00,
      lineItems: [
        {
          id: '1',
          rawText: 'Item',
          name: 'Item',
          quantity: 1,
          unitPrice: 100.00,
          lineTotal: 100.00,
          isDiscount: false,
          confidence: 0.95,
        },
      ],
    };

    const people: Person[] = [
      { id: 'p1', name: 'Alice', assignedItemIds: ['1'] },
    ];

    const tipConfig: TipConfig = { percentage: 0, basis: 'pretax' };
    const taxConfig: TaxConfig = { basis: 'fixed', fixedAmount: 10 };

    const results = calculateResults(receipt, people, tipConfig, taxConfig);

    const isValid = validateTotals(results, receipt);
    expect(isValid).toBe(true);
  });

  // Test rounding function
  it('should round to cents correctly', () => {
    expect(roundToCents(10.555)).toBe(10.56);
    expect(roundToCents(10.554)).toBe(10.55);
    expect(roundToCents(10.001)).toBe(10.00);
    expect(roundToCents(10.009)).toBe(10.01);
  });

  // Test tax calculation
  it('should calculate tax correctly', () => {
    const taxConfig: TaxConfig = { basis: 'percentage', percentage: 8 };
    expect(calculateTax(100, taxConfig)).toBe(8.00);

    const taxConfigFixed: TaxConfig = { basis: 'fixed', fixedAmount: 5.5 };
    expect(calculateTax(100, taxConfigFixed)).toBe(5.50);
  });
});

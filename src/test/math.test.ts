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
import {
  Receipt,
  Person,
  TipConfig,
  TaxConfig,
  LineItem,
} from '@/types';

// Helper to create a mock line item
function createLineItem(id: string, lineTotal: number, name = 'Test Item'): LineItem {
  return {
    id,
    rawText: `${name} - $${lineTotal.toFixed(2)}`,
    name,
    quantity: 1,
    unitPrice: lineTotal,
    lineTotal,
    isDiscount: lineTotal < 0,
    confidence: 0.9,
  };
}

describe('Math Engine', () => {
  describe('roundToCents', () => {
    it('should round to 2 decimal places', () => {
      expect(roundToCents(10.995)).toBe(11.00);
      expect(roundToCents(10.994)).toBe(10.99);
      expect(roundToCents(5.555)).toBe(5.56);
    });

    it('should handle edge cases', () => {
      expect(roundToCents(0)).toBe(0);
      expect(roundToCents(0.001)).toBe(0);
      expect(roundToCents(0.005)).toBe(0.01);
    });
  });

  describe('calculateTax', () => {
    it('should calculate tax percentage correctly', () => {
      const taxConfig: TaxConfig = {
        basis: 'percentage',
        percentage: 8.5,
      };
      const result = calculateTax(100, taxConfig);
      expect(result).toBe(8.5);
    });

    it('should handle fixed tax amount', () => {
      const taxConfig: TaxConfig = {
        basis: 'fixed',
        fixedAmount: 10.5,
      };
      const result = calculateTax(100, taxConfig);
      expect(result).toBe(10.5);
    });

    it('should return 0 for no tax config', () => {
      const taxConfig: TaxConfig = {
        basis: 'percentage',
      };
      const result = calculateTax(100, taxConfig);
      expect(result).toBe(0);
    });
  });

  describe('calculateTip', () => {
    it('should calculate tip as percentage of pretax', () => {
      const receipt: Receipt = {
        currency: 'USD',
        subtotal: 100,
        lineItems: [],
      };
      const tipConfig: TipConfig = {
        percentage: 20,
        basis: 'pretax',
      };
      const result = calculateTip(receipt, tipConfig);
      expect(result).toBe(20);
    });

    it('should calculate tip as percentage of post-tax', () => {
      const receipt: Receipt = {
        currency: 'USD',
        subtotal: 100,
        tax: 10,
        lineItems: [],
      };
      const tipConfig: TipConfig = {
        percentage: 20,
        basis: 'posttax',
      };
      const result = calculateTip(receipt, tipConfig);
      expect(result).toBe(22); // 20% of 110
    });

    it('should use manual tip amount when specified', () => {
      const receipt: Receipt = {
        currency: 'USD',
        subtotal: 100,
        lineItems: [],
      };
      const tipConfig: TipConfig = {
        percentage: 20,
        basis: 'manual',
        customAmount: 25,
      };
      const result = calculateTip(receipt, tipConfig);
      expect(result).toBe(25);
    });

    it('should use receipt tip if present and not manual override', () => {
      const receipt: Receipt = {
        currency: 'USD',
        subtotal: 100,
        tip: 15,
        lineItems: [],
      };
      const tipConfig: TipConfig = {
        percentage: 20,
        basis: 'pretax',
      };
      const result = calculateTip(receipt, tipConfig);
      expect(result).toBe(15);
    });
  });

  describe('getPersonPretaxSubtotal', () => {
    it('should sum line items for a person', () => {
      const person: Person = {
        id: 'p1',
        name: 'Alice',
        assignedItemIds: ['item1', 'item2'],
      };
      const items = [
        createLineItem('item1', 10),
        createLineItem('item2', 15),
        createLineItem('item3', 20),
      ];
      const result = getPersonPretaxSubtotal(person, items);
      expect(result).toBe(25);
    });

    it('should return 0 for no assigned items', () => {
      const person: Person = {
        id: 'p1',
        name: 'Alice',
        assignedItemIds: [],
      };
      const items = [createLineItem('item1', 10)];
      const result = getPersonPretaxSubtotal(person, items);
      expect(result).toBe(0);
    });
  });

  describe('distributeTax', () => {
    it('should distribute tax proportionally to two people', () => {
      const people: Person[] = [
        {
          id: 'p1',
          name: 'Alice',
          assignedItemIds: ['item1'],
        },
        {
          id: 'p2',
          name: 'Bob',
          assignedItemIds: ['item2'],
        },
      ];
      const items = [
        createLineItem('item1', 50),
        createLineItem('item2', 50),
      ];
      const taxShares = distributeTax(10, people, items, 100);

      expect(taxShares.get('p1')).toBe(5);
      expect(taxShares.get('p2')).toBe(5);
    });

    it('should handle uneven distribution with Largest Remainder Method', () => {
      const people: Person[] = [
        { id: 'p1', name: 'Alice', assignedItemIds: ['item1'] },
        { id: 'p2', name: 'Bob', assignedItemIds: ['item2'] },
        { id: 'p3', name: 'Charlie', assignedItemIds: ['item3'] },
      ];
      const items = [
        createLineItem('item1', 10),
        createLineItem('item2', 10),
        createLineItem('item3', 10),
      ];
      const taxShares = distributeTax(1, people, items, 30);

      // All shares should sum to 1.00
      const total = Array.from(taxShares.values()).reduce((a, b) => a + b, 0);
      expect(roundToCents(total)).toBe(1);
    });
  });

  describe('calculateResults', () => {
    it('should calculate correct totals for 2-person split', () => {
      const receipt: Receipt = {
        currency: 'USD',
        subtotal: 50,
        tax: 5,
        lineItems: [
          createLineItem('item1', 25),
          createLineItem('item2', 25),
        ],
      };
      const people: Person[] = [
        { id: 'p1', name: 'Alice', assignedItemIds: ['item1'] },
        { id: 'p2', name: 'Bob', assignedItemIds: ['item2'] },
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

      expect(results.subtotal).toBe(50);
      expect(results.tax).toBe(5);
      expect(results.tip).toBe(10); // 20% of 50
      expect(results.total).toBe(65);

      // Each person should get equal share
      expect(results.personBreakdowns[0].pretaxSubtotal).toBe(25);
      expect(results.personBreakdowns[0].taxShare).toBe(2.5);
      expect(results.personBreakdowns[0].tipShare).toBe(5);
      expect(results.personBreakdowns[0].total).toBe(32.5);
    });

    it('should handle 3-person uneven split', () => {
      const receipt: Receipt = {
        currency: 'USD',
        subtotal: 45.75,
        tax: 4.58,
        lineItems: [
          createLineItem('item1', 12.99),
          createLineItem('item2', 10.98),
          createLineItem('item3', 11.99),
          createLineItem('item4', 9.79),
        ],
      };
      const people: Person[] = [
        { id: 'p1', name: 'Alice', assignedItemIds: ['item1', 'item2'] },
        { id: 'p2', name: 'Bob', assignedItemIds: ['item3'] },
        { id: 'p3', name: 'Charlie', assignedItemIds: ['item4'] },
      ];
      const tipConfig: TipConfig = {
        percentage: 20,
        basis: 'pretax',
      };
      const taxConfig: TaxConfig = {
        basis: 'fixed',
        fixedAmount: 4.58,
      };

      const results = calculateResults(receipt, people, tipConfig, taxConfig);

      // Validate that sum of all totals equals receipt total
      const sumTotal = results.personBreakdowns.reduce((sum, pb) => sum + pb.total, 0);
      const receiptTotal = receipt.subtotal + (receipt.tax || 0) + 
        ((receipt.subtotal * tipConfig.percentage) / 100);
      
      expect(roundToCents(sumTotal)).toBe(roundToCents(receiptTotal));
    });

    it('should handle discount items', () => {
      const receipt: Receipt = {
        currency: 'USD',
        subtotal: 48,
        tax: 4.8,
        lineItems: [
          createLineItem('item1', 25),
          createLineItem('item2', 25),
          createLineItem('disc1', -2),
        ],
      };
      const people: Person[] = [
        { id: 'p1', name: 'Alice', assignedItemIds: ['item1', 'disc1'] },
        { id: 'p2', name: 'Bob', assignedItemIds: ['item2'] },
      ];
      const tipConfig: TipConfig = {
        percentage: 20,
        basis: 'pretax',
      };
      const taxConfig: TaxConfig = {
        basis: 'fixed',
        fixedAmount: 4.8,
      };

      const results = calculateResults(receipt, people, tipConfig, taxConfig);

      expect(results.personBreakdowns[0].pretaxSubtotal).toBe(23); // 25 - 2
      expect(results.personBreakdowns[1].pretaxSubtotal).toBe(25);
    });
  });

  describe('validateTotals', () => {
    it('should validate correct totals', () => {
      const receipt: Receipt = {
        currency: 'USD',
        subtotal: 50,
        tax: 5,
        lineItems: [],
      };
      const results = {
        subtotal: 50,
        tax: 5,
        tip: 10,
        total: 65,
        personBreakdowns: [],
      };

      const isValid = validateTotals(results, receipt);
      expect(isValid).toBe(true);
    });

    it('should flag mismatches > $0.01', () => {
      const receipt: Receipt = {
        currency: 'USD',
        subtotal: 50,
        tax: 5,
        total: 65,
        lineItems: [],
      };
      const results = {
        subtotal: 50,
        tax: 5,
        tip: 10.02, // Off by 0.02
        total: 65.02,
        personBreakdowns: [],
      };

      const isValid = validateTotals(results, receipt);
      expect(isValid).toBe(false);
    });
  });
});

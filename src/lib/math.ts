import {
  LineItem,
  PersonBreakdown,
  Receipt,
  ResultsSummary,
  TipConfig,
  TaxConfig,
  Person,
} from "@/types";

/**
 * Rounds a value to 2 decimal places (cents)
 */
export function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculates tax amount given subtotal and tax config
 */
export function calculateTax(
  subtotal: number,
  taxConfig: TaxConfig
): number {
  if (taxConfig.basis === "fixed" && taxConfig.fixedAmount !== undefined) {
    return roundToCents(taxConfig.fixedAmount);
  }
  if (taxConfig.basis === "percentage" && taxConfig.percentage !== undefined) {
    return roundToCents((subtotal * taxConfig.percentage) / 100);
  }
  return 0;
}

/**
 * Calculates tip amount given receipt info and tip config
 * @param calculatedTax - Use this instead of receipt.tax when provided (for accurate after-tax calculation)
 */
export function calculateTip(
  receipt: Receipt,
  tipConfig: TipConfig,
  calculatedTax?: number
): number {
  // If receipt already has a tip and we're not overriding, use it
  if (receipt.tip && tipConfig.basis !== "manual") {
    return receipt.tip;
  }

  // If manual override, use custom amount
  if (tipConfig.basis === "manual" && tipConfig.customAmount !== undefined) {
    return roundToCents(tipConfig.customAmount);
  }

  let basis = 0;

  if (tipConfig.basis === "pretax") {
    basis = receipt.subtotal || 0;
  } else if (tipConfig.basis === "posttax") {
    basis = (receipt.subtotal || 0) + (calculatedTax !== undefined ? calculatedTax : (receipt.tax || 0));
  }

  return roundToCents((basis * tipConfig.percentage) / 100);
}

/**
 * Gets the pretax subtotal of assigned items for a person
 * Handles item splitting when an item is assigned to multiple people
 * Supports both new unit-based assignments (itemId#unit0) and legacy full-item assignments
 */
export function getPersonPretaxSubtotal(
  person: Person,
  allLineItems: LineItem[],
  allPeople?: Person[]
): number {
  return roundToCents(
    person.assignedItemIds
      .map((assignmentId) => {
        // Extract base item ID (handle both "itemId" and "itemId#unit0" formats)
        const baseItemId = assignmentId.includes("#unit") 
          ? assignmentId.split("#unit")[0] 
          : assignmentId;
        
        const item = allLineItems.find((item) => item.id === baseItemId);
        if (!item) return 0;
        
        // If allPeople provided, split items among people who have them
        if (allPeople) {
          // Count how many people have this item (in any unit assignment)
          const peopleWithItem = allPeople.filter((p) =>
            p.assignedItemIds.some((id) => 
              id === assignmentId || 
              id.split("#unit")[0] === baseItemId
            )
          ).length;
          return peopleWithItem > 0 ? item.lineTotal / peopleWithItem : 0;
        }
        
        return item.lineTotal;
      })
      .reduce((sum, val) => sum + val, 0)
  );
}

/**
 * Gets total pretax subtotal for all people
 */
export function getTotalPretaxSubtotal(
  people: Person[],
  allLineItems: LineItem[]
): number {
  return roundToCents(
    people
      .map((person) => getPersonPretaxSubtotal(person, allLineItems, people))
      .reduce((sum, val) => sum + val, 0)
  );
}

/**
 * Distributes tax proportionally using Largest Remainder Method
 */
export function distributeTax(
  totalTax: number,
  people: Person[],
  allLineItems: LineItem[],
  totalPretax: number
): Map<string, number> {
  const taxShares = new Map<string, number>();
  
  if (totalPretax === 0 || people.length === 0) {
    people.forEach((p) => taxShares.set(p.id, 0));
    return taxShares;
  }

  // 1. Calculate proportional shares (before rounding)
  const unroundedShares = new Map<string, number>();
  const remainders = new Map<string, number>();
  let totalAssigned = 0;

  people.forEach((person) => {
    const personPretax = getPersonPretaxSubtotal(person, allLineItems, people);
    const proportionalShare = (personPretax / totalPretax) * totalTax;
    const floorShare = Math.floor(proportionalShare * 100) / 100;
    
    unroundedShares.set(person.id, floorShare);
    remainders.set(person.id, proportionalShare - floorShare);
    totalAssigned += floorShare;
  });

  // 2. Distribute remaining pennies using Largest Remainder Method
  const remainingTax = roundToCents(totalTax - totalAssigned);
  const sortedByRemainder = Array.from(remainders.entries())
    .sort((a, b) => b[1] - a[1]);

  let penniesDistributed = 0;
  for (const [personId, _] of sortedByRemainder) {
    if (penniesDistributed < Math.abs(remainingTax) * 100) {
      const currentTax = unroundedShares.get(personId) || 0;
      taxShares.set(
        personId,
        currentTax + roundToCents(0.01)
      );
      penniesDistributed += 1;
    } else {
      taxShares.set(personId, unroundedShares.get(personId) || 0);
    }
  }

  return taxShares;
}

/**
 * Distributes tip proportionally using Largest Remainder Method
 */
export function distributeTip(
  totalTip: number,
  people: Person[],
  allLineItems: LineItem[],
  totalPretax: number
): Map<string, number> {
  const tipShares = new Map<string, number>();
  
  if (totalPretax === 0 || people.length === 0) {
    people.forEach((p) => tipShares.set(p.id, 0));
    return tipShares;
  }

  // 1. Calculate proportional shares (before rounding)
  const unroundedShares = new Map<string, number>();
  const remainders = new Map<string, number>();
  let totalAssigned = 0;

  people.forEach((person) => {
    const personPretax = getPersonPretaxSubtotal(person, allLineItems, people);
    const proportionalShare = (personPretax / totalPretax) * totalTip;
    const floorShare = Math.floor(proportionalShare * 100) / 100;
    
    unroundedShares.set(person.id, floorShare);
    remainders.set(person.id, proportionalShare - floorShare);
    totalAssigned += floorShare;
  });

  // 2. Distribute remaining pennies
  const remainingTip = roundToCents(totalTip - totalAssigned);
  const sortedByRemainder = Array.from(remainders.entries())
    .sort((a, b) => b[1] - a[1]);

  let penniesDistributed = 0;
  for (const [personId, _] of sortedByRemainder) {
    if (penniesDistributed < Math.abs(remainingTip) * 100) {
      const currentTip = unroundedShares.get(personId) || 0;
      tipShares.set(
        personId,
        currentTip + roundToCents(0.01)
      );
      penniesDistributed += 1;
    } else {
      tipShares.set(personId, unroundedShares.get(personId) || 0);
    }
  }

  return tipShares;
}

/**
 * Calculates full results for all people given a receipt and assignments
 */
export function calculateResults(
  receipt: Receipt,
  people: Person[],
  tipConfig: TipConfig,
  taxConfig: TaxConfig
): ResultsSummary {
  const subtotal = receipt.subtotal || 0;
  const tax = calculateTax(subtotal, taxConfig);
  const tip = calculateTip(receipt, tipConfig, tax);
  const totalPretax = getTotalPretaxSubtotal(people, receipt.lineItems);

  const taxShares = distributeTax(tax, people, receipt.lineItems, totalPretax);
  const tipShares = distributeTip(
    tip,
    people,
    receipt.lineItems,
    totalPretax
  );

  // Build person breakdowns
  const personBreakdowns: PersonBreakdown[] = people.map((person) => {
    // Extract unique base item IDs, handling both unit-based and legacy formats
    const uniqueItemIds = Array.from(new Set(
      person.assignedItemIds.map((assignmentId) =>
        assignmentId.includes("#unit") ? assignmentId.split("#unit")[0] : assignmentId
      )
    ));

    const assignedItems = uniqueItemIds
      .map((id) => receipt.lineItems.find((item) => item.id === id))
      .filter((item): item is LineItem => item !== undefined);

    const pretaxSubtotal = getPersonPretaxSubtotal(person, receipt.lineItems, people);
    const taxShare = taxShares.get(person.id) || 0;
    const tipShare = tipShares.get(person.id) || 0;
    const total = roundToCents(pretaxSubtotal + taxShare + tipShare);

    return {
      personId: person.id,
      name: person.name,
      assignedItems,
      pretaxSubtotal,
      taxShare,
      tipShare,
      total,
    };
  });

  // Calculate grand totals
  const totalPersons = roundToCents(
    personBreakdowns.reduce((sum, pb) => sum + pb.total, 0)
  );
  const totalTax = roundToCents(
    personBreakdowns.reduce((sum, pb) => sum + pb.taxShare, 0)
  );
  const totalTip = roundToCents(
    personBreakdowns.reduce((sum, pb) => sum + pb.tipShare, 0)
  );

  return {
    subtotal: totalPretax,
    tax: totalTax,
    tip: totalTip,
    total: totalPersons,
    personBreakdowns,
  };
}

/**
 * Validates that totals match (within $0.01)
 */
export function validateTotals(results: ResultsSummary, receipt: Receipt): boolean {
  const calculatedTotal = roundToCents(
    results.subtotal + results.tax + results.tip
  );
  const receiptTotal = receipt.total || 0;
  const difference = Math.abs(calculatedTotal - receiptTotal);
  return difference <= 0.01;
}

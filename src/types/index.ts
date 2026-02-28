// Line item in a receipt
export interface LineItem {
  id: string;
  rawText: string;
  name: string;
  quantity: number;
  unitPrice?: number;
  lineTotal: number;
  isDiscount: boolean;
  confidence: number;
}

// Overall receipt structure
export interface Receipt {
  merchantName?: string;
  eventName?: string; // User-provided event name
  date?: string;
  currency: "USD";
  subtotal?: number;
  tax?: number;
  tip?: number;
  total?: number;
  lineItems: LineItem[];
  imageUrl?: string; // Base64 image data URL for preview
}

// Person in the group
export interface Person {
  id: string;
  name: string;
  assignedItemIds: string[];
}

// Split info for a single line item
export interface ItemSplit {
  itemId: string;
  personId: string;
  quantity: number;
  amount: number;
}

// Tip configuration
export type TipBasis = "pretax" | "posttax" | "manual";

export interface TipConfig {
  percentage: number; // e.g., 20 for 20%
  basis: TipBasis;
  customAmount?: number;
}

// Tax configuration
export type TaxBasis = "percentage" | "fixed";

export interface TaxConfig {
  basis: TaxBasis;
  percentage?: number;
  fixedAmount?: number;
}

// Person's breakdown
export interface PersonBreakdown {
  personId: string;
  name: string;
  assignedItems: LineItem[];
  pretaxSubtotal: number;
  taxShare: number;
  tipShare: number;
  total: number;
}

// Results summary
export interface ResultsSummary {
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  personBreakdowns: PersonBreakdown[];
}

// App state for Zustand
export interface ReceiptSplitState {
  // Receipt data
  receipt: Receipt | null;
  
  // Group setup
  people: Person[];
  
  // Tip & tax configuration
  tipConfig: TipConfig;
  taxConfig: TaxConfig;
  
  // Item splits
  itemSplits: ItemSplit[];
  
  // Computed results
  results: ResultsSummary | null;
}

// CSV Export row
export interface ExportRow {
  name: string;
  pretax: string;
  tax: string;
  tip: string;
  total: string;
}

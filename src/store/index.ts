import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Receipt,
  Person,
  TipConfig,
  TaxConfig,
  ResultsSummary,
  LineItem,
} from "@/types";
import {
  calculateResults,
  validateTotals,
  getPersonPretaxSubtotal,
} from "@/lib/math";
import { generateId } from "@/lib/ocr";

interface ReceiptStore {
  // State
  receipt: Receipt | null;
  people: Person[];
  tipConfig: TipConfig;
  taxConfig: TaxConfig;
  results: ResultsSummary | null;
  receiptImageUrl?: string; // Store image URL separately for easy access

  // Receipt actions
  setReceipt: (receipt: Receipt, imageUrl?: string) => void;
  clearReceipt: () => void;
  updateReceiptMetadata: (updates: { eventName?: string; date?: string }) => void;
  updateReceiptSubtotal: (subtotal: number) => void;
  updateLineItem: (itemId: string, updates: Partial<LineItem>) => void;
  deleteLineItem: (itemId: string) => void;
  addLineItem: (item: LineItem) => void;

  // Group actions
  setPeople: (people: Person[]) => void;
  addPerson: (name: string) => void;
  removePerson: (personId: string) => void;
  renamePerson: (personId: string, newName: string) => void;

  // Assignment actions
  assignItemToPerson: (itemId: string, personId: string) => void;
  unassignItem: (itemId: string) => void;
  unassignItemFromPerson: (itemId: string, personId: string) => void;
  getAssignedItems: (personId: string) => LineItem[];
  getUnassignedItems: () => LineItem[];

  // Tip/Tax configuration
  setTipConfig: (config: TipConfig) => void;
  setTaxConfig: (config: TaxConfig) => void;

  // Calculations
  calculateAndUpdateResults: () => void;

  // Persistence
  reset: () => void;
}

const initialTipConfig: TipConfig = {
  percentage: 20,
  basis: "pretax",
};

const initialTaxConfig: TaxConfig = {
  basis: "percentage",
  percentage: 0,
};

export const useReceiptStore = create<ReceiptStore>()(
  persist(
    (set, get) => ({
      receipt: null,
      people: [],
      tipConfig: initialTipConfig,
      taxConfig: initialTaxConfig,
      results: null,

      setReceipt: (receipt: Receipt, imageUrl?: string) => {
        set({
          receipt: imageUrl ? { ...receipt, imageUrl } : receipt,
          receiptImageUrl: imageUrl,
          // Reset people when new receipt is added
          people: [],
          results: null,
        });
      },

      clearReceipt: () => {
        set({
          receipt: null,
          people: [],
          results: null,
        });
      },

      updateReceiptMetadata: (updates: { eventName?: string; date?: string }) => {
        set((state) => {
          if (!state.receipt) return state;
          return {
            receipt: {
              ...state.receipt,
              eventName: updates.eventName !== undefined ? updates.eventName : state.receipt.eventName,
              date: updates.date !== undefined ? updates.date : state.receipt.date,
            },
          };
        });
      },

      updateReceiptSubtotal: (subtotal: number) => {
        set((state) => {
          if (!state.receipt) return state;
          return {
            receipt: {
              ...state.receipt,
              subtotal,
            },
          };
        });
        get().calculateAndUpdateResults();
      },

      updateLineItem: (itemId: string, updates: Partial<LineItem>) => {
        set((state) => {
          if (!state.receipt) return state;
          return {
            receipt: {
              ...state.receipt,
              lineItems: state.receipt.lineItems.map((item) =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
            },
          };
        });
        get().calculateAndUpdateResults();
      },

      deleteLineItem: (itemId: string) => {
        set((state) => {
          if (!state.receipt) return state;
          return {
            receipt: {
              ...state.receipt,
              lineItems: state.receipt.lineItems.filter(
                (item) => item.id !== itemId
              ),
            },
          };
        });
        // Remove assignments
        set((state) => ({
          people: state.people.map((p) => ({
            ...p,
            assignedItemIds: p.assignedItemIds.filter((id) => id !== itemId),
          })),
        }));
        get().calculateAndUpdateResults();
      },

      addLineItem: (item: LineItem) => {
        set((state) => {
          if (!state.receipt) return state;
          return {
            receipt: {
              ...state.receipt,
              lineItems: [...state.receipt.lineItems, item],
            },
          };
        });
        get().calculateAndUpdateResults();
      },

      setPeople: (people: Person[]) => {
        set({ people });
        get().calculateAndUpdateResults();
      },

      addPerson: (name: string) => {
        const newPerson: Person = {
          id: generateId(),
          name: name || `Person ${get().people.length + 1}`,
          assignedItemIds: [],
        };
        set((state) => ({
          people: [...state.people, newPerson],
        }));
        get().calculateAndUpdateResults();
      },

      removePerson: (personId: string) => {
        set((state) => ({
          people: state.people.filter((p) => p.id !== personId),
        }));
        get().calculateAndUpdateResults();
      },

      renamePerson: (personId: string, newName: string) => {
        set((state) => ({
          people: state.people.map((p) =>
            p.id === personId ? { ...p, name: newName } : p
          ),
        }));
        get().calculateAndUpdateResults();
      },

      assignItemToPerson: (itemId: string, personId: string) => {
        set((state) => ({
          people: state.people.map((p) => {
            if (p.id === personId) {
              // Allow same item to be assigned to multiple people (for splitting)
              return {
                ...p,
                assignedItemIds: Array.from(
                  new Set([...p.assignedItemIds, itemId])
                ),
              };
            }
            // Keep in other people too (support splitting)
            return p;
          }),
        }));
        get().calculateAndUpdateResults();
      },

      unassignItem: (itemId: string) => {
        set((state) => ({
          people: state.people.map((p) => ({
            ...p,
            assignedItemIds: p.assignedItemIds.filter((id) => id !== itemId),
          })),
        }));
        get().calculateAndUpdateResults();
      },

      unassignItemFromPerson: (itemId: string, personId: string) => {
        set((state) => ({
          people: state.people.map((p) =>
            p.id === personId
              ? {
                  ...p,
                  assignedItemIds: p.assignedItemIds.filter(
                    (id) => id !== itemId
                  ),
                }
              : p
          ),
        }));
        get().calculateAndUpdateResults();
      },

      getAssignedItems: (personId: string) => {
        const state = get();
        const person = state.people.find((p) => p.id === personId);
        if (!state.receipt || !person) return [];
        return person.assignedItemIds
          .map((id) => state.receipt!.lineItems.find((item) => item.id === id))
          .filter((item): item is LineItem => item !== undefined);
      },

      getUnassignedItems: () => {
        const state = get();
        if (!state.receipt) return [];
        const assignedIds = new Set(
          state.people.flatMap((p) => p.assignedItemIds)
        );
        return state.receipt.lineItems.filter(
          (item) => !assignedIds.has(item.id)
        );
      },

      setTipConfig: (config: TipConfig) => {
        set({ tipConfig: config });
        get().calculateAndUpdateResults();
      },

      setTaxConfig: (config: TaxConfig) => {
        set({ taxConfig: config });
        get().calculateAndUpdateResults();
      },

      calculateAndUpdateResults: () => {
        const state = get();
        if (!state.receipt || state.people.length === 0) {
          set({ results: null });
          return;
        }

        try {
          const results = calculateResults(
            state.receipt,
            state.people,
            state.tipConfig,
            state.taxConfig
          );

          // Validate totals
          const isValid = validateTotals(results, state.receipt);
          if (!isValid) {
            console.warn("Total validation warning: mismatch > $0.01");
          }

          set({ results });
        } catch (error) {
          console.error("Error calculating results:", error);
          set({ results: null });
        }
      },

      reset: () => {
        set({
          receipt: null,
          people: [],
          tipConfig: initialTipConfig,
          taxConfig: initialTaxConfig,
          results: null,
          receiptImageUrl: undefined,
        });
      },
    }),
    {
      name: "receipt-split-store",
      version: 1,
      partialize: (state) => {
        // Exclude image data from persistence to avoid localStorage quota exceeded errors
        const { receiptImageUrl, receipt, ...rest } = state;
        const receiptWithoutImage = receipt ? {
          ...receipt,
          imageUrl: undefined, // Don't persist the base64 image
        } : null;
        return {
          ...rest,
          receipt: receiptWithoutImage,
          // receiptImageUrl is intentionally excluded
        };
      },
    }
  )
);

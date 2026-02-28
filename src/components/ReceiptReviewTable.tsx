"use client";

import React from "react";
import { LineItem } from "@/types";
import { Button } from "./Button";
import { Input } from "./Input";

interface ReceiptReviewTableProps {
  items: LineItem[];
  onItemUpdate: (itemId: string, updates: Partial<LineItem>) => void;
  onItemDelete: (itemId: string) => void;
  subtotal?: number;
  tax?: number;
  total?: number;
}

export function ReceiptReviewTable({
  items,
  onItemUpdate,
  onItemDelete,
  subtotal,
  tax,
  total,
}: ReceiptReviewTableProps) {
  // Calculate actual sum of items
  const itemsSum = items.reduce((sum, item) => sum + item.lineTotal, 0);
  
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm mb-6">
        <thead>
          <tr className="border-b-2 border-gray-300">
            <th className="text-left p-3 font-semibold text-gray-700">Item</th>
            <th className="text-right p-3 font-semibold text-gray-700">Qty</th>
            <th className="text-right p-3 font-semibold text-gray-700">
              Unit Price
            </th>
            <th className="text-right p-3 font-semibold text-gray-700">Total</th>
            <th className="text-center p-3 font-semibold text-gray-700">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="p-3">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) =>
                    onItemUpdate(item.id, { name: e.target.value })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded"
                />
              </td>
              <td className="p-3 text-right">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                    const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                    const newLineTotal = (item.unitPrice || 0) * newQuantity;
                    onItemUpdate(item.id, {
                      quantity: newQuantity,
                      lineTotal: newLineTotal,
                    });
                  }}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-right"
                />
              </td>
              <td className="p-3 text-right">
                <input
                  type="number"
                  value={item.unitPrice?.toFixed(2) || ""}
                  onChange={(e) => {
                    const newUnitPrice = parseFloat(e.target.value) || 0;
                    const newLineTotal = newUnitPrice * item.quantity;
                    onItemUpdate(item.id, {
                      unitPrice: newUnitPrice,
                      lineTotal: newLineTotal,
                    });
                  }}
                  step="0.01"
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
                />
              </td>
              <td className="p-3 text-right font-semibold">
                ${item.lineTotal.toFixed(2)}
              </td>
              <td className="p-3 text-center">
                <Button
                  onClick={() => onItemDelete(item.id)}
                  variant="danger"
                  size="sm"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-2 text-right">
        {/* Items Sum */}
        <p className="text-lg">
          <span className="text-gray-600">Items Sum:</span>
          <span className="font-semibold ml-4">${itemsSum.toFixed(2)}</span>
        </p>

        {/* Subtotal with Validation */}
        {subtotal !== undefined && (
          <div className={itemsSum !== subtotal ? "p-2 rounded bg-red-50" : ""}>
            <p className="text-lg">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold ml-4">${subtotal.toFixed(2)}</span>
            </p>
            {itemsSum !== subtotal && (
              <p className="text-sm text-red-700 mt-1">
                ⚠️ Mismatch: Items sum (${itemsSum.toFixed(2)}) does not equal subtotal (${subtotal.toFixed(2)})
              </p>
            )}
          </div>
        )}

        {tax !== undefined && (
          <p className="text-lg">
            <span className="text-gray-600">Tax:</span>
            <span className="font-semibold ml-4">${tax.toFixed(2)}</span>
          </p>
        )}

        {/* Total Calculation */}
        {total !== undefined && (
          <p className="text-xl font-bold">
            <span className="text-gray-600">Total:</span>
            <span className="ml-4">${total.toFixed(2)}</span>
          </p>
        )}
      </div>
    </div>
  );
}

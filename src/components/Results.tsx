"use client";
import { PersonBreakdown } from "@/types";
import { Button } from "./Button";

interface ResultsCardProps {
  breakdown: PersonBreakdown;
}

export function ResultsCard({ breakdown }: ResultsCardProps) {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 p-6 shadow-md hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{breakdown.name}</h3>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold">${breakdown.pretaxSubtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <span className="text-gray-600">Tax</span>
          <span className="font-semibold">${breakdown.taxShare.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
          <span className="text-gray-600">Tip</span>
          <span className="font-semibold">${breakdown.tipShare.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center pt-2 text-lg font-bold text-blue-600">
          <span>Total</span>
          <span>${breakdown.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 mb-2">Items ({breakdown.assignedItems.length})</h4>
        <ul className="space-y-1 text-sm max-h-32 overflow-y-auto">
          {breakdown.assignedItems.map((item) => (
            <li key={item.id} className="text-gray-600">
              <span>{item.name}</span>
              <span className="text-gray-500 ml-2">
                {item.quantity > 1 ? `${item.quantity}x ` : ""}${item.lineTotal.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface ResultsHeaderProps {
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

export function ResultsHeader({
  subtotal,
  tax,
  tip,
  total,
}: ResultsHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-8 mb-8 shadow-lg">
      <h2 className="text-3xl font-bold mb-6">Summary</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <p className="text-blue-100 text-sm mb-1">Subtotal</p>
          <p className="text-2xl font-bold">${subtotal.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-blue-100 text-sm mb-1">Tax</p>
          <p className="text-2xl font-bold">${tax.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-blue-100 text-sm mb-1">Tip</p>
          <p className="text-2xl font-bold">${tip.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-blue-100 text-sm mb-1">Grand Total</p>
          <p className="text-3xl font-bold">${total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

interface ExportActionsProps {
  onCopyToClipboard: () => void;
  onDownloadCSV: () => void;
}

export function ExportActions({
  onCopyToClipboard,
  onDownloadCSV,
}: ExportActionsProps) {
  return (
    <div className="flex gap-2 flex-col sm:flex-row">
      <Button
        onClick={onCopyToClipboard}
        variant="secondary"
        size="lg"
        className="flex-1"
      >
        📋 Copy to Clipboard
      </Button>
      <Button
        onClick={onDownloadCSV}
        variant="success"
        size="lg"
        className="flex-1"
      >
        💾 Download CSV
      </Button>
    </div>
  );
}

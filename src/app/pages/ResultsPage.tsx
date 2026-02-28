"use client";

import React, { useState } from "react";
import { useReceiptStore } from "@/store";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import {
  ResultsCard,
  ResultsHeader,
  ExportActions,
} from "@/components/Results";
import { ExportRow } from "@/types";

export function ResultsPage() {
  const results = useReceiptStore((state) => state.results);
  const receipt = useReceiptStore((state) => state.receipt);
  const people = useReceiptStore((state) => state.people);
  const [copyNotification, setCopyNotification] = useState(false);

  if (!results) {
    return (
      <Card
        title="No Results Available"
        subtitle="Please complete the assignment step first"
      />
    );
  }

  const handleCopyToClipboard = () => {
    let text = "Receipt Split Results\n";
    text += "====================\n\n";

    if (receipt?.eventName) {
      text += `Event: ${receipt.eventName}\n\n`;
    }

    text += `Total: $${results.total.toFixed(2)}\n`;
    text += `Including:\n`;
    text += `  Subtotal: $${results.subtotal.toFixed(2)}\n`;
    text += `  Tax: $${results.tax.toFixed(2)}\n`;
    text += `  Tip: $${results.tip.toFixed(2)}\n\n`;

    text += "Per Person:\n";
    text += "----------\n";

    results.personBreakdowns.forEach((breakdown) => {
      text += `\n${breakdown.name}:\n`;
      text += `  Items: ${breakdown.assignedItems
        .map((item) => item.name)
        .join(", ")}\n`;
      text += `  Subtotal: $${breakdown.pretaxSubtotal.toFixed(2)}\n`;
      text += `  Tax: $${breakdown.taxShare.toFixed(2)}\n`;
      text += `  Tip: $${breakdown.tipShare.toFixed(2)}\n`;
      text += `  Total: $${breakdown.total.toFixed(2)}\n`;
    });

    navigator.clipboard.writeText(text);
    setCopyNotification(true);
    setTimeout(() => setCopyNotification(false), 2000);
  };

  const handleDownloadCSV = () => {
    // Generate CSV
    const headers = ["Name", "Pretax", "Tax", "Tip", "Total"];
    let csvLines = [];
    
    if (receipt?.eventName) {
      csvLines.push(`"Event","${receipt.eventName}"`);
      csvLines.push("");
    }
    
    csvLines.push(headers.join(","));

    const rows: ExportRow[] = results.personBreakdowns.map((breakdown) => ({
      name: breakdown.name,
      pretax: breakdown.pretaxSubtotal.toFixed(2),
      tax: breakdown.taxShare.toFixed(2),
      tip: breakdown.tipShare.toFixed(2),
      total: breakdown.total.toFixed(2),
    }));

    // Add total row
    rows.push({
      name: "TOTAL",
      pretax: results.subtotal.toFixed(2),
      tax: results.tax.toFixed(2),
      tip: results.tip.toFixed(2),
      total: results.total.toFixed(2),
    });

    // Build CSV content
    csvLines = [
      ...csvLines,
      ...rows.map((row) => `${row.name},${row.pretax},${row.tax},${row.tip},${row.total}`),
    ];
    const csvContent = csvLines.join("\n");

    // Download
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent)
    );
    element.setAttribute("download", "receipt_split.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-8">
      <Card title="Step 5: Results" subtitle="Here's how much each person owes">
        {receipt?.eventName && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <p className="text-sm text-gray-600">Event</p>
            <p className="font-semibold text-gray-800">{receipt.eventName}</p>
          </div>
        )}
        <ResultsHeader
          subtotal={results.subtotal}
          tax={results.tax}
          tip={results.tip}
          total={results.total}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {results.personBreakdowns.map((breakdown) => (
          <ResultsCard key={breakdown.personId} breakdown={breakdown} />
        ))}
      </div>

      <Card title="Export Results" subtitle="Share the breakdown with others">
        <ExportActions
          onCopyToClipboard={handleCopyToClipboard}
          onDownloadCSV={handleDownloadCSV}
        />

        {copyNotification && (
          <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4 rounded animate-pulse">
            <p className="text-green-800 font-semibold">
              ✓ Copied to clipboard!
            </p>
          </div>
        )}
      </Card>

      <Card title="Summary" subtitle="Quick reference">
        <div className="space-y-3">
          {results.personBreakdowns.map((breakdown) => (
            <div
              key={breakdown.personId}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <span className="font-semibold text-gray-800">
                {breakdown.name}
              </span>
              <span className="text-lg font-bold text-blue-600">
                ${breakdown.total.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

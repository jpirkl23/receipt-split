"use client";

import React, { useState } from "react";
import { useReceiptStore } from "@/store";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { ReceiptReviewTable } from "@/components/ReceiptReviewTable";
import { Input } from "@/components/Input";
import { TaxConfigurator, TipConfigurator } from "@/components/Configuration";
import { calculateTax, calculateTip } from "@/lib/math";
import { generateId } from "@/lib/ocr";
import { LineItem } from "@/types";

interface ReviewReceiptPageProps {
  onContinue: () => void;
}

export function ReviewReceiptPage({ onContinue }: ReviewReceiptPageProps) {
  const receipt = useReceiptStore((state) => state.receipt);
  const receiptImageUrl = useReceiptStore((state) => state.receiptImageUrl);
  const updateLineItem = useReceiptStore((state) => state.updateLineItem);
  const deleteLineItem = useReceiptStore((state) => state.deleteLineItem);
  const addLineItem = useReceiptStore((state) => state.addLineItem);
  const updateReceiptMetadata = useReceiptStore((state) => state.updateReceiptMetadata);
  const updateReceiptSubtotal = useReceiptStore((state) => state.updateReceiptSubtotal);
  const setTaxConfig = useReceiptStore((state) => state.setTaxConfig);
  const taxConfig = useReceiptStore((state) => state.taxConfig);
  const setTipConfig = useReceiptStore((state) => state.setTipConfig);
  const tipConfig = useReceiptStore((state) => state.tipConfig);

  // Form state for adding new item
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Metadata state - sync with receipt
  const [eventName, setEventName] = useState(receipt?.eventName || "");
  const [eventDate, setEventDate] = useState(receipt?.date || "");
  
  // Subtotal state - pre-filled with OCR detected value
  const [subtotal, setSubtotal] = useState(receipt?.subtotal?.toString() || "0");

  // Sync metadata when receipt changes
  React.useEffect(() => {
    if (receipt) {
      setEventName(receipt.eventName || "");
      setEventDate(receipt.date || "");
      setSubtotal(receipt.subtotal?.toString() || "0");
    }
  }, [receipt?.eventName, receipt?.date, receipt?.subtotal]);

  // Handle metadata update
  const handleMetadataUpdate = () => {
    updateReceiptMetadata({
      eventName: eventName || undefined,
      date: eventDate || undefined,
    });
    alert("✓ Event details saved!");
  };
  
  // Handle subtotal update
  const handleSubtotalUpdate = () => {
    const subtotalValue = parseFloat(subtotal) || 0;
    updateReceiptSubtotal(subtotalValue);
    alert("✓ Subtotal updated!");
  };

  if (!receipt) {
    return <Card title="No Receipt" subtitle="Please upload a receipt first"><div /></Card>;
  }

  // Handle adding new item
  const handleAddItem = () => {
    if (!newItemName.trim() || newItemPrice <= 0) {
      alert("Please enter a valid item name and price");
      return;
    }

    const newItem: LineItem = {
      id: generateId(),
      rawText: newItemName,
      name: newItemName,
      quantity: Math.max(1, newItemQuantity),
      unitPrice: newItemPrice,
      lineTotal: newItemPrice * Math.max(1, newItemQuantity),
      isDiscount: false,
      confidence: 100,
    };

    addLineItem(newItem);

    // Reset form
    setNewItemName("");
    setNewItemQuantity(1);
    setNewItemPrice(0);
    setShowAddForm(false);
  };

  // Calculate tax based on tax configuration
  const subtotalValue = parseFloat(subtotal) || 0;
  const calculatedTax = calculateTax(subtotalValue, taxConfig);
  const calculatedTip = calculateTip(receipt, tipConfig, calculatedTax);
  const grandTotal = subtotalValue + calculatedTax + calculatedTip;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Review Items (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Step 2: Review Receipt Items"
            subtitle="Edit items, quantities, and prices. Receipt data has been extracted from the image."
          >
            {/* Event Details Section */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400 space-y-4">
              <h3 className="font-semibold text-gray-800">Event Details</h3>
              <Input
                label="Event Name (Optional)"
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g., Team Lunch, Birthday Dinner"
              />
              <Input
                label="Date"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
              <Button
                onClick={handleMetadataUpdate}
                variant="outline"
                size="sm"
              >
                Save Event Details
              </Button>
            </div>
            
            {/* Subtotal Section */}
            <div className="mb-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-400 space-y-4">
              <h3 className="font-semibold text-gray-800">Subtotal (Pre-filled from OCR)</h3>
              <p className="text-sm text-gray-600">
                Edit the subtotal if the OCR didn't detect it correctly. This should match the receipt subtotal before tax and tip.
              </p>
              <Input
                label="Subtotal ($)"
                type="number"
                step="0.01"
                value={subtotal}
                onChange={(e) => setSubtotal(e.target.value)}
                placeholder="0.00"
              />
              <Button
                onClick={handleSubtotalUpdate}
                variant="outline"
                size="sm"
              >
                Update Subtotal
              </Button>
            </div>

            <ReceiptReviewTable
              items={receipt.lineItems}
              onItemUpdate={updateLineItem}
              onItemDelete={deleteLineItem}
              subtotal={subtotalValue}
              tax={receipt.tax}
              total={subtotalValue + (receipt.tax || 0)}
            />

            {/* Add Item Section */}
            <div className="mt-8 pt-8 border-t-2 border-gray-200">
              {!showAddForm ? (
                <Button
                  onClick={() => setShowAddForm(true)}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  + Add Item
                </Button>
              ) : (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-800">Add New Item</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      label="Item Name"
                      type="text"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="e.g., Coffee"
                    />
                    <Input
                      label="Quantity"
                      type="number"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1"
                    />
                    <Input
                      label="Unit Price"
                      type="number"
                      step="0.01"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddItem}
                      variant="primary"
                      size="md"
                      className="flex-1"
                    >
                      Add Item
                    </Button>
                    <Button
                      onClick={() => setShowAddForm(false)}
                      variant="secondary"
                      size="md"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card title="Tax & Tip Configuration" subtitle="Configure tax and tip calculation">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Tax Settings</h4>
                <TaxConfigurator
                  taxConfig={taxConfig}
                  onUpdate={setTaxConfig}
                  subtotal={subtotalValue}
                />
                <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-600">Estimated Tax:</p>
                  <p className="text-lg font-semibold text-gray-800">${calculatedTax.toFixed(2)}</p>
                </div>
              </div>
              <div className="border-t-2 border-gray-200 pt-6">
                <h4 className="font-semibold text-gray-800 mb-3">Tip Settings</h4>
                <TipConfigurator
                  tipConfig={tipConfig}
                  onUpdate={setTipConfig}
                  receiptHasTip={receipt.tip !== undefined && receipt.tip > 0}
                />
                <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-sm text-gray-600">Estimated Tip (<span className="capitalize">{tipConfig.basis === "manual" ? "Fixed" : tipConfig.basis === "pretax" ? "Before Tax" : "After Tax"}</span>):</p>
                  <p className="text-lg font-semibold text-gray-800">${calculatedTip.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Grand Total */}
          <div className="p-4 rounded-lg border-l-4 border-blue-400 bg-blue-50">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Grand Total:</p>
              <div className="text-sm space-y-1">
                <p>Subtotal: ${subtotalValue.toFixed(2)}</p>
                <p>Tax: ${calculatedTax.toFixed(2)}</p>
                <p>Tip: ${calculatedTip.toFixed(2)}</p>
                <p className="font-semibold text-lg pt-2 border-t border-blue-200">
                  Total: ${grandTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={onContinue} 
            variant="primary" 
            size="lg" 
            className="w-full"
          >
            Continue to Group Setup →
          </Button>
        </div>

        {/* Right side - Receipt Image Preview (1/3 width) */}
        {receiptImageUrl && (
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3 text-center">📷 Receipt Reference</h3>
              <div className="w-full rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center" style={{ maxHeight: "600px" }}>
                <img
                  src={receiptImageUrl}
                  alt="Receipt"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">Original receipt image</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

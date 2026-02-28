"use client";

import React, { useState } from "react";
import { useReceiptStore } from "@/store";
import { getMockDemoReceipt, preprocessImage, canvasToBlob } from "@/lib/ocr";
import { parseReceiptText } from "@/lib/ocr";
import { ImageUpload } from "@/components/ImageUpload";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import Tesseract from "tesseract.js";

export function ReceiptUploadPage() {
  const setReceipt = useReceiptStore((state) => state.setReceipt);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Convert image to data URL for display
      const reader = new FileReader();
      const imageDataUrl = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });

      // Preprocess image
      const preprocessedCanvas = await preprocessImage(file);
      const preprocessedBlob = await canvasToBlob(preprocessedCanvas);

      // Run OCR
      const result = await Tesseract.recognize(preprocessedBlob, "eng", {
        logger: (m) => {
          console.log("OCR Progress:", m.progress);
        },
      });

      // Parse extracted text
      const ocrText = result.data.text;
      console.log("Extracted text:", ocrText);

      const receipt = parseReceiptText(ocrText);
      setReceipt(receipt, imageDataUrl);
    } catch (err) {
      console.error("OCR Error:", err);
      setError(
        "Failed to extract receipt data. Please try another image or use the demo."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseDemoReceipt = () => {
    const demo = getMockDemoReceipt();
    setReceipt(demo);
  };

  return (
    <div className="space-y-6">
      <Card title="Step 1: Add Receipt" subtitle="Upload or photograph a receipt to get started">
        <ImageUpload
          onImageSelect={handleImageSelect}
          isLoading={isProcessing}
        />

        {isProcessing && (
          <div className="mt-6 text-center">
            <div className="animate-loading">
              <p className="text-lg font-semibold text-blue-600">
                📸 Processing receipt with OCR...
              </p>
              <p className="text-gray-600 text-sm mt-2">
                This may take a few seconds
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-red-800 font-semibold">⚠️ Error</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

        <div className="mt-8 border-t-2 border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Or try a demo receipt
          </h3>
          <p className="text-gray-600 mb-4">
            Don't have a receipt handy? Load a sample receipt to test the app functionality.
          </p>
          <Button
            onClick={handleUseDemoReceipt}
            variant="outline"
            size="lg"
            disabled={isProcessing}
          >
            📋 Load Demo Receipt
          </Button>
        </div>
      </Card>
    </div>
  );
}

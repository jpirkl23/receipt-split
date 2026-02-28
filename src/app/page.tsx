"use client";

import React, { useState, useEffect } from "react";
import { useReceiptStore } from "@/store";
import { Steps } from "@/components/Card";
import { Button } from "@/components/Button";
import { ReceiptUploadPage } from "./pages/ReceiptUploadPage";
import { ReviewReceiptPage } from "./pages/ReviewReceiptPage";
import { AssignItemsPage } from "./pages/AssignItemsPage";
import { ResultsPage } from "./pages/ResultsPage";

const STEPS = ["Add Receipt", "Review Items", "Assign Items", "Results"];

export default function Home() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const receipt = useReceiptStore((state) => state.receipt);
  const people = useReceiptStore((state) => state.people);
  const results = useReceiptStore((state) => state.results);
  const reset = useReceiptStore((state) => state.reset);

  // Auto-advance steps based on state
  useEffect(() => {
    if (!receipt) {
      setCurrentStepIndex(0);
    } else if (currentStepIndex === 0 && receipt) {
      setCurrentStepIndex(1);
    }
  }, [receipt, currentStepIndex]);

  // Removed auto-advance to results - user must click button when ready

  const renderStep = () => {
    switch (currentStepIndex) {
      case 0:
        return <ReceiptUploadPage />;
      case 1:
        return <ReviewReceiptPage onContinue={() => setCurrentStepIndex(2)} />;
      case 2:
        return <AssignItemsPage />;
      case 3:
        return <ResultsPage />;
      default:
        return <ReceiptUploadPage />;
    }
  };

  return (
    <div className="space-y-8">
      <Steps steps={STEPS} currentStep={currentStepIndex} />

      <div className="bg-white rounded-lg shadow-lg p-8">
        {renderStep()}
      </div>

      {currentStepIndex > 0 && (
        <div className="flex gap-2 justify-between">
          <Button
            onClick={() => setCurrentStepIndex(Math.max(0, currentStepIndex - 1))}
            variant="secondary"
            size="lg"
          >
            ← Back
          </Button>

          {currentStepIndex === 3 && (
            <Button onClick={() => reset()} variant="secondary" size="lg">
              🔄 Start Over
            </Button>
          )}

          {currentStepIndex < 2 && (
            <div className="flex-1" />
          )}

          {currentStepIndex < 2 && (
            <Button
              onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
              variant="primary"
              size="lg"
              disabled={
                (currentStepIndex === 0 && !receipt) ||
                (currentStepIndex === 1 && !receipt)
              }
            >
              Next →
            </Button>
          )}

          {currentStepIndex === 2 && (
            <Button
              onClick={() => setCurrentStepIndex(3)}
              variant="primary"
              size="lg"
              disabled={!results}
            >
              View Results →
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

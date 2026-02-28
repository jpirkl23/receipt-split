"use client";
import { TipConfig, TaxConfig } from "@/types";
import { Input } from "./Input";
import { Button } from "./Button";

interface TipConfiguratorProps {
  tipConfig: TipConfig;
  onUpdate: (config: TipConfig) => void;
  receiptHasTip?: boolean;
}

export function TipConfigurator({
  tipConfig,
  onUpdate,
  receiptHasTip = false,
}: TipConfiguratorProps) {
  const tipPercentages = [15, 18, 20, 22];

  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 p-6 shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Tip Configuration</h3>

      <div className="space-y-4">
        {/* Tip Basis Selection */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Basis</p>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() =>
                onUpdate({ ...tipConfig, basis: "pretax" })
              }
              variant={tipConfig.basis === "pretax" ? "primary" : "outline"}
              size="sm"
            >
              Before Tax
            </Button>
            <Button
              onClick={() =>
                onUpdate({ ...tipConfig, basis: "posttax" })
              }
              variant={tipConfig.basis === "posttax" ? "primary" : "outline"}
              size="sm"
            >
              After Tax
            </Button>
            <Button
              onClick={() =>
                onUpdate({ ...tipConfig, basis: "manual" })
              }
              variant={tipConfig.basis === "manual" ? "primary" : "outline"}
              size="sm"
            >
              Fixed Amount
            </Button>
          </div>
        </div>

        {/* Percentage Selection */}
        {tipConfig.basis !== "manual" && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Tip Percentage
            </p>
            <div className="flex gap-2 flex-wrap mb-2">
              {tipPercentages.map((pct) => (
                <Button
                  key={pct}
                  onClick={() => onUpdate({ ...tipConfig, percentage: pct })}
                  variant={tipConfig.percentage === pct ? "primary" : "outline"}
                  size="sm"
                >
                  {pct}%
                </Button>
              ))}
            </div>
            <Input
              type="number"
              value={tipConfig.percentage}
              onChange={(e) =>
                onUpdate({
                  ...tipConfig,
                  percentage: parseFloat(e.target.value) || 0,
                })
              }
              step="1"
              min="0"
              max="100"
              label="Custom %"
            />
          </div>
        )}

        {/* Manual Dollar Amount */}
        {tipConfig.basis === "manual" && (
          <Input
            type="number"
            value={tipConfig.customAmount?.toFixed(2) || ""}
            onChange={(e) =>
              onUpdate({
                ...tipConfig,
                customAmount: parseFloat(e.target.value) || 0,
              })
            }
            step="0.01"
            min="0"
            label="Tip Amount ($)"
          />
        )}

        {receiptHasTip && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
            <p className="text-sm text-blue-800">
              ℹ️ Receipt already includes a tip. You can override it above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface TaxConfiguratorProps {
  taxConfig: TaxConfig;
  onUpdate: (config: TaxConfig) => void;
  subtotal?: number;
}

export function TaxConfigurator({
  taxConfig,
  onUpdate,
  subtotal = 0,
}: TaxConfiguratorProps) {
  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 p-6 shadow-md">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Tax Configuration</h3>

      <div className="space-y-4">
        {/* Tax Type Selection */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Type</p>
          <div className="flex gap-2">
            <Button
              onClick={() =>
                onUpdate({ ...taxConfig, basis: "percentage" })
              }
              variant={taxConfig.basis === "percentage" ? "primary" : "outline"}
              size="sm"
            >
              Percentage
            </Button>
            <Button
              onClick={() =>
                onUpdate({ ...taxConfig, basis: "fixed" })
              }
              variant={taxConfig.basis === "fixed" ? "primary" : "outline"}
              size="sm"
            >
              Fixed Amount
            </Button>
          </div>
        </div>

        {/* Percentage Input */}
        {taxConfig.basis === "percentage" && (
          <Input
            type="number"
            value={taxConfig.percentage?.toFixed(2) || ""}
            onChange={(e) =>
              onUpdate({
                ...taxConfig,
                percentage: parseFloat(e.target.value) || 0,
              })
            }
            step="0.01"
            min="0"
            max="100"
            label="Tax Rate (%)"
            helper={`Estimated tax: $${(
              (subtotal * (taxConfig.percentage || 0)) /
              100
            ).toFixed(2)}`}
          />
        )}

        {/* Fixed Amount Input */}
        {taxConfig.basis === "fixed" && (
          <Input
            type="number"
            value={taxConfig.fixedAmount?.toFixed(2) || ""}
            onChange={(e) =>
              onUpdate({
                ...taxConfig,
                fixedAmount: parseFloat(e.target.value) || 0,
              })
            }
            step="0.01"
            min="0"
            label="Total Tax Amount ($)"
          />
        )}
      </div>
    </div>
  );
}

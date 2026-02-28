"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({
  children,
  className = "",
  title,
  subtitle,
}: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
      {subtitle && <p className="text-gray-600 mb-4">{subtitle}</p>}
      {children}
    </div>
  );
}

interface StepsProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function Steps({ steps, currentStep, onStepClick }: StepsProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1">
          <button
            onClick={() => onStepClick?.(index)}
            className={`w-10 h-10 rounded-full font-bold transition-all ${
              index === currentStep
                ? "bg-blue-600 text-white shadow-lg"
                : index < currentStep
                  ? "bg-green-600 text-white"
                  : "bg-gray-300 text-gray-600"
            }`}
          >
            {index < currentStep ? "✓" : index + 1}
          </button>
          <div className="flex-1 mx-2">
            <p className="text-sm font-medium text-gray-700">{step}</p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 ${
                index < currentStep ? "bg-green-600" : "bg-gray-300"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

"use client";

import React from "react";
import { useReceiptStore } from "@/store";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { GroupSetup } from "@/components/GroupSetup";

interface GroupSetupPageProps {
  onContinue: () => void;
}

export function GroupSetupPage({ onContinue }: GroupSetupPageProps) {
  const people = useReceiptStore((state) => state.people);
  const addPerson = useReceiptStore((state) => state.addPerson);
  const removePerson = useReceiptStore((state) => state.removePerson);
  const renamePerson = useReceiptStore((state) => state.renamePerson);

  const handleContinue = () => {
    if (people.length >= 2) {
      onContinue();
    }
  };

  return (
    <div className="space-y-8">
      <Card
        title="Step 3: Setup Your Group"
        subtitle="Define who's splitting the bill. You need at least 2 people."
      >
        <GroupSetup
          people={people}
          onAddPerson={addPerson}
          onRemovePerson={removePerson}
          onRenamePerson={renamePerson}
          onNumberChange={() => {}}
        />

        {people.length < 2 && (
          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-yellow-800 font-semibold">⚠️ Need at least 2 people</p>
            <p className="text-yellow-700 text-sm mt-1">
              Add more people to split the bill
            </p>
          </div>
        )}

        <Button
          onClick={handleContinue}
          variant="primary"
          size="lg"
          className="w-full mt-6"
          disabled={people.length < 2}
        >
          Continue to Assign Items →
        </Button>
      </Card>
    </div>
  );
}

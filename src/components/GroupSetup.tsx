"use client";

import React, { useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";

interface GroupSetupProps {
  people: Array<{ id: string; name: string }>;
  onAddPerson: (name: string) => void;
  onRemovePerson: (personId: string) => void;
  onRenamePerson: (personId: string, newName: string) => void;
  onNumberChange: (count: number) => void;
}

export function GroupSetup({
  people,
  onAddPerson,
  onRemovePerson,
  onRenamePerson,
  onNumberChange,
}: GroupSetupProps) {
  const [newPersonName, setNewPersonName] = useState("");

  const handleAddPerson = () => {
    if (newPersonName.trim()) {
      onAddPerson(newPersonName.trim());
      setNewPersonName("");
    }
  };

  const handleQuickAdd = (count: number) => {
    // Clear existing and add count people
    const toAdd = Math.max(0, count - people.length);
    for (let i = 0; i < toAdd; i++) {
      onAddPerson(`Person ${people.length + i + 1}`);
    }

    // Remove extras
    if (people.length > count) {
      for (let i = people.length - 1; i >= count; i--) {
        onRemovePerson(people[i].id);
      }
    }

    onNumberChange(count);
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 p-6 shadow-md space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          Quick Setup: Number of People
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
            <Button
              key={num}
              onClick={() => handleQuickAdd(num)}
              variant={people.length === num ? "primary" : "outline"}
              size="sm"
              className="w-full"
            >
              {num}
            </Button>
          ))}
        </div>
      </div>

      <div className="border-t-2 border-gray-200 pt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">People in Group</h3>

        <div className="space-y-3 mb-4">
          {people.map((person, index) => (
            <div key={person.id} className="flex gap-2 items-center">
              <span className="font-semibold text-gray-600 w-8">#{index + 1}</span>
              <Input
                type="text"
                value={person.name}
                onChange={(e) => onRenamePerson(person.id, e.target.value)}
                placeholder="Person name"
                className="flex-1"
              />
              <Button
                onClick={() => onRemovePerson(person.id)}
                variant="danger"
                size="sm"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>

        {people.length < 12 && (
          <div className="flex gap-2">
            <Input
              type="text"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddPerson();
                }
              }}
              placeholder="Add person name"
            />
            <Button onClick={handleAddPerson} variant="primary" size="md">
              Add
            </Button>
          </div>
        )}

        <p className="text-sm text-gray-500 mt-4">
          Total: {people.length} {people.length === 1 ? "person" : "people"}
        </p>
      </div>
    </div>
  );
}

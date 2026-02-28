"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useReceiptStore } from "@/store";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Helper component for draggable unassigned items
function UnassignedItemCard({ expandedItem }: { expandedItem: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: expandedItem.unitId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-2 bg-white border-2 border-blue-300 rounded-lg cursor-move hover:shadow-md transition-all text-xs"
    >
      <p className="font-semibold text-gray-800 truncate">{expandedItem.item.name}</p>
      <p className="text-gray-600">${expandedItem.item.unitPrice?.toFixed(2) || "0.00"}</p>
      {expandedItem.item.isDiscount && (
        <span className="inline-block mt-1 px-1 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded">
          Discount
        </span>
      )}
    </div>
  );
}

export function AssignItemsPage() {
  const receipt = useReceiptStore((state) => state.receipt);
  const people = useReceiptStore((state) => state.people);
  const assignItemToPerson = useReceiptStore(
    (state) => state.assignItemToPerson
  );
  const unassignItem = useReceiptStore((state) => state.unassignItem);
  const getUnassignedItems = useReceiptStore(
    (state) => state.getUnassignedItems
  );
  const getAssignedItems = useReceiptStore((state) => state.getAssignedItems);
  const tipConfig = useReceiptStore((state) => state.tipConfig);
  const setTipConfig = useReceiptStore((state) => state.setTipConfig);
  const addPerson = useReceiptStore((state) => state.addPerson);
  const removePerson = useReceiptStore((state) => state.removePerson);
  const renamePerson = useReceiptStore((state) => state.renamePerson);
  const receipt2 = useReceiptStore((state) => state.receipt);

  const [activeItem, setActiveItem] = useState<{ item: LineItem; unitIndex: number } | null>(null);

  // Helper: Expand items by quantity for unassigned column
  const expandItemsByQuantity = (items: LineItem[]) => {
    const expanded: Array<{ item: LineItem; unitIndex: number; unitId: string }> = [];
    items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        expanded.push({
          item,
          unitIndex: i,
          unitId: `${item.id}_unit${i}`,
        });
      }
    });
    return expanded;
  };

  const expandedUnassignedItems = expandItemsByQuantity(getUnassignedItems());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const unassignedItems = getUnassignedItems();

  const handleDragStart = (event: any) => {
    const unitId = event.active.id as string;
    // Find the expanded item that matches this unitId
    const expandedItem = expandedUnassignedItems.find((ei) => ei.unitId === unitId);
    if (expandedItem) {
      setActiveItem(expandedItem);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;

    if (!over) return;

    const unitId = active.id as string;
    const personId = over.id as string;

    // Extract base item ID (remove _unit suffix)
    const baseItemId = unitId.split("_unit")[0];

    // Check if dropping into unassigned area
    if (personId === "unassigned") {
      unassignItem(baseItemId);
    } else {
      // Check if it's a valid person
      if (people.some((p) => p.id === personId)) {
        assignItemToPerson(baseItemId, personId);
      }
    }
  };

  if (!receipt) {
    return <Card title="Error" subtitle="Missing receipt. Please upload one first." />;
  }

  const allItemsAssigned = unassignedItems.length === 0;

  // Make unassigned column droppable
  const { setNodeRef: setUnassignedRef, isOver: isUnassignedOver } = useDroppable({
    id: "unassigned",
  });

  // Chunk people into groups of 3 for display
  const personsPerColumn = 3;
  const peopleColumns = [];
  for (let i = 0; i < people.length; i += personsPerColumn) {
    peopleColumns.push(people.slice(i, i + personsPerColumn));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-8">
        {/* Group Setup Section */}
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
            <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <p className="text-yellow-800 font-semibold">⚠️ Need at least 2 people</p>
              <p className="text-yellow-700 text-sm mt-1">
                Add more people to split the bill and assign items
              </p>
            </div>
          )}
        </Card>

        {/* Assign Items Section - only show if at least 2 people */}
        {people.length >= 2 && (
          <>
            <Card
              title="Assign Items"
              subtitle="Drag items to assign them to people. Drag the same item to multiple people to split it equally."
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                {/* Unassigned Column - Left side (narrow) */}
                <div className="lg:col-span-1">
                  <div 
                    ref={setUnassignedRef}
                    className={`rounded-lg p-4 min-h-96 transition-all ${
                      isUnassignedOver 
                        ? "bg-blue-100 border-2 border-blue-500 shadow-lg" 
                        : "bg-yellow-50 border-2 border-yellow-200"
                    }`}
                  >
                    <div className="mb-4">
                      <h3 className="font-bold text-sm text-gray-800">📦 Unassigned</h3>
                      <p className="text-xs text-gray-500 mt-1">{expandedUnassignedItems.length} item(s)</p>
                    </div>

                    <SortableContext 
                      items={expandedUnassignedItems.map((ei) => ei.unitId)} 
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-2">
                        {expandedUnassignedItems.length === 0 ? (
                          <div className="text-center py-4 text-gray-400 text-xs">
                            Drop here
                          </div>
                        ) : (
                          expandedUnassignedItems.map((expandedItem) => (
                            <UnassignedItemCard key={expandedItem.unitId} expandedItem={expandedItem} />
                          ))
                        )}
                      </div>
                    </SortableContext>
                  </div>
                </div>

                {/* People Columns - Right side, stacked vertically */}
                <div className="lg:col-span-3 space-y-4">
                  {people.map((person) => (
                    <DroppableColumn
                      key={person.id}
                      id={person.id}
                      title={person.name}
                      items={getAssignedItems(person.id)}
                      subtotal={getAssignedItems(person.id).reduce(
                        (sum, item) => sum + item.lineTotal,
                        0
                      )}
                    />
                  ))}
                </div>
              </div>

              {allItemsAssigned && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                  <p className="text-green-800 font-semibold">✓ All items assigned!</p>
                </div>
              )}
            </Card>

            <div className="text-center">
              {allItemsAssigned ? (
                <p className="text-green-600 font-semibold text-lg">
                  ✓ Ready to view results!
                </p>
              ) : (
                <p className="text-yellow-600 font-semibold text-lg">
                  {unassignedItems.length} item(s) still unassigned
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="p-2 bg-white border-2 border-blue-500 rounded-lg shadow-lg cursor-move text-sm whitespace-nowrap">
            <p className="font-semibold text-gray-800">{activeItem.item.name}</p>
            <p className="text-gray-600">${activeItem.item.unitPrice?.toFixed(2) || "0.00"}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

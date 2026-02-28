"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { LineItem } from "@/types";
import { DraggableItem } from "./DraggableItem";

interface DroppableColumnProps {
  id: string;
  title: string;
  items: LineItem[];
  isUnassigned?: boolean;
  subtotal?: number;
}

export function DroppableColumn({
  id,
  title,
  items,
  isUnassigned = false,
  subtotal = 0,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`
        rounded-lg p-4 min-h-64 transition-all
        ${
          isOver
            ? "bg-blue-100 border-2 border-blue-500 shadow-lg"
            : "bg-gray-50 border-2 border-gray-200"
        }
        ${isUnassigned ? "bg-yellow-50 border-yellow-200" : ""}
      `}
    >
      <div className="mb-4">
        <h3 className="font-bold text-lg text-gray-800">{title}</h3>
        {subtotal > 0 && (
          <p className="text-sm text-gray-600 mt-1">
            Subtotal: ${subtotal.toFixed(2)}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-1">{items.length} item(s)</p>
      </div>

      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {isUnassigned ? "📦 Drop items here" : "Drag items here"}
            </div>
          ) : (
            items.map((item) => <DraggableItem key={item.id} item={item} />)
          )}
        </div>
      </SortableContext>
    </div>
  );
}

"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { LineItem } from "@/types";

interface DraggableItemProps {
  item: LineItem;
  isDragOverlay?: boolean;
}

export function DraggableItem({ item, isDragOverlay = false }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const baseClasses = `
    p-3 bg-white border-2 border-blue-300 rounded-lg cursor-move
    hover:shadow-md transition-all ${
      isDragOverlay ? "shadow-lg border-blue-500" : ""
    }
  `;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={baseClasses}
    >
      <p className="font-semibold text-gray-800">{item.name}</p>
      <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
        <span>
          {item.quantity > 1 ? `${item.quantity}x ` : ""} @ $
          {item.unitPrice?.toFixed(2) || "0.00"}
        </span>
        <span className="font-semibold text-gray-800">
          ${item.lineTotal.toFixed(2)}
        </span>
      </div>
      {item.isDiscount && (
        <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">
          Discount
        </span>
      )}
    </div>
  );
}

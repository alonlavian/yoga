"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PlanItem {
  id: string;
  poseName: string;
  duration: string;
  notes: string;
  orderIndex: number;
}

interface PlanItemRowProps {
  item: PlanItem;
  index: number;
  onChange: (item: PlanItem) => void;
  onRemove: () => void;
}

export function PlanItemRow({
  item,
  index,
  onChange,
  onRemove,
}: PlanItemRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-lg border bg-card p-3"
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
      </button>

      <span className="text-xs text-muted-foreground w-5 text-center">
        {index + 1}
      </span>

      <Input
        placeholder="Pose name"
        value={item.poseName}
        onChange={(e) => onChange({ ...item, poseName: e.target.value })}
        className="flex-1"
      />
      <Input
        placeholder="Duration (e.g. 5 min)"
        value={item.duration}
        onChange={(e) => onChange({ ...item, duration: e.target.value })}
        className="w-36"
      />
      <Input
        placeholder="Notes"
        value={item.notes}
        onChange={(e) => onChange({ ...item, notes: e.target.value })}
        className="w-40"
      />
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </Button>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlanItemRow } from "./plan-item-row";
import { toast } from "sonner";

interface PlanItem {
  id: string;
  poseName: string;
  duration: string;
  notes: string;
  orderIndex: number;
}

interface PlanData {
  id?: number;
  title: string;
  description: string;
  items: { poseName: string; duration: string; notes: string; orderIndex: number }[];
}

interface PlanBuilderProps {
  plan?: PlanData;
  onSave: () => void;
  onCancel: () => void;
}

let nextId = 0;
function genId() {
  return `item-${++nextId}-${Date.now()}`;
}

function toItemsWithIds(
  items: { poseName: string; duration: string; notes: string; orderIndex: number }[]
): PlanItem[] {
  return items.map((item) => ({ ...item, id: genId() }));
}

export function PlanBuilder({ plan, onSave, onCancel }: PlanBuilderProps) {
  const [title, setTitle] = useState(plan?.title ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [items, setItems] = useState<PlanItem[]>(
    plan?.items
      ? toItemsWithIds(plan.items)
      : [{ id: genId(), poseName: "", duration: "", notes: "", orderIndex: 0 }]
  );
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addItem = () => {
    setItems([
      ...items,
      { id: genId(), poseName: "", duration: "", notes: "", orderIndex: items.length },
    ]);
  };

  const updateItem = (index: number, item: PlanItem) => {
    const newItems = [...items];
    newItems[index] = item;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(
      items
        .filter((_, i) => i !== index)
        .map((item, i) => ({ ...item, orderIndex: i }))
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);

    const reordered = arrayMove(items, oldIndex, newIndex).map((item, i) => ({
      ...item,
      orderIndex: i,
    }));
    setItems(reordered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const validItems = items.filter((i) => i.poseName.trim());
    if (validItems.length === 0) {
      toast.error("Add at least one pose");
      return;
    }

    setSaving(true);

    const url = plan?.id ? `/api/plans/${plan.id}` : "/api/plans";
    const method = plan?.id ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        items: validItems.map((item, i) => ({
          poseName: item.poseName,
          duration: item.duration,
          notes: item.notes,
          orderIndex: i,
        })),
      }),
    });

    setSaving(false);

    if (!res.ok) {
      toast.error("Failed to save plan");
      return;
    }

    toast.success(plan?.id ? "Plan updated" : "Plan created");
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="plan-title">Title *</Label>
        <Input
          id="plan-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Gentle Morning Flow"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="plan-desc">Description</Label>
        <Textarea
          id="plan-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this class plan..."
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label>Poses / Exercises</Label>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {items.map((item, index) => (
                <PlanItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  onChange={(updated) => updateItem(index, updated)}
                  onRemove={() => removeItem(index)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          Add Pose
        </Button>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving || !title.trim()}>
          {saving ? "Saving..." : plan?.id ? "Update Plan" : "Create Plan"}
        </Button>
      </div>
    </form>
  );
}

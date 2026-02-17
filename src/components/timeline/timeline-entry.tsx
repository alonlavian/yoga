"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ClassPlan {
  id: number;
  title: string;
}

interface PlanItemData {
  poseName: string;
  duration: string | null;
  notes: string | null;
  orderIndex: number;
}

interface TimelineEntryData {
  id: number;
  studentId: number;
  type: string;
  date: string;
  content: string | null;
  duration: number | null;
  classPlanId: number | null;
  summary: string | null;
  createdAt: string;
  planTitle?: string;
  planItems?: PlanItemData[];
}

interface TimelineEntryProps {
  entry: TimelineEntryData;
  onDelete: () => void;
  onEdit?: () => void;
}

const typeConfig: Record<
  string,
  { label: string; color: string; dotColor: string }
> = {
  note: {
    label: "Note",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "bg-blue-400",
  },
  class: {
    label: "Class",
    color: "bg-green-50 text-green-700 border-green-200",
    dotColor: "bg-green-400",
  },
  plan_attachment: {
    label: "Plan",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    dotColor: "bg-purple-400",
  },
};

export function TimelineEntry({ entry, onDelete, onEdit }: TimelineEntryProps) {
  const config = typeConfig[entry.type] ?? typeConfig.note;
  const [editing, setEditing] = useState(false);

  // Edit form state
  const [editDate, setEditDate] = useState(entry.date);
  const [editContent, setEditContent] = useState(entry.content ?? "");
  const [editDuration, setEditDuration] = useState(entry.duration?.toString() ?? "");
  const [editSummary, setEditSummary] = useState(entry.summary ?? "");
  const [editPlanId, setEditPlanId] = useState(entry.classPlanId?.toString() ?? "");
  const [plans, setPlans] = useState<ClassPlan[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing && entry.type === "class") {
      fetch("/api/plans")
        .then((r) => r.json())
        .then(setPlans)
        .catch(() => {});
    }
  }, [editing, entry.type]);

  const handleDelete = async () => {
    if (!confirm("Delete this entry?")) return;
    const res = await fetch(`/api/timeline/${entry.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete entry");
      return;
    }
    onDelete();
  };

  const handleSave = async () => {
    setSaving(true);
    const body: Record<string, unknown> = {
      studentId: entry.studentId,
      type: entry.type,
      date: editDate,
    };

    if (entry.type === "note") {
      body.content = editContent;
    } else if (entry.type === "class") {
      body.duration = editDuration ? Number(editDuration) : undefined;
      body.summary = editSummary;
      body.classPlanId = editPlanId ? Number(editPlanId) : null;
    }

    const res = await fetch(`/api/timeline/${entry.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);

    if (!res.ok) {
      toast.error("Failed to update entry");
      return;
    }

    toast.success("Entry updated");
    setEditing(false);
    onEdit?.();
  };

  const handleCancel = () => {
    setEditing(false);
    setEditDate(entry.date);
    setEditContent(entry.content ?? "");
    setEditDuration(entry.duration?.toString() ?? "");
    setEditSummary(entry.summary ?? "");
    setEditPlanId(entry.classPlanId?.toString() ?? "");
  };

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {/* Vertical line */}
      <div className="flex flex-col items-center">
        <div className={`h-3 w-3 rounded-full ${config.dotColor} mt-1.5`} />
        <div className="w-px flex-1 bg-border" />
      </div>

      {/* Content */}
      <div className="flex-1 -mt-0.5">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className={config.color}>
            {config.label}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(entry.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <div className="ml-auto flex gap-1">
            {!editing && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        </div>

        {editing ? (
          <div className="rounded-lg border bg-card p-3 space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>

            {entry.type === "note" && (
              <div className="space-y-1">
                <Label className="text-xs">Content</Label>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {entry.type === "class" && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs">Duration (minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                  />
                </div>
                {plans.length > 0 && (
                  <div className="space-y-1">
                    <Label className="text-xs">Class Plan</Label>
                    <Select value={editPlanId} onValueChange={setEditPlanId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a plan..." />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={String(plan.id)}>
                            {plan.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-1">
                  <Label className="text-xs">Summary</Label>
                  <Textarea
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    rows={2}
                  />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            {entry.type === "class" && (
              <div className="rounded-lg border bg-card p-3 space-y-2">
                {entry.duration && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Duration:</span>{" "}
                    {entry.duration} min
                  </p>
                )}
                {entry.summary && <p className="text-sm">{entry.summary}</p>}
                {entry.planTitle && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Plan: {entry.planTitle}
                    </p>
                    {entry.planItems && entry.planItems.length > 0 && (
                      <div className="space-y-0.5">
                        {entry.planItems.map((item, i) => (
                          <p key={i} className="text-xs text-muted-foreground">
                            {i + 1}. {item.poseName}
                            {item.duration ? ` — ${item.duration}` : ""}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {entry.type === "note" && entry.content && (
              <div className="rounded-lg border bg-card p-3">
                <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
              </div>
            )}

            {entry.type === "plan_attachment" && entry.content && (
              <div className="rounded-lg border bg-card p-3">
                <p className="text-sm">{entry.content}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

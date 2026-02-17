"use client";

import { useState, useEffect } from "react";
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

interface AddClassFormProps {
  studentId: number;
  onAdded: () => void;
}

export function AddClassForm({ studentId, onAdded }: AddClassFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState("");
  const [summary, setSummary] = useState("");
  const [classPlanId, setClassPlanId] = useState<string>("");
  const [plans, setPlans] = useState<ClassPlan[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then(setPlans)
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/timeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        type: "class",
        date,
        duration: duration ? Number(duration) : undefined,
        classPlanId: classPlanId ? Number(classPlanId) : null,
        summary,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      toast.error("Failed to log class");
      return;
    }

    setDuration("");
    setSummary("");
    setClassPlanId("");
    toast.success("Class logged");
    onAdded();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="class-date">Date</Label>
        <Input
          id="class-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="class-duration">Duration (minutes)</Label>
        <Input
          id="class-duration"
          type="number"
          min="1"
          placeholder="60"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </div>
      {plans.length > 0 && (
        <div className="space-y-1">
          <Label>Class Plan (optional)</Label>
          <Select value={classPlanId} onValueChange={setClassPlanId}>
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
        <Label htmlFor="class-summary">Summary</Label>
        <Textarea
          id="class-summary"
          placeholder="How did the class go?"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
        />
      </div>
      <Button type="submit" size="sm" disabled={saving}>
        {saving ? "Logging..." : "Log Class"}
      </Button>
    </form>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { PlanBuilder } from "./plan-builder";
import { toast } from "sonner";

interface PlanItem {
  id: number;
  poseName: string;
  duration: string | null;
  notes: string | null;
  orderIndex: number;
}

interface Plan {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
  items?: PlanItem[];
}

export function PlanList() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<Plan | null>(null);

  const fetchPlans = useCallback(async () => {
    const res = await fetch("/api/plans");
    const data = await res.json();
    setPlans(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleEdit = async (plan: Plan) => {
    const res = await fetch(`/api/plans/${plan.id}`);
    if (res.ok) {
      const full = await res.json();
      setEditingPlan(full);
      setShowBuilder(true);
    }
  };

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`Delete "${plan.title}"?`)) return;

    const res = await fetch(`/api/plans/${plan.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete plan");
      return;
    }
    toast.success("Plan deleted");
    fetchPlans();
  };

  const handleSaved = () => {
    setShowBuilder(false);
    setEditingPlan(null);
    fetchPlans();
  };

  return (
    <div>
      <PageHeader
        title="Class Plans"
        description="Build reusable class sequences"
        actions={
          !showBuilder ? (
            <Button onClick={() => { setEditingPlan(null); setShowBuilder(true); }}>
              New Plan
            </Button>
          ) : undefined
        }
      />

      {showBuilder ? (
        <div className="rounded-lg border bg-card p-6">
          <PlanBuilder
            plan={
              editingPlan
                ? {
                    id: editingPlan.id,
                    title: editingPlan.title,
                    description: editingPlan.description ?? "",
                    items: (editingPlan.items ?? []).map((i) => ({
                      poseName: i.poseName,
                      duration: i.duration ?? "",
                      notes: i.notes ?? "",
                      orderIndex: i.orderIndex,
                    })),
                  }
                : undefined
            }
            onSave={handleSaved}
            onCancel={() => {
              setShowBuilder(false);
              setEditingPlan(null);
            }}
          />
        </div>
      ) : loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <p className="text-muted-foreground">
            No class plans yet. Create your first plan to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="cursor-pointer transition-shadow hover:shadow-md min-h-40"
              onClick={async () => {
                if (expandedPlan?.id === plan.id) {
                  setExpandedPlan(null);
                  return;
                }
                const res = await fetch(`/api/plans/${plan.id}`);
                if (res.ok) {
                  setExpandedPlan(await res.json());
                }
              }}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg">
                  {plan.title}
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={(e) => { e.stopPropagation(); handleEdit(plan); }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); handleDelete(plan); }}
                    >
                      Delete
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {plan.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {plan.description}
                  </p>
                )}
                <Badge variant="secondary" className="text-xs">
                  {new Date(plan.createdAt).toLocaleDateString()}
                </Badge>
                {expandedPlan?.id === plan.id && expandedPlan.items && expandedPlan.items.length > 0 && (
                  <div className="mt-3 pt-3 border-t space-y-1">
                    {expandedPlan.items.map((item, i) => (
                      <p key={item.id} className="text-sm text-muted-foreground">
                        {i + 1}. {item.poseName}
                        {item.duration ? ` — ${item.duration}` : ""}
                        {item.notes ? ` (${item.notes})` : ""}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

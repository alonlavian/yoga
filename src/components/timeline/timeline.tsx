"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { TimelineEntry } from "./timeline-entry";
import { AddNoteForm } from "./add-note-form";
import { AddClassForm } from "./add-class-form";

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
  updatedAt: string;
  planTitle?: string;
  planItems?: PlanItemData[];
}

interface TimelineProps {
  studentId: number;
}

export function Timeline({ studentId }: TimelineProps) {
  const [entries, setEntries] = useState<TimelineEntryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState<"note" | "class" | null>(null);
  const [showBottomAdd, setShowBottomAdd] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const fetchEntries = useCallback(async () => {
    const res = await fetch(`/api/timeline?studentId=${studentId}`);
    const data = await res.json();
    setEntries(data);
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleAdded = () => {
    setShowForm(null);
    setShowBottomAdd(false);
    fetchEntries();
  };

  const handleBottomAdd = (type: "note" | "class") => {
    setShowForm(type);
    setShowBottomAdd(false);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <h2 className="text-lg font-semibold">Timeline</h2>
        <div className="ml-auto flex gap-2">
          <Button
            variant={showForm === "note" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowForm(showForm === "note" ? null : "note")}
          >
            Add Note
          </Button>
          <Button
            variant={showForm === "class" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowForm(showForm === "class" ? null : "class")}
          >
            Log Class
          </Button>
        </div>
      </div>

      {showForm && (
        <div ref={formRef} className="shrink-0 mb-6 rounded-lg border bg-card p-4 max-h-96 overflow-y-auto">
          {showForm === "note" && (
            <AddNoteForm studentId={studentId} onAdded={handleAdded} onCancel={() => setShowForm(null)} />
          )}
          {showForm === "class" && (
            <AddClassForm studentId={studentId} onAdded={handleAdded} onCancel={() => setShowForm(null)} />
          )}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto">
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12">
          <p className="text-muted-foreground">
            No timeline entries yet. Add a note or log a class to get started.
          </p>
        </div>
      ) : (
        <div className="mt-2">
          {/* + button at top of timeline */}
          <div className="relative flex gap-4 pb-4">
            <div className="flex flex-col items-center">
              <div className="relative">
                <button
                  onClick={() => setShowBottomAdd(!showBottomAdd)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 text-muted-foreground/50 hover:border-primary hover:text-primary transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                </button>
              </div>
              <div className="w-px flex-1 bg-border" />
            </div>

            {showBottomAdd && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleBottomAdd("note")}
                >
                  Note
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleBottomAdd("class")}
                >
                  Class
                </Button>
              </div>
            )}
          </div>

          {entries.map((entry) => (
            <TimelineEntry
              key={entry.id}
              entry={entry}
              onDelete={fetchEntries}
              onEdit={fetchEntries}
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

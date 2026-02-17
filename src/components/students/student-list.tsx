"use client";

import { useEffect, useState, useCallback } from "react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import { StudentCard } from "./student-card";
import { StudentForm } from "./student-form";
import { toast } from "sonner";

interface Student {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  dateOfBirth: string | null;
  knownIssues: string | null;
  avatarUrl: string | null;
  startDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export function StudentList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchStudents = useCallback(async () => {
    const res = await fetch("/api/students");
    const data = await res.json();
    setStudents(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleAdd = async (data: {
    name: string;
    email: string;
    phone: string;
    notes: string;
    dateOfBirth: string;
    knownIssues: string;
    startDate: string;
  }) => {
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      toast.error("Failed to add student");
      return;
    }

    toast.success("Student added");
    fetchStudents();
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.includes(q)
    );
  }, [students, search]);

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage your yoga students"
        actions={
          <StudentForm
            trigger={<Button>Add Student</Button>}
            onSave={handleAdd}
          />
        }
      />
      {students.length > 0 && (
        <div className="mb-4">
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
      )}
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <p className="text-muted-foreground">
            No students yet. Add your first student to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}

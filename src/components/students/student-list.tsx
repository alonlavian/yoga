"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <p className="text-muted-foreground">
            No students yet. Add your first student to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}

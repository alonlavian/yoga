"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { Timeline } from "@/components/timeline/timeline";
import { ChatPanel } from "@/components/chat/chat-panel";
import { StudentForm } from "@/components/students/student-form";
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

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStudent = useCallback(async () => {
    const res = await fetch(`/api/students/${params.id}`);
    if (!res.ok) {
      router.push("/");
      return;
    }
    const data = await res.json();
    setStudent(data);
    setLoading(false);
  }, [params.id, router]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  const handleEdit = async (data: {
    name: string;
    email: string;
    phone: string;
    notes: string;
    dateOfBirth: string;
    knownIssues: string;
    startDate: string;
  }) => {
    const res = await fetch(`/api/students/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      toast.error("Failed to update student");
      return;
    }
    toast.success("Student updated");
    fetchStudent();
  };

  const handleDelete = async () => {
    if (!confirm(`Delete ${student?.name}? This cannot be undone.`)) return;

    const res = await fetch(`/api/students/${params.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      toast.error("Failed to delete student");
      return;
    }
    toast.success("Student deleted");
    router.push("/");
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>;
  }

  if (!student) return null;

  const age = student.dateOfBirth
    ? (() => {
        const today = new Date();
        const birth = new Date(student.dateOfBirth!);
        let a = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) a--;
        return a;
      })()
    : null;

  return (
    <div>
      <PageHeader
        title={age !== null ? `${student.name}, ${age}` : student.name}
        description={[student.email, student.phone]
          .filter(Boolean)
          .join(" · ")}
        actions={
          <div className="flex gap-2">
            <StudentForm
              student={{
                id: student.id,
                name: student.name,
                email: student.email ?? "",
                phone: student.phone ?? "",
                notes: student.notes ?? "",
                dateOfBirth: student.dateOfBirth ?? "",
                knownIssues: student.knownIssues ?? "",
                startDate: student.startDate ?? "",
              }}
              trigger={<Button variant="outline">Edit</Button>}
              onSave={handleEdit}
            />
            <Button variant="outline" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <Timeline studentId={student.id} />
        <ChatPanel studentId={student.id} studentName={student.name} />
      </div>
    </div>
  );
}

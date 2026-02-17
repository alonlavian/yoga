"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface StudentCardProps {
  student: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    notes: string | null;
    dateOfBirth: string | null;
    knownIssues: string | null;
    avatarUrl: string | null;
    startDate: string | null;
  };
}

function getAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function StudentCard({ student }: StudentCardProps) {
  const fallbackAvatar = `https://api.dicebear.com/9.x/thumbs/svg?seed=${student.id}`;
  const avatarSrc = student.avatarUrl || fallbackAvatar;

  return (
    <Link href={`/students/${student.id}`}>
      <Card className="cursor-pointer transition-shadow hover:shadow-md min-h-40">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center gap-2.5">
            <Image
              src={avatarSrc}
              alt={student.name}
              width={36}
              height={36}
              className="rounded-full bg-muted"
              unoptimized
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight truncate">
                {student.name}
              </p>
              {student.dateOfBirth && (
                <p className="text-xs text-muted-foreground">
                  Age {getAge(student.dateOfBirth)}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-0.5 text-xs text-muted-foreground">
          {student.email && <p>{student.email}</p>}
          {student.phone && <p>{student.phone}</p>}
          {student.startDate && (
            <p>
              Started{" "}
              {new Date(student.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
          {student.knownIssues && (
            <div className="flex items-start gap-1.5 pt-1 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
              <p className="line-clamp-1">{student.knownIssues}</p>
            </div>
          )}
          {student.notes && (
            <p className="line-clamp-1 pt-1">{student.notes}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

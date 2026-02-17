import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { studentSchema } from "@/lib/validators";
import { desc } from "drizzle-orm";

export async function GET() {
  const allStudents = await db
    .select()
    .from(students)
    .orderBy(desc(students.createdAt));
  return NextResponse.json(allStudents);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = studentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const avatarSeed = Math.random().toString(36).substring(2, 10);
  const avatarUrl = `https://api.dicebear.com/9.x/thumbs/svg?seed=${avatarSeed}`;

  const result = await db
    .insert(students)
    .values({
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      notes: parsed.data.notes || null,
      dateOfBirth: parsed.data.dateOfBirth || null,
      knownIssues: parsed.data.knownIssues || null,
      avatarUrl,
      startDate: parsed.data.startDate || null,
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}

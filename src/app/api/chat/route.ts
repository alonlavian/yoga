import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chatMessages, students, timelineEntries, classPlans } from "@/db/schema";
import { chatMessageSchema } from "@/lib/validators";
import { eq, desc } from "drizzle-orm";
import { getProvider } from "@/lib/ai/factory";

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json(
      { error: "studentId is required" },
      { status: 400 }
    );
  }

  const messages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.studentId, Number(studentId)))
    .orderBy(chatMessages.createdAt);

  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = chatMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Gather student context
  const student = await db
    .select()
    .from(students)
    .where(eq(students.id, parsed.data.studentId))
    .limit(1);

  if (student.length === 0) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const recentTimeline = await db
    .select()
    .from(timelineEntries)
    .where(eq(timelineEntries.studentId, parsed.data.studentId))
    .orderBy(desc(timelineEntries.date))
    .limit(20);

  const allPlans = await db.select({ title: classPlans.title }).from(classPlans);

  // Get conversation history
  const history = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.studentId, parsed.data.studentId))
    .orderBy(chatMessages.createdAt);

  const provider = await getProvider();

  // Build full message list including the new user message
  const fullHistory = [
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: parsed.data.content },
  ];

  let response: string;
  try {
    response = await provider.chat(
      fullHistory,
      {
        student: {
          id: student[0].id,
          name: student[0].name,
          notes: student[0].notes,
          startDate: student[0].startDate,
        },
        recentTimeline: recentTimeline.map((e) => ({
          type: e.type,
          date: e.date,
          content: e.content,
          summary: e.summary,
          duration: e.duration,
        })),
        classPlanNames: allPlans.map((p) => p.title),
      }
    );
  } catch (err) {
    console.error("AI provider error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `AI provider error: ${message}` },
      { status: 502 }
    );
  }

  // Save both messages only after successful AI response
  await db.insert(chatMessages).values({
    studentId: parsed.data.studentId,
    role: "user",
    content: parsed.data.content,
  });
  await db.insert(chatMessages).values({
    studentId: parsed.data.studentId,
    role: "assistant",
    content: response,
  });

  // Return all messages
  const allMessages = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.studentId, parsed.data.studentId))
    .orderBy(chatMessages.createdAt);

  return NextResponse.json(allMessages);
}

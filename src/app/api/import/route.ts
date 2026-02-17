import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  students,
  classPlans,
  classPlanItems,
  timelineEntries,
  chatMessages,
} from "@/db/schema";
import { sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const data = await request.json();

  if (!data.version || !data.students) {
    return NextResponse.json(
      { error: "Invalid export file format" },
      { status: 400 }
    );
  }

  // Clear existing data in correct order (respect foreign keys)
  await db.delete(chatMessages);
  await db.delete(timelineEntries);
  await db.delete(classPlanItems);
  await db.delete(classPlans);
  await db.delete(students);

  // Re-insert in correct order
  if (data.students.length > 0) {
    await db.insert(students).values(data.students);
  }
  if (data.classPlans.length > 0) {
    await db.insert(classPlans).values(data.classPlans);
  }
  if (data.classPlanItems.length > 0) {
    await db.insert(classPlanItems).values(data.classPlanItems);
  }
  if (data.timelineEntries.length > 0) {
    await db.insert(timelineEntries).values(data.timelineEntries);
  }
  if (data.chatMessages.length > 0) {
    await db.insert(chatMessages).values(data.chatMessages);
  }

  // Reset autoincrement counters so new IDs don't conflict
  await db.run(sql`DELETE FROM sqlite_sequence`);

  return NextResponse.json({ success: true });
}

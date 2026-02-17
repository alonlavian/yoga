import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  students,
  classPlans,
  classPlanItems,
  timelineEntries,
  chatMessages,
} from "@/db/schema";

export async function GET() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    students: await db.select().from(students),
    classPlans: await db.select().from(classPlans),
    classPlanItems: await db.select().from(classPlanItems),
    timelineEntries: await db.select().from(timelineEntries),
    chatMessages: await db.select().from(chatMessages),
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="yoga-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}

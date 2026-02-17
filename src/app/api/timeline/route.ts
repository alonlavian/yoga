import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { timelineEntries, classPlans, classPlanItems } from "@/db/schema";
import { timelineEntrySchema } from "@/lib/validators";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const studentId = request.nextUrl.searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json(
      { error: "studentId is required" },
      { status: 400 }
    );
  }

  const entries = await db
    .select()
    .from(timelineEntries)
    .where(eq(timelineEntries.studentId, Number(studentId)))
    .orderBy(desc(timelineEntries.date), desc(timelineEntries.createdAt));

  // Enrich class entries that have an attached plan
  const enriched = await Promise.all(
    entries.map(async (entry) => {
      if (entry.type === "class" && entry.classPlanId) {
        const plan = await db
          .select()
          .from(classPlans)
          .where(eq(classPlans.id, entry.classPlanId))
          .limit(1);

        if (plan.length > 0) {
          const items = await db
            .select()
            .from(classPlanItems)
            .where(eq(classPlanItems.planId, plan[0].id))
            .orderBy(classPlanItems.orderIndex);

          return {
            ...entry,
            planTitle: plan[0].title,
            planItems: items.map((i) => ({
              poseName: i.poseName,
              duration: i.duration,
              notes: i.notes,
              orderIndex: i.orderIndex,
            })),
          };
        }
      }
      return entry;
    })
  );

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = timelineEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const result = await db
    .insert(timelineEntries)
    .values({
      studentId: parsed.data.studentId,
      type: parsed.data.type,
      date: parsed.data.date,
      content: parsed.data.content || null,
      duration: parsed.data.duration ?? null,
      classPlanId: parsed.data.classPlanId ?? null,
      summary: parsed.data.summary || null,
    })
    .returning();

  return NextResponse.json(result[0], { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { timelineEntries } from "@/db/schema";
import { timelineEntrySchema } from "@/lib/validators";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = timelineEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const result = await db
    .update(timelineEntries)
    .set({
      type: parsed.data.type,
      date: parsed.data.date,
      content: parsed.data.content || null,
      duration: parsed.data.duration ?? null,
      classPlanId: parsed.data.classPlanId ?? null,
      summary: parsed.data.summary || null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(timelineEntries.id, Number(id)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await db
    .delete(timelineEntries)
    .where(eq(timelineEntries.id, Number(id)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

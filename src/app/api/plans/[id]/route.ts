import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { classPlans, classPlanItems } from "@/db/schema";
import { classPlanSchema } from "@/lib/validators";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const plan = await db
    .select()
    .from(classPlans)
    .where(eq(classPlans.id, Number(id)))
    .limit(1);

  if (plan.length === 0) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const items = await db
    .select()
    .from(classPlanItems)
    .where(eq(classPlanItems.planId, Number(id)));

  return NextResponse.json({ ...plan[0], items });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const parsed = classPlanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const result = await db
    .update(classPlans)
    .set({
      title: parsed.data.title,
      description: parsed.data.description || null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(classPlans.id, Number(id)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  // Replace items
  await db.delete(classPlanItems).where(eq(classPlanItems.planId, Number(id)));

  if (parsed.data.items.length > 0) {
    await db.insert(classPlanItems).values(
      parsed.data.items.map((item) => ({
        planId: Number(id),
        orderIndex: item.orderIndex,
        poseName: item.poseName,
        duration: item.duration || null,
        notes: item.notes || null,
      }))
    );
  }

  const items = await db
    .select()
    .from(classPlanItems)
    .where(eq(classPlanItems.planId, Number(id)));

  return NextResponse.json({ ...result[0], items });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await db
    .delete(classPlans)
    .where(eq(classPlans.id, Number(id)))
    .returning();

  if (result.length === 0) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

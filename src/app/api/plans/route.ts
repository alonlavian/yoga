import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { classPlans, classPlanItems } from "@/db/schema";
import { classPlanSchema } from "@/lib/validators";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const plans = await db
    .select()
    .from(classPlans)
    .orderBy(desc(classPlans.createdAt));
  return NextResponse.json(plans);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = classPlanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const plan = await db
    .insert(classPlans)
    .values({
      title: parsed.data.title,
      description: parsed.data.description || null,
    })
    .returning();

  if (parsed.data.items.length > 0) {
    await db.insert(classPlanItems).values(
      parsed.data.items.map((item) => ({
        planId: plan[0].id,
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
    .where(eq(classPlanItems.planId, plan[0].id));

  return NextResponse.json({ ...plan[0], items }, { status: 201 });
}

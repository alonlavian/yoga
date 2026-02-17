import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { settingsUpdateSchema } from "@/lib/validators";
import { sql } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(settings);

  const result: Record<string, string> = {};
  for (const row of rows) {
    if (row.key === "gemini_api_key" && row.value.length > 4) {
      result[row.key] = "••••" + row.value.slice(-4);
    } else {
      result[row.key] = row.value;
    }
  }

  return NextResponse.json(result);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const parsed = settingsUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  await db
    .insert(settings)
    .values({
      key: parsed.data.key,
      value: parsed.data.value,
      updatedAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: settings.key,
      set: {
        value: sql`excluded.value`,
        updatedAt: sql`excluded.updated_at`,
      },
    });

  return NextResponse.json({ success: true });
}

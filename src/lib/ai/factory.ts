import type { AIProvider } from "./provider";
import { PlaceholderProvider } from "./placeholder";
import { GeminiProvider } from "./gemini";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getProvider(): Promise<AIProvider> {
  const row = await db
    .select()
    .from(settings)
    .where(eq(settings.key, "gemini_api_key"))
    .limit(1);

  if (row.length > 0 && row[0].value) {
    return new GeminiProvider(row[0].value);
  }

  return new PlaceholderProvider();
}

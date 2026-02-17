import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AIProvider, ChatMessage, StudentContext } from "./provider";

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async chat(
    messages: ChatMessage[],
    studentContext: StudentContext
  ): Promise<string> {
    const { student, recentTimeline, classPlanNames } = studentContext;

    const systemInstruction = [
      `You are a helpful yoga teaching assistant. You help manage and plan yoga sessions for students.`,
      `Current student: ${student.name}`,
      student.notes ? `Student notes: ${student.notes}` : null,
      student.startDate ? `Started: ${student.startDate}` : null,
      recentTimeline.length > 0
        ? `Recent timeline:\n${recentTimeline
            .map(
              (e) =>
                `- [${e.type}] ${e.date}: ${e.summary || e.content || "no details"}${e.duration ? ` (${e.duration} min)` : ""}`
            )
            .join("\n")}`
        : null,
      classPlanNames.length > 0
        ? `Available class plans: ${classPlanNames.join(", ")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    const model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction,
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    return result.response.text();
  }
}

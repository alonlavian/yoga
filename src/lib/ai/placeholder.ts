import type { AIProvider, ChatMessage, StudentContext } from "./provider";

export class PlaceholderProvider implements AIProvider {
  async chat(
    _messages: ChatMessage[],
    studentContext: StudentContext
  ): Promise<string> {
    const { student, recentTimeline } = studentContext;

    const summaryParts: string[] = [];

    if (student.startDate) {
      summaryParts.push(`Started on ${student.startDate}`);
    }

    if (student.notes) {
      summaryParts.push(`Notes: ${student.notes}`);
    }

    const classCount = recentTimeline.filter((e) => e.type === "class").length;
    const noteCount = recentTimeline.filter((e) => e.type === "note").length;

    if (classCount > 0) {
      summaryParts.push(
        `${classCount} recent class${classCount > 1 ? "es" : ""}`
      );
    }
    if (noteCount > 0) {
      summaryParts.push(
        `${noteCount} recent note${noteCount > 1 ? "s" : ""}`
      );
    }

    const summary =
      summaryParts.length > 0
        ? summaryParts.join(". ") + "."
        : "No history yet.";

    return `AI chat coming soon. Here's what I know about ${student.name}: ${summary}`;
  }
}

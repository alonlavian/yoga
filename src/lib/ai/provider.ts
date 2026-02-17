export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StudentContext {
  student: {
    id: number;
    name: string;
    notes: string | null;
    startDate: string | null;
  };
  recentTimeline: {
    type: string;
    date: string;
    content: string | null;
    summary: string | null;
    duration: number | null;
  }[];
  classPlanNames: string[];
}

export interface AIProvider {
  chat(
    messages: ChatMessage[],
    studentContext: StudentContext
  ): Promise<string>;
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "./chat-message";
import { toast } from "sonner";

interface Message {
  id: number;
  role: string;
  content: string;
  createdAt: string;
}

interface ChatPanelProps {
  studentId: number;
  studentName: string;
}

export function ChatPanel({ studentId, studentName }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    const res = await fetch(`/api/chat?studentId=${studentId}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    }
  }, [studentId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const content = input.trim();
    setInput("");
    setSending(true);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      },
    ]);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, content }),
    });

    setSending(false);

    if (!res.ok) {
      toast.error("Failed to send message");
      return;
    }

    fetchMessages();
  };

  return (
    <div className="flex h-[600px] flex-col rounded-lg border bg-[#E8E0F0]/30">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Chat about {studentName}</h2>
        <p className="text-xs text-muted-foreground">
          Ask questions about this student&apos;s history
        </p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">
            Start a conversation about {studentName}.
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="border-t p-3 flex gap-2">
        <Input
          placeholder="Ask about this student..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={sending}
        />
        <Button type="submit" size="sm" disabled={sending || !input.trim()}>
          {sending ? "..." : "Send"}
        </Button>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "./chat-message";
import { cn } from "@/lib/utils";
import { Message } from "@/types/chatTypes";
import { Brain } from "lucide-react";

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatMessages({
  messages,
  isLoading = false,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center w-full h-full">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <Brain />
        </div>
        <h3 className="text-xl font-medium">Welcome to Recall</h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          Start a conversation with the AI assistant. Ask questions, get
          information from your saved Bookmarks.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-1 overflow-y-auto overflow-x-hidden px-10 h-full",
        "scrollbar-chat"
      )}
    >
      <div className="flex-1" />
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
      {isLoading && (
        <ChatMessage
          message={{
            id: "loading",
            content: "...",
            role: "assistant",
            createdAt: new Date(),
          }}
          isLoading
        />
      )}
      <div ref={bottomRef} />
    </div>
  );
}

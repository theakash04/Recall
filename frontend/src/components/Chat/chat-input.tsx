"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "@/types/chatTypes";

interface ChatInputProps {
  onSendMessageAction: (message: Message) => void;
  isLoading?: boolean;
}

export function ChatInput({
  onSendMessageAction,
  isLoading = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialHeightRef = useRef<number>(0);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = `${initialHeightRef.current}px`;
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 200;

      textareaRef.current.style.height = `${Math.min(
        scrollHeight,
        maxHeight
      )}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSendMessageAction({
        id: Date.now().toString(),
        content: message.trim(),
        role: "user",
        createdAt: new Date(),
      });
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = `48px`;
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (isLoading) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-4 border-t backdrop-blur-sm",
        "sticky bottom-0 w-full transition-all duration-300 justify-center"
      )}
    >
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        autoFocus={true}
        rows={1}
        className={cn(
          "min-h-[40px] max-h-[200px] resize-none rounded-xl p-3 pr-12",
          "border-muted bg-background overflow-hidden",
          "focus-visible:ring-1 focus-visible:ring-primary/30",
          "transition-all duration-200"
        )}
      />
      <Button
        onClick={handleSubmit}
        disabled={!message.trim() || isLoading}
        size="icon"
        className={cn(
          "rounded-full w-10 h-10",
          "transition-all duration-200 cursor-pointer",
          "hover:bg-primary/90 active:scale-95",
          !message.trim() && "opacity-70"
        )}
      >
        <ArrowUp />
        <span className="sr-only">Send message</span>
      </Button>
    </div>
  );
}

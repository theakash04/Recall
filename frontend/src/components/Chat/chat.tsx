"use client";

import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import useChatStore from "@/store/chatStore";

function ChatInner() {
  const { messages, isLoading, sendMessage, clearMessages } = useChatStore();

  return (
    <div
      className={cn(
        "flex flex-col h-full w-full mx-auto",
        "overflow-hidden",
        "transition-all duration-300"
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearMessages}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Clear chat</span>
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatMessages messages={messages} isLoading={isLoading} />
      </div>

      <ChatInput onSendMessageAction={sendMessage} isLoading={isLoading} />
    </div>
  );
}

export function Chat() {
  return <ChatInner />;
}

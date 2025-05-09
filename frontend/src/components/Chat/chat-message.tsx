import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChatMessageProps } from "@/types/chatTypes";
import { Brain, User } from "lucide-react";
import MarkdownRenderer from "../MarkdownRenderer";

export function ChatMessage({ message, isLoading = false }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 py-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 bg-primary/10">
          <AvatarFallback className="text-primary">
            <Brain className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex flex-col max-w-[80%] sm:max-w-[70%] items-center justify-center",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-xl max-w-[700px]",
            isUser
              ? "bg-primary text-primary-foreground py-3 px-2"
              : "bg-muted text-foreground px-4 py-3",
            "shadow-sm"
          )}
        >
          {isLoading ? (
            <Skeleton className="h-4 w-[250px]" />
          ) : (
            <div className="px-5 flex flex-col gap-4 markdown">
              <MarkdownRenderer content={message.content} />
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {message.createdAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 bg-primary/10">
          <AvatarFallback className="text-primary">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

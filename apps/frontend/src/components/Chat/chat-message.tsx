import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChatMessageProps } from "@/types/chatTypes";
import MarkdownRenderer from "./MarkdownRenderer";

export function ChatMessage({ message, isLoading = false }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 py-4 px-2 sm:px-4", // Added horizontal padding
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex flex-col w-full max-w-[99%]", // Constrain width
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-xl",
            isUser
              ? "bg-accent text-foreground py-2 px-4 md:w-max w-full"
              : "text-foreground px-0 py-3 w-full max-w-[90%]",
            "shadow-sm w-max"
          )}
        >
          {isLoading ? (
            <Skeleton className="bg-transparent" />
          ) : (
            <div
              className={cn(
                "flex flex-col gap-4 markdown overflow-x-hidden",
                isUser ? "text-end" : "text-start",
              )}
            >
              <MarkdownRenderer content={message.content} />
            </div>
          )}
        </div>
        {/* create option to copy text */}
      </div>
    </div>
  );
}

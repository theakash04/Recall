export type MessageRole = "user" | "assistant";

export type Message = {
  id: string;
  content: string;
  role: MessageRole;
  createdAt: Date;
};

export type ChatMessageProps = {
  message: Message;
  isLoading?: boolean;
};

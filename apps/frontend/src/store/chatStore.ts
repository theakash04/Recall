import { create } from "zustand";
import { Message, OpenAIChatResponse } from "@/types/chatTypes";
import axios from "axios";

type chatStore = {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (newMsg: Message) => void;
  clearMessages: () => void;
};

// const aiDummyMsg: Message = {
//   id: Date.now().toString(),
//   content: "Something i am telling you...",
//   role: "assistant",
//   createdAt: new Date(),
// };

const useChatStore = create<chatStore>()((set) => ({
  messages: [],
  isLoading: false,
  sendMessage: async (newMsg) => {
    set((state) => ({
      isLoading: true,
      messages: [...state.messages, newMsg],
    }));

    try {
      const response = await axios.post<OpenAIChatResponse>(
        "https://api.mistral.ai/v1/chat/completions",
        {
          model: "mistral-large-latest",
          messages: [{ role: "user", content: newMsg.content }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_MISTRAL_API_KEY}`, // Use .env for security
          },
        }
      );
      let reply = "Server is busy, please try again later";

      if (
        response.status === 200 &&
        response.data?.choices?.length > 0 &&
        response.data.choices[0]?.message?.content
      ) {
        reply = response.data.choices[0].message.content;
      }

      const aiMsg: Message = {
        id: Date.now().toString(),
        content: reply,
        role: "assistant",
        createdAt: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, aiMsg],
        isLoading: false,
      }));
    } catch (err) {
      console.log(err);
      set({ isLoading: false });
    }
  },

  clearMessages: () =>
    set({
      messages: [],
    }),
}));

export default useChatStore;

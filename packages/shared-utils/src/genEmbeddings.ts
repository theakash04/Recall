import { GoogleGenAI } from "@google/genai";

async function geminiEmbedding(params: {
  content: {
    splitContentId: string;
    text: string;
  }[];
  API_KEY: string;
}) {
  const ai = new GoogleGenAI({
    apiKey: params.API_KEY,
  });

  const content = params.content.map((data) => data.text);

  const response = await ai.models.embedContent({
    model: "models/text-embedding-004",
    contents: content,
    config: {
      taskType: "SEMANTIC_SIMILARITY",
    },
  });
  const result = response.embeddings?.map((embed, idx) => ({
    splitContentId: params.content[idx]?.splitContentId,
    text: params.content[idx]?.text,
    embedding: embed.values,
  }));

  return result;
}

export default geminiEmbedding;

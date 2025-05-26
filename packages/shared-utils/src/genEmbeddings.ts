import { GoogleGenAI } from "@google/genai";

async function geminiEmbedding(params: {
  content: string[] | string;
  API_KEY: string;
}) {
  const ai = new GoogleGenAI({
    apiKey: params.API_KEY,
  });

  const response = await ai.models.embedContent({
    model: "models/text-embedding-004",
    contents: params.content,
    config: {
      taskType: "SEMANTIC_SIMILARITY",
    },
  });
  const result = response.embeddings?.map((embed, idx) => ({
    text: params.content[idx],
    embedding: embed.values,
  }));

  return result;
}


export default geminiEmbedding
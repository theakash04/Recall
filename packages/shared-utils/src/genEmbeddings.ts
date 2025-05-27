import { GoogleGenAI } from "@google/genai";

type EmbeddingParams = {
  content?: {
    splitContentId: string;
    text: string;
  }[];
  query?: string;
  API_KEY: string;
};

type EmbeddingResult = {
  splitContentId: string;
  text: string;
  embedding: number[];
};

async function geminiEmbedding(
  params: EmbeddingParams
): Promise<number[] | EmbeddingResult[]> {
  if (!params.API_KEY) {
    throw new Error("API_KEY is required");
  }

  const ai = new GoogleGenAI({
    apiKey: params.API_KEY,
  });

  try {
    // Handle single query input
    if (params.query) {
      const response = await ai.models.embedContent({
        model: "models/text-embedding-004",
        contents: params.query,
        config: {
          taskType: "SEMANTIC_SIMILARITY",
        },
      });

      if (!response.embeddings?.values) {
        throw new Error("No embedding returned for query");
      }

      const firstEmbedding = response.embeddings[0];
      if (!firstEmbedding || !firstEmbedding.values) {
        throw new Error("Invalid embedding data required!");
      }

      return firstEmbedding.values;
    }

    // Handle batch content input
    if (!params.content || params.content.length === 0) {
      throw new Error("No content provided!");
    }

    const content = params.content.map((data) => data.text);

    const response = await ai.models.embedContent({
      model: "models/text-embedding-004",
      contents: content,
      config: {
        taskType: "SEMANTIC_SIMILARITY",
      },
    });

    if (
      !response.embeddings ||
      response.embeddings.length !== params.content.length
    ) {
      throw new Error(
        "Embedding response length doesn't match input content length"
      );
    }

    const result: EmbeddingResult[] = response.embeddings.map((embed, idx) => {
      const contentItem = params.content![idx]; // Safe because we checked length above
      if (!contentItem) {
        throw new Error(`Missing content item at index ${idx}`);
      }

      return {
        splitContentId: contentItem.splitContentId,
        text: contentItem.text,
        embedding: embed.values || [],
      };
    });
    return result;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw new Error(
      `Failed to generate embeddings: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export default geminiEmbedding;

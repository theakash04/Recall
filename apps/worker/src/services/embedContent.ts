import dotenv from "dotenv";
import { SplitInsertResult } from "../types/returnTypes";
// import {} from "@repo/utils"

dotenv.config();
type embedContentParams = SplitInsertResult;

const GEMINI_API = process.env.GEMINI_API;

if (!GEMINI_API) {
  throw new Error("Missing Google Gemini API key in .env");
}

async function embedContent(params: SplitInsertResult) {
  // geminiEmbedding;
}

export default embedContent;

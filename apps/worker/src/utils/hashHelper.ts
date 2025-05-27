import crypto from "crypto";

// Hash function
export async function hashTextContent(content: string) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

// Hash Verify Function

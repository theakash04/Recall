import Redis from "ioredis"
import { configDotenv } from "dotenv";

configDotenv();

const REDIS_URL = process.env.REDIS_STR;

if (!REDIS_URL) {
  console.log("No redis env provided!")
  process.exit(1)
}
const client = new Redis(REDIS_URL);

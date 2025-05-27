import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
// import { pinoHttp } from "pino-http";
import cookieParser from "cookie-parser";
// import logger from "./utils/logger";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const origins = ["http://localhost:3000"];

// app.use(
//   pinoHttp({
//     logger: logger,
//   })
// );
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: origins, credentials: true }));

// health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    satus: 200,
    message: "Server is in healthy state!",
  });
});

// routes
import authRoute from "./routes/auth.routes";
import bookmarkRoute from "./routes/bookmarks.routes";
import guardApi from "./middlewares/gaurd";

app.use("/api/auth", authRoute);
app.use("/api", guardApi, bookmarkRoute);

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

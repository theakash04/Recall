import { Request, Response, Router } from "express";

const router = Router();

router.get("/add-bookmarks", async (_req: Request, res: Response) => {
  res.json({
    message: "bookmark added!"
  })
})


export default router;

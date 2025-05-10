import { Request, Response, Router } from "express";
import { user } from "../types/userTypes";

const router = Router();

router.get("/add-bookmarks", async (req: Request, res: Response) => {
  const user = (req as any).user as user;

  
  

  res.json({
    message: "bookmark added!"
  })
})


export default router;

import { Request, Response, Router } from "express";
import { user } from "../types/userTypes";

const router = Router();

router.post("/add-bookmark", async (req: Request, res: Response) => {
  const user = (req as any).user as user;
  const url = req.body()
  console.log(url);


  res.json({
    message: "bookmark added!"
  })
})


export default router;

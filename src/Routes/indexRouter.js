import { Router } from "express";
import authRouter from "./authRouter.js";

const router = Router();

router.get('/', (req, res) => res.send('deu certo'));
router.use(authRouter);

export default router;
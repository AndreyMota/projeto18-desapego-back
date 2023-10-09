import { Router } from "express";
import authRouter from "./authRouter.js";
import prodRouter from "./prodRouter.js";

const router = Router();

router.get('/', (req, res) => res.send('deu certo'));
router.use(authRouter);
router.use(prodRouter);

export default router;
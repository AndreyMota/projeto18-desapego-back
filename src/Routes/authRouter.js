import { Router } from "express";
import { getUsers, postSignUp, signIn } from "../Controllers/authController.js";
import { loginSchema, userSchema } from "../Schemas/authSchemas.js";
import validateSchema from "../Middlewares/validateSchema.js";

const authRouter = Router();

authRouter.get('/users', getUsers);
authRouter.post('/signup', validateSchema(userSchema), postSignUp);
authRouter.post('/signin', validateSchema(loginSchema), signIn);

export default authRouter;
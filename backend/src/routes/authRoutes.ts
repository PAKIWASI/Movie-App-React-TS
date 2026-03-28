// src/routes/authRoutes.ts
import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController";
import { validate } from "../middleware/validate";
import { UserSchema, LoginSchema } from "../types/user.type";

const router = Router();


// we validate the input with schema at middleware level
router.post("/register", validate(UserSchema), registerUser);

router.post("/login",    validate(LoginSchema), loginUser);



export default router;

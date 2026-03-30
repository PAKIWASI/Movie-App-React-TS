import { Router } from "express";
import { validate } from "../middleware/validate";
import { registerUser, loginUser } from "../controllers/authController";
import { UserSchema, LoginSchema } from "../types/user.type";
import authMiddleware from "../middleware/authMiddleware";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { 
    getAdmin, 
    getAdmins, 
    makeAdmin 
} from "../controllers/adminController";


const router = Router();


// we validate the input with schema at middleware level
router.post("/register", validate(UserSchema), registerUser);

router.post("/login", validate(LoginSchema), loginUser);


//  Admin Routes
router.get("/admin", authMiddleware, adminMiddleware, getAdmins);

router.get("/admin/:userid", authMiddleware, adminMiddleware, getAdmin);

router.post("/admin/:userid", authMiddleware, adminMiddleware, makeAdmin);



export default router;

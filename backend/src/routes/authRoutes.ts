import { Router } from "express";
import { registerUser, loginUser } from "../controllers/authController";
import { UserSchema, LoginSchema } from "../types/user.type";
import { validate } from "../middleware/validate";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { authMiddleware, authRateLimit } from "../middleware/authMiddleware";
import { 
    getAdmin, 
    getAdmins, 
    makeAdmin 
} from "../controllers/adminController";


const router = Router();


// we validate the input with schema at middleware level
router.post("/register", authRateLimit, validate(UserSchema), registerUser);

// login will do set a refresh token in db
router.post("/login", authRateLimit, validate(LoginSchema), loginUser);

// after access token expires in 15 mins, frontend sends the refresh token and if
// it's present in db we provide user with new access token, along with updated role
router.post("/refresh", refreshAccessToken);    // no authmiddleware on this

// this will delete the user's current refresh token from db
router.post("/logout", authMiddleware, logoutUser);

router.post("/logout-all", authMiddleware, logoutUserAll);

// TODO: im I missing something ? 


//  Admin Routes

router.get("/admin", authMiddleware, adminMiddleware, getAdmins);

router.get("/admin/:userid", authMiddleware, adminMiddleware, getAdmin);

router.post("/admin/:userid", authMiddleware, adminMiddleware, makeAdmin);



export default router;

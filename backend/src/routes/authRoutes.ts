import { Router } from "express";
import { validate } from "../middleware/validate";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { UserSchema, LoginSchema } from "../types/user.type";
import { 
    registerUser, 
    loginUser, 
    refreshAccessToken, 
    logoutUser,
    logoutUserAll
} from "../controllers/authController";
import { 
    authMiddleware, 
    authRateLimit, 
    refreshMiddleware 
} from "../middleware/authMiddleware";
import { 
    getAdmin, 
    getAdmins, 
    makeAdmin 
} from "../controllers/adminController";


const router = Router();


// we validate the input with schema at middleware level
router.post("/register", authRateLimit, validate(UserSchema), registerUser);

// login will create a refresh token in db and return both access and refresh tokens
router.post("/login", authRateLimit, validate(LoginSchema), loginUser);

// after access token expires in 15 mins, frontend sends the refresh token and if
// it's present in db we provide user with new access token, along with updated role
router.post("/refresh", refreshMiddleware, refreshAccessToken);    // no authmiddleware on this
// BUG: this req hangs ?

// this will delete the user's current refresh token from db
router.post("/logout", authMiddleware, logoutUser);

router.post("/logout-all", authMiddleware, logoutUserAll);

// we dont have delete as then we would need super user
// i can just delete from atlas


//  Admin Routes

router.get("/admin", authMiddleware, adminMiddleware, getAdmins);

router.get("/admin/:userid", authMiddleware, adminMiddleware, getAdmin);

router.post("/admin/:userid", authMiddleware, adminMiddleware, makeAdmin);



export default router;

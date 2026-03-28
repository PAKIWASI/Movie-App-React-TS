import { Router } from "express";
import { 
    getUsers, 
    getUserByName, 
    getUserByID, 
    updateUser, 
    deleteUser
} from "../controllers/userController";
import { validate } from "../middleware/validate";
import { UpdateUserSchema } from "../types/user.type";


const router = Router();

// Routes are just a table of *verb + path → handler function*. Nothing else. The logic lives in the controller.
// the order here matters. we have /:name but if that one was the first, then /api/users would get mapped to it and name would be empty
// if two routes are /:something, Express cannot tell them apart. It'll always match the first one and never reach the second.


// at root with no extra params
// GET  /api/users
router.get("/", getUsers);

// the specific shape of params one should be first
// GET /api/users/name/:name
router.get("/name/:name", getUserByName);

// the catch-all params one should be last, if we are at root but some param was passed
// GET /api/users/:id
router.get("/:id", getUserByID);   // the implicit mongoose id


// The middleware runs first. If validation fails, the controller never runs. 
// If it passes, req.body is already the correct typed shape.

// PUT /api/users/:id
router.put("/:id", validate(UpdateUserSchema), updateUser);

// TODO: these should be protected under auth

// DELETE /api/users/:id
router.delete("/:id", deleteUser);


export default router;

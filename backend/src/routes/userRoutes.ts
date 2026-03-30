import { Router } from "express";
import { validate } from "../middleware/validate";
import { UpdateUserSchema } from "../types/user.type";
import userMovieRoutes from "./userMovieRoutes";
import {
    getUsers,
    getUserByID,
    updateUser,
    deleteUser
} from "../controllers/userController";


const router = Router();

// Routes are just a table of *verb + path → handler function*. Nothing else. The logic lives in the controller.
// the order here matters. we have /:name but if that one was the first, then /api/users would get mapped to it and name would be empty
// if two routes are /:something, Express cannot tell them apart. It'll always match the first one and never reach the second.


// his endpoint leads to more routes
router.use("/me/movie", userMovieRoutes);  // specific — must come first

// at root with no extra params, has query parameters
// GET  /api/users
router.get("/", getUsers);

// the catch-all params one should be last, if we are at root but some param was passed
// GET /api/users/:id
router.get("/:userid", getUserByID);   // the implicit mongoose id


// The middleware runs first. If validation fails, the controller never runs. 
// If it passes, req.body is already the correct typed shape.

// UpdateUserSchema doesn't allow password updates
router.put("/:userid",
    // authMiddleware,          // calls next() -> go to validate
    validate(UpdateUserSchema), // calls next() -> go to updateUser
    updateUser                  // if at any point call next(error), go to the next error middleware
);

// TODO: add roles, so only admins can do this

router.delete("/:userid",
    // authMiddleware,
    deleteUser
);


export default router;

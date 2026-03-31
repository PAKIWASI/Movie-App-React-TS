import { Router } from "express";
import { validate } from "../middleware/validate";
import { adminMiddleware } from "../middleware/adminMiddleware";
import { UpdateUserSchema } from "../types/user.type";
import userMovieRoutes from "./userMovieRoutes";
import {
    getUsers,
    updateUser,
    deleteUser,
    getUser,
    deleteUserById
} from "../controllers/userController";


// this route is already protected by auth, so anyone here can do anything

const router = Router();

// Routes are just a table of *verb + path → handler function*. Nothing else. The logic lives in the controller.
// the order here matters. we have /:name but if that one was the first, then /api/users would get mapped to it and name would be empty
// if two routes are /:something, Express cannot tell them apart. It'll always match the first one and never reach the second.


// his endpoint leads to more routes
router.use("/me/movie", userMovieRoutes);  // specific — must come first

// at root with no extra params, has query parameters
// GET  /api/user
router.get("/", adminMiddleware, getUsers); // only admins can see all users

// GET /api/user/me
router.get("/me", getUser); // allow the user themselves to see their account

// The middleware runs first. If validation fails, the controller never runs. 
// If it passes, req.body is already the correct typed shape.

// UpdateUserSchema doesn't allow password updates
router.put("/me",
    validate(UpdateUserSchema), // calls next() -> go to updateUser
    updateUser                  // if at any point call next(error), go to the next error middleware
);

router.delete("/me", deleteUser);

// this comes after the /me route
//  allow admins to delete users
router.delete("/:userid", adminMiddleware, deleteUserById);


export default router;

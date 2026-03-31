import { Request, Response } from "express";
import UserModel from "../models/User";
import UserMovieModel from "../models/UserMovie";
import { getPagination, buildPaginationMeta } from "../utils/paginate";
import { sanitizeString } from "../utils/sanitize";


// GET /api/user?name=wasi&userid=387437&page=1&limit=10
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        // if we have id param, we need to fetch only that movie 
        if (req.query.userid) {
            await getUserById(req, res);
            return;
        }

        const { page, limit, skip } = getPagination(req);
        const name = sanitizeString(req.query.name);
        const filter = name ? { $text: { $search: name } } : {};

        const [users, total] = await Promise.all([
            UserModel.find(filter).skip(skip).limit(limit).select("-password"),
            UserModel.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: users,
            pagination: buildPaginationMeta(page, limit, total),
        });

    } catch (error) {
        console.error("getUsers Error: ", error);
        res.status(500).json({ success: false, message: "Failed to get users" });
    }
};


const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await UserModel.findById(req.query.userid as string).select("-password");
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("getUser Error: ", error);
        res.status(500).json({ success: false, message: "Failed to get user" });
    }
};


// GET /api/user/me
export const getUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await UserModel.findById((req as any).userid as string).select("-password");
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("getUser Error: ", error);
        res.status(500).json({ success: false, message: "Failed to get user" });
    }
};


// PUT /api/user/me
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await UserModel.findByIdAndUpdate(
            (req as any).userid,
            req.body,
            { returnDocument: 'after', runValidators: true }
        ).select("-password");

        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        res.status(200).json({ success: true, data: user });
    } catch (error: any) {
        console.error("updateUser Error: ", error);
        if (error.code === 11000) {
            res.status(409).json({ success: false, message: "Email already exists" });
            return;
        }
        res.status(500).json({ success: false, message: "Failed to update user" });
    }
};


// DELETE /api/user/me
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await UserModel.findByIdAndDelete((req as any).userid);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        await UserMovieModel.deleteMany({ userId: user._id });

        res.status(200).json({ success: true, message: "User deleted" });
    } catch (error) {
        console.error("deleteUser Error: ", error);
        res.status(500).json({ success: false, message: "Failed to delete user" });
    }
};



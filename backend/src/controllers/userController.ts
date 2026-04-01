import { Request, Response } from "express";
import UserModel from "../models/User";
import UserMovieModel from "../models/UserMovie";
import AdminModel, { Roles } from "../models/Admin";
import RefreshTokenModel from "../models/RefreshToken";
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
        const user = await UserModel.findById(req.userid as string).select("-password");
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
            req.userid,
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
        const user = await UserModel.findByIdAndDelete(req.userid);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        // a user is referenced in userMovie, we must delete
        await UserMovieModel.deleteMany({ userId: user._id });

        // a user also has refreshToken entries
        // deleted user still has access with access token for 15 min
        // this prevents from refreshing that token
        await RefreshTokenModel.deleteMany({ userId: user._id });

        res.status(200).json({ success: true, message: "User deleted" });
    } catch (error) {
        console.error("deleteUser Error: ", error);
        res.status(500).json({ success: false, message: "Failed to delete user" });
    }
};


// TODO: test
// DELETE /api/user/:userid
export const deleteUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = await UserModel.exists({ _id: req.params.userid });
        if (!id) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        // check if user is an admin or not
        const role = await AdminModel.getRole(id._id.toString());
        if (role == Roles.admin) {
            res.status(500).json({ success: false, message: "Can't delete an admin" });
            return; 
        }

        // safe to delete
        await UserModel.findByIdAndDelete(req.params.userid);
        await UserMovieModel.deleteMany({ userId: id._id });
        await RefreshTokenModel.deleteMany({ userId: id._id });
        await AdminModel.deleteOne({ userId: id._id });

        res.status(200).json({ success: true, message: "User deleted" });
    } catch (error) {
        console.error("deleteUserById Error:", error);
        res.status(500).json({ success: false, message: "Failed to delete user" });
    }
};



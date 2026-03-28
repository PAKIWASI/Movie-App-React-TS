import { Request, Response } from "express";
import userModel from "../models/User";

const MIN_PAGES = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

// GET /api/users?name=Ali&page=1&limit=10
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const page  = Math.max(MIN_PAGES, parseInt(req.query.page  as string) || MIN_PAGES);
        const limit = Math.min(MAX_LIMIT, parseInt(req.query.limit as string) || DEFAULT_LIMIT); // cap at 100
        const skip  = (page - 1) * limit;

        const filter = req.query.name ? { $text: { $search: req.query.name as string } } : {};

        const [users, total] = await Promise.all([
            userModel.find(filter)
                .skip(skip)
                .limit(limit)
                .select("-password"),
            userModel.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: users,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to get users" });
    }
};

// GET /api/users/:id
export const getUserByID = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await userModel.findById(req.params.id).select("-password");
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to get user" });
    }
};

// PUT /api/users/:id
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // zod validator middleware already checked req.body
        
        const user = await userModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: 'after', runValidators: true }  // return updated doc, runValidators: enforce schema rules
        ).select("-password");  // exclude password field

        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update user" });
    }
};


// DELETE /api/users/:id
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await userModel.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        res.status(200).json({ success: true, message: "User deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete user" });
    }
};



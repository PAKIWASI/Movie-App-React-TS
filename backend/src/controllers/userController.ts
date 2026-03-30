import { Request, Response } from "express";
import UserModel from "../models/User";
import UserMovieModel from "../models/UserMovie";


const MIN_PAGES = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;


// GET /api/user?name=wasi&userid=387437&page=1&limit=10
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
            // if we have id param, just seach for and return that user
        if (req.query.userid) {
            await getUser(req, res);
            return;
        }

        const page  = Math.max(MIN_PAGES, parseInt(req.query.page  as string) || MIN_PAGES);
        const limit = Math.min(MAX_LIMIT, parseInt(req.query.limit as string) || DEFAULT_LIMIT); // cap at 100
        const skip  = (page - 1) * limit;           // SQL: LIMIT 10 OFFSET 10

        const filter = req.query.name ? { $text: { $search: req.query.name as string } } : {};

        const [users, total] = await Promise.all([
            UserModel.find(filter)
                .skip(skip)
                .limit(limit)
                .select("-password"),
            UserModel.countDocuments(filter),
        ]);

        res.status(200).json({
            success: true,
            data: users,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });

    } catch (error) {
        console.error("getUsers Error: ", error);
        res.status(500).json({ success: false, message: "Failed to get users" });
    }
};

// called by getUsers
// and GET /api/user/me
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
            { returnDocument: 'after', runValidators: true }  // return updated doc, runValidators: enforce schema rules
        ).select("-password");  // exclude password field

        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        res.status(200).json({ success: true, data: user });
    } catch (error: any) {
        console.error("updateUser Error: ", error);
        // Duplicate email (MongoDB error code 11000)
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

        // cascade delete all their movie records
        await UserMovieModel.deleteMany({ userId: user._id });

        res.status(200).json({ success: true, message: "User deleted" });
    } catch (error) {
        console.error("deleteUser Error: ", error);
        res.status(500).json({ success: false, message: "Failed to delete user" });
    }
};



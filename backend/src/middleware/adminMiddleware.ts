import { Request, Response, NextFunction } from "express";
import { Roles } from "../models/Admin";




// we call this right after authMiddleware, it has req.userid and req.role
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const role = (req as any).role as Roles;
        if (role !== Roles.admin) {
            return res.status(403).json({ success: false, message: "Admin access required" });
        }
        next();
    } catch (error) {
        console.error("Admin middleware error:", error);
        res.status(500).json({ success: false, message: "Error checking admin status" });
    }
};

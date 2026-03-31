import { Request, Response, NextFunction } from "express";
import { Roles } from "../models/Admin";

// interface MyReq extends Request {       // TODO: this solves the (req as any) problem
//     userid?: string;                    // but i dont like it
//     role?: import("../models/Admin").Roles;
// }



// we call this right after authMiddleware, it has req.userid and req.role
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const role = req.role as Roles;
        if (role === undefined || role === null) {
            return res.status(401).json({ success: false, message: "No role found in token" });
        }

        if (role !== Roles.admin) {
            return res.status(403).json({ success: false, message: "Admin access required" });
        }

        next();
        
    } catch (error) {
        console.error("Admin middleware error:", error);
        res.status(500).json({ success: false, message: "Error checking admin status" });
    }
};

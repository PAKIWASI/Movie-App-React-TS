import { Request, Response } from "express";
import AdminModel from "../models/Admin";




// GET /api/auth/admin — list all admins
export const getAdmins = async (_req: Request, res: Response) => {
    try {
        const admins = await AdminModel.find();
        res.status(200).json({ success: true, data: admins });
    } catch (error) {
        console.error("getAdmins Error: ", error);
        res.status(500).json({ success: false, message: "Failed to get admins" });
    }
};

// GET /api/auth/admin/:userid — check if user is admin
export const getAdmin = async (req: Request, res: Response) => {
    try {
        const admin = await AdminModel.findOne({ userId: req.params.userid });
        if (!admin) { 
            res.status(404).json({ success: false, message: "Admin not found" });
            return; 
        }

        res.status(200).json({ success: true, data: admin });
    } catch (error) {
        console.error("getAdmin Error: ", error);
        res.status(500).json({ success: false, message: "Failed to get admin" });
    }
};

// POST /api/auth/admin/:userid — make user an admin
export const makeAdmin = async (req: Request, res: Response) => {
    try {
        const admin = await AdminModel.create({ 
            userId: req.params.userid as string, 
            addedBy: (req as any).userid 
        });

        res.status(201).json({ success: true, data: admin });
    } catch (error: any) {
        console.error("makeAdmin error:", error);
        // Duplicate (MongoDB error code 11000)
        if (error.code === 11000) {
            res.status(409).json({ success: false, message: "Admin already exists" });
            return;
        }
        res.status(500).json({ success: false, message: "Failed to register user" });
    }
};



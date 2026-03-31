import { Request, Response } from "express";
import AdminModel from "../models/Admin";
import UserModel from "../models/User";
import { getPagination, buildPaginationMeta } from "../utils/paginate";


// GET /api/auth/admin?page=1&limit=10
export const getAdmins = async (req: Request, res: Response) => {
    try {
        const { page, limit, skip } = getPagination(req);

        const [admins, total] = await Promise.all([
            AdminModel.find().skip(skip).limit(limit),
            AdminModel.countDocuments(),
        ]);

        res.status(200).json({
            success: true,
            data: admins,
            pagination: buildPaginationMeta(page, limit, total),
        });
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
        // 1. Confirm the target user actually exists
        const id = await UserModel.exists({ _id: req.params.userid });
        if (!id) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }

        // 2. Confirm the target is not already an admin
        //    (AdminModel.create would throw a duplicate-key error too, but this gives a cleaner 409 message)
        const alreadyAdmin = await AdminModel.exists({ userId: id._id });
        if (alreadyAdmin) {
            res.status(409).json({ success: false, message: "User is already an admin" });
            return;
        }

        const admin = await AdminModel.create({ 
            userId:  id._id, 
            addedBy: (req as any).userid,
        });

        res.status(201).json({ success: true, data: admin });
    } catch (error: any) {
        console.error("makeAdmin error:", error);
        // Belt-and-suspenders: catch any race-condition duplicate at the DB level too
        if (error.code === 11000) {
            res.status(409).json({ success: false, message: "User is already an admin" });
            return;
        }
        res.status(500).json({ success: false, message: "Failed to make user an admin" });
    }
};



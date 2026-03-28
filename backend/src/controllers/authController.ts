import { LoginInput, PublicUser, PublicUserSchema, User } from "../types/user.type";
import { Request, Response } from "express"
import userModel from "../models/User";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';



export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, age, email, password }: User = req.body; // safe, Zod already confirmed this
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create() and save() always run validators
        const user = await userModel.create({ 
            name, 
            age, 
            email, 
            password: hashedPassword 
        });  // this throws if already exist 

        const safeUser: PublicUser = PublicUserSchema.parse(user.toObject());
        res.status(201).json({ success: true, data: safeUser });

    } catch (error: any) {
        console.error("registerUser error:", error);
        // Duplicate email (MongoDB error code 11000)
        if (error.code === 11000) {
            res.status(409).json({ success: false, message: "Email already exists" });
            return;
        }
        res.status(500).json({ success: false, message: "Failed to register user" });
    }
};


export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password }: LoginInput = req.body;

        // Check if user exists
        let user = await userModel.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Invalid credentials" })
            return;
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user!.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }

        // Generate JWT token
        const token = jwt.sign({ id: user!._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

        // send the JWT token to user as cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        res.status(200).json({ success: true });

    } catch (error) {
        console.error("loginUser error:", error);
        res.status(500).json({ success: false, message: "Failed to login user" });
    }
};



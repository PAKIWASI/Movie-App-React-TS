import { NextFunction, Request, Response } from "express"
import { LoginInput, User } from "../types/user.type";
import UserModel, { IUser } from "../models/User";
import AdminModel from "../models/Admin";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';



export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, age, email, password }: User = req.body; // safe, Zod already confirmed this

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create() and save() always run validators
        const user = await UserModel.create({
            name,
            age,
            email,
            password: hashedPassword
        });  // this throws if already exist 

        // this strips _id which is not in zod schema but is in mongoose
        // const safeUser: PublicUser = PublicUserSchema.parse(user.toObject());
        const { password: _, ...safeUser } = user.toObject();
        res.status(201).json({ success: true, data: safeUser });

    } catch (error: any) {
        console.error("registerUser error:", error);
        // Duplicate email (MongoDB error code 11000)
        if (error.code === 11000) {
            res.status(409).json({ success: false, message: "User already exists" });
            return;
        }
        res.status(500).json({ success: false, message: "Failed to register user" });
    }
};


export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password }: LoginInput = req.body;

        // Check if user exists
        let user = await UserModel.findOne({ email });
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

        // Generate JWT Acess token       // we put user's id and role in the token
        const token = jwt.sign({
            userid: user!._id,
            role: await AdminModel.getRole(user._id.toString())
        },
            process.env.JWT_SECRET as string,
            { expiresIn: '1h' }
        );

        // send the JWT token to user as cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        res.status(200).json({ success: true, message: "User logged in" });

    } catch (error) {
        console.error("loginUser error:", error);
        res.status(500).json({ success: false, message: "Failed to login user" });
    }
};


export const refreshAccessToken = async (req: Request, res: Response) : Promise<void> => {
    try {

    } catch (error) {

    }
};


// Private

const accessTokenAge  = 15 * 60 * 1000;         // 15 mins
const refreshTokenAge = 24 * 60 * 60 * 1000;    // 1 day (for now)

// the auth middleware checks if this token is valid or not

const generateAccessToken = async (user: IUser, res: Response) => {

    // Generate JWT Acess token       // we put user's id and role in the token
    const token = jwt.sign({
        userid: user!._id,
        role: await AdminModel.getRole(user._id.toString())     // db lookup everytime token created
    },
        process.env.JWT_SECRET as string,
        { expiresIn: accessTokenAge }
    );

    // send the token to user as cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: accessTokenAge,
    });
};

const generateRefreshToken = async (user: IUser) => {

    const token = jwt.sign({
        
    },
        process.env.JWT_SECRET as string,
        { expiresIn: refreshTokenAge }
    );
};


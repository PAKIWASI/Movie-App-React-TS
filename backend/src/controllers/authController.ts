import { Request, Response } from "express"
import { LoginInput, User } from "../types/user.type";
import UserModel from "../models/User";
import RefreshTokenModel from "../models/RefreshToken";
import AdminModel from "../models/Admin";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';



// POST /api/auth/register
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


// generat new access and refresh tokens, add refresh to db
// even if user didn't logout next time, we create a new refresh token
// this is done considering the fact that user might have multiple logged in devices

// POST /api/auth/login
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

        await generateRefreshToken(user!._id.toString(), res);
        await generateAccessToken(user!._id.toString(), res);   

        res.status(200).json({ success: true, message: "User logged in" });

    } catch (error) {
        // we catch errors thrown by called funcs as we are awaiting them
        console.error("loginUser error:", error);
        res.status(500).json({ success: false, message: "Failed to login user" });
    }
};


// after refreshMiddleware, we have a valid refresh token so generate a new access token
// we get userid from refresh token (set as req.userid in middleware) and fetch role from db
// POST /api/auth/refresh
export const refreshAccessToken = async (req: Request, res: Response) : Promise<void> => {
    try {
        await generateAccessToken(req.userid as string, res); // all async funcs are throwable

        res.status(200).json({ success: true, message: "Token Refreshed "});
    } catch (error) {
        console.error("refreshAccessToken Error: ", error);
        res.status(500).json({ success: false, message: "Failed to refresh token" }); // AND THIS
    }
};

// DELETE refresh token on logout
// POST /api/auth/logout
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const refreshToken = req.cookies?.refresh;
        if (refreshToken) {                                             // TODO: providing extra userid..is this right?
            await RefreshTokenModel.deleteOne({ /*userId: req.userid,*/ token: refreshToken });
        }
        res.clearCookie("access");
        res.clearCookie("refresh");
        res.status(200).json({ success: true, message: "Logged out" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Logout failed" });
    }
};

// DELETE all refresh tokens for this user (logout all devices)
// POST /api/auth/logout-all
export const logoutUserAll = async (req: Request, res: Response): Promise<void> => {
    try {
        await RefreshTokenModel.deleteMany({ userId: req.userid });
        res.clearCookie("access");
        res.clearCookie("refresh");
        res.status(200).json({ success: true, message: "Logged out from all devices" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Logout failed" });
    }
};


// Private

                    // in seconds
const accessTokenAge  = 15 * 60;         // 15 mins
const refreshTokenAge = 24 * 60 * 60;     // 1 day (for now)

// the auth middleware checks if this token is valid or not

const generateAccessToken = async (userid: string, res: Response) => {

    // Generate JWT Acess token       // we put user's id and role in the token
    const access = jwt.sign({
        userid,
        role: await AdminModel.getRole(userid)     // db lookup everytime token created
    },
        process.env.JWT_SECRET as string,
        { expiresIn: accessTokenAge }
    );

    // send the token to user as cookie
    res.cookie("access", access, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: accessTokenAge * 1000, // to milliseconds
    });
};

// we hit this on login only
const generateRefreshToken = async (userid: string, res: Response) => {

    const refresh = jwt.sign({
        userid
    },
        process.env.JWT_SECRET as string,
        { expiresIn: refreshTokenAge }
    );

    // save auth token in db                // throws on failure
    await RefreshTokenModel.create({ 
        userId: userid,
        token: refresh,         // this is the ENCODED token
        expiresAt: new Date(Date.now() + refreshTokenAge * 1000)    // milliseconds
    });

    res.cookie("refresh", refresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: refreshTokenAge * 1000, // to milliseconds
    });

    // create throws on failure, if we had try/catch, we would have to catch and rethrow
    // the error back to caller or it is sollowed by catch here. now caller handles thrown errors
};




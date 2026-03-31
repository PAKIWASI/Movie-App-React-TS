import { Request, Response } from "express"
import { LoginInput, User } from "../types/user.type";
import UserModel, { IUser } from "../models/User";
import RefreshTokenModel from "../models/RefreshToken";
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


// generat new access and refresh tokens, add refresh to db
// even if user didn't logout next time, we create a new refresh token
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

        await generateRefreshToken(user!._id.toString(), res);  // TODO: does the catch{} catch the error 
                                                // generated in that function?
        await generateAccessToken(user!._id.toString(), res);   

        // // Generate JWT Acess token       // we put user's id and role in the token
        // const token = jwt.sign({
        //     userid: user!._id,
        //     role: await AdminModel.getRole(user._id.toString())
        // },
        //     process.env.JWT_SECRET as string,
        //     { expiresIn: '1h' }
        // );
        //
        // // send the JWT token to user as cookie
        // res.cookie("token", token, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === "production",
        //     sameSite: "strict",
        //     maxAge: 60 * 60 * 1000, // 1 hour
        // });

        res.status(200).json({ success: true, message: "User logged in" });

    } catch (error) {
        console.error("loginUser error:", error);
        res.status(500).json({ success: false, message: "Failed to login user" });
    }
};

// TODO: is this right

// after refreshMiddleware, we have a valid refresh token so generate a new access token
// we get userid from refresh token (set as req.userid in middleware) and fetch role from db
export const refreshAccessToken = async (req: Request, res: Response) : Promise<void> => {
    try {
        await generateAccessToken((req as any).userid, res);
    } catch (error) {
        console.error("refreshAccessToken Error: ", error);
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
        sameSite: "strict",
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

    const date = new Date();
    try {
        // save auth token in db
        const savedRefresh = await RefreshTokenModel.create({   // TODO: throws if fails right?
            userId: userid,
            token: refresh,         // this is the ENCODED token
            expiresAt: date.setTime(date.getTime() + (refreshTokenAge * 1000)),  // this is in milliseconds
        });

        res.cookie("refresh", refresh, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: refreshTokenAge * 1000, // to milliseconds
        });

    } catch (error) {
        console.error("generateRefreshToken Error: ", error);
    }
};




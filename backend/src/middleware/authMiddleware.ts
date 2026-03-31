import { Request, Response, NextFunction } from 'express';
import RefreshTokenModel from '../models/RefreshToken';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';


// authenticates the access token that comes with every req
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const accessToken = req.cookies?.access;   // we set the cookie name in generateAccessToken
    if (!accessToken) {
        return res.status(401).json({ message: "Access denied, no token provided" });
    }

    try {
        // throws a TokenExpiredError if the token is expired.
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET as string);
        req.userid = (decoded as any).userid

        req.role = (decoded as any).role;  // we added role field in userLogin

        next();
    } catch (error) {   
        console.error("authMiddleware Error: ", error);
        res.status(401).json({ message: "Invalid token" });
    }
};

// authenticates the refresh token send to /api/auth/refresh
// checks if refresh token in db
// if not that means token expired and user needs to login again
export const refreshMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.cookies?.refresh;   // we set the cookie name in generateAccessToken
        if (!refreshToken) {
            return res.status(401).json({ message: "Access denied, no Refresh token provided" });
        }

        // check in db                                      // we give it the encoded token
        const id = await RefreshTokenModel.exists({ token: refreshToken });
        if (!id) {
            res.status(401).json({ message: "Invalid Refresh token" });
            return;
        }
        
        // decode it and verify it's not expired
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string);
        req.userid = (decoded as any).userid;
        // role will be fetched by refreshaccesstoken
        
        next();

    } catch (error) { // if jwt.verify threw expiry error, then token was already deleted my mongodb
        console.error("refreshMiddleware Error: ", error);
        res.status(401).json({ message: "Invalid Refresh token" });
    }
};


// Rate limiting middleware 
// Brute-force / credential-stuffing protection on the two unauthenticated endpoints.
// register/login have no auth, so we need protection
export const authRateLimit = rateLimit({
    windowMs:         15 * 60 * 1000,  // 15 minutes
    max:              10,              // max requests per window per IP
    standardHeaders:  true,            // return rate limit info in RateLimit-* headers
    legacyHeaders:    false,
    message: { success: false, message: "Too many attempts, please try again later" },
});




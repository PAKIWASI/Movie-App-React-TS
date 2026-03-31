import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';



export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const token = req.cookies?.token;   // this is set by the cookieparser middleware
    if (!token) {
        return res.status(401).json({ message: "Access denied, no token provided" });
    }

    try {
        // TODO: does this test for expired access token?
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as any).userid = (decoded as any).userid;        // TODO: that type extention thing is not working

        (req as any).role = (decoded as any).role;  // we added role field in userLogin

        next();
    } catch (error) {
        // console.error("authMiddleware Error: ", error);
        res.status(401).json({ message: "Invalid token" });
    }
};


// Rate limiting 
// Brute-force / credential-stuffing protection on the two unauthenticated endpoints.
// register/login have no auth, so we need protection
export const authRateLimit = rateLimit({
    windowMs:         15 * 60 * 1000,  // 15 minutes
    max:              10,              // max requests per window per IP
    standardHeaders:  true,            // return rate limit info in RateLimit-* headers
    legacyHeaders:    false,
    message: { success: false, message: "Too many attempts, please try again later" },
});



// TODO: 
// 1. Refresh tokens — Short-lived access tokens (15min) + a POST /api/auth/refresh endpoint 
//      with a long-lived refresh token in a separate httpOnly cookie is the standard fix.
// 2. We store refresh tokens server side in a collection
// 3. We send both tokens to user on login
// 4. When access token expires, frontend sents req to /refresh with refresh token
// 5. We check if refresh is in DB, if yes then we generate new access token (and maybe renew the refresh token ?)
// 6. But how does frontend know to switch tokens? is it storing them all the time ?
// 7. /logout deletes the refresh token from db


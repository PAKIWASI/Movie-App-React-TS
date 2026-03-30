import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const token = req.cookies?.token;   // this uses the cookieparser middleware
    if (!token) {
        return res.status(401).json({ message: "Access denied, no token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        // BUG:             // we put userid filed when we created token
        (req as any).userid = (decoded as any).userid;        // TODO: that type extention thing is not working
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};


export default authMiddleware;

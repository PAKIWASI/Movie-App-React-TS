import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';



const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    const token = req.cookies?.token;   // this uses the cookieparser middleware
    if (!token) {
        return res.status(401).json({ message: "Access denied, no token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        (req as any).userid = (decoded as any).userid;        // TODO: that type extention thing is not working

        (req as any).role = (decoded as any).role;  // we added role field in userLogin

        next();
    } catch (error) {
        console.error("authMiddleware Error: ", error);
        res.status(401).json({ message: "Invalid token" });
    }
};

// the role is embedded in the token at login and never updated until the token expires. 
// If you make someone an admin, they won't get admin access until they log out and back in
// this is because when a user logs in and makes request, this func just sets the role that was in the token
// maybe someone promoted user, user won't have admin status until the next time they log in (hit the loginUser func)
// this can be fixed by checking admin db here using userid and updating role but that is a db op in auth middleware (very expensive)
// So the rule is: always log in if you anticipate role change

export default authMiddleware;

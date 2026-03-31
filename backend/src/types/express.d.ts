
// req.user doesn't exist on Express's Request type, we need to extend it

declare global {
    namespace Express {
        interface Request {
            userid?: string;
            role?: import("../models/Admin").Roles;
        }
    }
}

export {} // force as

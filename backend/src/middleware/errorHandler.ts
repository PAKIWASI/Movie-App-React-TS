import { Request, Response, NextFunction } from "express";



export const notFound = (req: Request, res: Response): void => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
};



import { Request, Response, NextFunction } from "express";



export const notFound = (req: Request, res: Response, _next: NextFunction) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
};

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {

    console.error("Unhandled error:", err.stack);
    res.status(500).json({ success: false, message: err.message || "Internal server error" });
};


/*
    app.use(notFound);    
    app.use(errorHandler);

Question: if notFound called next(), will it call errorHandler ? 
    Yes — if notFound calls next(err) with an error object, 
    Express skips all regular middleware and jumps straight to the next 4-parameter error handler, 
    which is errorHandler. Calling next() without an argument would go to the next regular middleware. 
    Since notFound is a dead end (unmatched route), you don't need to call next() at all — just respond with 404.
*/

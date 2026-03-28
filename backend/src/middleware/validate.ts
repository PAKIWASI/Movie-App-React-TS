import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validate = (schema: ZodType) =>
    (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.issues.map(issue => ({
                field: issue.path.join("."),
                message: issue.message,
            }));
            res.status(400).json({ success: false, errors });
            return;
        }

        // Replace req.body with the parsed (and stripped) data
        req.body = result.data;
        next();
    };

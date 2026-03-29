import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";


// We do zod validation here


// factory function that returns a middleware function.
// validate itself is not a middleware, because it doesn’t have (req, res, next) yet.
// but it returs a middleware function, and middleware has access to schema via closure

                            // single validate func works with any zod schema
export const validate = (schema: ZodType) =>
    (req: Request, res: Response, next: NextFunction) => {

        // use safeParse to get back a plain result object containing either the successfully parsed data or a ZodError
        const result = schema.safeParse(req.body);
        // safe parse alse strips id or _id as we dont' have in the schema (like user)
        // else, we can exprelitly remove the id, like in movie update schema

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


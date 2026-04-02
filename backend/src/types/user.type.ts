import { z } from "zod";


// zod schema (used for input/output validation)
export const UserSchema = z.object({
    name:       z.string().trim().min(2).max(100),
    age:        z.number().int().min(0).max(150),
    email:      z.email().trim().toLowerCase(),      // TODO: do i need trim, lowecase on this ?
    password:   z.string().min(8).max(128),
});

export const PublicUserSchema = UserSchema.omit({
    password: true,
});

export const LoginSchema = UserSchema.pick({
    email: true,
    password: true,
});


// email, password is not changalbe
export const UpdateUserSchema = UserSchema
    .omit({ email: true, password: true })   // don't let password update
    .partial()                 // every other field optional
    .refine(    // dont let empty object through
        data => Object.values(data).some(v => v !== undefined),
        { message: "At least one field must be provided" }
    );

export const ChangePasswordSchema = UserSchema
    .pick({ password: true });


export type User                 = z.infer<typeof UserSchema>;
export type PublicUser           = z.infer<typeof PublicUserSchema>;
export type LoginInput           = z.infer<typeof LoginSchema>;
export type UpdateUserInput      = z.infer<typeof UpdateUserSchema>;
export type ChangePasswordSchema = z.infer<typeof ChangePasswordSchema>;



import { z } from "zod";


// zod schema (used for input/output validation)
export const UserSchema = z.object({
    name:       z.string().min(2),
    age:        z.number().int().min(0).max(150),
    email:      z.email(),
    password:   z.string().min(8),
});

export const PublicUserSchema = UserSchema.omit({
    password: true,
});

export const LoginSchema = UserSchema.pick({
    email: true,
    password: true,
});

// TODO: shold we emit _id ??

export const UpdateUserSchema = UserSchema
    .omit({ password: true })   // don't let password update
    .partial();                 // every other field optional


export type User = z.infer<typeof UserSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

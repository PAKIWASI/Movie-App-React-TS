import { z } from "zod";

export const UserSchema = z.object({
    name: z.string().min(2),
    age: z.number().int().min(0).max(150),
    email: z.email(),
    password: z.string().min(8),
});

export const PublicUserSchema = UserSchema.omit({
    password: true,
});

export const LoginSchema = UserSchema.pick({
    email: true,
    password: true,
});

export const UpdateUserSchema = UserSchema
    .omit({ password: true })
    .partial();

export type User = z.infer<typeof UserSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

import { z } from "zod";


export const UserSchema = z.object({
  name:     z.string().min(2, "Name must be at least 2 characters"),
  age:      z.number().int().min(0).max(150),
  email:    z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// This replaces the old `interface User { ... }`
export type User = z.infer<typeof UserSchema>;

// Partial schemas for specific routes
export const LoginSchema = UserSchema.pick({ email: true, password: true });
export const UpdateUserSchema = UserSchema.partial(); // all fields optional

export type LoginInput      = z.infer<typeof LoginSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
// z.infer<> extracts the TypeScript type from the schema — you never write a separate interface again.


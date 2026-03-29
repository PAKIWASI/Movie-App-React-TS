import { z } from "zod";


// zod schema (used for input/output validation)
export const UserSchema = z.object({
    name:       z.string().min(2),
    age:        z.number().int().min(0).max(150),
    email:      z.email(),
    password:   z.string().min(8),
    movies:     z.array(z.object({ 
        tmdbid: z.number(), 
        watched: z.boolean(),
        userRating: z.number(), 
        userReview: z.string(),
    })),    // general movie storage
    favMovies:  z.array(z.number()),    // tmdbid's from user's movies
    watchlist:  z.array(z.number()),
});

export const PublicUserSchema = UserSchema.omit({
    password: true,
});

export const LoginSchema = UserSchema.pick({
    email: true,
    password: true,
});

export const UpdateUserSchema = UserSchema
    .omit({ password: true })   // don't let password update
    .partial();                 // every other field optional


export type User = z.infer<typeof UserSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

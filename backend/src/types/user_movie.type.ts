import mongoose from "mongoose";
import z from "zod"



export const UserMovieSchema = z.object({
    userId:      z.string().refine(val => mongoose.Types.ObjectId.isValid(val), "Invalid ObjectId"),
    tmdbId:      z.number(),     // ref to movie
    inFavs:      z.boolean().default(false),
    inWatchlist: z.boolean().default(false),
    watched:     z.boolean().default(false),
    userRating:  z.number().min(0).max(10).default(0),
    userReview:  z.string().default(""),
});




export type UserMovie = z.infer<typeof UserMovieSchema>;

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


export const PostUserMovieSchema = UserMovieSchema
    .omit({ userId: true })     // omit userId
    .partial()                  // make everything partial
    .required({ tmdbId: true });// make tmdbId required


export const UpdateUserMovieSchema = UserMovieSchema
    .omit({ userId: true, tmdbId: true })
    .partial()
    .refine(    // dont let empty object through
        data => Object.values(data).some(v => v !== undefined),
        { message: "At least one field must be provided" }
    );

export const SetRatingSchema = UserMovieSchema.pick({ userRating: true });
export const SetReviewSchema = UserMovieSchema.pick({ userReview: true });


export type UserMovie       = z.infer<typeof UserMovieSchema>;
export type PostUserMovie   = z.infer<typeof PostUserMovieSchema>;
export type UpdateUserMovie = z.infer<typeof UpdateUserMovieSchema>;
export type SetRating       = z.infer<typeof SetRatingSchema>;
export type SetReview       = z.infer<typeof SetReviewSchema>;


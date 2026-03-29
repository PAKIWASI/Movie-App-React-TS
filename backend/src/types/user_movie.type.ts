import z from "zod"



export const UserMovie = z.object({
    userId:         z.object(),     // ref to user
    tmdbId:         z.number(),     // ref to movie
    inFavs:         z.boolean(),
    inWatchlist:    z.boolean(),
    watched:        z.boolean(),
    userRating:     z.number(),     // 0-10
    userReview:     z.string(),
});

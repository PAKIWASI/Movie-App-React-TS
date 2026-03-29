import mongoose, { Schema, Document } from "mongoose";
import { UserMovie } from "../types/user_movie.type";

interface IUserMovie extends Omit<UserMovie, "userId">, Document {
    userId: mongoose.Types.ObjectId;  // stored as ObjectId, validated as string on input
}

const userMovieSchema: Schema = new Schema(
    {
        userId:      { type: Schema.Types.ObjectId, ref: "User",  required: true },
        tmdbId:      { type: Number,                ref: "Movie", required: true },
        inFavs:      { type: Boolean, default: false },
        inWatchlist: { type: Boolean, default: false },
        watched:     { type: Boolean, default: false },
        userRating:  { type: Number,  default: 0, min: 0, max: 10 },
        userReview:  { type: String,  default: "" },
    },
    { timestamps: true }
);

// composite unique key — one record per (user, movie) pair
userMovieSchema.index({ userId: 1, tmdbId: 1 }, { unique: true });

export default mongoose.model<IUserMovie>("UserMovie", userMovieSchema);


/* Remember Database course:
    userID and tmdbID uniquely identify each UserMovie Doc
    it is a composite key
*/

import mongoose, { Schema, Document } from "mongoose";
import { UserMovie } from "../types/user_movie.type";


/*
    UserMovie (from Zod) says userId is a string — because that's what comes in from the request and what Zod validates.
    But MongoDB stores it as an ObjectId, which is a different type
    This is a common pattern any time your input type and your storage type disagree on a field: 
*/
                            // Takes the UserMovie type and removes the userId field entirely
interface IUserMovie extends Omit<UserMovie, "userId">, Document {
    // Merges that cut-down type with Mongoose's Document type (which adds .save(), .populate(), _id, etc.)
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
// collection: usermovies


/* Remember Database course:
    userID and tmdbID uniquely identify each UserMovie Doc
    it is a composite key
*/

import mongoose, { Schema, Document, Model } from "mongoose";
import { MovieDetail, TMDB_MOVIE_AGG_PROJECTION, TMDBmovie } from "../types/movie.type";



export interface IMovie extends MovieDetail, Document {}


const movieSchema: Schema = new Schema(
    {
        adult:             { type: Boolean, required: true },
        backdrop_path:     { type: String,  required: true },
        belongs_to_collection: {
            id:            Number,
            name:          String,
            poster_path:   String,
            backdrop_path: String,
        },                                                      // nullable, no required
        budget:            { type: Number,   required: true },
        genres:            [{ id: Number, name: String }],
        homepage:          { type: String },
        id:                { type: Number,   required: true, unique: true },
        imdb_id:           { type: String,   required: true },
        origin_country:    { type: [String], required: true },
        original_language: { type: String,   required: true },
        original_title:    { type: String,   required: true },
        overview:          { type: String,   required: true },
        popularity:        { type: Number,   required: true },
        poster_path:       { type: String,   required: true },
        production_companies: [{
            id:             Number,
            logo_path:      String,     // nullable, no required
            name:           String,
            origin_country: String,
        }],
        production_countries: [{ iso_3166_1: String, name: String }],
        release_date:      { type: String,  required: true },
        revenue:           { type: Number,  required: true },
        runtime:           { type: Number,  required: true },
        spoken_languages:  [{ english_name: String, iso_639_1: String, name: String }],
        status:            { type: String,  required: true },
        tagline:           { type: String },
        title:             { type: String,  required: true },
        video:             { type: Boolean, required: true },
        vote_average:      { type: Number,  required: true },
        vote_count:        { type: Number,  required: true },
    },
    {
        timestamps: false,
        _id: false,         // disable mongodb _id, use TMDB id instead
        id: false,          // disable mongoose's virtual .id getter (would conflict with our id field)
    }
);

// Static method on Movie model

movieSchema.statics.findSummaries = async function(filter: object, skip: number, limit: number) {
    return this.aggregate([
        { $match: filter },
        { $skip: skip },
        { $limit: limit },
        { $project: TMDB_MOVIE_AGG_PROJECTION },
    ]);
};


// movieSchema.index({ id: 1 });  // id has unique so it's already indexed
movieSchema.index({ title: "text", original_title: "text" });  // full-text search
movieSchema.index({ popularity: -1 });                         // sort by popularity
movieSchema.index({ vote_average: -1 });                       // sort by rating

// export default mongoose.model<IMovie>("Movie", movieSchema);
// collection will be called movies

interface IMovieModel extends Model<IMovie> {
    findSummaries(filter: object, skip: number, limit: number): Promise<TMDBmovie[]>;
}

export default mongoose.model<IMovie, IMovieModel>("Movie", movieSchema);

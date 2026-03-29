import mongoose, { Schema, Document } from "mongoose";
import { MovieDetail } from "../types/movie.type";



export interface IMovie extends MovieDetail, Document {}


const movieSchema: Schema = new Schema(
    {
        adult:             { type: Boolean, required: true },
        backdrop_path:     { type: String,  required: true },
        belongs_to_collection: {
            _id:           false,
            id:            Number,
            name:          String,
            poster_path:   String,
            backdrop_path: String,
        },                                                      // nullable, no required
        budget:            { _id: false, type: Number,   required: true },
        genres:            [{ _id: false, id: Number, name: String }],
        homepage:          { type: String },
        id:                { type: Number,   required: true, unique: true },
        imdb_id:           { type: String, },
        origin_country:    { type: [String], required: true },
        original_language: { type: String,   required: true },
        original_title:    { type: String,   required: true },
        overview:          { type: String,   required: true },
        popularity:        { type: Number,   required: true },
        poster_path:       { type: String,   required: true },
        production_companies: [{
            _id:            false,
            id:             Number,
            logo_path:      String,     // nullable, no required
            name:           String,
            origin_country: String,
        }],
        production_countries: [{ _id: false, iso_3166_1: String, name: String }],
        release_date:      { type: String,  required: true },
        revenue:           { type: Number,  required: true },
        runtime:           { type: Number,  required: true },
        spoken_languages:  [{ 
            _id:            false, 
            english_name:   String, 
            iso_639_1:      String, 
            name:           String 
        }],
        status:            { type: String,  required: true },
        tagline:           { type: String },
        title:             { type: String,  required: true },
        video:             { type: Boolean, required: true },
        vote_average:      { type: Number,  required: true },
        vote_count:        { type: Number,  required: true },
    },
    {
        timestamps: false,
        _id: false,         // disable mongodb's implicit id
        id: false,          // disable mongoose's virtual .id getter (would conflict with our id field)
    }
);

// movieSchema.index({ id: 1 });  // id has unique so it's already indexed
movieSchema.index({ title: "text", original_title: "text" });  // full-text search
movieSchema.index({ popularity: -1 });                         // sort by popularity
movieSchema.index({ vote_average: -1 });                       // sort by rating

export default mongoose.model<IMovie>("Movie", movieSchema);
// collection will be called movies



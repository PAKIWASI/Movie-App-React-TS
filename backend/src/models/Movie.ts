import mongoose, { Schema, Document } from "mongoose";
import { MovieDetail } from "../types/movie.type";


// base interface
export interface IMovie extends MovieDetail, Document {}


// Static-method interface

interface IMovieModel extends mongoose.Model<IMovie> {

    findByTmdbId(tmdbId: number): ReturnType<mongoose.Model<IMovie>["findOne"]>;

    search(
        name: string | undefined,
        skip: number,
        limit: number,
        projection?: Record<string, 0 | 1>
    ): Promise<{ movies: IMovie[]; total: number }>;
}

// Schema 

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
        },
        budget:            { type: Number,   required: true },
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
            logo_path:      String,
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
        id: false,  // disable mongoose's virtual .id getter (conflicts with our id field)
    }
);

movieSchema.index({ title: "text" });
movieSchema.index({ popularity: -1 });
movieSchema.index({ vote_average: -1 });


// Static methods 

/**
 * Find a single movie by TMDB id.
 * Usage: await MovieModel.findByTmdbId(123)
 */
movieSchema.statics.findByTmdbId = function (tmdbId: number) {
    return this.findOne({ id: tmdbId });
};

/**
 * Full-text + pagination search.
 * Pass name=undefined to get all movies (no text filter).
 * Usage: const { movies, total } = await MovieModel.search(name, skip, limit, TMDB_MOVIE_PROJECTION)
 */
movieSchema.statics.search = async function (
    name: string | undefined,
    skip: number,
    limit: number,
    projection: Record<string, 0 | 1> = {}
): Promise<{ movies: IMovie[]; total: number }> {
    const filter = name ? { $text: { $search: name } } : {};

    const [movies, total] = await Promise.all([
        this.find(filter).skip(skip).limit(limit).select(projection),
        this.countDocuments(filter),
    ]);

    return { movies, total };
};


export default mongoose.model<IMovie, IMovieModel>("Movie", movieSchema);
// collection called movies

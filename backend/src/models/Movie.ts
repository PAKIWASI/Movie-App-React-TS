import { Schema, model, Document } from "mongoose";

// Sub-schemas
const GenreSchema = new Schema({ id: Number, name: String }, { _id: false });

const ProductionCompanySchema = new Schema(
    { id: Number, name: String, logo_path: String },
    { _id: false }
);

const SpokenLanguageSchema = new Schema(
    { english_name: String, name: String },
    { _id: false }
);

const CastMemberSchema = new Schema(
    {
        id: Number,
        name: String,
        character: String,
        profile_path: { type: String, default: null },
        order: Number,
    },
    { _id: false }
);

const CrewMemberSchema = new Schema(
    {
        id: Number,
        name: String,
        job: String,
        department: String,
        profile_path: { type: String, default: null },
    },
    { _id: false }
);

// Main document interface
export interface IMovie extends Document {
    // Base TMDBmovie fields
    tmdbId: number;
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    release_date: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
    // MovieDetails extended fields
    budget?: number;
    homepage?: string;
    runtime?: number;
    revenue?: number;
    tagline?: string;
    genres?: { id: number; name: string }[];
    production_companies?: { id: number; name: string; logo_path: string }[];
    spoken_languages?: { english_name: string; name: string }[];
    status?: string;
    // Credits
    cast?: {
        id: number;
        name: string;
        character: string;
        profile_path: string | null;
        order: number;
    }[];
    crew?: {
        id: number;
        name: string;
        job: string;
        department: string;
        profile_path: string | null;
    }[];
    // Metadata
    savedAt: Date;
}

const MovieSchema = new Schema<IMovie>(
    {
        tmdbId: { type: Number, required: true, unique: true },
        adult: { type: Boolean, default: false },
        backdrop_path: { type: String, default: "" },
        genre_ids: [Number],
        original_language: { type: String, default: "en" },
        original_title: { type: String, required: true },
        overview: { type: String, default: "" },
        popularity: { type: Number, default: 0 },
        poster_path: { type: String, default: "" },
        release_date: { type: String, default: "" },
        title: { type: String, required: true },
        video: { type: Boolean, default: false },
        vote_average: { type: Number, default: 0 },
        vote_count: { type: Number, default: 0 },
        // Extended detail fields
        budget: Number,
        homepage: String,
        runtime: Number,
        revenue: Number,
        tagline: String,
        genres: [GenreSchema],
        production_companies: [ProductionCompanySchema],
        spoken_languages: [SpokenLanguageSchema],
        status: String,
        // Credits
        cast: [CastMemberSchema],
        crew: [CrewMemberSchema],
        // Track when it was saved
        savedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Index for fast search by title
MovieSchema.index({ title: "text", original_title: "text" });

export default model<IMovie>("Movie", MovieSchema);



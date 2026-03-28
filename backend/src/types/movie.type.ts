import { z } from "zod";


export const TMDBmovieSchema = z.object({
    adult:             z.boolean(),
    backdrop_path:     z.string(),
    genre_ids:         z.array(z.number()),
    id:                z.number(),
    original_language: z.string(),
    original_title:    z.string(),
    overview:          z.string(),
    popularity:        z.number(),
    poster_path:       z.string(),
    release_date:      z.string(),
    title:             z.string(),
    video:             z.boolean(),
    vote_average:      z.number(),
    vote_count:        z.number(),
});


export const MovieDetailsSchema = z.object({
    adult:             z.boolean(),
    backdrop_path:     z.string(),
    belongs_to_collection: z.object({
        id:            z.number(),
        name:          z.string(),
        poster_path:   z.string(),
        backdrop_path: z.string(),
    }).nullable(),
    budget:            z.number(),
    genres:            z.array(z.object({ id: z.number(), name: z.string() })),
    homepage:          z.string(),
    id:                z.number(),
    imdb_id:           z.string(),
    origin_country:    z.array(z.string()),
    original_language: z.string(),
    original_title:    z.string(),
    overview:          z.string(),
    popularity:        z.number(),
    poster_path:       z.string(),
    production_companies: z.array(z.object({
        id:             z.number(),
        logo_path:      z.string().nullable(),
        name:           z.string(),
        origin_country: z.string(),
    })),
    production_countries: z.array(z.object({
        iso_3166_1: z.string(),
        name:       z.string(),
    })),
    release_date:  z.string(),
    revenue:       z.number(),
    runtime:       z.number(),
    spoken_languages: z.array(z.object({
        english_name: z.string(),
        iso_639_1:    z.string(),
        name:         z.string(),
    })),
    status:       z.string(),
    tagline:      z.string(),
    title:        z.string(),
    video:        z.boolean(),
    vote_average: z.number(),
    vote_count:   z.number(),
});


export const CastMemberSchema = z.object({
    id:                   z.number(),
    name:                 z.string(),
    character:            z.string(),
    profile_path:         z.string().nullable(),
    order:                z.number(),
    gender:               z.number().optional(),
    known_for_department: z.string().optional(),
    popularity:           z.number().optional(),
    credit_id:            z.string().optional(),
});

export const CrewMemberSchema = z.object({
    id:                   z.number(),
    name:                 z.string(),
    job:                  z.string(),
    department:           z.string(),
    profile_path:         z.string().nullable(),
    gender:               z.number().optional(),
    known_for_department: z.string().optional(),
    popularity:           z.number().optional(),
    credit_id:            z.string().optional(),
});

export const MovieCreditsSchema = z.object({
    cast: z.array(CastMemberSchema),
    crew: z.array(CrewMemberSchema),
});


export const TMDBresponseSchema = z.object({
    page:          z.number(),
    results:       z.array(TMDBmovieSchema),
    total_pages:   z.number(),
    total_results: z.number(),
});


export const CompleteMovieDetailSchema = z.object({
    movieDetail:  MovieDetailsSchema.nullable(),
    movieCredits: MovieCreditsSchema.nullable(),
});


export type TMDBmovie         = z.infer<typeof TMDBmovieSchema>;
export type MovieDetails      = z.infer<typeof MovieDetailsSchema>;
export type CastMember        = z.infer<typeof CastMemberSchema>;
export type CrewMember        = z.infer<typeof CrewMemberSchema>;
export type MovieCredits      = z.infer<typeof MovieCreditsSchema>;
export type TMDBresponse      = z.infer<typeof TMDBresponseSchema>;
export type CompleteMovieDetail = z.infer<typeof CompleteMovieDetailSchema>;


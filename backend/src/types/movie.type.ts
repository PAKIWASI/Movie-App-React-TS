import { z } from "zod";


export const TMDBmovieSchema = z.object({
    adult:             z.boolean(),
    backdrop_path:     z.string(),
    genres:            z.array(z.object({ id: z.number(), name: z.string() })),
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


// the response from /api/popular movies (no details)
export const TMDBresponseSchema = z.object({
    page:          z.number(),
    results:       z.array(TMDBmovieSchema),
    total_pages:   z.number(),
    total_results: z.number(),
});


// to get only the fields in TMDBmovie from MovieDetail in /api/movies/:movieid
export const TMDB_MOVIE_PROJECTION = Object.fromEntries(
    Object.keys(TMDBmovieSchema.shape).map(key => [key, 1])
) as Record<keyof TMDBmovie, 1>;

(TMDB_MOVIE_PROJECTION as any)._id = 0; // we dont' _id as well



// /api/movies/:id
export const MovieDetailsSchema = z.object({
    adult:             z.boolean(),
    backdrop_path:     z.string(),
    belongs_to_collection: z.object({
        id:            z.number(),
        name:          z.string(),
        poster_path:   z.string(),
        backdrop_path: z.string(),
    }).nullable().optional(),
    budget:            z.number(),
    genres:            z.array(z.object({ id: z.number(), name: z.string() })),
    homepage:          z.string().nullable().optional(),
    id:                z.number(),
    imdb_id:           z.string().nullable().optional(),
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
    tagline:      z.string().nullable().optional(),
    title:        z.string(),
    video:        z.boolean(),
    vote_average: z.number(),
    vote_count:   z.number(),
});


// /api/movies/:id/credits
export const MovieCreditsSchema = z.object({
    id: z.number(),
    cast: z.array(z.object({
        id:                   z.number(),
        name:                 z.string(),
        character:            z.string(),
        profile_path:         z.string().nullable(),
        order:                z.number(),
        gender:               z.number().optional(),
        known_for_department: z.string().optional(),
        popularity:           z.number().optional(),
        credit_id:            z.string().optional(),
    })),
    crew: z.array(z.object({
        id:                   z.number(),
        name:                 z.string(),
        job:                  z.string(),
        department:           z.string(),
        profile_path:         z.string().nullable(),    // type: string | null      — field MUST be present, but can be null
        gender:               z.number().optional(),    // type: string | undefined  — field can be absent entirely
        known_for_department: z.string().optional(),    
        popularity:           z.number().optional(),
        credit_id:            z.string().optional(),
    })),
});


export const UpdateMovieSchema = MovieDetailsSchema
    .omit({ id: true })
    .partial();


export type TMDBmovie    = z.infer<typeof TMDBmovieSchema>;
export type TMDBresponse = z.infer<typeof TMDBresponseSchema>;
export type MovieDetail  = z.infer<typeof MovieDetailsSchema>;
export type MovieCredit  = z.infer<typeof MovieCreditsSchema>;
export type UpdateMovie  = z.infer<typeof UpdateMovieSchema>; 


// Base movie type from search/list endpoints
export interface TMDBmovie {
    adult: boolean;
    backdrop_path: string;
    genre_ids: number[];
    id: number;
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
}

// Detailed movie from /movie/{id} endpoint
export interface MovieDetails {
    adult: boolean;
    backdrop_path: string;
    belongs_to_collection: {
        id: number;
        name: string;
        poster_path: string;
        backdrop_path: string;
    } | null;
    budget: number;
    genres: Array<{
        id: number;
        name: string;
    }>;
    homepage: string;
    id: number;
    imdb_id: string;
    origin_country: string[];
    original_language: string;
    original_title: string;
    overview: string;
    popularity: number;
    poster_path: string;
    production_companies: Array<{
        id: number;
        logo_path: string | null;
        name: string;
        origin_country: string;
    }>;
    production_countries: Array<{
        iso_3166_1: string;
        name: string;
    }>;
    release_date: string;
    revenue: number;
    runtime: number;
    spoken_languages: Array<{
        english_name: string;
        iso_639_1: string;
        name: string;
    }>;
    status: string;
    tagline: string;
    title: string;
    video: boolean;
    vote_average: number;
    vote_count: number;
}

// Complete cast member
export interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
    gender?: number;
    known_for_department?: string;
    popularity?: number;
    credit_id?: string;
}

// Complete crew member
export interface CrewMember {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
    gender?: number;
    known_for_department?: string;
    popularity?: number;
    credit_id?: string;
}

export interface MovieCredits {
    cast: CastMember[];
    crew: CrewMember[];
}

// Response type from search/popular endpoints
export interface TMDBresponse {
    page: number;
    results: TMDBmovie[];
    total_pages: number;
    total_results: number;
}

// for global movie context
export interface MovieContextType {
    fav: TMDBmovie[];
    addFav: (movie: TMDBmovie) => void;
    removeFav: (movieid: number) => void;
    isFav: (movieid: number) => boolean;
    save: TMDBmovie[];
    addSave: (movie: TMDBmovie) => void;
    removeSave: (movieid: number) => void;
    isSave: (movieid: number) => boolean;
}

// For complete movie details
export interface CompleteMovieDetail {
    movieDetail: MovieDetails | null;
    movieCredits: MovieCredits | null;
}

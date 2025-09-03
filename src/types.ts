
export interface TMDBmovie {
    adult: boolean,
    backdrop_path: string,
    genre_ids: number[],
    id: number
    original_language: string,
    original_title: string,
    overview: string,
    popularity: number,
    poster_path: string,
    release_date: string,
    title: string,
    video: boolean,
    vote_average: number,
    vote_count: number,
};

export interface TMDBresponse {
    page: number,
    results: TMDBmovie[],
    total_pages: number,
    total_results: number,
};

// Define the context type
export interface MovieContextType  {
    fav: TMDBmovie[];
    addFav: (movie: TMDBmovie) => void;
    removeFav: (movieid: number) => void;
    isFav: (movieid: number) => boolean;
    save: TMDBmovie[];
    addSave: (movie: TMDBmovie) => void;
    removeSave: (movieid: number) => void;
    isSave: (movieid: number) => boolean;
};


// Extended interface for detailed movie info
export interface MovieDetails extends TMDBmovie {
    budget?: number;
    homepage?: string;
    runtime?: number;
    revenue?: number;
    tagline?: string;
    genres?: { id: number; name: string }[];
    production_companies?: { id: number; name: string; logo_path: string }[];
    spoken_languages?: { english_name: string; name: string }[];
    status?: string;
};


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
};

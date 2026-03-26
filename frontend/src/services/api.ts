import type { CompleteMovieDetail, MovieCredits, MovieDetails, TMDBresponse } from "../types";




export const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
export const BASE_URL = "https://api.themoviedb.org/3"; //base endpoint of api (where we send request)


export const getPopularMovies = async (page: number = 1): Promise<TMDBresponse> => {

    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);     

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TMDBresponse = await response.json();
    return data;
};

export const searchMovies = async (query: string, page: number = 1): Promise<TMDBresponse> => {

    const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TMDBresponse = await response.json();
    return data;
};

export const getMovieDetail = async (id: string): Promise<CompleteMovieDetail> => {

    const movieResponse = await fetch(
        `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`
    );
    
    if (!movieResponse.ok) {
        throw new Error('Movie not found');
    }
    
    const movieData: MovieDetails = await movieResponse.json();
    
    // Fetch credits
    const creditsResponse = await fetch(
        `${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`
    );
    
    if (creditsResponse.ok) {
        const creditsData: MovieCredits = await creditsResponse.json();

        return {movieDetail:movieData, movieCredits:creditsData};
    }

    return {movieDetail:movieData, movieCredits:null};  // if creditsResponse is not ok
}



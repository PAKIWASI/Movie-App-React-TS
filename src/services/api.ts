import type { TMDBmovie, TMDBresponse } from "../types";




export const API_KEY = import.meta.env.VITE_TMDB_API_KEY;;
export const BASE_URL = "https://api.themoviedb.org/3"; //base endpoint of api (where we send request)


export const getPopularMovies = async (): Promise<TMDBmovie[]> => {
    const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`); // send network request     

     if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TMDBresponse = await response.json(); //await retuns resolved value, not promise
    return data.results;
};


export const searchMovies = async (query: string): Promise<TMDBmovie[]> => {
    const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);

     if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TMDBresponse = await response.json(); //await retuns resolved value, not promise
    return data.results;
};

import { createContext, useContext, useEffect, useState } from "react";
import type { TMDBmovie, MovieContextType } from "../types";

// state manager for fav movies


const MovieContext = createContext<MovieContextType | undefined>(undefined);

//custom hook
export const useMovieContext = () => {
    const context = useContext(MovieContext);
    if (context === undefined) {
        throw new Error('useMovieContext must be used within a MovieProvider');
    }
    return context; // This returns MovieContextType, not MovieContextType | undefined
};
// all children will have access to the state that is provided in this function
export const MovieProvider = ({children}: {children: React.ReactNode}) => 
{
// Initialize with a function to avoid localStorage being called on every render
    const [fav, setFav] = useState<TMDBmovie[]>(() => {
        try {
            const storedFavs = localStorage.getItem("fav");
            return storedFavs ? JSON.parse(storedFavs) : [];
        } catch (error) {
            console.error("Failed to load favorites from localStorage:", error);
            return [];
        }
    });

    // Only save to localStorage when fav changes (not on initial load)
    useEffect(() => {
        try {
            localStorage.setItem('fav', JSON.stringify(fav));
        } catch (error) {
            console.error("Failed to save favorites to localStorage:", error);
        }
    }, [fav]);

    const addFav = (movie:TMDBmovie) => {
        setFav(f => [...f, movie]);
    }

    const removeFav = (movieid: number) => {
        setFav(f => f.filter(movie => movie.id  !== movieid));
    }

    const isFav = (movieid: number) => {
        return fav.some(movie => movie.id === movieid);
    }

    const value: MovieContextType = {
        fav,
        addFav,
        removeFav,
        isFav,
    };

    return (
        <MovieContext.Provider value={value}>
            {children}  
        </MovieContext.Provider>
    );
}; // children have access to everything in value

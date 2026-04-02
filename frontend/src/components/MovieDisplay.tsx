import MovieCard from "./MovieCard";
import type { MovieDisplayProp } from "../types/PropTypes";


function MovieDisplay({ movies }: MovieDisplayProp) 
{
    if (movies.length === 0) {
        return (
            <p className="text-center text-(--c-muted-foreground) text-sm py-12">
                No movies found.
            </p>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
            ))}
        </div>
    );
}

export default MovieDisplay;

import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import MovieDisplay from "../components/MovieDisplay";
import type { TMDBmovie } from "../types/Movie";
import { getPopularMovies, searchMovies } from "../services/movieAPI";


function Home() 
{
    const [searchQuery, setSearchQuery]   = useState("");
    const [movies, setMovies]             = useState<TMDBmovie[]>([]);
    const [movieLoading, setMovieLoading] = useState(false);
    const [page, setPage]                 = useState(1);
    const [isSearching, setIsSearching]   = useState(false);

    // Load popular movies on mount
    useEffect(() => {
        const fetchPopular = async () => {
            try {
                setMovieLoading(true);
                const res = await getPopularMovies(page);
                if (res.success) setMovies(res.data);
            } catch (err) {
                console.error("fetchPopular error:", err);
                setMovies([]);
            } finally {
                setMovieLoading(false);
            }
        };
        if (!isSearching) fetchPopular();
    }, [page, isSearching]);

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            // empty search — go back to popular
            setIsSearching(false);
            setPage(1);
            return;
        }
        try {
            setMovieLoading(true);
            setIsSearching(true);
            const res = await searchMovies(searchQuery, 1);
            if (res.success) setMovies(res.data);
        } catch (err) {
            console.error("handleSearch error:", err);
            setMovies([]);
        } finally {
            setMovieLoading(false);
        }
    };

    // TODO: if user was at a particular page and searched then goes back,
    // how to go back to the previous page ?

    return (
        <div className="flex flex-col gap-6">
            <SearchBar
                search={searchQuery}
                onSearchChange={setSearchQuery}
                onSubmit={handleSearch}
            />

            {movieLoading ? (
                <p className="text-center text-(--c-muted-foreground) text-sm">Loading...</p>
            ) : (
                <MovieDisplay movies={movies} />
            )}
        </div>
    );
}

export default Home;

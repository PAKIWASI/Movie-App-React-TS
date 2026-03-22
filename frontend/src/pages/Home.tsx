import { useEffect, useState, useRef } from "react";
import MovieCard from "../Components/MovieCard";
import styles from "./Home.module.css"
import type { TMDBmovie } from "../types.ts"
import { getPopularMovies, searchMovies } from "../services/api";
import { useNavigate } from "react-router-dom";
import SearchSuggestion from "../Components/SearchSuggestion.tsx";



function Home({isSearching}: {isSearching: boolean}) // entire UI for the homepage 
{ 
    const [searchQuery, setSearchQuery] = useState("");
    const [movies, setMovies] = useState<TMDBmovie[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [lastSearchQuery, setLastSearchQuery] = useState("");

    const [suggestions, setSuggestions] = useState<TMDBmovie[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchFormRef = useRef<HTMLDivElement>(null);

    const navigation = useNavigate();

    useEffect(() => {
        const loadPopularMovies = async () => {
            try {
                const response = await getPopularMovies(1); // get first page
                setMovies(response.results);
                setTotalPages(response.total_pages);
                setCurrentPage(1);
                setLastSearchQuery("");
            }
            catch (err) {
                console.log(err);
                setError("Failed to load movies..."); 
            }
            finally {
                setLoading(false);// finish loading
            }
        };

         // If we're not searching (i.e., we're on the home page), load popular movies
        if (!isSearching && lastSearchQuery) {
            loadPopularMovies();
        } else if (!isSearching && movies.length === 0) {
            // Initial load or when coming back to home
            loadPopularMovies();
        }

        loadPopularMovies();
    }, [isSearching]); // on mount

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchFormRef.current && !searchFormRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Update the suggestions effect
    useEffect(() => {
        if (searchQuery.trim().length === 0) {
            setShowSuggestions(false);
            return;
        }

        const loadSuggestions = async() => {
            setShowSuggestions(true);
            const searchResult = await searchMovies(searchQuery, 1);
            setSuggestions(searchResult.results.slice(0, 5)); // Limit to 5 suggestions
        }

        loadSuggestions();
    }, [searchQuery])

    const handleSuggestionClick = (movie: TMDBmovie) => {
        setSearchQuery(movie.title);
        setShowSuggestions(false);
        navigation(`/movie/${movie.id}`);
    };    


    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        if (loading) return;

        setShowSuggestions(false);
        
        navigation("/search");
        setLoading(true);
        try {
            const searchResult = await searchMovies(searchQuery, 1); 
            setMovies(searchResult.results); 
            setTotalPages(searchResult.total_pages);
            setCurrentPage(1);
            setLastSearchQuery(searchQuery);
            setError(null);
        }
        catch (err) {
            console.log(err);
            setError("Failed to search movies...");
        }
        finally {
            setLoading(false);
        }
    };


    const loadMoreMovies = async () => {
        if (isLoadingMore || currentPage >= totalPages) return;
        
        setIsLoadingMore(true);
        try {
            const nextPage = currentPage + 1;
            const response = lastSearchQuery       // if "" then popular movies on home page 
                ? await searchMovies(lastSearchQuery, nextPage)
                : await getPopularMovies(nextPage);
            
            setMovies(prev => [...prev, ...response.results]);
            setCurrentPage(nextPage);
        } catch (err) {
            console.log(err);
            setError("Failed to load more movies...");
        } finally {
            setIsLoadingMore(false);
        }
    };
        
    return (
        <div className={styles.home}>
            <div ref={searchFormRef} style={{position: 'relative'}}>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <input 
                        className={styles.searchInput} 
                        type="text" 
                        placeholder="Search for movies"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery.trim().length > 0 && setShowSuggestions(true)}
                    />
                    <button className={styles.searchBtn} type="submit">Search</button>
                </form>
                
                {showSuggestions && suggestions.length > 0 && (
                    <SearchSuggestion 
                        movies={suggestions} 
                        onSuggestionClick={handleSuggestionClick}
                    />
                )}
            </div>
            {error && <div className="errmsg">{error}</div>}

            {loading ? <div className="loading">Loading...</div> : 
            <>
                <div className={styles.moviesGrid}> 
                    {movies.map(movie => <MovieCard key={movie.id} movie={movie}/>)}
                </div>
    
                {currentPage < totalPages && (
                    <div className={styles.loadMoreContainer}>
                        <button 
                            onClick={loadMoreMovies}
                            disabled={isLoadingMore}
                            className={styles.loadMoreBtn}
                        >
                            {isLoadingMore ? "Loading..." : `Load More Movies (${currentPage}/${totalPages})`}
                        </button>
                    </div>
                )}
            </>
            }
        </div>
    );
};
export default Home;


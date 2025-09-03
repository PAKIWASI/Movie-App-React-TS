import { useEffect, useState } from "react";
import MovieCard from "../Components/MovieCard";
import styles from "./Home.module.css"
import type { TMDBmovie } from "../types.ts"
import { getPopularMovies, searchMovies } from "../services/api";
import { useNavigate } from "react-router-dom";



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

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        if (loading) return;
        
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
        
    // for dynamic rendering, a unique key is needed
    return (
        <div className={styles.home}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
                <input 
                    className={styles.searchInput} 
                    type="text" 
                    placeholder="Seach for movies"
                    value={searchQuery}
                    onChange={e=>setSearchQuery(e.target.value)}
                />
                <button className={styles.searchBtn} type="submit">Search</button>
            </form>

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


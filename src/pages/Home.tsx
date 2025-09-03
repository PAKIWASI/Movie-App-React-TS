import { useEffect, useState } from "react";
import MovieCard from "../Components/MovieCard";
import styles from "./Home.module.css"
import type { TMDBmovie } from "../types.ts"
import { getPopularMovies, searchMovies } from "../services/api";



function Home() // entire UI for the homepage 
{ 
    const [searchQuery, setSearchQeury] = useState("");
    const [movies, setMovies] = useState<TMDBmovie[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPopularMovies = async () => {
            try {
                const popularMovies = await getPopularMovies(); 
                setMovies(popularMovies);
            }
            catch (err) {
                console.log(err);
                setError("Failed to load movies..."); 
            }
            finally {
                setLoading(false);
            }
        };

        loadPopularMovies();
    }, []); // on mount

    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        if (loading) return; // already loading
        setLoading(true);
        try {
            const searchResult = await searchMovies(searchQuery); 
            setMovies(searchResult); 
            setError(null);
        }
        catch (err) {
            console.log(err);
            setError("Failed to search movies...");
        }
        finally {
            setLoading(false);
        }
        setSearchQeury("");
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
                    onChange={e=>setSearchQeury(e.target.value)}
                />
                <button className={styles.searchBtn} type="submit">Search</button>
            </form>

            {error && <div className="errmsg">{error}</div>}

            {loading ? <div className="loading">Loading...</div> : 
            <div className={styles.moviesGrid}> 
                {movies.map(movie => <MovieCard key={movie.id} movie={movie}/>)}
            </div>
            }
        </div>
    );
};
export default Home;

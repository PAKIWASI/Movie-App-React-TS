import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMovieContext } from "../contexts/MovieContext";
import { API_KEY, BASE_URL } from "../services/api.ts";
import type { TMDBmovie } from "../types";
import styles from "./MovieDetail.module.css";

// Extended interface for detailed movie info
interface MovieDetails extends TMDBmovie {
    budget?: number;
    homepage?: string;
    runtime?: number;
    revenue?: number;
    tagline?: string;
    genres?: { id: number; name: string }[];
    production_companies?: { id: number; name: string; logo_path: string }[];
    spoken_languages?: { english_name: string; name: string }[];
    status?: string;
}

const MovieDetail = () => {

    const { id } = useParams<{ id: string }>(); // gets dynamic id from url (the one we made /:id)
    const navigate = useNavigate();
    const { addFav, removeFav, isFav } = useMovieContext();
    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            if (!id || !API_KEY) return;
            
            try {
                setLoading(true);
                const response = await fetch(
                    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`
                );
                
                if (!response.ok) {
                    throw new Error('Movie not found');
                }
                
                const movieData = await response.json();
                setMovie(movieData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch movie details');
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [id]);

    const handleFavoriteClick = () => {
        if (!movie) return;
        
        if (isFav(movie.id)) {
            removeFav(movie.id);
        } else {
            addFav(movie);
        }
    };

    const formatRuntime = (minutes?: number) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const formatMoney = (amount?: number) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading movie details...</p>
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className={styles.error}>
                <h2>Oops! Something went wrong</h2>
                <p>{error || 'Movie not found'}</p>
                <button onClick={() => navigate(-1)} className={styles.backButton}>
                    Go Back
                </button>
            </div>
        );
    }

    const favorite = isFav(movie.id);

    return (
        <div className={styles.movieDetails}>
            {/* Hero Section */}
            <div 
                className={styles.hero}
                style={{
                    backgroundImage: movie.backdrop_path 
                        ? `url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})`
                        : 'none'
                }}
            >
                <div className={styles.heroOverlay}>
                    <button 
                        onClick={() => navigate(-1)} 
                        className={styles.backButton}
                        aria-label="Go back"
                    >
                        ← Back
                    </button>
                    
                    <div className={styles.heroContent}>
                        <div className={styles.posterContainer}>
                            <img 
                                src={movie.poster_path 
                                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                    : '/placeholder-movie.png'
                                }
                                alt={movie.title}
                                className={styles.poster}
                            />
                        </div>
                        
                        <div className={styles.movieInfo}>
                            <h1 className={styles.title}>{movie.title}</h1>
                            {movie.tagline && (
                                <p className={styles.tagline}>"{movie.tagline}"</p>
                            )}
                            
                            <div className={styles.metadata}>
                                <span className={styles.year}>
                                    {movie.release_date?.split('-')[0]}
                                </span>
                                <span className={styles.runtime}>
                                    {formatRuntime(movie.runtime)}
                                </span>
                                <span className={styles.rating}>
                                    ⭐ {movie.vote_average?.toFixed(1)}/10
                                </span>
                            </div>
                            
                            {movie.genres && movie.genres.length > 0 && (
                                <div className={styles.genres}>
                                    {movie.genres.map(genre => (
                                        <span key={genre.id} className={styles.genre}>
                                            {genre.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                            
                            <p className={styles.overview}>{movie.overview}</p>
                            
                            <button 
                                onClick={handleFavoriteClick}
                                className={`${styles.favButton} ${favorite ? styles.favorited : ''}`}
                                aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
                            >
                                {favorite ? "❤️ Remove from Favorites" : "🤍 Add to Favorites"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Details Section */}
            <div className={styles.detailsSection}>
                <div className={styles.detailsGrid}>
                    <div className={styles.detailCard}>
                        <h3>Movie Details</h3>
                        <div className={styles.detailRow}>
                            <span>Status:</span>
                            <span>{movie.status || 'N/A'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span>Original Language:</span>
                            <span>{movie.original_language?.toUpperCase() || 'N/A'}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span>Budget:</span>
                            <span>{formatMoney(movie.budget)}</span>
                        </div>
                        <div className={styles.detailRow}>
                            <span>Revenue:</span>
                            <span>{formatMoney(movie.revenue)}</span>
                        </div>
                    </div>
                    
                    {movie.production_companies && movie.production_companies.length > 0 && (
                        <div className={styles.detailCard}>
                            <h3>Production Companies</h3>
                            <div className={styles.companies}>
                                {movie.production_companies.map(company => (
                                    <div key={company.id} className={styles.company}>
                                        {company.logo_path && (
                                            <img 
                                                src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                                                alt={company.name}
                                                className={styles.companyLogo}
                                            />
                                        )}
                                        <span>{company.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieDetail;

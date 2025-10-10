import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMovieContext } from "../contexts/MovieContext";
import { API_KEY, BASE_URL } from "../services/api.ts";
import type { MovieDetails, CastMember, CrewMember } from "../types";
import styles from "./MovieDetail.module.css";

interface MovieCredits {
    cast: CastMember[];
    crew: CrewMember[];
}

const MovieDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addFav, removeFav, isFav, addSave, removeSave, isSave } = useMovieContext();
    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [credits, setCredits] = useState<MovieCredits | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMovieData = async () => {
            if (!id || !API_KEY) return;
            
            try {
                setLoading(true);
                
                // Fetch movie details
                const movieResponse = await fetch(
                    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`
                );
                
                if (!movieResponse.ok) {
                    throw new Error('Movie not found');
                }
                
                const movieData = await movieResponse.json();
                setMovie(movieData);
                
                // Fetch credits
                const creditsResponse = await fetch(
                    `${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`
                );
                
                if (creditsResponse.ok) {
                    const creditsData = await creditsResponse.json();
                    setCredits(creditsData);
                }
                
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch movie details');
            } finally {
                setLoading(false);
            }
        };

        fetchMovieData();
    }, [id]);

    const handleFavoriteClick = () => {
        if (!movie) return;
        
        if (isFav(movie.id)) {
            removeFav(movie.id);
        } else {
            addFav(movie);
        }
    };

    const handleWatchlistClick = () => {
        if (!movie) return;
        
        if (isSave(movie.id)) {
            removeSave(movie.id);
        } else {
            addSave(movie);
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

    const getDirector = () => {
        if (!credits) return 'N/A';
        const director = credits.crew.find(person => person.job === 'Director');
        return director?.name || 'N/A';
    };

    const getTopCast = () => {
        if (!credits) return [];
        return credits.cast.slice(0, 6); // Top 6 cast members
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
    const saved = isSave(movie.id);
    const topCast = getTopCast();
    const director = getDirector();

    return (
        <div className={styles.movieDetails}>
            {/* Hero Section - unchanged */}
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
                           
                            <div className={styles.buttonContainer}>
                                <button 
                                    onClick={handleFavoriteClick}
                                    className={`${styles.favButton} ${favorite ? styles.favorited : ''}`}
                                    aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
                                >
                                    {favorite ? "❤️ Remove from Favorites" : "🤍 Add to Favorites"}
                                </button>
                                <button 
                                    onClick={handleWatchlistClick}
                                    className={`${styles.favButton} ${saved ? styles.saved : ''}`}
                                    aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
                                >
                                    {saved ? "📖 Remove from Watchlist" : "🔖 Add to Watchlist"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Updated Details Section with Cast & Crew */}
            <div className={styles.detailsSection}>
                <div className={styles.detailsGrid}>
                    <div className={styles.detailCard}>
                        <h3>Movie Details</h3>
                        <div className={styles.detailRow}>
                            <span>Director:</span>
                            <span>{director}</span>
                        </div>
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
                    
                    {/* Cast Section */}
                    {topCast.length > 0 && (
                        <div className={styles.detailCard}>
                            <h3>Top Cast</h3>
                            <div className={styles.castGrid}>
                                {topCast.map(actor => (
                                    <div key={actor.id} className={styles.castMember}>
                                        <img 
                                            src={actor.profile_path 
                                                ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                                                : '/placeholder-actor.png'
                                            }
                                            alt={actor.name}
                                            className={styles.actorPhoto}
                                        />
                                        <div className={styles.actorInfo}>
                                            <span className={styles.actorName}>{actor.name}</span>
                                            <span className={styles.actorCharacter}>{actor.character}</span>
                                        </div>
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

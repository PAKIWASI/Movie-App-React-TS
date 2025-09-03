import { useMovieContext } from "../contexts/MovieContext";
import { useNavigate } from "react-router-dom";
import type { TMDBmovie } from "../types";
import styles from "./MovieCard.module.css";

function MovieCard({movie}: {movie: TMDBmovie}) 
{
    const { addFav, removeFav, isFav } = useMovieContext();
    const navigate = useNavigate();
    const favorite = isFav(movie.id);

    const onFavClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent card click when clicking favorite button
        if (favorite) {
            removeFav(movie.id);
        } else {
            addFav(movie);
        }
    }

    const onCardClick = () => {
        navigate(`/movie/${movie.id}`);
    }

    return (
        <div className={styles.movieCard} onClick={onCardClick} style={{cursor: 'pointer'}}>
            <div className={styles.moviePoster}>
                <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}                     
                     alt={movie.title} 
                />
                <div className={styles.movieOverlay}>
                    <button 
                        className={styles.favBtn} 
                        onClick={onFavClick}
                        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
                    >
                        {favorite ? "❤️" : "🤍"}
                    </button>
                </div>
            </div>
            <div className={styles.movieInfo}>
                <h3>{movie.title}</h3>
                <p>{movie.release_date?.split("-")[0]}</p>
            </div>
        </div>
    );
};
export default MovieCard;


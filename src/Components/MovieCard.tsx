import { useMovieContext } from "../contexts/MovieContext";
import { useNavigate } from "react-router-dom";
import type { TMDBmovie } from "../types";
import styles from "./MovieCard.module.css";


const BookmarkIcon = ({ filled }: { filled: boolean }) => (
    <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill={filled ? "#00ff88" : "none"} 
        stroke="#00ff88" 
        strokeWidth="2"
    >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
    </svg>
);


function MovieCard({movie}: {movie: TMDBmovie}) 
{
    const { addFav, removeFav, isFav, 
            addSave, removeSave, isSave } = useMovieContext();
    const navigate = useNavigate();
    const favorite = isFav(movie.id);
    const saved = isSave(movie.id);

    const onFavClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent card click when clicking favorite button
        if (favorite) {
            removeFav(movie.id);
        } else {
            addFav(movie);
        }
    }

    const onSaveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (saved) {
            removeSave(movie.id);
        } else {
            addSave(movie);
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
                    <button
                        className={styles.favBtn}
                        onClick={onSaveClick}
                        aria-label={saved ? "Remove from watchlist" : "Add to watchlist"}
                    >
                        <BookmarkIcon filled={saved} />                    
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


import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../Components/MovieCard.tsx";
import styles from "./Favorites.module.css";

function Watchlist() {

    const { save } = useMovieContext();

    // Show empty state if no favorites
    if (save.length === 0) {
        return (
            <div className={styles.emptyFav}>
                <div className={styles.favoriteIcon}>💔</div>
                <h2>Watchlist is Empty</h2>
                <p>Add movies you want to watch here</p>
            </div> 
        );
    }

    // Show favorites grid when there are favorite movies
    return (
        <div>
            <div className={styles.favoritesHeader}>
                <h1>My Watchlist</h1>
                <p>Your collection of films you want to watch ({save.length} movie{save.length !== 1 ? 's' : ''})</p>
            </div>
            <div className={styles.favoritesGrid}>
                {save.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>
        </div>
    );
};
export default Watchlist;


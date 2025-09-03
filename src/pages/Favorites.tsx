import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../Components/MovieCard.tsx";
import styles from "./Favorites.module.css";

function Favorite() {

    const { fav } = useMovieContext();

    // Show empty state if no favorites
    if (fav.length === 0) {
        return (
            <div className={styles.emptyFav}>
                <div className={styles.favoriteIcon}>💔</div>
                <h2>No Favorite Movies Added</h2>
                <p>Start adding movies to your favorites to see them here!</p>
            </div> 
        );
    }

    // Show favorites grid when there are favorite movies
    return (
        <div>
            <div className={styles.favoritesHeader}>
                <h1>My Favorite Movies</h1>
                <p>Your personal collection of amazing films ({fav.length} movie{fav.length !== 1 ? 's' : ''})</p>
            </div>
            <div className={styles.favoritesGrid}>
                {fav.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>
        </div>
    );
}

export default Favorite;

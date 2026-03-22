import type { TMDBmovie } from "../types";
import styles from "./SuggestionEntry.module.css"



function SuggestionEntry({movie}: {movie: TMDBmovie}) 
{

    return (
        <div className={styles.SuggestionEntry}>
            <img className={styles.EntryPoster} 
                 src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                 alt={movie.title}
            />
            <div className={styles.content}>
                <h2 className={styles.title}>{movie.title}</h2>
                <p className={styles.date}>{movie.release_date?.split("-")[0]}</p>
            </div>
        </div>
    );
}
export default SuggestionEntry;

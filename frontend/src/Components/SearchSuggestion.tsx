import SuggestionEntry from "./SuggestionEntry";
import styles from "./SearchSuggestion.module.css"
import type { TMDBmovie } from "../types";



function SearchSuggestion({movies, onSuggestionClick}: {movies: TMDBmovie[], onSuggestionClick: (movie: TMDBmovie) => void}) 
{
    return (
        <div className={styles.SuggestionBox}>
            {movies.map(movie => (
                <div key={movie.id} onClick={() => onSuggestionClick(movie)}>
                    <SuggestionEntry movie={movie}/>
                </div>
            ))}
        </div>
    );
}
export default SearchSuggestion;

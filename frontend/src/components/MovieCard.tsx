import Button from "./ui/Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useCollection } from "../contexts/CollectionContext";
import type { MovieCardProp } from "../types/PropTypes";



const POSTER_BASE = "https://image.tmdb.org/t/p/w500";


function MovieCard({ movie }: MovieCardProp) 
{
    const { isLoggedIn }  = useUser();
    const { setAttribute, getEntry } = useCollection();
    const [busyFav, setBusyFav] = useState(false);
    const [busyWatchlist, setBusyWatchlist] = useState(false);
    const navigate = useNavigate();

    const year      = movie.release_date?.slice(0, 4) ?? "—";
    const posterUrl = movie.poster_path
        ? `${POSTER_BASE}${movie.poster_path}`
        : "/placeholder-poster.png";

    // Read current state from the collection cache
    const entry     = getEntry(movie.id);
    const isFav     = entry?.inFavs ?? false;
    const isInList  = entry?.inWatchlist ?? false;

    const handleFavAction = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (busyFav) return;
        try {
            setBusyFav(true);
            await setAttribute(movie.id, "inFavs");
        } catch (err) {
            console.error("fav action error:", err);
        } finally {
            setBusyFav(false);
        }
    };

    const handleWatchlistAction = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (busyWatchlist) return;
        try {
            setBusyWatchlist(true);
            await setAttribute(movie.id, "inWatchlist");
        } catch (err) {
            console.error("watchlist action error:", err);
        } finally {
            setBusyWatchlist(false);
        }
    };

    return (
        <div
            className="group relative flex flex-col rounded-xl overflow-hidden border border-(--c-border) bg-(--c-card) hover:border-(--c-primary) hover:shadow-(--card-hover-glow) transition-all duration-300 cursor-pointer"
            onClick={() => navigate(`/movie/${movie.id}`)}
        >
            {/* poster */}
            <div className="relative aspect-2/3 overflow-hidden">
                <img
                    src={posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* rating badge */}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md">
                    <svg className="w-3 h-3 fill-(--c-primary)" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-xs font-semibold text-white">{movie.vote_average.toFixed(1)}</span>
                </div>

                {/* fav / watchlist — hover overlay, logged in only */}
                {isLoggedIn && (
                    <div className="absolute bottom-2 left-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                        <Button
                            variant="ghost" size="sm"
                            className={`flex-1 backdrop-blur-sm border transition-colors
                                ${isFav
                                    ? "bg-black/80 text-(--c-primary) border-(--c-primary)/40"
                                    : "bg-black/60 text-white hover:text-(--c-primary) border-white/10"
                                }`}
                            disabled={busyFav}
                            onClick={handleFavAction}
                        >
                            {isFav ? "♥ Favourited" : "♥ Favourite"}
                        </Button>
                        <Button
                            variant="ghost" size="sm"
                            className={`flex-1 backdrop-blur-sm border transition-colors
                                ${isInList
                                    ? "bg-black/80 text-(--c-primary) border-(--c-primary)/40"
                                    : "bg-black/60 text-white hover:text-(--c-primary) border-white/10"
                                }`}
                            disabled={busyWatchlist}
                            onClick={handleWatchlistAction}
                        >
                            {isInList ? "✓ Watchlist" : "+ Watchlist"}
                        </Button>
                    </div>
                )}
            </div>

            {/* info */}
            <div className="flex flex-col gap-2 p-3">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-(--c-foreground) leading-tight line-clamp-1">
                        {movie.title}
                    </h3>
                    <span className="text-xs text-(--c-muted-foreground) shrink-0">{year}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                    {movie.genres.slice(0, 2).map(g => (
                        <span key={g.id} className="text-[11px] px-2 py-0.5 rounded-full bg-(--c-secondary) text-(--c-muted-foreground) border border-(--c-border)">
                            {g.name}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MovieCard;

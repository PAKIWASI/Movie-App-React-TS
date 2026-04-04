import { useNavigate } from "react-router-dom";
import type { CollectionPageProps } from "../types/PropTypes";
import { useCollection } from "../contexts/CollectionContext";


const POSTER_BASE = "https://image.tmdb.org/t/p/w500";



function CollectionPage({ filter, title }: CollectionPageProps) 
{
    const navigate = useNavigate();
    const { getFiltered, loading, removeEntry } = useCollection();

    const movies = getFiltered(filter);


    if (loading) {
        return (
            <div className="flex flex-col gap-6">
                <h1 className="text-2xl font-semibold text-(--c-foreground)">{title}</h1>
                <p className="text-sm text-(--c-muted-foreground)">Loading your {title.toLowerCase()}...</p>
            </div>
        );
    }


    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-semibold text-(--c-foreground)">{title}</h1>

            {movies.length === 0 ? (
                <p className="text-sm text-(--c-muted-foreground)">Nothing here yet.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {movies.map(entry => (
                        <div
                            key={entry.tmdbId}
                            className="group relative flex flex-col rounded-xl overflow-hidden border border-(--c-border) bg-(--c-card) hover:border-(--c-primary) hover:shadow-(--card-hover-glow) transition-all duration-300 cursor-pointer"
                            onClick={() => navigate(`/movie/${entry.tmdbId}`)}
                        >
                            <div className="relative aspect-2/3 overflow-hidden">
                                <img
                                    src={entry.movie?.poster_path
                                        ? `${POSTER_BASE}${entry.movie.poster_path}`
                                        : "/placeholder-poster.png"}
                                    alt={entry.movie?.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                {entry.userRating > 0 && (
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-white">
                                        ★ {entry.userRating}
                                    </div>
                                )}
                                {/* Remove button — appears on hover */}
                                <button
                                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 hover:bg-(--c-destructive)/80 text-white text-[11px] px-2 py-1 rounded-md"
                                    onClick={e => {
                                        e.stopPropagation();
                                        removeEntry(entry.tmdbId);
                                    }}
                                >
                                    Remove
                                </button>
                            </div>
                            <div className="p-3 flex flex-col gap-1">
                                <p className="text-sm font-medium text-(--c-foreground) line-clamp-1">
                                    {entry.movie?.title}
                                </p>
                                <p className="text-xs text-(--c-muted-foreground)">
                                    {entry.movie?.release_date?.slice(0, 4)}
                                </p>
                                {entry.watched && (
                                    <span className="text-[11px] text-(--c-primary)">✓ Watched</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export function Favorites() {
    return <CollectionPage filter="inFavs" title="Favourites" />;
}

export function Watchlist() {
    return <CollectionPage filter="inWatchlist" title="Watchlist" />;
}


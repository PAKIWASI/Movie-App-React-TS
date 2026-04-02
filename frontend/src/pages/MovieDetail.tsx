import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import { useParams } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { getMovieDetail, getMovieCredits } from "../services/movieAPI";
import type { MovieDetail, MovieCredits, UserMovie } from "../types/Movie";
import {
    getMovieEntry,
    addToCollection,
    toggleFavorite,
    toggleWatchlist,
    toggleWatched,
    setRating,
    setReview,
} from "../services/userAPI";


const POSTER_BASE    = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE  = "https://image.tmdb.org/t/p/w1280";
const PROFILE_BASE   = "https://image.tmdb.org/t/p/w185";


function MovieDetailPage() 
{
    const { id }          = useParams<{ id: string }>();
    const { isLoggedIn }  = useUser();
    const tmdbId          = parseInt(id!);

    const [movie, setMovie]       = useState<MovieDetail | null>(null);
    const [credits, setCredits]   = useState<MovieCredits | null>(null);
    const [entry, setEntry]       = useState<UserMovie | null>(null);
    const [loading, setLoading]   = useState(true);
    const [busy, setBusy]         = useState(false);

    // Review / rating local state
    const [reviewText, setReviewText]   = useState("");
    const [ratingInput, setRatingInput] = useState("");
    const [reviewSaved, setReviewSaved] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [detailRes, creditsRes] = await Promise.all([
                    getMovieDetail(tmdbId),
                    getMovieCredits(tmdbId),
                ]);
                if (detailRes.success)  setMovie(detailRes.data);
                if (creditsRes.success) setCredits(creditsRes.data);

                // Load user's entry for this movie if logged in
                if (isLoggedIn) {
                    const entryRes = await getMovieEntry(tmdbId);
                    if (entryRes.success && entryRes.data.length > 0) {
                        const e = entryRes.data[0];
                        setEntry(e);
                        setReviewText(e.userReview);
                        setRatingInput(e.userRating > 0 ? String(e.userRating) : "");
                    }
                }
            } catch (err) {
                console.error("MovieDetail load error:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [tmdbId, isLoggedIn]);


    // Ensure movie is in collection, then run action
    // action is a function like toggle fav/watched 
    const ensureAndRun = async (action: (e: UserMovie) => Promise<UserMovie>) => {
        if (busy) return;
        try {
            setBusy(true);
            let current = entry;
            if (!current) {
                const res = await addToCollection(tmdbId);
                current = res.data;
            }
            const updated = await action(current);
            setEntry(updated);
        } catch (err) {
            console.error("collection action error:", err);
        } finally {
            setBusy(false);
        }
    };

    const handleToggleFav       = () => ensureAndRun(async () => (await toggleFavorite(tmdbId)).data);
    const handleToggleWatchlist = () => ensureAndRun(async () => (await toggleWatchlist(tmdbId)).data);
    const handleToggleWatched   = () => ensureAndRun(async () => (await toggleWatched(tmdbId)).data);

    const handleSetRating = async () => {
        const val = parseFloat(ratingInput);
        if (isNaN(val) || val < 0 || val > 10) return;
        ensureAndRun(async () => (await setRating(tmdbId, val)).data);
    };

    const handleSetReview = async () => {
        ensureAndRun(async () => {
            const res = await setReview(tmdbId, reviewText);
            setReviewSaved(true);
            setTimeout(() => setReviewSaved(false), 2000);
            return res.data;
        });
    };

    if (loading) {
        return <p className="text-center text-(--c-muted-foreground) py-32">Loading...</p>;
    }

    if (!movie) {
        return <p className="text-center text-(--c-muted-foreground) py-32">Movie not found.</p>;
    }

    // TODO: just show top names from cast and crews array that fit on screen, then rest are to the right

    const director = credits?.crew.find(c => c.job === "Director");
    const topCast  = credits?.cast.slice(0, 8) ?? [];
    const runtime  = movie.runtime
        ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
        : null;

    return (
        <div className="flex flex-col gap-8 pb-16">

            {/* Backdrop + hero */}
            <div className="relative -mx-6 -mt-6 h-72 overflow-hidden">
                {movie.backdrop_path && (
                    <img
                        src={`${BACKDROP_BASE}${movie.backdrop_path}`}
                        alt=""
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-(--c-background) via-(--c-background)/60 to-transparent" />
            </div>

            {/* Main info row */}
            <div className="flex gap-6 -mt-24 relative z-10">
                {/* Poster */}
                <img
                    src={movie.poster_path ? `${POSTER_BASE}${movie.poster_path}` : "/placeholder-poster.png"}
                    alt={movie.title}
                    className="hidden sm:block w-36 rounded-xl border border-(--c-border) shrink-0 self-end"
                />

                {/* Title block */}
                <div className="flex flex-col gap-2 self-end">
                    <h1 className="text-2xl font-bold text-(--c-foreground)">{movie.title}</h1>
                    {movie.tagline && (
                        <p className="text-sm text-(--c-primary) italic">"{movie.tagline}"</p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-(--c-muted-foreground)">
                        {movie.release_date?.slice(0, 4) && <span>{movie.release_date.slice(0, 4)}</span>}
                        {runtime && <><span>·</span><span>{runtime}</span></>}
                        {director && <><span>·</span><span>Dir. {director.name}</span></>}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                        {movie.genres.map(g => (
                            <span key={g.id} className="text-[11px] px-2 py-0.5 rounded-full bg-(--c-secondary) text-(--c-muted-foreground) border border-(--c-border)">
                                {g.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Rating + overview */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-(--c-primary)">{movie.vote_average.toFixed(1)}</span>
                    <span className="text-sm text-(--c-muted-foreground)">/ 10 · {movie.vote_count.toLocaleString()} votes</span>
                </div>
                <p className="text-sm text-(--c-foreground) leading-relaxed max-w-2xl">{movie.overview}</p>
            </div>

            {/* User actions — only if logged in */}
            {isLoggedIn && (
                <div className="flex flex-col gap-6 bg-(--c-card) border border-(--c-border) rounded-xl p-6">
                    <h2 className="text-sm font-semibold text-(--c-foreground)">Your collection</h2>

                    {/* Toggle buttons */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={entry?.inFavs ? "primary" : "outline"}
                            size="sm"
                            disabled={busy}
                            onClick={handleToggleFav}
                        >
                            ♥ {entry?.inFavs ? "In Favourites" : "Add to Favourites"}
                        </Button>
                        <Button
                            variant={entry?.inWatchlist ? "primary" : "outline"}
                            size="sm"
                            disabled={busy}
                            onClick={handleToggleWatchlist}
                        >
                            {entry?.inWatchlist ? "✓ In Watchlist" : "+ Watchlist"}
                        </Button>
                        <Button
                            variant={entry?.watched ? "primary" : "outline"}
                            size="sm"
                            disabled={busy}
                            onClick={handleToggleWatched}
                        >
                            {entry?.watched ? "✓ Watched" : "Mark Watched"}
                        </Button>
                    </div>

                    {/* Rating */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-(--c-foreground)">
                            Your rating {entry?.userRating ? `— currently ${entry.userRating}/10` : ""}
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                min={0}
                                max={10}
                                step={0.5}
                                value={ratingInput}
                                onChange={e => setRatingInput(e.target.value)}
                                placeholder="0–10"
                                className="w-24 h-9 px-3 rounded-lg bg-(--c-secondary) border border-(--c-border) text-(--c-foreground) text-sm focus:outline-none focus:border-(--c-primary) transition-colors"
                            />
                            <Button size="sm" variant="outline" disabled={busy} onClick={handleSetRating}>
                                Set rating
                            </Button>
                        </div>
                    </div>

                    {/* Review */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-(--c-foreground)">Your review</label>
                        <textarea
                            rows={3}
                            value={reviewText}
                            onChange={e => setReviewText(e.target.value)}
                            placeholder="Write your thoughts..."
                            className="px-3 py-2 rounded-lg bg-(--c-secondary) border border-(--c-border) text-(--c-foreground) text-sm focus:outline-none focus:border-(--c-primary) transition-colors resize-none"
                        />
                        <div className="flex items-center gap-3">
                            <Button size="sm" variant="outline" disabled={busy} onClick={handleSetReview}>
                                Save review
                            </Button>
                            {reviewSaved && <span className="text-sm text-(--c-primary)">Saved!</span>}
                        </div>
                    </div>
                </div>
            )}

            {/* Cast */}
            {topCast.length > 0 && (
                <div className="flex flex-col gap-4">
                    <h2 className="text-base font-semibold text-(--c-foreground)">Cast</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
                        {topCast.map(member => (
                            <div key={member.id} className="flex flex-col items-center gap-1 text-center">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-(--c-secondary) border border-(--c-border)">
                                    {member.profile_path ? (
                                        <img
                                            src={`${PROFILE_BASE}${member.profile_path}`}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-lg text-(--c-muted-foreground)">
                                            {member.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs font-medium text-(--c-foreground) line-clamp-1">{member.name}</p>
                                <p className="text-[11px] text-(--c-muted-foreground) line-clamp-1">{member.character}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Extra details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Status",   value: movie.status },
                    { label: "Language", value: movie.original_language?.toUpperCase() },
                    { label: "Budget",   value: movie.budget  ? `$${movie.budget.toLocaleString()}`  : "—" },
                    { label: "Revenue",  value: movie.revenue ? `$${movie.revenue.toLocaleString()}` : "—" },
                ].map(({ label, value }) => (
                    <div key={label} className="bg-(--c-card) border border-(--c-border) rounded-lg p-4">
                        <p className="text-xs text-(--c-muted-foreground)">{label}</p>
                        <p className="text-sm font-medium text-(--c-foreground) mt-1">{value ?? "—"}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MovieDetailPage;

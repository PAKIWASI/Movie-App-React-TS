import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { UserMovie, CollectionContextType } from "../types/Movie";
import { useUser } from "./UserContext";
import {
    getCollection,
    setRating,
    setReview,
    toggleFavorite,
    toggleWatched,
    toggleWatchlist,
    addToCollection,
    removeFromCollection,
} from "../services/userMovieAPI";



const CollectionContext = createContext<CollectionContextType | null>(null);


export function CollectionProvider({ children }: { children: React.ReactNode }) 
{
    const [collection, setCollection]   = useState<UserMovie[]>([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState<Error | null>(null);
    const { isLoggedIn }                = useUser();


    const loadCollection = useCallback(async () => {
        if (!isLoggedIn) {
            setCollection([]);
            setLoading(false);
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            const res = await getCollection({ limit: 500 });
            if (res.success) setCollection(res.data);
        } catch (err) {
            console.error("loadCollection error:", err);
            setError(err instanceof Error ? err : new Error("Failed to load collection"));
        } finally {
            setLoading(false);
        }
    }, [isLoggedIn]);


    const getEntry = useCallback(
        (tmdbId: number): UserMovie | null =>
            collection.find(e => e.tmdbId === tmdbId) ?? null,
        [collection]
    );


    const getFiltered = useCallback(
        (filter: "inFavs" | "inWatchlist" | "watched"): UserMovie[] =>
            collection.filter(um => um[filter]),
        [collection]
    );


    const refreshCollection = useCallback(async () => {
        await loadCollection();
    }, [loadCollection]);


    // setAttribute: optimistic update with rollback.
    // we capture previousState via a functional updater so we always
    // get the real current state at rollback time.
    const setAttribute = useCallback(
        async (
            tmdbId: number,
            filter: "inFavs" | "inWatchlist" | "watched" | "userRating" | "userReview",
            rating?: number,
            review?: string
        ): Promise<void> => {
            if (filter === "userRating" && rating === undefined) return;
            if (filter === "userReview" && review === undefined) return;

            // Ensure an entry exists before mutating
            let entry = collection.find(e => e.tmdbId === tmdbId) ?? null;
            if (!entry) {
                try {
                    const res = await addToCollection(tmdbId);
                    if (!res.success) return;
                    entry = res.data;
                    setCollection(prev => [...prev, entry!]);
                } catch {
                    return;
                }
            }

            // Capture snapshot for rollback using functional form so we get the
            // real current state (avoids stale closure from above setCollection call)
            let snapshot: UserMovie[] = [];
            setCollection(prev => { snapshot = prev; return prev; });

            // Optimistic update
            setCollection(prev =>
                prev.map(um => {
                    if (um.tmdbId !== tmdbId) return um;
                    switch (filter) {
                        case "inFavs":      return { ...um, inFavs: !um.inFavs };
                        case "inWatchlist": return { ...um, inWatchlist: !um.inWatchlist };
                        case "watched":     return { ...um, watched: !um.watched };
                        case "userRating":  return { ...um, userRating: rating! };
                        case "userReview":  return { ...um, userReview: review! };
                        default:            return um;
                    }
                })
            );

            // Sync to DB
            try {
                switch (filter) {
                    case "inFavs":      await toggleFavorite(tmdbId); break;
                    case "inWatchlist": await toggleWatchlist(tmdbId); break;
                    case "watched":     await toggleWatched(tmdbId); break;
                    case "userRating":  await setRating(tmdbId, rating!); break;
                    case "userReview":  await setReview(tmdbId, review!); break;
                }
            } catch (err) {
                console.error("setAttribute failed, rolling back:", err);
                setCollection(snapshot);
                throw err;
            }
        },
        [collection]
    );


    // removeEntry: optimistic remove with rollback
    const removeEntry = useCallback(
        async (tmdbId: number): Promise<void> => {
            let snapshot: UserMovie[] = [];
            setCollection(prev => { snapshot = prev; return prev; });

            // Optimistic remove
            setCollection(prev => prev.filter(um => um.tmdbId !== tmdbId));

            try {
                await removeFromCollection(tmdbId);
            } catch (err) {
                console.error("removeEntry failed, rolling back:", err);
                setCollection(snapshot);
                throw err;
            }
        },
        []
    );


    useEffect(() => {
        loadCollection();
    }, [loadCollection]);   // on mount

    return (
        <CollectionContext.Provider value={{
            collection,
            loading,
            error,
            getEntry,
            getFiltered,
            refreshCollection,
            setAttribute,
            removeEntry,
        }}>
            {children}
        </CollectionContext.Provider>
    );
};

export function useCollection() 
{
    const ctx = useContext(CollectionContext);
    if (!ctx) throw new Error("useCollection must be used inside <CollectionProvider>");
    return ctx;
};


import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { type UserMovie, type CollectionContextType } from "../types/Movie";
import { getCollection, setRating, setReview, toggleFavorite, toggleWatched, toggleWatchlist } from "../services/userAPI";
import { useUser } from "./UserContext";

/*
CollectionContext is a shared server-side cache for the user's movie collection. 
Instead of every page (Profile, Favorites, Watchlist, MovieDetail) 
each firing their own GET /user/me/movie?... query, they all read from one in-memory array that was fetched once.
*/

// TODO: 
// One thing to note: if i mutate the collection, i have to MANUALLY call refreshCollection()
// is this considered bad in react land ?
// we are not using this anywhere yet



const CollectionContext = createContext<CollectionContextType | null>(null);


export function CollectionProvider({ children }: { children: React.ReactNode }) {
    const [collection, setCollection] = useState<UserMovie[]>([]);
    const { isLoggedIn } = useUser();

    const loadCollection = useCallback(async () => {
        try {
            const res = await getCollection({ limit: 500 });
            if (res.success) {
                setCollection(res.data);
            }
        } catch {
            // not critical — silently fail, detail page will fall back
        }
    }, []);

    // Look up a single entry from the local cache
    const getEntry = useCallback(
        (tmdbId: number): UserMovie | null =>
            collection.find(e => e.tmdbId === tmdbId) ?? null,
        [collection]
    );

    // this reloads all collection for a single change - might be BAD
    // Call after any mutation (toggle, rating, review) to keep cache fresh
    const refreshCollection = useCallback(async () => {
        await loadCollection();
    }, [loadCollection]);


    // TODO: how to do this?
    const getFiltered = useCallback(
        (filter: "inFavs" | "inWatchlist" | "watched"): UserMovie[] =>
            collection.filter((um) => um[filter]),
        [collection]
    );

    // TODO: is this right? local change happens instantly while we also send req to api
    const setAttribute = useCallback(
        async (tmdbId: number, filter: "inFavs" | "inWatchlist" | "watched" | "userRating" | "userReview",
            rating?: number, review?: string): Promise<void> => {

            const um = collection.find(e => e.tmdbId === tmdbId) ?? null;
            if (!um || filter === "userRating" && !rating || filter === "userReview" && !review) return;
            switch (filter) {
                case "inFavs": um.inFavs = !um.inFavs; await toggleFavorite(tmdbId); break;
                case "inWatchlist": um.inWatchlist = !um.inWatchlist; await toggleWatchlist(tmdbId); break;
                case "watched": um.watched = !um.watched; await toggleWatched(tmdbId); break;
                case "userRating": um.userRating = rating!; await setRating(tmdbId, rating!); break;
                case "userReview": um.userReview = review!; await setReview(tmdbId, review!); break;
            }
        },
        [collection]
    );


    // Load collection whenever user logs in
    useEffect(() => {
        if (isLoggedIn) {
            loadCollection();
        } else {
            setCollection([]);
        }               // this function here is kinda required?
    }, [isLoggedIn, loadCollection]);


    return (
        <CollectionContext.Provider value={{
            collection,
            getEntry,
            getFiltered,
            refreshCollection,
            setAttribute,
        }}>
            {children}
        </CollectionContext.Provider>
    );
};

export function useCollection() {
    const ctx = useContext(CollectionContext);
    if (!ctx) throw new Error("useCollection must be used inside <CollectionProvider>");
    return ctx;
};



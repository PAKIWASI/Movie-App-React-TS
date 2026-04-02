import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { type UserMovie, type CollectionContextType } from "../types/Movie";
import { getCollection } from "../services/userAPI";
import { useUser } from "./UserContext";

/*
CollectionContext is a shared server-side cache for the user's movie collection. 
Instead of every page (Profile, Favorites, Watchlist, MovieDetail) 
each firing their own GET /user/me/movie?... query, they all read from one in-memory array that was fetched once.
*/

// TODO: 
// One thing to note: if i mutate the collection, i have to MANUALLY call refreshCollection()
// is this considered bad in react land ?


const CollectionContext = createContext<CollectionContextType | null>(null);



export function CollectionProvider({ children }: { children: React.ReactNode }) 
{
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
            refreshCollection,
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



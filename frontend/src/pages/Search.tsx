import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import SearchBar from "../components/SearchBar";
import type { TMDBmovie } from "../types/Movie";
import { searchMovies } from "../services/movieAPI";
import MovieDisplay from "../components/MovieDisplay";
import { useSearchParams, useNavigate } from "react-router-dom";


function Search() 
{
    const navigate       = useNavigate();
    const [searchParams] = useSearchParams();
    const query          = searchParams.get("q") ?? "";     //route: /seach?q="movie-query"

    const [searchInput, setSearchInput] = useState(query);
    const [movies, setMovies]           = useState<TMDBmovie[]>([]);
    const [loading, setLoading]         = useState(false);
    const [page, setPage]               = useState(1);
    const [hasMore, setHasMore]         = useState(true);
    const [total, setTotal]             = useState(0);


    const fetchResults = async (q: string, pageNum: number, append: boolean) => {
        if (!q.trim()) return;
        try {
            setLoading(true);
            const res = await searchMovies(q, pageNum);
            if (res.success) {
                setMovies(prev => append ? [...prev, ...res.data] : res.data);
                setHasMore(pageNum < res.pagination.pages);
                setTotal(res.pagination.total);
            }
        } catch (err) {
            console.error("search error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Re-run whenever the URL query param changes
    useEffect(() => {
        setSearchInput(query);
        setPage(1);
        setMovies([]);
        if (query.trim()) {
            fetchResults(query, 1, false);
        }
    }, [query]);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchResults(query, nextPage, true);
    };

    // New search — update the URL
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!searchInput.trim()) {
            navigate("/");
            return;
        }
        navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    };

    return (
        <div className="flex flex-col gap-6">
            <SearchBar
                search={searchInput}
                onSearchChange={setSearchInput}
                onSubmit={handleSearch}
            />

            {query && (
                <p className="text-sm text-(--c-muted-foreground)">
                    {total > 0
                        ? `${total} results for "${query}"`
                        : loading ? "" : `No results for "${query}"`
                    }
                </p>
            )}

            {loading && movies.length === 0 ? (
                <p className="text-center text-(--c-muted-foreground) text-sm py-12">Searching...</p>
            ) : (
                <>
                    <MovieDisplay movies={movies} />

                    {hasMore && (
                        <div className="flex justify-center pt-4">
                            <Button
                                variant="outline"
                                onClick={handleLoadMore}
                                disabled={loading}
                            >
                                {loading ? "Loading..." : "Load More"}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Search;

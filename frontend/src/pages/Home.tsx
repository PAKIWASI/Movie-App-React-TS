import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import type { TMDBmovie } from "../types/Movie";
import MovieDisplay from "../components/MovieDisplay";
import { getPopularMovies } from "../services/movieAPI";


// TODO: add search suggestions based on query with poster and name



function Home() 
{
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery]   = useState("");
    const [movies, setMovies]             = useState<TMDBmovie[]>([]);
    const [loading, setLoading]           = useState(false);
    const [page, setPage]                 = useState(1);
    const [hasMore, setHasMore]           = useState(true);

    const fetchPopular = async (pageNum: number, append: boolean) => {
        try {
            setLoading(true);
            const res = await getPopularMovies(pageNum);
            if (res.success) {
                // append=true means "load more", append=false means fresh load
                setMovies(prev => append ? [...prev, ...res.data] : res.data);
                setHasMore(pageNum < res.pagination.pages);
            }
        } catch (err) {
            console.error("fetchPopular error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchPopular(1, false);
    }, []);

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPopular(nextPage, true);  // append to existing movies
    };

    // Redirect to /search route instead of handling search here
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    };

    return (
        <div className="flex flex-col gap-6">
            <SearchBar
                search={searchQuery}
                onSearchChange={setSearchQuery}
                onSubmit={handleSearch}
            />

            <h2 className="text-lg font-semibold text-(--c-foreground)">Popular Movies</h2>

            {loading && movies.length === 0 ? (
                <p className="text-center text-(--c-muted-foreground) text-sm py-12">Loading...</p>
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

export default Home;

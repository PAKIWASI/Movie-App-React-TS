import Button from "./ui/Button";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { SearchBarProps } from "../types/PropTypes";
import { searchMovies } from "../services/movieAPI";
import type { TMDBmovie } from "../types/Movie";


const POSTER_BASE = "https://image.tmdb.org/t/p/w92";


function SearchBar({ search, onSearchChange, onSubmit }: SearchBarProps) {
    const navigate = useNavigate();
    const [suggestions, setSuggestions] = useState<TMDBmovie[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const debounceRef = useRef<number | null>(null);
    const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch suggestions when search input changes
    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (!search.trim() || search.trim().length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsLoading(true);
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await searchMovies(search.trim(), 1, 5); // Limit to 5 suggestions
                if (res.success && res.data.length > 0) {
                    setSuggestions(res.data);
                    setShowSuggestions(true);
                } else {
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            } catch (err) {
                console.error("Search suggestions error:", err);
                setSuggestions([]);
                setShowSuggestions(false);
            } finally {
                setIsLoading(false);
            }
        }, 300); // Debounce 300ms

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [search]);

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions && suggestions.length === 0) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && suggestions[selectedIndex]) {
                    // Navigate to selected movie
                    navigate(`/movie/${suggestions[selectedIndex].id}`);
                    setShowSuggestions(false);
                    setSelectedIndex(-1);
                    onSearchChange(""); // Clear search input
                } else {
                    // Submit the form normally
                    onSubmit(e as any);
                    setShowSuggestions(false);
                }
                break;
            case "Escape":
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (movie: TMDBmovie) => {
        navigate(`/movie/${movie.id}`);
        setShowSuggestions(false);
        setSelectedIndex(-1);
        onSearchChange(""); // Clear search input
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
                setSelectedIndex(-1);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Scroll selected suggestion into view
    useEffect(() => {
        if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
            suggestionRefs.current[selectedIndex]?.scrollIntoView({
                block: "nearest",
                behavior: "smooth",
            });
        }
    }, [selectedIndex]);

    return (
        <div className="w-full max-w-xl mx-auto" ref={containerRef}>
            <form onSubmit={(e) => {
                onSubmit(e);
                setShowSuggestions(false);
            }} className="relative flex items-center gap-2">
                <div className="relative flex-1">
                    <input
                        className="w-full h-10 px-4 rounded-lg bg-(--c-secondary) border border-(--c-border) text-(--c-foreground) placeholder:text-(--c-muted-foreground) focus:outline-none focus:border-(--c-primary) focus:ring-2 focus:ring-(--c-primary)/50 transition-all duration-200 text-sm"
                        type="text"
                        placeholder="Search for movies..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            if (suggestions.length > 0) setShowSuggestions(true);
                        }}
                        autoComplete="off"
                    />
                    
                    {/* Loading indicator */}
                    {isLoading && search.trim().length >= 2 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-(--c-primary) border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
                <Button type="submit" variant="search">
                    Search
                </Button>
            </form>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 mt-2 w-full max-w-xl rounded-lg border border-(--c-border) bg-(--c-popover) shadow-(--neon-glow) overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                        {suggestions.map((movie, index) => (
                            <div
                                key={movie.id}
                                ref={el => { suggestionRefs.current[index] = el}}
                                className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                                    index === selectedIndex
                                        ? "bg-(--c-secondary) border-l-2 border-(--c-primary)"
                                        : "hover:bg-(--c-secondary)/50"
                                }`}
                                onClick={() => handleSuggestionClick(movie)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                {/* Poster */}
                                <div className="w-10 h-14 rounded-md overflow-hidden bg-(--c-secondary) shrink-0">
                                    {movie.poster_path ? (
                                        <img
                                            src={`${POSTER_BASE}${movie.poster_path}`}
                                            alt={movie.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-xs text-(--c-muted-foreground)">
                                            🎬
                                        </div>
                                    )}
                                </div>
                                
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-(--c-foreground) truncate">
                                        {movie.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-(--c-muted-foreground)">
                                            {movie.release_date?.slice(0, 4) || "—"}
                                        </span>
                                        <span className="text-xs flex items-center gap-1">
                                            <svg className="w-3 h-3 fill-(--c-primary)" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="text-xs text-(--c-muted-foreground)">
                                                {movie.vote_average.toFixed(1)}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Genre tags (optional - shows first genre) */}
                                {movie.genres && movie.genres.length > 0 && (
                                    <div className="hidden sm:block">
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-(--c-secondary) text-(--c-muted-foreground) border border-(--c-border)">
                                            {movie.genres[0].name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {/* Footer hint */}
                    <div className="px-3 py-2 border-t border-(--c-border) bg-(--c-secondary)/30">
                        <p className="text-[10px] text-(--c-muted-foreground) text-center">
                            ↑ ↓ to navigate • Enter to select • Esc to close
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SearchBar;

import Button from "./ui/Button";
import type { SearchBarProps } from "../types/PropTypes";



function SearchBar({ search, onSearchChange, onSubmit }: SearchBarProps) {
    return (
        <div className="w-full max-w-xl mx-auto">
            <form onSubmit={onSubmit} className="flex items-center gap-2">
                <input
                    className="flex-1 h-10 px-4 rounded-lg bg-(--c-secondary) border border-(--c-border) text-(--c-foreground) placeholder:text-(--c-muted-foreground) focus:outline-none focus:border-(--c-primary) focus:ring-2 focus:ring-(--c-primary)/50 transition-all duration-200 text-sm"
                    type="text"
                    placeholder="Search for movies..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
                <Button type="submit" variant="search">
                    Search
                </Button>
            </form>
        </div>
    );
}

export default SearchBar;

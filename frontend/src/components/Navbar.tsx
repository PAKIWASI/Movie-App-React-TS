import Button from "./ui/Button";
import { Link, NavLink } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useState, useRef, useEffect } from "react";



function Navbar() 
{
    const { user, isLoggedIn, logout } = useUser();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between w-full h-14 px-6 border-b border-(--c-border) bg-(--c-background)/80 backdrop-blur-md">

            <Link to="/" className="text-xl font-bold text-(--c-primary) tracking-tight">
                Wasi's
            </Link>

            <div className="flex items-center gap-1">

                {/* always show Home */}
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive
                            ? "text-(--c-primary) bg-(--c-secondary)"
                            : "text-(--c-muted-foreground) hover:text-(--c-foreground) hover:bg-(--c-secondary)"
                        }`
                    }
                >
                    Home
                </NavLink>

                {!isLoggedIn ? (
                    // logged out — just show Get Started
                    <Button size="sm" className="ml-2">
                        <Link to="/register">Get Started</Link>
                    </Button>
                ) : (
                    // logged in — show profile dropdown
                    <div className="relative ml-2" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(prev => !prev)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-(--c-muted-foreground) hover:text-(--c-foreground) hover:bg-(--c-secondary) transition-colors"
                        >
                            {/* avatar circle — initials fallback */}
                            <span className="w-6 h-6 rounded-full bg-(--c-primary) text-(--c-primary-foreground) text-xs font-bold flex items-center justify-center">
                                {user?.name?.charAt(0).toUpperCase()}
                            </span>
                            {user?.name}
                            {/* chevron — rotates when open */}
                            <svg
                                className={`w-3 h-3 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-44 rounded-lg border border-(--c-border) bg-(--c-popover) shadow-(--neon-glow) py-1 z-50">
                                {[                          
                                    { to: "/profile", label: "Profile" },
                                    { to: "/favorites", label: "Favorites" },
                                    { to: "/watchlist", label: "Watchlist" },
                                ].map(({ to, label }) => (
                                    <Link
                                        key={to}
                                        to={to}
                                        onClick={() => setDropdownOpen(false)}
                                        className="block px-4 py-2 text-sm text-(--c-foreground) hover:bg-(--c-secondary) transition-colors"
                                    >
                                        {label}
                                    </Link>
                                ))}

                                <div className="my-1 border-t border-(--c-border)" />

                                <button
                                    onClick={() => { logout(); setDropdownOpen(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-(--c-destructive) hover:bg-(--c-secondary) transition-colors"
                                >
                                    Log out
                                </button>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </nav>
    );
}

export default Navbar;

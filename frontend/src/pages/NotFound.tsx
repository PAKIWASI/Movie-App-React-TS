import { Link } from "react-router-dom";


function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
            <h1 className="text-6xl font-bold text-(--c-primary)">404</h1>
            <p className="text-(--c-muted-foreground) text-sm">This page doesn't exist.</p>
            <Link
                to="/"
                className="text-sm text-(--c-primary) hover:underline"
            >
                Go home
            </Link>
        </div>
    );
}

export default NotFound;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useCollection } from "../contexts/CollectionContext";
import Button from "../components/ui/Button";
import { updateMe, deleteMe } from "../services/userAPI";


const POSTER_BASE = "https://image.tmdb.org/t/p/w185";



function Profile() 
{
    const { user, logout }       = useUser();
    const { getFiltered, loading: collectionLoading } = useCollection();
    const navigate               = useNavigate();

    const [name, setName]         = useState(user?.name ?? "");
    const [age, setAge]           = useState(String(user?.age ?? ""));
    const [saving, setSaving]     = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [success, setSuccess]   = useState("");
    const [error, setError]       = useState("");

    // Read from context cache — no extra fetch needed
    const watched = getFiltered("watched");

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setSuccess("");
        try {
            setSaving(true);
            await updateMe({ name, age: parseInt(age) });
            setSuccess("Profile updated.");
        } catch (err: any) {
            setError(err.message ?? "Update failed");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Delete your account? This cannot be undone.")) return;
        try {
            setDeleting(true);
            await deleteMe();
            await logout();
            navigate("/");
        } catch (err: any) {
            setError(err.message ?? "Delete failed");
            setDeleting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto flex flex-col gap-8 py-8">

            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-(--c-primary) text-(--c-primary-foreground) text-xl font-bold flex items-center justify-center shrink-0">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 className="text-2xl font-semibold text-(--c-foreground)">{user?.name}</h1>
                    <p className="text-sm text-(--c-muted-foreground)">{user?.email}</p>
                </div>
            </div>

            {/* Watched strip — from cache, instant */}
            <div className="flex flex-col gap-3">
                <h2 className="text-base font-semibold text-(--c-foreground)">
                    Watched
                    {!collectionLoading && watched.length > 0 && (
                        <span className="ml-2 text-sm font-normal text-(--c-muted-foreground)">
                            {watched.length} {watched.length === 1 ? "movie" : "movies"}
                        </span>
                    )}
                </h2>

                {collectionLoading ? (
                    <p className="text-sm text-(--c-muted-foreground)">Loading your watched movies...</p>
                ) : watched.length === 0 ? (
                    <p className="text-sm text-(--c-muted-foreground)">No watched movies yet.</p>
                ) : (
                    <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth" style={{ scrollbarWidth: "thin" }}>
                        {watched.map(entry => (
                            <div
                                key={entry.tmdbId}
                                className="shrink-0 w-24 flex flex-col gap-1 cursor-pointer group"
                                onClick={() => navigate(`/movie/${entry.tmdbId}`)}
                            >
                                <div className="relative w-24 h-36 rounded-lg overflow-hidden border border-(--c-border) group-hover:border-(--c-primary) transition-colors">
                                    <img
                                        src={entry.movie?.poster_path
                                            ? `${POSTER_BASE}${entry.movie.poster_path}`
                                            : "/placeholder-poster.png"}
                                        alt={entry.movie?.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {entry.userRating > 0 && (
                                        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                                            ★ {entry.userRating}
                                        </div>
                                    )}
                                </div>
                                <p className="text-[11px] text-(--c-foreground) line-clamp-2 leading-tight">
                                    {entry.movie?.title}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit profile */}
            <form onSubmit={handleUpdate} className="bg-(--c-card) border border-(--c-border) rounded-xl p-6 flex flex-col gap-4">
                <div>
                    <h2 className="text-sm font-semibold text-(--c-foreground)">Edit profile</h2>
                    <p className="text-xs text-(--c-muted-foreground) mt-0.5">Email cannot be changed.</p>
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-(--c-foreground)">Name</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)}
                        className="h-10 px-3 rounded-lg bg-(--c-secondary) border border-(--c-border) text-(--c-foreground) text-sm focus:outline-none focus:border-(--c-primary) focus:ring-2 focus:ring-(--c-primary)/50 transition-all" />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-(--c-foreground)">Age</label>
                    <input type="number" required min={1} max={120} value={age} onChange={e => setAge(e.target.value)}
                        className="h-10 px-3 rounded-lg bg-(--c-secondary) border border-(--c-border) text-(--c-foreground) text-sm focus:outline-none focus:border-(--c-primary) focus:ring-2 focus:ring-(--c-primary)/50 transition-all" />
                </div>
                {error   && <p className="text-sm text-(--c-destructive)">{error}</p>}
                {success && <p className="text-sm text-(--c-primary)">{success}</p>}
                <Button type="submit" disabled={saving} className="w-full">
                    {saving ? "Saving..." : "Save changes"}
                </Button>
            </form>

            {/* Danger zone */}
            <div className="bg-(--c-card) border border-(--c-destructive)/40 rounded-xl p-6 flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-(--c-destructive)">Danger zone</h2>
                <p className="text-sm text-(--c-muted-foreground)">Deleting your account removes all your data permanently.</p>
                <Button variant="outline" disabled={deleting} onClick={handleDelete}
                    className="w-full border-(--c-destructive)/50 text-(--c-destructive) hover:bg-(--c-destructive)/10">
                    {deleting ? "Deleting..." : "Delete account"}
                </Button>
            </div>

        </div>
    );
};

export default Profile;

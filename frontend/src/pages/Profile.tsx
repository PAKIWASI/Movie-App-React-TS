import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { updateMe, deleteMe } from "../services/userAPI";
import Button from "../components/ui/Button";


function Profile() 
{
    const { user, logout } = useUser();
    const navigate          = useNavigate();

    const [name, setName]         = useState(user?.name  ?? "");
    const [email, setEmail]       = useState(user?.email ?? "");
    const [age, setAge]           = useState(String(user?.age ?? ""));
    const [saving, setSaving]     = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [success, setSuccess]   = useState("");
    const [error, setError]       = useState("");

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(""); setSuccess("");
        try {
            setSaving(true);
            await updateMe({ name, email, age: parseInt(age) });
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
        <div className="max-w-md mx-auto flex flex-col gap-8 py-8">
            <div>
                <h1 className="text-2xl font-semibold text-(--c-foreground)">Profile</h1>
                <p className="text-sm text-(--c-muted-foreground) mt-1">Manage your account details</p>
            </div>

            <form onSubmit={handleUpdate} className="bg-(--c-card) border border-(--c-border) rounded-xl p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-(--c-foreground)">Name</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="h-10 px-3 rounded-lg bg-(--c-secondary) border border-(--c-border) text-(--c-foreground) text-sm focus:outline-none focus:border-(--c-primary) transition-colors"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-(--c-foreground)">Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="h-10 px-3 rounded-lg bg-(--c-secondary) border border-(--c-border) text-(--c-foreground) text-sm focus:outline-none focus:border-(--c-primary) transition-colors"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-(--c-foreground)">Age</label>
                    <input
                        type="number"
                        required
                        min={1}
                        value={age}
                        onChange={e => setAge(e.target.value)}
                        className="h-10 px-3 rounded-lg bg-(--c-secondary) border border-(--c-border) text-(--c-foreground) text-sm focus:outline-none focus:border-(--c-primary) transition-colors"
                    />
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
                <p className="text-sm text-(--c-muted-foreground)">
                    Deleting your account removes all your data permanently.
                </p>
                <Button
                    variant="outline"
                    disabled={deleting}
                    onClick={handleDelete}
                    className="w-full border-(--c-destructive)/50 text-(--c-destructive) hover:bg-(--c-destructive)/10"
                >
                    {deleting ? "Deleting..." : "Delete account"}
                </Button>
            </div>
        </div>
    );
}

export default Profile;

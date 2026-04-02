import { useState } from "react";
import Button from "../components/ui/Button";
import { useUser } from "../contexts/UserContext";
import { Link, useNavigate } from "react-router-dom";



function Login() 
{
    const { login } = useUser();
    const navigate  = useNavigate();

    const [email, setEmail]     = useState("");
    const [password, setPass]   = useState("");
    const [error, setError]     = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            setLoading(true);
            await login(email, password);
            navigate("/");
        } catch (err: any) {
            setError(err.message ?? "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-sm bg-(--c-card) border border-(--c-border) rounded-xl p-8 flex flex-col gap-6">
                <div>
                    <h1 className="text-xl font-semibold text-(--c-foreground)">Welcome back</h1>
                    <p className="text-sm text-(--c-muted-foreground) mt-1">Log in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-(--c-foreground)">Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="h-10 px-3 rounded-lg bg-(--c-secondary) border border-(--c-border) text-(--c-foreground) text-sm focus:outline-none focus:border-(--c-primary) transition-colors"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-(--c-foreground)">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPass(e.target.value)}
                            className="h-10 px-3 rounded-lg bg-(--c-secondary) border border-(--c-border) text-(--c-foreground) text-sm focus:outline-none focus:border-(--c-primary) transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-(--c-destructive)">{error}</p>
                    )}

                    <Button type="submit" disabled={loading} className="w-full mt-1">
                        {loading ? "Logging in..." : "Log in"}
                    </Button>
                </form>

                <p className="text-sm text-(--c-muted-foreground) text-center">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-(--c-primary) hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;

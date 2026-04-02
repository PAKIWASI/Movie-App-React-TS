import { useState } from "react";
import Button from "../components/ui/Button";
import { useUser } from "../contexts/UserContext";
import { apiRegister } from "../services/userAPI";
import { Link, useNavigate } from "react-router-dom";



function Register() 
{
    const { login } = useUser();
    const navigate  = useNavigate();

    const [name, setName]       = useState("");
    const [age, setAge]         = useState("");
    const [email, setEmail]     = useState("");
    const [password, setPass]   = useState("");
    const [error, setError]     = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            setLoading(true);
            await apiRegister(name, parseInt(age), email, password);
            // Auto-login after registration
            await login(email, password);
            navigate("/");
        } catch (err: any) {
            setError(err.message ?? "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh]">
            <div className="w-full max-w-sm bg-(--c-card) border border-(--c-border) rounded-xl p-8 flex flex-col gap-6">
                <div>
                    <h1 className="text-xl font-semibold text-(--c-foreground)">Create an account</h1>
                    <p className="text-sm text-(--c-muted-foreground) mt-1">Start tracking your movies</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-(--c-foreground)">Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="h-10 px-3 rounded-lg bg-(--c-secondary) border border-(--c-border) text-(--c-foreground) text-sm focus:outline-none focus:border-(--c-primary) transition-colors"
                            placeholder="Your name"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-(--c-foreground)">Age</label>
                        <input
                            type="number"
                            required
                            min={1}
                            max={120}
                            value={age}
                            onChange={e => setAge(e.target.value)}
                            className="h-10 px-3 rounded-lg bg-(--c-secondary) border border-(--c-border) text-(--c-foreground) text-sm focus:outline-none focus:border-(--c-primary) transition-colors"
                            placeholder="25"
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
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm text-(--c-foreground)">Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
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
                        {loading ? "Creating account..." : "Create account"}
                    </Button>
                </form>

                <p className="text-sm text-(--c-muted-foreground) text-center">
                    Already have an account?{" "}
                    <Link to="/login" className="text-(--c-primary) hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;

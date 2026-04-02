


interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "outline" | "ghost" | "search";
    size?: "sm" | "md" | "lg";
}

function Button({ variant = "primary", size = "md", className = "", children, ...props }: ButtonProps) {
    const base = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-[var(--c-primary)] text-[var(--c-primary-foreground)] hover:opacity-90 shadow-[var(--neon-glow)]",
        outline: "border border-[var(--c-border)] text-[var(--c-foreground)] hover:bg-[var(--c-secondary)]",
        ghost: "text-[var(--c-muted-foreground)] hover:text-[var(--c-foreground)] hover:bg-[var(--c-secondary)]",
        search: "bg-[var(--c-primary)] text-[var(--c-primary-foreground)] border-l-0 hover:opacity-90 transition-opacity px-6 h-10",
    };

    const sizes = {
        sm: "h-8  px-3 text-xs",
        md: "h-9  px-4 text-sm",
        lg: "h-11 px-6 text-base",
    };

    return (
        <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </button>
    );
}

export default Button;

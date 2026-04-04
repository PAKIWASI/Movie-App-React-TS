

export interface User {
    _id:   string;
    name:  string;
    email: string;
    age:   number;
}


export interface UserContextType {
    user:       User | null;
    isLoggedIn: boolean;
    login:      (email: string, password: string) => Promise<void>;
    logout:     () => Promise<void>;
    loading:    boolean;   // for showing spinners on initial load
    isLoggingOut: boolean;
}

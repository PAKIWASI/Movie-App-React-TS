


export const BASE_URL = import.meta.env.VITE_API_URL;


const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const res = await fetch(`${BASE_URL}/${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (res.status === 401) {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
        });
        if (!refreshRes.ok) throw new Error("Session expired, please log in again");

        return fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });
    }

    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res;
};

export default apiFetch;

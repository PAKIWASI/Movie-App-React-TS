export const BASE_URL = import.meta.env.VITE_API_URL;

// remember Singleton patten fron SDA class?
// refreshPromise is null initially and only gets a value when a refresh is happening,
// when that promise resolves, it goes back to null

// Singleton promise: if a refresh is already in-flight, all concurrent 401s
// wait for the same one instead of each firing their own POST /auth/refresh.
// This fixes the race condition found in the HAR where two requests both got
// 401 simultaneously and both triggered independent refreshes.
let refreshPromise: Promise<void> | null = null;

const doRefresh = async (): Promise<void> => {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) throw new Error("Session expired, please log in again");
};

const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {

    const buildRequest = () =>
        fetch(`${BASE_URL}/${endpoint}`, {
            ...options,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });

    const res = await buildRequest();
    if (res.status !== 401) {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res;
    }

    // 401 — ensure only one refresh runs at a time
    if (!refreshPromise) {
        refreshPromise = doRefresh().finally(() => {
            refreshPromise = null;
        });
    }

    try {
        await refreshPromise;
    } catch {
        throw new Error("Session expired, please log in again");
    }

    // Retry original request with the new access cookie now set
    const retried = await buildRequest();
    if (!retried.ok) throw new Error(`Request failed: ${retried.status}`);
    return retried;
};

export default apiFetch;

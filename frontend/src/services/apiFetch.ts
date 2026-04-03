
export const BASE_URL = import.meta.env.VITE_API_URL;

// remember Singleton patten fron SDA class?
// Singleton promise: if a refresh is already in-flight, all concurrent 401s
// wait for the same one instead of each firing their own POST /auth/refresh.
let refreshPromise: Promise<void> | null = null;

// When the refresh itself fails we dispatch a custom DOM event.
// apiFetch is plain ts, no access to React state, so UserContext listens
// for this event and clears the user.
export const SESSION_EXPIRED_EVENT = "session:expired";

// Dedupe the event: if multiple requests fail at once we only dispatch once.
let sessionExpiredDispatched = false;

const dispatchSessionExpired = () => {
    if (!sessionExpiredDispatched) {
        sessionExpiredDispatched = true;
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        // Reset after a short delay so it can fire again after a re-login
        setTimeout(() => { sessionExpiredDispatched = false; }, 2000);
    }
};

const doRefresh = async (): Promise<void> => {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) {
        dispatchSessionExpired();
        throw new Error("Session expired, please log in again");
    }
};

// 429: too many requests
// Retry with exponential backoff for 429 rate-limit responses
const retryOn429 = async (
    fn: () => Promise<Response>,
    retries = 3,
    delay = 1000
): Promise<Response> => {
    const res = await fn();
    if (res.status === 429 && retries > 0) {
        const retryAfter = parseInt(res.headers.get("Retry-After") || "1", 10);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));   // takes time in milli
        return retryOn429(fn, retries - 1, delay * 2);
    }
    return res;
};


// main api fetch function with retry to refresh access token
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

    let res = await retryOn429(buildRequest);

    // Not a 401 — return as-is (throw so callers don't have to check res.ok)
    if (res.status !== 401) {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res;
    }

    // 401 — attempt token refresh exactly once, shared across concurrent calls
    if (!refreshPromise) {
        refreshPromise = doRefresh().finally(() => {    // dont actually do it
            refreshPromise = null;
        });
    }

    try {
        await refreshPromise;   // try the request
    } catch {
        // Refresh failed — session is dead, event already dispatched in doRefresh
        throw new Error("Session expired, please log in again");
    }

    // Retry original request with the new access cookie now in place
    res = await buildRequest();
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res;
};

export default apiFetch;

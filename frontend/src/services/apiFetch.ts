
export const BASE_URL = import.meta.env.VITE_API_URL;

// remember Singleton patten fron SDA class?
// Singleton promise: if a refresh is already in-flight, all concurrent 401s
// wait for the same one instead of each firing their own POST /auth/refresh.
let refreshPromise: Promise<void> | null = null;

// When the refresh itself fails we dispatch a custom DOM event.
// apiFetch is plain ts, no access to React state, so UserContext listens
// for this event and clears the user.
export const SESSION_EXPIRED_EVENT = "session:expired";

// Dedupe the event: if multiple requests fail at once we only dispatch once
let sessionExpiredDispatched = false;
const dispatchSessionExpired = () => {
    if (!sessionExpiredDispatched) {
        sessionExpiredDispatched = true;
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        setTimeout(() => { sessionExpiredDispatched = false; }, 2000);
    }
};
 
const doRefresh = async (): Promise<void> => {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) {
        // Only dispatch if this was triggered by a real in-session request,
        // not by the initial session-restore check (we do this in skipRefresh below).
        dispatchSessionExpired();
        throw new Error("Session expired, please log in again");
    }
};
 
// Retry with exponential backoff for 429 rate-limit responses
const retryOn429 = async (
    fn: () => Promise<Response>,
    retries = 3,
): Promise<Response> => {
    const res = await fn();
    if (res.status === 429 && retries > 0) {
        const retryAfter = parseInt(res.headers.get("Retry-After") || "1", 10);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return retryOn429(fn, retries - 1);
    }
    return res;
};
 
export interface ApiFetchOptions extends RequestInit {
    // When true, a 401 response is returned as-is instead of triggering the
    // refresh flow. Use this for the initial session-restore GET /user/me call:
    // if there's no cookie, we just want a plain 401 back — we don't want to
    // attempt a refresh (which would also fail) and accidentally dispatch
    // SESSION_EXPIRED_EVENT, which would redirect a freshly-loaded logged-out
    // user to /login even though they never had a session.
    skipRefresh?: boolean;
}

 
const apiFetch = async (endpoint: string, options: ApiFetchOptions = {}): Promise<Response> => {

    const { skipRefresh, ...fetchOptions } = options;
 
    const buildRequest = () =>
        fetch(`${BASE_URL}/${endpoint}`, {
            ...fetchOptions,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                ...fetchOptions.headers,
            },
        });
 
    let res = await retryOn429(buildRequest);
 
    if (res.status !== 401) {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res;
    }
 
    // 401 and caller said "don't try to refresh" — just return the 401
    // so the caller can decide what to do (e.g. UserContext treats it as "not logged in")
    if (skipRefresh) {
        return res;
    }
 
    // 401 during normal usage — attempt token refresh exactly once, shared across concurrent calls
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
 
    res = await buildRequest();
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res;
};
 
export default apiFetch;

// Sanitizes untrusted string inputs from req.query / req.params
// Prevents oversized strings from reaching $text search or DB queries
// we have zod but sometimes we get names in query params

const MAX_SEARCH_LENGTH = 200; // chars — reasonable cap for a movie/user name search

 // Trims whitespace and caps the string at MAX_SEARCH_LENGTH.
 // Returns undefined if the result is empty (so callers can do `if (name)` checks as before).
export const sanitizeString = (value: unknown): string | undefined => {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim().slice(0, MAX_SEARCH_LENGTH);
    return trimmed.length > 0 ? trimmed : undefined;
};


/* TODO: 
    No input sanitization on query params — sanitizeString() exists but only trims. 
    We should stripping regex special chars before passing to $text search.
*/

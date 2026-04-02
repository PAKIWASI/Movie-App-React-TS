import { Request } from "express";

const MIN_PAGE    = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT   = 100;

export interface PaginationParams {
    page:  number;
    limit: number;
    skip:  number;
}

export interface PaginationMeta {
    page:  number;
    limit: number;
    total: number;
    // pages: number;
}

 // Reads ?page and ?limit from a request and returns safe, clamped values
 // plus the skip offset needed for .skip().
export const getPagination = (req: Request): PaginationParams => {
    const page  = Math.max(MIN_PAGE,    parseInt(req.query.page  as string) || MIN_PAGE);
    const limit = Math.min(MAX_LIMIT,   parseInt(req.query.limit as string) || DEFAULT_LIMIT);
    const skip  = (page - 1) * limit;
    return { page, limit, skip };
};

 // Builds the pagination meta object returned in API responses.
export const buildPaginationMeta = (page: number, limit: number, total: number): PaginationMeta => ({
    page,
    limit,
    total
    //pages: Math.ceil(total / limit),
});



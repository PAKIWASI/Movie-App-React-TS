

export interface TMDBmovie {
    adult:             boolean;
    backdrop_path:     string;
    genres:            { id: number; name: string }[];
    id:                number;
    original_language: string;
    original_title:    string;
    overview:          string;
    popularity:        number;
    poster_path:       string;
    release_date:      string;
    title:             string;
    video:             boolean;
    vote_average:      number;
    vote_count:        number;
}

// Full detail response from GET /api/movie/:id
export interface MovieDetail extends TMDBmovie {
    budget:   number;
    revenue:  number;
    runtime:  number;
    tagline:  string;
    status:   string;
    homepage: string;
    imdb_id:  string;
    belongs_to_collection: {
        id:            number;
        name:          string;
        poster_path:   string;
        backdrop_path: string;
    } | null;
    production_companies: {
        id:             number;
        name:           string;
        logo_path:      string | null;
        origin_country: string;
    }[];
    spoken_languages: {
        english_name: string;
        iso_639_1:    string;
        name:         string;
    }[];
}

export interface CastMember {
    id:           number;
    name:         string;
    character:    string;
    profile_path: string | null;
    order:        number;
}

export interface CrewMember {
    id:           number;
    name:         string;
    job:          string;
    department:   string;
    profile_path: string | null;
}

export interface MovieCredits {
    cast: CastMember[];
    crew: CrewMember[];
}

// What GET /api/user/me/movie returns per entry (after aggregation join)
export interface UserMovie {
    tmdbId:      number;
    inFavs:      boolean;
    inWatchlist: boolean;
    watched:     boolean;
    userRating:  number;
    userReview:  string;
    movie?: {
        title:        string;
        poster_path:  string;
        release_date: string;
    };
}

export interface backendResponse {
    success:    boolean;
    data:       TMDBmovie[];
    pagination: {
        page:  number;
        limit: number;
        total: number;
        pages: number;
    };
}

// we have generic collection that contains all saved movies
// favs, watchlist and watched

export interface CollectionFilters {
    inFavs?:      boolean;
    inWatchlist?: boolean;
    watched?:     boolean;
    page?:        number;
    limit?:       number;
}

// TODO: verify approach

// we want the local update to be instant,
// then we post to db
export interface CollectionContextType {
    collection:       UserMovie[];
    // get already loaded local collection
    getEntry: (tmdbId: number) => UserMovie | null;
    // get all favs,watched etc
    getFiltered: (filter: "fav" | "watchlist" | "watched") => UserMovie[];
    // get entire collection from api
    refreshCollection: () => Promise<void>;
    // set locally then post to db
    setAttribute: (tmdbId: number, 
         filter: "fav" | "watchlist" | "watched" | "rating" | "review") => Promise<void>;
}



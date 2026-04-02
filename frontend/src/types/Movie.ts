


export interface TMDBmovie {
    adult:             boolean;
    backdrop_path:     string;
    genres: { 
        id: number
        name: string
    }[];
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
};




export interface backendResponse {
    success:    boolean;
    data:       TMDBmovie[];
    pagination: {
        page:   number;
        limit:  number;
        total:  number;
        pages:  number;
    };
};



// Mirrors your frontend types.ts exactly

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
}

export interface SpokenLanguage {
  english_name: string;
  name: string;
}

// Base movie shape from TMDB list/search results
export interface TMDBmovie {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

// Full movie detail (extends base)
export interface MovieDetails extends TMDBmovie {
  budget?: number;
  homepage?: string;
  runtime?: number;
  revenue?: number;
  tagline?: string;
  genres?: Genre[];
  production_companies?: ProductionCompany[];
  spoken_languages?: SpokenLanguage[];
  status?: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface MovieCredits {
  cast: CastMember[];
  crew: CrewMember[];
}

export interface CompleteMovieDetail {
  movieDetail: MovieDetails | null;
  movieCredits: MovieCredits | null;
}

export interface TMDBresponse {
  page: number;
  results: TMDBmovie[];
  total_pages: number;
  total_results: number;
}



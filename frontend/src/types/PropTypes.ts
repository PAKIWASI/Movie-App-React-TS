import type { TMDBmovie } from "./Movie";




export interface SearchBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    onSubmit: React.FormEventHandler<HTMLFormElement>;
}




export type MovieCardProp = { movie: TMDBmovie };

export type MovieDisplayProp = { movies: TMDBmovie[] };


export interface CollectionPageProps {
    filter: "inFavs" | "inWatchlist";
    title: string;
}

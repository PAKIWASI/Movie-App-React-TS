#! /usr/bin/sh


source ../.env


API_KEY=$VITE_TMDB_API_KEY;
BASE_URL="https://api.themoviedb.org/3"

# popular movies
PAGE=1
curl "$BASE_URL/movie/popular?api_key=$API_KEY&$PAGE=1" | jq

# movie details
ID=1265609
curl "$BASE_URL/movie/$ID?api_key=$API_KEY&language=en-US" | jq

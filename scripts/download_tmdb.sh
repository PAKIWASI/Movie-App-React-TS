#! /usr/bin/sh


source ../.env


API_KEY=$VITE_TMDB_API_KEY;
BASE_URL="https://api.themoviedb.org/3"


curl "$BASE_URL/movie/popular?api_key=$API_KEY&page=1" | jq

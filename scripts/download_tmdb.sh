#! /usr/bin/sh


source ../.env

API_KEY=$VITE_TMDB_API_KEY;
BASE_URL="https://api.themoviedb.org/3"


for PAGE in {1..10} do
    # popular movies pages
    RESPONSE=$(curl -s "$BASE_URL/movie/popular?api_key=$API_KEY&page=$PAGE")
    echo $RESPONSE | jq


    # Get specific id for each movie
    ID=$(echo $RESPONSE | jq '.results[1].id')
    # movie details
    DETAIL=$(curl -s "$BASE_URL/movie/$ID?api_key=$API_KEY&language=en-US")
    echo $DETAIL | jq
done 

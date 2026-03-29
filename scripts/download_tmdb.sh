#!/bin/sh

source ../frontend/.env

API_KEY=$VITE_TMDB_API_KEY
BASE_URL="https://api.themoviedb.org/3"

OUTPUT_FILE="data.json"
CREDIT_FILE="credit_data.json"
TOTAL_PAGES=10

echo "[" > $OUTPUT_FILE
echo "[" > $CREDIT_FILE

FIRST=true

for PAGE in $(seq 1 $TOTAL_PAGES); do

    echo "=== Page $PAGE ==="

    RESPONSE=$(curl -s "$BASE_URL/movie/popular?api_key=$API_KEY&page=$PAGE")

    LENGTH=$(echo "$RESPONSE" | jq '.results | length')

    for i in $(seq 0 $((LENGTH - 1))); do

        ID=$(echo "$RESPONSE" | jq ".results[$i].id")
        echo "--- Movie ID: $ID ---"

        DETAIL=$(curl -s "$BASE_URL/movie/$ID?api_key=$API_KEY&language=en-US")
        CREDITS_RAW=$(curl -s "$BASE_URL/movie/$ID/credits?api_key=$API_KEY")

        CREDITS=$(echo "$CREDITS_RAW" | jq --argjson max 20 --argjson jobs '["Director","Producer","Screenplay","Writer","Director of Photography"]' '{
            id:   .id,
            cast: [ .cast | sort_by(.order) | .[:$max][] | del(.adult, .cast_id, .original_name) ],
            crew: [ .crew[] | select(.job as $j | $jobs | index($j) != null) | del(.adult, .original_name) ]
        }')

        if [ "$FIRST" = true ]; then
            FIRST=false
        else
            echo "," >> $OUTPUT_FILE
            echo "," >> $CREDIT_FILE
        fi

        echo "$DETAIL"  | jq >> $OUTPUT_FILE
        echo "$CREDITS" | jq >> $CREDIT_FILE

    done

done

echo "]" >> $OUTPUT_FILE
echo "]" >> $CREDIT_FILE

jq '.' $OUTPUT_FILE > tmp.json && mv tmp.json $OUTPUT_FILE
jq '.' $CREDIT_FILE > tmp.json && mv tmp.json $CREDIT_FILE

echo "Done! Saved to $OUTPUT_FILE and $CREDIT_FILE"

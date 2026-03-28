#!/bin/sh


source ../frontend/.env

API_KEY=$VITE_TMDB_API_KEY
BASE_URL="https://api.themoviedb.org/3"

OUTPUT_FILE="data.json"
CREDIT_FILE="credit_data.json"
TOTAL_PAGES=1

# Start JSON array
echo "[" > $OUTPUT_FILE
echo "[" > $CREDIT_FILE

FIRST=true

for PAGE in $(seq 1 $TOTAL_PAGES); do

    echo "=== Page $PAGE ==="

    RESPONSE=$(curl -s "$BASE_URL/movie/popular?api_key=$API_KEY&page=$PAGE")

    # Loop over each movie index (0 to 19, TMDB returns 20 per page)
    LENGTH=$(echo "$RESPONSE" | jq '.results | length')

    for i in $(seq 0 $((LENGTH - 1))); do

        ID=$(echo "$RESPONSE" | jq ".results[$i].id")
        echo "--- Movie ID: $ID ---"

        DETAIL=$(curl -s "$BASE_URL/movie/$ID?api_key=$API_KEY&language=en-US")
        CREDITS=$(curl -s "$BASE_URL/movie/$ID?api_key=$API_KEY&")

        # Add comma between items (not before the first)
        if [ "$FIRST" = true ]; then
            FIRST=false
        else
            echo "," >> $OUTPUT_FILE
            echo "," >> $CREDIT_FILE
        fi

        echo "$DETAIL" | jq >> $OUTPUT_FILE 
        echo "$CREDITS" | jq >> $CREDIT_FILE 

    done

done

# Close JSON array
echo "]" >> $OUTPUT_FILE
echo "]" >> $CREDIT_FILE

# format
jq '.' $OUTPUT_FILE > tmp.json && mv tmp.json $OUTPUT_FILE
jq '.' $CREDIT_FILE > tmp.json && mv tmp.json $CREDIT_FILE

echo "Done! Saved to $OUTPUT_FILE"



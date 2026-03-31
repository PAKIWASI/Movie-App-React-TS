#!/bin/bash
# ─────────────────────────────────────────────
#  Movie App API — full test suite (HTTPie)
# ─────────────────────────────────────────────

BASE_URL="http://localhost:5000"

# ─── session files (httpie stores cookies here) ───────────────────────────────
SESSION_USER="./session_user.json"
SESSION_ADMIN="./session_admin.json"
rm -f "$SESSION_USER" "$SESSION_ADMIN"

# ─── colours ──────────────────────────────────────────────────────────────────
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
RESET="\033[0m"

# ─── helpers ──────────────────────────────────────────────────────────────────
PASS=0
FAIL=0

pass() { echo -e "${GREEN}  ✓ $1${RESET}"; ((PASS++)); }
fail() { echo -e "${RED}  ✗ $1${RESET}"; ((FAIL++)); }
section() { echo -e "\n${CYAN}━━━  $1  ━━━${RESET}"; }

# Run httpie, store response in $RESP
# Usage: req <session_file|none> <method> <path> [httpie args...]
req() {
    local session="$1"; shift
    local method="$1";  shift
    local path="$1";    shift

    if [[ "$session" == "none" ]]; then
        RESP=$(http \
            "$method" "${BASE_URL}${path}" "$@" 2>/dev/null)
    else
        RESP=$(http \
            --session="$session" \
            "$method" "${BASE_URL}${path}" "$@" 2>/dev/null)
    fi
}

# Assert jq expression is truthy against $RESP
assert() {
    local label="$1"
    local jq_expr="$2"
    local result
    result=$(echo "$RESP" | jq -e "$jq_expr" 2>/dev/null)
    if [[ $? -eq 0 && "$result" != "false" && "$result" != "null" ]]; then
        pass "$label"
    else
        fail "$label — got: $(echo "$RESP" | jq -c '.' 2>/dev/null || echo "$RESP")"
    fi
}

# Save a jq value from $RESP into a variable
# Usage: extract VAR_NAME '.data._id'
extract() {
    local var="$1"
    local jq_expr="$2"
    local val
    val=$(echo "$RESP" | jq -r "$jq_expr" 2>/dev/null)
    eval "$var=\"$val\""
}


# ══════════════════════════════════════════════════════════════════════════════
section "Health check"
# ══════════════════════════════════════════════════════════════════════════════

req none GET "/"
assert "server is up" '.message == "Backend is running"'


# ══════════════════════════════════════════════════════════════════════════════
section "Movies — public endpoints (no auth)"
# ══════════════════════════════════════════════════════════════════════════════

req none GET "/api/movie?limit=2"
assert "GET /api/movie returns success"        '.success == true'
assert "pagination object present"             '.pagination | has("total")'
assert "returns at most 2 movies"              '(.data | length) <= 2'

# Grab first real TMDB id from the DB so the rest of the tests use a real movie
extract TMDB_ID '.data[0].id'
extract MOVIE_TITLE '.data[0].title'
echo -e "   → using movie: ${YELLOW}$MOVIE_TITLE${RESET} (tmdbId: $TMDB_ID)"

req none GET "/api/movie/$TMDB_ID"
assert "GET /api/movie/:id returns correct movie" '.data.id == '"$TMDB_ID"''

req none GET "/api/movie/$TMDB_ID/credits"
assert "GET /api/movie/:id/credits returns cast array" '(.data.cast | type) == "array"'

req none GET "/api/movie?name=the"
assert "GET /api/movie?name= text search works" '.success == true'

req none GET "/api/movie?page=1&limit=5"
assert "pagination: page + limit params respected" '.pagination.limit == 5'


# ══════════════════════════════════════════════════════════════════════════════
section "Auth — register"
# ══════════════════════════════════════════════════════════════════════════════

req none POST "/api/auth/register" \
    name="Test User" \
    age:=25 \
    email="testuser_$$@example.com" \
    password="Password123!"

assert "register: success true"          '.success == true'
assert "register: user has _id"          '.data | has("_id")'
assert "register: password not returned" '.data | has("password") | not'
extract USER_ID '.data._id'
USER_EMAIL="testuser_$$@example.com"
echo -e "   → registered user id: ${YELLOW}$USER_ID${RESET}"

# duplicate email
req none POST "/api/auth/register" \
    name="Test User" age:=25 \
    email="$USER_EMAIL" \
    password="Password123!"
assert "register: duplicate email → 409" '.success == false'


# ══════════════════════════════════════════════════════════════════════════════
section "Auth — login (user session)"
# ══════════════════════════════════════════════════════════════════════════════

req "$SESSION_USER" POST "/api/auth/login" \
    email="$USER_EMAIL" \
    password="Password123!"
assert "login: success true"  '.success == true'

req "$SESSION_USER" POST "/api/auth/login" \
    email="$USER_EMAIL" \
    password="WrongPassword"
assert "login: wrong password → 400" '.message == "Invalid credentials"'

req "$SESSION_USER" POST "/api/auth/login" \
    email="nobody@nowhere.com" \
    password="Password123!"
assert "login: unknown email → 400" '.message == "Invalid credentials"'

# re-login correctly so the session cookie is valid for the rest of the tests
req "$SESSION_USER" POST "/api/auth/login" \
    email="$USER_EMAIL" \
    password="Password123!"


# ══════════════════════════════════════════════════════════════════════════════
section "User — own account"
# ══════════════════════════════════════════════════════════════════════════════

req "$SESSION_USER" GET "/api/user/me"
assert "GET /user/me: returns own user"    '.success == true'
assert "GET /user/me: no password in resp" '.data | has("password") | not'

req "$SESSION_USER" PUT "/api/user/me" \
    name="Updated Name" \
    age:=26 \
    email="$USER_EMAIL"
assert "PUT /user/me: name updated" '.data.name == "Updated Name"'

# unauthenticated request should be blocked
req none GET "/api/user/me"
assert "GET /user/me: no token → 401" '.message | test("denied|token"; "i")'


# ══════════════════════════════════════════════════════════════════════════════
section "UserMovie — add / query / update / toggle / delete"
# ══════════════════════════════════════════════════════════════════════════════

req "$SESSION_USER" POST "/api/user/me/movie" \
    tmdbId:="$TMDB_ID"
assert "POST /user/me/movie: created"          '.success == true'
assert "POST /user/me/movie: tmdbId correct"   ".data.tmdbId == $TMDB_ID"
assert "POST /user/me/movie: defaults false"   '.data.inFavs == false and .data.inWatchlist == false'

# duplicate
req "$SESSION_USER" POST "/api/user/me/movie" \
    tmdbId:="$TMDB_ID"
assert "POST duplicate UserMovie → 409" '.success == false'

req "$SESSION_USER" GET "/api/user/me/movie"
assert "GET /user/me/movie: returns array"  '(.data | type) == "array"'
assert "GET /user/me/movie: movie embedded" '.data[0] | has("movie")'

req "$SESSION_USER" GET "/api/user/me/movie?tmdbId=$TMDB_ID"
assert "GET /user/me/movie?tmdbId= filter works" ".data[0].tmdbId == $TMDB_ID"

req "$SESSION_USER" GET "/api/user/me/movie?inFavs=false"
assert "GET /user/me/movie?inFavs= filter works" '.success == true'

# toggles
req "$SESSION_USER" PATCH "/api/user/me/movie/$TMDB_ID/watchlist"
assert "PATCH watchlist: toggled to true"  '.data.inWatchlist == true'

req "$SESSION_USER" PATCH "/api/user/me/movie/$TMDB_ID/watchlist"
assert "PATCH watchlist: toggled back to false" '.data.inWatchlist == false'

req "$SESSION_USER" PATCH "/api/user/me/movie/$TMDB_ID/favorites"
assert "PATCH favorites: toggled to true" '.data.inFavs == true'

req "$SESSION_USER" PATCH "/api/user/me/movie/$TMDB_ID/watched"
assert "PATCH watched: toggled to true" '.data.watched == true'

# rating
req "$SESSION_USER" PATCH "/api/user/me/movie/$TMDB_ID/rating" \
    userRating:=8
assert "PATCH rating: set to 8" '.data.userRating == 8'

req "$SESSION_USER" PATCH "/api/user/me/movie/$TMDB_ID/rating" \
    userRating:=11
assert "PATCH rating: out of range → 400" '.success == false'

# review
req "$SESSION_USER" PATCH "/api/user/me/movie/$TMDB_ID/review" \
    userReview="Great movie, loved it"
assert "PATCH review: text saved" '.data.userReview == "Great movie, loved it"'

# full update
req "$SESSION_USER" PUT "/api/user/me/movie/$TMDB_ID" \
    inFavs:=false \
    watched:=false \
    userRating:=7
assert "PUT /user/me/movie/:tmdbId: updated" '.data.userRating == 7'

# nonexistent movie
req "$SESSION_USER" PATCH "/api/user/me/movie/9999999/watchlist"
assert "PATCH nonexistent UserMovie → 404" '.success == false'

# delete
req "$SESSION_USER" DELETE "/api/user/me/movie/$TMDB_ID"
assert "DELETE /user/me/movie/:tmdbId: deleted" '.success == true'

req "$SESSION_USER" DELETE "/api/user/me/movie/$TMDB_ID"
assert "DELETE already-deleted → 404" '.success == false'


# ══════════════════════════════════════════════════════════════════════════════
section "Admin — login with real admin account"
# ══════════════════════════════════════════════════════════════════════════════

req "$SESSION_ADMIN" POST "/api/auth/login" \
    email="ullahwasi@gmail.com" \
    password="ilovefun"
assert "admin login: success" '.success == true'

# Verify admin rights
req "$SESSION_ADMIN" GET "/api/auth/admin"
assert "admin: can access admin list"  '.success == true'
assert "admin: returns array"          '(.data | type) == "array"'

# non-admin cannot access admin routes
req "$SESSION_USER" GET "/api/auth/admin"
assert "non-admin blocked from /auth/admin → 403" '.success == false'

req "$SESSION_USER" POST "/api/auth/admin/000000000000000000000001"
assert "non-admin cannot call makeAdmin → 403" '.success == false'

# promote the test user registered earlier
req "$SESSION_ADMIN" POST "/api/auth/admin/$USER_ID"
assert "makeAdmin: promoted test user" '.success == true'

req "$SESSION_ADMIN" GET "/api/auth/admin/$USER_ID"
assert "getAdmin: promoted user is found" '.success == true'

# duplicate promote
req "$SESSION_ADMIN" POST "/api/auth/admin/$USER_ID"
assert "makeAdmin: duplicate → 409" '.success == false'

# register a second test user to verify admin can see all users
ADMIN_CANDIDATE_EMAIL="newadmin_$$@example.com"
req none POST "/api/auth/register" \
    name="New Admin Candidate" age:=28 \
    email="$ADMIN_CANDIDATE_EMAIL" \
    password="AdminPass123!"
assert "register second test user" '.success == true'
extract ADMIN_CANDIDATE_ID '.data._id'
echo -e "   → second test user id: ${YELLOW}$ADMIN_CANDIDATE_ID${RESET}"

req "$SESSION_ADMIN" POST "/api/auth/admin/$ADMIN_CANDIDATE_ID"
assert "makeAdmin: promote second user" '.success == true'


# ══════════════════════════════════════════════════════════════════════════════
section "Admin — movie write routes"
# ══════════════════════════════════════════════════════════════════════════════

req "$SESSION_ADMIN" POST "/api/movie" \
    adult:=false \
    backdrop_path='"/backdrops/test.jpg"' \
    budget:=1000000 \
    genres:='[{"id":28,"name":"Action"}]' \
    id:=999999901 \
    origin_country:='["US"]' \
    original_language='"en"' \
    original_title='"Test Movie One"' \
    overview='"A test movie for API validation purposes."' \
    popularity:=10.5 \
    poster_path='"/posters/test.jpg"' \
    production_companies:='[]' \
    production_countries:='[]' \
    release_date='"2024-01-01"' \
    revenue:=0 \
    runtime:=90 \
    spoken_languages:='[]' \
    status='"Released"' \
    title='"Test Movie One"' \
    video:=false \
    vote_average:=7.0 \
    vote_count:=100
assert "POST /movie: created"    '.success == true'
assert "POST /movie: id correct" '.data.id == 999999901'

# non-admin cannot POST movie
req "$SESSION_USER" POST "/api/movie" \
    adult:=false backdrop_path='"/b.jpg"' budget:=0 \
    genres:='[]' id:=999999902 origin_country:='["US"]' \
    original_language='"en"' original_title='"Unauth"' \
    overview='"should fail"' popularity:=1.0 poster_path='"/p.jpg"' \
    production_companies:='[]' production_countries:='[]' \
    release_date='"2024-01-01"' revenue:=0 runtime:=90 \
    spoken_languages:='[]' status='"Released"' title='"Unauth"' \
    video:=false vote_average:=1.0 vote_count:=1
assert "POST /movie: non-admin blocked → 403" '.success == false'

# duplicate
req "$SESSION_ADMIN" POST "/api/movie" \
    adult:=false backdrop_path='"/b.jpg"' budget:=0 \
    genres:='[]' id:=999999901 origin_country:='["US"]' \
    original_language='"en"' original_title='"Dupe"' \
    overview='"dupe"' popularity:=1.0 poster_path='"/p.jpg"' \
    production_companies:='[]' production_countries:='[]' \
    release_date='"2024-01-01"' revenue:=0 runtime:=90 \
    spoken_languages:='[]' status='"Released"' title='"Dupe"' \
    video:=false vote_average:=1.0 vote_count:=1
assert "POST /movie: duplicate tmdbId → 409" '.success == false'

req "$SESSION_ADMIN" PUT "/api/movie/999999901" \
    vote_average:=8.5
assert "PUT /movie/:id: vote_average updated" '.data.vote_average == 8.5'

req "$SESSION_ADMIN" PUT "/api/movie/999999901" \
    title="Updated Title"
assert "PUT /movie/:id: title updated" '.data.title == "Updated Title"'

req "$SESSION_ADMIN" PUT "/api/movie/9999999" \
    title='"Ghost"'
assert "PUT /movie/:id: not found → 404" '.success == false'

req "$SESSION_ADMIN" GET "/api/user"
assert "GET /api/user: admin can list all users" '.success == true'
assert "GET /api/user: returns array"            '(.data | type) == "array"'

req "$SESSION_ADMIN" DELETE "/api/movie/999999901"
assert "DELETE /movie/:id: deleted" '.success == true'

req "$SESSION_ADMIN" DELETE "/api/movie/999999901"
assert "DELETE /movie/:id: already gone → 404" '.success == false'


# ══════════════════════════════════════════════════════════════════════════════
section "Cleanup — delete test users"
# ══════════════════════════════════════════════════════════════════════════════

req "$SESSION_USER" DELETE "/api/user/me"
assert "DELETE /user/me: test user deleted" '.success == true'

# clean up the second test user via its own session
SESSION_CANDIDATE="./session_candidate.json"
req "$SESSION_CANDIDATE" POST "/api/auth/login" \
    email="$ADMIN_CANDIDATE_EMAIL" \
    password="AdminPass123!"
req "$SESSION_CANDIDATE" DELETE "/api/user/me"
assert "DELETE /user/me: second test user deleted" '.success == true'
rm -f "$SESSION_CANDIDATE"

# TODO: test-created admins not deleted


# ══════════════════════════════════════════════════════════════════════════════
section "Error handlers"
# ══════════════════════════════════════════════════════════════════════════════

req none GET "/api/route/that/does/not/exist"
assert "404 handler: unknown route" '.success == false'


# ══════════════════════════════════════════════════════════════════════════════
echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e " Results:  ${GREEN}$PASS passed${RESET}  |  ${RED}$FAIL failed${RESET}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

rm -f "$SESSION_USER" "$SESSION_ADMIN"

[[ $FAIL -eq 0 ]] && exit 0 || exit 1

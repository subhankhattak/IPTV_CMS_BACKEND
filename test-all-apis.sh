#!/bin/bash

# IPTV Backend API Test Suite
# This script tests all APIs and creates example data

BASE_URL="http://localhost:3004"
TOKEN=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to make authenticated requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    print_status "Testing: $description"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "accept: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "accept: application/json" \
            -H "Authorization: Bearer $TOKEN")
    fi
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    # Extract response body (all lines except last)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" -ge 200 ] && [ "$status_code" -lt 300 ]; then
        print_success "✅ $description - Status: $status_code"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_error "❌ $description - Status: $status_code"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
    echo ""
}

# Function to extract ID from response
extract_id() {
    echo "$1" | jq -r '.data.id' 2>/dev/null
}

# Function to extract IDs from array response
extract_ids() {
    echo "$1" | jq -r '.data[].id' 2>/dev/null
}

# Step 1: Authentication
print_status "=== STEP 1: AUTHENTICATION ==="
auth_response=$(curl -s -X 'POST' "$BASE_URL/auth/login" \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{"email": "superAdmin@example.com", "password": "Pass@123"}')

TOKEN=$(echo "$auth_response" | jq -r '.data.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    print_error "Failed to get authentication token"
    echo "$auth_response"
    exit 1
fi

print_success "Authentication successful - Token obtained"
echo ""

# Step 2: Test Users API
print_status "=== STEP 2: USERS API ==="

# Get all users
make_request "GET" "/users" "" "Get all users"

# Create a new user
user_data='{
  "user_name": "Test User",
  "phone_number": "9876543211",
  "email": "test.user@example.com",
  "password": "password123",
  "user_type": "ADMIN",
  "active": true
}'

user_response=$(curl -s -X 'POST' "$BASE_URL/users" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$user_data")

user_id=$(extract_id "$user_response")
print_status "Created user with ID: $user_id"

# Get specific user
if [ -n "$user_id" ] && [ "$user_id" != "null" ]; then
    make_request "GET" "/users/$user_id" "" "Get specific user"
fi

echo ""

# Step 3: Test Applications API
print_status "=== STEP 3: APPLICATIONS API ==="

# Get all applications
make_request "GET" "/applications" "" "Get all applications"

# Create application 1
app1_data='{
  "name": "IPTV App Pro",
  "logo_path": "https://example.com/logo-pro.png",
  "user_agent": "IPTVApp/1.0 (iOS; iPhone; Version 15.0)",
  "description": "Premium IPTV application with advanced features",
  "theme": "dark",
  "color_scheme": "#1a1a1a,#ffffff,#007bff",
  "status": true
}'

app1_response=$(curl -s -X 'POST' "$BASE_URL/applications" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$app1_data")

app1_id=$(extract_id "$app1_response")
print_status "Created application 1 with ID: $app1_id"

# Create application 2
app2_data='{
  "name": "IPTV App Lite",
  "logo_path": "https://example.com/logo-lite.png",
  "user_agent": "IPTVApp/2.0 (Android; Samsung; Version 12.0)",
  "description": "Lightweight IPTV application",
  "theme": "light",
  "color_scheme": "#ffffff,#000000,#ff6b35",
  "status": true
}'

app2_response=$(curl -s -X 'POST' "$BASE_URL/applications" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$app2_data")

app2_id=$(extract_id "$app2_response")
print_status "Created application 2 with ID: $app2_id"

# Get specific application
if [ -n "$app1_id" ] && [ "$app1_id" != "null" ]; then
    make_request "GET" "/applications/$app1_id" "" "Get specific application"
fi

echo ""

# Step 4: Test Categories API
print_status "=== STEP 4: CATEGORIES API ==="

# Get all categories
make_request "GET" "/categories" "" "Get all categories"

# Create category 1
cat1_data='{
  "name": "Movies",
  "description": "Movie content category",
  "order": 1,
  "status": true
}'

cat1_response=$(curl -s -X 'POST' "$BASE_URL/categories" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$cat1_data")

cat1_id=$(extract_id "$cat1_response")
print_status "Created category 1 with ID: $cat1_id"

# Create category 2
cat2_data='{
  "name": "TV Shows",
  "description": "TV series and shows category",
  "order": 2,
  "status": true
}'

cat2_response=$(curl -s -X 'POST' "$BASE_URL/categories" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$cat2_data")

cat2_id=$(extract_id "$cat2_response")
print_status "Created category 2 with ID: $cat2_id"

# Get specific category
if [ -n "$cat1_id" ] && [ "$cat1_id" != "null" ]; then
    make_request "GET" "/categories/$cat1_id" "" "Get specific category"
fi

echo ""

# Step 5: Test Sub-Categories API
print_status "=== STEP 5: SUB-CATEGORIES API ==="

# Get all sub-categories
make_request "GET" "/sub-categories" "" "Get all sub-categories"

# Create sub-category 1
subcat1_data='{
  "name": "Action Movies",
  "description": "Action and adventure movies",
  "category_id": "'$cat1_id'",
  "order": 1,
  "status": true
}'

subcat1_response=$(curl -s -X 'POST' "$BASE_URL/sub-categories" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$subcat1_data")

subcat1_id=$(extract_id "$subcat1_response")
print_status "Created sub-category 1 with ID: $subcat1_id"

# Create sub-category 2
subcat2_data='{
  "name": "Drama Series",
  "description": "Drama TV series",
  "category_id": "'$cat2_id'",
  "order": 1,
  "status": true
}'

subcat2_response=$(curl -s -X 'POST' "$BASE_URL/sub-categories" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$subcat2_data")

subcat2_id=$(extract_id "$subcat2_response")
print_status "Created sub-category 2 with ID: $subcat2_id"

# Get specific sub-category
if [ -n "$subcat1_id" ] && [ "$subcat1_id" != "null" ]; then
    make_request "GET" "/sub-categories/$subcat1_id" "" "Get specific sub-category"
fi

echo ""

# Step 6: Test Application-Categories API
print_status "=== STEP 6: APPLICATION-CATEGORIES API ==="

# Get all application-categories
make_request "GET" "/application-categories" "" "Get all application-categories"

# Create application-category relationship
appcat_data='{
  "application_id": "'$app1_id'",
  "category_id": "'$cat1_id'",
  "alias": "Movies in App Pro",
  "order": 1,
  "status": true
}'

appcat_response=$(curl -s -X 'POST' "$BASE_URL/application-categories" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$appcat_data")

appcat_id=$(extract_id "$appcat_response")
print_status "Created application-category with ID: $appcat_id"

# Get categories by application
if [ -n "$app1_id" ] && [ "$app1_id" != "null" ]; then
    make_request "GET" "/application-categories/application/$app1_id" "" "Get categories by application"
fi

# Get applications by category
if [ -n "$cat1_id" ] && [ "$cat1_id" != "null" ]; then
    make_request "GET" "/application-categories/category/$cat1_id" "" "Get applications by category"
fi

echo ""

# Step 7: Test Bouquets API
print_status "=== STEP 7: BOUQUETS API ==="

# Get all bouquets
make_request "GET" "/bouquets" "" "Get all bouquets"

# Create bouquet 1
bouquet1_data='{
  "name": "Premium Package",
  "description": "Premium content package with movies and TV shows",
  "price": 29.99,
  "duration_days": 30,
  "status": true
}'

bouquet1_response=$(curl -s -X 'POST' "$BASE_URL/bouquets" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$bouquet1_data")

bouquet1_id=$(extract_id "$bouquet1_response")
print_status "Created bouquet 1 with ID: $bouquet1_id"

# Create bouquet 2
bouquet2_data='{
  "name": "Basic Package",
  "description": "Basic content package",
  "price": 9.99,
  "duration_days": 30,
  "status": true
}'

bouquet2_response=$(curl -s -X 'POST' "$BASE_URL/bouquets" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$bouquet2_data")

bouquet2_id=$(extract_id "$bouquet2_response")
print_status "Created bouquet 2 with ID: $bouquet2_id"

# Get specific bouquet
if [ -n "$bouquet1_id" ] && [ "$bouquet1_id" != "null" ]; then
    make_request "GET" "/bouquets/$bouquet1_id" "" "Get specific bouquet"
fi

echo ""

# Step 8: Test Movies API
print_status "=== STEP 8: MOVIES API ==="

# Get all movies
make_request "GET" "/movies" "" "Get all movies"

# Create movie 1
movie1_data='{
  "original_name": "The Matrix",
  "show_app_name": "The Matrix (1999)",
  "description": "A computer hacker learns from mysterious rebels about the true nature of his reality",
  "cover_url": "https://example.com/matrix-cover.jpg",
  "genres": "Action, Sci-Fi",
  "cast": "Keanu Reeves, Laurence Fishburne",
  "director": "Lana Wachowski, Lilly Wachowski",
  "release_date": "1999-03-31",
  "language": "English",
  "duration": 136,
  "quality": "HD",
  "resolution": "1080p",
  "status": "ACTIVE"
}'

movie1_response=$(curl -s -X 'POST' "$BASE_URL/movies" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$movie1_data")

movie1_id=$(extract_id "$movie1_response")
print_status "Created movie 1 with ID: $movie1_id"

# Create movie 2
movie2_data='{
  "original_name": "Inception",
  "show_app_name": "Inception (2010)",
  "description": "A thief who steals corporate secrets through dream-sharing technology",
  "cover_url": "https://example.com/inception-cover.jpg",
  "genres": "Action, Adventure, Sci-Fi",
  "cast": "Leonardo DiCaprio, Joseph Gordon-Levitt",
  "director": "Christopher Nolan",
  "release_date": "2010-07-16",
  "language": "English",
  "duration": 148,
  "quality": "HD",
  "resolution": "1080p",
  "status": "ACTIVE"
}'

movie2_response=$(curl -s -X 'POST' "$BASE_URL/movies" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$movie2_data")

movie2_id=$(extract_id "$movie2_response")
print_status "Created movie 2 with ID: $movie2_id"

# Get specific movie
if [ -n "$movie1_id" ] && [ "$movie1_id" != "null" ]; then
    make_request "GET" "/movies/$movie1_id" "" "Get specific movie"
fi

echo ""

# Step 9: Test Series API
print_status "=== STEP 9: SERIES API ==="

# Get all series
make_request "GET" "/series" "" "Get all series"

# Create series 1
series1_data='{
  "original_name": "Breaking Bad",
  "show_app_name": "Breaking Bad (2008)",
  "description": "A high school chemistry teacher turned methamphetamine manufacturer",
  "cover_url": "https://example.com/breaking-bad-cover.jpg",
  "genres": "Crime, Drama",
  "cast": "Bryan Cranston, Aaron Paul",
  "director": "Vince Gilligan",
  "release_date": "2008-01-20",
  "language": "English",
  "quality": "HD",
  "resolution": "1080p",
  "status": "ACTIVE"
}'

series1_response=$(curl -s -X 'POST' "$BASE_URL/series" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$series1_data")

series1_id=$(extract_id "$series1_response")
print_status "Created series 1 with ID: $series1_id"

# Create series 2
series2_data='{
  "original_name": "Game of Thrones",
  "show_app_name": "Game of Thrones (2011)",
  "description": "Nine noble families fight for control over the lands of Westeros",
  "cover_url": "https://example.com/got-cover.jpg",
  "genres": "Action, Adventure, Drama",
  "cast": "Peter Dinklage, Lena Headey",
  "director": "David Benioff, D.B. Weiss",
  "release_date": "2011-04-17",
  "language": "English",
  "quality": "HD",
  "resolution": "1080p",
  "status": "ACTIVE"
}'

series2_response=$(curl -s -X 'POST' "$BASE_URL/series" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$series2_data")

series2_id=$(extract_id "$series2_response")
print_status "Created series 2 with ID: $series2_id"

# Get specific series
if [ -n "$series1_id" ] && [ "$series1_id" != "null" ]; then
    make_request "GET" "/series/$series1_id" "" "Get specific series"
fi

echo ""

# Step 10: Test Dramas API
print_status "=== STEP 10: DRAMAS API ==="

# Get all dramas
make_request "GET" "/dramas" "" "Get all dramas"

# Create drama 1
drama1_data='{
  "original_name": "Descendants of the Sun",
  "show_app_name": "Descendants of the Sun (2016)",
  "description": "A love story between a soldier and a doctor",
  "cover_url": "https://example.com/dots-cover.jpg",
  "genres": "Romance, Drama",
  "cast": "Song Joong-ki, Song Hye-kyo",
  "director": "Lee Eung-bok",
  "release_date": "2016-02-24",
  "language": "Korean",
  "quality": "HD",
  "resolution": "1080p",
  "status": "ACTIVE"
}'

drama1_response=$(curl -s -X 'POST' "$BASE_URL/dramas" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$drama1_data")

drama1_id=$(extract_id "$drama1_response")
print_status "Created drama 1 with ID: $drama1_id"

# Create drama 2
drama2_data='{
  "original_name": "Goblin",
  "show_app_name": "Goblin (2016)",
  "description": "A modern-day goblin and a grim reaper",
  "cover_url": "https://example.com/goblin-cover.jpg",
  "genres": "Fantasy, Romance",
  "cast": "Gong Yoo, Kim Go-eun",
  "director": "Lee Eung-bok",
  "release_date": "2016-12-02",
  "language": "Korean",
  "quality": "HD",
  "resolution": "1080p",
  "status": "ACTIVE"
}'

drama2_response=$(curl -s -X 'POST' "$BASE_URL/dramas" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$drama2_data")

drama2_id=$(extract_id "$drama2_response")
print_status "Created drama 2 with ID: $drama2_id"

# Get specific drama
if [ -n "$drama1_id" ] && [ "$drama1_id" != "null" ]; then
    make_request "GET" "/dramas/$drama1_id" "" "Get specific drama"
fi

echo ""

# Step 11: Test Streams API
print_status "=== STEP 11: STREAMS API ==="

# Get all streams
make_request "GET" "/streams" "" "Get all streams"

# Create stream 1
stream1_data='{
  "name": "Movie Stream 1",
  "description": "High quality movie stream",
  "stream_url": "https://example.com/stream1.m3u8",
  "quality": "HD",
  "resolution": "1080p",
  "status": "ACTIVE"
}'

stream1_response=$(curl -s -X 'POST' "$BASE_URL/streams" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$stream1_data")

stream1_id=$(extract_id "$stream1_response")
print_status "Created stream 1 with ID: $stream1_id"

# Create stream 2
stream2_data='{
  "name": "TV Stream 1",
  "description": "Live TV stream",
  "stream_url": "https://example.com/tv-stream.m3u8",
  "quality": "HD",
  "resolution": "720p",
  "status": "ACTIVE"
}'

stream2_response=$(curl -s -X 'POST' "$BASE_URL/streams" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$stream2_data")

stream2_id=$(extract_id "$stream2_response")
print_status "Created stream 2 with ID: $stream2_id"

# Get specific stream
if [ -n "$stream1_id" ] && [ "$stream1_id" != "null" ]; then
    make_request "GET" "/streams/$stream1_id" "" "Get specific stream"
fi

echo ""

# Step 12: Test Radios API
print_status "=== STEP 12: RADIOS API ==="

# Get all radios
make_request "GET" "/radios" "" "Get all radios"

# Create radio 1
radio1_data='{
  "original_name": "Radio One",
  "show_app_name": "Radio One - Pop Hits",
  "description": "Popular music radio station",
  "cover_url": "https://example.com/radio1-cover.jpg",
  "stream_url": "https://example.com/radio1-stream.m3u8",
  "quality": "HD",
  "status": "ACTIVE"
}'

radio1_response=$(curl -s -X 'POST' "$BASE_URL/radios" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$radio1_data")

radio1_id=$(extract_id "$radio1_response")
print_status "Created radio 1 with ID: $radio1_id"

# Create radio 2
radio2_data='{
  "original_name": "Radio Two",
  "show_app_name": "Radio Two - News",
  "description": "News and talk radio station",
  "cover_url": "https://example.com/radio2-cover.jpg",
  "stream_url": "https://example.com/radio2-stream.m3u8",
  "quality": "HD",
  "status": "ACTIVE"
}'

radio2_response=$(curl -s -X 'POST' "$BASE_URL/radios" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$radio2_data")

radio2_id=$(extract_id "$radio2_response")
print_status "Created radio 2 with ID: $radio2_id"

# Get specific radio
if [ -n "$radio1_id" ] && [ "$radio1_id" != "null" ]; then
    make_request "GET" "/radios/$radio1_id" "" "Get specific radio"
fi

echo ""

# Step 13: Test Bulk Operations
print_status "=== STEP 13: BULK OPERATIONS ==="

# Test bulk delete applications
if [ -n "$app1_id" ] && [ -n "$app2_id" ]; then
    bulk_delete_data='{
      "ids": ["'$app1_id'", "'$app2_id'"]
    }'
    make_request "DELETE" "/applications/bulk" "$bulk_delete_data" "Bulk delete applications"
fi

# Test bulk delete movies
if [ -n "$movie1_id" ] && [ -n "$movie2_id" ]; then
    bulk_delete_data='{
      "ids": ["'$movie1_id'", "'$movie2_id'"]
    }'
    make_request "DELETE" "/movies/bulk" "$bulk_delete_data" "Bulk delete movies"
fi

# Test bulk delete series
if [ -n "$series1_id" ] && [ -n "$series2_id" ]; then
    bulk_delete_data='{
      "ids": ["'$series1_id'", "'$series2_id'"]
    }'
    make_request "DELETE" "/series/bulk" "$bulk_delete_data" "Bulk delete series"
fi

echo ""

# Step 14: Final Summary
print_status "=== STEP 14: FINAL SUMMARY ==="

print_status "Testing all GET endpoints to verify data..."

# Test all GET endpoints
make_request "GET" "/users" "" "Final - Get all users"
make_request "GET" "/applications" "" "Final - Get all applications"
make_request "GET" "/categories" "" "Final - Get all categories"
make_request "GET" "/sub-categories" "" "Final - Get all sub-categories"
make_request "GET" "/application-categories" "" "Final - Get all application-categories"
make_request "GET" "/bouquets" "" "Final - Get all bouquets"
make_request "GET" "/movies" "" "Final - Get all movies"
make_request "GET" "/series" "" "Final - Get all series"
make_request "GET" "/dramas" "" "Final - Get all dramas"
make_request "GET" "/streams" "" "Final - Get all streams"
make_request "GET" "/radios" "" "Final - Get all radios"

print_success "🎉 All API tests completed!"
print_status "Check the output above for any errors or issues."

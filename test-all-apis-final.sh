#!/bin/bash

# IPTV Backend API Test Suite - Final Version
# This script tests all APIs with correct DTO structures

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
  "user_name": "Test User Final",
  "phone_number": "9876543212",
  "email": "test.user.final@example.com",
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
  "name": "IPTV App Final",
  "logo_path": "https://example.com/logo-final.png",
  "user_agent": "IPTVApp/3.0 (iOS; iPhone; Version 16.0)",
  "description": "Final test IPTV application",
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
  "original_name": "Action Movies Final",
  "use_for": ["movie", "vod"],
  "show_name_on_application": "Action Final",
  "order": 10,
  "status": true
}'

cat1_response=$(curl -s -X 'POST' "$BASE_URL/categories" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$cat1_data")

cat1_id=$(extract_id "$cat1_response")
print_status "Created category 1 with ID: $cat1_id"

# Get specific category
if [ -n "$cat1_id" ] && [ "$cat1_id" != "null" ]; then
    make_request "GET" "/categories/$cat1_id" "" "Get specific category"
fi

echo ""

# Step 5: Test Sub-Categories API
print_status "=== STEP 5: SUB-CATEGORIES API ==="

# Get all sub-categories
make_request "GET" "/sub-categories" "" "Get all sub-categories"

# Create sub-category 1 (only if category 1 was created successfully)
if [ -n "$cat1_id" ] && [ "$cat1_id" != "null" ]; then
    subcat1_data='{
      "original_name": "Action Thriller Final",
      "category_id": "'$cat1_id'",
      "show_name_on_application": "Thriller Final",
      "description": "High-intensity action thriller movies final",
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

    # Get specific sub-category
    if [ -n "$subcat1_id" ] && [ "$subcat1_id" != "null" ]; then
        make_request "GET" "/sub-categories/$subcat1_id" "" "Get specific sub-category"
    fi
else
    print_warning "Skipping sub-category creation - no valid category ID"
fi

echo ""

# Step 6: Test Application-Categories API
print_status "=== STEP 6: APPLICATION-CATEGORIES API ==="

# Get all application-categories
make_request "GET" "/application-categories" "" "Get all application-categories"

# Create application-category relationship (only if both app and category were created)
if [ -n "$app1_id" ] && [ "$app1_id" != "null" ] && [ -n "$cat1_id" ] && [ "$cat1_id" != "null" ]; then
    appcat_data='{
      "application_id": "'$app1_id'",
      "category_id": "'$cat1_id'",
      "alias": "Movies in App Final",
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
    make_request "GET" "/application-categories/application/$app1_id" "" "Get categories by application"

    # Get applications by category
    make_request "GET" "/application-categories/category/$cat1_id" "" "Get applications by category"
else
    print_warning "Skipping application-category creation - missing app or category ID"
fi

echo ""

# Step 7: Test Bouquets API
print_status "=== STEP 7: BOUQUETS API ==="

# Get all bouquets
make_request "GET" "/bouquets" "" "Get all bouquets"

# Create bouquet 1
bouquet1_data='{
  "name": "Premium Package Final",
  "region": "North America",
  "description": "Premium content package final",
  "status": "enabled"
}'

bouquet1_response=$(curl -s -X 'POST' "$BASE_URL/bouquets" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$bouquet1_data")

bouquet1_id=$(extract_id "$bouquet1_response")
print_status "Created bouquet 1 with ID: $bouquet1_id"

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
  "original_name": "The Matrix Final",
  "show_app_name": "The Matrix (1999) Final",
  "description": "A computer hacker learns from mysterious rebels about the true nature of his reality",
  "cover_url": "https://example.com/matrix-cover-final.jpg",
  "genres": "Action, Sci-Fi",
  "cast": "Keanu Reeves, Laurence Fishburne",
  "director": "Lana Wachowski, Lilly Wachowski",
  "release_date": "1999-03-31",
  "language": "English",
  "quality": "HD",
  "resolution": "1080p",
  "status": "enabled",
  "source_type": "url",
  "source_url": "https://example.com/matrix-final.mp4"
}'

movie1_response=$(curl -s -X 'POST' "$BASE_URL/movies" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$movie1_data")

movie1_id=$(extract_id "$movie1_response")
print_status "Created movie 1 with ID: $movie1_id"

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
  "original_name": "Breaking Bad Final",
  "show_app_name": "Breaking Bad (2008) Final",
  "description": "A high school chemistry teacher turned methamphetamine manufacturer",
  "cover_url": "https://example.com/breaking-bad-cover-final.jpg",
  "genres": "Crime, Drama",
  "cast": "Bryan Cranston, Aaron Paul",
  "director": "Vince Gilligan",
  "release_date": "2008-01-20",
  "language": "English",
  "quality": "HD",
  "resolution": "1080p",
  "status": "enabled",
  "source_type": "url",
  "source_url": "https://example.com/breaking-bad-final.mp4"
}'

series1_response=$(curl -s -X 'POST' "$BASE_URL/series" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$series1_data")

series1_id=$(extract_id "$series1_response")
print_status "Created series 1 with ID: $series1_id"

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
  "original_name": "Descendants of the Sun Final",
  "show_app_name": "Descendants of the Sun (2016) Final",
  "description": "A love story between a soldier and a doctor",
  "cover_url": "https://example.com/dots-cover-final.jpg",
  "genres": "Romance, Drama",
  "cast": "Song Joong-ki, Song Hye-kyo",
  "director": "Lee Eung-bok",
  "release_date": "2016-02-24",
  "language": "Korean",
  "quality": "HD",
  "resolution": "1080p",
  "status": "enabled",
  "source_type": "url",
  "source_url": "https://example.com/dots-final.mp4"
}'

drama1_response=$(curl -s -X 'POST' "$BASE_URL/dramas" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$drama1_data")

drama1_id=$(extract_id "$drama1_response")
print_status "Created drama 1 with ID: $drama1_id"

# Get specific drama
if [ -n "$drama1_id" ] && [ "$drama1_id" != "null" ]; then
    make_request "GET" "/dramas/$drama1_id" "" "Get specific drama"
fi

echo ""

# Step 11: Test Streams API
print_status "=== STEP 11: STREAMS API ==="

# Get all streams
make_request "GET" "/streams" "" "Get all streams"

# Create stream 1 (only if application 1 was created successfully)
if [ -n "$app1_id" ] && [ "$app1_id" != "null" ]; then
    stream1_data='{
      "original_name": "CNN Live Stream Final",
      "application_id": "'$app1_id'",
      "url": "https://example.com/cnn-stream-final.m3u8",
      "description": "CNN Live News Stream Final",
      "quality": "HD",
      "resolution": "1080p",
      "status": "enabled"
    }'

    stream1_response=$(curl -s -X 'POST' "$BASE_URL/streams" \
        -H 'accept: application/json' \
        -H "Authorization: Bearer $TOKEN" \
        -H 'Content-Type: application/json' \
        -d "$stream1_data")

    stream1_id=$(extract_id "$stream1_response")
    print_status "Created stream 1 with ID: $stream1_id"

    # Get specific stream
    if [ -n "$stream1_id" ] && [ "$stream1_id" != "null" ]; then
        make_request "GET" "/streams/$stream1_id" "" "Get specific stream"
    fi
else
    print_warning "Skipping stream creation - no valid application ID"
fi

echo ""

# Step 12: Test Radios API
print_status "=== STEP 12: RADIOS API ==="

# Get all radios
make_request "GET" "/radios" "" "Get all radios"

# Create radio 1
radio1_data='{
  "original_name": "BBC Radio 1 Final",
  "show_app_name": "BBC Radio 1 (UK) Final",
  "description": "The UKs most popular pop music station final",
  "cover_url": "https://example.com/radio1-cover-final.jpg",
  "genres": "Pop, Rock, Electronic",
  "language": "English",
  "country": "United Kingdom",
  "status": "enabled",
  "source_type": "url",
  "source_url": "https://example.com/radio1-stream-final.m3u8",
  "quality": "high",
  "bitrate": 128,
  "frequency": 98.5,
  "website_url": "https://www.bbc.co.uk/radio1"
}'

radio1_response=$(curl -s -X 'POST' "$BASE_URL/radios" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$radio1_data")

radio1_id=$(extract_id "$radio1_response")
print_status "Created radio 1 with ID: $radio1_id"

# Get specific radio
if [ -n "$radio1_id" ] && [ "$radio1_id" != "null" ]; then
    make_request "GET" "/radios/$radio1_id" "" "Get specific radio"
fi

echo ""

# Step 13: Final Summary
print_status "=== STEP 13: FINAL SUMMARY ==="

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

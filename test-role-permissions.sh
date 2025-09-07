#!/bin/bash

# IPTV Backend Role Permission Test Suite
# This script tests role-based access control for all APIs

BASE_URL="http://localhost:3004"
SUPER_ADMIN_TOKEN=""
ADMIN_TOKEN=""
RESELLER_TOKEN=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

print_test() {
    echo -e "${PURPLE}[TEST]${NC} $1"
}

# Function to make authenticated requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local token=$5
    local expected_status=$6
    
    print_test "Testing: $description"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "accept: application/json" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "accept: application/json" \
            -H "Authorization: Bearer $token")
    fi
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    # Extract response body (all lines except last)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        print_success "✅ $description - Status: $status_code (Expected: $expected_status)"
    else
        print_error "❌ $description - Status: $status_code (Expected: $expected_status)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
    echo ""
}

# Function to test unauthorized access
test_unauthorized() {
    local method=$1
    local endpoint=$2
    local description=$3
    
    print_test "Testing: $description (Unauthorized)"
    
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
        -H "accept: application/json")
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "401" ]; then
        print_success "✅ $description - Status: 401 (Unauthorized as expected)"
    else
        print_error "❌ $description - Status: $status_code (Expected: 401)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
    echo ""
}

# Step 1: Authentication Setup
print_status "=== STEP 1: AUTHENTICATION SETUP ==="

# Login as Super Admin
print_status "Logging in as Super Admin..."
super_admin_response=$(curl -s -X 'POST' "$BASE_URL/auth/login" \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{"email": "superAdmin@example.com", "password": "Pass@123"}')

SUPER_ADMIN_TOKEN=$(echo "$super_admin_response" | jq -r '.data.accessToken')

if [ "$SUPER_ADMIN_TOKEN" = "null" ] || [ -z "$SUPER_ADMIN_TOKEN" ]; then
    print_error "Failed to get Super Admin token"
    echo "$super_admin_response"
    exit 1
fi
print_success "Super Admin authentication successful"

# Create an Admin user
print_status "Creating Admin user for testing..."
admin_user_data='{
  "user_name": "Test Admin",
  "phone_number": "1234567891",
  "email": "test.admin@example.com",
  "password": "password123",
  "user_type": "ADMIN",
  "active": true
}'

admin_response=$(curl -s -X 'POST' "$BASE_URL/users" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$admin_user_data")

print_success "Admin user created"

# Login as Admin
print_status "Logging in as Admin..."
admin_login_response=$(curl -s -X 'POST' "$BASE_URL/auth/login" \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{"email": "test.admin@example.com", "password": "password123"}')

ADMIN_TOKEN=$(echo "$admin_login_response" | jq -r '.data.accessToken')

if [ "$ADMIN_TOKEN" = "null" ] || [ -z "$ADMIN_TOKEN" ]; then
    print_error "Failed to get Admin token"
    echo "$admin_login_response"
    exit 1
fi
print_success "Admin authentication successful"

# Create a Reseller user
print_status "Creating Reseller user for testing..."
reseller_user_data='{
  "user_name": "Test Reseller",
  "phone_number": "1234567892",
  "email": "test.reseller@example.com",
  "password": "password123",
  "user_type": "RESELLER",
  "active": true
}'

reseller_response=$(curl -s -X 'POST' "$BASE_URL/users" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$reseller_user_data")

print_success "Reseller user created"

# Login as Reseller
print_status "Logging in as Reseller..."
reseller_login_response=$(curl -s -X 'POST' "$BASE_URL/auth/login" \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{"email": "test.reseller@example.com", "password": "password123"}')

RESELLER_TOKEN=$(echo "$reseller_login_response" | jq -r '.data.accessToken')

if [ "$RESELLER_TOKEN" = "null" ] || [ -z "$RESELLER_TOKEN" ]; then
    print_error "Failed to get Reseller token"
    echo "$reseller_login_response"
    exit 1
fi
print_success "Reseller authentication successful"

echo ""

# Step 2: Test Unauthorized Access
print_status "=== STEP 2: TESTING UNAUTHORIZED ACCESS ==="

# Test unauthorized access to all endpoints
test_unauthorized "GET" "/users" "Get all users without token"
test_unauthorized "GET" "/applications" "Get all applications without token"
test_unauthorized "GET" "/categories" "Get all categories without token"
test_unauthorized "GET" "/sub-categories" "Get all sub-categories without token"
test_unauthorized "GET" "/application-categories" "Get all application-categories without token"
test_unauthorized "GET" "/bouquets" "Get all bouquets without token"
test_unauthorized "GET" "/movies" "Get all movies without token"
test_unauthorized "GET" "/series" "Get all series without token"
test_unauthorized "GET" "/dramas" "Get all dramas without token"
test_unauthorized "GET" "/streams" "Get all streams without token"
test_unauthorized "GET" "/radios" "Get all radios without token"

echo ""

# Step 3: Test Super Admin Permissions
print_status "=== STEP 3: TESTING SUPER ADMIN PERMISSIONS ==="

print_status "Super Admin should have access to ALL operations..."

# Test Super Admin - Users API
make_request "GET" "/users" "" "Super Admin - Get all users" "$SUPER_ADMIN_TOKEN" "200"
make_request "POST" "/users" '{"user_name": "Test User SA", "phone_number": "1234567893", "email": "test.user.sa@example.com", "password": "password123", "user_type": "ADMIN", "active": true}' "Super Admin - Create user" "$SUPER_ADMIN_TOKEN" "201"

# Test Super Admin - Applications API
make_request "GET" "/applications" "" "Super Admin - Get all applications" "$SUPER_ADMIN_TOKEN" "200"
make_request "POST" "/applications" '{"name": "Test App SA", "logo_path": "https://example.com/logo-sa.png", "user_agent": "TestApp/1.0", "description": "Test application SA", "theme": "dark", "color_scheme": "#000000,#ffffff", "status": true}' "Super Admin - Create application" "$SUPER_ADMIN_TOKEN" "201"

# Test Super Admin - Categories API
make_request "GET" "/categories" "" "Super Admin - Get all categories" "$SUPER_ADMIN_TOKEN" "200"
make_request "POST" "/categories" '{"original_name": "Test Category SA", "use_for": ["movie", "vod"], "show_name_on_application": "Test Category SA", "order": 1, "status": true}' "Super Admin - Create category" "$SUPER_ADMIN_TOKEN" "201"

# Test Super Admin - Bouquets API
make_request "GET" "/bouquets" "" "Super Admin - Get all bouquets" "$SUPER_ADMIN_TOKEN" "200"
make_request "POST" "/bouquets" '{"name": "Test Bouquet SA", "region": "North America", "description": "Test bouquet SA", "status": "enabled"}' "Super Admin - Create bouquet" "$SUPER_ADMIN_TOKEN" "201"

# Test Super Admin - Movies API
make_request "GET" "/movies" "" "Super Admin - Get all movies" "$SUPER_ADMIN_TOKEN" "200"
make_request "POST" "/movies" '{"original_name": "Test Movie SA", "show_app_name": "Test Movie SA", "description": "Test movie SA", "cover_url": "https://example.com/cover-sa.jpg", "genres": "Action", "cast": "Test Actor", "director": "Test Director", "release_date": "2023-01-01", "language": "English", "quality": "HD", "resolution": "1080p", "status": "enabled", "source_type": "url", "source_url": "https://example.com/movie-sa.mp4"}' "Super Admin - Create movie" "$SUPER_ADMIN_TOKEN" "201"

# Test Super Admin - Series API
make_request "GET" "/series" "" "Super Admin - Get all series" "$SUPER_ADMIN_TOKEN" "200"
make_request "POST" "/series" '{"original_name": "Test Series SA", "show_app_name": "Test Series SA", "description": "Test series SA", "cover_url": "https://example.com/cover-sa.jpg", "genres": "Drama", "cast": "Test Actor", "director": "Test Director", "release_date": "2023-01-01", "language": "English", "quality": "HD", "resolution": "1080p", "status": "enabled", "source_type": "url", "source_url": "https://example.com/series-sa.mp4"}' "Super Admin - Create series" "$SUPER_ADMIN_TOKEN" "201"

# Test Super Admin - Dramas API
make_request "GET" "/dramas" "" "Super Admin - Get all dramas" "$SUPER_ADMIN_TOKEN" "200"
make_request "POST" "/dramas" '{"original_name": "Test Drama SA", "show_app_name": "Test Drama SA", "description": "Test drama SA", "cover_url": "https://example.com/cover-sa.jpg", "genres": "Drama", "cast": "Test Actor", "director": "Test Director", "release_date": "2023-01-01", "language": "English", "quality": "HD", "resolution": "1080p", "status": "enabled", "source_type": "url", "source_url": "https://example.com/drama-sa.mp4"}' "Super Admin - Create drama" "$SUPER_ADMIN_TOKEN" "201"

# Test Super Admin - Streams API
make_request "GET" "/streams" "" "Super Admin - Get all streams" "$SUPER_ADMIN_TOKEN" "200"
make_request "POST" "/streams" '{"original_name": "Test Stream SA", "application_id": "c08d22c8-4e46-41a3-aa44-598ad3562749", "url": "https://example.com/stream-sa.m3u8", "description": "Test stream SA", "quality": "HD", "resolution": "1080p", "status": "enabled"}' "Super Admin - Create stream" "$SUPER_ADMIN_TOKEN" "201"

# Test Super Admin - Radios API
make_request "GET" "/radios" "" "Super Admin - Get all radios" "$SUPER_ADMIN_TOKEN" "200"
make_request "POST" "/radios" '{"original_name": "Test Radio SA", "show_app_name": "Test Radio SA", "description": "Test radio SA", "cover_url": "https://example.com/cover-sa.jpg", "genres": "Pop", "language": "English", "country": "USA", "status": "enabled", "source_type": "url", "source_url": "https://example.com/radio-sa.m3u8", "quality": "high", "bitrate": 128, "frequency": 98.5, "website_url": "https://example.com"}' "Super Admin - Create radio" "$SUPER_ADMIN_TOKEN" "201"

echo ""

# Step 4: Test Admin Permissions
print_status "=== STEP 4: TESTING ADMIN PERMISSIONS ==="

print_status "Admin should have READ access to most APIs but limited CREATE access..."

# Test Admin - Users API (should be able to read, but not create)
make_request "GET" "/users" "" "Admin - Get all users" "$ADMIN_TOKEN" "200"
make_request "POST" "/users" '{"user_name": "Test User Admin", "phone_number": "1234567894", "email": "test.user.admin@example.com", "password": "password123", "user_type": "ADMIN", "active": true}' "Admin - Create user (should fail)" "$ADMIN_TOKEN" "403"

# Test Admin - Applications API
make_request "GET" "/applications" "" "Admin - Get all applications" "$ADMIN_TOKEN" "200"
make_request "POST" "/applications" '{"name": "Test App Admin", "logo_path": "https://example.com/logo-admin.png", "user_agent": "TestApp/1.0", "description": "Test application Admin", "theme": "dark", "color_scheme": "#000000,#ffffff", "status": true}' "Admin - Create application" "$ADMIN_TOKEN" "201"

# Test Admin - Categories API
make_request "GET" "/categories" "" "Admin - Get all categories" "$ADMIN_TOKEN" "200"
make_request "POST" "/categories" '{"original_name": "Test Category Admin", "use_for": ["movie", "vod"], "show_name_on_application": "Test Category Admin", "order": 1, "status": true}' "Admin - Create category" "$ADMIN_TOKEN" "201"

# Test Admin - Sub-Categories API
make_request "GET" "/sub-categories" "" "Admin - Get all sub-categories" "$ADMIN_TOKEN" "200"

# Test Admin - Application-Categories API
make_request "GET" "/application-categories" "" "Admin - Get all application-categories" "$ADMIN_TOKEN" "200"

# Test Admin - Bouquets API (should be able to read, but not create)
make_request "GET" "/bouquets" "" "Admin - Get all bouquets" "$ADMIN_TOKEN" "200"
make_request "POST" "/bouquets" '{"name": "Test Bouquet Admin", "region": "North America", "description": "Test bouquet Admin", "status": "enabled"}' "Admin - Create bouquet (should fail)" "$ADMIN_TOKEN" "403"

# Test Admin - Movies API (should be able to read, but not create)
make_request "GET" "/movies" "" "Admin - Get all movies" "$ADMIN_TOKEN" "200"
make_request "POST" "/movies" '{"original_name": "Test Movie Admin", "show_app_name": "Test Movie Admin", "description": "Test movie Admin", "cover_url": "https://example.com/cover-admin.jpg", "genres": "Action", "cast": "Test Actor", "director": "Test Director", "release_date": "2023-01-01", "language": "English", "quality": "HD", "resolution": "1080p", "status": "enabled", "source_type": "url", "source_url": "https://example.com/movie-admin.mp4"}' "Admin - Create movie (should fail)" "$ADMIN_TOKEN" "403"

# Test Admin - Series API (should be able to read, but not create)
make_request "GET" "/series" "" "Admin - Get all series" "$ADMIN_TOKEN" "200"
make_request "POST" "/series" '{"original_name": "Test Series Admin", "show_app_name": "Test Series Admin", "description": "Test series Admin", "cover_url": "https://example.com/cover-admin.jpg", "genres": "Drama", "cast": "Test Actor", "director": "Test Director", "release_date": "2023-01-01", "language": "English", "quality": "HD", "resolution": "1080p", "status": "enabled", "source_type": "url", "source_url": "https://example.com/series-admin.mp4"}' "Admin - Create series (should fail)" "$ADMIN_TOKEN" "403"

# Test Admin - Dramas API (should be able to read, but not create)
make_request "GET" "/dramas" "" "Admin - Get all dramas" "$ADMIN_TOKEN" "200"
make_request "POST" "/dramas" '{"original_name": "Test Drama Admin", "show_app_name": "Test Drama Admin", "description": "Test drama Admin", "cover_url": "https://example.com/cover-admin.jpg", "genres": "Drama", "cast": "Test Actor", "director": "Test Director", "release_date": "2023-01-01", "language": "English", "quality": "HD", "resolution": "1080p", "status": "enabled", "source_type": "url", "source_url": "https://example.com/drama-admin.mp4"}' "Admin - Create drama (should fail)" "$ADMIN_TOKEN" "403"

# Test Admin - Streams API (should be able to read, but not create)
make_request "GET" "/streams" "" "Admin - Get all streams" "$ADMIN_TOKEN" "200"
make_request "POST" "/streams" '{"original_name": "Test Stream Admin", "application_id": "c08d22c8-4e46-41a3-aa44-598ad3562749", "url": "https://example.com/stream-admin.m3u8", "description": "Test stream Admin", "quality": "HD", "resolution": "1080p", "status": "enabled"}' "Admin - Create stream (should fail)" "$ADMIN_TOKEN" "403"

# Test Admin - Radios API (should be able to read, but not create)
make_request "GET" "/radios" "" "Admin - Get all radios" "$ADMIN_TOKEN" "200"
make_request "POST" "/radios" '{"original_name": "Test Radio Admin", "show_app_name": "Test Radio Admin", "description": "Test radio Admin", "cover_url": "https://example.com/cover-admin.jpg", "genres": "Pop", "language": "English", "country": "USA", "status": "enabled", "source_type": "url", "source_url": "https://example.com/radio-admin.m3u8", "quality": "high", "bitrate": 128, "frequency": 98.5, "website_url": "https://example.com"}' "Admin - Create radio (should fail)" "$ADMIN_TOKEN" "403"

echo ""

# Step 5: Test Reseller Permissions
print_status "=== STEP 5: TESTING RESELLER PERMISSIONS ==="

print_status "Reseller should have very limited access..."

# Test Reseller - Users API (should fail)
make_request "GET" "/users" "" "Reseller - Get all users (should fail)" "$RESELLER_TOKEN" "403"
make_request "POST" "/users" '{"user_name": "Test User Reseller", "phone_number": "1234567895", "email": "test.user.reseller@example.com", "password": "password123", "user_type": "RESELLER", "active": true}' "Reseller - Create user (should fail)" "$RESELLER_TOKEN" "403"

# Test Reseller - Applications API (should fail)
make_request "GET" "/applications" "" "Reseller - Get all applications (should fail)" "$RESELLER_TOKEN" "403"
make_request "POST" "/applications" '{"name": "Test App Reseller", "logo_path": "https://example.com/logo-reseller.png", "user_agent": "TestApp/1.0", "description": "Test application Reseller", "theme": "dark", "color_scheme": "#000000,#ffffff", "status": true}' "Reseller - Create application (should fail)" "$RESELLER_TOKEN" "403"

# Test Reseller - Categories API (should fail)
make_request "GET" "/categories" "" "Reseller - Get all categories (should fail)" "$RESELLER_TOKEN" "403"
make_request "POST" "/categories" '{"original_name": "Test Category Reseller", "use_for": ["movie", "vod"], "show_name_on_application": "Test Category Reseller", "order": 1, "status": true}' "Reseller - Create category (should fail)" "$RESELLER_TOKEN" "403"

# Test Reseller - Sub-Categories API (should fail)
make_request "GET" "/sub-categories" "" "Reseller - Get all sub-categories (should fail)" "$RESELLER_TOKEN" "403"

# Test Reseller - Application-Categories API (should fail)
make_request "GET" "/application-categories" "" "Reseller - Get all application-categories (should fail)" "$RESELLER_TOKEN" "403"

# Test Reseller - Bouquets API (should fail)
make_request "GET" "/bouquets" "" "Reseller - Get all bouquets (should fail)" "$RESELLER_TOKEN" "403"
make_request "POST" "/bouquets" '{"name": "Test Bouquet Reseller", "region": "North America", "description": "Test bouquet Reseller", "status": "enabled"}' "Reseller - Create bouquet (should fail)" "$RESELLER_TOKEN" "403"

# Test Reseller - Movies API (should fail)
make_request "GET" "/movies" "" "Reseller - Get all movies (should fail)" "$RESELLER_TOKEN" "403"
make_request "POST" "/movies" '{"original_name": "Test Movie Reseller", "show_app_name": "Test Movie Reseller", "description": "Test movie Reseller", "cover_url": "https://example.com/cover-reseller.jpg", "genres": "Action", "cast": "Test Actor", "director": "Test Director", "release_date": "2023-01-01", "language": "English", "quality": "HD", "resolution": "1080p", "status": "enabled", "source_type": "url", "source_url": "https://example.com/movie-reseller.mp4"}' "Reseller - Create movie (should fail)" "$RESELLER_TOKEN" "403"

# Test Reseller - Series API (should fail)
make_request "GET" "/series" "" "Reseller - Get all series (should fail)" "$RESELLER_TOKEN" "403"
make_request "POST" "/series" '{"original_name": "Test Series Reseller", "show_app_name": "Test Series Reseller", "description": "Test series Reseller", "cover_url": "https://example.com/cover-reseller.jpg", "genres": "Drama", "cast": "Test Actor", "director": "Test Director", "release_date": "2023-01-01", "language": "English", "quality": "HD", "resolution": "1080p", "status": "enabled", "source_type": "url", "source_url": "https://example.com/series-reseller.mp4"}' "Reseller - Create series (should fail)" "$RESELLER_TOKEN" "403"

# Test Reseller - Dramas API (should fail)
make_request "GET" "/dramas" "" "Reseller - Get all dramas (should fail)" "$RESELLER_TOKEN" "403"
make_request "POST" "/dramas" '{"original_name": "Test Drama Reseller", "show_app_name": "Test Drama Reseller", "description": "Test drama Reseller", "cover_url": "https://example.com/cover-reseller.jpg", "genres": "Drama", "cast": "Test Actor", "director": "Test Director", "release_date": "2023-01-01", "language": "English", "quality": "HD", "resolution": "1080p", "status": "enabled", "source_type": "url", "source_url": "https://example.com/drama-reseller.mp4"}' "Reseller - Create drama (should fail)" "$RESELLER_TOKEN" "403"

# Test Reseller - Streams API (should fail)
make_request "GET" "/streams" "" "Reseller - Get all streams (should fail)" "$RESELLER_TOKEN" "403"
make_request "POST" "/streams" '{"original_name": "Test Stream Reseller", "application_id": "c08d22c8-4e46-41a3-aa44-598ad3562749", "url": "https://example.com/stream-reseller.m3u8", "description": "Test stream Reseller", "quality": "HD", "resolution": "1080p", "status": "enabled"}' "Reseller - Create stream (should fail)" "$RESELLER_TOKEN" "403"

# Test Reseller - Radios API (should fail)
make_request "GET" "/radios" "" "Reseller - Get all radios (should fail)" "$RESELLER_TOKEN" "403"
make_request "POST" "/radios" '{"original_name": "Test Radio Reseller", "show_app_name": "Test Radio Reseller", "description": "Test radio Reseller", "cover_url": "https://example.com/cover-reseller.jpg", "genres": "Pop", "language": "English", "country": "USA", "status": "enabled", "source_type": "url", "source_url": "https://example.com/radio-reseller.m3u8", "quality": "high", "bitrate": 128, "frequency": 98.5, "website_url": "https://example.com"}' "Reseller - Create radio (should fail)" "$RESELLER_TOKEN" "403"

echo ""

# Step 6: Test Invalid Token
print_status "=== STEP 6: TESTING INVALID TOKEN ==="

print_status "Testing with invalid token..."

make_request "GET" "/users" "" "Invalid token - Get all users" "invalid_token_here" "401"
make_request "GET" "/applications" "" "Invalid token - Get all applications" "invalid_token_here" "401"
make_request "GET" "/categories" "" "Invalid token - Get all categories" "invalid_token_here" "401"

echo ""

# Step 7: Test Expired Token
print_status "=== STEP 7: TESTING EXPIRED TOKEN ==="

print_status "Testing with expired token..."

# Using a known expired token
EXPIRED_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyOWNkMzIwZS03MTYyLTQwYzktYTc5Yi00NzlhYWEyNDI2MzIiLCJ1c2VyVHlwZSI6IlNVUEVSX0FETUlOIiwiaWF0IjoxNzU1OTM2NTExLCJleHAiOjE3NTYwMjI5MTF9.0T524gZkx0MHqgtTBl01UkMsA4NaUpWdEiqgQcnAcyw"

make_request "GET" "/users" "" "Expired token - Get all users" "$EXPIRED_TOKEN" "401"
make_request "GET" "/applications" "" "Expired token - Get all applications" "$EXPIRED_TOKEN" "401"
make_request "GET" "/categories" "" "Expired token - Get all categories" "$EXPIRED_TOKEN" "401"

echo ""

# Step 8: Summary
print_status "=== STEP 8: ROLE PERMISSION TEST SUMMARY ==="

print_success "🎉 Role permission testing completed!"
print_status ""
print_status "Expected Results Summary:"
print_status "✅ Super Admin: Full access to all APIs"
print_status "✅ Admin: Read access to most APIs, limited create access"
print_status "✅ Reseller: Very limited access (mostly 403 Forbidden)"
print_status "✅ Unauthorized: 401 Unauthorized for all endpoints"
print_status "✅ Invalid/Expired Tokens: 401 Unauthorized"
print_status ""
print_status "Check the output above to verify that role-based access control is working correctly."

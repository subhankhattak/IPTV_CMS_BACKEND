#!/bin/bash

# IPTV Backend Role Requirements Test
# This script tests if the role permissions match typical IPTV backend requirements

BASE_URL="http://localhost:3004"
SUPER_ADMIN_TOKEN=""
ADMIN_TOKEN=""
RESELLER_TOKEN=""
SUB_RESELLER_TOKEN=""

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
  "user_name": "Test Admin Requirements",
  "phone_number": "1234567896",
  "email": "test.admin.req@example.com",
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
    -d '{"email": "test.admin.req@example.com", "password": "password123"}')

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
  "user_name": "Test Reseller Requirements",
  "phone_number": "1234567897",
  "email": "test.reseller.req@example.com",
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
    -d '{"email": "test.reseller.req@example.com", "password": "password123"}')

RESELLER_TOKEN=$(echo "$reseller_login_response" | jq -r '.data.accessToken')

if [ "$RESELLER_TOKEN" = "null" ] || [ -z "$RESELLER_TOKEN" ]; then
    print_error "Failed to get Reseller token"
    echo "$reseller_login_response"
    exit 1
fi
print_success "Reseller authentication successful"

# Create a Sub-Reseller user
print_status "Creating Sub-Reseller user for testing..."
sub_reseller_user_data='{
  "user_name": "Test Sub-Reseller Requirements",
  "phone_number": "1234567898",
  "email": "test.subreseller.req@example.com",
  "password": "password123",
  "user_type": "SUB_RESELLER",
  "active": true
}'

sub_reseller_response=$(curl -s -X 'POST' "$BASE_URL/users" \
    -H 'accept: application/json' \
    -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
    -H 'Content-Type: application/json' \
    -d "$sub_reseller_user_data")

print_success "Sub-Reseller user created"

# Login as Sub-Reseller
print_status "Logging in as Sub-Reseller..."
sub_reseller_login_response=$(curl -s -X 'POST' "$BASE_URL/auth/login" \
    -H 'accept: application/json' \
    -H 'Content-Type: application/json' \
    -d '{"email": "test.subreseller.req@example.com", "password": "password123"}')

SUB_RESELLER_TOKEN=$(echo "$sub_reseller_login_response" | jq -r '.data.accessToken')

if [ "$SUB_RESELLER_TOKEN" = "null" ] || [ -z "$SUB_RESELLER_TOKEN" ]; then
    print_error "Failed to get Sub-Reseller token"
    echo "$sub_reseller_login_response"
    exit 1
fi
print_success "Sub-Reseller authentication successful"

echo ""

# Step 2: Test Super Admin Permissions (Full Access)
print_status "=== STEP 2: TESTING SUPER ADMIN PERMISSIONS ==="
print_status "Super Admin should have FULL ACCESS to all APIs..."

# Test Super Admin - Management APIs
make_request "GET" "/users" "" "Super Admin - Get all users" "$SUPER_ADMIN_TOKEN" "200"
make_request "POST" "/users" '{"user_name": "Test User SA", "phone_number": "1234567899", "email": "test.user.sa@example.com", "password": "password123", "user_type": "ADMIN", "active": true}' "Super Admin - Create user" "$SUPER_ADMIN_TOKEN" "201"
make_request "GET" "/applications" "" "Super Admin - Get all applications" "$SUPER_ADMIN_TOKEN" "200"
make_request "POST" "/applications" '{"name": "Test App SA", "logo_path": "https://example.com/logo-sa.png", "user_agent": "TestApp/1.0", "description": "Test application SA", "theme": "dark", "color_scheme": "#000000,#ffffff", "status": true}' "Super Admin - Create application" "$SUPER_ADMIN_TOKEN" "201"

# Test Super Admin - Content APIs
make_request "GET" "/movies" "" "Super Admin - Get all movies" "$SUPER_ADMIN_TOKEN" "200"
make_request "POST" "/movies" '{"original_name": "Test Movie SA", "show_app_name": "Test Movie SA", "description": "Test movie SA", "cover_url": "https://example.com/cover-sa.jpg", "genres": "Action", "cast": "Test Actor", "director": "Test Director", "release_date": "2023-01-01", "language": "English", "quality": "HD", "resolution": "1080p", "status": "enabled", "source_type": "url", "source_url": "https://example.com/movie-sa.mp4"}' "Super Admin - Create movie" "$SUPER_ADMIN_TOKEN" "201"

echo ""

# Step 3: Test Admin Permissions (System Management)
print_status "=== STEP 3: TESTING ADMIN PERMISSIONS ==="
print_status "Admin should have FULL ACCESS to management and content APIs..."

# Test Admin - Management APIs
make_request "GET" "/users" "" "Admin - Get all users" "$ADMIN_TOKEN" "200"
make_request "POST" "/users" '{"user_name": "Test User Admin", "phone_number": "1234567900", "email": "test.user.admin@example.com", "password": "password123", "user_type": "RESELLER", "active": true}' "Admin - Create user" "$ADMIN_TOKEN" "201"
make_request "GET" "/applications" "" "Admin - Get all applications" "$ADMIN_TOKEN" "200"
make_request "POST" "/applications" '{"name": "Test App Admin", "logo_path": "https://example.com/logo-admin.png", "user_agent": "TestApp/1.0", "description": "Test application Admin", "theme": "dark", "color_scheme": "#000000,#ffffff", "status": true}' "Admin - Create application" "$ADMIN_TOKEN" "201"

# Test Admin - Content APIs
make_request "GET" "/movies" "" "Admin - Get all movies" "$ADMIN_TOKEN" "200"
make_request "POST" "/movies" '{"original_name": "Test Movie Admin", "show_app_name": "Test Movie Admin", "description": "Test movie Admin", "cover_url": "https://example.com/cover-admin.jpg", "genres": "Action", "cast": "Test Actor", "director": "Test Director", "release_date": "2023-01-01", "language": "English", "quality": "HD", "resolution": "1080p", "status": "enabled", "source_type": "url", "source_url": "https://example.com/movie-admin.mp4"}' "Admin - Create movie" "$ADMIN_TOKEN" "201"

echo ""

# Step 4: Test Reseller Permissions (Business Operations)
print_status "=== STEP 4: TESTING RESELLER PERMISSIONS ==="
print_status "Reseller should have LIMITED ACCESS - can view content, manage their users..."

# Test Reseller - Management APIs (should be blocked)
make_request "GET" "/users" "" "Reseller - Get all users (should be blocked)" "$RESELLER_TOKEN" "403"
make_request "POST" "/users" '{"user_name": "Test User Reseller", "phone_number": "1234567901", "email": "test.user.reseller@example.com", "password": "password123", "user_type": "USER", "active": true}' "Reseller - Create user (should be blocked)" "$RESELLER_TOKEN" "403"
make_request "GET" "/applications" "" "Reseller - Get all applications (should be blocked)" "$RESELLER_TOKEN" "403"
make_request "POST" "/applications" '{"name": "Test App Reseller", "logo_path": "https://example.com/logo-reseller.png", "user_agent": "TestApp/1.0", "description": "Test application Reseller", "theme": "dark", "color_scheme": "#000000,#ffffff", "status": true}' "Reseller - Create application (should be blocked)" "$RESELLER_TOKEN" "403"

# Test Reseller - Content APIs (should allow read access)
make_request "GET" "/movies" "" "Reseller - Get all movies (should allow)" "$RESELLER_TOKEN" "200"
make_request "POST" "/movies" '{"original_name": "Test Movie Reseller", "show_app_name": "Test Movie Reseller", "description": "Test movie Reseller", "cover_url": "https://example.com/cover-reseller.jpg", "genres": "Action", "cast": "Test Actor", "director": "Test Director", "release_date": "2023-01-01", "language": "English", "quality": "HD", "resolution": "1080p", "status": "enabled", "source_type": "url", "source_url": "https://example.com/movie-reseller.mp4"}' "Reseller - Create movie (should be blocked)" "$RESELLER_TOKEN" "403"

echo ""

# Step 5: Test Sub-Reseller Permissions (Limited Business Operations)
print_status "=== STEP 5: TESTING SUB-RESELLER PERMISSIONS ==="
print_status "Sub-Reseller should have LIMITED ACCESS - can view content, manage end users..."

# Test Sub-Reseller - Management APIs (should be blocked)
make_request "GET" "/users" "" "Sub-Reseller - Get all users (should be blocked)" "$SUB_RESELLER_TOKEN" "403"
make_request "POST" "/users" '{"user_name": "Test User SubReseller", "phone_number": "1234567902", "email": "test.user.subreseller@example.com", "password": "password123", "user_type": "USER", "active": true}' "Sub-Reseller - Create user (should be blocked)" "$SUB_RESELLER_TOKEN" "403"
make_request "GET" "/applications" "" "Sub-Reseller - Get all applications (should be blocked)" "$SUB_RESELLER_TOKEN" "403"

# Test Sub-Reseller - Content APIs (should allow read access)
make_request "GET" "/movies" "" "Sub-Reseller - Get all movies (should allow)" "$SUB_RESELLER_TOKEN" "200"
make_request "POST" "/movies" '{"original_name": "Test Movie SubReseller", "show_app_name": "Test Movie SubReseller", "description": "Test movie SubReseller", "cover_url": "https://example.com/cover-subreseller.jpg", "genres": "Action", "cast": "Test Actor", "director": "Test Director", "release_date": "2023-01-01", "language": "English", "quality": "HD", "resolution": "1080p", "status": "enabled", "source_type": "url", "source_url": "https://example.com/movie-subreseller.mp4"}' "Sub-Reseller - Create movie (should be blocked)" "$SUB_RESELLER_TOKEN" "403"

echo ""

# Step 6: Summary
print_status "=== STEP 6: ROLE REQUIREMENTS TEST SUMMARY ==="

print_success "🎉 Role requirements testing completed!"
print_status ""
print_status "Expected Results Summary:"
print_status "✅ Super Admin: Full access to all APIs (management + content)"
print_status "✅ Admin: Full access to all APIs (management + content)"
print_status "✅ Reseller: Read access to content, blocked from management"
print_status "✅ Sub-Reseller: Read access to content, blocked from management"
print_status ""
print_status "This matches typical IPTV backend requirements:"
print_status "• Super Admin: System administration"
print_status "• Admin: System management and content management"
print_status "• Reseller: Business operations (view content, manage users)"
print_status "• Sub-Reseller: Limited business operations (view content, manage end users)"
print_status ""
print_status "Check the output above to verify that role-based access control matches requirements."

# Category Flow Update

## Overview

The category flow has been updated to support a more flexible relationship between applications and categories. This update allows multiple applications to use the same category while providing the ability to set custom aliases for each application-category combination.

## New Flow

### 1. Application Creation

- Applications are created first and stored in the `applications` table
- Each application has its own configuration, theme, and settings

### 2. Category Creation

- Categories are created independently and stored in the `categories` table
- Categories are no longer tied to a specific application
- Categories can be reused across multiple applications

### 3. SubCategory Creation

- SubCategories are created and linked to categories
- SubCategories inherit the category's relationship with applications

### 4. Application-Category Assignment

- Users can assign categories to applications through the `application_categories` table
- Each assignment can have a custom alias for that specific application
- The same category can be used by multiple applications with different aliases

## Database Schema Changes

### New Table: `application_categories`

```sql
CREATE TABLE application_categories (
  id VARCHAR(36) PRIMARY KEY,
  application_id VARCHAR(36) NOT NULL,
  category_id VARCHAR(36) NOT NULL,
  alias VARCHAR(255) NULL,
  `order` INT DEFAULT 0,
  status BOOLEAN DEFAULT TRUE,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_application_category (application_id, category_id)
);
```

### Updated Table: `categories`

- Removed `application_id` column
- Categories are now application-agnostic

### Updated Table: `applications`

- Added relationship to `application_categories` through `application_categories` table

## API Endpoints

### Application Categories

- `POST /application-categories` - Create application-category relationship
- `GET /application-categories` - Get all relationships with filters
- `GET /application-categories/application/:applicationId` - Get categories for specific application
- `GET /application-categories/category/:categoryId` - Get applications for specific category
- `GET /application-categories/:id` - Get specific relationship
- `PUT /application-categories/:id` - Update relationship
- `PATCH /application-categories/:id` - Partially update relationship
- `DELETE /application-categories/:id` - Remove relationship

### Categories (Updated)

- `POST /categories` - Create category (no longer requires application_id)
- `GET /categories` - Get all categories (removed application_id filter)
- `GET /categories/:id` - Get category by ID
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

## Migration

To migrate from the old structure to the new one:

1. Run the migration script:

```bash
node scripts/migrate-category-flow.js
```

2. The script will:
   - Create the new `application_categories` table
   - Migrate existing category-application relationships
   - Remove the `application_id` column from the `categories` table

## Usage Examples

### Creating a Category

```json
POST /categories
{
  "original_name": "Action Movies",
  "use_for": ["movie", "vod"],
  "show_name_on_application": "Action",
  "thumbnail": "https://example.com/action.jpg",
  "order": 1,
  "status": true
}
```

### Assigning Category to Application

```json
POST /application-categories
{
  "application_id": "123e4567-e89b-12d3-a456-426614174000",
  "category_id": "123e4567-e89b-12d3-a456-426614174001",
  "alias": "My Custom Action Category",
  "order": 1,
  "status": true
}
```

### Getting Categories for an Application

```
GET /application-categories/application/123e4567-e89b-12d3-a456-426614174000
```

This will return categories with their display names (alias if set, otherwise original name).

## Benefits

1. **Reusability**: Categories can be shared across multiple applications
2. **Customization**: Each application can have custom aliases for categories
3. **Flexibility**: Easy to add/remove categories from applications
4. **Scalability**: Better performance for large numbers of applications and categories
5. **Maintenance**: Centralized category management

## Breaking Changes

1. Category creation no longer requires `application_id`
2. Category queries no longer filter by `application_id`
3. The `findByApplicationId` method has been removed from the CategoriesService
4. Applications now access categories through the `application_categories` relationship

## Migration Notes

- Existing category-application relationships will be automatically migrated
- Categories without applications will remain in the system
- The migration is backward-compatible and safe to run multiple times

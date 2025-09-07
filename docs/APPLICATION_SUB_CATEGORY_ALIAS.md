# Application Sub-Category Alias System

## Overview

The application sub-category alias system allows users to set custom aliases for sub-categories within specific applications. This feature provides flexibility in how sub-categories are displayed and organized across different applications, similar to the existing category alias system.

## Features

### 1. Custom Aliases

- Users can set custom names for sub-categories within each application
- Aliases override the default sub-category name when displaying content
- Each application can have different aliases for the same sub-category

### 2. Order Management

- Custom ordering of sub-categories within each application
- Independent ordering from the global sub-category order

### 3. Status Control

- Enable/disable sub-categories for specific applications
- Maintains the relationship while controlling visibility

## Database Schema

### New Table: `application_sub_categories`

```sql
CREATE TABLE application_sub_categories (
  id VARCHAR(36) PRIMARY KEY,
  application_id VARCHAR(36) NOT NULL,
  sub_category_id VARCHAR(36) NOT NULL,
  alias VARCHAR(255) NULL,
  `order` INT DEFAULT 0,
  status BOOLEAN DEFAULT TRUE,
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_application_sub_category (application_id, sub_category_id),
  FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
  FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id) ON DELETE CASCADE
);
```

## API Endpoints

### Application Sub-Categories

- `POST /application-sub-categories` - Create application-sub-category relationship
- `GET /application-sub-categories` - Get all relationships with filters
- `GET /application-sub-categories/application/:applicationId` - Get sub-categories for specific application
- `GET /application-sub-categories/sub-category/:subCategoryId` - Get applications for specific sub-category
- `GET /application-sub-categories/:id` - Get specific relationship
- `PATCH /application-sub-categories/:id` - Update relationship
- `DELETE /application-sub-categories/:id` - Remove relationship

## Usage Examples

### Creating an Application-Sub-Category Relationship

```json
POST /application-sub-categories
{
  "application_id": "123e4567-e89b-12d3-a456-426614174000",
  "sub_category_id": "123e4567-e89b-12d3-a456-426614174001",
  "alias": "My Custom Sub-Category Name",
  "order": 1,
  "status": true
}
```

### Getting Sub-Categories for an Application

```
GET /application-sub-categories/application/123e4567-e89b-12d3-a456-426614174000
```

This will return sub-categories with their display names (alias if set, otherwise the sub-category's show_name_on_application or original_name).

### Updating an Alias

```json
PATCH /application-sub-categories/123e4567-e89b-12d3-a456-426614174002
{
  "alias": "Updated Custom Name",
  "order": 2
}
```

## Display Name Logic

When retrieving sub-categories for an application, the display name is determined in this order:

1. **Custom Alias** (if set in application_sub_categories)
2. **Sub-Category Show Name** (if set in sub_categories.show_name_on_application)
3. **Sub-Category Original Name** (fallback)

## Benefits

1. **Customization**: Each application can have custom names for sub-categories
2. **Localization**: Different applications can use localized names for the same sub-category
3. **Branding**: Applications can use branded terminology for sub-categories
4. **Flexibility**: Easy to add/remove sub-categories from applications
5. **Organization**: Custom ordering per application

## Migration

To set up the application-sub-category alias system:

1. Run the migration script:

```bash
node scripts/migrate-application-sub-categories.js
```

2. The script will:
   - Create the new `application_sub_categories` table
   - Set up proper foreign key constraints
   - Ensure data integrity

## Integration with Existing System

The application-sub-category alias system works alongside the existing:

- **Category Alias System**: Both categories and sub-categories can have application-specific aliases
- **Sub-Category Management**: Existing sub-category CRUD operations remain unchanged
- **Application Management**: Applications can now manage both category and sub-category aliases

## Security and Permissions

- **Admin Role**: Full access to create, read, update, and delete relationships
- **Reseller Role**: Full access to manage relationships for their applications
- **Authentication Required**: All endpoints require valid JWT authentication

## Error Handling

The system includes comprehensive error handling for:

- **Duplicate Relationships**: Prevents creating duplicate application-sub-category pairs
- **Invalid References**: Validates application and sub-category existence
- **Data Integrity**: Maintains referential integrity with foreign key constraints

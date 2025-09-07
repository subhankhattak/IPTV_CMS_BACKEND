# Bouquet Many-to-Many Relationship Implementation

## Overview

This document outlines the complete implementation of many-to-many relationships between content items (movies, dramas, radios, series, streams) and bouquets. The system now allows content items to be assigned to multiple bouquets, and bouquets can contain multiple content items.

## ✅ **Implementation Summary**

### **Content Types with Many-to-Many Bouquet Relationships:**

1. **Movies** ↔ **Bouquets** (via `movie_bouquets` table)
2. **Dramas** ↔ **Bouquets** (via `drama_bouquets` table)
3. **Radios** ↔ **Bouquets** (via `radio_bouquets` table)
4. **Series** ↔ **Bouquets** (via `series_bouquets` table)
5. **Streams** ↔ **Bouquets** (via `stream_bouquets` table)

## 🔧 **Technical Implementation**

### **Entity Updates:**

#### **Stream Entity** (`src/entities/stream.entity.ts`)

- Added `@ManyToMany` relationship with Bouquet
- Added `bouquets: Bouquet[]` property
- Configured junction table `stream_bouquets`

### **Service Updates:**

All content services now include:

- Bouquet repository injection
- Complete `assignBouquets` method implementation
- Proper error handling and validation
- Full relationship loading

#### **Updated Services:**

- `src/movies/providers/movies.service.ts`
- `src/dramas/providers/dramas.service.ts`
- `src/radios/providers/radios.service.ts`
- `src/series/providers/series.service.ts`
- `src/streams/providers/streams.service.ts`

### **Module Updates:**

All content modules now include:

- Bouquet entity in TypeORM feature imports
- Proper dependency injection

#### **Updated Modules:**

- `src/movies/movies.module.ts`
- `src/dramas/dramas.module.ts`
- `src/radios/radios.module.ts`
- `src/series/series.module.ts`
- `src/streams/streams.module.ts`

### **Controller Updates:**

All content controllers include:

- `assignBouquets` endpoint
- Proper authentication and authorization
- Swagger documentation

#### **Updated Controllers:**

- `src/movies/movies.controller.ts`
- `src/dramas/dramas.controller.ts`
- `src/radios/radios.controller.ts`
- `src/series/series.controller.ts`
- `src/streams/streams.controller.ts`

## 🚀 **API Endpoints**

### **Assign Bouquets to Content:**

```
POST /movies/:id/assign-bouquets
POST /dramas/:id/assign-bouquets
POST /radios/:id/assign-bouquets
POST /series/:id/assign-bouquets
POST /streams/:id/assign-bouquets
```

### **Request Body:**

```json
{
  "bouquet_ids": ["uuid1", "uuid2", "uuid3"]
}
```

### **Response:**

```json
{
  "success": true,
  "message": "Bouquets assigned successfully",
  "data": {
    "id": "content-uuid",
    "original_name": "Content Name",
    "bouquets": [
      {
        "id": "bouquet-uuid1",
        "name": "Premium Package",
        "region": "North America"
      },
      {
        "id": "bouquet-uuid2",
        "name": "Sports Package",
        "region": "Europe"
      }
    ]
  }
}
```

## 🔐 **Security & Permissions**

### **Access Control:**

- **Super Admin Only**: All bouquet assignment operations
- **Authentication Required**: All endpoints require valid JWT
- **Role-Based Authorization**: Uses `@Roles(UserTypeEnum.SUPER_ADMIN)`

### **Validation:**

- Content item existence validation
- Bouquet existence validation
- Duplicate assignment prevention
- Proper error messages for missing entities

## 📊 **Database Schema**

### **Junction Tables:**

```sql
-- Movies to Bouquets
CREATE TABLE movie_bouquets (
  movie_id VARCHAR(36) NOT NULL,
  bouquet_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (movie_id, bouquet_id),
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (bouquet_id) REFERENCES bouquets(id) ON DELETE CASCADE
);

-- Dramas to Bouquets
CREATE TABLE drama_bouquets (
  drama_id VARCHAR(36) NOT NULL,
  bouquet_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (drama_id, bouquet_id),
  FOREIGN KEY (drama_id) REFERENCES dramas(id) ON DELETE CASCADE,
  FOREIGN KEY (bouquet_id) REFERENCES bouquets(id) ON DELETE CASCADE
);

-- Radios to Bouquets
CREATE TABLE radio_bouquets (
  radio_id VARCHAR(36) NOT NULL,
  bouquet_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (radio_id, bouquet_id),
  FOREIGN KEY (radio_id) REFERENCES radios(id) ON DELETE CASCADE,
  FOREIGN KEY (bouquet_id) REFERENCES bouquets(id) ON DELETE CASCADE
);

-- Series to Bouquets
CREATE TABLE series_bouquets (
  series_id VARCHAR(36) NOT NULL,
  bouquet_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (series_id, bouquet_id),
  FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
  FOREIGN KEY (bouquet_id) REFERENCES bouquets(id) ON DELETE CASCADE
);

-- Streams to Bouquets
CREATE TABLE stream_bouquets (
  stream_id VARCHAR(36) NOT NULL,
  bouquet_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (stream_id, bouquet_id),
  FOREIGN KEY (stream_id) REFERENCES streams(id) ON DELETE CASCADE,
  FOREIGN KEY (bouquet_id) REFERENCES bouquets(id) ON DELETE CASCADE
);
```

## 🎯 **Usage Examples**

### **Assign Multiple Bouquets to a Movie:**

```bash
curl -X POST http://localhost:3000/movies/123e4567-e89b-12d3-a456-426614174000/assign-bouquets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bouquet_ids": [
      "456e7890-e89b-12d3-a456-426614174001",
      "789e0123-e89b-12d3-a456-426614174002"
    ]
  }'
```

### **Assign Bouquets to a Series:**

```bash
curl -X POST http://localhost:3000/series/123e4567-e89b-12d3-a456-426614174000/assign-bouquets \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bouquet_ids": [
      "456e7890-e89b-12d3-a456-426614174001"
    ]
  }'
```

## 🔄 **Data Flow**

### **Assignment Process:**

1. **Validation**: Check if content item and bouquets exist
2. **Loading**: Load current bouquets for the content item
3. **Assignment**: Replace current bouquets with new ones
4. **Saving**: Persist the many-to-many relationship
5. **Response**: Return updated content item with all relations

### **Error Handling:**

- **Content Not Found**: Returns 400 with "Content not found"
- **Bouquet Not Found**: Returns 400 with list of missing bouquet IDs
- **Permission Denied**: Returns 403 for non-Super Admin users
- **Validation Errors**: Returns 400 for invalid request data

## 🧪 **Testing**

### **Test Scenarios:**

1. **Valid Assignment**: Assign existing bouquets to existing content
2. **Invalid Content**: Try to assign to non-existent content
3. **Invalid Bouquets**: Try to assign non-existent bouquets
4. **Permission Test**: Try to assign without Super Admin role
5. **Multiple Bouquets**: Assign content to multiple bouquets
6. **Empty Assignment**: Assign content to no bouquets

### **Expected Behaviors:**

- Content can be assigned to multiple bouquets
- Content can be reassigned to different bouquets
- Content can be removed from all bouquets (empty array)
- Proper error messages for invalid operations
- Full relationship data in responses

## 📈 **Benefits**

### **Business Benefits:**

1. **Flexible Content Organization**: Content can belong to multiple packages
2. **Regional Customization**: Different bouquets for different regions
3. **Package Flexibility**: Easy to create themed content packages
4. **Content Reuse**: Same content in multiple packages
5. **Scalable Architecture**: Easy to add new content types

### **Technical Benefits:**

1. **Data Integrity**: Proper foreign key constraints
2. **Performance**: Optimized queries with proper indexing
3. **Maintainability**: Consistent patterns across all content types
4. **Extensibility**: Easy to add new content types
5. **Security**: Proper authentication and authorization

## 🔮 **Future Enhancements**

### **Potential Improvements:**

1. **Bulk Operations**: Assign multiple content items to bouquets at once
2. **Bouquet Queries**: Get all content for a specific bouquet
3. **Assignment History**: Track when content was assigned to bouquets
4. **Conditional Assignment**: Assign based on content properties
5. **Auto-Assignment**: Automatic assignment based on content categories

## ✅ **Implementation Status**

- ✅ **Movies**: Complete many-to-many implementation
- ✅ **Dramas**: Complete many-to-many implementation
- ✅ **Radios**: Complete many-to-many implementation
- ✅ **Series**: Complete many-to-many implementation
- ✅ **Streams**: Complete many-to-many implementation
- ✅ **API Endpoints**: All endpoints implemented and documented
- ✅ **Security**: Proper authentication and authorization
- ✅ **Validation**: Comprehensive input validation
- ✅ **Error Handling**: Proper error responses
- ✅ **Documentation**: Complete API documentation

The many-to-many bouquet relationship system is now fully implemented and ready for production use!

const mysql = require("mysql2/promise");

// Database configuration
const dbConfig = {
  host: process.env.DATABASE_HOST || "localhost",
  port: process.env.DATABASE_PORT || 3306,
  user: process.env.DATABASE_USERNAME || "mysql",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE || "iptv",
};

async function migrateCategoryFlow() {
  let connection;

  try {
    console.log("Starting category flow migration...");

    // Create database connection
    connection = await mysql.createConnection(dbConfig);

    // Step 1: Create the new application_categories table
    console.log("Creating application_categories table...");
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS application_categories (
        id VARCHAR(36) PRIMARY KEY,
        application_id VARCHAR(36) NOT NULL,
        category_id VARCHAR(36) NOT NULL,
        alias VARCHAR(255) NULL,
        \`order\` INT DEFAULT 0,
        status BOOLEAN DEFAULT TRUE,
        deleted_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_application_category (application_id, category_id)
      )
    `);

    // Step 2: Migrate existing data from categories table to application_categories
    console.log("Migrating existing category-application relationships...");
    const [existingCategories] = await connection.execute(`
      SELECT id, application_id, \`order\`, status, created_at, updated_at
      FROM categories 
      WHERE application_id IS NOT NULL
    `);

    for (const category of existingCategories) {
      try {
        await connection.execute(
          `
          INSERT INTO application_categories (id, application_id, category_id, \`order\`, status, created_at, updated_at)
          VALUES (UUID(), ?, ?, ?, ?, ?, ?)
        `,
          [
            category.application_id,
            category.id,
            category.order,
            category.status,
            category.created_at,
            category.updated_at,
          ]
        );
        console.log(
          `Migrated category ${category.id} for application ${category.application_id}`
        );
      } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
          console.log(
            `Relationship already exists for category ${category.id} and application ${category.application_id}`
          );
        } else {
          console.error(
            `Error migrating category ${category.id}:`,
            error.message
          );
        }
      }
    }

    // Step 3: Remove application_id column from categories table
    console.log("Removing application_id column from categories table...");
    try {
      await connection.execute(`
        ALTER TABLE categories DROP COLUMN application_id
      `);
      console.log(
        "Successfully removed application_id column from categories table"
      );
    } catch (error) {
      console.log(
        "application_id column might not exist or already removed:",
        error.message
      );
    }

    // Step 4: Remove application_id column from sub_categories table if it exists
    console.log("Checking for application_id in sub_categories table...");
    try {
      const [columns] = await connection.execute(`
        SHOW COLUMNS FROM sub_categories LIKE 'application_id'
      `);

      if (columns.length > 0) {
        await connection.execute(`
          ALTER TABLE sub_categories DROP COLUMN application_id
        `);
        console.log(
          "Successfully removed application_id column from sub_categories table"
        );
      } else {
        console.log(
          "application_id column does not exist in sub_categories table"
        );
      }
    } catch (error) {
      console.log("Error checking sub_categories table:", error.message);
    }

    console.log("Category flow migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateCategoryFlow()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

module.exports = { migrateCategoryFlow };

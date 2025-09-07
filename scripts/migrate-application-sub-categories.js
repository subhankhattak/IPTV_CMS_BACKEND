const mysql = require("mysql2/promise");

// Database configuration
const dbConfig = {
  host: process.env.DATABASE_HOST || "localhost",
  port: process.env.DATABASE_PORT || 3306,
  user: process.env.DATABASE_USERNAME || "mysql",
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE || "iptv",
};

async function migrateApplicationSubCategories() {
  let connection;

  try {
    console.log("Starting application-sub-categories migration...");

    // Create database connection
    connection = await mysql.createConnection(dbConfig);

    // Step 1: Create the new application_sub_categories table
    console.log("Creating application_sub_categories table...");
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS application_sub_categories (
        id VARCHAR(36) PRIMARY KEY,
        application_id VARCHAR(36) NOT NULL,
        sub_category_id VARCHAR(36) NOT NULL,
        alias VARCHAR(255) NULL,
        \`order\` INT DEFAULT 0,
        status BOOLEAN DEFAULT TRUE,
        deleted_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_application_sub_category (application_id, sub_category_id),
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE,
        FOREIGN KEY (sub_category_id) REFERENCES sub_categories(id) ON DELETE CASCADE
      )
    `);

    console.log(
      "✅ Application-sub-categories migration completed successfully!"
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  migrateApplicationSubCategories()
    .then(() => {
      console.log("Migration completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

module.exports = { migrateApplicationSubCategories };

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// Load env variables
require("dotenv").config();

async function run() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const migrationFile = path.join(__dirname, "../drizzle/0001_silly_the_hunter.sql");
  if (!fs.existsSync(migrationFile)) {
    throw new Error(`Migration file not found at: ${migrationFile}`);
  }

  const sql = fs.readFileSync(migrationFile, "utf8");
  const statements = sql.split("--> statement-breakpoint");

  console.log("Executing SQL migration statements directly...");
  for (const stmt of statements) {
    const query = stmt.trim();
    if (query) {
      console.log(`Executing query statement: ${query.substring(0, 60)}...`);
      await pool.query(query);
    }
  }

  console.log("Migration applied successfully!");
  await pool.end();
}

run().catch((err) => {
  console.error("Migration script failed:", err);
  process.exit(1);
});

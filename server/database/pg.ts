// server/db.ts
import { Pool } from "pg";

// Netlify (with Neon) will provide DATABASE_URL automatically
const pool = new Pool({
  connectionString: process.env.NETLIFY_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // important for cloud DBs like Neon
  },
});

export async function getUsers() {
  const result = await pool.query("SELECT * FROM users");
  return result.rows;
}

export default pool;

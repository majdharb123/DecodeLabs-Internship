import "dotenv/config";
import pg from "pg";

const { Pool, types } = pg;

types.setTypeParser(1082, (value) => value);

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

export async function testDatabaseConnection() {
    await pool.query("SELECT 1");
    console.log("PostgreSQL connected successfully");
}

export default pool;
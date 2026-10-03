import "dotenv/config";
import pg from "pg";

const { Pool, types } = pg;

types.setTypeParser(1082, (value) => value);
types.setTypeParser(1700, (value) => Number(value));

const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
    }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    };

const pool = new Pool(poolConfig);

export async function testDatabaseConnection() {
    await pool.query("SELECT 1");
    console.log("PostgreSQL connected successfully");
}

export default pool;
import app from "./app.js";
import pool, { testDatabaseConnection } from "./config/database.js";

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
    try {
        await testDatabaseConnection();

        const server = app.listen(PORT, () => {
            console.log(`ExpenseFlow API running on http://localhost:${PORT}`);
        });

        async function shutdown() {
            server.close(async () => {
                await pool.end();
                process.exit(0);
            });
        }

        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);
    } catch (error) {
        console.error("Failed to start ExpenseFlow API:", error.message);
        process.exit(1);
    }
}

startServer();
import "dotenv/config";
import app from "./app.js";
import { testDatabaseConnection } from "./config/database.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await testDatabaseConnection();
    app.listen(PORT, () => {
      console.log(`Task Manager API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("Failed to connect to PostgreSQL:",error.message);
  }
}

startServer();
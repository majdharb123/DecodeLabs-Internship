import cors from "cors";
import express from "express";
import categoryRoutes from "./routes/category.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);

app.get("/api/health", (request, response) => {
    response.status(200).json({
        status: "success",
        message: "ExpenseFlow API is running",
    });
});

app.use((request, response) => {
    response.status(404).json({
        status: "error",
        message: "Route not found",
    });
});

app.use((error, request, response, next) => {
    console.error(error);

    response.status(500).json({
        status: "error",
        message: "Internal server error",
    });
});

export default app;
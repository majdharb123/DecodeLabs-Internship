import express from "express";
import cors from "cors";
import taskRoutes from "./routes/task.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (request,response) => {
    response.status(200).json({
        status: "Success",
        message: "Task Manager API is Running",
    });
});

app.use("/api/tasks", taskRoutes);

app.use((request,response) => {
    response.status(404).json({
        status: "Error",
        message: "Route not found",
    });
});

export default app;
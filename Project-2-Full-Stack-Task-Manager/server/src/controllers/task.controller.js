import pool from "../config/database.js";

const ALLOWED_PRIORITIES = ["low","medium","high"];

function isValidDueDate(value){
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if(!datePattern.test(value))
        return false;

    const date = new Date(`${value}T00:00:00.000Z`);

    return(
        !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === value
    );
}

function isValidTaskId(value) {
  const taskId = Number(value);

  return Number.isInteger(taskId) && taskId > 0;
}

// Get Tasks
export async function getTasks(request,response) {
    try{
        const result = await pool.query(`
        SELECT
          id,
          title,
          description,
          priority,
          due_date,
          completed,
          created_at,
          updated_at
        FROM tasks
        ORDER BY created_at DESC, id DESC
        `);

        response.status(200).json({
            status: "success",
            count: result.rowCount,
            data: result.rows,
        });
    }catch(error){
        console.error("Failed to get tasks:",error.message);

        response.status(500).json({
            status: "error",
            message: "Could not get Tasks",
        });
    }
}

// Post Tasks
export async function createTask(request,response) {
    try{
        const {
            title,
            description = "",
            priority = "medium",
            due_date = null,
        } = request.body;

        if(typeof title !== "string" || title.trim() === ""){
            return response.status(400).json({
                status: "error",
                message: "Title is required",
            });
        }

        if(title.trim().length > 120){
            return response.status(400).json({
                status: "error",
                message: " Title must not exceed 120 characters",
            });
        }

        if(description !== null && typeof description !== "string"){
            return response.status(400).json({
                status: "error",
                message: "Description must be text",
            });
        }

        if(!ALLOWED_PRIORITIES.includes(priority))
        {
            return response.status(400).json({
                status: "error",
                message: "Priority must be low,medium,high",
            });
        }

        const normalizedDueDate = due_date === "" ? null : due_date;

        if(normalizedDueDate !== null &&
            typeof normalizedDueDate !== "string" ||
            !isValidDueDate(normalizedDueDate)
        )
        {
            return response.status(400).json({
                status: "error",
                message: "Due date must use the YYYY-MM-DD format",
            });
        }

        const cleanDescription = description?.trim() || null;

        const result = await pool.query(`
          INSERT INTO tasks (
            title,
            description,
            priority,
            due_date
          )
          VALUES ($1,$2,$3,$4)
          RETURNING
            id,
            title,
            description,
            priority,
            due_date,
            completed,
            created_at,
            updated_at
        `,[title.trim(),cleanDescription,priority,normalizedDueDate]);

        response.status(201).json({
            status: "success",
            data: result.rows[0],
        });
    }catch(error){
        console.error("Failed to create task:",error.message);
        response.status(500).json({
            status: "error",
            message: "Could not create task",
        });
    }
}

// Update Task
export async function updateTask(request, response) {
  try {
    const { id } = request.params;

    const {
      title,
      description,
      priority,
      due_date,
      completed,
    } = request.body;

    if (!isValidTaskId(id)) {
      return response.status(400).json({
        status: "error",
        message: "Task ID must be a positive integer",
      });
    }

    const hasUpdates = [
      title,
      description,
      priority,
      due_date,
      completed,
    ].some((value) => value !== undefined);

    if (!hasUpdates) {
      return response.status(400).json({
        status: "error",
        message: "Provide at least one field to update",
      });
    }

    if (
      title !== undefined &&
      (typeof title !== "string" || title.trim() === "")
    ) {
      return response.status(400).json({
        status: "error",
        message: "Title must be non-empty text",
      });
    }

    if (title !== undefined && title.trim().length > 120) {
      return response.status(400).json({
        status: "error",
        message: "Title must not exceed 120 characters",
      });
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return response.status(400).json({
        status: "error",
        message: "Description must be text",
      });
    }

    if (
      priority !== undefined &&
      !ALLOWED_PRIORITIES.includes(priority)
    ) {
      return response.status(400).json({
        status: "error",
        message: "Priority must be low, medium, or high",
      });
    }

    if (
      due_date !== undefined &&
      due_date !== null &&
      due_date !== "" &&
      (typeof due_date !== "string" || !isValidDueDate(due_date))
    ) {
      return response.status(400).json({
        status: "error",
        message: "Due date must use the YYYY-MM-DD format",
      });
    }

    if (
      completed !== undefined &&
      typeof completed !== "boolean"
    ) {
      return response.status(400).json({
        status: "error",
        message: "Completed must be true or false",
      });
    }

    const existingResult = await pool.query(
      "SELECT * FROM tasks WHERE id = $1",
      [id]
    );

    if (existingResult.rowCount === 0) {
      return response.status(404).json({
        status: "error",
        message: "Task not found",
      });
    }

    const currentTask = existingResult.rows[0];

    const updatedTitle =
      title === undefined ? currentTask.title : title.trim();

    const updatedDescription =
      description === undefined
        ? currentTask.description
        : description?.trim() || null;

    const updatedPriority =
      priority === undefined ? currentTask.priority : priority;

    const updatedDueDate =
      due_date === undefined
        ? currentTask.due_date
        : due_date === ""
          ? null
          : due_date;

    const updatedCompleted =
      completed === undefined ? currentTask.completed : completed;

    const result = await pool.query(
      `
        UPDATE tasks
        SET
          title = $1,
          description = $2,
          priority = $3,
          due_date = $4,
          completed = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING
          id,
          title,
          description,
          priority,
          due_date,
          completed,
          created_at,
          updated_at
      `,
      [
        updatedTitle,
        updatedDescription,
        updatedPriority,
        updatedDueDate,
        updatedCompleted,
        id,
      ]
    );

    response.status(200).json({
      status: "success",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to update task:", error.message);

    response.status(500).json({
      status: "error",
      message: "Could not update task",
    });
  }
}

// Delete Task
export async function deleteTask(request, response) {
  try {
    const { id } = request.params;

    if (!isValidTaskId(id)) {
      return response.status(400).json({
        status: "error",
        message: "Task ID must be a positive integer",
      });
    }

    const result = await pool.query(
      `
        DELETE FROM tasks
        WHERE id = $1
        RETURNING
          id,
          title,
          description,
          priority,
          due_date,
          completed,
          created_at,
          updated_at
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return response.status(404).json({
        status: "error",
        message: "Task not found",
      });
    }

    response.status(200).json({
      status: "success",
      message: "Task deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to delete task:", error.message);

    response.status(500).json({
      status: "error",
      message: "Could not delete task",
    });
  }
}
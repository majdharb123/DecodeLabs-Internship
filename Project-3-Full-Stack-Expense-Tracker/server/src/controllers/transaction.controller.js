import pool from "../config/database.js";

const allowedTypes = ["income", "expense"];
const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
const datePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function isValidDate(value) {
  if (typeof value !== "string" || !datePattern.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  return (
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day
  );
}

export async function getTransactions(request, response, next) {
  try {
    const month = request.query.month?.trim();
    const type = request.query.type?.trim().toLowerCase();
    const categoryIdValue = request.query.categoryId;
    const search = request.query.search?.trim();

    if (month && !monthPattern.test(month)) {
      return response.status(400).json({
        status: "error",
        message: "Month must use the YYYY-MM format",
      });
    }

    if (type && !allowedTypes.includes(type)) {
      return response.status(400).json({
        status: "error",
        message: "Type must be income or expense",
      });
    }

    const conditions = [];
    const values = [];

    if (month) {
      values.push(`${month}-01`);

      const monthParameter = `$${values.length}`;

      conditions.push(`
        t.transaction_date >= ${monthParameter}::date
        AND t.transaction_date <
            ${monthParameter}::date + INTERVAL '1 month'
    `);
    }

    if (type) {
      values.push(type);
      conditions.push(`t.type = $${values.length}`);
    }

    if (categoryIdValue !== undefined) {
      const categoryId = Number(categoryIdValue);

      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return response.status(400).json({
          status: "error",
          message: "Invalid category ID",
        });
      }

      values.push(categoryId);
      conditions.push(`t.category_id = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);

      const searchParameter = `$${values.length}`;

      conditions.push(`
        (
            t.title ILIKE ${searchParameter}
            OR t.notes ILIKE ${searchParameter}
        )
    `);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await pool.query(
      `
                SELECT
                    t.id,
                    t.title,
                    t.amount,
                    t.type,
                    t.category_id,
                    t.transaction_date,
                    t.notes,
                    t.created_at,
                    t.updated_at,
                    json_build_object(
                        'id', c.id,
                        'name', c.name,
                        'color', c.color,
                        'icon', c.icon
                    )AS category
                FROM transactions AS t
                INNER JOIN categories AS c
                    ON c.id = t.category_id
                ${whereClause}
                ORDER BY
                    t.transaction_date DESC,
                    t.id DESC
            `,
      values,
    );

    return response.status(200).json({
      status: "success",
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
}

export async function createTransaction(request, response, next) {
  try {
    const title =
      typeof request.body.title === "string" ? request.body.title.trim() : "";

    const type =
      typeof request.body.type === "string"
        ? request.body.type.trim().toLowerCase()
        : "";

    const notes =
      typeof request.body.notes === "string" && request.body.notes.trim()
        ? request.body.notes.trim()
        : null;

    const amount = Number(request.body.amount);
    const categoryId = Number(request.body.categoryId);
    const transactionDate = request.body.transactionDate;

    if (!title) {
      return response.status(400).json({
        status: "error",
        message: "Title is required",
      });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return response.status(400).json({
        status: "error",
        message: "Amount must be greater than zero",
      });
    }

    if (!allowedTypes.includes(type)) {
      return response.status(400).json({
        status: "error",
        message: "Type must be income or expense",
      });
    }

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return response.status(400).json({
        status: "error",
        message: "Invalid category ID",
      });
    }

    if (!isValidDate(transactionDate)) {
      return response.status(400).json({
        status: "error",
        message: "Transaction date must use the YYYY-MM-DD format",
      });
    }

    const categoryResult = await pool.query(
      `
                SELECT id
                FROM categories
                WHERE id = $1 AND type = $2
            `,
      [categoryId, type],
    );

    if (categoryResult.rowCount === 0) {
      return response.status(400).json({
        status: "error",
        message:
          "Category was not found or does not match the transaction type",
      });
    }

    const result = await pool.query(
      `
                WITH inserted_transaction AS (
                    INSERT INTO transactions (
                        title,
                        amount,
                        type,
                        category_id,
                        transaction_date,
                        notes
                    )
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *
                )
                SELECT
                    transaction.id,
                    transaction.title,
                    transaction.amount,
                    transaction.type,
                    transaction.category_id,
                    transaction.transaction_date,
                    transaction.notes,
                    transaction.created_at,
                    transaction.updated_at,
                    json_build_object(
                        'id', category.id,
                        'name', category.name,
                        'color', category.color,
                        'icon', category.icon
                    ) AS category
                FROM inserted_transaction AS transaction
                INNER JOIN categories AS category
                    ON category.id = transaction.category_id
            `,
      [title, amount, type, categoryId, transactionDate, notes],
    );

    return response.status(201).json({
      status: "success",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTransaction(request, response, next) {
  try {
    const transactionId = Number(request.params.id);

    const title =
      typeof request.body.title === "string" ? request.body.title.trim() : "";

    const type =
      typeof request.body.type === "string"
        ? request.body.type.trim().toLowerCase()
        : "";

    const notes =
      typeof request.body.notes === "string" && request.body.notes.trim()
        ? request.body.notes.trim()
        : null;

    const amount = Number(request.body.amount);
    const categoryId = Number(request.body.categoryId);
    const transactionDate = request.body.transactionDate;

    if (!Number.isInteger(transactionId) || transactionId <= 0) {
      return response.status(400).json({
        status: "error",
        message: "Invalid transaction ID",
      });
    }

    if (!title) {
      return response.status(400).json({
        status: "error",
        message: "Title is required",
      });
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return response.status(400).json({
        status: "error",
        message: "Amount must be greater than zero",
      });
    }

    if (!allowedTypes.includes(type)) {
      return response.status(400).json({
        status: "error",
        message: "Type must be income or expense",
      });
    }

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      return response.status(400).json({
        status: "error",
        message: "Invalid category ID",
      });
    }

    if (!isValidDate(transactionDate)) {
      return response.status(400).json({
        status: "error",
        message: "Transaction date must use the YYYY-MM-DD format",
      });
    }

    const categoryResult = await pool.query(
      `
                SELECT id
                FROM categories
                WHERE id = $1 AND type = $2
            `,
      [categoryId, type],
    );

    if (categoryResult.rowCount === 0) {
      return response.status(400).json({
        status: "error",
        message:
          "Category was not found or does not match the transaction type",
      });
    }

    const result = await pool.query(
      `
                WITH updated_transaction AS (
                    UPDATE transactions
                    SET
                        title = $1,
                        amount = $2,
                        type = $3,
                        category_id = $4,
                        transaction_date = $5,
                        notes = $6,
                        updated_at = NOW()
                    WHERE id = $7
                    RETURNING *
                )
                SELECT
                    transaction.id,
                    transaction.title,
                    transaction.amount,
                    transaction.type,
                    transaction.category_id,
                    transaction.transaction_date,
                    transaction.notes,
                    transaction.created_at,
                    transaction.updated_at,
                    json_build_object(
                        'id', category.id,
                        'name', category.name,
                        'color', category.color,
                        'icon', category.icon
                    ) AS category
                FROM updated_transaction AS transaction
                INNER JOIN categories AS category
                    ON category.id = transaction.category_id
            `,
      [title, amount, type, categoryId, transactionDate, notes, transactionId],
    );

    if (result.rowCount === 0) {
      return response.status(404).json({
        status: "error",
        message: "Transaction not found",
      });
    }

    return response.status(200).json({
      status: "success",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function getTransactionById(request, response, next) {
  try {
    const transactionId = Number(request.params.id);

    if (!Number.isInteger(transactionId) || transactionId <= 0) {
      return response.status(400).json({
        status: "error",
        message: "Invalid transaction ID",
      });
    }

    const result = await pool.query(
      `
                SELECT
                    transaction.id,
                    transaction.title,
                    transaction.amount,
                    transaction.type,
                    transaction.category_id,
                    transaction.transaction_date,
                    transaction.notes,
                    transaction.created_at,
                    transaction.updated_at,
                    json_build_object(
                        'id', category.id,
                        'name', category.name,
                        'color', category.color,
                        'icon', category.icon
                    ) AS category
                FROM transactions AS transaction
                INNER JOIN categories AS category
                    ON category.id = transaction.category_id
                WHERE transaction.id = $1
            `,
      [transactionId],
    );

    if (result.rowCount === 0) {
      return response.status(404).json({
        status: "error",
        message: "Transaction not found",
      });
    }

    return response.status(200).json({
      status: "success",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTransaction(request, response, next) {
  try {
    const transactionId = Number(request.params.id);

    if (!Number.isInteger(transactionId) || transactionId <= 0) {
      return response.status(400).json({
        status: "error",
        message: "Invalid transaction ID",
      });
    }

    const result = await pool.query(
      `
                DELETE FROM transactions
                WHERE id = $1
                RETURNING
                    id,
                    title,
                    amount,
                    type,
                    category_id,
                    transaction_date,
                    notes,
                    created_at,
                    updated_at
            `,
      [transactionId],
    );

    if (result.rowCount === 0) {
      return response.status(404).json({
        status: "error",
        message: "Transaction not found",
      });
    }

    return response.status(200).json({
      status: "success",
      message: "Transaction deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

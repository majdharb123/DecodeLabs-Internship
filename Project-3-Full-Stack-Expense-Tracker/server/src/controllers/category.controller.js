import pool from "../config/database.js";

const allowedTypes = ["income", "expense"];
const colorPattern = /^#[0-9A-Fa-f]{6}$/;

export async function getCategories(request, response, next) {
    try {
        const type = request.query.type?.trim().toLowerCase();

        if (type && !allowedTypes.includes(type)) {
            return response.status(400).json({
                status: "error",
                message: "Type must be income or expense",
            });
        }

        const values = [];
        let query = `
            SELECT
                id,
                name,
                type,
                color,
                icon,
                created_at,
                updated_at
            FROM categories
        `;

        if (type) {
            values.push(type);
            query += ` WHERE type = $1`;
        }

        query += ` ORDER BY type ASC, name ASC`;

        const result = await pool.query(query, values);

        return response.status(200).json({
            status: "success",
            count: result.rowCount,
            data: result.rows,
        });
    } catch (error) {
        next(error);
    }
}

export async function createCategory(request, response, next) {
    try {
        const name = request.body.name?.trim();
        const type = request.body.type?.trim().toLowerCase();
        const color = request.body.color?.trim();
        const icon = request.body.icon?.trim() || "circle";

        if (!name || !type || !color) {
            return response.status(400).json({
                status: "error",
                message: "Name, type, and color are required",
            });
        }

        if (!allowedTypes.includes(type)) {
            return response.status(400).json({
                status: "error",
                message: "Type must be income or expense",
            });
        }

        if (!colorPattern.test(color)) {
            return response.status(400).json({
                status: "error",
                message: "Color must use a valid hexadecimal format",
            });
        }

        const result = await pool.query(
            `
                INSERT INTO categories (name, type, color, icon)
                VALUES ($1, $2, $3, $4)
                RETURNING
                    id,
                    name,
                    type,
                    color,
                    icon,
                    created_at,
                    updated_at
            `,
            [name, type, color, icon],
        );

        return response.status(201).json({
            status: "success",
            data: result.rows[0],
        });
    } catch (error) {
        if (error.code === "23505") {
            return response.status(409).json({
                status: "error",
                message: "This category already exists",
            });
        }

        next(error);
    }
}

export async function updateCategory(request, response, next) {
    try {
        const categoryId = Number(request.params.id);
        const name = request.body.name?.trim();
        const type = request.body.type?.trim().toLowerCase();
        const color = request.body.color?.trim();
        const icon = request.body.icon?.trim() || "circle";

        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            return response.status(400).json({
                status: "error",
                message: "Invalid category ID",
            });
        }

        if (!name || !type || !color) {
            return response.status(400).json({
                status: "error",
                message: "Name, type, and color are required",
            });
        }

        if (!allowedTypes.includes(type)) {
            return response.status(400).json({
                status: "error",
                message: "Type must be income or expense",
            });
        }

        if (!colorPattern.test(color)) {
            return response.status(400).json({
                status: "error",
                message: "Color must use a valid hexadecimal format",
            });
        }

        const result = await pool.query(
            `
                UPDATE categories
                SET
                    name = $1,
                    type = $2,
                    color = $3,
                    icon = $4,
                    updated_at = NOW()
                WHERE id = $5
                RETURNING
                    id,
                    name,
                    type,
                    color,
                    icon,
                    created_at,
                    updated_at
            `,
            [name, type, color, icon, categoryId],
        );

        if (result.rowCount === 0) {
            return response.status(404).json({
                status: "error",
                message: "Category not found",
            });
        }

        return response.status(200).json({
            status: "success",
            data: result.rows[0],
        });
    } catch (error) {
        if (error.code === "23505") {
            return response.status(409).json({
                status: "error",
                message: "This category already exists",
            });
        }

        next(error);
    }
}

export async function deleteCategory(request, response, next) {
    try {
        const categoryId = Number(request.params.id);

        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            return response.status(400).json({
                status: "error",
                message: "Invalid category ID",
            });
        }

        const result = await pool.query(
            `
                DELETE FROM categories
                WHERE id = $1
                RETURNING id, name, type, color, icon
            `,
            [categoryId],
        );

        if (result.rowCount === 0) {
            return response.status(404).json({
                status: "error",
                message: "Category not found",
            });
        }

        return response.status(200).json({
            status: "success",
            message: "Category deleted successfully",
            data: result.rows[0],
        });
    } catch (error) {
        if (["23001", "23503"].includes(error.code)) {
            return response.status(409).json({
                status: "error",
                message: "Category cannot be deleted because it is used by transactions",
            });
        }

        next(error);
    }
}
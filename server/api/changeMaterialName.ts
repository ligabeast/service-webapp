import { defineEventHandler, readBody } from "h3";
import mysql from "mysql2/promise";

// Datenbankkonfiguration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306"),
};

export default defineEventHandler(async (event) => {
  let connection;

  try {
    // Parse request body
    const { materialId, newName } = await readBody(event);

    if (!materialId || !newName) {
      return {
        status: "error",
        message: "Material ID and new name are required",
      };
    }

    // Connect to the database
    connection = await mysql.createConnection(dbConfig);

    // Check if the name already exists
    const checkSql = "SELECT COUNT(*) AS count FROM material WHERE name = ?";
    const [checkResult] = await connection.execute(checkSql, [newName]);

    if (checkResult[0].count > 0) {
      return {
        status: "error",
        message: "Material name already exists",
      };
    }

    // Update the material name if it doesn't exist
    const updateSql = "UPDATE material SET name = ? WHERE id = ?";
    const [updateResult] = await connection.execute(updateSql, [
      newName,
      materialId,
    ]);

    if (updateResult.affectedRows === 0) {
      return {
        status: "error",
        message: "Material not found or no changes made",
      };
    }

    return {
      status: "success",
      message: "Material name updated successfully",
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to update material name",
      error: error.message,
    };
  } finally {
    if (connection) {
      await connection.end(); // Close connection
    }
  }
});

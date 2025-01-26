import { defineEventHandler, getQuery } from "h3";
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
    // Verbindung zur Datenbank herstellen
    connection = await mysql.createConnection(dbConfig);

    // SQL-Abfrage, um die Checkliste des Benutzers zu holen
    const sql = `
      SELECT mc.id AS checklistId, mc.assignedFrom, mc.createdAt, m.name AS materialName
      FROM materialchecklist mc
      JOIN material m ON mc.materialid = m.id
      WHERE mc.assignedTo = ?
      ORDER BY mc.createdAt DESC;
    `;
    const params = [event.context.user.userId];

    const [rows] = await connection.execute(sql, params);

    return {
      status: "success",
      message: "Checklist retrieved successfully",
      data: rows,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: "Failed to retrieve checklist",
      error: error.message,
    };
  } finally {
    if (connection) {
      await connection.end(); // Verbindung schließen
    }
  }
});

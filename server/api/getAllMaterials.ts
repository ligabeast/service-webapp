import { defineEventHandler } from "h3";
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

    // SQL-Abfrage, um Materialien zu filtern, die noch nicht in materialchecklist sind
    const sql = `
      SELECT m.id, m.name
      FROM material m
      WHERE NOT EXISTS (
        SELECT 1
        FROM materialchecklist mc
        WHERE mc.materialid = m.id and 
        mc.assignedTo = ?
      );
    `;
    const params = [event.context.userId];
    const [rows] = await connection.execute(sql, params);

    return {
      status: "success",
      message: "Filtered materials retrieved successfully",
      data: rows,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: "Failed to retrieve materials",
      error: error.message,
    };
  } finally {
    if (connection) {
      await connection.end(); // Verbindung schließen
    }
  }
});

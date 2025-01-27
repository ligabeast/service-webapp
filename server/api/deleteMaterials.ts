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
    // Body der Anfrage lesen
    const body = await readBody(event);

    // Prüfen, ob IDs vorhanden sind
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return {
        status: "error",
        message: "No valid IDs provided",
      };
    }

    // Aktuellen Benutzer aus dem Kontext abrufen
    const userId = event.context.userId;

    if (!userId) {
      return {
        status: "error",
        message: "User not authenticated",
      };
    }

    if (!event.context.user.isAdmin) {
      return {
        status: "error",
        message: "You are not authorized to delete this entry",
      };
    }

    connection = await mysql.createConnection(dbConfig);

    const ids = body.ids;

    const sql = `
      DELETE FROM material
      WHERE id IN (${ids.map(() => "?").join(",")})
    `;

    const [result] = await connection.execute(sql, [...ids]);

    return {
      status: "success",
      message: `${result.affectedRows} entries deleted`,
      data: result,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: "Failed to delete entries",
      error: error.message,
    };
  } finally {
    if (connection) {
      await connection.end(); // Verbindung schließen
    }
  }
});

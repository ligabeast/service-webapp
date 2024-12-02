import mysql from "mysql2/promise";
import { defineEventHandler, getQuery } from "h3";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306"),
};

export default defineEventHandler(async (event) => {
  // Hole die Query-Parameter (optional, z. B. user_id)
  const query = getQuery(event);
  const userId: any = event.context.userId;
  let connection;

  try {
    // Verbindung zur Datenbank herstellen
    connection = await mysql.createConnection(dbConfig);

    // SQL-Abfrage vorbereiten
    let sql = "SELECT id, user_id, comment FROM sys.PredefinedComments";
    const params: any[] = [];

    if (userId) {
      sql += " WHERE user_id = ?";
      params.push(userId);
    }

    // Abfrage ausführen
    const [rows] = await connection.execute(sql, params);

    // Ergebnisse zurückgeben
    return {
      success: true,
      data: rows,
    };
  } catch (error) {
    // Fehlerbehandlung
    console.error("Database Error:", error);
    return {
      success: false,
      message: "Fehler beim Abrufen der vordefinierten Kommentare.",
    };
  } finally {
    // Verbindung schließen
    if (connection) {
      await connection.end();
    }
  }
});

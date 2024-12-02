import mysql from "mysql2/promise";
import { defineEventHandler, readBody } from "h3";

// Datenbankkonfiguration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306"),
};

export default defineEventHandler(async (event): Promise<any> => {
  const connection = await mysql.createConnection(dbConfig);
  const userId: any = event.context.userId;

  try {
    // Lese die Daten aus der Anfrage
    const body = await readBody(event);

    if (!body.comment) {
      return {
        status: "error",
        message: "Fehlende Felder: 'user_id' und 'comment' sind erforderlich.",
      };
    }

    // SQL-Befehl zum Einfügen des neuen Kommentars
    const sql =
      "INSERT INTO sys.PredefinedComments (user_id, comment) VALUES (?, ?)";
    const params = [userId, body.comment];

    // Führe die Einfügeoperation aus
    const [result] = await connection.execute(sql, params);

    return {
      status: "success",
      message: "Kommentar erfolgreich hinzugefügt.",
    };
  } catch (error) {
    // Fehlerbehandlung
    console.error("Error adding comment:", error);
    return {
      status: "error",
      message: "Fehler beim Hinzufügen des Kommentars.",
      error: error instanceof Error ? error.message : error,
    };
  } finally {
    // Verbindung schließen
    if (connection) {
      await connection.end();
    }
  }
});

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
  const user = event.context.user;

  try {
    // Body der Anfrage auslesen
    const body = await readBody(event);

    if (!body.materialId) {
      return {
        status: "error",
        message: "Material ID is required",
      };
    }

    // Verbindung zur Datenbank herstellen
    connection = await mysql.createConnection(dbConfig);

    // SQL-Abfrage zum Einfügen eines neuen Eintrags
    const sql = `
      INSERT INTO materialchecklist (materialid, assignedFrom, assignedTo, createdAt)
      VALUES (?, ?, ?,?);
    `;
    const params = [
      body.materialId, // Material-ID aus dem Body
      user.username, // Optional: assignedFrom aus dem Body oder null
      user.userId, // assignedTo aus dem Kontext
      new Date(), // Erstellungsdatum (aktuelles Datum)
    ];

    const [result] = await connection.execute(sql, params);

    return {
      status: "success",
      message: "Material added to checklist successfully",
      data: result,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: "Failed to add material to checklist",
      error: error.message,
    };
  } finally {
    if (connection) {
      await connection.end(); // Verbindung schließen
    }
  }
});

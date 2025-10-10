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
    // Request Body lesen
    const { orderId, newAddress } = await readBody(event);

    if (!orderId || !newAddress) {
      return {
        status: "error",
        message: "orderId und newAddress sind erforderlich",
      };
    }

    // Verbindung zur Datenbank
    connection = await mysql.createConnection(dbConfig);

    // Prüfen, ob Order existiert
    const [checkRows] = await connection.execute<any[]>(
      `SELECT id, adress FROM sys.OrdersStarted WHERE id = ?`,
      [orderId]
    );

    if (checkRows.length === 0) {
      return {
        status: "error",
        message: `Kein Auftrag mit der ID ${orderId} gefunden`,
      };
    }

    // Adresse aktualisieren
    const [updateResult] = await connection.execute(
      `UPDATE sys.OrdersStarted SET adress = ? WHERE id = ?`,
      [newAddress, orderId]
    );

    if ((updateResult as any).affectedRows === 0) {
      return {
        status: "error",
        message: "Adresse konnte nicht aktualisiert werden",
      };
    }

    return {
      status: "success",
      message: "Adresse wurde erfolgreich aktualisiert",
      data: {
        orderId,
        oldAddress: checkRows[0].adress,
        newAddress,
      },
    };
  } catch (error: any) {
    console.error("[updateOrderAddress ERROR]", error);
    return {
      status: "error",
      message: "Fehler beim Aktualisieren der Adresse",
      error: error.message,
    };
  } finally {
    if (connection) await connection.end();
  }
});

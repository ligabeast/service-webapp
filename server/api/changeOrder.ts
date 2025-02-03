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
    const { orderid, target, value } = body;

    // Überprüfen, ob alle notwendigen Felder vorhanden sind
    if (!orderid || !target || value === undefined) {
      return {
        status: "error",
        message: "Missing required fields: orderid, target, or value",
      };
    }

    // Verbindung zur Datenbank herstellen
    connection = await mysql.createConnection(dbConfig);

    // Sicherstellen, dass nur erlaubte Spalten bearbeitet werden können
    const allowedFields = [
      "commentInternal",
      "commentCopy",
      "ne3Status",
      "positions",
    ];
    if (!allowedFields.includes(target)) {
      return {
        status: "error",
        message: `Invalid target field: ${target}`,
      };
    }

    if (target === "ne3Status") {
      let tmpSql = "";
      if (value === "Ne3-Fehler vorhanden") {
        tmpSql = `UPDATE Orders SET ne3error = 'Ja', ne3errorRemoved = 'Nein' WHERE id = ?`;
      } else if (value === "Ne3-Fehler vorhanden und beseitigt") {
        tmpSql = `UPDATE Orders SET ne3error = 'Ja' ,ne3errorRemoved = 'Ja' WHERE id = ?`;
      } else if (value === "Kein Ne3-Fehler vorhanden") {
        tmpSql = `UPDATE Orders SET ne3error = 'Nein' ,ne3errorRemoved = 'Nein' WHERE id = ?`;
      }
      const params = [orderid];
      const [result] = await connection.execute(tmpSql, params);
      return {
        status: "success",
        message: "Order updated successfully",
      };
    } else if (target === "positions") {
      try {
        await connection.beginTransaction();

        // Löschen
        const deleteSql = `DELETE FROM sys.Position_To_Orders WHERE order_id = ?`;
        await connection.execute(deleteSql, [orderid]);

        // Hinzufügen
        const insertSql = `INSERT INTO sys.Position_To_Orders (quantity, order_id, position_id, description) VALUES (?, ?, ?, ?)`;
        for (const position of value) {
          const { quantity, position_id, description } = position;
          await connection.execute(insertSql, [
            quantity,
            orderid,
            position_id,
            description,
          ]);
        }

        await connection.commit();

        return { status: "success", message: "Positions updated successfully" };
      } catch (error) {
        if (connection) await connection.rollback();
        throw error;
      } finally {
        if (connection) await connection.end();
      }
    }
    // SQL-Abfrage für das Update
    const sql = `UPDATE Orders SET ${target} = ? WHERE id = ?`;
    const params = [value, orderid];

    const [result] = await connection.execute(sql, params);

    if (result.affectedRows === 0) {
      return {
        status: "error",
        message: "Order not found or no changes made",
      };
    }

    return {
      status: "success",
      message: "Order updated successfully",
      data: {
        orderid,
        target,
        value,
      },
    };
  } catch (error: any) {
    console.error("Error updating order:", error);
    return {
      status: "error",
      message: "Failed to update order",
      error: error.message,
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

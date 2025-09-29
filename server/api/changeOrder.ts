import { defineEventHandler, readBody } from "h3";
import mysql from "mysql2/promise";

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
    const body = await readBody(event);
    const { orderid, target, value } = body;

    if (!orderid || !target || value === undefined) {
      return {
        status: "error",
        message: "Missing required fields: orderid, target, or value",
      };
    }

    connection = await mysql.createConnection(dbConfig);

    // 🧠 Hol dir die real target_id aus OrdersStarted
    const [targetRow] = await connection.execute(
      `SELECT target_id FROM sys.OrdersStarted WHERE id = ?`,
      [orderid]
    );

    if (!Array.isArray(targetRow) || targetRow.length === 0) {
      return {
        status: "error",
        message: "OrderStarted entry not found",
      };
    }

    const realOrderId = (targetRow[0] as any).target_id;

    if (!realOrderId) {
      return {
        status: "error",
        message: "No target_id found – Order was not yet completed",
      };
    }

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
        tmpSql = `UPDATE sys.Orders SET ne3error = 'Ja', ne3errorRemoved = 'Nein' WHERE id = ?`;
      } else if (value === "Ne3-Fehler vorhanden und beseitigt") {
        tmpSql = `UPDATE sys.Orders SET ne3error = 'Ja', ne3errorRemoved = 'Ja' WHERE id = ?`;
      } else if (value === "Kein Ne3-Fehler vorhanden") {
        tmpSql = `UPDATE sys.Orders SET ne3error = 'Nein', ne3errorRemoved = 'Nein' WHERE id = ?`;
      } else {
        return {
          status: "error",
          message: "Invalid ne3Status value",
        };
      }

      await connection.execute(tmpSql, [realOrderId]);

      return {
        status: "success",
        message: "Order ne3 status updated successfully",
      };
    } else if (target === "positions") {
      try {
        await connection.beginTransaction();

        // Erst alte Positionen löschen
        await connection.execute(
          `DELETE FROM sys.Position_To_Orders WHERE order_id = ?`,
          [realOrderId]
        );

        // Neue einfügen
        const insertSql = `INSERT INTO sys.Position_To_Orders (quantity, order_id, position_id, description) VALUES (?, ?, ?, ?)`;
        for (const position of value) {
          const { quantity, position_id, description } = position;
          await connection.execute(insertSql, [
            quantity,
            realOrderId,
            position_id,
            description,
          ]);
        }

        await connection.commit();

        return {
          status: "success",
          message: "Positions updated successfully",
        };
      } catch (err) {
        await connection.rollback();
        throw err;
      }
    }

    // Sonstige Felder wie commentInternal, commentCopy
    const sql = `UPDATE sys.Orders SET ${target} = ? WHERE id = ?`;
    const [result] = await connection.execute(sql, [value, realOrderId]);

    if (result.affectedRows === 0) {
      return {
        status: "error",
        message: "No changes made or order not found",
      };
    }

    return {
      status: "success",
      message: "Order field updated successfully",
      data: {
        orderid: realOrderId,
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

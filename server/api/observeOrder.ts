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
    const { orderId, observe } = await readBody(event);
    const userId = event.context.userId;

    if (orderId == null || observe == null) {
      return {
        status: "error",
        message: "Order ID and observe flag are required",
      };
    }

    // Connect to the database
    connection = await mysql.createConnection(dbConfig);

    if (observe) {
      const [existing] = await connection.execute<any[]>(
        "SELECT * FROM sys.OrderWatchlist WHERE order_id = ? AND user_id = ?",
        [orderId, userId]
      );
      if (existing.length > 0) {
        return {
          status: "success",
          message: "Order is already being observed",
        };
      }

      // Füge den Auftrag zur Beobachtungsliste hinzu
      const insertSql =
        "INSERT INTO sys.OrderWatchlist (order_id, user_id) VALUES (?, ?)";
      await connection.execute(insertSql, [orderId, userId]);
    } else {
      const deleteSql =
        "DELETE FROM sys.OrderWatchlist WHERE order_id = ? AND user_id = ?";
      await connection.execute(deleteSql, [orderId, userId]);
    }

    return {
      status: "success",
      message: "Order observation status updated successfully",
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to update order observation status",
      error: error.message,
    };
  } finally {
    if (connection) {
      await connection.end(); // Close connection
    }
  }
});

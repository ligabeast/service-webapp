import { defineEventHandler, getQuery } from "h3";
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
    const query = getQuery(event);
    const orderid = query.orderid;

    // Datenbankverbindung herstellen
    connection = await mysql.createConnection(dbConfig);

    let sql = "DELETE FROM sys.Orders WHERE id = ?;";
    const params: any[] = [orderid];

    const [rows] = await connection.execute(sql, params);

    return {
      status: "success",
      message: "Order deleted successfully",
      data: rows,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: "Failed to delete order",
      error: error,
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

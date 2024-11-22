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
  const userId = event.context.userId;

  try {
    connection = await mysql.createConnection(dbConfig);

    // SQL-Abfrage für Aufträge pro Tag
    const sql1 = `
      SELECT DATE(dateCreated) AS orderDate, COUNT(*) AS orderCount
      FROM sys.Orders
      WHERE hide = false and status = 'completed' and user_id = ?
      GROUP BY DATE(dateCreated)
      ORDER BY orderDate ASC;
    `;

    const [rows1] = await connection.query(sql1, [userId]);

    return {
      status: "success",
      message: "Orders per day retrieved successfully",
      data: rows1,
    };
  } catch (error: any) {
    console.error("Error fetching orders per day:", error);
    return {
      status: "error",
      message: "Failed to fetch orders per day",
      error: error.message,
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

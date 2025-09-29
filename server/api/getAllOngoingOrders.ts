import { defineEventHandler } from "h3";
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
  const userId: any = event.context.userId;

  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      `
      SELECT 
        id,
        adress,
        ordernumber,
        kls_id,
        user_id,
        'started' AS status,
        created_at AS dateCreated
      FROM sys.OrdersStarted
      WHERE user_id = ? AND target_id IS NULL
      ORDER BY created_at DESC;
      `,
      [userId]
    );

    return {
      status: "success",
      message: "Active started orders retrieved successfully",
      data: rows,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: "Failed to connect to the database",
      error: error.message,
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

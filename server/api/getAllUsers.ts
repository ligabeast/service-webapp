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

  try {
    connection = await mysql.createConnection(dbConfig);

    if (!event.context.user.isAdmin) {
      return {
        status: "error",
        message: "You are not authorized to view this page",
      };
    }

    const [rows] = await connection.execute(
      "select id,username from sys.Users;"
    );

    return {
      status: "success",
      message: "Users retrieved successfully",
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

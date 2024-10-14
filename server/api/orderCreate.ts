import { defineEventHandler, readBody } from "h3";
import mysql, { ResultSetHeader } from "mysql2/promise";
import { Result } from "postcss";

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

    // Use readBody to handle POST requests where data is sent in the body
    const body = await readBody(event);
    const { adress, ordernumber, kls_id } = body;

    // Check if the order exists and is in 'started' status
    const [rows] = await connection.execute(
      "SELECT * FROM sys.Orders o WHERE o.ordernumber = ? AND o.status = 'started' AND o.user_id = ?;",
      [ordernumber, userId]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      return {
        status: "error",
        message: "Ordernumber already exists",
      };
    }

    // Insert Order
    const [result] = await connection.execute<ResultSetHeader>(
      "insert into sys.Orders (adress,ordernumber,kls_id,user_id,status,dateCreated) values (?,?,?,?,?,NOW());",
      [adress, ordernumber, kls_id, userId, "started"]
    );
    return {
      status: "success",
      message: "Order completed successfully",
      data: { orderid: result.insertId },
    };
  } catch (error: any) {
    return {
      status: "error",
      message: "Database operation failed",
      error: error.message,
    };
  } finally {
    // Always close the connection
    if (connection) {
      await connection.end();
    }
  }
});

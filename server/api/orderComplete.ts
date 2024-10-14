import { defineEventHandler, readBody } from "h3";
import mysql, { ResultSetHeader } from "mysql2/promise";

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
    const { ordernumber, orderid, orderType, positions } = body;

    // Check if the order exists and is in 'started' status
    const [rows] = await connection.execute(
      "SELECT * FROM sys.Orders o WHERE o.ordernumber = ? AND o.status = 'started' AND o.user_id = ?;",
      [ordernumber, userId]
    );

    if (Array.isArray(rows) && rows.length === 0) {
      return {
        status: "error",
        message: "Order not found or already completed",
      };
    }

    // Hide the original order (soft delete)
    await connection.execute(
      "UPDATE sys.Orders SET hide = true WHERE id = ?;",
      [orderid]
    );

    // Step 1: Select `adress` and `kls_id` from the original order
    const [rows2] = await connection.execute(
      "SELECT adress, kls_id FROM sys.Orders WHERE id = ?;",
      [orderid]
    );

    // Check if the order exists
    if (Array.isArray(rows2) && rows2.length === 0) {
      throw new Error("Order not found");
    }

    const { adress, kls_id } = (rows2 as any[])[0];

    // Step 2: Insert new completed order with selected `adress` and `kls_id`
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO sys.Orders 
        (ordernumber, user_id, status, orderType, adress, kls_id, dateCreated) 
       VALUES (?, ?, 'completed', ?, ?, ?, NOW());`,
      [ordernumber, userId, orderType, adress, kls_id]
    );

    // Step 3: Insert positions for the completed order
    for (const position of positions as any) {
      await connection.execute(
        `INSERT INTO sys.Position_To_Orders (quantity, order_id, position_id) VALUES (?, ?, ?);`,
        [position.quantity, result.insertId, position.position_id]
      );
    }

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

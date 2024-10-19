import { defineEventHandler, use } from "h3";
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

  const query = getQuery(event);
  const orderid = query.orderid;

  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      `
      SELECT 
          o.*,
          JSON_ARRAYAGG(
              JSON_OBJECT(
                  'position_id', pto.position_id, 
                  'quantity', pto.quantity, 
                  'position_name', p.name
              )
          ) AS positions,
          (SELECT o2.dateCreated
          FROM sys.Orders o2
          WHERE o2.ordernumber = o.ordernumber
          AND o2.status = 'started'
          AND o2.id != o.id
          LIMIT 1) AS orderCreated
      FROM 
          sys.Orders o
      JOIN 
          Position_To_Orders pto ON pto.order_id = o.id
      JOIN 
          sys.Positions p ON p.id = pto.position_id
      WHERE 
          o.id = 38 
          AND o.user_id = 2
      GROUP BY 
          o.id;
      `,
      [orderid, userId]
    );

    return {
      status: "success",
      message: "Orders retrieved successfully",
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

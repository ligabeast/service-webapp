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
    (SELECT o2.dateCreated 
    FROM sys.Orders o2
           WHERE o2.ordernumber = o.ordernumber
           AND o2.status = 'started'
           AND o2.id != o.id
           LIMIT 1) AS orderCreated,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'position_id', pto.position_id, 
            'quantity', pto.quantity, 
            'position_name', p.name
        )
    ) AS positions,
      JSON_ARRAYAGG(
              CASE
                  WHEN op.id IS NOT NULL AND op.path IS NOT NULL THEN
                      JSON_OBJECT(
                          'id', op.id,
                          'original_name', op.original_name,
                          'saved_name', op.saved_name,
                          'mime_type', op.mime_type,
                          'path', CONCAT('/uploads/', op.path)
                      )
                  ELSE NULL
              END
          ) AS pictures

FROM 
    sys.Orders o
LEFT JOIN 
    Position_To_Orders pto ON pto.order_id = o.id
LEFT JOIN 
    sys.Positions p ON p.id = pto.position_id
LEFT JOIN 
    sys.OrderPictures op ON op.order_id = o.id
WHERE 
    o.id = ?
    AND o.user_id = ?
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

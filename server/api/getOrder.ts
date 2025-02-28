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

    -- Aggregiere Positions separat
    (SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'position_id', pto.position_id, 
                    'quantity', pto.quantity, 
                    'position_name', p.name,
                    'description', pto.description
                )
            )
     FROM Position_To_Orders pto
     LEFT JOIN sys.Positions p ON p.id = pto.position_id
     WHERE pto.order_id = o.id
    ) AS positions,

    -- Aggregiere Bilder separat
    (SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', op.id,
                    'original_name', op.original_name,
                    'saved_name', op.saved_name,
                    'mime_type', op.mime_type,
                    'path', CONCAT('/uploads/', op.path)
                )
            )
     FROM sys.OrderPictures op
     WHERE op.order_id = o.id
    ) AS pictures,

    -- Nächste Bestellung (zeitlich später)
    (SELECT o_next.id 
     FROM sys.Orders o_next
     WHERE o_next.user_id = o.user_id
       AND o_next.status = 'completed'
       AND o_next.dateCreated > o.dateCreated
     ORDER BY o_next.dateCreated ASC
     LIMIT 1) AS nextOrder,

    -- Vorherige Bestellung (zeitlich früher)
    (SELECT o_prev.id 
     FROM sys.Orders o_prev
     WHERE o_prev.user_id = o.user_id
       AND o_prev.status = 'completed'
       AND o_prev.dateCreated < o.dateCreated
     ORDER BY o_prev.dateCreated DESC
     LIMIT 1) AS prevOrder

FROM 
    sys.Orders o
WHERE 
    o.id = ? and o.user_id = ?;      `,
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

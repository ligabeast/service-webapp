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
  const query = getQuery(event);
  const klsId = query.kls_id; // Dynamisch aus der Anfrage

  if (!klsId) {
    return {
      status: "error",
      message: "Missing kls_id in query",
    };
  }

  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      `
        SELECT 
            o.*,
            u.username,
            -- Bilder zu den Aufträgen abrufen
            (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', op.id,
                  'original_name', op.original_name,
                  'saved_name', op.saved_name,
                  'mime_type', op.mime_type,
                  'path', CONCAT('/uploads/', op.path),
                  'uploaded_at', op.uploaded_at
                )
              )
              FROM OrderPictures op
              WHERE op.order_id = o.id
            ) AS pictures,
            -- Aggregiere Positions separat
              (SELECT JSON_ARRAYAGG(
                          JSON_OBJECT(
                              'position_id', pto.position_id, 
                              'quantity', pto.quantity, 
                              'position_name', p.name
                          )
                      )
              FROM Position_To_Orders pto
              LEFT JOIN sys.Positions p ON p.id = pto.position_id
              WHERE pto.order_id = o.id
              ) AS positions
        FROM 
            sys.Orders o
        JOIN sys.Users u ON u.id = o.user_id
        WHERE 
            o.kls_id = ? 
            AND o.status = 'completed'
        ORDER BY 
            o.dateCreated DESC;
        `,
      [klsId]
    );

    return {
      status: "success",
      message: "KLS History retrieved successfully",
      data: rows,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: "Failed to retrieve data",
      error: error.message,
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

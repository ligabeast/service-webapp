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

    const body = await readBody(event);
    const { adress, ordernumber, kls_id, latitude, longitude } = body;

    // 1. Check if the ordernumber already exists in OrdersStarted
    const [rows] = await connection.execute(
      `SELECT * FROM sys.OrdersStarted 
       WHERE ordernumber = ? AND user_id = ?;`,
      [ordernumber, userId]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      return {
        status: "error",
        message: "Auftrag mit dieser Nummer ist bereits gestartet",
      };
    }

    // 2. Insert into OrdersStarted
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO sys.OrdersStarted 
        (adress, ordernumber, kls_id, user_id, created_at, latitude, longitude) 
       VALUES (?, ?, ?, ?, NOW(), ?, ?);`,
      [adress, ordernumber, kls_id, userId, latitude, longitude]
    );

    if (latitude !== null && longitude != null) {
      console.log(
        `Order ${ordernumber} started with coordinates: (${latitude}, ${longitude})`
      );
    }

    return {
      status: "success",
      message: "Auftrag wurde erfolgreich gestartet",
      data: { orderid: result.insertId },
    };
  } catch (error: any) {
    return {
      status: "error",
      message: "Fehler beim Speichern des Auftrags",
      error: error.message,
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

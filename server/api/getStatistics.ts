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

    // Filter aus der Query lesen
    const query = getQuery(event);
    const timeRange = query.timeRange || "last30";
    const startDate = query.startDate || null;
    const endDate = query.endDate || null;
    const orderType = query.orderType || null; // Auftragstyp (z. B. "gwv" oder "connect")

    // Dynamische SQL-Abfrage mit Filtern
    let sql = `
      SELECT DATE(dateCreated) AS orderDate, COUNT(*) AS orderCount
      FROM sys.Orders
      WHERE user_id = ? AND status = "completed"
    `;
    const params: any[] = [userId];

    // Auftragstyp-Filter hinzufügen
    if (orderType && orderType !== "all") {
      sql += " AND orderType = ?";
      params.push(orderType);
    }

    // Zeitraum-Filter
    if (startDate) {
      sql += " AND DATE(dateCreated) >= ?";
      params.push(startDate);
    }
    if (endDate) {
      sql += " AND DATE(dateCreated) <= ?";
      params.push(endDate);
    }

    // Gruppieren nach Datum und Sortieren
    sql += `
      GROUP BY DATE(dateCreated)
      ORDER BY orderDate ASC;
    `;

    const [rows] = await connection.query(sql, params);

    return {
      status: "success",
      message: "Orders per day retrieved successfully",
      data: rows,
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

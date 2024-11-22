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

    // Orders per day
    let sql1 = `
      SELECT DATE(dateCreated) AS orderDate, COUNT(*) AS orderCount
      FROM sys.Orders
      WHERE user_id = ? AND status = "completed"
    `;
    const params1: any[] = [userId];

    if (orderType && orderType !== "all") {
      sql1 += " AND orderType = ?";
      params1.push(orderType);
    }

    if (startDate) {
      sql1 += " AND DATE(dateCreated) >= ?";
      params1.push(startDate);
    }
    if (endDate) {
      sql1 += " AND DATE(dateCreated) <= ?";
      params1.push(endDate);
    }

    sql1 += `
      GROUP BY DATE(dateCreated)
      ORDER BY orderDate ASC;
    `;

    const [rows1] = await connection.query(sql1, params1);

    // Ordertype distribution
    let sql2 = `
      SELECT orderType, COUNT(*) AS count
      FROM sys.Orders
      WHERE user_id = ? AND status = "completed"
    `;
    const params2: any[] = [userId];

    if (startDate) {
      sql2 += " AND DATE(dateCreated) >= ?";
      params2.push(startDate);
    }
    if (endDate) {
      sql2 += " AND DATE(dateCreated) <= ?";
      params2.push(endDate);
    }

    sql2 += `
      GROUP BY orderType
      ORDER BY count DESC;
    `;

    const [rows2] = await connection.query(sql2, params2);

    // Position distribution (chart3)
    let sql3Dynamic = `
      SELECT p.name AS positionName, SUM(pto.quantity) AS totalQuantity
      FROM sys.Positions p
      JOIN sys.Position_To_Orders pto ON p.id = pto.position_id
      JOIN sys.Orders o ON o.id = pto.order_id
      WHERE p.dynamic = 1 AND o.user_id = ? AND o.status = "completed"
    `;
    const params3Dynamic: any[] = [userId];

    if (startDate) {
      sql3Dynamic += " AND DATE(o.dateCreated) >= ?";
      params3Dynamic.push(startDate);
    }
    if (endDate) {
      sql3Dynamic += " AND DATE(o.dateCreated) <= ?";
      params3Dynamic.push(endDate);
    }

    sql3Dynamic += `
      GROUP BY p.id
      ORDER BY totalQuantity DESC;
    `;

    const [dynamicPositions] = await connection.query(
      sql3Dynamic,
      params3Dynamic
    );

    let sql3Static = `
      SELECT p.name AS positionName, COUNT(pto.id) AS count
      FROM sys.Positions p
      JOIN sys.Position_To_Orders pto ON p.id = pto.position_id
      JOIN sys.Orders o ON o.id = pto.order_id
      WHERE p.dynamic = 0 AND o.user_id = ? AND o.status = "completed"
    `;
    const params3Static: any[] = [userId];

    if (startDate) {
      sql3Static += " AND DATE(o.dateCreated) >= ?";
      params3Static.push(startDate);
    }
    if (endDate) {
      sql3Static += " AND DATE(o.dateCreated) <= ?";
      params3Static.push(endDate);
    }

    sql3Static += `
      GROUP BY p.id
      ORDER BY count DESC;
    `;

    const [staticPositions] = await connection.query(sql3Static, params3Static);

    return {
      status: "success",
      message: "Orders data retrieved successfully",
      data: {
        chart1: rows1, // Aufträge pro Tag
        chart2: rows2, // Verteilung der Auftragstypen
        chart3: {
          dynamic: dynamicPositions, // Dynamische Positionen
          static: staticPositions, // Nicht-dynamische Positionen
        },
      },
    };
  } catch (error: any) {
    console.error("Error fetching orders data:", error);
    return {
      status: "error",
      message: "Failed to fetch orders data",
      error: error.message,
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

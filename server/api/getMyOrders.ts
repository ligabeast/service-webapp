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

  const query = await getQuery(event);
  const perPage = parseInt(query.perPage || "10", 10);
  const currentPage = parseInt(query.currentPage || "1", 10);
  const offset = (currentPage - 1) * perPage;
  const sort = query.sort || "date-desc";
  const startDate = query.startDate || "";
  const endDate = query.endDate || "";
  const orderType = query.orderType || "all"; // Standardwert: "all"

  let sql = `
    SELECT id, adress, ordernumber, kls_id, user_id, status, dateCreated, orderType
    FROM sys.Orders
    WHERE user_id = ? AND hide = false
  `;

  const params: any[] = [userId];

  // Optionaler Datumsfilter
  if (startDate) {
    sql += " AND dateCreated >= ?";
    params.push(startDate);
  }

  if (endDate) {
    sql += " AND dateCreated <= ?";
    params.push(endDate);
  }

  // Auftragstyp-Filter
  if (orderType !== "all") {
    sql += " AND orderType = ?";
    params.push(orderType);
  }

  // Sortierung
  if (sort === "date-asc") {
    sql += " ORDER BY dateCreated ASC";
  } else {
    sql += " ORDER BY dateCreated DESC";
  }

  // Pagination (direkt in die SQL-Abfrage einfügen)
  sql += ` LIMIT ${perPage} OFFSET ${offset}`;

  try {
    connection = await mysql.createConnection(dbConfig);

    // SQL-Abfrage für die paginierten Ergebnisse
    const [rows] = await connection.execute(sql, params);

    // Gesamte Anzahl der Einträge für Pagination berechnen
    const [totalResult] = await connection.execute(
      `
      SELECT COUNT(*) as total
      FROM sys.Orders
      WHERE user_id = ? AND hide = false
      ${startDate ? "AND dateCreated >= ?" : ""}
      ${endDate ? "AND dateCreated <= ?" : ""}
      ${orderType !== "all" ? "AND orderType = ?" : ""}
    `,
      [
        userId,
        ...(startDate ? [startDate] : []),
        ...(endDate ? [endDate] : []),
        ...(orderType !== "all" ? [orderType] : []),
      ]
    );

    const totalCount = totalResult[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / perPage); // Berechnung der Seitenanzahl

    return {
      status: "success",
      message: "Orders retrieved successfully",
      data: rows,
      pagination: {
        currentPage,
        perPage,
        totalCount,
        totalPages,
      },
    };
  } catch (error: any) {
    console.error("SQL Error:", error);
    return {
      status: "error",
      message: "Failed to retrieve orders",
      error: error.message,
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

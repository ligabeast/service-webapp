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
  const orderType = query.orderType || "all";
  const klsId = query.klsId || "";
  const adress = query.adress || "";

  let sql = `
    SELECT 
      os.id AS id,
      os.adress AS adress,
      os.ordernumber AS ordernumber,
      os.kls_id AS kls_id,
      COALESCE(o.dateCreated, os.created_at) AS dateCreated,
      COALESCE(o.status, 'started') AS status,
      o.notCompletedReason,
      os.orderType as orderType
    FROM sys.OrdersStarted os
    LEFT JOIN sys.Orders o ON os.target_id = o.id
    WHERE os.user_id = ?
  `;

  const params: any[] = [userId];

  // Filter
  if (startDate) {
    sql += " AND os.created_at >= ?";
    params.push(startDate);
  }

  if (endDate) {
    sql += " AND os.created_at < DATE_ADD(?, INTERVAL 1 DAY)";
    params.push(endDate);
  }

  if (klsId) {
    sql += " AND os.kls_id = ?";
    params.push(klsId);
  }

  if (adress) {
    sql += " AND os.adress LIKE ?";
    params.push(`%${adress}%`);
  }

  if (orderType !== "all") {
    sql += " AND o.orderType = ?";
    params.push(orderType);
  }

  // Sortierung
  sql +=
    sort === "date-asc"
      ? " ORDER BY COALESCE(o.dateCreated, os.created_at) ASC"
      : " ORDER BY COALESCE(o.dateCreated, os.created_at) DESC";

  // Pagination
  sql += ` LIMIT ${perPage} OFFSET ${offset}`;

  try {
    console.log("sql", sql, params);
    connection = await mysql.createConnection(dbConfig);

    // Daten abrufen
    const [rows] = await connection.execute(sql, params);

    // Count
    let countSql = `
      SELECT COUNT(*) as total
      FROM sys.OrdersStarted os
      LEFT JOIN sys.Orders o ON os.target_id = o.id
      WHERE os.user_id = ?
    `;
    const countParams: any[] = [userId];

    if (startDate) {
      countSql += " AND os.created_at >= ?";
      countParams.push(startDate);
    }

    if (endDate) {
      countSql += " AND os.created_at < DATE_ADD(?, INTERVAL 1 DAY)";
      countParams.push(endDate);
    }

    if (klsId) {
      countSql += " AND os.kls_id = ?";
      countParams.push(klsId);
    }

    if (adress) {
      countSql += " AND os.adress LIKE ?";
      countParams.push(`%${adress}%`);
    }

    if (orderType !== "all") {
      countSql += " AND os.orderType = ?";
      countParams.push(orderType);
    }

    const [totalResult] = await connection.execute(countSql, countParams);
    const totalCount = totalResult[0]?.total || 0;
    const totalPages = Math.ceil(totalCount / perPage);

    return {
      status: "success",
      message: "All started orders (linked and unlinked)",
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

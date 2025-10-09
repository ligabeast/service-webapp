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
  const query = getQuery(event);
  const kls = query.kls as string;

  if (!kls) {
    return { status: "error", message: "Missing parameter: kls" };
  }

  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    // 🔹 Alle Aufträge + Positionen zu dieser KLS-ID abrufen
    const [orders] = await connection.execute<any[]>(
      `
      SELECT 
        os.id AS order_id,
        os.ordernumber,
        os.orderType,
        os.adress,
        os.created_at,
        COALESCE(o.dateCreated, os.created_at) AS dateCreated,
        COALESCE(o.status, 'started') AS status,
        GROUP_CONCAT(DISTINCT pto.position_id ORDER BY pto.position_id SEPARATOR ', ') AS positions
      FROM sys.OrdersStarted os
      LEFT JOIN sys.Orders o 
        ON o.id = os.target_id
      LEFT JOIN sys.Position_To_Orders pto 
        ON pto.order_id = o.id
      WHERE os.kls_id = ?
      GROUP BY os.id
      ORDER BY os.created_at DESC;
      `,
      [kls]
    );

    if (!orders.length) {
      // Wenn keine Aufträge existieren → trotzdem prüfen, ob KLS in sys.kls existiert
      const [klsRow] = await connection.execute<any[]>(
        `SELECT * FROM sys.kls where kls_id = ?;`,
        [kls]
      );

      return {
        status: "success",
        message: "No orders found for this KLS-ID",
        data: {
          address: null,
          ordersFound: { total: 0, gwv: 0, connect: 0, bulk: 0 },
          lastService: null,
          klsData: klsRow[0] || null,
          positions: [],
        },
      };
    }

    // 🔹 Adresse bestimmen
    const addressCount = orders.reduce<Record<string, number>>((acc, row) => {
      const key = row.adress?.trim() || "";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const address =
      Object.entries(addressCount).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      orders[0].adress ||
      "";

    // 🔹 Aufträge zählen
    const ordersFound = {
      total: new Set(orders.map((r) => r.order_id)).size,
      gwv: orders.filter((r) => r.orderType === "gwv").length,
      connect: orders.filter((r) => r.orderType === "connect").length,
      bulk: orders.filter((r) => r.orderType === "bulk").length,
    };

    // 🔹 Letzter Service
    const lastService = orders
      .map((r) => r.dateCreated)
      .filter(Boolean)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

    // 🔹 Nur die Positionen als Array (ohne Duplikate)
    // 🔹 Alle Positions aus allen Orders zusammenführen (einmalig & als Array)
    const positions = Array.from(
      new Set(
        orders.flatMap((r) =>
          (r.positions || "")
            .split(",")
            .map((p: string) => p.trim())
            .filter((p) => p !== "")
        )
      )
    ).map((p) => Number(p));

    // 🔹 Prüfe, ob KLS-Eintrag existiert
    const [klsRows] = await connection.execute<any[]>(
      `
      SELECT id, residential_units, comments
      FROM sys.kls
      where kls_id = ?;
      `,
      [kls]
    );

    const klsData = klsRows[0] || null;

    return {
      status: "success",
      data: {
        address,
        kls,
        ordersFound,
        lastService: lastService
          ? new Date(lastService).toISOString().split("T")[0]
          : null,
        klsData,
        positions,
      },
    };
  } catch (error: any) {
    console.error("[checkKls ERROR]", error);
    return {
      status: "error",
      message: "Failed to retrieve KLS data",
      error: error.message,
    };
  } finally {
    if (connection) await connection.end();
  }
});

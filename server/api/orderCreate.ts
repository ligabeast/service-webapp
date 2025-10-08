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
    const {
      adress,
      ordernumber,
      kls_id,
      latitude,
      longitude,
      connectOrderNumber,
      gwvOrderNumber,
      orderType,
      units,
    } = body;

    // 🧹 Werte absichern (keine undefined!)
    const safeAdress = adress ?? null;
    const safeOrdernumber = ordernumber ?? null;
    const safeKlsId = kls_id ?? null;
    const safeLat = latitude ?? null;
    const safeLon = longitude ?? null;
    const safeOrderType = orderType ?? null;

    // 1️⃣ prüfen ob Auftrag bereits gestartet
    const [rows] = await connection.execute(
      `SELECT * FROM sys.OrdersStarted WHERE ordernumber = ? AND user_id = ?;`,
      [safeOrdernumber, userId]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      return {
        status: "error",
        message: "Ordernumber already exists",
      };
    }

    // 2️⃣ neuen Auftrag anlegen
    const [result] = await connection.execute<ResultSetHeader>(
      `
      INSERT INTO sys.OrdersStarted 
        (adress, ordernumber, kls_id, user_id, created_at, latitude, longitude, orderType)
      VALUES (?, ?, ?, ?, NOW(), ?, ?, ?);
      `,
      [
        safeAdress,
        safeOrdernumber,
        safeKlsId,
        userId,
        safeLat,
        safeLon,
        safeOrderType,
      ]
    );

    // 3️⃣ Zusatzauftrag automatisch erstellen (optional)
    if (safeOrderType === "connect" && gwvOrderNumber) {
      await connection.execute<ResultSetHeader>(
        `
        INSERT INTO sys.OrdersStarted 
          (adress, ordernumber, kls_id, user_id, created_at, latitude, longitude, orderType)
        VALUES (?, ?, ?, ?, NOW(), ?, ?, ?);
        `,
        [safeAdress, gwvOrderNumber, safeKlsId, userId, safeLat, safeLon, "gwv"]
      );
    }

    if (safeOrderType === "gwv" && connectOrderNumber) {
      await connection.execute<ResultSetHeader>(
        `
        INSERT INTO sys.OrdersStarted
          (adress, ordernumber, kls_id, user_id, created_at, latitude, longitude, orderType)
        VALUES (?, ?, ?, ?, NOW(), ?, ?, ?);
        `,
        [
          safeAdress,
          connectOrderNumber,
          safeKlsId,
          userId,
          safeLat,
          safeLon,
          "connect",
        ]
      );
    }

    // 4️⃣ KLS-Handling
    if (units) {
      // Prüfen, ob Adresse existiert
      const [klsRows] = await connection.execute<any[]>(
        `SELECT * FROM sys.kls WHERE kls_id = ?`,
        [safeKlsId]
      );

      if (Array.isArray(klsRows) && klsRows.length > 0) {
        await connection.execute(
          `UPDATE sys.kls SET residential_units = ? WHERE kls_id = ?;`,
          [units, safeKlsId]
        );
      } else {
        await connection.execute(
          `INSERT INTO sys.kls (kls_id, residential_units) VALUES (?, ?);`,
          [safeKlsId, units]
        );
      }
    }

    if (safeLat !== null && safeLon !== null) {
      console.log(
        `Order ${safeOrdernumber} started with coordinates: (${safeLat}, ${safeLon})`
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
    if (connection) await connection.end();
  }
});

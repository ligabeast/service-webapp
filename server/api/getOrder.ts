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
  const userId: any = event.context.userId;
  const query = getQuery(event);
  const orderid = query.orderid;

  try {
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      `
SELECT 
    os.*,
    COALESCE(o2.status, 'started') AS status,
    o2.notCompletedReason,
    o2.orderType,
    o2.dateCreated AS dateCreated,
    o2.ne3error,
    o2.ne3errorRemoved,
    o2.commentInternal,
    o2.commentCopy,
    os.created_at AS orderCreated,
    os.latitude,
    os.longitude,
    os.adress,

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
     WHERE pto.order_id = os.target_id
    ) AS positions,

    (SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', op.id,
          'original_name', op.original_name,
          'saved_name', op.saved_name,
          'mime_type', op.mime_type,
          'path', CONCAT('/uploads/', op.path),
          'label', op.label
        )
      )
     FROM sys.OrderPictures op
     WHERE op.order_id = os.target_id
    ) AS pictures,

  -- Nächste Bestellung (nach aktuellem Ergebnis)
  (SELECT os_next.id
  FROM sys.Orders o_next
  JOIN sys.OrdersStarted os_next ON os_next.target_id = o_next.id
  WHERE o_next.user_id = os.user_id
    AND o_next.status = 'completed'
    AND o_next.dateCreated > o2.dateCreated
  ORDER BY o_next.dateCreated ASC
  LIMIT 1) AS nextOrder,

  -- Vorherige Bestellung (vor aktuellem Ergebnis)
  (SELECT os_prev.id
  FROM sys.Orders o_prev
  JOIN sys.OrdersStarted os_prev ON os_prev.target_id = o_prev.id
  WHERE o_prev.user_id = os.user_id
    AND o_prev.status = 'completed'
    AND o_prev.dateCreated < o2.dateCreated
  ORDER BY o_prev.dateCreated DESC
  LIMIT 1) AS prevOrder

FROM 
    sys.OrdersStarted os
LEFT JOIN 
    sys.Orders o2 ON os.target_id = o2.id
WHERE 
    os.id = ? AND os.user_id = ?;
    `,
      [orderid, userId]
    );

    const order = rows[0];

    // ...
    if (order?.latitude && order?.longitude && order?.adress) {
      try {
        const apiKey = process.env.GOOGLE_API_KEY;

        // 🔍 Debuglog für alle wichtigen Parameter
        console.log("[DISTANCE DEBUG] latitude:", order.latitude);
        console.log("[DISTANCE DEBUG] longitude:", order.longitude);
        console.log("[DISTANCE DEBUG] adress:", order.adress);
        console.log("[DISTANCE DEBUG] GOOGLE_MAPS_KEY vorhanden:", !!apiKey);

        if (!apiKey) {
          throw new Error("Google Maps API Key fehlt");
        }

        const origin = `${order.latitude},${order.longitude}`;
        const destination = encodeURIComponent(order.adress);
        const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${apiKey}`;

        console.log("[DISTANCE DEBUG] URL:", directionsUrl);

        const res = await fetch(directionsUrl);
        const directions = await res.json();

        console.log(
          "[DISTANCE DEBUG] API Response:",
          JSON.stringify(directions, null, 2)
        );

        const distanceValue =
          directions?.routes?.[0]?.legs?.[0]?.distance?.value;

        if (distanceValue !== undefined) {
          const meters = distanceValue;
          order.distanceKm = +(meters / 1000).toFixed(1);
          console.log("[DISTANCE DEBUG] distanceKm:", order.distanceKm);
        } else {
          console.warn(
            "[DISTANCE WARNING] Kein Distance-Wert im API Response gefunden"
          );
          order.distanceKm = null;
        }
      } catch (err) {
        console.error("[DISTANCE ERROR]", err);
        order.distanceKm = null;
      }
    } else {
      console.warn(
        "[DISTANCE WARNING] Latitude, Longitude oder Adresse fehlen"
      );
      order.distanceKm = null;
    }

    return {
      status: "success",
      message: "Order started + result retrieved successfully",
      data: order,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: "Failed to retrieve order",
      error: error.message,
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

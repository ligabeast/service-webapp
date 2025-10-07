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

    const order: any = rows[0];

    // ✅ ROUTES API (statt alte Directions API)
    if (order?.latitude && order?.longitude && order?.adress) {
      try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) throw new Error("Google Maps API Key fehlt");

        console.log("[ROUTES DEBUG] latitude:", order.latitude);
        console.log("[ROUTES DEBUG] longitude:", order.longitude);
        console.log("[ROUTES DEBUG] adress:", order.adress);

        const url = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${apiKey}`;

        const requestBody = {
          origin: {
            location: {
              latLng: {
                latitude: order.latitude,
                longitude: order.longitude,
              },
            },
          },
          destination: {
            address: order.adress,
          },
          travelMode: "DRIVE",
          routingPreference: "TRAFFIC_AWARE",
          computeAlternativeRoutes: false,
          languageCode: "de-DE",
          units: "METRIC",
        };

        console.log("[ROUTES DEBUG] URL:", url);
        console.log("[ROUTES DEBUG] Request:", JSON.stringify(requestBody));

        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-FieldMask":
              "routes.distanceMeters,routes.duration,routes.legs.distanceMeters,routes.legs.duration",
          },
          body: JSON.stringify(requestBody),
        });

        const data = await res.json();
        console.log("[ROUTES DEBUG] Response:", JSON.stringify(data, null, 2));

        const distanceValue =
          data?.routes?.[0]?.legs?.[0]?.distanceMeters ??
          data?.routes?.[0]?.distanceMeters;

        // "duration": "2389s"
        const durationMin = Math.round(
          parseInt(
            data?.routes?.[0]?.legs?.[0]?.duration ??
              data?.routes?.[0]?.duration
          ) / 60
        );

        if (distanceValue) {
          order.distanceKm = +(distanceValue / 1000).toFixed(1);
          order.durationMin = durationMin;
          console.log("[ROUTES DEBUG] distanceKm:", order.distanceKm);
          console.log("[ROUTES DEBUG] durationMin:", order.durationMin);
        } else {
          console.warn(
            "[ROUTES WARNING] Kein Distance-Wert im Routes API Response gefunden"
          );
          order.distanceKm = null;
        }
      } catch (err) {
        console.error("[ROUTES ERROR]", err);
        order.distanceKm = null;
      }
    } else {
      console.warn("[ROUTES WARNING] Latitude, Longitude oder Adresse fehlen");
      order.distanceKm = null;
    }

    return {
      status: "success",
      message: "Order data retrieved successfully",
      data: order,
    };
  } catch (error: any) {
    console.error("[GET ORDER ERROR]", error);
    return {
      status: "error",
      message: "Failed to retrieve order",
      error: error.message,
    };
  } finally {
    if (connection) await connection.end();
  }
});

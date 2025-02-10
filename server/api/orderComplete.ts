import { defineEventHandler } from "h3";
import formidable from "formidable";
import mysql, { ResultSetHeader } from "mysql2/promise";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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
    console.log("[DEBUG] Verbindung zur Datenbank wird hergestellt...");
    connection = await mysql.createConnection(dbConfig);

    console.log("[DEBUG] Parsing der Formulardaten...");
    const form = formidable({
      multiples: true,
      keepExtensions: true,
    });

    const { fields, files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      form.parse(event.req, (err, fields, files) => {
        if (err) {
          console.error("[ERROR] Fehler beim Parsen der Formulardaten:", err);
          reject(err);
        } else {
          resolve({ fields, files });
        }
      });
    });

    console.log("[DEBUG] Formulardaten erfolgreich geparst.");
    console.log("[DEBUG] Felder:", fields);
    console.log("[DEBUG] Dateien:", files);

    let {
      ordernumber,
      orderid,
      orderType,
      positions,
      commentCopy,
      commentInternal,
      notCompleted,
      notCompletedReason,
      ne3error,
      akp,
      weInObject,
    } = fields;

    ordernumber = Array.isArray(ordernumber) ? ordernumber[0] : ordernumber;
    orderid = Array.isArray(orderid) ? orderid[0] : orderid;
    orderType = Array.isArray(orderType) ? orderType[0] : orderType;
    positions = Array.isArray(positions) ? positions[0] : positions;
    commentCopy = Array.isArray(commentCopy) ? commentCopy[0] : commentCopy;
    commentInternal = Array.isArray(commentInternal)
      ? commentInternal[0]
      : commentInternal;
    ne3error = Array.isArray(ne3error) ? ne3error[0] : ne3error;
    ne3error = JSON.parse(ne3error as string);
    const pictures = Array.isArray(files.pictures)
      ? files.pictures
      : [files.pictures];
    notCompletedReason = Array.isArray(notCompletedReason)
      ? notCompletedReason[0]
      : notCompletedReason;
    notCompleted = Array.isArray(notCompleted) ? notCompleted[0] : notCompleted;
    akp = Array.isArray(akp) ? akp[0] : akp;
    weInObject = Array.isArray(weInObject) ? weInObject[0] : weInObject;

    if (orderType === "gwv") {
      ne3error.ne3error = "Nein";
      ne3error.ne3errorRemoved = "Nein";
    }
    console.log("[DEBUG] Überprüfe Bestellung...");
    const [rows] = await connection.execute(
      "SELECT * FROM sys.Orders o WHERE o.ordernumber = ? AND o.status = 'started' AND o.user_id = ?;",
      [ordernumber, userId]
    );

    if (Array.isArray(rows) && rows.length === 0) {
      console.error("[ERROR] Bestellung nicht gefunden oder abgeschlossen.");
      return {
        status: "error",
        message: "Order not found or already completed",
      };
    }

    if (rows.length > 1) {
      console.error("[ERROR] Mehrere Bestellungen gefunden.");
      return {
        status: "error",
        message: "Multiple orders found",
      };
    }

    // only complete if order is not already completed
    const [rowstmp] = await connection.execute(
      "SELECT * FROM sys.Orders o WHERE o.ordernumber = ? AND o.status = 'completed' AND o.user_id = ?;",
      [ordernumber, userId]
    );

    if (Array.isArray(rowstmp) && rowstmp.length > 0) {
      console.error("[ERROR] Bestellung bereits abgeschlossen.");
      return {
        status: "error",
        message: "Order already completed",
      };
    }

    console.log("orderid", orderid);
    console.log("orderid typ", typeof orderid);
    console.log("[DEBUG] Verberge ursprüngliche Bestellung...");
    await connection.execute(
      "UPDATE sys.Orders SET hide = true WHERE id = ?;",
      [orderid]
    );

    console.log("[DEBUG] Lade Adresse und kls_id...");
    const [rows2] = await connection.execute(
      "SELECT adress, kls_id FROM sys.Orders WHERE id = ?;",
      [orderid]
    );

    if (Array.isArray(rows2) && rows2.length === 0) {
      throw new Error("Order not found");
    }

    const { adress, kls_id } = (rows2 as any[])[0];
    console.log("[DEBUG] Adresse und kls_id geladen:", adress, kls_id);

    if (
      orderType === "connect" &&
      JSON.parse(positions as string).find(
        (p: any) => p.position_id == 19 || p.position_id === 20
      )
    ) {
      if (weInObject === "1" || weInObject === "2-3") {
        commentCopy +=
          akp === "Ja"
            ? " Leitungsweg unvollständig, fehlendes gebaut."
            : " Alternativen Leitungsweg genutzt.";
      } else if (weInObject === "4+") {
        commentCopy +=
          akp === "Ja"
            ? " GWV unvollständig, fehlendes gebaut."
            : " GWV Alternativen Leitungsweg genutzt.";
      }
    }

    console.log("[DEBUG] Erstelle neue Bestellung...");
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO sys.Orders 
        (ne3error, ne3errorRemoved,ordernumber, user_id, status, orderType, adress, kls_id, dateCreated, commentCopy, commentInternal, notCompletedReason, akp, we) 
       VALUES (?,?,?, ?, 'completed', ?, ?, ?, NOW(), ?, ?, ?, ?, ?);`,
      [
        ne3error.ne3error,
        ne3error.ne3errorRemoved,
        ordernumber,
        userId,
        orderType,
        adress,
        kls_id,
        commentCopy,
        commentInternal,
        notCompleted === "true" ? notCompletedReason : null,
        akp === "Ja" ? "Nach akp gebaut" : "Alternativ gebaut",
        weInObject,
      ]
    );

    const newOrderId = result.insertId;
    console.log("[DEBUG] Neue Bestellung erstellt. ID:", newOrderId);

    console.log("[DEBUG] Füge Positionen hinzu...");
    for (const position of JSON.parse(positions as string)) {
      console.log("[DEBUG] Position:", position);
      await connection.execute(
        `INSERT INTO sys.Position_To_Orders (quantity, order_id, position_id, description) VALUES (?, ?, ?, ?);`,
        [
          position.quantity,
          newOrderId,
          position.position_id,
          position.description,
        ]
      );
    }

    console.log("[DEBUG] Verarbeite Bilder...");
    const baseDir = "/root/service-webapp/public/uploads"; // Absoluter Pfad
    const uploadDir = path.join(baseDir, kls_id); // Zielverzeichnis basierend auf kls_id
    console.log("[DEBUG] Überprüfe Upload-Verzeichnis:", uploadDir);

    await fs.mkdir(uploadDir, { recursive: true });
    console.log("[DEBUG] Upload-Verzeichnis erstellt oder existiert bereits.");

    const pictureMetadata = [];

    for (const picture of pictures) {
      if (picture && picture.mimetype) {
        console.log("[DEBUG] Verarbeite Bild:", picture.originalFilename);

        // Validierung des Dateityps
        if (!["image/jpeg", "image/png"].includes(picture.mimetype)) {
          console.error("[ERROR] Ungültiger Dateityp:", picture.mimetype);
          return {
            status: "error",
            message: `Invalid file type: ${picture.mimetype}`,
          };
        }

        // Generiere eindeutigen Dateinamen
        const uniqueFilename = `${uuidv4()}_${picture.originalFilename}`;
        const absoluteFilePath = path.join(uploadDir, uniqueFilename);
        const relativeFilePath = path.join(kls_id, uniqueFilename); // Dynamisch ohne doppeltes `uploads/`

        console.log("[DEBUG] Absoluter Pfad:", absoluteFilePath);
        console.log("[DEBUG] Relativer Pfad:", relativeFilePath);

        // Verschiebe die Datei in das Zielverzeichnis
        await fs.rename(picture.filepath, absoluteFilePath);

        // Sammle Metadaten
        pictureMetadata.push({
          order_id: newOrderId,
          original_name: picture.originalFilename,
          saved_name: uniqueFilename,
          mime_type: picture.mimetype,
          path: relativeFilePath, // Relativer Pfad für DB
        });
      } else {
        console.error("[ERROR] Ungültiges Bildobjekt:", picture);
      }
    }

    console.log("[DEBUG] Speichere Bild-Metadaten in der Datenbank...");
    for (const metadata of pictureMetadata) {
      console.log("[DEBUG] Bild-Metadaten:", metadata);
      await connection.execute(
        `INSERT INTO sys.OrderPictures 
          (order_id, original_name, saved_name, mime_type, path) 
          VALUES (?, ?, ?, ?, ?);`,
        [
          metadata.order_id,
          metadata.original_name,
          metadata.saved_name,
          metadata.mime_type,
          metadata.path, // Relativer Pfad
        ]
      );
    }

    console.log("[DEBUG] Alle Bilder erfolgreich verarbeitet.");
    return {
      status: "success",
      message: "Order completed and pictures uploaded successfully",
      data: { orderid: newOrderId, pictureMetadata, commentCopy },
    };
  } catch (error: any) {
    console.error("[ERROR] Fehler:", error.message);
    return {
      status: "error",
      message: "Database operation or file upload failed",
      error: error.message,
    };
  } finally {
    if (connection) {
      console.log("[DEBUG] Schließe Datenbankverbindung...");
      await connection.end();
    }
  }
});

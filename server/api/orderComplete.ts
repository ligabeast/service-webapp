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
    connection = await mysql.createConnection(dbConfig);

    const form = formidable({ multiples: true, keepExtensions: true });

    const { fields, files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      form.parse(event.req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    // --- Normalisiere Felder ---
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
    notCompleted = Array.isArray(notCompleted) ? notCompleted[0] : notCompleted;
    notCompletedReason = Array.isArray(notCompletedReason)
      ? notCompletedReason[0]
      : notCompletedReason;
    akp = Array.isArray(akp) ? akp[0] : akp;
    weInObject = Array.isArray(weInObject) ? weInObject[0] : weInObject;
    ne3error = JSON.parse(Array.isArray(ne3error) ? ne3error[0] : ne3error);
    const beforeFiles = Array.isArray(files.beforeFiles)
      ? files.beforeFiles
      : [files.beforeFiles];
    const afterFiles = Array.isArray(files.afterFiles)
      ? files.afterFiles
      : [files.afterFiles];

    if (orderType === "gwv") {
      ne3error.ne3error = "Nein";
      ne3error.ne3errorRemoved = "Nein";
    }

    // --- Bestellung prüfen ---
    const [rows] = await connection.execute(
      "SELECT * FROM sys.OrdersStarted WHERE id = ? AND user_id = ?;",
      [orderid, userId]
    );
    if (Array.isArray(rows) && rows.length === 0) {
      return { status: "error", message: "Started order not found" };
    }

    // --- Abgeschlossene prüfen ---
    const [completedRows] = await connection.execute(
      "SELECT * FROM sys.Orders o WHERE o.ordernumber = ? AND o.status = 'completed' AND o.user_id = ?;",
      [ordernumber, userId]
    );
    if (completedRows.length > 0) {
      return { status: "error", message: "Order already completed" };
    }

    // --- Adresse & KLS-ID laden ---
    const [infoRows] = await connection.execute(
      "SELECT adress, kls_id FROM sys.OrdersStarted WHERE id = ?;",
      [orderid]
    );
    const { adress, kls_id } = (infoRows as any[])[0];

    // --- Neue Bestellung (completed) speichern ---
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO sys.Orders 
        (ne3error, ne3errorRemoved, ordernumber, user_id, status, adress, kls_id, dateCreated, commentCopy, commentInternal, notCompletedReason, akp, we) 
       VALUES (?, ?, ?, ?, 'completed', ?, ?, NOW(), ?, ?, ?, ?, ?);`,
      [
        ne3error.ne3error,
        ne3error.ne3errorRemoved,
        ordernumber,
        userId,
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

    // --- Verknüpfung in OrdersStarted ---
    await connection.execute(
      "UPDATE sys.OrdersStarted SET target_id = ? WHERE id = ?;",
      [newOrderId, orderid]
    );

    // --- Positionen einfügen ---
    for (const position of JSON.parse(positions as string)) {
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

    // --- Bilder speichern ---
    const baseDir = "/root/service-webapp/public/uploads";
    const uploadDir = path.join(baseDir, kls_id);
    await fs.mkdir(uploadDir, { recursive: true });

    const pictureMetadata = [];

    for (const picture of beforeFiles) {
      if (picture && picture.mimetype) {
        if (!["image/jpeg", "image/png"].includes(picture.mimetype)) {
          return {
            status: "error",
            message: `Invalid file type: ${picture.mimetype}`,
          };
        }

        const uniqueFilename = `${uuidv4()}_${picture.originalFilename}`;
        const absoluteFilePath = path.join(uploadDir, uniqueFilename);
        const relativeFilePath = path.join(kls_id, uniqueFilename);

        await fs.rename(picture.filepath, absoluteFilePath);

        pictureMetadata.push({
          order_id: newOrderId,
          original_name: picture.originalFilename,
          saved_name: uniqueFilename,
          mime_type: picture.mimetype,
          path: relativeFilePath,
          label: "vorher",
        });
      }
    }
    for (const picture of afterFiles) {
      if (picture && picture.mimetype) {
        if (!["image/jpeg", "image/png"].includes(picture.mimetype)) {
          return {
            status: "error",
            message: `Invalid file type: ${picture.mimetype}`,
          };
        }

        const uniqueFilename = `${uuidv4()}_${picture.originalFilename}`;
        const absoluteFilePath = path.join(uploadDir, uniqueFilename);
        const relativeFilePath = path.join(kls_id, uniqueFilename);

        await fs.rename(picture.filepath, absoluteFilePath);

        pictureMetadata.push({
          order_id: newOrderId,
          original_name: picture.originalFilename,
          saved_name: uniqueFilename,
          mime_type: picture.mimetype,
          path: relativeFilePath,
          label: "nachher",
        });
      }
    }

    for (const metadata of pictureMetadata) {
      await connection.execute(
        `INSERT INTO sys.OrderPictures (order_id, original_name, saved_name, mime_type, path, label) 
         VALUES (?, ?, ?, ?, ?, ?);`,
        [
          metadata.order_id,
          metadata.original_name,
          metadata.saved_name,
          metadata.mime_type,
          metadata.path,
          metadata.label,
        ]
      );
    }

    return {
      status: "success",
      message: "Order completed and pictures uploaded successfully",
      data: { orderid: newOrderId, pictureMetadata, commentCopy },
    };
  } catch (error: any) {
    console.error("[ERROR]", error.message);
    return {
      status: "error",
      message: "Database operation or file upload failed",
      error: error.message,
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

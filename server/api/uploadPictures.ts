import { defineEventHandler } from "h3";
import formidable from "formidable";
import mysql from "mysql2/promise";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
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

    let orderid = Array.isArray(fields.orderid)
      ? fields.orderid[0]
      : fields.orderid;
    if (!orderid) {
      return { status: "error", message: "orderid is required" };
    }

    // Bestellung laden (inkl. KLS-ID)
    const [orderRows] = await connection.execute(
      "SELECT o.id, o.kls_id FROM sys.Orders o WHERE o.id = ?;",
      [orderid]
    );

    if (!Array.isArray(orderRows) || orderRows.length === 0) {
      return { status: "error", message: "Order not found" };
    }

    const { kls_id } = orderRows[0] as { kls_id: string };

    const pictureFiles = Array.isArray(files.pictures)
      ? files.pictures
      : [files.pictures];

    const baseDir = "/root/service-webapp/public/uploads";
    const uploadDir = path.join(baseDir, kls_id);
    await fs.mkdir(uploadDir, { recursive: true });

    const pictureMetadata = [];

    for (const picture of pictureFiles) {
      if (picture && picture.mimetype) {
        if (!["image/jpeg", "image/png"].includes(picture.mimetype)) {
          return {
            status: "error",
            message: `Invalid file type: ${picture.mimetype}`,
          };
        }

        const sanitizeFilename = (name: string) => {
          return name
            .toLowerCase()
            .replace(/\s+/g, "_") // Leerzeichen → Unterstrich
            .replace(/[^a-z0-9._-]/g, "") // Entfernt alles außer a-z, 0-9, ., _, -
            .replace(/_+/g, "_") // Mehrere Unterstriche → einer
            .replace(/^\.+/, "") // Entfernt führende Punkte
            .slice(0, 100); // Optional: Länge begrenzen
        };

        const sanitizedFilename = sanitizeFilename(
          picture.originalFilename || "unnamed.png"
        );
        const uniqueFilename = `${uuidv4()}_${sanitizedFilename}`;
        const absoluteFilePath = path.join(uploadDir, uniqueFilename);
        const relativeFilePath = `${kls_id}/${uniqueFilename}`.replace(
          /\\/g,
          "/"
        );

        await fs.rename(picture.filepath, absoluteFilePath);

        pictureMetadata.push({
          order_id: orderid,
          original_name: picture.originalFilename,
          saved_name: uniqueFilename,
          mime_type: picture.mimetype,
          path: relativeFilePath,
        });
      }
    }

    for (const metadata of pictureMetadata) {
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO sys.OrderPictures (order_id, original_name, saved_name, mime_type, path) 
     VALUES (?, ?, ?, ?, ?);`,
        [
          metadata.order_id,
          metadata.original_name,
          metadata.saved_name,
          metadata.mime_type,
          metadata.path,
        ]
      );

      metadata.id = result.insertId;
      metadata.url = `${process.env.IMAGE_URLPREFIX || ""}/uploads/${
        metadata.path
      }`;
    }

    return {
      status: "success",
      message: "Pictures uploaded successfully",
      data: pictureMetadata,
    };
  } catch (error: any) {
    console.error("[ERROR]", error.message);
    return {
      status: "error",
      message: "Picture upload failed",
      error: error.message,
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

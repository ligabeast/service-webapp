import { defineEventHandler, readBody } from "h3";
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

// Set the directory to store uploaded images
const uploadDir = path.resolve("uploads");

export default defineEventHandler(async (event) => {
  let connection;
  const userId: any = event.context.userId;

  try {
    connection = await mysql.createConnection(dbConfig);

    // Parse multipart form data
    const body = await readBody(event);

    const { adress, ordernumber, kls_id, pictures } = body;

    console.log("pictures", pictures);

    // Check if the order exists and is in 'started' status
    const [rows] = await connection.execute(
      "SELECT * FROM sys.Orders o WHERE o.ordernumber = ? AND o.status = 'started' AND o.user_id = ?;",
      [ordernumber, userId]
    );

    if (Array.isArray(rows) && rows.length > 0) {
      return {
        status: "error",
        message: "Ordernumber already exists",
      };
    }

    // Insert Order
    const [orderResult] = await connection.execute<ResultSetHeader>(
      "INSERT INTO sys.Orders (adress, ordernumber, kls_id, user_id, status, dateCreated) VALUES (?, ?, ?, ?, ?, NOW());",
      [adress, ordernumber, kls_id, userId, "started"]
    );

    const orderId = orderResult.insertId;

    // Ensure the upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Process and save images
    const pictureMetadata = [];

    for (const picture of pictures) {
      const { filename, filedata, mimetype } = picture;

      // Validate file type (e.g., only allow JPEG/PNG)
      if (!["image/jpeg", "image/png"].includes(mimetype)) {
        return {
          status: "error",
          message: `Invalid file type for ${filename}`,
        };
      }

      // Generate unique filename
      const uniqueFilename = `${uuidv4()}_${filename}`;
      const filePath = path.join(uploadDir, uniqueFilename);

      // Save file locally
      await fs.writeFile(filePath, filedata, "binary");

      // Collect metadata for DB insertion
      pictureMetadata.push({
        orderId,
        originalName: filename,
        savedName: uniqueFilename,
        mimeType: mimetype,
        path: filePath,
      });
    }

    // Insert picture metadata into the database
    for (const metadata of pictureMetadata) {
      await connection.execute(
        "INSERT INTO sys.OrderPictures (order_id, original_name, saved_name, mime_type, path) VALUES (?, ?, ?, ?, ?);",
        [
          metadata.orderId,
          metadata.originalName,
          metadata.savedName,
          metadata.mimeType,
          metadata.path,
        ]
      );
    }

    return {
      status: "success",
      message: "Order and pictures saved successfully",
      data: { orderId, pictureMetadata },
    };
  } catch (error: any) {
    return {
      status: "error",
      message: "Database operation failed",
      error: error.message,
    };
  } finally {
    // Always close the connection
    if (connection) {
      await connection.end();
    }
  }
});

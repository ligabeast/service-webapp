import { defineEventHandler, readBody } from "h3";
import mysql from "mysql2/promise";

// Datenbankkonfiguration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306"),
};

export default defineEventHandler(async (event) => {
  let connection;
  const user = event.context.user;

  try {
    // Body der Anfrage auslesen
    const body = await readBody(event);

    if (!body.materialName) {
      return {
        status: "error",
        message: "Material NAME is required",
      };
    }

    if (!user.isAdmin) {
      return {
        status: "error",
        message: "You are not authorized to add materials",
      };
    }

    const sql1 = "select * from material where name = ?";

    // Verbindung zur Datenbank herstellen
    connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(sql1, [body.materialName]);

    if (rows.length > 0) {
      return {
        status: "error",
        message: "Materialname already exists",
      };
    }

    // SQL-Abfrage zum Einfügen eines neuen Eintrags
    const sql2 = `
      INSERT INTO material (name)
      VALUES (?);
    `;
    const params = [body.materialName];

    const [result] = await connection.execute(sql2, params);

    return {
      status: "success",
      message: "Material added successfully",
      data: result,
    };
  } catch (error: any) {
    return {
      status: "error",
      message: "Failed to add material",
      error: error.message,
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

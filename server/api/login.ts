import { defineEventHandler, readBody } from "h3";
import mysql from "mysql2/promise";
import { compare } from "bcrypt";
import jwt from "jsonwebtoken"; // JWT für Token-Generierung

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
    const body = await readBody(event);
    const { username, password } = body;

    if (!username || !password) {
      return {
        status: "error",
        message: "Username and password are required",
      };
    }

    // Verbindung zur Datenbank herstellen
    connection = await mysql.createConnection(dbConfig);

    // Benutzer in der Datenbank suchen
    const findUserSql =
      "SELECT id, username, password_hash, is_admin FROM Users WHERE username = ?;";
    const [rows]: any[] = await connection.execute(findUserSql, [username]);

    if (rows.length === 0) {
      return {
        status: "error",
        message: "User not found",
      };
    }

    const user = rows[0];

    // Passwort vergleichen
    const passwordMatches = await compare(password, user.password_hash);
    if (!passwordMatches) {
      return {
        status: "error",
        message: "Invalid password",
      };
    }

    // JWT-Token generieren
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        password_hash: user.password_hash,
        isAdmin: user.is_admin === 1,
      }, // Payload
      JWT_SECRET, // Secret Key
      { expiresIn: "180 days" } // Gültigkeit des Tokens 30 tage
    );

    return {
      status: "success",
      message: "Login successful",
      data: {
        token, // JWT-Token an den Client zurückgeben
        userId: user.id,
        username: user.username,
      },
    };
  } catch (error: any) {
    return {
      status: "error",
      message: "Failed to login",
      error: error.message,
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

import { defineEventHandler, getHeader } from "h3";
import jwt, { JwtPayload } from "jsonwebtoken"; // Importiere JwtPayload

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export default defineEventHandler(async (event) => {
  console.log("Middleware hit: Checking token");
  const { req } = event;

  if (!req.url?.startsWith("/api") || req.url === "/api/login") {
    // Überspringe die Middleware für Nicht-API-Routen
    return;
  }

  const authorizationHeader = getHeader(event, "authorization");

  console.log("Authorization header:", authorizationHeader);

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return { statusCode: 401, message: "Unauthorized: Token not provided" };
  }

  const token = authorizationHeader.split(" ")[1];

  console.log("Token:", token);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    event.context.userId = decoded.userId;
    event.context.user = decoded;
  } catch (error: any) {
    return { statusCode: 403, message: error.message };
  }
});

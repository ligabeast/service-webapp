// server/api/distance.ts
import { defineEventHandler, getQuery } from "h3";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { fromLat, fromLng, toAddress } = query;

  if (!fromLat || !fromLng || !toAddress) {
    return { status: "error", message: "Missing parameters" };
  }

  const apiKey = process.env.GOOGLE_MAPS_KEY;
  const encodedDest = encodeURIComponent(toAddress);

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${fromLat},${fromLng}&destination=${encodedDest}&mode=driving&key=${apiKey}`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data.routes?.length) {
    return { status: "error", message: "No route found" };
  }

  const meters = data.routes[0].legs[0].distance.value;
  const kilometers = meters / 1000;

  return {
    status: "success",
    distanceKm: +kilometers.toFixed(1),
  };
});

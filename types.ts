export interface MaterialResponse {
  status: string;
  message: string;
  data?: { id: number; name: string }[]; // Optional, da es nur im Erfolgsfall vorhanden ist
  error?: any; // Optional, falls ein Fehler auftritt
}

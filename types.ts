export interface MaterialResponse {
  status: string;
  message: string;
  data: Material[]; // Optional, da es nur im Erfolgsfall vorhanden ist
  error?: any; // Optional, falls ein Fehler auftritt
}

export interface OrderResponse {
  status: string;
  message: string;
  data?: Order[]; // Optional, da es nur im Erfolgsfall vorhanden ist
  error?: any; // Optional, falls ein Fehler auftritt
}

export interface Material {
  id: number;
  name: string;
  quantity: number;
  type: string;
  description?: string;
  alias: string;
  dynamic: boolean;
}

export interface Order {
  id: number;
  kls_id: number;
  adress: string;
  ordernumber: string;
  user_id: number;
  status: string;
  dateCreated: string;
  notCompletedReason: string;
}

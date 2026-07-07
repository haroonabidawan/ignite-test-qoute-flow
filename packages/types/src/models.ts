export type QuotationStatus = "Draft" | "Sent" | "Approved" | "Rejected";

export interface PaginatedList<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  notes: string;
}

export interface QuotationItem {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unitPrice: number | null;
  estimatedHours: number | null;
}

export interface Quotation {
  id: string;
  clientId: string;
  title: string;
  status: QuotationStatus;
  createdAt: string;
  items: QuotationItem[];
  /** Server-computed total when returned from the API */
  total?: number;
}

export interface AiSuggestedItem {
  title: string;
  description: string;
  quantity: number;
  unit_price: number | null;
  estimated_hours: number | null;
}

export interface AiDraftResponse {
  project_type: string;
  suggested_items: AiSuggestedItem[];
  questions_to_ask_client: string[];
  summary: string;
  source?: string;
}

export interface User {
  email: string;
  name?: string;
}

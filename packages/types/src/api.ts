import type { QuotationStatus } from "./models";

export interface ApiPaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
}

export interface ApiClientRead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  notes: string;
  created_at: string;
}

export interface ApiQuotationItemRead {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit_price: number | null;
  estimated_hours: number | null;
  total: number;
}

export interface ApiQuotationRead {
  id: string;
  client_id: string;
  title: string;
  status: QuotationStatus;
  items: ApiQuotationItemRead[];
  total: number;
  created_at: string;
}

export interface ApiUserRead {
  id: string;
  email: string;
  name: string;
}

export interface ApiApproveData {
  quotation: ApiQuotationRead;
  webhook_delivered: boolean;
  webhook_detail: string;
}

/** @deprecated Use ApiApproveData - approve message lives on the envelope */
export interface ApiApproveResponse extends ApiApproveData {
  message: string;
}

export interface ApiAuthResponse {
  user: ApiUserRead;
  access_token: string;
  token_type: string;
}

export interface ApiAppConfig {
  currency_code: string;
}

export interface ApiAiUsage {
  hourly_used: number;
  hourly_limit: number;
  hourly_remaining: number;
  daily_used: number;
  daily_limit: number;
  daily_remaining: number;
  global_daily_used: number;
  global_daily_limit: number;
  cooldown_seconds: number;
  seconds_until_next_request: number;
  max_request_chars: number;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorData {
  code?: string;
  errors?: { msg: string; loc?: (string | number)[]; type?: string }[];
}

export interface ApiErrorBody {
  success: false;
  message: string;
  data: ApiErrorData;
}

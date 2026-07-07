import type {
  ApiClientRead,
  ApiQuotationItemRead,
  ApiQuotationRead,
  ApiUserRead,
  Client,
  Quotation,
  QuotationItem,
  User,
} from "@repo/types";

export function mapClient(raw: ApiClientRead): Client {
  return {
    id: raw.id,
    name: raw.name,
    company: raw.company,
    email: raw.email,
    phone: raw.phone,
    notes: raw.notes,
  };
}

export function mapQuotationItem(raw: ApiQuotationItemRead): QuotationItem {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    quantity: raw.quantity,
    unitPrice: raw.unit_price,
    estimatedHours: raw.estimated_hours,
  };
}

export function mapQuotation(raw: ApiQuotationRead): Quotation {
  return {
    id: raw.id,
    clientId: raw.client_id,
    title: raw.title,
    status: raw.status,
    createdAt: raw.created_at,
    total: raw.total,
    items: raw.items.map(mapQuotationItem),
  };
}

export function mapUser(raw: ApiUserRead): User {
  return {
    email: raw.email,
    name: raw.name,
  };
}

export function toClientPayload(data: Omit<Client, "id">) {
  return {
    name: data.name,
    company: data.company,
    email: data.email,
    phone: data.phone,
    notes: data.notes,
  };
}

export function toQuotationCreatePayload(data: Omit<Quotation, "id">) {
  return {
    client_id: data.clientId,
    title: data.title,
    status: data.status,
    items: data.items.map(toQuotationItemPayload),
  };
}

export function toQuotationUpdatePayload(data: Partial<Omit<Quotation, "id">>) {
  return {
    ...(data.clientId !== undefined ? { client_id: data.clientId } : {}),
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.status !== undefined ? { status: data.status } : {}),
    ...(data.items !== undefined
      ? { items: data.items.map(toQuotationItemPayload) }
      : {}),
  };
}

export function toQuotationItemPayload(item: QuotationItem) {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    estimated_hours: item.estimatedHours,
  };
}

export function toQuotationItemCreatePayload(
  item: Pick<
    QuotationItem,
    "title" | "description" | "quantity" | "unitPrice" | "estimatedHours"
  >
) {
  return {
    title: item.title,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    estimated_hours: item.estimatedHours,
  };
}

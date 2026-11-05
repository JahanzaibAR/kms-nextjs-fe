"use client";

// Browser-side CRUD for the logged-in user's customers and saved bills.
// Every call carries the Bearer JWT; the Strapi controllers scope results to
// the owner, so a user only ever touches their own records.

import { STRAPI_URL, getToken } from "./auth-client";

export type Customer = {
  id: number;
  documentId: string;
  name: string;
  code?: string;
  billCount?: number;
};

export type BillEntry = {
  date: string;
  subahMun: number;
  subahKg: number;
  shaamMun: number;
  shaamKg: number;
  subahRate: number;
  shaamRate: number;
  comm: number;
};

export type Bill = {
  id: number;
  documentId: string;
  billName?: string;
  startDate?: string;
  endDate?: string;
  commission: number;
  prevBalance: number;
  paid: number;
  totalMun: number;
  totalKg: number;
  totalAmount: number;
  baqaya: number;
  entries: BillEntry[];
  createdAt?: string;
  customer?: { name?: string };
};

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  if (!token) throw new Error("Pehle login karein");
  const res = await fetch(`${STRAPI_URL}/api/${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      const m = body?.error?.message as string | undefined;
      if (m) msg = /unique|already/i.test(m) ? "Is naam ka customer pehle se mojood hai" : m;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  const json = await res.json();
  return json.data as T;
}

// ----- Customers -----
export async function listCustomers(): Promise<Customer[]> {
  return (await api<Customer[]>("customers")) || [];
}

export async function createCustomer(name: string): Promise<Customer> {
  return api<Customer>("customers", {
    method: "POST",
    body: JSON.stringify({ data: { name } }),
  });
}

export async function updateCustomer(documentId: string, name: string): Promise<Customer> {
  return api<Customer>(`customers/${documentId}`, {
    method: "PUT",
    body: JSON.stringify({ data: { name } }),
  });
}

export async function deleteCustomer(documentId: string): Promise<void> {
  await api(`customers/${documentId}`, { method: "DELETE" });
}

// ----- Bills -----
export async function listBills(customerDocId: string): Promise<Bill[]> {
  return (await api<Bill[]>(`bills?customer=${encodeURIComponent(customerDocId)}`)) || [];
}

export async function createBill(payload: {
  customer: string; // documentId
  billName?: string;
  startDate: string;
  endDate: string;
  commission: number;
  prevBalance: number;
  paid: number;
  totalMun: number;
  totalKg: number;
  totalAmount: number;
  baqaya: number;
  entries: BillEntry[];
}): Promise<Bill> {
  return api<Bill>("bills", {
    method: "POST",
    body: JSON.stringify({ data: payload }),
  });
}

export async function getBill(documentId: string): Promise<Bill> {
  return api<Bill>(`bills/${documentId}`);
}

export async function updateBill(
  documentId: string,
  payload: {
    billName?: string;
    startDate: string;
    endDate: string;
    commission: number;
    prevBalance: number;
    paid: number;
    totalMun: number;
    totalKg: number;
    totalAmount: number;
    baqaya: number;
    entries: BillEntry[];
  }
): Promise<Bill> {
  return api<Bill>(`bills/${documentId}`, {
    method: "PUT",
    body: JSON.stringify({ data: payload }),
  });
}

export async function deleteBill(documentId: string): Promise<void> {
  await api(`bills/${documentId}`, { method: "DELETE" });
}

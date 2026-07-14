import type { DealsResponse, Offer, SearchRequest, SearchResponse } from "./types";

const defaultApiBaseUrl = "http://localhost:8000";

function getApiBaseUrl() {
  // Prefer public env var so the browser can call directly.
  // If you later add a Next.js route proxy, you can remove browser calls.
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? defaultApiBaseUrl;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: init?.cache ?? "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Tripzy API error: ${res.status} ${res.statusText} ${text}`);
  }

  return (await res.json()) as T;
}

export async function checkBackendHealth(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>("/health", { method: "GET" });
}

export async function fetchDeals(): Promise<DealsResponse> {
  return apiFetch<DealsResponse>("/api/deals", { method: "GET" });
}

export async function searchOffers(req: SearchRequest): Promise<SearchResponse> {
  // Backend expects travel_date as a date; sending YYYY-MM-DD works with FastAPI.
  return apiFetch<SearchResponse>("/api/search", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getFinalPriceLabel(offer: Offer) {
  return `${offer.platform_name}: ${formatINR(offer.final_price)}`;
}


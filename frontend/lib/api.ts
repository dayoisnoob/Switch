// export async function fetchApi(endpoint: string, options: RequestInit = {}) {
//   const baseUrl = process.env.NEXT_PUBLIC_API_URL;

//   if (!baseUrl) {
//     throw new Error("NEXT_PUBLIC_API_URL is not defined");
//   }

//   const cookieStore = await cookies();
//   const accessToken = cookieStore.get("__auth.access")?.value;
//   const refreshToken = cookieStore.get("__auth.refresh")?.value;

//   const cookieParts = [];
//   if (accessToken) cookieParts.push(`__auth.access=${accessToken}`);
//   if (refreshToken) cookieParts.push(`__auth.refresh=${refreshToken}`);
//   const cookieHeader = cookieParts.join("; ");

//   const headers = new Headers(options.headers);
//   if (!headers.has("Content-Type")) {
//     headers.set("Content-Type", "application/json");
//   }

//   if (cookieHeader) {
//     headers.set("Cookie", cookieHeader);
//   }

//   const response = await fetch(`${baseUrl}${endpoint}`, {
//     ...options,
//     headers,
//   });

//   return response;
// }

import axios, { isAxiosError } from "axios";
import type { ApiResponse } from "@/types";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => {
    return response.data?.data ?? response.data;
  },
  (error) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      window.location.href = "/login";
      return Promise.reject(new Error("Session expired"));
    }

    const message = error.response?.data?.message ?? "Something went wrong";
    return Promise.reject(new Error(message));
  },
);

// Server-side fetch helper (for SSR / Server Components)
// Uses native fetch with cookie forwarding — axios doesn't work in Server Components.
// YOUR JOB: Pass the cookie header from the incoming request.
export async function serverFetch<T>(
  path: string,
  cookieHeader: string,
): Promise<T> {
  const res = await fetch(`${process.env.API_URL}${path}`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store", // always fresh for authenticated data
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }

  const body: ApiResponse<T> = await res.json();
  return body.data as T;
}

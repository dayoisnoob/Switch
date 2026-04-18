import { cookies } from "next/headers";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("__auth.access")?.value;
  const refreshToken = cookieStore.get("__auth.refresh")?.value;

  const cookieParts = [];
  if (accessToken) cookieParts.push(`__auth.access=${accessToken}`);
  if (refreshToken) cookieParts.push(`__auth.refresh=${refreshToken}`);
  const cookieHeader = cookieParts.join("; ");

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (cookieHeader) {
    headers.set("Cookie", cookieHeader);
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

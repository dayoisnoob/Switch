import { NextRequest, NextResponse } from "next/server";

export async function handler(req: NextRequest) {
  const path = req.nextUrl.pathname.replace("/api", "");
  const url = `${process.env.BACKEND_URL}${path}${req.nextUrl.search}`;

  const headers = new Headers(req.headers);

  const response = await fetch(url, {
    method: req.method,
    headers,
    body:
      req.method !== "GET" && req.method !== "HEAD"
        ? await req.arrayBuffer()
        : undefined,
    redirect: "manual",
  });

  const newResponse = new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  });

  return newResponse;
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

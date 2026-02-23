import { NextRequest } from "next/server";

export function getUserId(req: NextRequest | Request) {
  const fromHeader = req.headers.get("x-user-id");
  if (fromHeader) {
    return fromHeader;
  }

  try {
    const url = "nextUrl" in req ? req.nextUrl.toString() : req.url;
    const parsed = new URL(url);
    const fromQuery = parsed.searchParams.get("userId");
    if (fromQuery) {
      return fromQuery;
    }
  } catch {
    // no-op, fallback below
  }

  return "u1";
}

export function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "content-type": "application/json" },
  });
}

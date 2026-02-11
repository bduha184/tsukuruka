import { NextRequest, NextResponse } from "next/server";

// Prefer explicit backend endpoint, fallback to NEXT_PUBLIC_API_URL + /graphql
let BACKEND_GRAPHQL_ENDPOINT = (process.env.GRAPHQL_ENDPOINT ||
  (process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/graphql`
    : undefined)) as string | undefined;

// Some setups (gqlgen server) expose GraphQL at /query. If configured endpoint uses
// /graphql, normalize it to /query so the proxy reaches the backend correctly.
if (
  BACKEND_GRAPHQL_ENDPOINT &&
  /\/graphql\/?$/.test(BACKEND_GRAPHQL_ENDPOINT)
) {
  BACKEND_GRAPHQL_ENDPOINT = BACKEND_GRAPHQL_ENDPOINT.replace(
    /\/graphql\/?$/,
    "/query",
  );
}
export async function POST(req: NextRequest) {
  console.log("GRAPHQL_ENDPOINT:", BACKEND_GRAPHQL_ENDPOINT);
  if (!BACKEND_GRAPHQL_ENDPOINT) {
    console.error(
      "GRAPHQL_ENDPOINT is not configured. Check .env files or environment variables (GRAPHQL_ENDPOINT or NEXT_PUBLIC_API_URL).",
    );
    return NextResponse.json(
      { error: "Backend endpoint not configured" },
      { status: 500 },
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    console.error("Failed to parse request body:", e);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const res = await fetch(BACKEND_GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    // Read raw text first so we can handle non-JSON responses gracefully
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: res.status });
    } catch (parseErr) {
      console.error("Backend returned non-JSON response:", text);
      // Forward status and raw text so the client can see the backend body
      return NextResponse.json(
        { error: "Backend returned non-JSON response", details: text },
        { status: res.status },
      );
    }
  } catch (e) {
    console.error("Backend fetch failed:", e);
    return NextResponse.json(
      { error: "Backend error", details: String(e) },
      { status: 500 },
    );
  }
}

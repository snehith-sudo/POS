import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("Next.js API → Received logout call");

    const cookieHeader = request.headers.get("cookie") || "";

    const res = await fetch("http://localhost:8080/auth/logout", {
      method: "POST",
      headers: {"Cookie": cookieHeader, },
      credentials: "include"
    });

    console.log("Backend logout status:", res.status);

    return NextResponse.json(
      { message: "Logged out" },
      { status: res.status }
    );
  } catch (e) {
    console.error("Logout error:", e);
    return NextResponse.json(
      { message: "Internal error" },
      { status: 500 }
    );
  }
}

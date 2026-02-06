import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const cookie = request.headers.get("cookie");

    const res = await fetch("http://localhost:8080/auth/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(cookie && { cookie }),
      },
      credentials: "include",
    });

    if (!res.ok) {
      console.error("Auth/me failed with status:", res.status);
      return NextResponse.json(
        { message: "Authentication failed" },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log("Auth/me - User is authenticated:", data);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

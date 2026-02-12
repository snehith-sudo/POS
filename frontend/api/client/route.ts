import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  try {
    const res = await fetch("http://localhost:8080/client/getAll", {
      credentials: "include",
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { message: errorText || "Backend error" },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log("GET /api/client response data:", data);
    return NextResponse.json(data);

  } catch (error) {
    console.error("GET /api/client error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) : Promise<NextResponse>{
  try {
    const body = await request.json();

    const cookie = request.headers.get("cookie");
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { message: "Client name is required" },
        { status: 400 }
      );
    }

    const res = await fetch("http://localhost:8080/client/addClient", {
      method: "POST",
      headers: { "Content-Type": "application/json" ,
        ...(cookie && { cookie }),},
      credentials: "include",
      body: JSON.stringify({ name }),
    });

    const backendBody = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { message: backendBody?.error || "Client creation failed" },
        { status: res.status }
      );
    }

    return NextResponse.json(
      { message: "Client successfully added" },
      { status: 200 }
    );

  } catch (error) {
    console.error("POST /api/client error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

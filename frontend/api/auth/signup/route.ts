import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();

    if (!body.backendusername || !body.backendpassword) {
      return NextResponse.json({ message: "username and password required" }, { status: 400 });
    }

    const payload = {
      username: body.backendusername,
      password: body.backendpassword,
    };

    const res = await fetch("http://localhost:8080/auth/signup", {
      method: "POST",
      headers: {"Content-Type": "application/json",},
      body: JSON.stringify(payload),
    });

    const result = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json({ message: result?.message || result?.error || "Signup failed" }, { status: res.status || 400 });
    }

    return NextResponse.json({ message: result?.message || "Signup successful" }, { status: res.status });
  } catch (error) {
    console.error("POST /api/auth/signup error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

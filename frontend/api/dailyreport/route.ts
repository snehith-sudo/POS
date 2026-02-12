import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const cookie = request.headers.get("cookie");
    
    const { startDate, endDate } = body;
  

    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    const res = await fetch("http://localhost:8080/salesreport/getdaysales", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" ,
        ...(cookie && { cookie }),},
      body: JSON.stringify({ startDate, endDate }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Backend error" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("POST /api/salesreport error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

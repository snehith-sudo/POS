import { NextResponse } from "next/server";

type PaginationBody = {
  page: number;
  size: number;
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: PaginationBody = await request.json();
    const { page, size } = body;

    const cookie = request.headers.get("cookie");

    if (
      typeof page !== "number" || typeof size !== "number" || page < 0 || size <= 0) 
      {
      return NextResponse.json(
        { message: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const res = await fetch("http://localhost:8080/salesreport/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" ,
        ...(cookie && { cookie }),
      },
      credentials: "include",
      body: JSON.stringify({ page, size }),
    });

    console.log("reS is ", res);

    let data;
    try {
      data = await res.json();
      console.log("Parsed JSON response:", data);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      return NextResponse.json(
        { message: "Backend returned invalid JSON" },
        { status: 502 }
      );
    }

    console.log("Backend response status:", res.status);
    console.log("Backend data:", data);

    if (!res.ok) {
      console.error("Backend error:", data?.message || "Unknown error");
      return NextResponse.json(
        { message: data?.message || "Backend error" },
        { status: res.status }
      );
    }

    console.log("Sending to frontend:", data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("POST /api/orders/pages error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

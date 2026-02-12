import { NextResponse } from "next/server";

type PaginationBody = {
  page: number;
  size: number;
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: PaginationBody = await request.json();
    const { page, size } = body;

    console.log("Order pagination request - page:", page, "size:", size, "types:", typeof page, typeof size);

    const cookie = request.headers.get("cookie");

    if (
      typeof page !== "number" || typeof size !== "number" || page < 0 || size <= 0) 
      {
      console.error("Validation failed - page:", page, "size:", size);
      return NextResponse.json(
        { message: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const res = await fetch("http://localhost:8080/orders/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" ,
        ...(cookie && { cookie }),
      },
      credentials: "include",
      body: JSON.stringify({ page, size }),
    });


    let data;
    try {
      data = await res.json();
    } catch (parseError) {
      return NextResponse.json(
        { message: "Session expired,Login again",},
        { status: 502 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.error || "Backend error" },
        { status: res.status }
      );
    }

    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("POST /api/orders/pages error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

type PaginationBody = {
  page: number;
  size: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { page, size } = body;

    console.log("Products pagination request - page:", page, "size:", size, "types:", typeof page, typeof size);

    const cookie = request.headers.get("cookie");

    if (
      typeof page !== "number" ||
      typeof size !== "number" ||
      page < 0 ||
      size <= 0
    ) {
      console.error("Validation failed - page:", page, "size:", size);
      return NextResponse.json(
        { message: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const res = await fetch("http://localhost:8080/products/pages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookie ? { cookie } : {}),
      },
      body: JSON.stringify({ page, size }),
    });

    console.log("Response status from backend:", res.status);

    const result = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        {
          message:
            result?.detailedError ||
            result?.error ||
            result?.message ||
            "Session expired,Login again",
        },
        { status: res.status || 400 }
      );
    }
    return NextResponse.json(result, { status: res.status });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

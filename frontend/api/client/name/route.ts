import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { searchValue } = body;

    const cookie = request.headers.get("cookie");

    console.log("body ",body," searchvalue ",searchValue)

    if (!searchValue || typeof searchValue !== "string") {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 400 }
      );
    }
    const payload = {
      name:searchValue
    }

    const res = await fetch("http://localhost:8080/client/name", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json",
         ...(cookie && { cookie }),
       },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    console.log(res)

  
    if (!res.ok) {
      return NextResponse.json(
        { message: result.error || "Failed to fetch client" },
        { status: res.status }
      );
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("API error:", error);

    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

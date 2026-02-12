import { NextResponse } from "next/server";

export async function GET(request: Request,{ params }: { params: Promise<{ id: string }> }) 
{
  const { id } = await params; // ✅ await params

  if (!id) {
    return NextResponse.json(
      { message: "Order ID is required" },
      { status: 400 }
    );
  }
  const cookie = request.headers.get("cookie");

  // call backend
  const res = await fetch(`http://localhost:8080/orders/${id}`,{
    headers:{ ...(cookie && { cookie }),}
  });

    const data = await res.json();

    if (!res.ok) {
        return NextResponse.json(
            { message: data?.error || "Error from backend" },
            { status: 500 }
        );
    }
    console.log("Fetched order data:", data);

  return NextResponse.json(data);
}

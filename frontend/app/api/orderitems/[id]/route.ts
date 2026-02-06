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

  // call backend
  const res = await fetch(`http://localhost:8080/orderitems/${id}`);

    const data = await res.json();

    if (!res.ok) {
        return NextResponse.json(
            { message: data?.error || "Error from backend" },
            { status: 500 }
        );
    }

  return NextResponse.json(data);
}

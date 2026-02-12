import { NextResponse } from "next/server";


type OrderItem = {
  barcode: string;
  orderedQty: number;
  sellingPrice: number;
};

export async function GET(req: Request) {
  try {
    // forward Authorization header from browser → backend
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "Missing Authorization header" },
        { status: 401 }
      );
    }

    const res = await fetch("http://localhost:8080/orders/getAll", {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.error || "Backend error" },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();

    const cookie = request.headers.get("cookie");

    const items: OrderItem[] = body.OrderItems;

    console.log("Items #1 ", items);

    /// validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "Order must contain at least one item" },
        { status: 400 }
      );
    }

    for (const item of items) {
      if (
        typeof item.barcode !== "string" ||
        typeof item.orderedQty !== "number" ||
        typeof item.sellingPrice !== "number"
      ) {
        return NextResponse.json(
          { message: "Invalid order item data" },
          { status: 400 }
        );
      }

      if (item.orderedQty <= 0 || item.sellingPrice <= 0) {
        return NextResponse.json(
          { message: "Quantity and price must be greater than zero" },
          { status: 400 }
        );
      }
    }

    const res = await fetch("http://localhost:8080/orders/createOrder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookie && { cookie }),
      },
      body: JSON.stringify({ items }),
    });

    console.log("Items are  ", items)

    const result = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { message: result?.error || "Order creation failed" },
        { status: res.status }
      );
    }

    // ✅ Success response
    return NextResponse.json(
      {
        message: "Order created successfully",
        data: result,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("POST /api/orders error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
// http://localhost:8080/orders/status

export async function PUT(request: Request): Promise<NextResponse> {
  try {
    const { id } = await request.json();

    const cookie = request.headers.get("cookie");

    if (!id) {
      return NextResponse.json(
        { message: "Order id is required" },
        { status: 400 }
      );
    }

    const res = await fetch("http://localhost:8080/orders/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(cookie && { cookie }),
      },
      body: JSON.stringify({ orderId: id }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: "Order invoice creation failed" },
        { status: res.status }
      );
    }

    // Backend returns 204 → frontend-friendly 200
    return NextResponse.json(
      { message: "Order invoiced successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("PUT /api/order error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

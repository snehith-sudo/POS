import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://localhost:8080/products/allProducts", {
      credentials: "include",
    });

    let result: any = null;
    try {
      result = await res.json();
    } catch {
      // backend returned no JSON (401, 204, etc.)
    }

    if (!res.ok) {
        console.log("GET /api/products error response:", result);
      return NextResponse.json(
        {
          message:
            result?.detailedError ||
            result?.error ||
            "Products fetching error",
        },
        { status: res.status }
      );
    }

    return NextResponse.json(result, { status: res.status });

  } catch (error) {
    console.error("GET /api/products failed:", error);

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

        if (!body.backendBarcode || !body.backendProductName ||
            !body.backendclientName || !body.backendMrp) {
            return NextResponse.json(
                { message: "All input fields are required" },
                { status: 400 }) // correct status ??
        }

        const payload = {
            barcode: body.backendBarcode,
            name: body.backendProductName,
            clientName: body.backendclientName,
            mrp: body.backendMrp,
            imageUrl: body.backendImageUrl,
        };

        const res = await fetch("http://localhost:8080/products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(cookie && { cookie }),
            },
            body: JSON.stringify(payload)
        });

        const result = await res.json().catch(() => null);; // .catch() ??

        if (!res.ok) {
            return NextResponse.json(
                { message: (result.detailedError) || result.error || "Product creation error" },
                { status: res?.status || 400 }
            )
        }

        return NextResponse.json(
            { message: "Product added successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("POST /api/products/add error: ", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();

        const cookie = request.headers.get("cookie");

        if (!body.barcode || !body.productName || !body.clientName || !body.mrp) {
            return NextResponse.json(
                { message: "All input fields are required" },
                { status: 400 }
            );
        }

        const payload = {
            barcode: body.barcode,
            name: body.productName,
            clientName: body.clientName,
            mrp: body.mrp,
            imageUrl: body.url,
        };

        const res = await fetch("http://localhost:8080/products", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...(cookie && { cookie }),
            },
            body: JSON.stringify(payload)
        });

        const result = await res.json().catch(() => null);

        if (!res.ok) {
            return NextResponse.json(
                { message: (result?.detailedError) || result?.error || "Product update error" },
                { status: res?.status || 400 }
            );
        }

        return NextResponse.json(
            { message: "Product updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("PUT /api/products error: ", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
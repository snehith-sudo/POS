import { NextResponse } from "next/server";


export async function GET() {
  const res = await fetch("http://localhost:8080/inventory/pages", {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  

  if (!res.ok) {
    return NextResponse.json(
      { message: data?.error || "Error from backend" },
      { status: res.status }
    );
  }

  return NextResponse.json(data);
}


export async function POST(request: Request): Promise<NextResponse> {

    try {
        const body = await request.json();

        const cookie = request.headers.get("cookie");

        if (!body.backendBarcode || !body.backendQuantity) {
            return NextResponse.json(
                { message: "All input fields are required" },
                { status: 400 }
            )
        }

        const payload = {
            barcode: body.backendBarcode,
            quantity: body.backendQuantity
        }

        const res = await fetch("http://localhost:8080/inventory/singleupload", {
            method: "POST",
            headers: { "Content-Type": "application/json" ,
        ...(cookie && { cookie }),},
            body: JSON.stringify(payload)
        });

        const result = await res.json().catch(() => null);; // .catch() ??

        if (!res.ok) {
            return NextResponse.json(
                { message: result.error || "Inventory Item creation error" },
                { status: res?.status || 400 }
            )
        }
        return NextResponse.json(
            { message: "Product added successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("POST /api/Inventory/ error: ", error);
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

        if (!body.backendid || !body.backendQuantity || !body.backendBarcode) {
            return NextResponse.json(
                { message: "All input fields are required" },
                { status: 400 }
            )
        }
        const payload = {
            id: body.backendid,
            quantity: body.backendQuantity,
            barcode: body.backendBarcode
        }
        
        const res = await fetch("http://localhost:8080/inventory/singleupdate", {
            method: "PUT",
            headers: { "Content-Type": "application/json" ,
        ...(cookie && { cookie }),},
            body: JSON.stringify(payload)
        });
        const result =  await res.json().catch(() => null);;

        if (!res.ok) {
            return NextResponse.json(
                { message: result.error || "Inventory Item update error" },
                { status: res?.status || 400 }
            )
        }
        return NextResponse.json(
            { message: "Inventory updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("PUT /api/Inventory/ error: ", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();

        const cookie = request.headers.get("cookie");

        const filterBy = body.filter;
        const searchValue = body.search;

        console.log("filer ", filterBy, "  seacr ", searchValue);

        if (!filterBy || !searchValue) {
            return NextResponse.json(
                { message: "filterBy and searchValue are required" },
                { status: 400 }
            );
        }

        let backendUrl = "";
        let backendPayload: any = {};

        // 🔥 map frontend → backend
        if (filterBy === "barcode") {
            backendUrl = "http://localhost:8080/products/barcode";
            backendPayload = { barcode: searchValue };
        } else if (filterBy === "clientName") {
            backendUrl = "http://localhost:8080/products/client";
            backendPayload = { clientName: searchValue };
        } else {
            return NextResponse.json(
                { message: "Invalid filter type" },
                { status: 400 }
            );
        }

        const res = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" ,
        ...(cookie && { cookie }),},
            body: JSON.stringify(backendPayload),
        });

        const result = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { message: result?.error || "Backend error" },
                { status: res.status }
            );
        }
        console.log(result)

        return NextResponse.json(result);
    } catch (error) {
        console.error("POST /api/products error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();

        const cookie = request.headers.get("cookie");

        const searchValue = body.search;

        if (!searchValue) {
            return NextResponse.json(
                { message: "searchValue is required" },
                { status: 400 }
            );
        }

        const res = await fetch("http://localhost:8080/inventory/barcode", {
            method: "POST",
            headers: { "Content-Type": "application/json",
        ...(cookie && { cookie })},
            body: JSON.stringify({barcode:searchValue}),
        });

        const result = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { message: result?.error || "Backend error" },
                { status: res.status }
            );
        }
        console.log(result.content);

        return NextResponse.json(result);
    } catch (error) {
        console.error("POST /api/inventory error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}

import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = await request.json();

        const cookie = request.headers.get("cookie");

        const base64file = body.base64;
        console.log("Received base64 TSV:", base64file);

        const res = await fetch("http://localhost:8080/inventory/upload", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(cookie && { cookie }),
            },
            body: JSON.stringify({
                base64file: base64file,
            }),
        });

        const result = await res.json().catch(() => null);

        if (!res.ok) {
            return NextResponse.json(
                {
                    message:
                        result?.detailedError ||
                        result?.error ||
                        "Inventory creation error",
                },
                { status: res.status || 400 }
            );
        }
        return NextResponse.json(result, { status: res.status });

    } catch (error) {
        console.error("Error processing TSV data:", error);
        return NextResponse.json(
            { message: "Failed to process TSV data" },
            { status: 500 }
        );
    }
}

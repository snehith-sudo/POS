import { NextResponse } from "next/server";

type FilterBody = {
    mode: "orderstatus" | "date";
    orderStatus?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
};

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body: FilterBody = await request.json();

        const cookie = request.headers.get("cookie");

        if (!body || !body.mode) {
            return NextResponse.json({ message: "Invalid filter request" }, { status: 400 });
        }

        let url = "";
        let payload: any = {};
        console.log("Filter request body:", body);

        if (body.mode === "orderstatus") {
            if (!body.orderStatus) {
                return NextResponse.json({ message: "orderStatus is required" }, { status: 400 });
            }
            url = "http://localhost:8080/orders/orderStatus";
            payload = { status: body.orderStatus,page:body.page,size:body.size };
        } 
            else if (body.mode === "date") {
            const { startDate, endDate ,page,size} = body;
            if (!startDate || !endDate) {
                return NextResponse.json({ message: "startDate and endDate are required" }, { status: 400 });
            }

            url = "http://localhost:8080/orders/dates";
            payload = { startDate, endDate,page,size };
        }

        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(cookie && { cookie }),
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
            return NextResponse.json({ message: data?.error || "Backend error" }, { status: res.status });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("POST /api/order/filter error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

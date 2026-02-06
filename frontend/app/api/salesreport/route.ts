import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  try {
    const res = await fetch("http://localhost:8080/salesreport", {
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { message: errorText || "Backend error" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("GET /api/salesreport error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

type ReportRequest = {
  clientName?: string;
  startDate?: string; // ISO string
  endDate?: string;   // ISO string
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: ReportRequest = await request.json();

    const cookie = request.headers.get("cookie");

    const hasClient = !!body.clientName;
    const hasDates = !!(body.startDate && body.endDate);

    let backendUrl = "";

    // 🔀 Decide backend route
    if (hasClient && hasDates) {
      backendUrl = "http://localhost:8080/salesreport/byDatesClient";
    } else if (hasDates) {
      backendUrl = "http://localhost:8080/salesreport/byDates";
    } else if (hasClient) {
      backendUrl = "http://localhost:8080/salesreport";
    } else {
      return NextResponse.json(
        { message: "At least one filter (client or date range) is required" },
        { status: 400 }
      );
    }

    // 🔁 Call backend
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookie && { cookie }),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);


    if (!res.ok) {
      return NextResponse.json(
        { message: data?.error || "Sales report fetch failed" },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("POST /api/report error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

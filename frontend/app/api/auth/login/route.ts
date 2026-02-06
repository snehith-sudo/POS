import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const backendRes = await fetch("http://localhost:8080/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      username: body.backendusername,
      password: body.backendpassword,
    }),
  });

  const data = await backendRes.json();

  const response = NextResponse.json(data, { status: backendRes.status });

  const setCookie = backendRes.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}

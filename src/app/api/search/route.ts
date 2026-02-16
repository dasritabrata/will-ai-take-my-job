import { NextResponse } from "next/server";

import { searchJobs, toErrorPayload } from "@/lib/jobService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";

    if (!q.trim()) {
      return NextResponse.json([]);
    }

    const results = await searchJobs(q);
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    const { message, statusCode } = toErrorPayload(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

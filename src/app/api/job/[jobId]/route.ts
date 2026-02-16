import { NextResponse } from "next/server";

import { getOrCreateJob, toErrorPayload } from "@/lib/jobService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  try {
    const { jobId } = await context.params;
    const job = await getOrCreateJob(jobId);

    return NextResponse.json(job, { status: 200 });
  } catch (error) {
    const { message, statusCode } = toErrorPayload(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

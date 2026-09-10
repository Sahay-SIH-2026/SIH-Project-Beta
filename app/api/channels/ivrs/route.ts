import { NextResponse } from "next/server";
import { ingestIVRSCall, type IVRSPayload } from "@/lib/channels";

export async function POST(req: Request) {
  try {
    let payload: IVRSPayload;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      payload = {
        callerPhone: (formData.get("callerPhone") || formData.get("From") || "").toString(),
        callSid: formData.get("callSid")?.toString(),
        dtmfScore: formData.get("dtmfScore") ? parseInt(formData.get("dtmfScore")!.toString(), 10) : undefined,
        speechTranscript: formData.get("speechTranscript")?.toString(),
        durationSeconds: formData.get("durationSeconds") ? parseInt(formData.get("durationSeconds")!.toString(), 10) : undefined,
        caseId: formData.get("caseId")?.toString(),
      };
    } else {
      payload = await req.json().catch(() => ({}));
    }

    if (!payload.callerPhone) {
      return NextResponse.json(
        { error: "Missing required field: callerPhone is required." },
        { status: 400 }
      );
    }

    const result = await ingestIVRSCall(payload);
    return NextResponse.json(result, { status: result.success ? 200 : 422 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

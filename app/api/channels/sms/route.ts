import { NextResponse } from "next/server";
import { ingestInboundSMS, type SMSPayload } from "@/lib/channels";

export async function POST(req: Request) {
  try {
    let payload: SMSPayload;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      // Support Twilio / standard SMS gateway form field names (From, Body)
      payload = {
        fromPhone: (formData.get("fromPhone") || formData.get("From") || "").toString(),
        toPhone: (formData.get("toPhone") || formData.get("To") || "").toString(),
        messageBody: (formData.get("messageBody") || formData.get("Body") || "").toString(),
        caseId: formData.get("caseId")?.toString(),
      };
    } else {
      payload = await req.json().catch(() => ({}));
    }

    if (!payload.fromPhone || !payload.messageBody) {
      return NextResponse.json(
        { error: "Missing required fields: fromPhone and messageBody are required." },
        { status: 400 }
      );
    }

    const result = await ingestInboundSMS(payload);
    return NextResponse.json(result, { status: result.success ? 200 : 422 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

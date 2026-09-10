import { NextResponse } from "next/server";
import { ingestHelplineIntake, type HelplineCallPayload } from "@/lib/channels";

export async function POST(req: Request) {
  try {
    let payload: HelplineCallPayload;

    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      const reportedTier = (formData.get("reportedDistressTier") || "CONCERN").toString() as
        | "NORMAL"
        | "CONCERN"
        | "ELEVATED"
        | "CRITICAL";

      payload = {
        callerIdentifier: (formData.get("callerIdentifier") || formData.get("phone") || "").toString(),
        operatorId: formData.get("operatorId")?.toString(),
        notes: (formData.get("notes") || "").toString(),
        reportedDistressTier: reportedTier,
        callerWantsCallBack: formData.get("callerWantsCallBack") === "true",
        caseId: formData.get("caseId")?.toString(),
      };
    } else {
      payload = await req.json().catch(() => ({}));
    }

    if (!payload.callerIdentifier || !payload.notes) {
      return NextResponse.json(
        { error: "Missing required fields: callerIdentifier and notes are required." },
        { status: 400 }
      );
    }

    const result = await ingestHelplineIntake(payload);
    return NextResponse.json(result, { status: result.success ? 200 : 422 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

/**
 * GET /api/health — Health-check endpoint.
 *
 * Returns: { status: "ok", service: "sahay" }
 * This is the only API route implemented in Phase 1.
 */

import { NextResponse } from "next/server";
import type { ApiHealthResponse } from "@/types";

export function GET(): NextResponse<ApiHealthResponse> {
  return NextResponse.json({
    status: "ok",
    service: "sahay",
  });
}

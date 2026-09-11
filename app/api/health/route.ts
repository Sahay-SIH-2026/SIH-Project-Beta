/**
 * GET /api/health — Health-check endpoint.
 *
 * Returns: { status: "ok", service: "luma" }
 * This is the only API route implemented in Phase 1.
 */

import { NextResponse } from "next/server";
import type { ApiHealthResponse } from "@/types";

export function GET(): NextResponse<ApiHealthResponse> {
  return NextResponse.json({
    status: "ok",
    service: "luma",
  });
}

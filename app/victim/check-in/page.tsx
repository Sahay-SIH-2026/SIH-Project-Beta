/**
 * /victim/check-in — Well-being check-in workflow.
 */

import type { Metadata } from "next";
import { CheckInForm } from "@/components/victim/CheckInForm";

export const metadata: Metadata = { title: "Daily Check-In" };

export default function VictimCheckInPage() {
  return (
    <div className="luma-container max-w-2xl py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Today&rsquo;s Check-In</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell LUMA how you are feeling today. Your response is private and helps your support worker understand how to support you over time.
        </p>
      </div>

      <CheckInForm />
    </div>
  );
}

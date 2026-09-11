/**
 * /victim/support — Support & Emergency Contact Information
 */

import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/db/profiles";
import { createServerClient } from "@/lib/supabase/server";
import { Phone, HeartHandshake, UserCheck } from "lucide-react";



export const metadata: Metadata = { title: "Support & Crisis Resources" };

const OFFICIAL_HELPLINES = [
  {
    name: "National Victim & Complainant Support Helpline",
    number: "14566",
    hours: "24x7 Free & Confidential",
    desc: "National portal helpline for legal, psychological, and protection support.",
  },
  {
    name: "Tele-MANAS (Mental Health Helpline)",
    number: "14416 / 1800-891-4416",
    hours: "24x7 Multi-lingual Care",
    desc: "Ministry of Health & Family Welfare national tele-mental health counseling service.",
  },
  {
    name: "Women Helpline (All-India)",
    number: "1091 / 181",
    hours: "24x7 Emergency Helpline",
    desc: "Immediate crisis response and police facilitation for women in distress.",
  },
  {
    name: "National Emergency Service",
    number: "112",
    hours: "Immediate Dispatch",
    desc: "Police, Fire, and Ambulance emergency response.",
  },
];

export default async function VictimSupportPage() {
  const profile = await getCurrentProfile();
  let counselorName: string | null = null;
  let caseRef: string | null = null;

  if (profile) {
    try {
      const supabase = await createServerClient();
      const { data } = await supabase
        .from("cases")
        .select("case_ref, counselor:profiles!cases_counselor_id_fkey(display_name)")
        .eq("victim_id", profile.id)
        .order("opened_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        caseRef = data.case_ref;
        const c = data.counselor as unknown as { display_name: string } | null;
        counselorName = c?.display_name || null;
      }
    } catch (e) {
      console.error("Error loading counselor in support page:", e);
    }
  }

  return (
    <div className="luma-container py-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Support &amp; Resources</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Access your assigned support counselor contact and trusted 24/7 institutional helplines.
        </p>
      </div>

      {/* Assigned Counselor */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm mb-6">
        <div className="flex items-center gap-2 font-semibold text-foreground text-base mb-2">
          <UserCheck className="h-5 w-5 text-primary" /> Assigned Support Worker
        </div>
        {counselorName ? (
          <div className="mt-3 bg-secondary/40 p-4 rounded-md">
            <p className="text-base font-semibold text-foreground">{counselorName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Assigned to your active case ({caseRef || "Active"}).
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Your counselor reviews your check-in submissions and schedules follow-up calls or in-person sessions during regular operating hours.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic mt-2">
            Your case intake is registered and currently pending counselor allocation by the district coordinator.
          </p>
        )}
      </div>

      {/* 24/7 Institutional Helplines */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <HeartHandshake className="h-5 w-5 text-primary" /> Verified 24/7 Helplines
        </h2>

        {OFFICIAL_HELPLINES.map((line) => (
          <div
            key={line.number}
            className="rounded-lg border border-border bg-card p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h3 className="text-base font-semibold text-foreground">{line.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{line.desc}</p>
              <span className="inline-block mt-2 rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                {line.hours}
              </span>
            </div>

            <a
              href={`tel:${line.number.split(" ")[0]}`}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm shrink-0"
            >
              <Phone className="h-4 w-4" /> Call {line.number}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

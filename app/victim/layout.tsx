/**
 * Victim portal layout — mobile-first, wraps all /victim/* routes.
 */

import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { VictimNav } from "@/components/navigation/VictimNav";

export const metadata: Metadata = {
  title: {
    default: "Victim Portal",
    template: "%s | Victim Portal | SAHAY",
  },
};

export default function VictimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <VictimNav />
      {/* pb-16 accounts for mobile bottom nav bar */}
      <main className="flex-1 pb-16 sm:pb-0">{children}</main>
    </div>
  );
}

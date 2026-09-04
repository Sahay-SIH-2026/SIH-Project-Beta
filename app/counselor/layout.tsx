/**
 * Counselor portal layout — desktop/tablet-first sidebar layout.
 */

import type { Metadata } from "next";
import { CounselorNav } from "@/components/navigation/CounselorNav";

export const metadata: Metadata = {
  title: {
    default: "Counselor Portal",
    template: "%s | Counselor Portal | SAHAY",
  },
};

export default function CounselorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <CounselorNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

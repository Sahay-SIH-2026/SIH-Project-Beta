/**
 * Admin portal layout — minimal sidebar layout.
 */

import type { Metadata } from "next";
import { AdminNav } from "@/components/navigation/AdminNav";

export const metadata: Metadata = {
  title: {
    default: "Admin Portal",
    template: "%s | Admin Portal | SAHAY",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

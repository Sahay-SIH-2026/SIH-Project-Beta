/**
 * Counselor portal layout — desktop/tablet-first sidebar layout.
 */

import type { Metadata } from "next";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getCurrentProfile } from "@/lib/db/profiles";

export const metadata: Metadata = {
  title: {
    default: "Counselor Portal",
    template: "%s | Counselor Portal | LUMA",
  },
};

export default async function CounselorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  return (
    <SidebarProvider>
      <AppSidebar profileName={profile?.display_name ?? "Counselor"} />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center border-b px-4">
          <SidebarTrigger />
          <span className="ml-2 text-sm font-medium text-muted-foreground">
            Counselor Portal
          </span>
        </header>
        <main className="m-2 flex-1 overflow-y-auto bg-background p-6 md:m-4">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

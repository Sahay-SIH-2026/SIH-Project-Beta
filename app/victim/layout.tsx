/**
 * Victim portal layout — mobile-first, wraps all /victim/* routes.
 */

import type { Metadata } from "next";
import { VictimLoginToast } from "@/components/auth/VictimLoginToast";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getCurrentProfile } from "@/lib/db/profiles";

export const metadata: Metadata = {
  title: {
    default: "Victim Portal",
    template: "%s | Victim Portal | LUMA",
  },
};

export default async function VictimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  return (
    <div className="flex min-h-screen flex-col">
      <SidebarProvider>
        <AppSidebar
          portal="victim"
          profileName={profile?.display_name ?? "Victim"}
        />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center border-b px-4">
            <SidebarTrigger />
            <span className="ml-2 text-sm font-medium text-muted-foreground">
              Victim Portal
            </span>
          </header>
          <main className="m-2 flex-1 overflow-y-auto bg-background p-6 md:m-4">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
      <VictimLoginToast />
    </div>
  );
}

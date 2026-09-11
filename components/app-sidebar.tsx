"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FolderOpen,
  Bell,
  Radio,
  Sparkles,
  CalendarCheck,
  FileText,
  ClipboardList,
  Home,
  Database,
  LifeBuoy,
  MessageCircleHeart,
} from "lucide-react";
import { ROUTES, APP_NAME } from "@/lib/constants";
import { SignOutButton } from "@/components/auth/SignOutButton";

const navItems = [
  { href: ROUTES.counselor.root, label: "Dashboard", icon: LayoutDashboard },
  { href: ROUTES.counselor.cases, label: "Cases", icon: FolderOpen },
  { href: ROUTES.counselor.alerts, label: "Alerts", icon: Bell },
  { href: ROUTES.counselor.channels, label: "Channels", icon: Radio },
  { href: ROUTES.counselor.demo, label: "Demo Studio", icon: Sparkles },
  {
    href: ROUTES.counselor.followUps,
    label: "Follow-ups",
    icon: CalendarCheck,
  },
  { href: ROUTES.counselor.reports, label: "Reports", icon: FileText },
  { href: ROUTES.counselor.auditLog, label: "Audit Log", icon: ClipboardList },
] as const;

const victimNavItems = [
  { href: ROUTES.victim.root, label: "Home", icon: Home },
  { href: ROUTES.victim.checkIn, label: "Check-in", icon: MessageCircleHeart },
  { href: ROUTES.victim.case, label: "My Case", icon: FolderOpen },
  { href: ROUTES.victim.data, label: "My Data", icon: Database },
  { href: ROUTES.victim.support, label: "Support", icon: LifeBuoy },
] as const;

export function AppSidebar({
  profileName = "Counselor",
  portal = "counselor",
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  profileName?: string;
  portal?: "counselor" | "victim";
}) {
  const pathname = usePathname();
  const items = portal === "victim" ? victimNavItems : navItems;
  const homeRoute =
    portal === "victim" ? ROUTES.victim.root : ROUTES.counselor.root;

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href={homeRoute} />}>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold tracking-wide text-sidebar-primary">
                  {APP_NAME}
                </span>
                <span className="truncate text-xs">
                  {portal === "victim" ? "Victim Portal" : "Counselor Portal"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2 py-3">
          {items.map(({ href, label, icon: Icon }) => {
            const active =
              href === homeRoute
                ? pathname === href
                : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  isActive={active}
                  tooltip={label}
                  render={
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                    />
                  }
                >
                  <Icon />
                  <span>{label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip={profileName}>
              <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                {profileName.slice(0, 2).toUpperCase()}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{profileName}</span>
                <span className="truncate text-xs">
                  {portal === "victim" ? "Victim" : "Counselor"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SignOutButton
              label="Sign out"
              className="w-full rounded-md px-2 py-2 text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive"
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

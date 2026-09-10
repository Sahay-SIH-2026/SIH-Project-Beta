"use client";

import { useTransition } from "react";
import { signOutAction } from "@/app/actions/auth";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
  className?: string;
  showIcon?: boolean;
  label?: string;
}

export function SignOutButton({
  className,
  showIcon = true,
  label = "Sign out",
}: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          await signOutAction();
        });
      }}
      disabled={isPending}
      className={cn(
        "flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive cursor-pointer disabled:opacity-50",
        className
      )}
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      <span>{isPending ? "Signing out..." : label}</span>
    </button>
  );
}

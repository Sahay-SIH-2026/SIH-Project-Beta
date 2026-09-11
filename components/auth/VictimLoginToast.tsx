"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

export function VictimLoginToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const hasShown = useRef(false);

  useEffect(() => {
    // Only show if the URL has ?login=success and we haven't shown it yet in this mount
    if (searchParams?.get("login") === "success" && !hasShown.current) {
      hasShown.current = true;
      
      // Clean up the URL so a manual refresh doesn't trigger it again
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("login");
      const newUrl = pathname + (newParams.toString() ? `?${newParams.toString()}` : "");
      
      // Use replace so it doesn't add to back history
      router.replace(newUrl, { scroll: false });

      toast("If You Are in Immediate Danger", {
        description: "LUMA is a periodic well-being support platform, not an emergency dispatch service. If you are in immediate physical danger, call 112 or 1091 right away.",
        icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
        duration: 8000,
      });
    }
  }, [searchParams, router, pathname]);

  return null;
}

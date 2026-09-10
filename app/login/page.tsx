import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — SAHAY",
  description: "Secure login for victims, counselors, and administrative staff.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 sm:p-8 bg-muted/20">
      <LoginForm />
    </div>
  );
}

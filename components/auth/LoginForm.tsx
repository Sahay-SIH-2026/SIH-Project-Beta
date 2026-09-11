"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail, AlertCircle, ArrowRight, Shield } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInAction, undefined);

  return (
    <Card className="w-full max-w-md shadow-lg border-border/80">
      <CardHeader className="space-y-1 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Shield className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">
          Welcome to {APP_NAME}
        </CardTitle>
        <CardDescription>
          Sign in to access your secure support portal
        </CardDescription>
      </CardHeader>

      <form action={formAction}>
        <CardContent className="space-y-4 pt-4">
          {state?.error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@sahay.org"
                autoComplete="email"
                required
                className="pl-9"
              />
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="pl-9"
              />
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Quick Demo Credentials Reminder */}
          <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground space-y-1 border border-border/50">
            <p className="font-semibold text-foreground">Demo Accounts:</p>
            <p className="flex justify-between">
              <span>Counselor: <code>counselor@sahay.org</code></span>
              <span className="font-mono text-muted-foreground/80">Password123!</span>
            </p>
            <p className="flex justify-between">
              <span>Admin: <code>admin@sahay.org</code></span>
              <span className="font-mono text-muted-foreground/80">Password123!</span>
            </p>
            <p className="flex justify-between">
              <span>Victim: <code>victim1@demo.sahay.org</code></span>
              <span className="font-mono text-muted-foreground/80">Password123!</span>
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button
            type="submit"
            className="w-full gap-2 font-medium"
            disabled={isPending}
          >
            {isPending ? "Signing in..." : "Sign In"}
            {!isPending && <ArrowRight className="h-4 w-4" />}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Protected by Row Level Security and encrypted session cookies.
          </p>
          
          <Link
            href="/"
            className="text-xs text-center text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Return to home
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

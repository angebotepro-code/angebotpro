"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); }
    else { router.push("/app/dashboard"); router.refresh(); }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (password.length < 6) { setError(t("login.passwordMinLength")); setLoading(false); return; }
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError(error.message); }
    else { setError(null); alert(t("login.signupSuccess")); }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Brand */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
            <span className="text-xl font-bold text-emerald-400">A</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
            {t("login.title")}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">{t("login.subtitle")}</p>
        </div>

        <Card className="shadow-card bg-zinc-900/50 backdrop-blur">
          <CardContent className="pt-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="w-full bg-zinc-800/50">
                <TabsTrigger value="login" className="flex-1 text-xs">{t("login.login")}</TabsTrigger>
                <TabsTrigger value="signup" className="flex-1 text-xs">{t("login.signup")}</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="login-email" className="text-xs font-medium text-zinc-400">{t("login.email")}</label>
                    <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.at" required autoFocus
                      className="h-10 border-zinc-800 bg-zinc-800/50 text-zinc-100 placeholder:text-zinc-500" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="login-password" className="text-xs font-medium text-zinc-400">{t("login.password")}</label>
                    <div className="relative">
                      <Input id="login-password" type={showPassword ? "text" : "password"}
                        value={password} onChange={(e) => setPassword(e.target.value)} required
                        className="h-10 border-zinc-800 bg-zinc-800/50 text-zinc-100 pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300">
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
                  <Button type="submit" disabled={loading}
                    className="h-10 w-full bg-emerald-500 text-sm font-medium hover:bg-emerald-600">
                    {loading ? "..." : t("login.loginButton")}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="signup-email" className="text-xs font-medium text-zinc-400">{t("login.email")}</label>
                    <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.at" required autoFocus
                      className="h-10 border-zinc-800 bg-zinc-800/50 text-zinc-100 placeholder:text-zinc-500" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="signup-password" className="text-xs font-medium text-zinc-400">{t("login.password")}</label>
                    <div className="relative">
                      <Input id="signup-password" type={showPassword ? "text" : "password"}
                        value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                        className="h-10 border-zinc-800 bg-zinc-800/50 text-zinc-100 pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300">
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-500">Minimum 6 characters</p>
                  </div>
                  {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
                  <Button type="submit" disabled={loading}
                    className="h-10 w-full bg-emerald-500 text-sm font-medium hover:bg-emerald-600">
                    {loading ? "..." : t("login.signupButton")}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex-col gap-2 pb-6">
            <Separator className="bg-zinc-800" />
            <p className="text-[11px] text-zinc-600 text-center">
              By continuing, you agree to our{" "}
              <a href="/agb" className="underline hover:text-zinc-400">Terms</a> and{" "}
              <a href="/datenschutz" className="underline hover:text-zinc-400">Privacy Policy</a>.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

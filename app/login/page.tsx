"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/app/dashboard");
      router.refresh();
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError(t("login.passwordMinLength"));
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setError(null);
      alert(t("login.signupSuccess"));
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-zinc-50">
            {t("login.title")}
          </CardTitle>
          <CardDescription className="text-zinc-400">
            {t("login.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="w-full bg-zinc-800">
              <TabsTrigger value="login" className="flex-1">
                {t("login.login")}
              </TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">
                {t("login.signup")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-zinc-300">
                    {t("login.email")}
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-zinc-700 bg-zinc-800 text-zinc-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-zinc-300">
                    {t("login.password")}
                  </Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-zinc-700 bg-zinc-800 text-zinc-100"
                  />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                >
                  {loading ? t("login.loggingIn") : t("login.loginButton")}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-zinc-300">
                    {t("login.email")}
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-zinc-700 bg-zinc-800 text-zinc-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-zinc-300">
                    {t("login.password")}
                  </Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="border-zinc-700 bg-zinc-800 text-zinc-100"
                  />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                >
                  {loading ? t("login.signingUp") : t("login.signupButton")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

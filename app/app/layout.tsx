"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "./logout-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
      } else {
        setEmail(user.email ?? null);
      }
    });
  }, []);

  const initials = email?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="flex min-h-screen bg-zinc-950">
      <aside className="flex w-64 flex-col border-r border-zinc-800 bg-zinc-900 p-4">
        <Link href="/app/dashboard" className="mb-6 text-xl font-bold text-zinc-50">
          {t("general.appName")}
        </Link>

        <nav className="flex flex-col gap-1">
          <Link
            href="/app/dashboard"
            className={buttonVariants({
              variant: "ghost",
              className: "justify-start text-zinc-300 hover:text-zinc-100",
            })}
          >
            {t("sidebar.dashboard")}
          </Link>
          <Link
            href="/app/angebote/neu"
            className={buttonVariants({
              variant: "ghost",
              className: "justify-start text-zinc-300 hover:text-zinc-100",
            })}
          >
            {t("sidebar.newQuote")}
          </Link>
          <Link
            href="/app/test"
            className={buttonVariants({
              variant: "ghost",
              className: "justify-start text-zinc-300 hover:text-zinc-100",
            })}
          >
            {t("sidebar.test")}
          </Link>
          <Link
            href="/app/einstellungen"
            className={buttonVariants({
              variant: "ghost",
              className: "justify-start text-zinc-300 hover:text-zinc-100",
            })}
          >
            {t("sidebar.settings")}
          </Link>
        </nav>

        <div className="mt-auto">
          <Separator className="my-4 bg-zinc-800" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-emerald-800 text-emerald-200 text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm text-zinc-300">{email}</p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

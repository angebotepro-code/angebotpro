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
import { useEffect, useState, useCallback } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  const close = useCallback(() => setSidebarOpen(false), []);

  const navLinks = (
    <nav className="flex flex-col gap-1">
      {[
        { href: "/app/dashboard", key: "sidebar.dashboard" },
        { href: "/app/angebote/neu", key: "sidebar.newQuote" },
        { href: "/app/test", key: "sidebar.test" },
        { href: "/app/einstellungen", key: "sidebar.settings" },
      ].map(({ href, key }) => (
        <Link
          key={href}
          href={href}
          onClick={close}
          className={buttonVariants({
            variant: "ghost",
            className: "justify-start text-zinc-300 hover:text-zinc-100",
          })}
        >
          {t(key)}
        </Link>
      ))}
    </nav>
  );

  const sidebarFooter = (
    <>
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
    </>
  );

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-zinc-800 bg-zinc-900 p-4">
        <Link href="/app/dashboard" className="mb-6 text-xl font-bold text-zinc-50" onClick={close}>
          {t("general.appName")}
        </Link>
        {navLinks}
        <div className="mt-auto">{sidebarFooter}</div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={close}>
          <div className="absolute inset-0 bg-black/60" />
          <aside
            className="absolute left-0 top-0 bottom-0 w-64 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <Link href="/app/dashboard" className="text-xl font-bold text-zinc-50" onClick={close}>
                {t("general.appName")}
              </Link>
              <button onClick={close} className="text-zinc-400 hover:text-zinc-200 text-xl leading-none p-1">
                ✕
              </button>
            </div>
            {navLinks}
            <div className="mt-auto">{sidebarFooter}</div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-300 hover:text-zinc-100 text-xl leading-none p-1"
          >
            ☰
          </button>
          <span className="font-bold text-zinc-50 text-lg">
            {t("general.appName")}
          </span>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

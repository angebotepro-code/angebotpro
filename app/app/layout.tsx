"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { LogoutButton } from "./logout-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useI18n } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  HomeIcon,
  DocumentTextIcon,
  PlusIcon,
  BeakerIcon,
  Cog6ToothIcon,
  XMarkIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login");
      else setEmail(user.email ?? null);
    });
  }, []);

  const initials = email?.slice(0, 2).toUpperCase() ?? "??";
  const close = useCallback(() => setSidebarOpen(false), []);

  const navLinks = (
    <nav className="flex flex-col gap-1">
      {[
        { href: "/app/dashboard", key: "sidebar.dashboard", icon: HomeIcon },
        { href: "/app/angebote", key: "sidebar.quotes", icon: DocumentTextIcon },
        { href: "/app/angebote/neu", key: "sidebar.newQuote", icon: PlusIcon },
        { href: "/app/test", key: "sidebar.test", icon: BeakerIcon },
        { href: "/app/einstellungen", key: "sidebar.settings", icon: Cog6ToothIcon },
      ].map(({ href, key, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/app/dashboard" && pathname.startsWith(href));
        return (
        <Link key={href} href={href} onClick={close}
          className={buttonVariants({ variant: isActive ? "secondary" : "ghost", className: `justify-start gap-2.5 ${isActive ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}` })}>
          <Icon className="size-4 shrink-0" />
          {t(key)}
        </Link>
      )})}
    </nav>
  );

  const sidebarFooter = (
    <>
      <Separator />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>
      <LogoutButton />
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border bg-sidebar h-screen sticky top-0 overflow-hidden p-4">
        <Link href="/app/dashboard" className="mb-6 text-xl font-bold text-foreground shrink-0" onClick={close}>
          Angebot<span className="text-black dark:text-white">Pro</span>
        </Link>
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {navLinks}
        </div>
        <div className="shrink-0 pt-2">{sidebarFooter}</div>
      </aside>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={close}>
          <div className="absolute inset-0 bg-black/60" />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-border p-4 flex flex-col z-50" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <Link href="/app/dashboard" className="text-xl font-bold text-foreground" onClick={close}>Angebot<span className="text-brand">Pro</span></Link>
              <button onClick={close} aria-label="Close sidebar" className="text-muted-foreground hover:text-foreground leading-none p-1"><XMarkIcon className="size-5" /></button>
            </div>
            {navLinks}
            <div className="mt-auto">{sidebarFooter}</div>
          </aside>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-sidebar">
          <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" className="text-muted-foreground hover:text-foreground leading-none p-1"><Bars3Icon className="size-6" /></button>
          <span className="font-bold text-foreground text-lg">Angebot<span className="text-brand">Pro</span></span>
        </div>
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n/context";
import { useTheme } from "@/components/theme-provider";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HomeIcon,
  DocumentTextIcon,
  BeakerIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const { theme, toggle: toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [bottomProfileOpen, setBottomProfileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login");
      else setEmail(user.email ?? null);
    });
  }, []);

  const initials = email?.slice(0, 2).toUpperCase() ?? "??";

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const navLinks = (
    <nav className="flex flex-col gap-1">
      {[
        { href: "/app/dashboard", key: "sidebar.dashboard", icon: HomeIcon },
        { href: "/app/angebote", key: "sidebar.quotes", icon: DocumentTextIcon },
        { href: "/app/rechnungen", key: "sidebar.invoices", icon: CurrencyDollarIcon },
        { href: "/app/test", key: "sidebar.test", icon: BeakerIcon },
        { href: "/app/einstellungen", key: "sidebar.settings", icon: Cog6ToothIcon },
      ].map(({ href, key, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/app/dashboard" && pathname.startsWith(href));
        return (
        <Link key={href} href={href}
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
      <div className="relative">
        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-3 w-full rounded-lg p-2 hover:bg-muted transition-colors text-left cursor-pointer"
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm text-foreground">{email}</p>
          </div>
        </button>
        {profileOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
            <div className="absolute bottom-full left-0 mb-2 w-56 z-50 rounded-lg border border-border bg-card shadow-lg py-1">
              <p className="px-3 py-2 text-xs text-muted-foreground truncate">{email}</p>
              <div className="h-px bg-border mx-1 my-1" />
              <button
                onClick={() => { toggleTheme(); setProfileOpen(false); }}
                className="flex items-center justify-between w-full px-3 py-2 text-sm text-foreground hover:bg-muted text-left"
              >
                Theme
                <span className="text-xs text-muted-foreground">
                  {theme === "dark" ? <SunIcon className="size-3.5" /> : <MoonIcon className="size-3.5" />}
                </span>
              </button>
              <button
                onClick={() => { setLang(lang === "en" ? "de" : "en"); setProfileOpen(false); }}
                className="flex items-center justify-between w-full px-3 py-2 text-sm text-foreground hover:bg-muted text-left"
              >
                Language
                <span className="text-xs text-muted-foreground">{lang === "en" ? "DE" : "EN"}</span>
              </button>
              <div className="h-px bg-border mx-1 my-1" />
              <button
                onClick={() => { handleLogout(); }}
                className="flex items-center w-full px-3 py-2 text-sm text-destructive hover:bg-muted text-left"
              >
                {t("sidebar.logout")}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border bg-sidebar h-screen sticky top-0 overflow-hidden p-4">
        <Link href="/app/dashboard" className="mb-6 text-xl font-bold text-foreground shrink-0">
          Werkit
        </Link>
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {navLinks}
        </div>
        <div className="shrink-0 pt-2">{sidebarFooter}</div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar border-t border-border px-2 pb-safe">
        <div className="flex items-center justify-around h-14">
          {[
            { href: "/app/dashboard", label: t("sidebar.dashboard") || "Home", icon: HomeIcon },
            { href: "/app/angebote", label: t("sidebar.quotes") || "Quotes", icon: DocumentTextIcon },
            { href: "/app/rechnungen", label: t("sidebar.invoices") || "Invoices", icon: CurrencyDollarIcon },
            { href: "/app/einstellungen", label: t("sidebar.settings") || "Settings", icon: Cog6ToothIcon },
          ].map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/app/dashboard" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 text-[10px] font-medium transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon className="size-5" />
                <span>{label}</span>
              </Link>
            );
          })}
          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Avatar className="h-5 w-5 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-[8px]">{initials}</AvatarFallback>
              </Avatar>
              <span>You</span>
            </button>
            {bottomProfileOpen && (
              <>
                <div className="fixed inset-0 z-50" onClick={() => setBottomProfileOpen(false)} />
                <div className="absolute bottom-full right-0 mb-2 w-44 z-50 rounded-lg border border-border bg-card shadow-lg py-1">
                  <p className="px-3 py-2 text-xs text-muted-foreground truncate">{email}</p>
                  <div className="h-px bg-border mx-1 my-1" />
                  <button
                    onClick={() => { toggleTheme(); setBottomProfileOpen(false); }}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm text-foreground hover:bg-muted text-left"
                  >
                    Theme
                    <span className="text-xs text-muted-foreground">{theme === "dark" ? <SunIcon className="size-3.5" /> : <MoonIcon className="size-3.5" />}</span>
                  </button>
                  <button
                    onClick={() => { setLang(lang === "en" ? "de" : "en"); setBottomProfileOpen(false); }}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm text-foreground hover:bg-muted text-left"
                  >
                    Language
                    <span className="text-xs text-muted-foreground">{lang === "en" ? "DE" : "EN"}</span>
                  </button>
                  <div className="h-px bg-border mx-1 my-1" />
                  <button
                    onClick={() => { handleLogout(); }}
                    className="flex items-center w-full px-3 py-2 text-sm text-destructive hover:bg-muted text-left"
                  >
                    {t("sidebar.logout")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="md:hidden flex items-center px-4 py-3 border-b border-border bg-sidebar">
          <span className="font-bold text-foreground text-lg">Werkit</span>
        </div>
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

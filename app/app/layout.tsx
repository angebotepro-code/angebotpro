"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n/context";
import { useTheme } from "@/components/theme-provider";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  HomeIcon,
  DocumentTextIcon,
  BeakerIcon,
  Cog6ToothIcon,
  XMarkIcon,
  Bars3Icon,
  CurrencyDollarIcon,
  SunIcon,
  MoonIcon,
  PlusIcon,
  ChevronDownIcon,
  DocumentPlusIcon,
} from "@heroicons/react/24/outline";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const { theme, toggle: toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [email, setEmail] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.push("/login");
      else setEmail(user.email ?? null);
    });
  }, []);

  const initials = email?.slice(0, 2).toUpperCase() ?? "??";
  const close = useCallback(() => setSidebarOpen(false), []);

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
        {/* Mobile header with New button */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" className="text-muted-foreground hover:text-foreground leading-none p-1"><Bars3Icon className="size-6" /></button>
            <span className="font-bold text-foreground text-lg">Angebot<span className="text-foreground">Pro</span></span>
          </div>
          <div className="relative">
            <button onClick={() => setNewOpen(!newOpen)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/80">
              <PlusIcon className="size-4" />New<ChevronDownIcon className="size-3.5" /></button>
            {newOpen && (<>
              <div className="fixed inset-0 z-50" onClick={() => setNewOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-lg border border-border bg-card shadow-lg py-1">
                <Link href="/app/angebote/neu" onClick={() => setNewOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted">
                  <DocumentTextIcon className="size-4" />New Quote</Link>
                <Link href="/app/rechnungen/neu" onClick={() => setNewOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted">
                  <CurrencyDollarIcon className="size-4" />New Invoice</Link>
              </div>
            </>)}
          </div>
        </div>
        {/* Desktop header with New button */}
        <div className="hidden md:flex items-center justify-end px-6 py-3">
          <div className="relative">
            <button onClick={() => setNewOpen(!newOpen)} className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/80">
              <PlusIcon className="size-4" />New<ChevronDownIcon className="size-3.5" /></button>
            {newOpen && (<>
              <div className="fixed inset-0 z-50" onClick={() => setNewOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-lg border border-border bg-card shadow-lg py-1">
                <Link href="/app/angebote/neu" onClick={() => setNewOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted">
                  <DocumentTextIcon className="size-4" />New Quote</Link>
                <Link href="/app/rechnungen/neu" onClick={() => setNewOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted">
                  <CurrencyDollarIcon className="size-4" />New Invoice</Link>
              </div>
            </>)}
          </div>
        </div>
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

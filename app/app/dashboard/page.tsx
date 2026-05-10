"use client";
import { toast } from "sonner";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";
import {
  PaperAirplaneIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Separator } from "@/components/ui/separator";

interface Angebot {
  id: string;
  number: string;
  title: string;
  status: string;
  totalGross: number;
  mwstRate: number;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  draft: "text-muted-foreground border-border bg-muted",
  sent: "text-blue-600 dark:text-blue-300 border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950",
  accepted: "text-emerald-600 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950",
  rejected: "text-red-600 dark:text-red-300 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950",
  expired: "text-muted-foreground border-border bg-card",
};

export default function DashboardPage() {
  const { t } = useI18n();
  const [angebote, setAngebote] = useState<Angebot[]>([]);
  const [invoiceCounts, setInvoiceCounts] = useState({ open: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [newOpen, setNewOpen] = useState(false);

  function loadQuotes() {
    fetch("/api/angebote")
      .then((r) => r.json())
      .then((data) => setAngebote(Array.isArray(data) ? data : []));
    fetch("/api/invoices")
      .then(r => r.json())
      .then((data) => {
        const invs = Array.isArray(data) ? data : [];
        setInvoiceCounts({
          open: invs.filter((i: any) => i.status === "sent" || i.status === "overdue").length,
          overdue: invs.filter((i: any) => i.status === "overdue").length,
        });
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadQuotes(); }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/angebote/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(status === "accepted" ? { status, acceptedAt: new Date().toISOString() } : { status }),
    });
    loadQuotes();
    toast.success(status === "accepted" ? "Quote accepted" : "Quote rejected");
  }

  const counts = {
    sent: angebote.filter((a) => a.status === "sent").length,
    accepted: angebote.filter((a) => a.status === "accepted").length,
    rejected: angebote.filter((a) => a.status === "rejected").length,
    draft: angebote.filter((a) => a.status === "draft").length,
  };

  const statCards = [
    { label: t("dashboard.sent"), count: counts.sent, icon: PaperAirplaneIcon },
    { label: t("dashboard.accepted"), count: counts.accepted, icon: CheckCircleIcon },
    { label: t("dashboard.rejected"), count: counts.rejected, icon: XCircleIcon },
    { label: t("dashboard.open"), count: counts.draft, icon: PencilSquareIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{t("dashboard.welcome")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        {/* Desktop New button */}
        <div className="hidden sm:block relative">
          <button onClick={() => setNewOpen(!newOpen)} className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/80">
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

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          const colorMap: Record<string, string> = {
            sent: "text-blue-400",
            accepted: "text-brand",
            rejected: "text-destructive",
            open: "text-muted-foreground",
          };
          const colorKey = Object.keys(colorMap).find(k => s.label.toLowerCase().startsWith(k)) ?? "open";
          return (
          <Card key={s.label} className="shadow-card bg-card">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Icon className={`size-5 ${colorMap[colorKey]}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                <p className={`text-xl font-bold ${colorMap[colorKey]}`}>{s.count}</p>
              </div>
            </CardContent>
          </Card>
        )})}
        {/* Invoice stat cards */}
        <Link href="/app/rechnungen">
          <Card className="shadow-card bg-card hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><CurrencyDollarIcon className="size-5 text-muted-foreground" /></div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t("dashboard.openInvoices") || "Open Invoices"}</p>
                <p className={`text-xl font-bold ${invoiceCounts.overdue > 0 ? "text-red-500" : "text-muted-foreground"}`}>
                  {invoiceCounts.open}{invoiceCounts.overdue > 0 ? ` (${invoiceCounts.overdue} überfällig)` : ""}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quote list */}
      <Card className="shadow-card transition-[box-shadow] duration-150 bg-card">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground">{t("dashboard.recentQuotes")}</CardTitle>
          {angebote.length > 0 && (
            <Link href="/app/angebote" className="text-xs text-muted-foreground hover:text-foreground">{t("dashboard.showAll")}</Link>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : angebote.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <PencilSquareIcon className="mb-3 size-8 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">{t("dashboard.noQuotes")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("dashboard.getStarted")}</p>
              <Link href="/app/angebote/neu" className={buttonVariants({ className: "mt-4 bg-foreground text-background hover:bg-foreground/80 h-8 text-xs" })}>
                Create Quote
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {angebote.map((a) => (
                <div key={a.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg p-3 hover:bg-muted/30 transition-colors">
                  <Link href={`/app/angebote/${a.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground group-hover:text-foreground">{a.title || a.number}</span>
                      <Badge className={`shrink-0 text-[10px] px-1.5 py-0 font-normal ${statusColors[a.status] ?? "text-muted-foreground"}`}>
                        {a.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {a.number} · {new Date(a.createdAt).toLocaleDateString("de-AT")}
                    </p>
                  </Link>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium tabular-nums text-foreground">€{(a.totalGross ?? 0).toFixed(2)}</span>
                    {(a.status === "draft" || a.status === "sent") && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" aria-label="Accept quote" className="h-7 w-7 p-0 text-emerald-600 dark:text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-brand/10"
                          onClick={(e) => { e.preventDefault(); updateStatus(a.id, "accepted"); }}><CheckIcon className="size-4" /></Button>
                        <Button size="sm" variant="ghost" aria-label="Reject quote" className="h-7 w-7 p-0 text-red-600 dark:text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-destructive/10"
                          onClick={(e) => { e.preventDefault(); updateStatus(a.id, "rejected"); }}><XMarkIcon className="size-4" /></Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile floating New button */}
      <div className="md:hidden fixed bottom-4 right-4 z-40 flex gap-2">
        <Link href="/app/angebote/neu" className="flex items-center gap-1.5 h-10 px-4 rounded-full bg-foreground text-background text-sm font-medium shadow-lg hover:bg-foreground/80">
          <DocumentTextIcon className="size-4" />New Quote</Link>
        <Link href="/app/rechnungen/neu" className="flex items-center gap-1.5 h-10 px-4 rounded-full bg-foreground text-background text-sm font-medium shadow-lg hover:bg-foreground/80">
          <CurrencyDollarIcon className="size-4" />New Invoice</Link>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loading";
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
  draft: "text-zinc-400 border-zinc-700 bg-zinc-800",
  sent: "text-blue-300 border-blue-800 bg-blue-950",
  accepted: "text-emerald-300 border-emerald-800 bg-emerald-950",
  rejected: "text-red-300 border-red-800 bg-red-950",
  expired: "text-zinc-500 border-zinc-800 bg-zinc-900",
};

export default function DashboardPage() {
  const { t } = useI18n();
  const [angebote, setAngebote] = useState<Angebot[]>([]);
  const [loading, setLoading] = useState(true);

  function loadQuotes() {
    fetch("/api/angebote")
      .then((r) => r.json())
      .then((data) => setAngebote(Array.isArray(data) ? data : []))
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
  }

  const counts = {
    sent: angebote.filter((a) => a.status === "sent").length,
    accepted: angebote.filter((a) => a.status === "accepted").length,
    rejected: angebote.filter((a) => a.status === "rejected").length,
    draft: angebote.filter((a) => a.status === "draft").length,
  };

  const statCards = [
    { label: t("dashboard.sent"), count: counts.sent, icon: "📤", color: "text-blue-400" },
    { label: t("dashboard.accepted"), count: counts.accepted, icon: "✅", color: "text-emerald-400" },
    { label: t("dashboard.rejected"), count: counts.rejected, icon: "❌", color: "text-red-400" },
    { label: t("dashboard.open"), count: counts.draft, icon: "📝", color: "text-zinc-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">{t("dashboard.welcome")}</h1>
          <p className="mt-1 text-sm text-zinc-400">{t("dashboard.subtitle")}</p>
        </div>
        <Link href="/app/angebote/neu" className={buttonVariants({ className: "bg-emerald-500 hover:bg-emerald-600 h-9 text-sm" })}>
          + New Quote
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label} className="shadow-card transition-[box-shadow] duration-150 bg-zinc-900/50">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/50 text-lg">{s.icon}</div>
              <div>
                <p className="text-xs font-medium text-zinc-500">{s.label}</p>
                <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quote list */}
      <Card className="shadow-card transition-[box-shadow] duration-150 bg-zinc-900/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-zinc-300">{t("dashboard.recentQuotes")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : angebote.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 text-3xl">📋</div>
              <p className="text-sm font-medium text-zinc-400">{t("dashboard.noQuotes")}</p>
              <p className="mt-1 text-xs text-zinc-600">Create your first quote to get started.</p>
              <Link href="/app/angebote/neu" className={buttonVariants({ className: "mt-4 bg-emerald-500 hover:bg-emerald-600 h-8 text-xs" })}>
                Create Quote
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {angebote.map((a) => (
                <div key={a.id} className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg p-3 hover:bg-zinc-800/30 transition-colors">
                  <Link href={`/app/angebote/${a.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-zinc-200 group-hover:text-zinc-100">{a.title || a.number}</span>
                      <Badge className={`shrink-0 text-[10px] px-1.5 py-0 font-normal ${statusColors[a.status] ?? "text-zinc-400"}`}>
                        {a.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-600">
                      {a.number} · {new Date(a.createdAt).toLocaleDateString("de-AT")}
                    </p>
                  </Link>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium tabular-nums text-zinc-100">€{(a.totalGross ?? 0).toFixed(2)}</span>
                    {(a.status === "draft" || a.status === "sent") && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950"
                          onClick={(e) => { e.preventDefault(); updateStatus(a.id, "accepted"); }}>✓</Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-950"
                          onClick={(e) => { e.preventDefault(); updateStatus(a.id, "rejected"); }}>✗</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

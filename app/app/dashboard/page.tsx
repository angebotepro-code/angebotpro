"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";

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
  draft: "border-zinc-700 text-zinc-400",
  sent: "border-blue-800 text-blue-400",
  accepted: "border-emerald-800 text-emerald-400",
  rejected: "border-red-800 text-red-400",
  expired: "border-zinc-700 text-zinc-500",
};

export default function DashboardPage() {
  const { t } = useI18n();
  const [angebote, setAngebote] = useState<Angebot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/angebote")
      .then((r) => r.json())
      .then((data) => setAngebote(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    sent: angebote.filter((a) => a.status === "sent").length,
    accepted: angebote.filter((a) => a.status === "accepted").length,
    rejected: angebote.filter((a) => a.status === "rejected").length,
    open: angebote.filter((a) => a.status === "draft").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-50">
            {t("dashboard.welcome")}
          </h1>
          <p className="mt-1 text-zinc-400 text-sm sm:text-base">{t("dashboard.subtitle")}</p>
        </div>
        <Link
          href="/app/angebote/neu"
          className={buttonVariants({
            className: "bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto",
          })}
        >
          + {t("sidebar.newQuote")}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              {t("dashboard.sent")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-50">{counts.sent}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              {t("dashboard.accepted")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-400">{counts.accepted}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              {t("dashboard.rejected")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-400">{counts.rejected}</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              {t("dashboard.open")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-50">{counts.open}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-50">{t("dashboard.recentQuotes")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-zinc-500">Loading...</p>
          ) : angebote.length === 0 ? (
            <p className="text-sm text-zinc-500">{t("dashboard.noQuotes")}</p>
          ) : (
            <div className="space-y-2">
              {angebote.map((a) => (
                <Link
                  key={a.id}
                  href={`/app/angebote/${a.id}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 p-4 hover:bg-zinc-800/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-200">
                        {a.title || a.number}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${statusColors[a.status] ?? "border-zinc-700 text-zinc-400"}`}
                      >
                        {a.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {a.number} · {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-zinc-100">
                    € {a.totalGross?.toFixed(2) ?? "0.00"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-50">
          {t("dashboard.welcome")}
        </h1>
        <p className="mt-1 text-zinc-400">{t("dashboard.subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              {t("dashboard.sent")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-50">0</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              {t("dashboard.accepted")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-400">0</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              {t("dashboard.rejected")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-400">0</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              {t("dashboard.open")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-zinc-50">0</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-50">
            {t("dashboard.recentQuotes")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">{t("dashboard.noQuotes")}</p>
        </CardContent>
      </Card>
    </div>
  );
}

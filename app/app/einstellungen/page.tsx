"use client";

import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EinstellungenPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-zinc-50">{t("settings.title")}</h1>
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-50">{t("settings.companyProfile")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">{t("settings.comingSoon")}</p>
        </CardContent>
      </Card>
    </div>
  );
}

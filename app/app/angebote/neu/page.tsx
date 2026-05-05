"use client";

import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NeuesAngebotPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-zinc-50">{t("newQuote.title")}</h1>
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-50">{t("newQuote.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">{t("newQuote.subtitle")}</p>
        </CardContent>
      </Card>
    </div>
  );
}

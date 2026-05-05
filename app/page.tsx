"use client";

import { useI18n } from "@/lib/i18n/context";

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-zinc-50">
      <main className="flex flex-col items-center gap-8 text-center px-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          {t("landing.title").slice(0, 7)}
          <span className="text-emerald-400">Pro</span>
        </h1>
        <p className="max-w-md text-lg text-zinc-400">
          {t("landing.subtitle")}
        </p>
        <p className="text-sm text-zinc-600">{t("landing.comingSoon")}</p>
      </main>
    </div>
  );
}

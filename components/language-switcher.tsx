"use client";

import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLang(lang === "en" ? "de" : "en")}
      className="text-xs text-zinc-500 hover:text-zinc-300"
    >
      {lang === "en" ? "DE" : "EN"}
    </Button>
  );
}

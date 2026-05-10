"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useI18n } from "@/lib/i18n/context";
import {
  MicrophoneIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  BoltIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const featuresIcons = [MicrophoneIcon, GlobeAltIcon, DocumentTextIcon, EnvelopeIcon, BoltIcon, ShieldCheckIcon];

export default function Home() {
  const { t } = useI18n();

  const featureItems = [
    { icon: featuresIcons[0], tKey: "landing.features.items.0.t", dKey: "landing.features.items.0.d" },
    { icon: featuresIcons[1], tKey: "landing.features.items.1.t", dKey: "landing.features.items.1.d" },
    { icon: featuresIcons[2], tKey: "landing.features.items.2.t", dKey: "landing.features.items.2.d" },
    { icon: featuresIcons[3], tKey: "landing.features.items.3.t", dKey: "landing.features.items.3.d" },
    { icon: featuresIcons[4], tKey: "landing.features.items.4.t", dKey: "landing.features.items.4.d" },
    { icon: featuresIcons[5], tKey: "landing.features.items.5.t", dKey: "landing.features.items.5.d" },
  ];

  const pricingPlans = [
    { nameKey: "landing.pricing.free.name", price: "€0", quotesKey: "landing.pricing.free.quotes", featuresKey: "landing.pricing.free.features" },
    { nameKey: "landing.pricing.basis.name", price: "€39", quotesKey: "landing.pricing.basis.quotes", featuresKey: "landing.pricing.basis.features", hl: true },
    { nameKey: "landing.pricing.pro.name", price: "€79", quotesKey: "landing.pricing.pro.quotes", featuresKey: "landing.pricing.pro.features" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3">
          <Link href="/" className="flex items-center gap-2 shrink-0" translate="no">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-muted"><span className="text-xs sm:text-sm font-bold text-foreground">A</span></div>
            <span className="text-base sm:text-lg font-bold tracking-tight">Werkit</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <span className="hidden xs:block">{/* LanguageSwitcher handled globally */}</span>
            <Link href="/login" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">{t("landing.nav.login")}</Link>
            <Link href="/login" className={buttonVariants({ size:"sm", className:"h-7 sm:h-8 text-[11px] sm:text-xs bg-foreground text-background hover:bg-foreground/80 shrink-0" })}>{t("landing.nav.trial")}</Link>
          </div>
        </div>
      </nav>

      <section className="relative px-4 sm:px-6 py-24 sm:py-32 lg:py-40 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/5 dark:from-white/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-3xl">
          <Badge className="mb-4 sm:mb-6 bg-muted text-foreground border-border text-[10px] sm:text-xs">{t("landing.hero.badge")}</Badge>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
            {t("landing.hero.line1")}{" "}<span className="text-foreground">{t("landing.hero.highlight")}</span><br />
            <span className="text-muted-foreground">{t("landing.hero.line2")}</span>
          </h1>
          <p className="mt-4 sm:mt-6 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed px-2">{t("landing.hero.desc")}</p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <Link href="/login" className={buttonVariants({ size:"lg", className:"h-10 sm:h-11 bg-foreground text-background hover:bg-foreground/80 text-sm px-6 sm:px-8" })}>{t("landing.hero.cta")}</Link>
            <a href="#how" className={buttonVariants({ variant:"outline", size:"lg", className:"h-10 sm:h-11 border-border text-foreground hover:text-foreground text-sm px-6 sm:px-8" })}>{t("landing.hero.how")}</a>
          </div>
          <p className="mt-4 sm:mt-6 text-xs text-muted-foreground">{t("landing.hero.subtext")}</p>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-16 sm:py-24 bg-muted/50 dark:bg-muted/10">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-xl sm:text-2xl font-bold">{t("landing.features.title")} <span className="text-foreground">{t("landing.features.titleHighlight")}</span></h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("landing.features.subtitle")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featureItems.map((f) => {
              const Icon = f.icon;
              return (
              <div key={f.tKey} className="group rounded-xl shadow-card bg-card p-6 hover:shadow-card-hover hover:bg-muted/50 transition-[border-color,background-color,box-shadow] duration-200">
                <Icon className="mb-3 size-6 text-foreground" />
                <h3 className="text-sm font-semibold text-foreground">{t(f.tKey)}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{t(f.dKey)}</p>
              </div>
            )})}
          </div>
        </div>
      </section>

      <section id="how" className="px-4 sm:px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-16">{t("landing.how.title")}</h2>
          <div className="flex flex-col sm:flex-row gap-6">
            {[0,1,2].map((i) => (
              <div key={i} className="relative flex-1">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-bold text-foreground ring-1 ring-border">{i+1}</div>
                {i < 2 && <div className="hidden sm:block absolute top-6 left-[60%] w-[calc(100%-2rem)] h-px bg-gradient-to-r from-border to-transparent" />}
                <h3 className="mt-4 font-semibold text-foreground">{t(`landing.how.steps.${i}.t`)}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{t(`landing.how.steps.${i}.d`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-16 sm:py-24 bg-muted/50 dark:bg-muted/10">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">{t("landing.pricing.title")}</h2>
          <p className="text-sm text-muted-foreground mb-12">{t("landing.pricing.subtitle")}</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {pricingPlans.map((plan) => (
              <Card key={plan.nameKey} className={`relative border-border bg-card ${plan.hl ? "ring-2 ring-foreground/20" : ""}`}>
                {plan.hl && <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] border-0">{t("landing.pricing.popular")}</Badge>}
                <CardContent className="p-6 pt-8 space-y-4 text-left">
                  <h3 className="font-semibold text-foreground">{t(plan.nameKey)}</h3>
                  <div><span className="text-2xl font-bold text-foreground">{plan.price}</span><span className="text-xs text-muted-foreground">{t("landing.pricing.month")}</span></div>
                  <p className="text-[11px] text-muted-foreground">{t(plan.quotesKey)}</p>
                  <div className="space-y-2 pt-4 border-t border-border/50">
                    {(t(plan.featuresKey) as unknown as string[]).map((f: string) => <p key={f} className="text-xs text-muted-foreground">✓ {f}</p>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-xl sm:text-2xl font-bold text-center mb-12">{t("landing.faq.title")}</h2>
          <div className="space-y-2">
            {[0,1,2,3,4,5].map((i) => (
              <FAQItem key={i} q={t(`landing.faq.items.${i}.q`)} a={t(`landing.faq.items.${i}.a`)} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 py-16 sm:py-24 bg-muted/50 dark:bg-muted/10 text-center">
        <div className="mx-auto max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold">{t("landing.cta.title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("landing.cta.subtitle")}</p>
          <Link href="/login" className={buttonVariants({ size:"lg", className:"mt-8 h-11 bg-foreground text-background hover:bg-foreground/80 text-sm px-10" })}>{t("landing.cta.button")}</Link>
        </div>
      </section>

      <footer className="border-t border-border/50 px-4 sm:px-6 py-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/impressum" className="hover:text-foreground transition-colors">{t("landing.footer.impressum")}</Link>
            <Link href="/datenschutz" className="hover:text-foreground transition-colors">{t("landing.footer.datenschutz")}</Link>
            <Link href="/agb" className="hover:text-foreground transition-colors">{t("landing.footer.agb")}</Link>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Werkit. {t("landing.footer.madeIn")}</p>
        </div>
      </footer>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [o, setO] = useState(false);
  return (
    <Collapsible open={o} onOpenChange={setO}>
      <div className="rounded-lg border border-border overflow-hidden">
        <CollapsibleTrigger className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
          {q}<span className={`text-muted-foreground transition-transform duration-200 ${o ? "rotate-45" : ""}`}>+</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
          {a}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

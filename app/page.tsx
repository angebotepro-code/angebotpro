"use client";

import { useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  MicrophoneIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  BoltIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const features = [
  { icon: MicrophoneIcon, t: "Voice to Quote", d: "Describe the job. AI writes the full Angebot in seconds." },
  { icon: GlobeAltIcon, t: "Austrian Compliant", d: "Correct MwSt, ÖNORM, Zahlungsbedingungen, Gewährleistung." },
  { icon: DocumentTextIcon, t: "Professional PDF", d: "Branded, print-ready PDF with company logo and UID." },
  { icon: EnvelopeIcon, t: "Send Instantly", d: "Email the Angebot directly to your customer." },
  { icon: BoltIcon, t: "2 Min per Quote", d: "What took 3 hours now takes under 2 minutes." },
  { icon: ShieldCheckIcon, t: "EU Hosted", d: "DSGVO-compliant. Your data stays in Frankfurt." },
];

const steps = [
  { n: "1", t: "Describe the job", d: "Speak or type — rooms, materials, measurements." },
  { n: "2", t: "AI generates", d: "Professional Angebot with all positions and legal terms." },
  { n: "3", t: "Review & send", d: "Check, tweak, send the PDF to your customer." },
];

const faqs = [
  { q: "Is the Angebot legally binding?", a: "The template includes standard Austrian legal boilerplate. Always review before sending — you are responsible for the final document." },
  { q: "Can I edit the AI output?", a: "Yes. Every position, price, and text is editable. You're always in control." },
  { q: "What trades is this for?", a: "Elektriker, Installateure, Maler, Tischler, Baugewerbe, and more. AI understands trade terminology." },
  { q: "Is my data secure?", a: "All data stored in EU data centers (Frankfurt). DSGVO-compliant. Never leaves Europe." },
  { q: "Where do the prices come from?", a: "The AI generates price estimates based on your hourly rate (set in Settings) and Austrian market rates for materials. Labor costs are calculated as estimated hours × your hourly rate. Material costs are AI estimates based on current Austrian market prices. You can adjust every price before sending." },
  { q: "Can I try for free?", a: "Yes. 3 free Angebote per month. No credit card. Upgrade when needed." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-muted"><span className="text-xs sm:text-sm font-bold text-foreground">A</span></div>
            <span className="text-base sm:text-lg font-bold tracking-tight">Angebot<span className="text-foreground">Pro</span></span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <span className="hidden xs:block"><LanguageSwitcher /></span>
            <Link href="/login" className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">Login</Link>
            <Link href="/login" className={buttonVariants({ size:"sm", className:"h-7 sm:h-8 text-[11px] sm:text-xs bg-foreground text-background hover:bg-foreground/80 shrink-0" })}>Free Trial</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-4 sm:px-4 sm:px-6 py-16 sm:py-24 sm:py-32 lg:py-40 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-black/5 dark:from-white/5 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-3xl">
          <Badge className="mb-4 sm:mb-6 bg-muted text-foreground border-border text-[10px] sm:text-xs">AI-Powered · Austrian-Made</Badge>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
            Angebote in <span className="text-foreground">2 Minuten</span><br />
            <span className="text-muted-foreground">statt 3 Stunden</span>
          </h1>
          <p className="mt-4 sm:mt-6 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed px-2">
            KI-gestützte Angebotserstellung für österreichische Handwerker. Sprich dein Angebot ein — wir schreiben den Rest. Korrekte MwSt, professionelles PDF, in Sekunden versendet.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <Link href="/login" className={buttonVariants({ size:"lg", className:"h-10 sm:h-11 bg-foreground text-background hover:bg-foreground/80 text-sm px-6 sm:px-8" })}>Kostenlos starten →</Link>
            <a href="#how" className={buttonVariants({ variant:"outline", size:"lg", className:"h-10 sm:h-11 border-border text-foreground hover:text-foreground text-sm px-6 sm:px-8" })}>Wie funktioniert&apos;s?</a>
          </div>
          <p className="mt-4 sm:mt-6 text-xs text-muted-foreground">3 Angebote gratis. Keine Kreditkarte. DSGVO-konform.</p>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 bg-muted/50 dark:bg-muted/10">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-xl sm:text-2xl font-bold">Built for Austrian <span className="text-black dark:text-white">Tradespeople</span></h2>
            <p className="mt-2 text-sm text-muted-foreground">Everything you need to create professional quotes — fast.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(f => {
              const Icon = f.icon;
              return (
              <div key={f.t} className="group rounded-xl shadow-card bg-card dark:bg-card p-6 hover:shadow-card-hover hover:bg-muted/50 dark:bg-muted/10 transition-[border-color,background-color,box-shadow] duration-200">
                <Icon className="mb-3 size-6 text-black dark:text-white" />
                <h3 className="text-sm font-semibold text-foreground">{f.t}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{f.d}</p>
              </div>
            )})}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-4 sm:px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-16">How it works</h2>
          <div className="flex flex-col sm:flex-row gap-6">
            {steps.map((s, i) => (
              <div key={s.n} className="relative flex-1">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-bold text-foreground ring-1 ring-border">{s.n}</div>
                {i < 2 && <div className="hidden sm:block absolute top-6 left-[60%] w-[calc(100%-2rem)] h-px bg-gradient-to-r from-border to-transparent" />}
                <h3 className="mt-4 font-semibold text-foreground">{s.t}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 bg-muted/50 dark:bg-muted/10">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Simple pricing</h2>
          <p className="text-sm text-muted-foreground mb-12">Start free. Upgrade when you need more.</p>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { n: "Free", p: "€0", q: "3/mo", f: ["3 Angebote","AI Generation","PDF Download","Email","Watermark"] },
              { n: "Basis", p: "€39", q: "20/mo", f: ["20 Angebote","No Watermark","PDF + Email","Dashboard","VAT Engine"], hl: true },
              { n: "Pro", p: "€79", q: "50/mo", f: ["50 Angebote","Multi-User (2)","Templates","CSV Export","Priority Support"] },
            ].map(plan => (
              <Card key={plan.n} className={`relative border-border bg-card ${plan.hl ? "ring-2 ring-foreground/20" : ""}`}>
                {plan.hl && <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] border-0">Popular</Badge>}
                <CardContent className="p-6 pt-8 space-y-4 text-left">
                  <h3 className="font-semibold text-foreground">{plan.n}</h3>
                  <div><span className="text-2xl font-bold text-foreground">{plan.p}</span><span className="text-xs text-muted-foreground">/month</span></div>
                  <p className="text-[11px] text-muted-foreground">{plan.q}</p>
                  <div className="space-y-2 pt-4 border-t border-border/50">
                    {plan.f.map(f=><p key={f} className="text-xs text-muted-foreground">✓ {f}</p>)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-12">FAQ</h2>
          <div className="space-y-2">
            {faqs.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 bg-muted/50 dark:bg-muted/10 text-center">
        <div className="mx-auto max-w-md">
          <h2 className="text-2xl font-bold">Ready to save time?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Three free Angebote. No credit card. Just faster quotes.</p>
          <Link href="/login" className={buttonVariants({ size:"lg", className:"mt-8 h-11 bg-foreground text-background hover:bg-foreground/80 text-sm px-10" })}>Start free →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-8">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/impressum" className="hover:text-muted-foreground transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-muted-foreground transition-colors">Datenschutz</Link>
            <Link href="/agb" className="hover:text-muted-foreground transition-colors">AGB</Link>
          </div>
          <p className="text-xs text-zinc-700">© {new Date().getFullYear()} AngebotPro. Made in Austria.</p>
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";

const features = [
  { emoji: "🎤", title: "Voice to Quote", desc: "Describe the job in your own words. AI writes the full Angebot in seconds — no typing, no templates, no Word." },
  { emoji: "🇦🇹", title: "Austrian Compliant", desc: "Correct MwSt (20% or 10%), ÖNORM references, Zahlungsbedingungen, and Gewährleistung — built for Austrian tradespeople." },
  { emoji: "📄", title: "Professional PDF", desc: "Branded, print-ready PDF with your company logo, address, and UID. Looks better than anything you'd make in Word." },
  { emoji: "📧", title: "Send Instantly", desc: "Email the Angebot directly to your customer. Status tracking tells you what's sent, accepted, or still open." },
  { emoji: "⚡", title: "2 Minutes per Quote", desc: "What used to take 3 hours on a Sunday evening now takes under 2 minutes. More time for actual work — or for yourself." },
  { emoji: "🔒", title: "DSGVO Compliant", desc: "EU-hosted. Austrian data residency. Your customer data never leaves Europe." },
];

const steps = [
  { step: "1", title: "Describe the job", desc: "Speak or type what needs to be done — rooms, materials, measurements." },
  { step: "2", title: "AI generates", desc: "Your professional Angebot appears in seconds with all positions, prices, and legal terms." },
  { step: "3", title: "Review & send", desc: "Check the numbers, tweak anything, then send the PDF to your customer in one click." },
];

const faqs = [
  { q: "Is the AI-generated Angebot legally binding?", a: "The Angebot template includes standard Austrian legal boilerplate (Gewährleistung, Zahlungsbedingungen, MwSt). However, you should always review the content before sending. The final responsibility lies with you — the AI is your assistant, not a replacement for professional judgment." },
  { q: "Can I edit the Angebot after the AI generates it?", a: "Yes. Every position, price, and text block is fully editable. You can add, remove, or reorder positions. You are always in control of the final document." },
  { q: "What trades is this for?", a: "Elektriker, Installateure, Maler, Tischler, Baugewerbe, and more. The AI understands trade-specific terminology and pricing for the Austrian market." },
  { q: "Does it handle the correct MwSt rate?", a: "Yes. Our MwSt engine automatically detects renovation/repair work on residential property (10%) vs. standard work (20%). You can always override it manually." },
  { q: "Is my data secure?", a: "Absolutely. All data is stored in EU data centers (Frankfurt). We are fully DSGVO-compliant. Your customer data never leaves Europe." },
  { q: "Can I try it for free?", a: "Yes! Sign up and get 3 free Angebote per month. No credit card required. Upgrade to Pro when you need more." },
];

export default function Home() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <span className="text-xl font-bold">
          {t("general.appName")}
        </span>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link href="/login" className={buttonVariants({ variant: "ghost", className: "text-zinc-300" })}>
            Login
          </Link>
          <Link href="/login" className={buttonVariants({ className: "bg-emerald-500 hover:bg-emerald-600" })}>
            Free Trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl">
          Angebote in{" "}
          <span className="text-emerald-400">2 Minuten</span>
          <br />
          statt 3 Stunden
        </h1>
        <p className="mt-6 text-lg text-zinc-400 max-w-2xl mx-auto">
          KI-gestützte Angebotserstellung für österreichische Handwerker.
          Sprich dein Angebot ein — wir schreiben den Rest. Korrekte MwSt, professionelles PDF, in Sekunden versendet.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link href="/login" className={buttonVariants({ size: "lg", className: "bg-emerald-500 hover:bg-emerald-600 text-base px-8" })}>
            Kostenlos starten
          </Link>
          <a href="#how-it-works" className="text-zinc-400 hover:text-zinc-200 text-sm self-center">
            Wie funktioniert&apos;s? ↓
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 bg-zinc-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Warum Angebot<span className="text-emerald-400">Pro</span>?
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border-zinc-800 bg-zinc-950">
                <CardContent className="pt-6 space-y-3">
                  <div className="text-2xl">{f.emoji}</div>
                  <h3 className="font-semibold text-zinc-100">{f.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">So einfach geht&apos;s</h2>
          <div className="flex flex-col sm:flex-row gap-8">
            {steps.map((s) => (
              <div key={s.step} className="flex-1 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-bold mx-auto">
                  {s.step}
                </div>
                <h3 className="font-semibold text-zinc-100">{s.title}</h3>
                <p className="text-sm text-zinc-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-24 bg-zinc-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Preise</h2>
          <p className="text-zinc-400 mb-12">Starte kostenlos. Upgrade, wenn du mehr brauchst.</p>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { name: "Kostenlos", price: "€0", quotes: "3 / Monat", features: ["3 Angebote", "AI-Generierung", "PDF-Download", "E-Mail-Versand", "Wasserzeichen"] },
              { name: "Basis", price: "€39", quotes: "20 / Monat", features: ["20 Angebote", "Kein Wasserzeichen", "PDF + E-Mail", "Dashboard", "VAT Engine"], highlight: true },
              { name: "Pro", price: "€79", quotes: "50 / Monat", features: ["50 Angebote", "Multi-User (2)", "Templates", "CSV Export", "Priority Support"] },
            ].map((plan) => (
              <Card key={plan.name} className={`border-zinc-800 bg-zinc-950 relative ${plan.highlight ? "ring-2 ring-emerald-500" : ""}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-zinc-950 text-xs font-bold px-3 py-1 rounded-full">
                    Beliebt
                  </div>
                )}
                <CardContent className="pt-8 space-y-4 text-left">
                  <h3 className="font-semibold text-zinc-100">{plan.name}</h3>
                  <div>
                    <span className="text-3xl font-bold text-zinc-50">{plan.price}</span>
                    <span className="text-sm text-zinc-500"> / Monat</span>
                  </div>
                  <p className="text-xs text-zinc-500">{plan.quotes}</p>
                  <ul className="space-y-2 pt-4 border-t border-zinc-800">
                    {plan.features.map((f) => (
                      <li key={f} className="text-sm text-zinc-400 flex items-center gap-2">
                        <span className="text-emerald-400">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-24 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Häufige Fragen</h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 bg-zinc-900 text-center">
        <h2 className="text-3xl font-bold mb-4">Bereit, Zeit zu sparen?</h2>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">
          Drei Angebote kostenlos. Keine Kreditkarte. Kein Risiko. Nur schneller zum Auftrag.
        </p>
        <Link href="/login" className={buttonVariants({ size: "lg", className: "bg-emerald-500 hover:bg-emerald-600 text-base px-8" })}>
          Jetzt kostenlos starten
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-zinc-800 text-center text-sm text-zinc-600 space-y-2">
        <div className="flex justify-center gap-6">
          <Link href="/impressum" className="hover:text-zinc-400">Impressum</Link>
          <Link href="/datenschutz" className="hover:text-zinc-400">Datenschutz</Link>
          <Link href="/agb" className="hover:text-zinc-400">AGB</Link>
        </div>
        <p>© 2026 AngebotPro. Made in Austria.</p>
      </footer>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-zinc-800 rounded-lg">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 text-left flex justify-between items-center text-zinc-200 hover:text-zinc-50"
      >
        <span className="font-medium">{question}</span>
        <span className="text-zinc-500">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="px-6 pb-4 text-sm text-zinc-400 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

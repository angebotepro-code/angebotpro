"use client";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n/context";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentTextIcon, PlusIcon, TrashIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

interface Pos { pos: number; beschreibung: string; menge: number; einheit: string; einzelpreis: number; gesamtpreis: number; }
interface Quote { id: string; number: string; title: string; totalGross: number; positions: Pos[]; subtotalNet: number; mwstRate: number; mwstTotal: number; zahlungsbedingungen: string; einleitung: string; schlussformel: string; }

export default function CreateInvoicePage() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  // Manual mode
  const [title, setTitle] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [positions, setPositions] = useState<Pos[]>([{ pos: 1, beschreibung: "", menge: 1, einheit: "pauschal", einzelpreis: 0, gesamtpreis: 0 }]);
  const [einleitung, setEinleitung] = useState("Sehr geehrte Damen und Herren,\n\nvielen Dank für Ihren Auftrag. Für die erbrachten Leistungen erlauben wir uns, folgende Rechnung zu legen:");
  const [schlussformel, setSchlussformel] = useState("Mit freundlichen Grüßen");
  const [mwstRate, setMwstRate] = useState(20);
  const [zahlung, setZahlung] = useState("30 Tage netto");
  const [skonto, setSkonto] = useState("3% Skonto bei Zahlung innerhalb von 14 Tagen, netto 30 Tage");
  // Quote mode
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);

  useEffect(() => { fetch("/api/angebote").then(r => r.json()).then(d => setQuotes((Array.isArray(d) ? d : []).filter((q: any) => q.status === "accepted"))); }, []);

  const subtotal = positions.reduce((s, p) => s + p.gesamtpreis, 0);
  const tax = Math.round(subtotal * (mwstRate / 100) * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  function updatePos(i: number, f: string, v: string | number) {
    setPositions(prev => { const p = [...prev]; (p[i] as any)[f] = v; if (f === "einzelpreis" || f === "menge") p[i].gesamtpreis = p[i].menge * p[i].einzelpreis; return p; });
  }
  function addPos() { setPositions(p => [...p, { pos: p.length + 1, beschreibung: "", menge: 1, einheit: "pauschal", einzelpreis: 0, gesamtpreis: 0 }]); }
  function delPos(i: number) { setPositions(p => p.length > 1 ? p.filter((_, j) => j !== i).map((x, idx) => ({ ...x, pos: idx + 1 })) : p); }

  async function handleCreateManual() {
    setLoading(true);
    const res = await fetch("/api/invoices", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positions, subtotalNet: subtotal, mwstRate, mwstTotal: tax, totalGross: total, einleitung, schlussformel, zahlungsbedingungen: zahlung, skonto, customerName: customerName || null }) });
    const data = await res.json();
    if (data.id) { toast.success("Invoice created"); router.push(`/app/rechnungen/${data.id}`); }
    else { toast.error("Failed to create"); }
    setLoading(false);
  }

  async function handleConvert() {
    if (!selectedQuote) return;
    setConverting(true);
    const res = await fetch(`/api/invoices/convert/${selectedQuote}`, { method: "POST" });
    const data = await res.json();
    if (data.id) { toast.success("Rechnung erstellt"); router.push(`/app/rechnungen/${data.id}`); }
    else { toast.error("Conversion failed"); }
    setConverting(false);
  }

  const selectedQuoteData = quotes.find(q => q.id === selectedQuote);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/app/rechnungen" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
          <ArrowLeftIcon className="size-3" />{t("invoices.backToInvoices")}</Link>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t("invoices.newInvoice")}</h1></div>

      <Tabs defaultValue="quote" className="w-full">
        <div className="px-3 sm:px-6 pt-4 sm:pt-5 pb-2">
          <TabsList className="bg-muted p-1 rounded-lg w-full h-auto flex">
            <TabsTrigger value="quote" className="flex-1 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground rounded-md py-3 px-3 text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
              <DocumentTextIcon className="size-5" />From Quote</TabsTrigger>
            <TabsTrigger value="manual" className="flex-1 data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground rounded-md py-3 px-3 text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
              <PlusIcon className="size-5" />Manual</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="quote" className="p-0 m-0">
          <Card className="shadow-card bg-card">
            <CardHeader><CardTitle className="text-base">Create from Accepted Quote</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {quotes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No accepted quotes found. Accept a quote first.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {quotes.map(q => (
                    <button key={q.id} onClick={() => setSelectedQuote(q.id)}
                      className={`w-full text-left rounded-lg border p-4 transition-colors ${selectedQuote === q.id ? "border-foreground bg-muted" : "border-border hover:bg-muted/50"}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-foreground">{q.number}</span>
                          <span className="text-xs text-muted-foreground ml-2">{q.title}</span>
                        </div>
                        <span className="text-sm tabular-nums text-foreground">€{q.totalGross?.toFixed(2)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <Button onClick={handleConvert} disabled={converting || !selectedQuote}
                className="w-full h-10 bg-foreground text-background hover:bg-foreground/80">
                {converting ? "Converting…" : selectedQuoteData ? `Convert ${selectedQuoteData.number} →` : "Select a quote above"}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="p-0 m-0">
          <Card className="shadow-card bg-card">
            <CardHeader><CardTitle className="text-base">Create Manually</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Title</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} className="h-9 border-border bg-muted" placeholder="e.g. Badrenovierung" /></div>
                <div className="space-y-1"><Label className="text-xs">Customer (optional)</Label>
                  <Input value={customerName} onChange={e => setCustomerName(e.target.value)} className="h-9 border-border bg-muted" placeholder="Familie Müller" /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Introduction</Label>
                <Textarea value={einleitung} onChange={e => setEinleitung(e.target.value)} rows={2} className="border-border bg-muted text-sm resize-none" /></div>

              {/* Positions */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Positionen</h4>
                  <Button size="sm" variant="ghost" className="h-6 text-[10px] text-muted-foreground hover:text-foreground" onClick={addPos}><PlusIcon className="size-3 mr-0.5" />Add</Button>
                </div>
                {positions.map((p, i) => (
                  <div key={i} className="rounded-lg border border-border p-4 space-y-2 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <Badge className="h-5 px-1.5 text-[10px] bg-muted text-muted-foreground border-0">Pos. {p.pos}</Badge>
                      {positions.length > 1 && (
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => delPos(i)}><TrashIcon className="size-3" /></Button>
                      )}
                    </div>
                    <Textarea value={p.beschreibung} onChange={e => updatePos(i, "beschreibung", e.target.value)} rows={2} className="border-border bg-muted text-sm resize-none" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div><Label className="text-[10px] text-muted-foreground">Qty</Label>
                        <Input type="number" value={p.menge} onChange={e => updatePos(i, "menge", Number(e.target.value))} className="h-8 border-border bg-muted text-sm mt-1" /></div>
                      <div><Label className="text-[10px] text-muted-foreground">Unit</Label>
                        <Input value={p.einheit} onChange={e => updatePos(i, "einheit", e.target.value)} className="h-8 border-border bg-muted text-sm mt-1" /></div>
                      <div><Label className="text-[10px] text-muted-foreground">Price (€)</Label>
                        <Input type="number" value={p.einzelpreis} onChange={e => updatePos(i, "einzelpreis", Number(e.target.value))} className="h-8 border-border bg-muted text-sm mt-1" /></div>
                      <div><Label className="text-[10px] text-muted-foreground">Total (€)</Label>
                        <Input type="number" value={p.gesamtpreis} disabled className="h-8 border-border bg-muted/50 text-muted-foreground text-sm mt-1" /></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Nettobetrag</span><span className="tabular-nums text-foreground">€{subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm items-center gap-2">
                  <span className="text-muted-foreground">MwSt</span>
                  <Select value={String(mwstRate)} onValueChange={v => setMwstRate(Number(v))}>
                    <SelectTrigger className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="20">20%</SelectItem><SelectItem value="10">10%</SelectItem><SelectItem value="0">0%</SelectItem></SelectContent>
                  </Select>
                  <span className="tabular-nums text-foreground">€{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-border"><span className="text-foreground">Gesamtbetrag</span><span className="tabular-nums text-foreground">€{total.toFixed(2)}</span></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Zahlungsbedingungen</Label>
                  <Input value={zahlung} onChange={e => setZahlung(e.target.value)} className="h-9 border-border bg-muted text-sm" /></div>
                <div className="space-y-1"><Label className="text-xs">Skonto</Label>
                  <Input value={skonto} onChange={e => setSkonto(e.target.value)} className="h-9 border-border bg-muted text-sm" /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs">Schlussformel</Label>
                <Textarea value={schlussformel} onChange={e => setSchlussformel(e.target.value)} rows={2} className="border-border bg-muted text-sm resize-none" /></div>

              <Button onClick={handleCreateManual} disabled={loading} className="w-full h-10 bg-foreground text-background hover:bg-foreground/80">
                {loading ? "Creating…" : "Create Invoice"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

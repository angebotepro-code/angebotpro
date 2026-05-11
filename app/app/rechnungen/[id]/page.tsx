"use client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/loading";
import { useI18n } from "@/lib/i18n/context";
import { EnvelopeIcon, DocumentTextIcon, TrashIcon, ArrowLeftIcon, EyeIcon, CurrencyDollarIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

interface InvoiceDetail {
  id:string; number:string; status:string; positions:{pos:number;beschreibung:string;menge:number;einheit:string;einzelpreis:number;gesamtpreis:number}[];
  subtotalNet:number; mwstRate:number; mwstTotal:number; totalGross:number;
  paidAmount?:number; paidAt?:string; paidMethod?:string;
  zahlungsbedingungen:string; skonto?:string; leistungsdatum?:string;
  einleitung:string; schlussformel:string;
  issuedAt:string; dueAt:string; createdAt:string;
  customerName?:string; customerAddress?:string; customerUid?:string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Entwurf", className: "text-muted-foreground border-border bg-muted" },
  sent: { label: "Gesendet", className: "text-blue-600 dark:text-blue-300 border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950" },
  paid: { label: "Bezahlt", className: "text-emerald-600 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950" },
  overdue: { label: "Überfällig", className: "text-red-600 dark:text-red-300 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950" },
};

export default function InvoiceDetailPage() {
  const { id } = useParams(); const router = useRouter();
  const { t } = useI18n();
  const [inv, setInv] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendEmail, setSendEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [paidAmount, setPaidAmount] = useState("");
  const [paidMethod, setPaidMethod] = useState("uberweisung");
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => { fetch(`/api/invoices/${id}`).then(r => r.json()).then(d => setInv(d)).finally(() => setLoading(false)); }, [id]);

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (!inv) return <div className="flex justify-center py-24"><p className="text-muted-foreground">Invoice not found.</p></div>;

  const sc = statusConfig[inv.status] ?? { label: inv.status, className: "text-muted-foreground" };
  const isPaid = inv.status === "paid";

  async function handleSend() { setSending(true);
    const res = await fetch(`/api/invoices/${inv!.id}/send`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({to:sendEmail}) });
    if (res.ok) { setInv({...inv!, status:"sent"}); setSendOpen(false); toast.success("Invoice sent"); }
    else { toast.error("Send failed"); }
    setSending(false); }

  async function handlePay() {
    const amount = parseFloat(paidAmount) || inv!.totalGross;
    const res = await fetch(`/api/invoices/${inv!.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ status:"paid", paidAmount: amount, paidMethod, paidAt: new Date().toISOString() }) });
    if (res.ok) { setInv({...inv!, status:"paid", paidAmount: amount, paidMethod, paidAt: new Date().toISOString() }); setPayOpen(false); toast.success("Payment recorded"); }
    else { toast.error("Failed to record payment"); } }

  async function handleDelete() { if (!confirm("Delete this invoice?")) return;
    await fetch(`/api/invoices/${inv!.id}`, { method:"DELETE" }); toast.success("Invoice deleted"); router.push("/app/rechnungen"); }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <Link href="/app/rechnungen" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeftIcon className="size-3" />Back to Invoices
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">{inv.number}</h1>
            <Badge className={sc.className}>{sc.label}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Ausgestellt: {new Date(inv.issuedAt).toLocaleDateString("de-AT")} · Fällig: {new Date(inv.dueAt).toLocaleDateString("de-AT")}
            {inv.status === "paid" && inv.paidAt ? ` · Bezahlt: ${new Date(inv.issuedAt).toLocaleDateString("de-AT")}` : ""}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {inv.customerName}{inv.customerAddress ? ` · ${inv.customerAddress}` : ""}
            {inv.leistungsdatum ? ` · Leistung: ${inv.leistungsdatum}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isPaid && (
            <Button size="sm" onClick={() => setPayOpen(true)} className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-1">
              <CurrencyDollarIcon className="size-3.5" />{t("settings.invoices.payButton")}</Button>
          )}
          {!isPaid && (
            <Dialog open={sendOpen} onOpenChange={setSendOpen}>
              <Button size="sm" onClick={() => setSendOpen(true)} className="h-8 bg-foreground text-background hover:bg-foreground/80 text-xs flex items-center gap-1">
                <EnvelopeIcon className="size-3.5" />Send</Button>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle className="text-foreground">Invoice senden</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input type="email" placeholder="customer@example.com" value={sendEmail} onChange={e => setSendEmail(e.target.value)} className="border-border bg-muted text-foreground" />
                  <Button onClick={handleSend} disabled={sending || !sendEmail.includes("@")} className="w-full h-9 bg-foreground text-background hover:bg-foreground/80 text-sm">Send</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {/* More dropdown */}
          <div className="relative">
            <Button size="sm" variant="ghost" onClick={() => setMoreOpen(!moreOpen)}
              className="h-8 text-xs text-muted-foreground hover:text-foreground">
              <EllipsisHorizontalIcon className="size-4" />More</Button>
            {moreOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-lg border border-border bg-card shadow-lg py-1">
                  <a href={`/api/invoices/${inv!.id}/pdf`} className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted" onClick={() => setMoreOpen(false)}>
                    <DocumentTextIcon className="size-4" />PDF</a>
                  <div className="h-px bg-border mx-2 my-1" />
                  <button onClick={() => { handleDelete(); setMoreOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-muted text-left">
                    <TrashIcon className="size-4" />Delete</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pay dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="text-foreground">Zahlung erfassen</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div><Label className="text-xs">Betrag (€)</Label>
              <Input type="number" value={paidAmount || inv.totalGross.toString()} onChange={e => setPaidAmount(e.target.value)} className="border-border bg-muted text-foreground h-9" /></div>
            <div><Label className="text-xs">Zahlungsmethode</Label>
              <select value={paidMethod} onChange={e => setPaidMethod(e.target.value)} className="w-full h-9 rounded-md border border-border bg-muted text-foreground px-2 text-sm">
                <option value="uberweisung">SEPA Überweisung</option><option value="bar">Bar</option><option value="lastschrift">SEPA Lastschrift</option><option value="sonstiges">Sonstiges</option>
              </select></div>
            <Button onClick={handlePay} className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-sm">Zahlung erfassen</Button>
          </div>
        </DialogContent>
      </Dialog>

      {isPaid && inv.paidMethod && (
        <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 px-4 py-2 text-xs text-emerald-600 dark:text-emerald-400">
          ✓ Bezahlt — €{inv.paidAmount?.toFixed(2)} per {inv.paidMethod === "bar" ? "Bar" : inv.paidMethod === "uberweisung" ? "SEPA Überweisung" : inv.paidMethod}
        </div>
      )}

      <Card className="shadow-card bg-card">
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-1"><Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Einleitung</Label>
            <Input value={inv.einleitung} onChange={() => {}} className="h-8 border-border bg-muted text-sm text-foreground" /></div>

          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Positionen</h4>
            {inv.positions?.map((p, i) => (
              <div key={p.pos} className="rounded-lg shadow-card bg-card p-4 space-y-2">
                <div className="flex items-center justify-between"><Badge className="h-5 px-1.5 text-[10px] bg-muted text-muted-foreground border-0">Pos. {p.pos}</Badge></div>
                <p className="text-sm text-foreground">{p.beschreibung}</p>
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div><Label className="text-[10px] text-muted-foreground">Menge</Label><p className="text-foreground mt-1">{p.menge}</p></div>
                  <div><Label className="text-[10px] text-muted-foreground">Einheit</Label><p className="text-foreground mt-1">{p.einheit}</p></div>
                  <div><Label className="text-[10px] text-muted-foreground">Einzelpreis</Label><p className="text-foreground mt-1 tabular-nums">€{p.einzelpreis.toFixed(2)}</p></div>
                  <div><Label className="text-[10px] text-muted-foreground">Gesamt</Label><p className="text-foreground mt-1 tabular-nums">€{p.gesamtpreis.toFixed(2)}</p></div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-muted p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Nettobetrag</span><span className="text-foreground tabular-nums">€{inv.subtotalNet.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">+ {inv.mwstRate}% Umsatzsteuer</span><span className="text-foreground tabular-nums">€{inv.mwstTotal.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-border"><span className="text-foreground">Gesamtbetrag</span><span className="text-foreground tabular-nums">€{inv.totalGross.toFixed(2)}</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><Label className="text-[10px] text-muted-foreground">Zahlungsbedingungen</Label><p className="text-foreground mt-1">{inv.zahlungsbedingungen}</p></div>
            {inv.skonto && <div><Label className="text-[10px] text-muted-foreground">Skonto</Label><p className="text-foreground mt-1">{inv.skonto}</p></div>}
          </div>

          <p className="text-[11px] text-muted-foreground text-center">{isPaid ? "Invoice paid." : inv.status === "draft" ? "Draft — review before sending." : "Payment pending."}</p>

          <div className="space-y-1"><Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Schlussformel</Label>
            <p className="text-sm text-foreground">{inv.schlussformel}</p></div>
        </CardContent>
      </Card>
    </div>
  );
}

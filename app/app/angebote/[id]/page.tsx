"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/loading";
import {
  EnvelopeIcon,
  DocumentTextIcon,
  TrashIcon,
  CheckIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

interface AngebotDetail {
  id:string;number:string;title:string;status:string;einleitung:string;
  positions:{pos:number;beschreibung:string;menge:number;einheit:string;einzelpreis:number;gesamtpreis:number}[];
  subtotalNet:number;mwstRate:number;mwstTotal:number;totalGross:number;
  zahlungsbedingungen:string;gewaehrleistung:string;schlussformel:string;createdAt:string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "text-zinc-400 border-zinc-700 bg-zinc-800" },
  sent: { label: "Sent", className: "text-blue-300 border-blue-800 bg-blue-950" },
  accepted: { label: "Accepted", className: "text-emerald-300 border-emerald-800 bg-emerald-950" },
  rejected: { label: "Rejected", className: "text-red-300 border-red-800 bg-red-950" },
};

export default function AngebotDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [a, setA] = useState<AngebotDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [sendEmail, setSendEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetch(`/api/angebote/${id}`).then(r => r.json()).then(d => setA(d)).finally(() => setLoading(false)); }, [id]);

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (!a) return <div className="flex justify-center py-24"><p className="text-zinc-500">Quote not found.</p></div>;

  // --- Edit helpers ---
  function updateField(field: string, value: string | number) {
    setA((prev) => prev ? { ...prev, [field]: value } : null);
    setSavedAt(null);
  }

  function updatePosition(i: number, f: string, v: string | number) {
    setA((prev) => {
      if (!prev) return null;
      const p = [...prev.positions]; (p[i] as any)[f] = v;
      if (f === "einzelpreis" || f === "menge") p[i].gesamtpreis = p[i].menge * p[i].einzelpreis;
      const sub = p.reduce((s, x) => s + x.gesamtpreis, 0);
      const tax = Math.round(sub * ((prev.mwstRate ?? 20) / 100) * 100) / 100;
      return { ...prev, positions: p, subtotalNet: sub, mwstTotal: tax, totalGross: Math.round((sub + tax) * 100) / 100, [f]: v };
    });
    setSavedAt(null);
  }

  function addPosition() {
    setA((prev) => {
      if (!prev) return null;
      const newPos = { pos: (prev.positions?.length ?? 0) + 1, beschreibung: "", menge: 1, einheit: "pauschal", einzelpreis: 0, gesamtpreis: 0 };
      return { ...prev, positions: [...(prev.positions ?? []), newPos] };
    });
    setSavedAt(null);
  }

  function deletePosition(i: number) {
    setA((prev) => {
      if (!prev) return null;
      const p = prev.positions.filter((_, j) => j !== i).map((x, idx) => ({ ...x, pos: idx + 1 }));
      const sub = p.reduce((s, x) => s + x.gesamtpreis, 0);
      const tax = Math.round(sub * ((prev.mwstRate ?? 20) / 100) * 100) / 100;
      return { ...prev, positions: p, subtotalNet: sub, mwstTotal: tax, totalGross: Math.round((sub + tax) * 100) / 100 };
    });
    setSavedAt(null);
  }

  // --- Save ---
  async function handleSave() {
    if (!a) return; setSaving(true);
    await fetch(`/api/angebote/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: a.title,
        einleitung: a.einleitung,
        schlussformel: a.schlussformel,
        zahlungsbedingungen: a.zahlungsbedingungen,
        gewaehrleistung: a.gewaehrleistung,
        mwstRate: a.mwstRate,
        positions: a.positions,
        subtotalNet: a.subtotalNet,
        mwstTotal: a.mwstTotal,
        totalGross: a.totalGross
      }) });
    setSavedAt(new Date());
    setSaving(false);
  }

  // --- Send ---
  async function handleSend() { setSending(true); setSendError(null);
    try { const res = await fetch(`/api/angebote/${a!.id}/send`, { method:"POST", headers:{"Content-Type":"application/json"}, credentials:"include", body:JSON.stringify({to:sendEmail}) });
      const data = await res.json();
      if (res.ok) { setSent(true); setA({...a!, status:"sent"}); setDialogOpen(false); }
      else setSendError(data.error||"Send failed");
    } catch { setSendError("Network error."); }
    setSending(false); }

  async function handleDelete() { if (!confirm("Delete this quote permanently?")) return; setDeleting(true);
    await fetch(`/api/angebote/${a!.id}`, { method:"DELETE" }); router.push("/app/dashboard"); }

  const sc = statusConfig[a.status] ?? { label: a.status, className: "text-zinc-400" };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <Input value={a.title} onChange={(e) => updateField("title", e.target.value)}
              className="h-8 border-zinc-800 bg-zinc-800/50 text-xl font-bold text-zinc-50 w-auto min-w-[200px]" />
            <Badge className={sc.className}>{sc.label}</Badge>
          </div>
          <p className="mt-1 text-xs text-zinc-600">{a.number} · {new Date(a.createdAt).toLocaleDateString("de-AT")}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={handleSave} disabled={saving}
            className="h-8 bg-emerald-500 hover:bg-emerald-600 text-xs">
            {saving ? "..." : savedAt ? "✓ Saved" : "Save"}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Button className="h-8 bg-emerald-500 hover:bg-emerald-600 text-xs flex items-center gap-1" disabled={sent} onClick={() => setDialogOpen(true)}>
              {sent ? <><CheckIcon className="size-3.5" />Sent</> : <><EnvelopeIcon className="size-3.5" />Send</>}
            </Button>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader><DialogTitle className="text-zinc-50">Send via Email</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <Input type="email" placeholder="customer@example.com" value={sendEmail} onChange={e => setSendEmail(e.target.value)}
                  className="border-zinc-800 bg-zinc-800/50 text-zinc-100" />
                {sendError && <p className="text-xs text-red-400">{sendError}</p>}
                <Button onClick={handleSend} disabled={sending || !sendEmail.includes("@")}
                  className="w-full h-9 bg-emerald-500 hover:bg-emerald-600 text-sm">Send</Button>
              </div>
            </DialogContent>
          </Dialog>
          <a href={`/api/angebote/${a.id}/pdf`} target="_blank" className={buttonVariants({ size:"sm", className:"h-8 bg-zinc-800 hover:bg-zinc-700 text-xs flex items-center gap-1" })}>
            <DocumentTextIcon className="size-3.5" />PDF</a>
          <Button size="sm" variant="ghost" onClick={handleDelete} disabled={deleting} className="h-8 text-zinc-600 hover:text-red-400">
            <TrashIcon className="size-4" /></Button>
        </div>
      </div>

      {/* Content */}
      {savedAt && (
        <div className="rounded-lg border border-emerald-800/30 bg-emerald-950/10 px-4 py-2 text-xs text-emerald-400 flex items-center justify-between">
          <span>Saved at {savedAt.toLocaleTimeString("de-AT")}</span>
          <button onClick={() => setSavedAt(null)} className="text-zinc-500 hover:text-zinc-300">✕</button>
        </div>
      )}

      <Card className="shadow-card transition-[box-shadow] duration-150 bg-zinc-900/50">
        <CardContent className="pt-6 space-y-6">
          {/* Einleitung */}
          <div className="space-y-1">
            <Label className="text-[10px] text-zinc-500 uppercase tracking-wider">Introduction</Label>
            <Textarea value={a.einleitung} onChange={(e) => updateField("einleitung", e.target.value)}
              rows={3} className="border-zinc-800 bg-zinc-800/50 text-sm text-zinc-200 resize-none" />
          </div>

          {/* Positions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Positions</h4>
              <Button size="sm" variant="ghost" className="h-6 text-[10px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                onClick={addPosition}>
                <PlusIcon className="size-3" />Add position
              </Button>
            </div>
            {a.positions?.map((p, i) => (
              <div key={p.pos} className="rounded-lg shadow-card transition-[box-shadow] duration-150 bg-zinc-900/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="h-5 px-1.5 text-[10px] bg-zinc-800 text-zinc-400 border-0">Pos. {p.pos}</Badge>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-zinc-600 hover:text-red-400" onClick={() => deletePosition(i)}>
                    <TrashIcon className="size-3" />
                  </Button>
                </div>
                <Textarea value={p.beschreibung} onChange={(e) => updatePosition(i, "beschreibung", e.target.value)}
                  rows={2} className="border-zinc-800 bg-zinc-800/50 text-sm text-zinc-200 resize-none" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div><Label className="text-[10px] text-zinc-500">Qty</Label>
                    <Input type="number" value={p.menge} onChange={(e) => updatePosition(i, "menge", Number(e.target.value))}
                      className="h-8 border-zinc-800 bg-zinc-800/50 text-sm mt-1" /></div>
                  <div><Label className="text-[10px] text-zinc-500">Unit</Label>
                    <Input value={p.einheit} onChange={(e) => updatePosition(i, "einheit", e.target.value)}
                      className="h-8 border-zinc-800 bg-zinc-800/50 text-sm mt-1" /></div>
                  <div><Label className="text-[10px] text-zinc-500">Price (€)</Label>
                    <Input type="number" value={p.einzelpreis} onChange={(e) => updatePosition(i, "einzelpreis", Number(e.target.value))}
                      className="h-8 border-zinc-800 bg-zinc-800/50 text-sm mt-1" /></div>
                  <div><Label className="text-[10px] text-zinc-500">Total (€)</Label>
                    <Input type="number" value={p.gesamtpreis} disabled
                      className="h-8 border-zinc-800 bg-zinc-900 text-zinc-500 text-sm mt-1" /></div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="rounded-lg border border-emerald-800/30 bg-emerald-950/10 p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-zinc-400">Subtotal (net)</span><span className="text-zinc-200 tabular-nums">€{a.subtotalNet?.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm items-center gap-2">
              <span className="text-zinc-400">VAT rate</span>
              <select value={a.mwstRate ?? 20} onChange={(e) => {
                const rate = Number(e.target.value);
                const sub = a.subtotalNet ?? 0;
                const tax = Math.round(sub * (rate / 100) * 100) / 100;
                setA({ ...a, mwstRate: rate, mwstTotal: tax, totalGross: Math.round((sub + tax) * 100) / 100 });
                setSavedAt(null);
              }} className="h-8 rounded-md border border-zinc-800 bg-zinc-800/50 text-sm text-zinc-200 px-2">
                <option value={20}>20%</option><option value={10}>10%</option><option value={0}>0%</option>
              </select>
              <span className="text-zinc-200 tabular-nums">€{a.mwstTotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-zinc-800"><span className="text-zinc-100">Total</span><span className="text-emerald-400 tabular-nums">€{a.totalGross?.toFixed(2)}</span></div>
          </div>

          {/* Legal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-zinc-500">Payment Terms</Label>
              <Input value={a.zahlungsbedingungen} onChange={(e) => updateField("zahlungsbedingungen", e.target.value)}
                className="h-8 border-zinc-800 bg-zinc-800/50 text-xs text-zinc-200" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-zinc-500">Warranty</Label>
              <Input value={a.gewaehrleistung} onChange={(e) => updateField("gewaehrleistung", e.target.value)}
                className="h-8 border-zinc-800 bg-zinc-800/50 text-xs text-zinc-200" />
            </div>
          </div>

          {/* AI disclaimer */}
          <p className="text-[11px] text-zinc-600 text-center">Review all fields. Save before leaving.</p>

          {/* Schlussformel */}
          <div className="space-y-1">
            <Label className="text-[10px] text-zinc-500 uppercase tracking-wider">Closing</Label>
            <Textarea value={a.schlussformel} onChange={(e) => updateField("schlussformel", e.target.value)}
              rows={3} className="border-zinc-800 bg-zinc-800/50 text-sm text-zinc-200 resize-none" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

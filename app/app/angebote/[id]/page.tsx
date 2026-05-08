"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/loading";

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
  const [sendEmail, setSendEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetch(`/api/angebote/${id}`).then(r => r.json()).then(d => setA(d)).finally(() => setLoading(false)); }, [id]);

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (!a) return <div className="flex justify-center py-24"><p className="text-zinc-500">Quote not found.</p></div>;

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
            <h1 className="text-xl font-bold text-zinc-50">{a.title || a.number}</h1>
            <Badge className={sc.className}>{sc.label}</Badge>
          </div>
          <p className="mt-1 text-xs text-zinc-600">{a.number} · {new Date(a.createdAt).toLocaleDateString("de-AT")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Button className="h-8 bg-emerald-500 hover:bg-emerald-600 text-xs" disabled={sent} onClick={() => setDialogOpen(true)}>
              {sent ? "✓ Sent" : "📧 Send"}
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
          <a href={`/api/angebote/${a.id}/pdf`} target="_blank" className={buttonVariants({ size:"sm", className:"h-8 bg-zinc-800 hover:bg-zinc-700 text-xs" })}>📄 PDF</a>
          <Button size="sm" variant="ghost" onClick={handleDelete} disabled={deleting} className="h-8 text-zinc-600 hover:text-red-400">🗑</Button>
        </div>
      </div>

      {/* Content */}
      <Card className="shadow-card transition-[box-shadow] duration-150 bg-zinc-900/50">
        <CardContent className="pt-6 space-y-6">
          <p className="text-sm leading-relaxed text-zinc-300">{a.einleitung}</p>

          <div className="space-y-2">
            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Positions</h4>
            {a.positions?.map(p => (
              <div key={p.pos} className="rounded-lg shadow-card transition-[box-shadow] duration-150 bg-zinc-900/30 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="h-5 px-1.5 text-[10px] bg-zinc-800 text-zinc-400 border-0">Pos.{p.pos}</Badge>
                      <span className="text-[11px] text-zinc-600">{p.menge} {p.einheit}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-200">{p.beschreibung}</p>
                  </div>
                  <p className="text-sm font-medium tabular-nums text-zinc-100">€{p.gesamtpreis.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-emerald-800/30 bg-emerald-950/10 p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-zinc-400">Subtotal (net)</span><span className="text-zinc-200 tabular-nums">€{a.subtotalNet?.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-zinc-400">+ {a.mwstRate}% VAT</span><span className="text-zinc-200 tabular-nums">€{a.mwstTotal?.toFixed(2)}</span></div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-zinc-800"><span className="text-zinc-100">Total</span><span className="text-emerald-400 tabular-nums">€{a.totalGross?.toFixed(2)}</span></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-500">
            <div className="rounded-lg shadow-card transition-[box-shadow] duration-150 px-3 py-2"><span className="text-zinc-400">Payment: </span>{a.zahlungsbedingungen}</div>
            <div className="rounded-lg shadow-card transition-[box-shadow] duration-150 px-3 py-2"><span className="text-zinc-400">Warranty: </span>{a.gewaehrleistung}</div>
          </div>

          <p className="text-[11px] text-center text-zinc-600">AI-generated draft — please review before sending.</p>
          <p className="text-sm leading-relaxed text-zinc-300 border-t border-zinc-800/50 pt-4">{a.schlussformel}</p>
        </CardContent>
      </Card>
    </div>
  );
}

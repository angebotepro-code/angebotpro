"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
import {
  EnvelopeIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  CheckIcon,
  PlusIcon,
  ArrowLeftIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AngebotDetail {
  id:string;number:string;title:string;status:string;einleitung:string;
  positions:{pos:number;beschreibung:string;menge:number;einheit:string;einzelpreis:number;gesamtpreis:number}[];
  subtotalNet:number;mwstRate:number;mwstTotal:number;totalGross:number;
  zahlungsbedingungen:string;gewaehrleistung:string;schlussformel:string;createdAt:string;
  acceptedByName?:string;acceptedAt?:string;
  revisions?: { timestamp: string; editor: string; snapshot: any }[];
}

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "text-muted-foreground border-border bg-muted" },
  sent: { label: "Sent", className: "text-blue-600 dark:text-blue-300 border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950" },
  accepted: { label: "Accepted", className: "text-emerald-600 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950" },
  rejected: { label: "Rejected", className: "text-red-600 dark:text-red-300 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950" },
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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const changedRef = useRef(false);
  const aRef = useRef(a);

  useEffect(() => { aRef.current = a; }, [a]);

  useEffect(() => { fetch(`/api/angebote/${id}`).then(r => r.json()).then(d => setA(d)).finally(() => setLoading(false)); }, [id]);

  // Autosave for drafts
  useEffect(() => {
    if (!a || a.status !== "draft" || !changedRef.current) return;
    const t = setTimeout(async () => {
      changedRef.current = false;
      await fetch(`/api/angebote/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: a.title, einleitung: a.einleitung, schlussformel: a.schlussformel,
          zahlungsbedingungen: a.zahlungsbedingungen, gewaehrleistung: a.gewaehrleistung,
          mwstRate: a.mwstRate, positions: a.positions,
          subtotalNet: a.subtotalNet, mwstTotal: a.mwstTotal, totalGross: a.totalGross
        }) });
      setSavedAt(new Date());
    }, 1500);
    return () => clearTimeout(t);
  }, [a]);

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (!a) return <div className="flex justify-center py-24"><p className="text-muted-foreground">Quote not found.</p></div>;

  const editable = a.status === "draft" || a.status === "rejected";

  function mutate() { changedRef.current = true; setSavedAt(null); }

  function updateField(field: string, value: string | number) {
    setA((prev) => prev ? { ...prev, [field]: value } : null); mutate();
  }

  function updatePosition(i: number, f: string, v: string | number) {
    setA((prev) => {
      if (!prev) return null;
      const p = [...prev.positions]; (p[i] as any)[f] = v;
      if (f === "einzelpreis" || f === "menge") p[i].gesamtpreis = p[i].menge * p[i].einzelpreis;
      const sub = p.reduce((s, x) => s + x.gesamtpreis, 0);
      const tax = Math.round(sub * ((prev.mwstRate ?? 20) / 100) * 100) / 100;
      return { ...prev, positions: p, subtotalNet: sub, mwstTotal: tax, totalGross: Math.round((sub + tax) * 100) / 100 };
    }); mutate();
  }

  function addPosition() {
    setA((prev) => {
      if (!prev) return null;
      const np = { pos: (prev.positions?.length ?? 0) + 1, beschreibung: "", menge: 1, einheit: "pauschal", einzelpreis: 0, gesamtpreis: 0 };
      return { ...prev, positions: [...(prev.positions ?? []), np] };
    }); mutate();
  }

  function deletePosition(i: number) {
    setA((prev) => {
      if (!prev) return null;
      const p = prev.positions.filter((_, j) => j !== i).map((x, idx) => ({ ...x, pos: idx + 1 }));
      const sub = p.reduce((s, x) => s + x.gesamtpreis, 0);
      const tax = Math.round(sub * ((prev.mwstRate ?? 20) / 100) * 100) / 100;
      return { ...prev, positions: p, subtotalNet: sub, mwstTotal: tax, totalGross: Math.round((sub + tax) * 100) / 100 };
    }); mutate();
  }

  async function handleSave() {
    if (!a) return; setSaving(true);
    await fetch(`/api/angebote/${a.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: a.title, einleitung: a.einleitung, schlussformel: a.schlussformel,
        zahlungsbedingungen: a.zahlungsbedingungen, gewaehrleistung: a.gewaehrleistung,
        mwstRate: a.mwstRate, positions: a.positions,
        subtotalNet: a.subtotalNet, mwstTotal: a.mwstTotal, totalGross: a.totalGross
      }) });
    changedRef.current = false;
    setSavedAt(new Date()); setSaving(false);
  }

  async function handleSend() { setSending(true); setSendError(null);
    try { const res = await fetch(`/api/angebote/${a!.id}/send`, { method:"POST", headers:{"Content-Type":"application/json"}, credentials:"include", body:JSON.stringify({to:sendEmail}) });
      const data = await res.json();
      if (res.ok) { setSent(true); setA({...a!, status:"sent"}); setDialogOpen(false); }
      else setSendError(data.error||"Send failed");
    } catch { setSendError("Network error."); }
    setSending(false); }

  async function handleSendAcknowledgment() { setSending(true);
    try { await fetch(`/api/angebote/${a!.id}/send`, { method:"POST", headers:{"Content-Type":"application/json"}, credentials:"include", body:JSON.stringify({to:sendEmail, acknowledgment:true}) }); }
    catch {};
    setSending(false); setDialogOpen(false); }

  async function handleDelete() { setDeleting(true);
    await fetch(`/api/angebote/${a!.id}`, { method:"DELETE" }); router.push("/app/dashboard"); }

  async function handleDuplicate() { setDuplicating(true);
    const res = await fetch("/api/angebote/generate", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({input_text:`Duplicate of ${a!.number}`, trade:""}) });
    const data = await res.json();
    if (data.id) { await fetch(`/api/angebote/${data.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ title: `${a!.title} (Copy)`, einleitung: a!.einleitung, positions: a!.positions, subtotalNet: a!.subtotalNet, mwstRate: a!.mwstRate, mwstTotal: a!.mwstTotal, totalGross: a!.totalGross, zahlungsbedingungen: a!.zahlungsbedingungen, gewaehrleistung: a!.gewaehrleistung, schlussformel: a!.schlussformel }) });
      router.push(`/app/angebote/${data.id}`); }
    setDuplicating(false); }

  const sc = statusConfig[a.status] ?? { label: a.status, className: "text-muted-foreground" };

  const inputClass = (ed: boolean) => `border-border bg-muted text-sm ${ed ? "text-foreground" : "text-muted-foreground"} resize-none ${!ed ? "pointer-events-none opacity-70" : ""}`;
  const fieldClass = (ed: boolean) => `border-border bg-muted ${ed ? "text-foreground" : "text-muted-foreground"} ${!ed ? "pointer-events-none opacity-70" : ""}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader><DialogTitle className="text-foreground">Delete Quote?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone. The quote <strong className="text-foreground">{a.number}</strong> will be permanently deleted.</p>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(false)} className="text-muted-foreground">Cancel</Button>
            <Button size="sm" onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">{deleting?"Deleting…":"Delete"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restore confirmation dialog */}
      <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader><DialogTitle className="text-foreground">Restore Version?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will replace the current content with the selected revision. Any unsaved changes will be lost.</p>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={() => { setRestoreOpen(false); setRestoreTarget(null); }} className="text-muted-foreground">Cancel</Button>
            <Button size="sm" onClick={() => {
              if (!restoreTarget) return;
              setA((prev) => prev ? {
                ...prev,
                title: restoreTarget.title ?? prev.title,
                einleitung: restoreTarget.einleitung ?? prev.einleitung,
                schlussformel: restoreTarget.schlussformel ?? prev.schlussformel,
                positions: restoreTarget.positions ?? prev.positions,
                subtotalNet: restoreTarget.subtotalNet ?? prev.subtotalNet,
                mwstRate: restoreTarget.mwstRate ?? prev.mwstRate,
                mwstTotal: restoreTarget.mwstTotal ?? prev.mwstTotal,
                totalGross: restoreTarget.totalGross ?? prev.totalGross,
                zahlungsbedingungen: restoreTarget.zahlungsbedingungen ?? prev.zahlungsbedingungen,
                gewaehrleistung: restoreTarget.gewaehrleistung ?? prev.gewaehrleistung,
              } : null);
              mutate();
              setRestoreOpen(false); setRestoreTarget(null);
            }} className="bg-foreground text-background hover:bg-foreground/80">Restore</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <Link href="/app/angebote" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeftIcon className="size-3" />Back to Quotes
          </Link>
          <div className="flex items-center gap-3">
            <Input value={a.title} onChange={(e) => editable && updateField("title", e.target.value)}
              className={`h-8 border-border bg-muted text-xl font-bold ${editable ? "text-foreground" : "text-muted-foreground pointer-events-none opacity-70"} w-auto min-w-[200px]`} />
            <Badge className={sc.className}>{sc.label}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{a.number} · {new Date(a.createdAt).toLocaleDateString("de-AT")}{a.acceptedByName ? ` · Signed by ${a.acceptedByName}` : ""}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Send / Send Again / Send Acknowledgment */}
          {a.status !== "accepted" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <Button size="sm" onClick={() => setDialogOpen(true)} disabled={sent}
                className="h-8 bg-foreground text-background hover:bg-foreground/80 text-xs flex items-center gap-1">
                {sent ? <><CheckIcon className="size-3.5" />Sent</> : a.status === "sent" || a.status === "rejected" ? <><EnvelopeIcon className="size-3.5" />Send Again</> : <><EnvelopeIcon className="size-3.5" />Send</>}
              </Button>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle className="text-foreground">Send via Email</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input type="email" placeholder="customer@example.com" value={sendEmail} onChange={e => setSendEmail(e.target.value)}
                    className="border-border bg-muted text-foreground" />
                  {sendError && <p className="text-xs text-destructive">{sendError}</p>}
                  <Button onClick={handleSend} disabled={sending || !sendEmail.includes("@")}
                    className="w-full h-9 bg-foreground text-background hover:bg-foreground/80 text-sm">Send</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {/* Send Acknowledgment (Accepted) */}
          {a.status === "accepted" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <Button size="sm" onClick={() => setDialogOpen(true)}
                className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-1">
                <PaperAirplaneIcon className="size-3.5" />Send Acknowledgment
              </Button>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle className="text-foreground">Send Acknowledgment</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input type="email" placeholder="customer@example.com" value={sendEmail} onChange={e => setSendEmail(e.target.value)}
                    className="border-border bg-muted text-foreground" />
                  <Button onClick={handleSendAcknowledgment} disabled={sending || !sendEmail.includes("@")}
                    className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white text-sm">Send</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {/* Preview */}
          <Button size="sm" variant="ghost" onClick={() => setPreviewOpen(true)}
            className="h-8 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <EyeIcon className="size-3.5" />Preview</Button>
          {/* PDF */}
          <a href={`/api/angebote/${a.id}/pdf`} className={buttonVariants({ size:"sm", variant:"ghost", className:"h-8 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1" })}>
            <DocumentTextIcon className="size-3.5" />PDF</a>
          {/* Duplicate */}
          <Button size="sm" variant="ghost" onClick={handleDuplicate} disabled={duplicating}
            className="h-8 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <DocumentDuplicateIcon className="size-3.5" />{duplicating ? "..." : "Duplicate"}</Button>
          {/* Save (only for rejected) */}
          {a.status === "rejected" && (
            <Button size="sm" onClick={handleSave} disabled={saving}
              className="h-8 bg-foreground text-background hover:bg-foreground/80 text-xs">
              {saving ? "..." : savedAt ? "✓ Saved" : "Save"}
            </Button>
          )}
          {/* Delete */}
          <Button size="sm" variant="ghost" onClick={() => setDeleteOpen(true)} disabled={deleting} className="h-8 text-muted-foreground hover:text-destructive" aria-label="Delete quote">
            <TrashIcon className="size-4" /></Button>
        </div>
      </div>

      {/* Autosave indicator */}
      {a.status === "draft" && savedAt && (
        <div className="rounded-lg border border-border bg-muted px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
          <span>Autosaved at {savedAt.toLocaleTimeString("de-AT")}</span>
          <button onClick={() => setSavedAt(null)} className="text-muted-foreground hover:text-foreground"><XMarkIcon className="size-3.5" /></button>
        </div>
      )}

      {/* Accepted info */}
      {a.status === "accepted" && a.acceptedByName && (
        <div className="rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 px-4 py-2 text-xs text-emerald-600 dark:text-emerald-400">
          ✓ Accepted by <strong>{a.acceptedByName}</strong> on {a.acceptedAt ? new Date(a.acceptedAt).toLocaleDateString("de-AT") : "unknown date"}
        </div>
      )}

      <Card className="shadow-card transition-[box-shadow] duration-150 bg-card">
        <CardContent className="pt-6 space-y-6">
          {/* Einleitung */}
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Introduction</Label>
            <Textarea value={a.einleitung} onChange={(e) => editable && updateField("einleitung", e.target.value)}
              rows={3} className={inputClass(editable)} />
          </div>

          {/* Positions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Positions</h4>
              {editable && (
                <Button size="sm" variant="ghost" className="h-6 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                  onClick={addPosition}><PlusIcon className="size-3" />Add position</Button>
              )}
            </div>
            {a.positions?.map((p, i) => (
              <div key={p.pos} className="rounded-lg shadow-card transition-[box-shadow] duration-150 bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="h-5 px-1.5 text-[10px] bg-muted text-muted-foreground border-0">Pos. {p.pos}</Badge>
                  {editable && (
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => deletePosition(i)} aria-label="Remove position">
                      <TrashIcon className="size-3" /></Button>
                  )}
                </div>
                <Textarea value={p.beschreibung} onChange={(e) => editable && updatePosition(i, "beschreibung", e.target.value)}
                  rows={2} className={inputClass(editable)} />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div><Label className="text-[10px] text-muted-foreground">Qty</Label>
                    <Input type="number" value={p.menge} onChange={(e) => editable && updatePosition(i, "menge", Number(e.target.value))}
                      className={`h-8 mt-1 ${fieldClass(editable)}`} /></div>
                  <div><Label className="text-[10px] text-muted-foreground">Unit</Label>
                    <Input value={p.einheit} onChange={(e) => editable && updatePosition(i, "einheit", e.target.value)}
                      className={`h-8 mt-1 ${fieldClass(editable)}`} /></div>
                  <div><Label className="text-[10px] text-muted-foreground">Price (€)</Label>
                    <Input type="number" value={p.einzelpreis} onChange={(e) => editable && updatePosition(i, "einzelpreis", Number(e.target.value))}
                      className={`h-8 mt-1 ${fieldClass(editable)}`} /></div>
                  <div><Label className="text-[10px] text-muted-foreground">Total (€)</Label>
                    <Input type="number" value={p.gesamtpreis} disabled
                      className="h-8 border-border bg-muted text-muted-foreground text-sm mt-1" /></div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-muted p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal (net)</span><span className="text-foreground tabular-nums">€{a.subtotalNet?.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm items-center gap-2">
              <span className="text-muted-foreground">VAT rate</span>
              {editable ? (
                <Select value={String(a.mwstRate ?? 20)} onValueChange={(v) => {
                  const rate = Number(v); const sub = a.subtotalNet ?? 0;
                  const tax = Math.round(sub * (rate / 100) * 100) / 100;
                  setA({ ...a, mwstRate: rate, mwstTotal: tax, totalGross: Math.round((sub + tax) * 100) / 100 }); mutate();
                }}>
                  <SelectTrigger className="h-8 w-20"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="20">20%</SelectItem><SelectItem value="10">10%</SelectItem><SelectItem value="0">0%</SelectItem></SelectContent>
                </Select>
              ) : (
                <span className="text-foreground">{a.mwstRate}%</span>
              )}
              <span className="text-foreground tabular-nums">€{a.mwstTotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-border"><span className="text-foreground">Total</span><span className="text-foreground tabular-nums">€{a.totalGross?.toFixed(2)}</span></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Payment Terms</Label>
              <Input value={a.zahlungsbedingungen} onChange={(e) => editable && updateField("zahlungsbedingungen", e.target.value)}
                className={`h-8 text-xs ${fieldClass(editable)}`} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Warranty</Label>
              <Input value={a.gewaehrleistung} onChange={(e) => editable && updateField("gewaehrleistung", e.target.value)}
                className={`h-8 text-xs ${fieldClass(editable)}`} />
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground text-center">
            {a.status === "draft" ? "Autosave enabled — changes are saved automatically." :
             a.status === "accepted" ? "This quote has been accepted and is locked." :
             "Review all fields. Save before leaving."}
          </p>

          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Closing</Label>
            <Textarea value={a.schlussformel} onChange={(e) => editable && updateField("schlussformel", e.target.value)}
              rows={3} className={inputClass(editable)} />
          </div>
        </CardContent>
      </Card>

      {/* Revision History */}
      {a.revisions && a.revisions.length > 0 && (
        <Card className="shadow-card bg-card">
          <CardHeader><CardTitle className="text-base text-foreground">Revision History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...a.revisions].reverse().map((rev, i) => {
                const prev = i < a.revisions!.length - 1
                  ? [...a.revisions!].reverse()[i + 1]?.snapshot
                  : null;
                const changes: string[] = [];
                if (prev) {
                  if (rev.snapshot?.title !== prev.title) changes.push("Title changed");
                  if (rev.snapshot?.einleitung !== prev.einleitung) changes.push("Introduction edited");
                  const pLen = rev.snapshot?.positions?.length ?? 0;
                  const prevPLen = prev.positions?.length ?? 0;
                  if (pLen !== prevPLen) changes.push(`Positions: ${prevPLen} → ${pLen}`);
                  else if (JSON.stringify(rev.snapshot?.positions) !== JSON.stringify(prev.positions)) changes.push("Positions updated");
                  if (rev.snapshot?.subtotalNet !== prev.subtotalNet) changes.push("Pricing changed");
                  if (rev.snapshot?.zahlungsbedingungen !== prev.zahlungsbedingungen) changes.push("Payment terms updated");
                  if (rev.snapshot?.gewaehrleistung !== prev.gewaehrleistung) changes.push("Warranty updated");
                } else {
                  changes.push("Initial creation");
                }
                if (changes.length === 0) changes.push("Minor edits");
                return (
                <div key={i} className="flex items-start justify-between gap-4 rounded-lg border border-border p-3 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{rev.editor}</span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground">v{a.revisions!.length - i}</span>
                    </div>
                    <p className="text-muted-foreground mt-0.5">
                      {new Date(rev.timestamp).toLocaleString("de-AT")} — {changes.join(", ")}
                    </p>
                  </div>
                  {a.status === "draft" && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground hover:text-foreground shrink-0"
                      onClick={() => { setRestoreTarget(rev.snapshot); setRestoreOpen(true); }}>
                      Restore
                    </Button>
                  )}
                </div>
              )})}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="bg-card border-border max-w-4xl h-[90vh] flex flex-col p-0">
          <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-border pr-14">
            <DialogTitle className="text-foreground text-base m-0">Preview — {a.number}</DialogTitle>
            <a href={`/api/angebote/${a.id}/pdf`} download className={buttonVariants({ size:"sm", className:"h-8 bg-foreground text-background hover:bg-foreground/80 text-xs flex items-center gap-1 shrink-0" })}>
              <ArrowDownTrayIcon className="size-3.5" />Download PDF</a>
          </div>
          <div className="flex-1 min-h-0 bg-zinc-100 dark:bg-zinc-800">
            <iframe src={`/api/angebote/${a.id}/pdf?preview=true`} className="w-full h-full border-0" title="PDF Preview" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

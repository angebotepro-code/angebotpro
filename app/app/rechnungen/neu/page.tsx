"use client";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CreateInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("0");
  const [einleitung, setEinleitung] = useState("Sehr geehrte Damen und Herren,\n\nvielen Dank für Ihren Auftrag. Für die erbrachten Leistungen erlauben wir uns, folgende Rechnung zu legen:");
  const [schlussformel, setSchlussformel] = useState("Mit freundlichen Grüßen");

  async function handleCreate() {
    setLoading(true);
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        positions: [{ pos: 1, beschreibung: title || description || "Leistung", menge: 1, einheit: "pauschal", einzelpreis: Number(amount), gesamtpreis: Number(amount) }],
        subtotalNet: Number(amount), mwstRate: 20, mwstTotal: Number(amount) * 0.2, totalGross: Number(amount) * 1.2,
        einleitung, schlussformel, zahlungsbedingungen: "30 Tage netto",
      }),
    });
    const data = await res.json();
    if (data.id) { toast.success("Invoice created"); router.push(`/app/rechnungen/${data.id}`); }
    else { toast.error("Failed to create"); }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div><h1 className="text-xl sm:text-2xl font-bold text-foreground">New Invoice</h1><p className="text-sm text-muted-foreground">Create an invoice manually (without an Angebot).</p></div>

      <Card className="shadow-card bg-card">
        <CardHeader><CardTitle className="text-base">Invoice Details</CardTitle><CardDescription className="text-xs">Fill in the fields below.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label className="text-xs">Title / Description</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} className="h-9 border-border bg-muted" placeholder="e.g. Badrenovierung" /></div>
          <div className="space-y-2"><Label className="text-xs">Description (detailed)</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} className="h-9 border-border bg-muted" /></div>
          <div className="space-y-2"><Label className="text-xs">Net Amount (€)</Label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="h-9 border-border bg-muted" /></div>
          <div className="space-y-2"><Label className="text-xs">Introduction</Label>
            <Textarea value={einleitung} onChange={e => setEinleitung(e.target.value)} rows={3} className="border-border bg-muted text-sm resize-none" /></div>
          <div className="space-y-2"><Label className="text-xs">Closing</Label>
            <Textarea value={schlussformel} onChange={e => setSchlussformel(e.target.value)} rows={2} className="border-border bg-muted text-sm resize-none" /></div>
          <Button onClick={handleCreate} disabled={loading} className="w-full h-10 bg-foreground text-background hover:bg-foreground/80">
            {loading ? "Creating…" : "Create Invoice"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/loading";
import { CheckIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

interface SignData {
  id: string; number: string; title: string; status: string;
  einleitung: string; positions: any[]; subtotalNet: number;
  mwstRate: number; mwstTotal: number; totalGross: number;
  zahlungsbedingungen: string; gewaehrleistung: string; schlussformel: string;
  createdAt: string; companyName: string; companyAddress: string;
  acceptedByName: string | null; acceptedAt: string | null;
}

export default function SignPage() {
  const { id } = useParams();
  const [data, setData] = useState<SignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    fetch(`/api/sign/${id}`).then(r => r.json()).then(d => {
      if (d.error) setError(d.error);
      else setData(d);
    }).finally(() => setLoading(false));
  }, [id]);

  async function handleSign(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSigning(true);
    const res = await fetch(`/api/sign/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), email: email.trim() }),
    });
    if (res.ok) { setSigned(true); setData(d => d ? { ...d, status: "accepted", acceptedByName: name.trim(), acceptedAt: new Date().toISOString() } : null); }
    else setError("Could not sign. Please try again.");
    setSigning(false);
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><Spinner /></div>;
  if (error) return <div className="flex min-h-screen items-center justify-center bg-background"><div className="text-center max-w-md"><h1 className="text-xl font-bold text-foreground mb-2">{t("sign.notFound")}</h1><p className="text-muted-foreground">{error}</p></div></div>;
  if (!data) return null;

  const isAccepted = data.status === "accepted" || signed;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-20 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-4">
            <DocumentTextIcon className="size-6 text-foreground" />
          </div>
          <h1 className="text-2xl font-bold">{data.companyName}</h1>
          <p className="text-sm text-muted-foreground mt-1">{data.companyAddress}</p>
          <Badge className={`mt-3 ${isAccepted ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800" : "bg-muted text-muted-foreground"}`}>
            {isAccepted ? "Accepted" : "Awaiting Signature"}
          </Badge>
        </div>

        {/* Quote Summary */}
        <Card className="shadow-card bg-card">
          <CardHeader>
            <CardTitle className="text-base">Angebot {data.number}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{data.einleitung}</p>

            <div className="space-y-2">
              {data.positions?.map((p: any) => (
                <div key={p.pos} className="flex justify-between text-sm py-1.5 border-b border-border/50">
                  <span className="text-foreground">{p.beschreibung?.slice(0, 80)}{p.beschreibung?.length > 80 ? "…" : ""}</span>
                  <span className="text-muted-foreground tabular-nums">€{p.gesamtpreis?.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-muted/50 p-4 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t("detail.subtotal")}</span><span className="tabular-nums">€{data.subtotalNet?.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">+ {data.mwstRate}% VAT</span><span className="tabular-nums">€{data.mwstTotal?.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-border"><span>Total</span><span className="tabular-nums">€{data.totalGross?.toFixed(2)}</span></div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Payment:</strong> {data.zahlungsbedingungen}</p>
              <p><strong>Warranty:</strong> {data.gewaehrleistung}</p>
              <p><strong>Valid until:</strong> 30 days from {new Date(data.createdAt).toLocaleDateString("de-AT")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Signature */}
        <Card className={`shadow-card ${isAccepted ? "border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20" : "bg-card"}`}>
          <CardHeader>
            <CardTitle className="text-base">{isAccepted ? "✓ Accepted" : "Accept This Quote"}</CardTitle>
          </CardHeader>
          <CardContent>
            {isAccepted ? (
              <div className="space-y-2 text-sm">
                <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                  This quote has been accepted.
                </p>
                {data.acceptedByName && (
                  <p className="text-muted-foreground">
                    Signed by: <strong className="text-foreground">{data.acceptedByName}</strong>
                    {data.acceptedAt && <> on {new Date(data.acceptedAt).toLocaleDateString("de-AT")}</>}
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSign} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  By accepting, you agree to the terms and conditions stated in this Angebot. This constitutes a legally binding acceptance.
                </p>
                <div className="space-y-2">
                  <Label className="text-xs">{t("sign.nameLabel")}</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Max Mustermann" required
                    className="border-border bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t("sign.emailLabel")}</Label>
                  <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="max@example.com"
                    className="border-border bg-muted" />
                </div>
                <Button type="submit" disabled={signing || !name.trim()}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium">
                  {signing ? "Accepting…" : <><CheckIcon className="size-4 mr-2" />Accept & Sign</>}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Powered by AngebotPro — KI-gestützte Angebotserstellung
        </p>
      </div>
    </div>
  );
}

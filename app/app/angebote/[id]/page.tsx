"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AngebotDetail {
  id: string;
  number: string;
  title: string;
  status: string;
  einleitung: string;
  positions: { pos: number; beschreibung: string; menge: number; einheit: string; einzelpreis: number; gesamtpreis: number }[];
  subtotalNet: number;
  mwstRate: number;
  mwstTotal: number;
  totalGross: number;
  zahlungsbedingungen: string;
  gewaehrleistung: string;
  schlussformel: string;
  createdAt: string;
}

export default function AngebotDetailPage() {
  const params = useParams();
  const [angebot, setAngebot] = useState<AngebotDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/angebote/${params.id}`)
      .then((r) => r.json())
      .then((data) => setAngebot(data))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <p className="text-zinc-400">Loading...</p>;
  }

  if (!angebot) {
    return <p className="text-zinc-400">Quote not found.</p>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-50">
            {angebot.title || angebot.number}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {angebot.number} · {new Date(angebot.createdAt).toLocaleDateString()}
          </p>
        </div>
        <a href={`/api/angebote/${angebot.id}/pdf`} target="_blank">
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            📄 PDF
          </Button>
        </a>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardContent className="pt-6 space-y-6">
          <p className="whitespace-pre-wrap text-sm text-zinc-300">
            {angebot.einleitung}
          </p>

          <div className="space-y-3">
            {angebot.positions?.map((pos) => (
              <div key={pos.pos} className="rounded-lg border border-zinc-800 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                        Pos. {pos.pos}
                      </Badge>
                      <span className="text-xs text-zinc-600">
                        {pos.menge} {pos.einheit}
                      </span>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-200">
                      {pos.beschreibung}
                    </p>
                  </div>
                  <p className="text-right text-sm font-medium text-zinc-100 tabular-nums">
                    € {pos.gesamtpreis.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t border-zinc-800 pt-4">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Subtotal (net)</span>
              <span>€ {angebot.subtotalNet?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-400">
              <span>+ {angebot.mwstRate}% VAT</span>
              <span>€ {angebot.mwstTotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-zinc-100 text-lg">
              <span>Total</span>
              <span>€ {angebot.totalGross?.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-zinc-800 pt-4 text-sm text-zinc-400">
            <p><strong>Payment Terms:</strong> {angebot.zahlungsbedingungen}</p>
            <p><strong>Warranty:</strong> {angebot.gewaehrleistung}</p>
          </div>

          <p className="whitespace-pre-wrap text-sm text-zinc-300">
            {angebot.schlussformel}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

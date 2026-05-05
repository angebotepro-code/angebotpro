"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Position {
  pos: number;
  beschreibung: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  gesamtpreis: number;
}

interface AngebotResponse {
  id?: string;
  number?: string;
  einleitung: string;
  positionen: Position[];
  subtotalNet: number;
  mwstRate: number;
  mwstTotal: number;
  totalGross: number;
  mwstReason?: string;
  zahlungsbedingungen: string;
  gewaehrleistung: string;
  schlussformel: string;
  error?: string;
}

export default function TestPage() {
  const [input, setInput] = useState(
    "Badrenovierung bei Familie Müller, Linzerstraße 12, 4020 Linz. Altes Bad raus, Fliesen und Estrich rausstemmen, entsorgen. Neue Fliesen 30x60 weiß glänzend, ca. 25m² Wand, 8m² Boden. Neue Duschwanne 100x100, neues WC, neuer Waschtisch mit Unterschrank. Abdichtung nach ÖNORM, inkl. aller Materialien. Geschätzte Dauer: 2 Wochen."
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AngebotResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/angebote/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_text: input, trade: "installateur" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Fehler bei der Generierung");
      } else {
        setResult(data);
      }
    } catch (e) {
      setError("Netzwerkfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-zinc-50">Angebot testen</h1>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-50">Beschreibung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={6}
            className="border-zinc-700 bg-zinc-800 text-zinc-100"
            placeholder="Beschreibe die Arbeit..."
          />
          <Button
            onClick={handleGenerate}
            disabled={loading || input.trim().length < 10}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            {loading ? "Generiere..." : "Angebot generieren"}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-800 bg-red-950">
          <CardContent className="pt-6">
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-50">
              Generiertes Angebot
              {result.number && (
                <Badge className="bg-emerald-800 text-emerald-200">
                  {result.number}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Einleitung */}
            <div>
              <p className="whitespace-pre-wrap text-sm text-zinc-300">
                {result.einleitung}
              </p>
            </div>

            {/* Positionen */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-400">Positionen</h3>
              {result.positionen.map((pos) => (
                <div
                  key={pos.pos}
                  className="rounded-lg border border-zinc-800 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">
                          Pos. {pos.pos}
                        </span>
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

            {/* Totals */}
            <div className="space-y-2 border-t border-zinc-800 pt-4">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Zwischensumme (netto)</span>
                <span>€ {result.subtotalNet.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-400">
                <span>
                  + {result.mwstRate}% MwSt
                  {result.mwstReason && (
                    <span className="ml-1 text-xs text-zinc-500">
                      ({result.mwstReason})
                    </span>
                  )}
                </span>
                <span>€ {result.mwstTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-zinc-100">
                <span>Gesamtbetrag</span>
                <span>€ {result.totalGross.toFixed(2)}</span>
              </div>
            </div>

            {/* Legal */}
            <div className="space-y-2 border-t border-zinc-800 pt-4 text-sm text-zinc-400">
              <p>
                <strong>Zahlungsbedingungen:</strong>{" "}
                {result.zahlungsbedingungen}
              </p>
              <p>
                <strong>Gewährleistung:</strong> {result.gewaehrleistung}
              </p>
            </div>

            {/* Schlussformel */}
            <div>
              <p className="whitespace-pre-wrap text-sm text-zinc-300">
                {result.schlussformel}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

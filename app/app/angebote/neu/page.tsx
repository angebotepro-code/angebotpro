"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Position {
  pos: number;
  beschreibung: string;
  menge: number;
  einheit: string;
  einzelpreis: number;
  gesamtpreis: number;
}

interface AngebotData {
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
}

export default function NeuesAngebotPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [angebot, setAngebot] = useState<AngebotData | null>(null);
  const [listening, setListening] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [interimText, setInterimText] = useState("");
  const recognitionRef = useRef<any>(null);
  const userStoppedRef = useRef(false);

  function startListening() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "de-DE";
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = inputText ? inputText + " " : "";
    userStoppedRef.current = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      setInputText(finalTranscript.trim());
      setInterimText(interim);
    };

    recognition.onerror = (e: any) => {
      if (e.error === "no-speech") return;
      if (e.error === "aborted") return;
      setListening(false);
      setInterimText("");
      recognitionRef.current = null;

      if (e.error === "not-allowed") {
        setError("Microphone access denied. Please allow microphone access in your browser settings and try again.");
      } else if (e.error === "network") {
        setError("Network error. Check your internet connection and try again.");
      } else {
        setError(`Voice error: ${e.error}. Try using Chrome if the issue persists.`);
      }
    };

    recognition.onend = () => {
      if (!userStoppedRef.current && recognitionRef.current) {
        try { recognitionRef.current.start(); } catch { /* ignore */ }
      } else {
        setListening(false);
        setInterimText("");
        recognitionRef.current = null;
      }
    };

    setListening(true);
    setInterimText("");
    recognition.start();
  }

  function stopListening() {
    userStoppedRef.current = true;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setListening(false);
    setInterimText("");
  }

  // Generate Angebot
  async function handleGenerate() {
    if (inputText.trim().length < 10) return;
    setLoading(true);
    setError(null);
    setAngebot(null);

    try {
      const res = await fetch("/api/angebote/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input_text: inputText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Generation failed");
      } else {
        setAngebot(data);
        setSavedId(data.id ?? null);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Update a position
  function updatePosition(index: number, field: string, value: string | number) {
    if (!angebot) return;
    const newPositions = [...angebot.positionen];
    (newPositions[index] as any)[field] = value;

    if (field === "einzelpreis" || field === "menge") {
      newPositions[index].gesamtpreis =
        newPositions[index].menge * newPositions[index].einzelpreis;
    }

    const subtotal = newPositions.reduce((s, p) => s + p.gesamtpreis, 0);
    const mwstTotal = Math.round(subtotal * (angebot.mwstRate / 100) * 100) / 100;
    const totalGross = Math.round((subtotal + mwstTotal) * 100) / 100;

    setAngebot({ ...angebot, positionen: newPositions, subtotalNet: subtotal, mwstTotal, totalGross });
  }

  // Save updates
  async function handleSave() {
    if (!savedId || !angebot) return;
    setSaving(true);
    try {
      await fetch(`/api/angebote/${savedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positions: angebot.positionen, subtotalNet: angebot.subtotalNet, mwstTotal: angebot.mwstTotal, totalGross: angebot.totalGross }),
      });
    } catch {
      // silently fail
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-zinc-50">{t("newQuote.title")}</h1>

      {/* Input card */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardContent className="pt-6">
          <Tabs defaultValue="text">
            <TabsList className="bg-zinc-800 mb-4">
              <TabsTrigger value="voice">🎤 Voice</TabsTrigger>
              <TabsTrigger value="text">📝 Text</TabsTrigger>
            </TabsList>

            <TabsContent value="voice" className="space-y-4">
              <div className="flex justify-center gap-4 py-8">
                {!listening ? (
                  <button
                    onClick={startListening}
                    className="w-24 h-24 rounded-full flex items-center justify-center text-3xl bg-emerald-500 hover:bg-emerald-600 transition-all"
                  >
                    🎤
                  </button>
                ) : (
                  <button
                    onClick={stopListening}
                    className="w-24 h-24 rounded-full flex items-center justify-center text-3xl bg-red-500 hover:bg-red-600 animate-pulse transition-all"
                  >
                    ⏹
                  </button>
                )}
              </div>
              {listening && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-emerald-400">
                    Recording... speak your job description in German. Press ⏹ when done.
                  </p>
                  {interimText && (
                    <p className="text-sm text-zinc-500 italic max-w-lg mx-auto">
                      {interimText}
                    </p>
                  )}
                </div>
              )}
              {inputText && !listening && (
                <div className="space-y-4">
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={4}
                    className="border-zinc-700 bg-zinc-800 text-zinc-100"
                  />
                  <Button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full bg-emerald-500 hover:bg-emerald-600"
                  >
                    {loading ? "Generating..." : "Generate Quote"}
                  </Button>
                </div>
              )}
              {!inputText && !listening && (
                <p className="text-center text-sm text-zinc-500">
                  Tap the microphone and describe the job in German.
                </p>
              )}
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={6}
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
                placeholder="Describe the job — rooms, materials, measurements, customer..."
              />
              <Button
                onClick={handleGenerate}
                disabled={loading || inputText.trim().length < 10}
                className="w-full bg-emerald-500 hover:bg-emerald-600"
              >
                {loading ? "Generating..." : "Generate Quote"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-800 bg-red-950">
          <CardContent className="pt-6">
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Angebot preview */}
      {angebot && (
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-zinc-50">Generated Quote</CardTitle>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !savedId}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Einleitung */}
            <div>
              <p className="whitespace-pre-wrap text-sm text-zinc-300">
                {angebot.einleitung}
              </p>
            </div>

            {/* Editable positions */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-400">Positions</h3>
              {angebot.positionen.map((pos, i) => (
                <div
                  key={pos.pos}
                  className="rounded-lg border border-zinc-800 p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                      Pos. {pos.pos}
                    </Badge>
                  </div>
                  <Textarea
                    value={pos.beschreibung}
                    onChange={(e) => updatePosition(i, "beschreibung", e.target.value)}
                    rows={3}
                    className="border-zinc-700 bg-zinc-800 text-zinc-200 text-sm"
                  />
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Label className="text-xs text-zinc-500">Qty</Label>
                      <Input
                        type="number"
                        value={pos.menge}
                        onChange={(e) => updatePosition(i, "menge", Number(e.target.value))}
                        className="border-zinc-700 bg-zinc-800 text-zinc-100 text-sm h-8"
                      />
                    </div>
                    <div className="w-24">
                      <Label className="text-xs text-zinc-500">Unit</Label>
                      <Input
                        value={pos.einheit}
                        onChange={(e) => updatePosition(i, "einheit", e.target.value)}
                        className="border-zinc-700 bg-zinc-800 text-zinc-100 text-sm h-8"
                      />
                    </div>
                    <div className="w-32">
                      <Label className="text-xs text-zinc-500">Price (€)</Label>
                      <Input
                        type="number"
                        value={pos.einzelpreis}
                        onChange={(e) => updatePosition(i, "einzelpreis", Number(e.target.value))}
                        className="border-zinc-700 bg-zinc-800 text-zinc-100 text-sm h-8"
                      />
                    </div>
                    <div className="w-32">
                      <Label className="text-xs text-zinc-500">Total (€)</Label>
                      <Input
                        type="number"
                        value={pos.gesamtpreis}
                        disabled
                        className="border-zinc-700 bg-zinc-800/50 text-zinc-400 text-sm h-8"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t border-zinc-800 pt-4">
              <div className="flex justify-between text-sm text-zinc-400">
                <span>Subtotal (net)</span>
                <span>€ {angebot.subtotalNet.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-400">
                <span>
                  + {angebot.mwstRate}% VAT
                  {angebot.mwstReason && (
                    <span className="ml-1 text-xs text-zinc-500">
                      ({angebot.mwstReason})
                    </span>
                  )}
                </span>
                <span>€ {angebot.mwstTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-zinc-100 text-lg">
                <span>Total</span>
                <span>€ {angebot.totalGross.toFixed(2)}</span>
              </div>
            </div>

            {/* Legal */}
            <div className="space-y-2 border-t border-zinc-800 pt-4 text-sm text-zinc-400">
              <p><strong>Payment Terms:</strong> {angebot.zahlungsbedingungen}</p>
              <p><strong>Warranty:</strong> {angebot.gewaehrleistung}</p>
            </div>

            {/* Schlussformel */}
            <div>
              <p className="whitespace-pre-wrap text-sm text-zinc-300">
                {angebot.schlussformel}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

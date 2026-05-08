"use client";

import { useState, useRef } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/loading";
import {
  MicrophoneIcon,
  StopCircleIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Position {
  pos: number; beschreibung: string; menge: number; einheit: string;
  einzelpreis: number; gesamtpreis: number;
}
interface AngebotData {
  einleitung: string; positionen: Position[]; subtotalNet: number;
  mwstRate: number; mwstTotal: number; totalGross: number; mwstReason?: string;
  zahlungsbedingungen: string; gewaehrleistung: string; schlussformel: string;
}

export default function NeuesAngebotPage() {
  const { t } = useI18n();
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [angebot, setAngebot] = useState<AngebotData | null>(null);
  const [listening, setListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const userStoppedRef = useRef(false);

  async function startListening() {
    const R = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || (window as any).mozSpeechRecognition || (window as any).msSpeechRecognition;
    if (!R) { setError("Voice not supported. Please use Chrome."); return; }
    try { const s = await navigator.mediaDevices.getUserMedia({ audio: true }); s.getTracks().forEach((t: any) => t.stop()); }
    catch { setError("Mic access denied."); return; }

    const rec = new R();
    rec.lang = "de-DE"; rec.continuous = true; rec.interimResults = true;
    let final = inputText ? inputText + " " : "";
    userStoppedRef.current = false; recognitionRef.current = rec;

    rec.onresult = (e: any) => { let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]; r.isFinal ? final += r[0].transcript + " " : interim += r[0].transcript;
      }
      setInputText(final.trim()); setInterimText(interim);
    };
    rec.onerror = (e: any) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      setListening(false); setInterimText(""); recognitionRef.current = null;
      if (e.error === "not-allowed") setError("Mic denied.");
      else setError(`Voice error: ${e.error}. Try Chrome.`);
    };
    rec.onend = () => {
      if (!userStoppedRef.current && recognitionRef.current) { try { recognitionRef.current.start(); } catch {} }
      else { setListening(false); setInterimText(""); recognitionRef.current = null; }
    };
    setListening(true); setInterimText(""); rec.start();
  }

  function stopListening() {
    userStoppedRef.current = true;
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    setListening(false); setInterimText("");
  }

  async function handleGenerate() {
    if (inputText.trim().length < 10) return;
    setLoading(true); setError(null); setAngebot(null);
    try {
      const res = await fetch("/api/angebote/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input_text: inputText }) });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Generation failed");
      else { setAngebot(data); setSavedId(data.id ?? null); }
    } catch { setError("Network error."); }
    setLoading(false);
  }

  function updatePosition(i: number, f: string, v: string | number) {
    if (!angebot) return;
    const p = [...angebot.positionen]; (p[i] as any)[f] = v;
    if (f === "einzelpreis" || f === "menge") p[i].gesamtpreis = p[i].menge * p[i].einzelpreis;
    const sub = p.reduce((s, x) => s + x.gesamtpreis, 0);
    const tax = Math.round(sub * (angebot.mwstRate / 100) * 100) / 100;
    setAngebot({ ...angebot, positionen: p, subtotalNet: sub, mwstTotal: tax, totalGross: Math.round((sub + tax) * 100) / 100 });
  }

  function updateField(field: string, value: string | number) {
    if (!angebot) return;
    setAngebot({ ...angebot, [field]: value });
  }

  async function handleSave() {
    if (!savedId || !angebot) return; setSaving(true);
    await fetch(`/api/angebote/${savedId}`, { method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        einleitung: angebot.einleitung,
        schlussformel: angebot.schlussformel,
        zahlungsbedingungen: angebot.zahlungsbedingungen,
        gewaehrleistung: angebot.gewaehrleistung,
        mwstRate: angebot.mwstRate,
        positions: angebot.positionen,
        subtotalNet: angebot.subtotalNet,
        mwstTotal: angebot.mwstTotal,
        totalGross: angebot.totalGross
      }) });
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">New Quote</h1>
        <p className="mt-1 text-sm text-muted-foreground">Speak or type your job description. AI generates the Angebot.</p>
      </div>

      {/* Pricing info */}
      <div className="rounded-lg border border-brand/30 bg-brand/10/10 px-4 py-3 text-xs text-muted-foreground">
        <span className="font-medium text-brand">How pricing works:</span> The AI estimates <strong>labor</strong> (hours × your hourly rate from Settings) and <strong>material</strong> costs (Austrian market estimates). All prices are estimates — review and adjust before sending.
        <a href="/app/einstellungen" className="ml-1 text-blue-600 dark:text-blue-400 hover:underline">Set your hourly rate →</a>
      </div>

      {/* Input card */}
      <Card className="shadow-card transition-[box-shadow] duration-150 bg-card/50 overflow-hidden">
        <Tabs defaultValue="voice" className="w-full">
          <div className="flex items-center justify-between border-b border-border/50 px-6 pt-4">
            <TabsList className="bg-transparent h-auto p-0 gap-0">
              <TabsTrigger value="voice" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-4 py-2 text-xs text-zinc-400 data-[state=active]:text-zinc-100 flex items-center gap-1.5">
                <MicrophoneIcon className="size-3.5" />Voice</TabsTrigger>
              <TabsTrigger value="text" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none px-4 py-2 text-xs text-zinc-400 data-[state=active]:text-zinc-100 flex items-center gap-1.5">
                <PencilSquareIcon className="size-3.5" />Text</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="voice" className="p-0 m-0">
            <div className="p-6 space-y-6">
              {/* Recording area */}
              <div className="flex flex-col items-center gap-4 py-8">
                <button onClick={listening ? stopListening : startListening}
                  className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-[transform,box-shadow,background-color] duration-200 ${
                    listening ? "bg-red-500/20 text-destructive ring-4 ring-red-500/20" : "bg-muted text-foreground hover:bg-muted/80 active:scale-[0.96]"
                  }`}>
                  {listening ? <StopCircleIcon className="size-8" /> : <MicrophoneIcon className="size-8" />}
                  {listening && <span className="absolute inset-0 animate-ping rounded-full bg-red-500/20" />}
                </button>
                <div className="text-center">
                  {listening ? (
                    <p className="text-sm font-medium text-destructive">Recording... tap to stop</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Tap the mic and describe the job in German</p>
                  )}
                  {listening && interimText && (
                    <p className="mt-2 text-sm italic text-zinc-600 max-w-sm">{interimText}</p>
                  )}
                </div>
              </div>

              {/* Transcript + Generate */}
              {inputText && !listening && (
                <div className="space-y-3">
                  <Textarea value={inputText} onChange={(e) => setInputText(e.target.value)} rows={4}
                    className="border-zinc-800 bg-muted/50 text-sm text-zinc-200 placeholder:text-zinc-600 resize-none" />
                  <Button onClick={handleGenerate} disabled={loading}
                    className="w-full h-10 bg-black dark:bg-white text-sm font-medium hover:bg-black dark:bg-white/90">
                    {loading ? "Generating..." : "Generate Angebot →"}
                  </Button>
                </div>
              )}
              {!inputText && !listening && (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground">Recording will appear here</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="text" className="p-0 m-0">
            <div className="p-6 space-y-4">
              <Textarea value={inputText} onChange={(e) => setInputText(e.target.value)} rows={8}
                className="border-zinc-800 bg-muted/50 text-sm text-zinc-200 placeholder:text-zinc-600 resize-none"
                placeholder="Describe the job — rooms, materials, measurements, customer... (in German)" />
              <Button onClick={handleGenerate} disabled={loading || inputText.trim().length < 10}
                className="w-full h-10 bg-black dark:bg-white text-sm font-medium hover:bg-black dark:bg-white/90">
                {loading ? "Generating..." : "Generate Angebot →"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Loading */}
      {loading && (
        <Card className="shadow-card transition-[box-shadow] duration-150 bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner />
            <p className="text-sm text-muted-foreground">AI is writing your Angebot...</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-800/50 bg-destructive/10/30">
          <CardContent className="py-4"><p className="text-sm text-destructive">{error}</p></CardContent>
        </Card>
      )}

      {/* Angebot Preview */}
      {angebot && (
        <Card className="shadow-card transition-[box-shadow] duration-150 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold text-foreground">Generated Quote</CardTitle>
              <p className="text-xs text-zinc-500 mt-0.5">Review and edit before saving</p>
            </div>
            <div className="flex gap-2">
              {savedId && (
                <a href={`/api/angebote/${savedId}/pdf`} target="_blank" className={buttonVariants({ size: "sm", className: "h-8 bg-zinc-800 hover:bg-zinc-700 text-xs flex items-center gap-1" })}>
                  <DocumentTextIcon className="size-3.5" />PDF
                </a>
              )}
              <Button size="sm" onClick={handleSave} disabled={saving} className="h-8 bg-foreground text-background hover:bg-black dark:bg-white/90 text-xs">
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-1">
              <Label className="text-[10px] text-zinc-500 uppercase tracking-wider">Title</Label>
              <Input
                value={angebot.positionen[0]?.beschreibung?.slice(0, 80) ?? "Angebot"}
                onChange={(e) => updateField("title", e.target.value)}
                className="h-8 border-zinc-800 bg-muted/50 text-sm text-zinc-200 font-medium" />
            </div>

            {/* Einleitung */}
            <div className="space-y-1">
              <Label className="text-[10px] text-zinc-500 uppercase tracking-wider">Introduction</Label>
              <Textarea value={angebot.einleitung} onChange={(e) => updateField("einleitung", e.target.value)}
                rows={3} className="border-zinc-800 bg-muted/50 text-sm text-zinc-200 resize-none" />
            </div>

            {/* Positions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Positions</h4>
                <Button size="sm" variant="ghost" className="h-6 text-[10px] text-zinc-500 hover:text-foreground"
                  onClick={() => {
                    const newPos = { pos: (angebot.positionen?.length ?? 0) + 1, beschreibung: "", menge: 1, einheit: "pauschal", einzelpreis: 0, gesamtpreis: 0 };
                    setAngebot({ ...angebot, positionen: [...(angebot.positionen ?? []), newPos] });
                  }}>
                  + Add position
                </Button>
              </div>
              {angebot.positionen.map((pos, i) => (
                <div key={pos.pos} className="rounded-lg shadow-card transition-[box-shadow] duration-150 bg-card/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className="h-5 px-1.5 text-[10px] bg-zinc-800 text-zinc-400 border-0">Pos. {pos.pos}</Badge>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-zinc-600 hover:text-destructive"
                      onClick={() => {
                        const p = angebot.positionen.filter((_, j) => j !== i).map((x, idx) => ({ ...x, pos: idx + 1 }));
                        const sub = p.reduce((s, x) => s + x.gesamtpreis, 0);
                        const tax = Math.round(sub * (angebot.mwstRate / 100) * 100) / 100;
                        setAngebot({ ...angebot, positionen: p, subtotalNet: sub, mwstTotal: tax, totalGross: Math.round((sub + tax) * 100) / 100 });
                      }}>
                      <TrashIcon className="size-3" />
                    </Button>
                  </div>
                  <Textarea value={pos.beschreibung} onChange={(e) => updatePosition(i, "beschreibung", e.target.value)}
                    rows={2} className="border-zinc-800 bg-muted/50 text-sm text-zinc-200 resize-none" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div><Label className="text-[10px] text-muted-foreground">Qty</Label>
                      <Input type="number" value={pos.menge} onChange={(e) => updatePosition(i, "menge", Number(e.target.value))}
                        className="h-8 border-zinc-800 bg-muted/50 text-sm mt-1" /></div>
                    <div><Label className="text-[10px] text-muted-foreground">Unit</Label>
                      <Input value={pos.einheit} onChange={(e) => updatePosition(i, "einheit", e.target.value)}
                        className="h-8 border-zinc-800 bg-muted/50 text-sm mt-1" /></div>
                    <div><Label className="text-[10px] text-muted-foreground">Price (€)</Label>
                      <Input type="number" value={pos.einzelpreis} onChange={(e) => updatePosition(i, "einzelpreis", Number(e.target.value))}
                        className="h-8 border-zinc-800 bg-muted/50 text-sm mt-1" /></div>
                    <div><Label className="text-[10px] text-muted-foreground">Total (€)</Label>
                      <Input type="number" value={pos.gesamtpreis} disabled
                        className="h-8 border-zinc-800 bg-zinc-900 text-zinc-500 text-sm mt-1" /></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="rounded-lg border border-brand/30 bg-brand/10/10 p-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal (net)</span><span className="text-zinc-200 tabular-nums">€{angebot.subtotalNet.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm items-center gap-2">
                <span className="text-muted-foreground">VAT rate</span>
                <Select value={String(angebot.mwstRate)} onValueChange={(v) => {
                  const rate = Number(v);
                  const tax = Math.round(angebot.subtotalNet * (rate / 100) * 100) / 100;
                  setAngebot({ ...angebot, mwstRate: rate, mwstTotal: tax, totalGross: Math.round((angebot.subtotalNet + tax) * 100) / 100 });
                }}>
                  <SelectTrigger className="h-8 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20%</SelectItem>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="0">0%</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-foreground tabular-nums">€{angebot.mwstTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-zinc-800"><span className="text-foreground">Total</span><span className="text-foreground tabular-nums">€{angebot.totalGross.toFixed(2)}</span></div>
              {angebot.mwstReason && <p className="text-[10px] text-zinc-600 pt-1">{angebot.mwstReason}</p>}
            </div>

            {/* Legal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Payment Terms</Label>
                <Input value={angebot.zahlungsbedingungen} onChange={(e) => updateField("zahlungsbedingungen", e.target.value)}
                  className="h-8 border-zinc-800 bg-muted/50 text-xs text-foreground" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Warranty</Label>
                <Input value={angebot.gewaehrleistung} onChange={(e) => updateField("gewaehrleistung", e.target.value)}
                  className="h-8 border-zinc-800 bg-muted/50 text-xs text-foreground" />
              </div>
            </div>

            {/* AI disclaimer */}
            <p className="text-[11px] text-zinc-600 text-center">AI-generated draft — please review all fields before sending.</p>

            {/* Schlussformel */}
            <div className="space-y-1">
              <Label className="text-[10px] text-zinc-500 uppercase tracking-wider">Closing</Label>
              <Textarea value={angebot.schlussformel} onChange={(e) => updateField("schlussformel", e.target.value)}
                rows={3} className="border-zinc-800 bg-muted/50 text-sm text-zinc-200 resize-none" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

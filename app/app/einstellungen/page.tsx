"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/loading";

interface CompanyData { id?:string;name:string;address:string;uidNumber:string;defaultHourlyRate:number;meisterRate:number;geselleRate:number;helferRate:number;materialMarkup:number;defaultMwst:number;phone:string;email:string;website:string;agbText:string; }

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [c, setC] = useState<CompanyData>({ name:"",address:"",uidNumber:"",defaultHourlyRate:95,meisterRate:85,geselleRate:60,helferRate:45,materialMarkup:15,defaultMwst:20,phone:"",email:"",website:"",agbText:"" });

  useEffect(() => { fetch("/api/company").then(r=>r.json()).then(d=>{ if(d?.id)setC(d); }).finally(()=>setLoading(false)); }, []);

  async function handleSave() { setSaving(true); setSaved(false);
    await fetch("/api/company", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(c) });
    setSaved(true); setTimeout(()=>setSaved(false),2000); setSaving(false); }

  function update(f:string,v:string|number){ setC(p=>({...p,[f]:v})); setSaved(false); }

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Company profile, defaults, and legal text.</p>
      </div>

      <Card className="shadow-card transition-[box-shadow] duration-150 bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">Company Profile</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Appears on your Angebot PDFs and emails.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Company Name</Label>
            <Input value={c.name} onChange={e=>update("name",e.target.value)} className="h-9 border-zinc-800 bg-muted/50 text-sm text-foreground" placeholder="Your Company GmbH" /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Address</Label>
            <Input value={c.address} onChange={e=>update("address",e.target.value)} className="h-9 border-zinc-800 bg-muted/50 text-sm text-foreground" placeholder="Musterstraße 1, 4020 Linz" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">Phone</Label>
              <Input value={c.phone} onChange={e=>update("phone",e.target.value)} className="h-9 border-zinc-800 bg-muted/50 text-sm text-foreground" placeholder="+43 732..." /></div>
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">Email</Label>
              <Input value={c.email} onChange={e=>update("email",e.target.value)} className="h-9 border-zinc-800 bg-muted/50 text-sm text-foreground" placeholder="office@company.at" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">UID Number</Label>
              <Input value={c.uidNumber} onChange={e=>update("uidNumber",e.target.value)} className="h-9 border-zinc-800 bg-muted/50 text-sm text-foreground" placeholder="ATU12345678" /></div>
            <div className="space-y-2"><Label className="text-xs text-muted-foreground">Website</Label>
              <Input value={c.website} onChange={e=>update("website",e.target.value)} className="h-9 border-zinc-800 bg-muted/50 text-sm text-foreground" placeholder="www.company.at" /></div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card transition-[box-shadow] duration-150 bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">Lohngruppen (Hourly Rates)</CardTitle>
          <CardDescription className="text-xs text-muted-foreground"><span className="text-brand">The AI multiplies estimated hours × the Meister rate.</span> Geselle and Helfer rates are used when you adjust positions manually.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Meister (€/h)</Label>
            <Input type="number" value={c.meisterRate} onChange={e=>update("meisterRate",Number(e.target.value))} className="h-9 border-zinc-800 bg-muted/50 text-sm text-foreground" /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Geselle (€/h)</Label>
            <Input type="number" value={c.geselleRate} onChange={e=>update("geselleRate",Number(e.target.value))} className="h-9 border-zinc-800 bg-muted/50 text-sm text-foreground" /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Helfer (€/h)</Label>
            <Input type="number" value={c.helferRate} onChange={e=>update("helferRate",Number(e.target.value))} className="h-9 border-zinc-800 bg-muted/50 text-sm text-foreground" /></div>
        </CardContent>
      </Card>

      <Card className="shadow-card transition-[box-shadow] duration-150 bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">Pricing Defaults</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Standard markup and tax settings for all quotes.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Material Markup (%)</Label>
            <Input type="number" value={c.materialMarkup} onChange={e=>update("materialMarkup",Number(e.target.value))} className="h-9 border-zinc-800 bg-muted/50 text-sm text-foreground" /></div>
          <div className="space-y-2"><Label className="text-xs text-muted-foreground">Default VAT</Label>
            <Select value={String(c.defaultMwst)} onValueChange={v=>update("defaultMwst",Number(v))}>
              <SelectTrigger className="h-9 border-zinc-800 bg-muted/50 text-sm text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800"><SelectItem value="20">20% — Standard</SelectItem><SelectItem value="10">10% — Reduced</SelectItem><SelectItem value="0">0% — Exempt</SelectItem></SelectContent>
            </Select></div>
        </CardContent>
      </Card>

      <Card className="shadow-card transition-[box-shadow] duration-150 bg-card/50">
        <CardHeader>
          <CardTitle className="text-base">Legal Text</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">Payment terms and warranty included in every Angebot.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea value={c.agbText} onChange={e=>update("agbText",e.target.value)} rows={5}
            className="border-zinc-800 bg-muted/50 text-sm text-zinc-200 resize-none" />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="h-9 bg-black dark:bg-white hover:bg-black dark:bg-white/90 text-sm">
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
        </Button>
        {saved && <span className="text-xs text-brand">Settings updated</span>}
      </div>
    </div>
  );
}

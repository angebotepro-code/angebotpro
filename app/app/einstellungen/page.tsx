"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/loading";

interface CompanyData { id?:string;name:string;address:string;uidNumber:string;defaultHourlyRate:number;defaultMwst:number;phone:string;email:string;website:string;agbText:string; }

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [c, setC] = useState<CompanyData>({ name:"",address:"",uidNumber:"",defaultHourlyRate:95,defaultMwst:20,phone:"",email:"",website:"",agbText:"" });

  useEffect(() => { fetch("/api/company").then(r=>r.json()).then(d=>{ if(d?.id)setC(d); }).finally(()=>setLoading(false)); }, []);

  async function handleSave() { setSaving(true); setSaved(false);
    await fetch("/api/company", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(c) });
    setSaved(true); setTimeout(()=>setSaved(false),2000); setSaving(false); }

  function update(f:string,v:string|number){ setC(p=>({...p,[f]:v})); setSaved(false); }

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Company profile, defaults, and legal text.</p>
      </div>

      <Card className="shadow-card transition-[box-shadow] duration-150 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-base">Company Profile</CardTitle>
          <CardDescription className="text-xs text-zinc-500">Appears on your Angebot PDFs and emails.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label className="text-xs text-zinc-400">Company Name</Label>
            <Input value={c.name} onChange={e=>update("name",e.target.value)} className="h-9 border-zinc-800 bg-zinc-800/50 text-sm text-zinc-200" placeholder="Your Company GmbH" /></div>
          <div className="space-y-2"><Label className="text-xs text-zinc-400">Address</Label>
            <Input value={c.address} onChange={e=>update("address",e.target.value)} className="h-9 border-zinc-800 bg-zinc-800/50 text-sm text-zinc-200" placeholder="Musterstraße 1, 4020 Linz" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs text-zinc-400">Phone</Label>
              <Input value={c.phone} onChange={e=>update("phone",e.target.value)} className="h-9 border-zinc-800 bg-zinc-800/50 text-sm text-zinc-200" placeholder="+43 732..." /></div>
            <div className="space-y-2"><Label className="text-xs text-zinc-400">Email</Label>
              <Input value={c.email} onChange={e=>update("email",e.target.value)} className="h-9 border-zinc-800 bg-zinc-800/50 text-sm text-zinc-200" placeholder="office@company.at" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label className="text-xs text-zinc-400">UID Number</Label>
              <Input value={c.uidNumber} onChange={e=>update("uidNumber",e.target.value)} className="h-9 border-zinc-800 bg-zinc-800/50 text-sm text-zinc-200" placeholder="ATU12345678" /></div>
            <div className="space-y-2"><Label className="text-xs text-zinc-400">Website</Label>
              <Input value={c.website} onChange={e=>update("website",e.target.value)} className="h-9 border-zinc-800 bg-zinc-800/50 text-sm text-zinc-200" placeholder="www.company.at" /></div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card transition-[box-shadow] duration-150 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-base">Defaults</CardTitle>
          <CardDescription className="text-xs text-zinc-500">Pre-filled values for new quotes. <span className="text-emerald-400">Your hourly rate is used by the AI to calculate labor costs.</span></CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2"><Label className="text-xs text-zinc-400">Hourly Rate (€)</Label>
            <Input type="number" value={c.defaultHourlyRate} onChange={e=>update("defaultHourlyRate",Number(e.target.value))} className="h-9 border-zinc-800 bg-zinc-800/50 text-sm text-zinc-200" /></div>
          <div className="space-y-2"><Label className="text-xs text-zinc-400">Default VAT</Label>
            <Select value={String(c.defaultMwst)} onValueChange={v=>update("defaultMwst",Number(v))}>
              <SelectTrigger className="h-9 border-zinc-800 bg-zinc-800/50 text-sm text-zinc-200"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800"><SelectItem value="20">20% — Standard</SelectItem><SelectItem value="10">10% — Reduced</SelectItem><SelectItem value="0">0% — Exempt</SelectItem></SelectContent>
            </Select></div>
        </CardContent>
      </Card>

      <Card className="shadow-card transition-[box-shadow] duration-150 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-base">Legal Text</CardTitle>
          <CardDescription className="text-xs text-zinc-500">Payment terms and warranty included in every Angebot.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea value={c.agbText} onChange={e=>update("agbText",e.target.value)} rows={5}
            className="border-zinc-800 bg-zinc-800/50 text-sm text-zinc-200 resize-none" />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving} className="h-9 bg-emerald-500 hover:bg-emerald-600 text-sm">
          {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
        </Button>
        {saved && <span className="text-xs text-emerald-400">Settings updated</span>}
      </div>
    </div>
  );
}

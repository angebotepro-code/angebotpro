"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CompanyData {
  id: string;
  name: string;
  address: string;
  uidNumber: string;
  defaultHourlyRate: number;
  defaultMwst: number;
  phone: string;
  email: string;
  website: string;
  agbText: string;
}

export default function EinstellungenPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [company, setCompany] = useState<Partial<CompanyData>>({
    name: "",
    address: "",
    uidNumber: "",
    defaultHourlyRate: 95,
    defaultMwst: 20,
    phone: "",
    email: "",
    website: "",
    agbText: "Zahlbar innerhalb von 30 Tagen netto.\nGewährleistung: 3 Jahre gemäß § 933 ABGB.\nGerichtsstand: Linz.",
  });

  useEffect(() => {
    fetch("/api/company")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.id) {
          setCompany(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(company),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  }

  function update(field: string, value: string | number) {
    setCompany((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  if (loading) {
    return <p className="text-zinc-400">Loading...</p>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-zinc-50">{t("settings.title")}</h1>
        <p className="mt-1 text-zinc-400">Manage your company profile and Angebot defaults.</p>
      </div>

      <Tabs defaultValue="company">
        <TabsList className="bg-zinc-800">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="defaults">Defaults</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-4">
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-zinc-50">Company Profile</CardTitle>
              <CardDescription className="text-zinc-400">
                This appears on your Angebot PDFs and emails.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Company Name</Label>
                <Input
                  value={company.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="border-zinc-700 bg-zinc-800 text-zinc-100"
                  placeholder="Musterfirma GmbH"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Address</Label>
                <Input
                  value={company.address}
                  onChange={(e) => update("address", e.target.value)}
                  className="border-zinc-700 bg-zinc-800 text-zinc-100"
                  placeholder="Musterstraße 1, 4020 Linz"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Phone</Label>
                  <Input
                    value={company.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="border-zinc-700 bg-zinc-800 text-zinc-100"
                    placeholder="+43 732 123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Email</Label>
                  <Input
                    value={company.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="border-zinc-700 bg-zinc-800 text-zinc-100"
                    placeholder="office@company.at"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">UID Number</Label>
                  <Input
                    value={company.uidNumber}
                    onChange={(e) => update("uidNumber", e.target.value)}
                    className="border-zinc-700 bg-zinc-800 text-zinc-100"
                    placeholder="ATU12345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Website</Label>
                  <Input
                    value={company.website}
                    onChange={(e) => update("website", e.target.value)}
                    className="border-zinc-700 bg-zinc-800 text-zinc-100"
                    placeholder="www.company.at"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defaults" className="mt-4">
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-zinc-50">Default Settings</CardTitle>
              <CardDescription className="text-zinc-400">
                Pre-filled values for new Angebote.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Default Hourly Rate (€)</Label>
                <Input
                  type="number"
                  value={company.defaultHourlyRate}
                  onChange={(e) => update("defaultHourlyRate", Number(e.target.value))}
                  className="border-zinc-700 bg-zinc-800 text-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Default VAT Rate</Label>
                <Select
                  value={String(company.defaultMwst)}
                  onValueChange={(v) => update("defaultMwst", Number(v))}
                >
                  <SelectTrigger className="border-zinc-700 bg-zinc-800 text-zinc-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="20">20% — Standard</SelectItem>
                    <SelectItem value="10">10% — Reduced (renovation/repair)</SelectItem>
                    <SelectItem value="0">0% — Tax exempt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="mt-4">
          <Card className="border-zinc-800 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-zinc-50">Legal Text</CardTitle>
              <CardDescription className="text-zinc-400">
                Payment terms and legal boilerplate included in every Angebot.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Payment Terms & Warranty</Label>
                <Textarea
                  value={company.agbText}
                  onChange={(e) => update("agbText", e.target.value)}
                  rows={6}
                  className="border-zinc-700 bg-zinc-800 text-zinc-100"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          {saving ? "Saving..." : saved ? "✓ Saved" : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}

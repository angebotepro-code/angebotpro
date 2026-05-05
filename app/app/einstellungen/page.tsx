import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EinstellungenPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-zinc-50">Einstellungen</h1>
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-50">Firmenprofil</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">Coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}

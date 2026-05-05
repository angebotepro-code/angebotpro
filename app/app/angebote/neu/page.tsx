import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NeuesAngebotPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-zinc-50">Neues Angebot</h1>
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-50">Angebot erstellen</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500">Coming soon — AI generation here.</p>
        </CardContent>
      </Card>
    </div>
  );
}

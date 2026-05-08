"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/loading";
import {
  DocumentTextIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface Angebot {
  id: string; number: string; title: string; status: string; totalGross: number; createdAt: string;
}

const statusColors: Record<string, string> = {
  draft: "text-muted-foreground",
  sent: "text-blue-600 dark:text-blue-400",
  accepted: "text-emerald-600 dark:text-emerald-400",
  rejected: "text-red-600 dark:text-red-400",
};

export default function AngebotePage() {
  const [angebote, setAngebote] = useState<Angebot[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const load = useCallback(() => {
    fetch("/api/angebote").then(r => r.json()).then(d => setAngebote(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = angebote.filter(a => {
    if (filter !== "all" && a.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (a.title ?? "").toLowerCase().includes(q) || a.number.toLowerCase().includes(q);
    }
    return true;
  });

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleAll() {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map(a => a.id)));
  }

  async function bulkAction(status: string | null) {
    const ids = Array.from(selected);
    for (const id of ids) {
      if (status === "delete") await fetch(`/api/angebote/${id}`, { method: "DELETE" });
      else await fetch(`/api/angebote/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, acceptedAt: status === "accepted" ? new Date().toISOString() : undefined }) });
    }
    setSelected(new Set());
    load();
  }

  const filters = ["all", "draft", "sent", "accepted", "rejected"];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Quotes</h1>
          <p className="text-sm text-muted-foreground">{angebote.length} quotes total</p>
        </div>
        <Link href="/app/angebote/neu" className={buttonVariants({ className: "bg-foreground text-background hover:bg-foreground/80 h-9 text-sm" })}>
          + New Quote
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search quotes..."
            className="pl-9 h-9" />
        </div>
        <div className="flex gap-1.5">
          {filters.map(f => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "ghost"}
              className={`h-8 text-xs capitalize ${filter === f ? "" : "text-muted-foreground"}`}
              onClick={() => setFilter(f)}>
              {f}
            </Button>
          ))}
        </div>
        {selected.size > 0 && (
          <div className="flex gap-1.5">
            <Button size="sm" variant="ghost" className="h-8 text-xs text-emerald-600 dark:text-emerald-400" onClick={() => bulkAction("accepted")}><CheckIcon className="size-3.5 mr-1" />Accept</Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs text-red-600 dark:text-red-400" onClick={() => bulkAction("rejected")}><XMarkIcon className="size-3.5 mr-1" />Reject</Button>
            <Button size="sm" variant="ghost" className="h-8 text-xs text-red-500" onClick={() => { if (confirm(`Delete ${selected.size} quotes?`)) bulkAction("delete"); }}><TrashIcon className="size-3.5 mr-1" />Delete</Button>
          </div>
        )}
      </div>

      <Card className="shadow-card bg-card overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-24"><Spinner /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <DocumentTextIcon className="size-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No quotes found</p>
              <Link href="/app/angebote/neu" className={buttonVariants({ className: "mt-4 bg-foreground text-background hover:bg-foreground/80 h-8 text-xs" })}>Create Quote</Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead className="w-24">Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <Checkbox checked={selected.has(a.id)} onCheckedChange={() => toggleSelect(a.id)} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground tabular-nums">{a.number}</TableCell>
                    <TableCell>
                      <Link href={`/app/angebote/${a.id}`} className="text-sm font-medium text-foreground hover:underline">{a.title || a.number}</Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${statusColors[a.status] ?? ""}`}>{a.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium tabular-nums text-right">€{a.totalGross?.toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(a.createdAt).toLocaleDateString("de-AT")}</TableCell>
                    <TableCell>
                      <Link href={`/app/angebote/${a.id}`} className={buttonVariants({ size: "sm", variant: "ghost", className: "h-7" })}>
                        <DocumentTextIcon className="size-3.5" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

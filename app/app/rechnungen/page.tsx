"use client";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Spinner } from "@/components/ui/loading";
import { useI18n } from "@/lib/i18n/context";
import { EyeIcon, DocumentTextIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface Invoice { id: string; number: string; status: string; totalGross: number; createdAt: string; customerName?: string; }

const statusColors: Record<string, string> = {
  draft: "text-muted-foreground", sent: "text-blue-600 dark:text-blue-400",
  paid: "text-emerald-600 dark:text-emerald-400", overdue: "text-red-600 dark:text-red-400",
};

export default function InvoicesPage() {
  const { t } = useI18n();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(() => {
    fetch("/api/invoices").then(r => r.json()).then(d => setInvoices(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = invoices.filter(i => {
    if (filter !== "all" && i.status !== filter) return false;
    if (search) { const q = search.toLowerCase(); return i.number.toLowerCase().includes(q) || (i.customerName ?? "").toLowerCase().includes(q); }
    return true;
  });

  const filters = ["all", "draft", "sent", "paid", "overdue"];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-xl sm:text-2xl font-bold text-foreground">Rechnungen</h1><p className="text-sm text-muted-foreground">{invoices.length} total</p></div>
        <Link href="/app/rechnungen/neu" className={buttonVariants({ className: "bg-foreground text-background hover:bg-foreground/80 h-9 text-sm" })}>+ New Invoice</Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm"><MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("settings.invoices.search")} className="pl-9 h-9" />
        </div>
        <div className="flex gap-1.5">
          {filters.map(f => (
            <Button key={f} size="sm" variant={filter === f ? "default" : "ghost"}
              className={`h-8 text-xs capitalize ${filter === f ? "" : "text-muted-foreground"}`} onClick={() => setFilter(f)}>{f}</Button>
          ))}
        </div>
      </div>

      <Card className="shadow-card bg-card overflow-hidden">
        <CardContent className="p-0">
          {loading ? <div className="flex justify-center py-24"><Spinner /></div> : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center"><DocumentTextIcon className="size-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-muted-foreground">{t("settings.invoices.noInvoices")}</p>
              <Link href="/app/rechnungen/neu" className={buttonVariants({ className: "mt-4 bg-foreground text-background hover:bg-foreground/80 h-8 text-xs" })}>Create Invoice</Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead className="w-32">{t("settings.invoices.number")}</TableHead><TableHead>{t("settings.invoices.customer")}</TableHead><TableHead>{t("settings.invoices.status")}</TableHead><TableHead className="text-right">{t("settings.invoices.totalAmount")}</TableHead><TableHead>{t("settings.invoices.date")}</TableHead><TableHead className="w-10"></TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(inv => (
                  <TableRow key={inv.id}>
                    <TableCell className="text-sm text-muted-foreground tabular-nums">{inv.number}</TableCell>
                    <TableCell><Link href={`/app/rechnungen/${inv.id}`} className="text-sm font-medium text-foreground hover:underline">{inv.customerName ?? "—"}</Link></TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] ${statusColors[inv.status] ?? ""}`}>{inv.status}</Badge></TableCell>
                    <TableCell className="text-sm font-medium tabular-nums text-right">€{inv.totalGross?.toFixed(2)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString("de-AT")}</TableCell>
                    <TableCell><Link href={`/app/rechnungen/${inv.id}`} className={buttonVariants({ size: "sm", variant: "ghost", className: "h-7" })}><EyeIcon className="size-3.5" /></Link></TableCell>
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

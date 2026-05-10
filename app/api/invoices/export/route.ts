import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: userRecord } = await adminClient.from("User").select("companyId").eq("email", user.email!).maybeSingle();
    if (!userRecord?.companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

    const { data: invoices } = await adminClient.from("Invoice").select("*").eq("companyId", userRecord.companyId).order("createdAt", { ascending: false });

    const header = "Rechnungsnummer;Rechnungsdatum;Leistungsdatum;Kundenname;Kunden-UID;Nettobetrag;MwSt-Satz;MwSt-Betrag;Bruttobetrag;Status;Zahlungseingang;Betrag erhalten";
    const rows = (invoices ?? []).map(inv => {
      const formatDate = (d: string) => new Date(d).toLocaleDateString("de-AT");
      return [
        inv.number, formatDate(inv.issuedAt), inv.leistungsdatum ?? "", "", "",
        Number(inv.subtotalNet).toFixed(2), `${inv.mwstRate}%`, Number(inv.mwstTotal).toFixed(2),
        Number(inv.totalGross).toFixed(2), inv.status === "paid" ? "bezahlt" : inv.status === "overdue" ? "überfällig" : "offen",
        inv.paidAt ? formatDate(inv.paidAt) : "", inv.paidAmount ? Number(inv.paidAmount).toFixed(2) : "",
      ].join(";");
    });

    const csv = "\uFEFF" + header + "\n" + rows.join("\n");
    return new NextResponse(csv, {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="Rechnungen_${new Date().toISOString().slice(0,10)}.csv"` },
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateInvoicePDF } from "@/components/pdf/invoice-pdf";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const adminClient = createAdminClient();

    const { data: invoice, error } = await adminClient.from("Invoice").select("*").eq("id", id).single();
    if (error || !invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: company } = await adminClient.from("Company").select("*").eq("id", invoice.companyId).single();
    let customerName, customerAddress;
    if (invoice.customerId) {
      const { data: c } = await adminClient.from("Customer").select("name, address").eq("id", invoice.customerId).single();
      customerName = c?.name; customerAddress = c?.address;
    }

    const { searchParams } = new URL(request.url);
    const isPreview = searchParams.get("preview") === "true";

    const pdfBuffer = await generateInvoicePDF({
      company: company ? { name: company.name, address: company.address ?? "", uidNumber: company.uidNumber ?? "", phone: company.phone ?? "", email: company.email ?? "", bankName: company.bankName ?? "", iban: company.iban ?? "", bic: company.bic ?? "" } : undefined,
      invoice: {
        number: invoice.number, status: invoice.status,
        einleitung: invoice.einleitung ?? "",
        positions: (invoice.positions as any[]) ?? [],
        subtotalNet: Number(invoice.subtotalNet),
        mwstRate: Number(invoice.mwstRate),
        mwstTotal: Number(invoice.mwstTotal),
        totalGross: Number(invoice.totalGross),
        zahlungsbedingungen: invoice.zahlungsbedingungen ?? "",
        leistungsdatum: invoice.leistungsdatum ?? undefined,
        skonto: invoice.skonto ?? undefined,
        issuedAt: new Date(invoice.issuedAt).toLocaleDateString("de-AT"),
        dueAt: new Date(invoice.dueAt).toLocaleDateString("de-AT"),
        customerName: customerName ?? undefined,
        customerAddress: customerAddress ?? undefined,
        customerUid: invoice.customerUid ?? undefined,
        schlussformel: invoice.schlussformel ?? "",
      },
    });

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": isPreview ? `inline; filename="Rechnung_${invoice.number}.pdf"` : `attachment; filename="Rechnung_${invoice.number}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Invoice PDF error:", error);
    return NextResponse.json({ error: "PDF generation failed" }, { status: 500 });
  }
}

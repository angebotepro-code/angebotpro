import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { generateInvoicePDF } from "@/components/pdf/invoice-pdf";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { to } = await request.json();
    if (!to?.includes("@")) return NextResponse.json({ error: "Valid email required" }, { status: 422 });

    const adminClient = createAdminClient();
    const { data: invoice } = await adminClient.from("Invoice").select("*").eq("id", id).single();
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: company } = await adminClient.from("Company").select("*").eq("id", invoice.companyId).single();
    const companyName = company?.name ?? "Werkit";

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 });

    // Generate PDF
    let customerName, customerAddress;
    if (invoice.customerId) {
      const { data: c } = await adminClient.from("Customer").select("name, address").eq("id", invoice.customerId).single();
      customerName = c?.name; customerAddress = c?.address;
    }

    const pdfBuffer = await generateInvoicePDF({
      company: company ? { name: company.name, address: company.address ?? "", uidNumber: company.uidNumber ?? "", phone: company.phone ?? "", email: company.email ?? "", bankName: company.bankName ?? "", iban: company.iban ?? "", bic: company.bic ?? "" } : undefined,
      invoice: {
        number: invoice.number, status: invoice.status,
        einleitung: invoice.einleitung ?? "", positions: (invoice.positions as any[]) ?? [],
        subtotalNet: Number(invoice.subtotalNet), mwstRate: Number(invoice.mwstRate), mwstTotal: Number(invoice.mwstTotal), totalGross: Number(invoice.totalGross),
        zahlungsbedingungen: invoice.zahlungsbedingungen ?? "", leistungsdatum: invoice.leistungsdatum ?? undefined, skonto: invoice.skonto ?? undefined,
        issuedAt: new Date(invoice.issuedAt).toLocaleDateString("de-AT"), dueAt: new Date(invoice.dueAt).toLocaleDateString("de-AT"),
        customerName: customerName ?? undefined, customerAddress: customerAddress ?? undefined,
        schlussformel: invoice.schlussformel ?? "",
      },
    });

    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");

    const resend = new Resend(resendKey);
    const { data: sendData, error: sendError } = await resend.emails.send({
      from: `${companyName} <onboarding@resend.dev>`,
      to: [to],
      subject: `Rechnung ${invoice.number} — ${companyName}`,
      attachments: [{ filename: `Rechnung_${invoice.number}.pdf`, content: pdfBase64 }],
      html: `...email template...`,
    });

    if (sendError) return NextResponse.json({ error: sendError.message }, { status: 500 });

    await adminClient.from("Invoice").update({ status: "sent" }).eq("id", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Invoice send error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

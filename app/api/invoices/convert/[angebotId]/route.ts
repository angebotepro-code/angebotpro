import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ angebotId: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { angebotId } = await params;
    const adminClient = createAdminClient();

    const { data: angebot, error } = await adminClient.from("Angebot").select("*").eq("id", angebotId).single();
    if (error || !angebot) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    if (angebot.status !== "accepted") return NextResponse.json({ error: "Only accepted quotes can be converted" }, { status: 400 });

    const { data: company } = await adminClient.from("Company").select("*").eq("id", angebot.companyId).single();
    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    // Increment invoice number
    const nextNumber = (company.nextInvoiceNumber ?? 1);
    await adminClient.from("Company").update({ nextInvoiceNumber: nextNumber + 1 }).eq("id", company.id);

    const now = new Date();
    const dueDate = new Date(now); dueDate.setDate(dueDate.getDate() + 30);

    const formatDate = (d: Date) => d.toLocaleDateString("de-AT");
    const invoiceNumber = `RE-${now.getFullYear()}-${String(nextNumber).padStart(4, "0")}`;

    const { data: invoice } = await adminClient.from("Invoice").insert({
      companyId: angebot.companyId,
      customerId: angebot.customerId,
      referencedAngebotId: angebot.id,
      number: invoiceNumber,
      status: "draft",
      positions: angebot.positions,
      subtotalNet: angebot.subtotalNet,
      mwstRate: angebot.mwstRate,
      mwstTotal: angebot.mwstTotal,
      totalGross: angebot.totalGross,
      issuedAt: now.toISOString(),
      dueAt: dueDate.toISOString(),
      zahlungsbedingungen: angebot.zahlungsbedingungen ?? "30 Tage netto",
      skonto: "3% Skonto bei Zahlung innerhalb von 14 Tagen, netto 30 Tage",
      leistungsdatum: formatDate(now),
      einleitung: `Sehr geehrte Damen und Herren,\n\nfür die erbrachten Leistungen erlauben wir uns, folgende Rechnung zu legen:\n\nBezug: Angebot Nr. ${angebot.number} vom ${formatDate(new Date(angebot.createdAt))}`,
      schlussformel: "Mit freundlichen Grüßen\n\n" + (company.name ?? "Ihr Handwerksbetrieb"),
    }).select().single();

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Convert error:", error);
    return NextResponse.json({ error: "Conversion failed" }, { status: 500 });
  }
}

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
    if (!userRecord?.companyId) return NextResponse.json([]);

    const { data: invoices } = await adminClient.from("Invoice").select("*").eq("companyId", userRecord.companyId).order("createdAt", { ascending: false }).limit(50);
    return NextResponse.json(invoices ?? []);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminClient = createAdminClient();
    const { data: userRecord } = await adminClient.from("User").select("companyId").eq("email", user.email!).maybeSingle();
    if (!userRecord?.companyId) return NextResponse.json({ error: "No company" }, { status: 400 });

    const body = await request.json();

    const { data: company } = await adminClient.from("Company").select("*").eq("id", userRecord.companyId).single();
    const nextNumber = (company?.nextInvoiceNumber ?? 1);
    await adminClient.from("Company").update({ nextInvoiceNumber: nextNumber + 1 }).eq("id", userRecord.companyId);

    const now = new Date(); const dueDate = new Date(now); dueDate.setDate(dueDate.getDate() + 30);
    const invoiceNumber = `RE-${now.getFullYear()}-${String(nextNumber).padStart(4, "0")}`;

    const { data: invoice } = await adminClient.from("Invoice").insert({
      companyId: userRecord.companyId,
      number: invoiceNumber, status: "draft",
      positions: body.positions ?? [], subtotalNet: body.subtotalNet ?? 0,
      mwstRate: body.mwstRate ?? 20, mwstTotal: body.mwstTotal ?? 0, totalGross: body.totalGross ?? 0,
      issuedAt: now.toISOString(), dueAt: dueDate.toISOString(),
      zahlungsbedingungen: body.zahlungsbedingungen ?? "30 Tage netto",
      einleitung: body.einleitung ?? "",
      schlussformel: body.schlussformel ?? "",
      customerId: body.customerId ?? null,
      leistungsdatum: body.leistungsdatum ?? null,
      skonto: body.skonto ?? null,
      customerUid: body.customerUid ?? null,
    }).select().single();

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Create invoice error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generatePDF } from "@/components/pdf/angebot-pdf";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const adminClient = createAdminClient();

    const { data: angebot, error } = await adminClient
      .from("Angebot")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !angebot) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get company data
    const { data: company } = await adminClient
      .from("Company")
      .select("*")
      .eq("id", angebot.companyId)
      .single();

    const pdfBuffer = await generatePDF({
      company: company ? {
        name: company.name,
        address: company.address ?? "",
        uidNumber: company.uidNumber ?? "",
        phone: company.phone ?? "",
        email: company.email ?? "",
      } : undefined,
      angebot: {
        number: angebot.number,
        date: new Date(angebot.createdAt).toLocaleDateString("de-AT"),
        einleitung: angebot.einleitung ?? "",
        positionen: angebot.positions ?? [],
        subtotalNet: Number(angebot.subtotalNet),
        mwstRate: Number(angebot.mwstRate),
        mwstTotal: Number(angebot.mwstTotal),
        totalGross: Number(angebot.totalGross),
        zahlungsbedingungen: angebot.zahlungsbedingungen ?? "",
        gewaehrleistung: angebot.gewaehrleistung ?? "",
        schlussformel: angebot.schlussformel ?? "",
      },
      acceptedByName: angebot.acceptedByName ?? undefined,
      acceptedAt: angebot.acceptedAt ?? undefined,
    });

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Angebot_${angebot.number}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 }
    );
  }
}

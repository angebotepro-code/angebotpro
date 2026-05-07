import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

export async function POST(
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
    const body = await request.json();
    const { to } = body;

    if (!to || !to.includes("@")) {
      return NextResponse.json({ error: "Valid recipient email required" }, { status: 422 });
    }

    const adminClient = createAdminClient();

    // Fetch the Angebot
    const { data: angebot, error } = await adminClient
      .from("Angebot")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !angebot) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get company name for sender
    const { data: company } = await adminClient
      .from("Company")
      .select("name")
      .eq("id", angebot.companyId)
      .single();

    const companyName = company?.name ?? "AngebotPro";

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Build email body
    const positionsText = (angebot.positions as any[])
      ?.map(
        (p: any) =>
          `• Pos. ${p.pos}: ${p.beschreibung?.slice(0, 60)}... — € ${p.gesamtpreis?.toFixed(2)}`
      )
      .join("\n");

    const { error: sendError } = await resend.emails.send({
      from: `${companyName} <angebote@angebotpro.at>`,
      to: [to],
      subject: `Angebot ${angebot.number} — ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #059669;">${companyName}</h2>
          <p>Sehr geehrte Damen und Herren,</p>
          <p>anbei übermitteln wir Ihnen unser Angebot <strong>Nr. ${angebot.number}</strong>.</p>
          <h3>Zusammenfassung:</h3>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px;">
            <pre style="font-family: Arial; font-size: 14px; line-height: 1.6; margin: 0;">${positionsText}</pre>
            <hr style="border-color: #e2e8f0; margin: 12px 0;">
            <p style="font-size: 18px; font-weight: bold; margin: 0;">
              Gesamtbetrag: € ${angebot.totalGross?.toFixed(2)}
            </p>
          </div>
          <p style="margin-top: 16px; font-size: 12px; color: #999;">
            ${angebot.zahlungsbedingungen ?? "30 Tage netto"} | Gewährleistung: ${angebot.gewaehrleistung ?? "3 Jahre gemäß § 933 ABGB"}
          </p>
          <p>Bei Fragen stehen wir gerne zur Verfügung.</p>
          <p>Mit freundlichen Grüßen<br><strong>${companyName}</strong></p>
          <hr style="border-color: #e2e8f0; margin: 24px 0;">
          <p style="font-size: 10px; color: #ccc;">
            Erstellt mit AngebotPro — KI-gestützte Angebotserstellung
          </p>
        </div>
      `,
    });

    if (sendError) {
      return NextResponse.json({ error: sendError.message }, { status: 500 });
    }

    // Update status to sent
    await adminClient
      .from("Angebot")
      .update({ status: "sent", sentAt: new Date().toISOString() })
      .eq("id", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}

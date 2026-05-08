import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { generatePDF } from "@/components/pdf/angebot-pdf";

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
    if (!to?.includes("@")) return NextResponse.json({ error: "Valid recipient email required" }, { status: 422 });

    const adminClient = createAdminClient();

    const { data: angebot, error } = await adminClient.from("Angebot").select("*").eq("id", id).single();
    if (error || !angebot) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: company } = await adminClient.from("Company").select("*").eq("id", angebot.companyId).single();
    const companyName = company?.name ?? "AngebotPro";

    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) return NextResponse.json({ error: "RESEND_API_KEY missing" }, { status: 500 });

    // Generate PDF
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
        positionen: (angebot.positions as any[]) ?? [],
        subtotalNet: Number(angebot.subtotalNet),
        mwstRate: Number(angebot.mwstRate),
        mwstTotal: Number(angebot.mwstTotal),
        totalGross: Number(angebot.totalGross),
        zahlungsbedingungen: angebot.zahlungsbedingungen ?? "",
        gewaehrleistung: angebot.gewaehrleistung ?? "",
        schlussformel: angebot.schlussformel ?? "",
      },
    });

    const pdfBase64 = Buffer.from(pdfBuffer).toString("base64");
    const positions = (angebot.positions as any[]) ?? [];

    const resend = new Resend(resendKey);

    const positionsRows = positions.slice(0, 6).map((p: any) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #27272a;font-size:13px;color:#d4d4d8;">Pos.${p.pos}</td>
        <td style="padding:8px 0;border-bottom:1px solid #27272a;font-size:13px;color:#fafafa;">${p.beschreibung?.slice(0, 80)}${p.beschreibung?.length > 80 ? "..." : ""}</td>
        <td style="padding:8px 0;border-bottom:1px solid #27272a;font-size:13px;color:#d4d4d8;text-align:right;white-space:nowrap;">${p.menge} ${p.einheit}</td>
        <td style="padding:8px 0;border-bottom:1px solid #27272a;font-size:13px;color:#fafafa;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;">€ ${p.gesamtpreis?.toFixed(2)}</td>
      </tr>
    `).join("");

    const { data: sendData, error: sendError } = await resend.emails.send({
      from: `${companyName} <onboarding@resend.dev>`,
      to: [to],
      subject: `Angebot ${angebot.number} — ${companyName}`,
      attachments: [{
        filename: `Angebot_${angebot.number}.pdf`,
        content: pdfBase64,
      }],
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#18181b;border-radius:12px;overflow:hidden;border:1px solid #27272a;">

        <!-- Header -->
        <tr><td style="padding:28px 32px 20px;background:#18181b;">
          <div style="font-size:20px;font-weight:700;color:#fafafa;letter-spacing:-0.3px;">${companyName}</div>
          <div style="margin-top:4px;font-size:12px;color:#a1a1aa;">ANGBOT ${angebot.number} · ${new Date(angebot.createdAt).toLocaleDateString("de-AT")}</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:0 32px 28px;background:#18181b;">

          <p style="margin:0 0 20px;font-size:14px;color:#d4d4d8;line-height:1.6;">Sehr geehrte Damen und Herren,</p>
          <p style="margin:0 0 24px;font-size:14px;color:#d4d4d8;line-height:1.6;">vielen Dank für Ihre Anfrage. Anbei übermitteln wir Ihnen unser Angebot <strong style="color:#fafafa;">Nr. ${angebot.number}</strong> mit einer detaillierten Aufstellung der Leistungen.</p>

          <!-- Positions -->
          ${positions && positions.length > 0 ? `
          <h3 style="margin:0 0 12px;font-size:11px;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Positionen</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="padding:6px 0;font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Pos.</td>
              <td style="padding:6px 0;font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Beschreibung</td>
              <td style="padding:6px 0;font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Menge</td>
              <td style="padding:6px 0;font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Gesamt</td>
            </tr>
            ${positionsRows}
            ${positions.length > 6 ? `<tr><td colspan="4" style="padding:8px 0;font-size:11px;color:#71717a;">+ ${positions.length - 6} weitere Positionen — siehe PDF-Anhang</td></tr>` : ""}
          </table>
          ` : ""}

          <!-- Total -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;border-radius:8px;padding:16px;margin-bottom:20px;">
            <tr><td>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:3px 16px;font-size:13px;color:#a1a1aa;">Zwischensumme (netto)</td><td style="padding:3px 16px;font-size:13px;color:#d4d4d8;text-align:right;font-variant-numeric:tabular-nums;">€ ${angebot.subtotalNet?.toFixed(2)}</td></tr>
                <tr><td style="padding:3px 16px;font-size:13px;color:#a1a1aa;">+ ${angebot.mwstRate}% MwSt</td><td style="padding:3px 16px;font-size:13px;color:#d4d4d8;text-align:right;font-variant-numeric:tabular-nums;">€ ${angebot.mwstTotal?.toFixed(2)}</td></tr>
                <tr><td colspan="2" style="padding:8px 16px 0;"><hr style="border:none;border-top:1px solid #27272a;margin:0;"></td></tr>
                <tr><td style="padding:8px 16px 3px;font-size:16px;font-weight:700;color:#fafafa;">Gesamtbetrag</td><td style="padding:8px 16px 3px;font-size:16px;font-weight:700;color:#fafafa;text-align:right;font-variant-numeric:tabular-nums;">€ ${angebot.totalGross?.toFixed(2)}</td></tr>
              </table>
            </td></tr>
          </table>

          <!-- Legal -->
          <div style="margin-bottom:20px;font-size:11px;color:#71717a;line-height:1.6;">
            <strong style="color:#a1a1aa;">Zahlungsbedingungen:</strong> ${angebot.zahlungsbedingungen ?? "30 Tage netto"}<br>
            <strong style="color:#a1a1aa;">Gewährleistung:</strong> ${angebot.gewaehrleistung ?? "3 Jahre gemäß § 933 ABGB"}<br>
            <strong style="color:#a1a1aa;">Gültigkeit:</strong> 30 Tage
          </div>

          <p style="margin:0 0 4px;font-size:14px;color:#d4d4d8;line-height:1.6;">Das vollständige Angebot finden Sie im <strong style="color:#fafafa;">PDF-Anhang</strong>.</p>
          <p style="margin:0 0 20px;font-size:14px;color:#d4d4d8;line-height:1.6;">Bei Fragen stehen wir gerne zur Verfügung.</p>
          <p style="margin:0;font-size:14px;color:#d4d4d8;">Mit freundlichen Grüßen<br><strong style="color:#fafafa;">${companyName}</strong></p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:16px 32px;background:#09090b;border-top:1px solid #27272a;">
          <p style="margin:0;font-size:10px;color:#52525b;">Erstellt mit AngebotPro — KI-gestützte Angebotserstellung</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    if (sendError) {
      console.error("Resend error:", JSON.stringify(sendError));
      return NextResponse.json({ error: sendError.message || "Email send failed" }, { status: 500 });
    }

    console.log("Email sent:", sendData?.id);

    await adminClient.from("Angebot").update({ status: "sent", sentAt: new Date().toISOString() }).eq("id", id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}

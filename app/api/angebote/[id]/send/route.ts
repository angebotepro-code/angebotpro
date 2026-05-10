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
    const { to, acknowledgment } = await request.json();
    if (!to?.includes("@")) return NextResponse.json({ error: "Valid recipient email required" }, { status: 422 });

    const adminClient = createAdminClient();

    const { data: angebot, error } = await adminClient.from("Angebot").select("*").eq("id", id).single();
    if (error || !angebot) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: company } = await adminClient.from("Company").select("*").eq("id", angebot.companyId).single();
    const companyName = company?.name ?? "Werkit";

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
        <td style="padding:12px 8px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;white-space:nowrap;">Pos.${p.pos}</td>
        <td style="padding:12px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111827;">${p.beschreibung?.slice(0, 80)}${p.beschreibung?.length > 80 ? "…" : ""}</td>
        <td style="padding:12px 8px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#6b7280;text-align:right;white-space:nowrap;">${p.menge} ${p.einheit}</td>
        <td style="padding:12px 12px;border-bottom:1px solid #f3f4f6;font-size:13px;color:#111827;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;">€ ${p.gesamtpreis?.toFixed(2)}</td>
      </tr>
    `).join("");

    const isAck = !!acknowledgment;

    const { data: sendData, error: sendError } = await resend.emails.send({
      from: `${companyName} <onboarding@resend.dev>`,
      to: [to],
      subject: isAck
        ? `Auftragsbestätigung — Angebot ${angebot.number} wurde angenommen`
        : `Angebot ${angebot.number} — ${companyName}`,
      attachments: [{
        filename: `Angebot_${angebot.number}.pdf`,
        content: pdfBase64,
      }],
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
    <tr><td align="center">
      <table width="800" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

        <!-- Header -->
        <tr><td style="padding:40px 48px 28px;">
          <div style="font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.3px;">${companyName}</div>
          <div style="margin-top:4px;font-size:13px;color:#9ca3af;">ANGBOT ${angebot.number} · ${new Date(angebot.createdAt).toLocaleDateString("de-AT")}</div>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:0 48px;"><div style="border-bottom:1px solid #f3f4f6;"></div></td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 48px 40px;">

          <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">Sehr geehrte Damen und Herren,</p>
          <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">${isAck
            ? `vielen Dank für die Annahme unseres Angebots <strong style="color:#111827;">Nr. ${angebot.number}</strong>. Wir bestätigen hiermit den Auftrag und werden die Arbeiten wie besprochen durchführen.`
            : `vielen Dank für Ihre Anfrage. Anbei übermitteln wir Ihnen unser Angebot <strong style="color:#111827;">Nr. ${angebot.number}</strong> mit einer detaillierten Aufstellung der Leistungen.`
          }</p>

          <!-- Positions -->
          ${positions && positions.length > 0 ? `
          <h3 style="margin:0 0 12px;font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Positionen</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="padding:8px 8px;font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Pos.</td>
              <td style="padding:8px 12px;font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Beschreibung</td>
              <td style="padding:8px 8px;font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Menge</td>
              <td style="padding:8px 12px;font-size:10px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Gesamt</td>
            </tr>
            ${positionsRows}
            ${positions.length > 6 ? `<tr><td colspan="4" style="padding:10px 0;font-size:12px;color:#9ca3af;">+ ${positions.length - 6} weitere Positionen — siehe PDF-Anhang</td></tr>` : ""}
          </table>
          ` : ""}

          <!-- Total Card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:8px;margin-bottom:20px;">
            <tr><td style="padding:16px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding:3px 0;font-size:14px;color:#6b7280;">Zwischensumme (netto)</td><td style="padding:3px 0;font-size:14px;color:#374151;text-align:right;font-variant-numeric:tabular-nums;">€ ${angebot.subtotalNet?.toFixed(2)}</td></tr>
                <tr><td style="padding:3px 0;font-size:14px;color:#6b7280;">+ ${angebot.mwstRate}% MwSt</td><td style="padding:3px 0;font-size:14px;color:#374151;text-align:right;font-variant-numeric:tabular-nums;">€ ${angebot.mwstTotal?.toFixed(2)}</td></tr>
                <tr><td colspan="2" style="padding:10px 0 0;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"></td></tr>
                <tr><td style="padding:10px 0 0;font-size:18px;font-weight:700;color:#111827;">Gesamtbetrag</td><td style="padding:10px 0 0;font-size:18px;font-weight:700;color:#111827;text-align:right;font-variant-numeric:tabular-nums;">€ ${angebot.totalGross?.toFixed(2)}</td></tr>
              </table>
            </td></tr>
          </table>

          <!-- Legal -->
          <div style="margin-bottom:20px;font-size:12px;color:#9ca3af;line-height:1.8;">
            <strong style="color:#6b7280;">Zahlungsbedingungen:</strong> ${angebot.zahlungsbedingungen ?? "30 Tage netto"}<br>
            <strong style="color:#6b7280;">Gewährleistung:</strong> ${angebot.gewaehrleistung ?? "3 Jahre gemäß § 933 ABGB"}<br>
            <strong style="color:#6b7280;">Gültigkeit:</strong> 30 Tage
          </div>

          <p style="margin:0 0 4px;font-size:14px;color:#6b7280;line-height:1.7;">Das vollständige Angebot finden Sie im <strong style="color:#111827;">PDF-Anhang</strong>.</p>
          <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.7;">Bei Fragen stehen wir gerne zur Verfügung.</p>

          <!-- Signing CTA -->
          ${!isAck ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td align="center" style="background:#f0fdf4;border-radius:10px;padding:20px 24px;border:1px solid #bbf7d0;">
              <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#166534;">Angebot online annehmen</p>
              <p style="margin:0 0 16px;font-size:13px;color:#15803d;line-height:1.5;">Kein Ausdrucken, kein Scannen — einfach klicken und digital unterschreiben.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://angebotpro.vercel.app"}/sign/${angebot.id}" style="display:inline-block;background:#16a34a;color:#ffffff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Angebot annehmen →</a>
            </td></tr>
          </table>
          ` : ""}

          <p style="margin:0;font-size:14px;color:#374151;">Mit freundlichen Grüßen<br><strong style="color:#111827;">${companyName}</strong></p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:16px 48px;background:#f9fafb;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:11px;color:#d1d5db;">Erstellt mit Werkit — KI-gestützte Angebotserstellung</p>
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

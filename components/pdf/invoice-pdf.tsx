import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 48, fontFamily: "Helvetica", fontSize: 10, color: "#1a1a1a" },
  header: { marginBottom: 24, borderBottom: "2px solid #111827", paddingBottom: 18 },
  companyName: { fontSize: 18, fontFamily: "Helvetica-Bold", color: "#111827", marginBottom: 4 },
  companyInfo: { fontSize: 9, color: "#6b7280", lineHeight: 1.5 },
  titleBlock: { marginBottom: 24 },
  label: { fontSize: 10, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  docNumber: { fontSize: 20, fontFamily: "Helvetica-Bold", color: "#111827", marginBottom: 2 },
  docMeta: { fontSize: 9, color: "#9ca3af", marginBottom: 12, lineHeight: 1.6 },
  customerBox: { marginBottom: 24, backgroundColor: "#f9fafb", padding: 14, borderRadius: 4, border: "1px solid #e5e7eb" },
  customerLabel: { fontSize: 8, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  customerName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: "#111827" },
  customerAddress: { fontSize: 9, color: "#6b7280", marginTop: 2 },
  greeting: { fontSize: 10, lineHeight: 1.7, color: "#374151", marginBottom: 24 },
  table: { marginBottom: 24 },
  tableHeader: { flexDirection: "row", backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb", borderTop: "1px solid #e5e7eb", paddingVertical: 6, paddingHorizontal: 10 },
  th: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 },
  tableRow: { flexDirection: "row", borderBottom: "1px solid #f3f4f6", paddingVertical: 7, paddingHorizontal: 10 },
  posCol: { width: 32 },
  descCol: { flex: 1, paddingRight: 10 },
  qtyCol: { width: 44, textAlign: "right" },
  unitCol: { width: 56, textAlign: "center" },
  priceCol: { width: 64, textAlign: "right" },
  totalCol: { width: 74, textAlign: "right" },
  posNum: { fontSize: 9, color: "#d1d5db", fontFamily: "Helvetica-Bold" },
  posDesc: { fontSize: 9.5, lineHeight: 1.4, color: "#1f2937" },
  posQty: { fontSize: 9, textAlign: "right", color: "#6b7280" },
  posUnit: { fontSize: 8.5, textAlign: "center", color: "#9ca3af" },
  posPrice: { fontSize: 9, textAlign: "right", color: "#1f2937" },
  posTotal: { fontSize: 9, textAlign: "right", color: "#111827", fontFamily: "Helvetica-Bold" },
  totalsSection: { marginBottom: 20, alignItems: "flex-end" },
  totalsBox: { width: 240, backgroundColor: "#f9fafb", padding: 12, borderRadius: 4, border: "1px solid #e5e7eb" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  totalLabel: { fontSize: 9, color: "#6b7280" },
  totalValue: { fontSize: 9, color: "#374151", fontFamily: "Helvetica-Bold" },
  grandTotal: { flexDirection: "row", justifyContent: "space-between", paddingTop: 8, marginTop: 6, borderTop: "1px solid #d1d5db" },
  grandTotalLabel: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#111827" },
  grandTotalValue: { fontSize: 12, fontFamily: "Helvetica-Bold", color: "#111827" },
  legalSection: { marginBottom: 20, padding: 10, backgroundColor: "#f9fafb", borderRadius: 4, border: "1px solid #e5e7eb" },
  legalRow: { flexDirection: "row", marginBottom: 4 },
  legalLabel: { fontSize: 8, color: "#9ca3af", width: 120 },
  legalValue: { fontSize: 8.5, color: "#374151", flex: 1 },
  bankSection: { marginBottom: 20, padding: 10, borderRadius: 4 },
  bankLabel: { fontSize: 8, color: "#9ca3af", width: 120 },
  bankValue: { fontSize: 8.5, color: "#374151", flex: 1 },
  closing: { fontSize: 10, lineHeight: 1.7, color: "#374151", marginTop: 8 },
});

interface InvoicePDFProps {
  company?: { name: string; address: string; uidNumber: string; phone: string; email: string; bankName?: string; iban?: string; bic?: string; };
  invoice: {
    number: string; status: string;
    einleitung: string; positions: { pos: number; beschreibung: string; menge: number; einheit: string; einzelpreis: number; gesamtpreis: number; }[];
    subtotalNet: number; mwstRate: number; mwstTotal: number; totalGross: number;
    zahlungsbedingungen: string; leistungsdatum?: string; skonto?: string;
    issuedAt: string; dueAt: string;
    customerName?: string; customerAddress?: string; customerUid?: string;
    schlussformel: string;
  };
}

export function InvoicePDF({ company, invoice }: InvoicePDFProps) {
  const c = company ?? { name: "Musterfirma GmbH", address: "Musterstraße 1, 4020 Linz", uidNumber: "ATU12345678", phone: "+43 732 123456", email: "office@musterfirma.at" };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header} wrap={false}>
          <Text style={styles.companyName}>{c.name}</Text>
          <Text style={styles.companyInfo}>
            {c.address}{"\n"}{c.phone} · {c.email}{"\n"}UID: {c.uidNumber}
          </Text>
        </View>

        <View style={styles.titleBlock} wrap={false}>
          <Text style={styles.label}>RECHNUNG</Text>
          <Text style={styles.docNumber}>Nr. {invoice.number}</Text>
          <Text style={styles.docMeta}>
            Rechnungsdatum: {invoice.issuedAt}{"\n"}
            Fällig am: {invoice.dueAt}{"\n"}
            {invoice.leistungsdatum ? `Leistungsdatum: ${invoice.leistungsdatum}` : ""}
          </Text>
        </View>

        <View style={styles.customerBox} wrap={false}>
          <Text style={styles.customerLabel}>Kunde</Text>
          <Text style={styles.customerName}>{invoice.customerName ?? "—"}</Text>
          {invoice.customerAddress && <Text style={styles.customerAddress}>{invoice.customerAddress}</Text>}
          {invoice.customerUid && <Text style={styles.customerAddress}>UID: {invoice.customerUid}</Text>}
        </View>

        <Text style={styles.greeting}>{invoice.einleitung}</Text>

        <View wrap={false}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.posCol]}>Pos.</Text>
            <Text style={[styles.th, styles.descCol]}>Beschreibung</Text>
            <Text style={[styles.th, styles.qtyCol]}>Menge</Text>
            <Text style={[styles.th, styles.unitCol]}>Einheit</Text>
            <Text style={[styles.th, styles.priceCol]}>E-Preis</Text>
            <Text style={[styles.th, styles.totalCol]}>G-Preis</Text>
          </View>
          {invoice.positions.map((p, i) => (
            <View style={[styles.tableRow, i % 2 ? { backgroundColor: "#fafafa" } : {}]} key={p.pos} wrap={false}>
              <Text style={[styles.posNum, styles.posCol]}>{p.pos}</Text>
              <Text style={[styles.posDesc, styles.descCol]}>{p.beschreibung}</Text>
              <Text style={[styles.posQty, styles.qtyCol]}>{p.menge}</Text>
              <Text style={[styles.posUnit, styles.unitCol]}>{p.einheit}</Text>
              <Text style={[styles.posPrice, styles.priceCol]}>{p.einzelpreis.toFixed(2)}</Text>
              <Text style={[styles.posTotal, styles.totalCol]}>{p.gesamtpreis.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsSection} wrap={false}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}><Text style={styles.totalLabel}>Nettobetrag</Text><Text style={styles.totalValue}>€ {invoice.subtotalNet.toFixed(2)}</Text></View>
            <View style={styles.totalRow}><Text style={styles.totalLabel}>+ {invoice.mwstRate}% Umsatzsteuer</Text><Text style={styles.totalValue}>€ {invoice.mwstTotal.toFixed(2)}</Text></View>
            <View style={styles.grandTotal}><Text style={styles.grandTotalLabel}>Gesamtbetrag</Text><Text style={styles.grandTotalValue}>€ {invoice.totalGross.toFixed(2)}</Text></View>
          </View>
        </View>

        <View style={styles.legalSection} wrap={false}>
          {invoice.zahlungsbedingungen && <View style={styles.legalRow}><Text style={styles.legalLabel}>Zahlungsbedingungen</Text><Text style={styles.legalValue}>{invoice.zahlungsbedingungen}</Text></View>}
          {invoice.skonto && <View style={styles.legalRow}><Text style={styles.legalLabel}>Skonto</Text><Text style={styles.legalValue}>{invoice.skonto}</Text></View>}
        </View>

        {(c.iban || c.bankName) && (
          <View style={styles.bankSection} wrap={false}>
            <Text style={{ fontSize: 8, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4, fontFamily: "Helvetica-Bold" }}>Bankverbindung</Text>
            {c.bankName && <View style={{ flexDirection: "row", marginBottom: 2 }}><Text style={styles.bankLabel}>Bank</Text><Text style={styles.bankValue}>{c.bankName}</Text></View>}
            {c.iban && <View style={{ flexDirection: "row", marginBottom: 2 }}><Text style={styles.bankLabel}>IBAN</Text><Text style={styles.bankValue}>{c.iban}</Text></View>}
            {c.bic && <View style={{ flexDirection: "row", marginBottom: 2 }}><Text style={styles.bankLabel}>BIC</Text><Text style={styles.bankValue}>{c.bic}</Text></View>}
            <View style={{ flexDirection: "row", marginBottom: 2 }}><Text style={styles.bankLabel}>Verwendungszweck</Text><Text style={[styles.bankValue, { fontFamily: "Helvetica-Bold" }]}>RE-{invoice.number}</Text></View>
          </View>
        )}

        <Text style={styles.closing}>{invoice.schlussformel}</Text>

        <Text style={{ position: "absolute", bottom: 24, left: 48, right: 48, fontSize: 7, color: "#d1d5db", textAlign: "center", borderTop: "1px solid #f3f4f6", paddingTop: 6 }}>
          Erstellt mit AngebotPro — KI-gestützte Angebotserstellung
        </Text>
      </Page>
    </Document>
  );
}

export async function generateInvoicePDF(props: InvoicePDFProps): Promise<Buffer> {
  return await renderToBuffer(<InvoicePDF {...props} />);
}

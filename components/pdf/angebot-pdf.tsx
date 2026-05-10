import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111827",
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 16,
    paddingBottom: 18,
    borderBottom: "2px solid #111827",
  },
  companyName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  companyInfo: {
    fontSize: 9,
    color: "#6b7280",
    lineHeight: 1.6,
  },
  titleBlock: {
    marginBottom: 22,
  },
  quoteLabel: {
    fontSize: 8,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  quoteNumber: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 4,
  },
  quoteMeta: {
    fontSize: 9,
    color: "#9ca3af",
    marginBottom: 16,
  },
  customerBox: {
    marginBottom: 22,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 6,
    border: "1px solid #e5e7eb",
  },
  customerLabel: {
    fontSize: 8,
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  customerName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    marginBottom: 4,
  },
  greeting: {
    fontSize: 10.5,
    lineHeight: 1.7,
    color: "#374151",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    borderTop: "1px solid #e5e7eb",
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tableHeaderCell: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #f3f4f6",
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottom: "1px solid #f3f4f6",
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: "#fafafa",
  },
  posCol: { width: 40 },
  descCol: { flex: 1, paddingRight: 12 },
  qtyCol: { width: 50, textAlign: "right" },
  unitCol: { width: 64, textAlign: "center" },
  priceCol: { width: 72, textAlign: "right" },
  totalCol: { width: 80, textAlign: "right" },
  posNum: { fontSize: 9, color: "#d1d5db", fontFamily: "Helvetica-Bold" },
  posDesc: { fontSize: 9.5, lineHeight: 1.5, color: "#1f2937" },
  posQty: { fontSize: 9, textAlign: "right", color: "#6b7280" },
  posUnit: { fontSize: 8.5, textAlign: "center", color: "#9ca3af" },
  posPrice: { fontSize: 9, textAlign: "right", color: "#1f2937" },
  posTotal: { fontSize: 9, textAlign: "right", color: "#111827", fontFamily: "Helvetica-Bold" },
  totalsSection: {
    marginBottom: 20,
    alignItems: "flex-end",
  },
  totalsBox: {
    width: 240,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 6,
    border: "1px solid #e5e7eb",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 9.5,
    color: "#6b7280",
  },
  totalValue: {
    fontSize: 9.5,
    color: "#374151",
    fontFamily: "Helvetica-Bold",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
    marginTop: 8,
    borderTop: "1px solid #d1d5db",
  },
  grandTotalLabel: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  grandTotalValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  legalSection: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 6,
    border: "1px solid #e5e7eb",
  },
  legalRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  legalLabel: {
    fontSize: 8.5,
    color: "#9ca3af",
    width: 130,
    fontFamily: "Helvetica-Bold",
  },
  legalValue: {
    fontSize: 8.5,
    color: "#374151",
    flex: 1,
  },
  closing: {
    fontSize: 10.5,
    lineHeight: 1.7,
    color: "#374151",
    marginBottom: 48,
  },
  footer: {
    position: "absolute",
    bottom: 36,
    left: 56,
    right: 56,
    borderTop: "1px solid #e5e7eb",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 7,
    color: "#d1d5db",
    textAlign: "center",
  },
  signatureSection: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "#f0fdf4",
    borderRadius: 6,
    border: "1px solid #bbf7d0",
  },
  signatureText: {
    fontSize: 9,
    color: "#166534",
    lineHeight: 1.6,
  },
});

interface AngebotPDFProps {
  company?: {
    name: string;
    address: string;
    uidNumber: string;
    phone: string;
    email: string;
  };
  angebot: {
    number: string;
    date: string;
    einleitung: string;
    positionen: {
      pos: number;
      beschreibung: string;
      menge: number;
      einheit: string;
      einzelpreis: number;
      gesamtpreis: number;
    }[];
    subtotalNet: number;
    mwstRate: number;
    mwstTotal: number;
    totalGross: number;
    zahlungsbedingungen: string;
    gewaehrleistung: string;
    schlussformel: string;
  };
  acceptedByName?: string;
  acceptedAt?: string;
}

export function AngebotPDF({ company, angebot, acceptedByName, acceptedAt }: AngebotPDFProps) {
  const c = company ?? {
    name: "Musterfirma GmbH",
    address: "Musterstraße 1, 4020 Linz",
    uidNumber: "ATU12345678",
    phone: "+43 732 123456",
    email: "office@musterfirma.at",
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} wrap={false}>
          <Text style={styles.companyName}>{c.name}</Text>
          <Text style={styles.companyInfo}>
            {c.address}{"\n"}
            {c.phone} · {c.email}{"\n"}
            UID: {c.uidNumber}
          </Text>
        </View>

        <View style={styles.titleBlock} wrap={false}>
          <Text style={styles.quoteLabel}>Angebot</Text>
          <Text style={styles.quoteNumber}>Nr. {angebot.number}</Text>
          <Text style={styles.quoteMeta}>
            Erstellt am {angebot.date} · Gültig bis:{" "}
            {new Date(new Date(angebot.date.split(".").reverse().join("-")).getTime() + 30 * 86400000).toLocaleDateString("de-AT")}
          </Text>
        </View>

        <View style={styles.customerBox} wrap={false}>
          <Text style={styles.customerLabel}>Kunde</Text>
          <Text style={styles.customerName}>—</Text>
        </View>

        {/* Greeting */}
        <Text style={styles.greeting}>{angebot.einleitung}</Text>

        {/* Positions */}
        <Text style={styles.sectionTitle}>Leistungsumfang</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[{ ...styles.tableHeaderCell }, styles.posCol]}>Pos.</Text>
            <Text style={[{ ...styles.tableHeaderCell }, styles.descCol]}>Beschreibung</Text>
            <Text style={[{ ...styles.tableHeaderCell }, styles.qtyCol]}>Menge</Text>
            <Text style={[{ ...styles.tableHeaderCell }, styles.unitCol]}>Einheit</Text>
            <Text style={[{ ...styles.tableHeaderCell }, styles.priceCol]}>E-Preis</Text>
            <Text style={[{ ...styles.tableHeaderCell }, styles.totalCol]}>G-Preis</Text>
          </View>
          {(angebot.positionen ?? []).map((p, i) => (
            <View style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt} key={p.pos} wrap={false}>
              <Text style={[{ ...styles.posNum }, styles.posCol]}>{p.pos}</Text>
              <Text style={[{ ...styles.posDesc }, styles.descCol]}>{p.beschreibung}</Text>
              <Text style={[{ ...styles.posQty }, styles.qtyCol]}>{p.menge}</Text>
              <Text style={[{ ...styles.posUnit }, styles.unitCol]}>{p.einheit}</Text>
              <Text style={[{ ...styles.posPrice }, styles.priceCol]}>{p.einzelpreis.toFixed(2)}</Text>
              <Text style={[{ ...styles.posTotal }, styles.totalCol]}>{p.gesamtpreis.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection} wrap={false}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Zwischensumme (netto)</Text>
              <Text style={styles.totalValue}>€ {angebot.subtotalNet.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>+ {angebot.mwstRate}% Umsatzsteuer</Text>
              <Text style={styles.totalValue}>€ {angebot.mwstTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.grandTotal}>
              <Text style={styles.grandTotalLabel}>Gesamtbetrag brutto</Text>
              <Text style={styles.grandTotalValue}>€ {angebot.totalGross.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.legalSection} wrap={false}>
          <View style={styles.legalRow}>
            <Text style={styles.legalLabel}>Zahlungsbedingungen</Text>
            <Text style={styles.legalValue}>{angebot.zahlungsbedingungen ?? "30 Tage netto"}</Text>
          </View>
          <View style={styles.legalRow}>
            <Text style={styles.legalLabel}>Gewährleistung</Text>
            <Text style={styles.legalValue}>{angebot.gewaehrleistung ?? "3 Jahre gemäß § 933 ABGB"}</Text>
          </View>
          <View style={styles.legalRow}>
            <Text style={styles.legalLabel}>Gültigkeit</Text>
            <Text style={styles.legalValue}>30 Tage ab Angebotsdatum</Text>
          </View>
          <View style={styles.legalRow}>
            <Text style={styles.legalLabel}>Angebotstyp</Text>
            <Text style={styles.legalValue}>Unverbindliches Angebot</Text>
          </View>
        </View>

        {/* Acceptance */}
        {acceptedByName && (
          <View style={styles.signatureSection}>
            <Text style={styles.signatureText}>
              ✓ Dieses Angebot wurde angenommen von: {acceptedByName}
              {acceptedAt ? ` am ${new Date(acceptedAt).toLocaleDateString("de-AT")}` : ""}
            </Text>
          </View>
        )}

        {/* Closing */}
        <Text style={styles.closing}>{angebot.schlussformel}</Text>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Erstellt mit Werkit · KI-unterstützt erstellt und vom Ersteller geprüft
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generatePDF(props: AngebotPDFProps): Promise<Buffer> {
  const doc = <AngebotPDF {...props} />;
  return await renderToBuffer(doc);
}

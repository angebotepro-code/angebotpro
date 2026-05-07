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
    padding: 50,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
  },
  header: {
    marginBottom: 30,
    borderBottom: "2px solid #059669",
    paddingBottom: 15,
  },
  companyName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#059669",
    marginBottom: 4,
  },
  companyInfo: {
    fontSize: 9,
    color: "#666",
    lineHeight: 1.4,
  },
  titleSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 8,
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  quoteNumber: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  date: {
    fontSize: 9,
    color: "#666",
    marginBottom: 20,
  },
  customerSection: {
    marginBottom: 25,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
  },
  customerName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  customerAddress: {
    fontSize: 9,
    color: "#333",
  },
  greeting: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 20,
  },
  positionTable: {
    marginBottom: 25,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: 6,
    marginBottom: 8,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#999",
    textTransform: "uppercase",
  },
  posCol: { width: 40 },
  descCol: { flex: 1 },
  qtyCol: { width: 50, textAlign: "right" },
  unitCol: { width: 60, textAlign: "center" },
  priceCol: { width: 70, textAlign: "right" },
  totalCol: { width: 80, textAlign: "right" },
  positionRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottom: "1px solid #f1f5f9",
  },
  posText: { fontSize: 9, color: "#999" },
  descText: { fontSize: 9, lineHeight: 1.4 },
  qtyText: { fontSize: 9, textAlign: "right" },
  unitText: { fontSize: 9, textAlign: "center", color: "#666" },
  priceText: { fontSize: 9, textAlign: "right" },
  totalsSection: {
    marginBottom: 25,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    width: 220,
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 9,
    color: "#666",
  },
  totalValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  grandTotal: {
    flexDirection: "row",
    width: 220,
    justifyContent: "space-between",
    paddingVertical: 6,
    marginTop: 4,
    borderTop: "2px solid #059669",
  },
  grandTotalLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  grandTotalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#059669",
  },
  legalSection: {
    marginBottom: 20,
    paddingTop: 12,
    borderTop: "1px solid #e2e8f0",
  },
  legalText: {
    fontSize: 8,
    color: "#666",
    lineHeight: 1.6,
  },
  closing: {
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 30,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    fontSize: 7,
    color: "#ccc",
    textAlign: "center",
    borderTop: "1px solid #f1f5f9",
    paddingTop: 8,
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
}

export function AngebotPDF({ company, angebot }: AngebotPDFProps) {
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
        <View style={styles.header}>
          <Text style={styles.companyName}>{c.name}</Text>
          <Text style={styles.companyInfo}>
            {c.address}{"\n"}
            Tel: {c.phone} | {c.email}{"\n"}
            UID: {c.uidNumber}
          </Text>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.label}>Angebot</Text>
          <Text style={styles.quoteNumber}>Nr. {angebot.number}</Text>
          <Text style={styles.date}>
            Datum: {angebot.date} | Gültig bis: 30 Tage
          </Text>
        </View>

        {/* Customer address (placeholder for now) */}
        <View style={styles.customerSection}>
          <Text style={styles.customerName}>Kunde</Text>
          <Text style={styles.customerAddress}>
            Adresse wird hier eingefügt
          </Text>
        </View>

        {/* Greeting */}
        <Text style={styles.greeting}>{angebot.einleitung}</Text>

        {/* Position table */}
        <View style={styles.positionTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.posCol]}>Pos.</Text>
            <Text style={[styles.tableHeaderCell, styles.descCol]}>
              Beschreibung
            </Text>
            <Text style={[styles.tableHeaderCell, styles.qtyCol]}>Menge</Text>
            <Text style={[styles.tableHeaderCell, styles.unitCol]}>
              Einheit
            </Text>
            <Text style={[styles.tableHeaderCell, styles.priceCol]}>
              Einzel (€)
            </Text>
            <Text style={[styles.tableHeaderCell, styles.totalCol]}>
              Gesamt (€)
            </Text>
          </View>
          {(angebot.positionen ?? []).map((p) => (
            <View style={styles.positionRow} key={p.pos} wrap={false}>
              <Text style={[styles.posText, styles.posCol]}>{p.pos}</Text>
              <Text style={[styles.descText, styles.descCol]}>
                {p.beschreibung}
              </Text>
              <Text style={[styles.qtyText, styles.qtyCol]}>{p.menge}</Text>
              <Text style={[styles.unitText, styles.unitCol]}>{p.einheit}</Text>
              <Text style={[styles.priceText, styles.priceCol]}>
                {p.einzelpreis.toFixed(2)}
              </Text>
              <Text style={[styles.priceText, styles.totalCol]}>
                {p.gesamtpreis.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Zwischensumme netto</Text>
            <Text style={styles.totalValue}>
              € {angebot.subtotalNet.toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              + {angebot.mwstRate}% MwSt
            </Text>
            <Text style={styles.totalValue}>
              € {angebot.mwstTotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Gesamtbetrag brutto</Text>
            <Text style={styles.grandTotalValue}>
              € {angebot.totalGross.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.legalSection}>
          <Text style={styles.legalText}>
            Zahlungsbedingungen: {angebot.zahlungsbedingungen}
            {"\n"}
            Gewährleistung: {angebot.gewaehrleistung}
            {"\n"}
            Dieses Angebot ist unverbindlich und 30 Tage gültig.
          </Text>
        </View>

        {/* Closing */}
        <Text style={styles.closing}>{angebot.schlussformel}</Text>

        {/* Footer */}
        <Text style={styles.footer}>
          Erstellt mit AngebotPro — KI-gestützte Angebotserstellung
        </Text>
      </Page>
    </Document>
  );
}

export async function generatePDF(props: AngebotPDFProps): Promise<Buffer> {
  const doc = <AngebotPDF {...props} />;
  return await renderToBuffer(doc);
}

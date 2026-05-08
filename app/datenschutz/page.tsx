export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Datenschutzerklärung</h1>

        <p className="text-zinc-400 leading-relaxed mb-6">
          Der Schutz Ihrer personenbezogenen Daten ist uns ein besonderes
          Anliegen. Wir verarbeiten Ihre Daten ausschließlich auf Grundlage der
          gesetzlichen Bestimmungen (DSGVO, DSG, TKG 2021).
        </p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          1. Verantwortlicher
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          [Your Full Name]
          <br />
          [Your Address]
          <br />
          E-Mail: [your-email]@angebotpro.at
        </p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          2. Welche Daten wir verarbeiten
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          Im Rahmen der Nutzung von AngebotPro verarbeiten wir folgende
          personenbezogene Daten:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-zinc-400 mt-2">
          <li>
            <strong>Stammdaten:</strong> E-Mail-Adresse, Firmenname, Adresse,
            UID-Nummer, Telefonnummer (bei Angabe)
          </li>
          <li>
            <strong>Nutzungsdaten:</strong> Erstellte Angebote,
            Angebotsinhalte, Zeitstempel der Erstellung und Versendung
          </li>
          <li>
            <strong>Technische Daten:</strong> IP-Adresse, Browsertyp, Zugriffszeiten
            (Server-Logfiles)
          </li>
        </ul>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          3. Zweck und Rechtsgrundlage
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          Die Verarbeitung erfolgt zu folgenden Zwecken:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-zinc-400 mt-2">
          <li>
            <strong>Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO):</strong>{" "}
            Bereitstellung der SaaS-Plattform, Erstellung und Speicherung von
            Angeboten, E-Mail-Versand
          </li>
          <li>
            <strong>Berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO):</strong>{" "}
            Server-Logfiles zur Fehleranalyse und Sicherheit
          </li>
        </ul>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          4. KI-gestützte Verarbeitung
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          Zur Erstellung von Angeboten nutzen wir KI-Dienste (Large Language
          Models). Die von Ihnen eingegebenen Auftragsbeschreibungen werden an
          folgende Dienstleister übermittelt:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-zinc-400 mt-2">
          <li>
            <strong>OpenAI (OpenAI Ireland Ltd., Dublin):</strong>{" "}
            Verarbeitung in der EU (Microsoft Azure EU-Rechenzentren). Es besteht
            ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO.
          </li>
          <li>
            <strong>DeepSeek (Hangzhou DeepSeek Artificial Intelligence Co., Ltd., China):</strong>{" "}
            Derzeit für Entwicklungs-/Testzwecke. Bei produktiver Nutzung mit
            DeepSeek werden Ihre Daten in die Volksrepublik China übermittelt.
            Es besteht{" "}
            <strong className="text-red-400">
              kein Angemessenheitsbeschluss der EU-Kommission
            </strong>{" "}
            für China. Eine Übermittlung erfolgt ausschließlich auf Grundlage
            Ihrer ausdrücklichen Einwilligung (Art. 49 Abs. 1 lit. a DSGVO).
          </li>
        </ul>
        <p className="text-zinc-400 leading-relaxed mt-2">
          <strong className="text-zinc-300">Empfehlung:</strong> Wir empfehlen
          die Nutzung von OpenAI für die produktive Angebotserstellung, da die
          Verarbeitung in der EU erfolgt. DeepSeek wird nur für Testzwecke
          unterstützt.
        </p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          5. Speicherdauer
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          Ihre Daten werden gespeichert, solange Ihr Konto aktiv ist. Nach
          Kündigung werden Ihre Daten innerhalb von 30 Tagen gelöscht, sofern
          keine gesetzlichen Aufbewahrungspflichten (z.B. § 132 BAO — 7 Jahre
          für steuerrelevante Daten) entgegenstehen. Server-Logfiles werden
          nach 30 Tagen gelöscht.
        </p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          6. Ihre Rechte
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          Sie haben jederzeit das Recht auf:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-zinc-400 mt-2">
          <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
          <li>
            Einschränkung der Verarbeitung (Art. 18 DSGVO)
          </li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
        </ul>
        <p className="text-zinc-400 leading-relaxed mt-2">
          Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter{" "}
          [your-email]@angebotpro.at.
        </p>
        <p className="text-zinc-400 leading-relaxed mt-2">
          Sie haben außerdem das Recht auf Beschwerde bei der zuständigen
          Aufsichtsbehörde:
          <br />
          <strong>Österreichische Datenschutzbehörde</strong>
          <br />
          Barichgasse 40–42, 1030 Wien
          <br />
          E-Mail: dsb@dsb.gv.at
        </p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          7. Datensicherheit
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          Alle Daten werden in Rechenzentren innerhalb der Europäischen Union
          (Frankfurt am Main, Deutschland) gespeichert und verarbeitet. Die
          Übertragung erfolgt verschlüsselt (TLS 1.3). Wir setzen technische
          und organisatorische Maßnahmen zum Schutz Ihrer Daten ein.
        </p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          8. Cookies
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          Diese Website verwendet ausschließlich technisch notwendige Cookies
          (Session-Cookies für die Authentifizierung). Es werden keine
          Marketing-, Tracking- oder Analyse-Cookies eingesetzt. Eine
          Einwilligung ist gemäß § 165 Abs. 2 TKG 2021 nicht erforderlich.
        </p>

        <hr className="border-zinc-800 my-8" />

        <p className="text-xs text-zinc-600">
          Hinweis: Platzhalter in eckigen Klammern [ ] sind vor der
          Veröffentlichung durch die tatsächlichen Daten zu ersetzen. Diese
          Datenschutzerklärung wurde auf Basis der DSGVO, des DSG und des TKG
          2021 erstellt. Keine Rechtsberatung — eine Prüfung durch einen
          Rechtsanwalt wird empfohlen.
        </p>
      </div>
    </div>
  );
}

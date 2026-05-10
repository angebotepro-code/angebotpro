export default function AGBPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">
          Allgemeine Geschäftsbedingungen (AGB)
        </h1>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          1. Geltungsbereich
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für sämtliche
          Verträge zwischen [Your Name/Firma] (nachfolgend
          &quot;Werkit&quot;) und den Nutzern der SaaS-Plattform
          Werkit. Abweichende AGB des Nutzers werden nicht anerkannt.
        </p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          2. Leistungsbeschreibung
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          Werkit stellt eine KI-gestützte SaaS-Plattform zur Erstellung von
          Angeboten für Handwerksbetriebe bereit. Die Plattform ermöglicht die
          Eingabe von Auftragsbeschreibungen (per Sprache oder Text) und
          generiert daraus mittels Künstlicher Intelligenz strukturierte
          Angebotsdokumente.
        </p>
        <p className="text-zinc-400 leading-relaxed mt-2">
          <strong className="text-zinc-300">
            Wichtiger Hinweis zur KI-Nutzung:
          </strong>{" "}
          Die KI-generierten Angebote sind{" "}
          <strong>Entwürfe und Empfehlungen</strong>. Der Nutzer ist
          verpflichtet, jedes Angebot vor dem Versand an Endkunden auf
          Richtigkeit, Vollständigkeit und rechtliche Konformität zu prüfen.
          Werkit übernimmt keine Haftung für Fehler, Auslassungen oder
          fehlerhafte Preisberechnungen in KI-generierten Inhalten, es sei
          denn, diese beruhen auf Vorsatz oder grober Fahrlässigkeit von
          Werkit.
        </p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          3. Vertragsschluss
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          Der Vertrag kommt durch die Registrierung des Nutzers auf der
          Plattform und die Auswahl eines Abonnement-Tarifs zustande. Der
          Nutzer erhält eine Bestätigungs-E-Mail mit den Vertragsdetails.
          Technische Schritte des Vertragsschlusses: (1) Registrierung mit
          E-Mail und Passwort, (2) Auswahl des Tarifs, (3) Eingabe der
          Zahlungsdaten, (4) Bestätigung der Bestellung.
        </p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          4. Preise und Zahlungsbedingungen
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          Alle Preise verstehen sich in Euro exklusive der gesetzlichen
          Umsatzsteuer (MwSt), sofern nicht anders angegeben. Die Zahlung
          erfolgt monatlich oder jährlich im Voraus per Kreditkarte, SEPA-Lastschrift
          oder EPS. Bei Zahlungsverzug gelten die gesetzlichen Verzugszinsen
          (§ 456 UGB für Unternehmer, § 1000 ABGB für Verbraucher).
        </p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          5. Laufzeit und Kündigung
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          Das Abonnement hat eine Mindestlaufzeit von einem Monat und verlängert
          sich automatisch um einen weiteren Monat, sofern es nicht mit einer
          Frist von 7 Tagen zum Ende der Vertragslaufzeit gekündigt wird. Die
          Kündigung erfolgt in Textform (E-Mail an [your-email]@werkit.io)
          oder über die Plattform. Jahresabonnements verlängern sich um ein
          weiteres Jahr, sofern sie nicht mit einer Frist von 30 Tagen zum Ende
          der Vertragslaufzeit gekündigt werden.
        </p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          6. Gewährleistung und Haftung
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          Werkit haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit
          sowie für Personenschäden. Für leichte Fahrlässigkeit haftet
          Werkit nur bei Verletzung wesentlicher Vertragspflichten
          (Kardinalpflichten), wobei die Haftung auf den vertragstypisch
          vorhersehbaren Schaden begrenzt ist und den Betrag des jährlichen
          Abonnement-Entgelts nicht übersteigt.
        </p>
        <p className="text-zinc-400 leading-relaxed mt-2">
          Die Haftung für KI-generierte Inhalte ist in Ziffer 2 dieser AGB
          gesondert geregelt. Werkit übernimmt keine Gewähr für die
          ununterbrochene Verfügbarkeit der Plattform, bemüht sich jedoch um
          eine Verfügbarkeit von 99,5% während der Geschäftszeiten.
        </p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          7. Pflichten des Nutzers
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          Der Nutzer verpflichtet sich:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-zinc-400 mt-2">
          <li>
            Keine rechtswidrigen, missbräuchlichen oder gegen die guten Sitten
            verstoßenden Inhalte über die Plattform zu erstellen
          </li>
          <li>
            KI-generierte Angebote vor dem Versand an Endkunden zu prüfen
          </li>
          <li>
            Seine Zugangsdaten sicher zu verwahren und nicht an Dritte
            weiterzugeben
          </li>
          <li>
            Bei der Eingabe von Kundendaten die DSGVO-Vorgaben einzuhalten
            (insb. Rechtsgrundlage für die Datenverarbeitung)
          </li>
        </ul>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          8. Datenschutz
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer{" "}
          <a
            href="/datenschutz"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Datenschutzerklärung
          </a>
          .
        </p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          9. Anwendbares Recht und Gerichtsstand
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          Es gilt österreichisches Recht unter Ausschluss des UN-Kaufrechts
          (CISG) und der Verweisungsnormen des internationalen Privatrechts.
          Gerichtsstand für alle Streitigkeiten aus diesem Vertrag ist das
          sachlich zuständige Gericht am Sitz von Werkit, soweit der Nutzer
          Unternehmer ist. Für Verbraucher gilt der gesetzliche Gerichtsstand.
        </p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          10. Schlussbestimmungen
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden,
          bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. An die
          Stelle der unwirksamen Bestimmung tritt eine Regelung, die dem
          wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt
          (salvatorische Klausel). Änderungen der AGB werden dem Nutzer per
          E-Mail mitgeteilt. Widerspricht der Nutzer den Änderungen nicht
          innerhalb von 14 Tagen, gelten die geänderten AGB als akzeptiert.
        </p>

        <hr className="border-zinc-800 my-8" />

        <p className="text-xs text-zinc-600">
          Hinweis: Platzhalter in eckigen Klammern [ ] sind vor der
          Veröffentlichung durch die tatsächlichen Daten zu ersetzen. Diese AGB
          wurden auf Basis des ABGB, KSchG, ECG und UGB erstellt. Keine
          Rechtsberatung — eine Prüfung durch einen Rechtsanwalt wird
          empfohlen.
        </p>
      </div>
    </div>
  );
}

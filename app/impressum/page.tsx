export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Impressum</h1>

        <h2 className="text-lg font-semibold text-zinc-200 mt-6 mb-2">
          Diensteanbieter gemäß § 5 ECG / Medieninhaber gemäß § 25 MedienG
        </h2>

        <p className="text-zinc-400 leading-relaxed">
          [Your Full Name]
          <br />
          [Your Street Address]
          <br />
          [Your ZIP] [Your City]
          <br />
          Österreich
        </p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          Kontakt
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          E-Mail: [your-email]@angebotpro.at
          <br />
          Telefon: [Your Phone Number]
        </p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          Unternehmensgegenstand
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          Entwicklung und Betrieb einer KI-gestützten SaaS-Plattform zur
          Erstellung von Angeboten für Handwerksbetriebe.
        </p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          Rechtsform / Firmenbuch
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          [Einzelunternehmen / Gesellschaft mit beschränkter Haftung]
          <br />
          [Firmenbuchnummer: FN XXXXXX, Firmenbuchgericht: Landesgericht Linz]
        </p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          UID-Nummer
        </h2>
        <p className="text-zinc-400 leading-relaxed">ATUXXXXXXXX</p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          Aufsichtsbehörde / Gewerbebehörde
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          [Bezirkshauptmannschaft / Magistrat Linz]
        </p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          Mitgliedschaft bei der Wirtschaftskammer
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          Wirtschaftskammer Oberösterreich
          <br />
          Fachgruppe: [IT-Dienstleistung / Unternehmensberatung]
          <br />
          <br />
          Anwendbare gewerbe- und berufsrechtliche Vorschriften:
          <br />
          Gewerbeordnung 1994 (GewO 1994), BGBl. 194/1994,
          <br />
          abrufbar unter{" "}
          <a
            href="https://www.ris.bka.gv.at"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            www.ris.bka.gv.at
          </a>
        </p>

        <h2 className="text-lg font-semibold text-zinc-200 mt-8 mb-2">
          Hinweis zur Streitbeilegung
        </h2>
        <p className="text-zinc-400 leading-relaxed">
          Die Europäische Kommission stellt eine Plattform zur
          Online-Streitbeilegung (OS) bereit:{" "}
          <a
            href="https://ec.europa.eu/consumers/odr/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            https://ec.europa.eu/consumers/odr/
          </a>
          <br />
          Wir sind nicht verpflichtet und nicht bereit, an einem
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
          teilzunehmen.
        </p>

        <hr className="border-zinc-800 my-8" />

        <p className="text-xs text-zinc-600">
          Hinweis: Platzhalter in eckigen Klammern [ ] sind vor der
          Veröffentlichung durch die tatsächlichen Daten zu ersetzen. Dieses
          Impressum wurde auf Basis des ECG § 5, MedienG § 25 und UGB § 14
          erstellt. Keine Rechtsberatung.
        </p>
      </div>
    </div>
  );
}

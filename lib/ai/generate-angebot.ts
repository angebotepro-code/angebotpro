import { generateObject } from "ai";
import { deepseek } from "@ai-sdk/deepseek";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { getMwstRate } from "./mwst-engine";

// Swap this import when switching from DeepSeek to OpenAI
const model = process.env.OPENAI_API_KEY
  ? openai("gpt-4o")
  : deepseek("deepseek-chat");

const angebotSchema = z.object({
  einleitung: z.string().describe("Professionelle Einleitung mit Anrede"),
  positionen: z
    .array(
      z.object({
        pos: z.number(),
        beschreibung: z.string().describe("Detaillierte Leistungsbeschreibung"),
        menge: z.number().describe("Menge (1 für Pauschal)"),
        einheit: z.string().describe("pauschal, m², Stück, Std, etc."),
        einzelpreis: z.number().describe("Einzelpreis in Euro"),
        gesamtpreis: z.number().describe("Gesamtpreis = menge × einzelpreis"),
      })
    )
    .describe("Logisch gruppierte Positionen"),
  subtotalNet: z.number().describe("Summe aller Positionen (netto)"),
  mwstRate: z.number().describe("Von der MwSt-Engine überschrieben"),
  mwstTotal: z.number().describe("Von der MwSt-Engine überschrieben"),
  totalGross: z.number().describe("Von der MwSt-Engine überschrieben"),
  zahlungsbedingungen: z
    .string()
    .describe("Standard: '30 Tage netto' oder angepasst"),
  gewaehrleistung: z
    .string()
    .describe("Standard: '3 Jahre gemäß § 933 ABGB'"),
  schlussformel: z.string().describe("Höfliche Schlussformel"),
});

export interface GenerateAngebotInput {
  inputText: string;
  trade?: string;
  companyContext?: string;
}

export interface GeneratedAngebot {
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
  mwstReason: string;
}

export async function generateAngebot({
  inputText,
  trade,
  companyContext,
}: GenerateAngebotInput): Promise<GeneratedAngebot> {
  // 1. Deterministic MwSt (NEVER trust the LLM for tax)
  const mwstResult = getMwstRate(inputText, trade);

  const tradeContext = trade
    ? `\nDer Handwerker ist vom Typ: ${trade}. Verwende fachspezifische Terminologie.`
    : "";

  const companyInfo = companyContext ? `\n${companyContext}` : "";

  // 2. Generate structured Angebot via LLM
  const { object } = await generateObject({
    model,
    schema: angebotSchema,
    system: `Du bist ein erfahrener österreichischer Handwerker, der professionelle, rechtskonforme Angebote schreibt.
Erstelle aus der folgenden Beschreibung ein vollständiges, formelles Angebot.

REGELN:
- Verwende österreichisches Geschäftsdeutsch (formelle Anrede 'Sehr geehrte/r', höflicher, professioneller Ton)
- Glieder die Arbeit in logische Positionen (Pos. 1, Pos. 2, ...) mit klarer Nummerierung
- Jede Position: detaillierte Leistungsbeschreibung, realistische Menge, korrekte Einheit (pauschal, m², Stück, Std.)
- Schätze realistische Preise für den österreichischen Handwerkermarkt (€)
- Verwende 'pauschal' als Einheit für Gesamtleistungen
- Schreibe eine professionelle Einleitung, die den Kunden anspricht
- Nenne in der Einleitung KEINE Preise oder Beträge
- Füge die korrekte MwSt-Rate hinzu (wird vom System überschrieben — du darfst ${mwstResult.rate}% vorschlagen)
- Standard-Zahlungsbedingungen: '30 Tage netto' (oder angepasst an die Arbeit)
- Standard-Gewährleistung: '3 Jahre gemäß § 933 ABGB'
- Gültigkeitsdauer: erwähne im Angebotstext, dass das Angebot 30 Tage gültig ist
- Erwähne, dass es sich um ein unverbindliches Angebot handelt
- Schlussformel: höflicher, professioneller Abschluss${tradeContext}${companyInfo}`,
    prompt: inputText,
  });

  // 3. Override MwSt with deterministic engine (NEVER trust the LLM)
  const subtotal = object.positionen.reduce(
    (sum, p) => sum + p.gesamtpreis,
    0
  );
  const mwstTotal = Math.round(subtotal * (mwstResult.rate / 100) * 100) / 100;
  const totalGross = Math.round((subtotal + mwstTotal) * 100) / 100;

  return {
    ...object,
    subtotalNet: subtotal,
    mwstRate: mwstResult.rate,
    mwstTotal,
    totalGross,
    mwstReason: mwstResult.reason,
  };
}

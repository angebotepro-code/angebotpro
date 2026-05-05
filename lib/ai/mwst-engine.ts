/**
 * Deterministic MwSt engine for Austrian Handwerker quotes.
 * NEVER let the LLM decide the tax rate — this function always wins.
 *
 * Austrian VAT rules (Umsatzsteuergesetz):
 * - 20% — Standard rate for most goods and services
 * - 10% — Reduced rate for specific renovation/repair work on residential property
 *         (§ 10 Abs. 2 Z 4 UStG — for labor/Arbeitsleistung, not materials)
 */

export interface MwstResult {
  rate: number;
  reason: string;
}

const REDUCED_RATE_KEYWORDS = [
  "renovierung",
  "sanierung",
  "reparatur",
  "instandsetzung",
  "instandhaltung",
  "restaurierung",
];

const RESIDENTIAL_KEYWORDS = [
  "wohnung",
  "wohnhaus",
  "eigentumswohnung",
  "privatwohnung",
  "einfamilienhaus",
  "wohngebäude",
  "privat",
  "privatkunde",
  "familie",
];

const COMMERCIAL_KEYWORDS = [
  "büro",
  "geschäft",
  "gewerbe",
  "firma",
  "unternehmen",
  "hotel",
  "restaurant",
  "industrie",
  "lager",
  "werkstatt",
];

export function getMwstRate(
  description: string,
  trade?: string
): MwstResult {
  const lower = description.toLowerCase();

  // Check for commercial — always 20%
  const isCommercial = COMMERCIAL_KEYWORDS.some((kw) => lower.includes(kw));
  if (isCommercial) {
    return {
      rate: 20,
      reason: "Gewerbliche/kommerzielle Arbeit — Standard-Umsatzsteuersatz (20%)",
    };
  }

  // Check for renovation/repair keywords
  const isRenovation = REDUCED_RATE_KEYWORDS.some((kw) => lower.includes(kw));

  // Check for residential context
  const isResidential = RESIDENTIAL_KEYWORDS.some((kw) => lower.includes(kw));

  if (isRenovation && isResidential) {
    return {
      rate: 10,
      reason:
        "Renovierungs-/Sanierungsarbeit an einer Privatwohnung — ermäßigter Steuersatz 10% (§ 10 Abs. 2 Z 4 UStG)",
    };
  }

  if (isRenovation) {
    // Renovation mentioned but no residential context — could go either way
    // Default to 10% for explicit renovation keywords, user can override
    return {
      rate: 10,
      reason:
        "Renovierungsarbeit — ermäßigter Steuersatz 10% (bitte prüfen: nur für Wohngebäude gültig)",
    };
  }

  // Default: standard rate
  return {
    rate: 20,
    reason: "Standard-Umsatzsteuersatz (20%)",
  };
}

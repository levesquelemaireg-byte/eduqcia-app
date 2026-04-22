/**
 * Lookup statique : réalité sociale → période chronologique.
 *
 * Les périodes sont des données immuables issues des JSON référentiels
 * (`hec-sec1-2.json`, `hqc-sec3-4.json`). Ce map couvre les deux disciplines.
 *
 * HQC : la période est déjà concaténée dans `realite_sociale` (format « période — réalité »),
 * donc on peut l'extraire par parsing. Ce map sert de fallback et couvre aussi le format pur.
 *
 * HEC : `realite_sociale` ne contient que le nom — le map est la seule source.
 */

const HQC_REALITE_SEP = " — ";

/** Map : nom pur de la réalité sociale → période. Clés sans préfixe de période. */
const PERIODES_PAR_REALITE: ReadonlyMap<string, string> = new Map([
  // ── HEC — Premier cycle ────────────────────────────────────────
  ["La sédentarisation", "Du 9ᵉ millénaire av. J.-C. à 3 300 av. J.-C."],
  ["L\u2019émergence d\u2019une civilisation", "De 3 300 av. J.-C. au 5ᵉ siècle av. J.-C."],
  ["Une première expérience de démocratie", "5ᵉ siècle av. J.-C."],
  ["La romanisation", "Du 8ᵉ siècle av. J.-C. à 476"],
  ["La christianisation de l\u2019Occident", "De 476 au 11ᵉ siècle"],
  ["L\u2019essor urbain et commercial", "Du 11ᵉ au 15ᵉ siècle"],
  ["Le renouvellement de la vision de l\u2019homme", "Du 15ᵉ au 16ᵉ siècle"],
  ["L\u2019expansion européenne dans le monde", "De la fin du 15ᵉ au 17ᵉ siècle"],
  ["Les révolutions américaine ou française", "Fin du 18ᵉ siècle"],
  [
    "L\u2019industrialisation : une révolution économique et sociale",
    "De la fin du 18ᵉ au milieu du 19ᵉ siècle",
  ],
  ["L\u2019expansion du monde industriel", "Du milieu du 19ᵉ siècle à 1914"],
  ["La reconnaissance des libertés et des droits civils", "De 1945 à la fin du 20ᵉ siècle"],

  // ── HQC — Deuxième cycle, Secondaire 3 ────────────────────────
  ["L\u2019expérience des Autochtones et le projet de colonie", "Des origines à 1608"],
  [
    "L\u2019évolution de la société coloniale sous l\u2019autorité de la métropole française",
    "De 1608 à 1760",
  ],
  ["La Conquête et le changement d\u2019empire", "De 1760 à 1791"],
  ["Les revendications et les luttes nationales", "De 1791 à 1840"],

  // ── HQC — Deuxième cycle, Secondaire 4 ────────────────────────
  ["La formation du régime fédéral canadien", "De 1840 à 1896"],
  ["Les nationalismes et l\u2019autonomie du Canada", "De 1896 à 1945"],
  ["La modernisation du Québec et la Révolution tranquille", "De 1945 à 1980"],
  ["Les choix de société dans le Québec contemporain", "De 1980 à nos jours"],
]);

/**
 * Retrouve la période chronologique associée à une `realite_sociale`.
 *
 * Gère les deux formats :
 * - HEC : nom pur (ex. « La sédentarisation »)
 * - HQC : format concaténé (ex. « Des origines à 1608 — L'expérience des Autochtones… »)
 */
export function lookupPeriode(realiteSociale: string): string | null {
  // 1. Lookup direct (HEC, ou HQC si déjà séparé)
  const direct = PERIODES_PAR_REALITE.get(realiteSociale);
  if (direct) return direct;

  // 2. HQC format concaténé : extraire la partie après le séparateur et chercher
  const sepIdx = realiteSociale.indexOf(HQC_REALITE_SEP);
  if (sepIdx >= 0) {
    const nomPur = realiteSociale.slice(sepIdx + HQC_REALITE_SEP.length).trim();
    const found = PERIODES_PAR_REALITE.get(nomPur);
    if (found) return found;

    // Fallback : la partie avant le séparateur est elle-même la période
    const periodePart = realiteSociale.slice(0, sepIdx).trim();
    if (periodePart.length > 0) return periodePart;
  }

  return null;
}

/**
 * Parcours non rédactionnel — carte historique (OI2, comportements 2.1 / 2.2 / 2.3).
 *
 * Logique pure pour le comportement 2.2 (« association d'éléments géographiques ») :
 * - la carte porte toujours les 4 chiffres `{1, 2, 3, 4}` (invariant ministériel)
 * - 12 paires ordonnées `(c1, c2)` avec `c1 ≠ c2` ; on retire la bonne, on en mélange 11,
 *   on en prend 3, puis on mélange les 4 paires (correcte + distractrices) pour assigner A–D.
 *
 * Pas d'effet de bord : `Math.random` est injectable via `Carte22Rng` pour les tests.
 */

export const CARTE_HISTORIQUE_CHIFFRES = [1, 2, 3, 4] as const;

export type CarteHistoriqueChiffre = (typeof CARTE_HISTORIQUE_CHIFFRES)[number];

export type CarteHistoriquePair = readonly [CarteHistoriqueChiffre, CarteHistoriqueChiffre];

export type CarteHistoriqueLetter = "A" | "B" | "C" | "D";

const LETTERS: readonly CarteHistoriqueLetter[] = ["A", "B", "C", "D"] as const;

/** RNG retourne un réel dans `[0, 1)`. */
export type Carte22Rng = () => number;

export function isCarteHistoriqueChiffre(v: unknown): v is CarteHistoriqueChiffre {
  return v === 1 || v === 2 || v === 3 || v === 4;
}

export function carteHistoriquePairsEqual(a: CarteHistoriquePair, b: CarteHistoriquePair): boolean {
  return a[0] === b[0] && a[1] === b[1];
}

/** Énumère les 12 paires ordonnées `(c1, c2)` avec `c1 ≠ c2` sur `{1, 2, 3, 4}`. */
export function allCarteHistoriquePairs(): CarteHistoriquePair[] {
  const out: CarteHistoriquePair[] = [];
  for (const c1 of CARTE_HISTORIQUE_CHIFFRES) {
    for (const c2 of CARTE_HISTORIQUE_CHIFFRES) {
      if (c1 === c2) continue;
      out.push([c1, c2] as const);
    }
  }
  return out;
}

/** Fisher–Yates ; ne mute pas l'entrée. */
function shuffle<T>(arr: readonly T[], rng: Carte22Rng): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

export type CarteHistorique22GenerationResult = {
  optionA: CarteHistoriquePair;
  optionB: CarteHistoriquePair;
  optionC: CarteHistoriquePair;
  optionD: CarteHistoriquePair;
  correctLetter: CarteHistoriqueLetter;
};

/**
 * Génère les 4 options A–D pour le comportement 2.2.
 *
 * @param correct paire correcte (les deux chiffres doivent être distincts).
 * @param rng RNG injectable (défaut `Math.random`).
 * @returns options A–D mélangées + lettre où se trouve la paire correcte.
 *   Retourne `null` si `correct` n'est pas une paire valide (chiffres égaux ou hors plage).
 */
export function generateCarteHistorique22Options(
  correct: CarteHistoriquePair,
  rng: Carte22Rng = Math.random,
): CarteHistorique22GenerationResult | null {
  if (!isCarteHistoriqueChiffre(correct[0]) || !isCarteHistoriqueChiffre(correct[1])) return null;
  if (correct[0] === correct[1]) return null;

  const distractricesPool = allCarteHistoriquePairs().filter(
    (p) => !carteHistoriquePairsEqual(p, correct),
  );
  // 11 distractrices possibles ; on en prend 3 après mélange.
  if (distractricesPool.length < 3) return null;
  const distractrices = shuffle(distractricesPool, rng).slice(0, 3);
  const allFour = shuffle([correct, ...distractrices], rng);
  const correctIdx = allFour.findIndex((p) => carteHistoriquePairsEqual(p, correct));
  if (correctIdx < 0) return null;
  return {
    optionA: allFour[0]!,
    optionB: allFour[1]!,
    optionC: allFour[2]!,
    optionD: allFour[3]!,
    correctLetter: LETTERS[correctIdx]!,
  };
}

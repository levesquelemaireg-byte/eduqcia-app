/**
 * Permutations 1–4 pour le parcours ordre chronologique — logique pure (tests, génération).
 */

export const ORDRE_DOC_DIGITS = [1, 2, 3, 4] as const;
export type OrdreDocDigit = (typeof ORDRE_DOC_DIGITS)[number];

/** Une ligne d’option en cours de saisie (cases vides autorisées). */
export type OrdreOptionRow = readonly [
  OrdreDocDigit | null,
  OrdreDocDigit | null,
  OrdreDocDigit | null,
  OrdreDocDigit | null,
];

/** Permutation complète valide (4 chiffres distincts dans {1..4}). */
export type OrdrePermutation = readonly [
  OrdreDocDigit,
  OrdreDocDigit,
  OrdreDocDigit,
  OrdreDocDigit,
];

export function emptyOrdreOptionRow(): OrdreOptionRow {
  return [null, null, null, null];
}

function isOrdreDocDigit(n: number): n is OrdreDocDigit {
  return n === 1 || n === 2 || n === 3 || n === 4;
}

export function coerceOrdreDigitCell(v: unknown): OrdreDocDigit | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number" && Number.isInteger(v) && isOrdreDocDigit(v)) return v;
  if (typeof v === "string" && v.length === 1) {
    const n = Number(v);
    if (isOrdreDocDigit(n)) return n;
  }
  return null;
}

/** Vérifie longueur 4, valeurs 1–4, pas de doublons. */
export function isCompleteOrdrePermutation(row: OrdreOptionRow): row is OrdrePermutation {
  if (row[0] === null || row[1] === null || row[2] === null || row[3] === null) return false;
  const nums: OrdreDocDigit[] = [row[0], row[1], row[2], row[3]];
  return new Set(nums).size === 4;
}

export function formatOrdreOptionRowDisplay(row: OrdreOptionRow): string {
  if (!isCompleteOrdrePermutation(row)) return "—";
  return `${row[0]} - ${row[1]} - ${row[2]} - ${row[3]}`;
}

export function permutationsEqual(a: OrdrePermutation, b: OrdrePermutation): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

/** Extrait une permutation depuis une ancienne saisie texte (rétrocompat brouillons). */
export function parseLegacyOptionString(s: string): OrdreOptionRow {
  const digits = (s.match(/[1-4]/g) ?? []).map((ch) => Number(ch) as OrdreDocDigit);
  if (digits.length < 4) return emptyOrdreOptionRow();
  const firstFour = digits.slice(0, 4);
  if (new Set(firstFour).size !== 4) return emptyOrdreOptionRow();
  return [firstFour[0]!, firstFour[1]!, firstFour[2]!, firstFour[3]!];
}

function allPermutations(): OrdrePermutation[] {
  const result: OrdrePermutation[] = [];
  const permute = (arr: OrdreDocDigit[], m: number) => {
    if (m === arr.length - 1) {
      result.push([arr[0]!, arr[1]!, arr[2]!, arr[3]!]);
      return;
    }
    for (let i = m; i < arr.length; i++) {
      const copy = [...arr];
      const tmp = copy[m]!;
      copy[m] = copy[i]!;
      copy[i] = tmp;
      permute(copy, m + 1);
    }
  };
  permute([1, 2, 3, 4], 0);
  return result;
}

const ALL_PERMS = allPermutations();

/** Nombre de permutations distinctes de (1,2,3,4) — attendu : 24. */
export const ORDRE_PERMUTATION_COUNT = ALL_PERMS.length;

function shuffleInPlace<T>(arr: T[], random: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const t = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = t;
  }
}

/**
 * À partir de la bonne permutation : choisit 3 permutations incorrectes distinctes,
 * mélange les 4 suites et retourne l’assignation A–D + la lettre du corrigé.
 */
export type ShuffledOrdreOptionsData = {
  optionA: OrdrePermutation;
  optionB: OrdrePermutation;
  optionC: OrdrePermutation;
  optionD: OrdrePermutation;
  correctLetter: "A" | "B" | "C" | "D";
};

export function generateShuffledOrdreOptions(
  correct: OrdrePermutation,
  random: () => number = Math.random,
): ShuffledOrdreOptionsData {
  const wrong = ALL_PERMS.filter((p) => !permutationsEqual(p, correct));
  shuffleInPlace(wrong, random);
  const three = wrong.slice(0, 3) as [OrdrePermutation, OrdrePermutation, OrdrePermutation];
  const four: OrdrePermutation[] = [correct, three[0]!, three[1]!, three[2]!];
  shuffleInPlace(four, random);
  const letters = ["A", "B", "C", "D"] as const;
  const correctIdx = four.findIndex((p) => permutationsEqual(p, correct));
  return {
    optionA: four[0]!,
    optionB: four[1]!,
    optionC: four[2]!,
    optionD: four[3]!,
    correctLetter: letters[correctIdx]!,
  };
}

/**
 * Même logique que `generateShuffledOrdreOptions` + garde défensive sur l’unicité des 4 suites.
 * En `development` uniquement : `console.error` si la contrainte est violée (cas théoriquement impossible).
 * En production / test : retour `{ ok: false }` sans log ni throw.
 */
export function generateShuffledOrdreOptionsGuarded(
  correct: OrdrePermutation,
  random: () => number = Math.random,
): { ok: true; data: ShuffledOrdreOptionsData } | { ok: false } {
  const data = generateShuffledOrdreOptions(correct, random);
  if (!areFourDistinctPermutations(data.optionA, data.optionB, data.optionC, data.optionD)) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[ÉduQc.IA ordre chronologique] Violation défensive : les quatre options ne sont pas des permutations distinctes.",
      );
    }
    return { ok: false };
  }
  return { ok: true, data };
}

export function areFourDistinctPermutations(
  a: OrdrePermutation,
  b: OrdrePermutation,
  c: OrdrePermutation,
  d: OrdrePermutation,
): boolean {
  const keys = [a.join(","), b.join(","), c.join(","), d.join(",")];
  return new Set(keys).size === 4;
}

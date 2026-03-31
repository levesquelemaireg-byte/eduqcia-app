/**
 * Règles UI — deux-points : voir `docs/DESIGN-SYSTEM.md` §1.1.1.
 * Espaces « normaux » (U+0020) ; pas d’espace insécable autour du deux-points.
 */

const PH = (i: number) => `__COLON_PH_${i}__`;

/**
 * Insère une espace avant et une espace après chaque `:` qui sépare deux segments « collés »
 * (ponctuation française en interface). Idempotent si les espaces sont déjà correctes.
 *
 * **Protégé** (inchangé) : URLs `http:…`, `https:…` ; heures type `12:30`, `9:05`.
 * Ne pas passer du code (JSON, clés `foo:bar`) : réservé au texte affiché (libellés, toasts, etc.).
 */
export function normalizeFrenchColonSpacing(input: string): string {
  if (!input) return input;
  let s = input.replace(/\u00A0|\u202F/g, " ");

  const bucket: string[] = [];
  const protect = (raw: string) => {
    const i = bucket.length;
    bucket.push(raw);
    return PH(i);
  };

  s = s.replace(/https?:\/\/[^\s<]+/gi, protect);
  s = s.replace(/\b\d{1,2}:\d{2}\b/g, protect);

  let prev = "";
  while (prev !== s) {
    prev = s;
    s = s.replace(/([^\s])(:)([^\s])/g, "$1 : $3");
  }

  /** Évite qu’un deux-points soit le premier caractère non blanc d’une ligne (suit le segment précédent). */
  s = s.replace(/\n\s*:\s*/g, " : ");

  return s.replace(/__COLON_PH_(\d+)__/g, (_, i) => bucket[Number(i)] ?? "");
}

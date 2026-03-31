/**
 * PostgREST peut renvoyer des entiers SQL en `number` ou en `string` selon le client / le typage.
 * Normaliser évite les échecs de `===` entre `niveau_id` du formulaire et `n.id` des lignes référentiel.
 */
export function normalizeSqlIntId(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  if (typeof v === "string") {
    const t = v.trim();
    if (t === "") return 0;
    const n = Number(t);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
  }
  return 0;
}

export function refIdsEqual(a: unknown, b: unknown): boolean {
  return normalizeSqlIntId(a) === normalizeSqlIntId(b);
}

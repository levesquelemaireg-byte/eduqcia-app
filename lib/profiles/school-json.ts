/**
 * Colonne `profiles.school` : soit texte libre historique, soit JSON `{ css, ecole, niveau }`
 * (inscription — `lib/actions/auth-register.ts`).
 */

export type ParsedSchool = {
  css: string | null;
  ecole: string | null;
  niveau: string | null;
};

export function parseSchoolJson(school: string | null): ParsedSchool {
  if (!school?.trim()) {
    return { css: null, ecole: null, niveau: null };
  }
  try {
    const o = JSON.parse(school.trim()) as Record<string, unknown>;
    return {
      css: typeof o.css === "string" ? o.css : null,
      ecole: typeof o.ecole === "string" ? o.ecole : null,
      niveau: typeof o.niveau === "string" ? o.niveau : null,
    };
  } catch {
    return { css: null, ecole: null, niveau: null };
  }
}

/**
 * Sous-ligne UI (recherche collaborateurs, etc.) : pas de JSON brut.
 */
export function formatSchoolForDisplay(school: string | null | undefined): string {
  if (!school?.trim()) return "";
  const raw = school.trim();
  if (!raw.startsWith("{")) {
    return raw;
  }
  const parsed = parseSchoolJson(raw);
  const parts = [parsed.ecole?.trim(), parsed.css?.trim(), parsed.niveau?.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "";
}

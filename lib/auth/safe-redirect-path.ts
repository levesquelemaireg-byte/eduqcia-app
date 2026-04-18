/**
 * Vérifie que la cible de redirection est un chemin interne relatif.
 * Bloque les open redirects (protocol-relative `//`, schémas absolus, caractères spéciaux).
 */
export function safeRedirectPath(raw: string | null): string {
  if (!raw) return "/dashboard";
  // Doit commencer par / et ne pas commencer par // (protocol-relative)
  if (!/^\/(?!\/)[a-zA-Z0-9\-_./]*$/.test(raw)) return "/dashboard";
  return raw;
}

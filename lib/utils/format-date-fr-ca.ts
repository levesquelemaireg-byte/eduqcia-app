/**
 * Dates affichées en français (Canada) avec fuseau fixe — même chaîne en SSR et dans le navigateur.
 * Sans `timeZone`, Node (souvent UTC) et le client (fuseau utilisateur) peuvent diverger → erreur d’hydratation React.
 */
const DISPLAY_TIME_ZONE = "America/Toronto";

export function formatDateFrCaMedium(iso: string | null | undefined): string {
  if (iso == null || iso.trim() === "") {
    return "—";
  }
  try {
    return new Intl.DateTimeFormat("fr-CA", {
      dateStyle: "medium",
      timeZone: DISPLAY_TIME_ZONE,
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

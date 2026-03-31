/**
 * Affichage poids fichier pour l’UI (fr-CA : virgule décimale).
 */
export function formatFileSizeBytesFr(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) {
    return "—";
  }
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) {
    return `${mb.toLocaleString("fr-CA", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mo`;
  }
  const kb = bytes / 1024;
  if (kb >= 1) {
    return `${Math.max(1, Math.round(kb)).toLocaleString("fr-CA")} ko`;
  }
  return `${Math.max(1, Math.round(bytes))} o`;
}

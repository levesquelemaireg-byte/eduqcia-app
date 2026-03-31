/**
 * Courriels institutionnels québécois : sous-domaines de gouv.qc.ca
 * (ex. cssdm.gouv.qc.ca) — aligné sur docs/FEATURES.md / docs/ARCHITECTURE.md.
 */
const GOUV_QC_RE = /^[^\s@]+@([^.]+\.)*gouv\.qc\.ca$/i;

export function isInstitutionalEmail(email: string): boolean {
  const trimmed = email.trim();
  return GOUV_QC_RE.test(trimmed);
}

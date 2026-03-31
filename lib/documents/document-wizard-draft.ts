/** Brouillon local — wizard « Créer un document » (`sessionStorage`). */
export const AUTONOMOUS_DOCUMENT_WIZARD_DRAFT_KEY = "eduqc-autonomous-document-wizard-draft";

export type AutonomousDocumentWizardDraftPayload = {
  v: 1;
  step: number;
  values: Record<string, unknown>;
};

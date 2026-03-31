"use client";

import { createContext, useContext, type ReactNode } from "react";

export type WizardSessionValue = {
  /** Si défini, publication appelle `update_tae_transaction` pour cette TAÉ. */
  editingTaeId: string | null;
  /** Faux en édition : évite d’écraser `sessionStorage` du parcours « Créer une tâche ». */
  persistSessionDraft: boolean;
  /** Utilisateur connecté — recherche collaborateurs (exclusion, action serveur). */
  currentUserId: string | null;
};

const defaultValue: WizardSessionValue = {
  editingTaeId: null,
  persistSessionDraft: true,
  currentUserId: null,
};

const WizardSessionContext = createContext<WizardSessionValue>(defaultValue);

export function WizardSessionProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: WizardSessionValue;
}) {
  return <WizardSessionContext.Provider value={value}>{children}</WizardSessionContext.Provider>;
}

export function useWizardSession(): WizardSessionValue {
  return useContext(WizardSessionContext);
}

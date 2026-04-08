"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { TaeVersionSnapshot } from "@/lib/tae/publish-tae-types";

export type WizardSessionValue = {
  /** Si défini, publication appelle `update_tae_transaction` pour cette TAÉ. */
  editingTaeId: string | null;
  /** Faux en édition : évite d’écraser `sessionStorage` du parcours « Créer une tâche ». */
  persistSessionDraft: boolean;
  /** Utilisateur connecté — recherche collaborateurs (exclusion, action serveur). */
  currentUserId: string | null;
  /** Snapshot des champs majeurs au chargement de la page d’édition — détection version. */
  versionSnapshot: TaeVersionSnapshot | null;
};

const defaultValue: WizardSessionValue = {
  editingTaeId: null,
  persistSessionDraft: true,
  currentUserId: null,
  versionSnapshot: null,
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

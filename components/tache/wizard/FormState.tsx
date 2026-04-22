"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from "react";
import { TACHE_DRAFT_STORAGE_KEY } from "@/lib/tache/tache-draft-storage-key";
import { tacheFormReducer } from "@/lib/tache/tache-form-reducer";
import { isProfileCollaborateurId } from "@/lib/tache/collaborateur-user-ids";
import {
  initialTacheFormState,
  type ConceptionSlice,
  type TacheFormAction,
  type TacheFormState,
} from "@/lib/tache/tache-form-state-types";

export type {
  Bloc3Slice,
  Bloc4Slice,
  Bloc5Slice,
  Bloc5Props,
  Bloc6Slice,
  Bloc7Slice,
  BlueprintSlice,
  ConceptionSlice,
  NonRedactionData,
  TacheFormAction,
  TacheFormState,
} from "@/lib/tache/tache-form-state-types";

export {
  getRedactionSliceForPreview,
  initialBlueprint,
  initialBloc3,
  initialBloc5,
  initialBloc7,
  initialConception,
  initialTacheFormState,
  TACHE_BLUEPRINT_STEP_INDEX,
  TACHE_BLOC5_STEP_INDEX,
  TACHE_CD_STEP_INDEX,
  TACHE_CONCEPTION_STEP_INDEX,
  TACHE_CONNAISSANCES_STEP_INDEX,
  TACHE_DOCUMENTS_STEP_INDEX,
  TACHE_FORM_STEP_COUNT,
  TACHE_REDACTION_STEP_INDEX,
} from "@/lib/tache/tache-form-state-types";

export { tacheFormReducer } from "@/lib/tache/tache-form-reducer";

export { TACHE_DRAFT_STORAGE_KEY } from "@/lib/tache/tache-draft-storage-key";

type TacheFormContextValue = {
  state: TacheFormState;
  dispatch: Dispatch<TacheFormAction>;
};

const TacheFormContext = createContext<TacheFormContextValue | null>(null);

type TacheFormProviderProps = {
  children: ReactNode;
  /**
   * État initial serveur (édition d’une TAÉ). Sinon le formulaire démarre vide ; la reprise « Créer »
   * se fait via `WizardDraftBanners` + `HYDRATE` — `docs/DECISIONS.md` § brouillons.
   */
  serverInitialState?: TacheFormState | null;
  /** Faux sur `/questions/[id]/edit` : ne pas persister dans `TACHE_DRAFT_STORAGE_KEY`. */
  persistSessionDraft?: boolean;
};

function initFormState(serverInitial: TacheFormState | null | undefined): TacheFormState {
  if (serverInitial) {
    return tacheFormReducer(initialTacheFormState, { type: "HYDRATE", state: serverInitial });
  }
  return initialTacheFormState;
}

export function TacheFormProvider({
  children,
  serverInitialState = null,
  persistSessionDraft = true,
}: TacheFormProviderProps) {
  const [state, dispatch] = useReducer(
    tacheFormReducer,
    serverInitialState ?? undefined,
    (initArg) => initFormState(initArg ?? null),
  );
  /** Évite d’écraser le brouillon local avant la première interaction utile. */
  const skipFirstPersistRef = useRef(true);

  useEffect(() => {
    if (!persistSessionDraft) return;
    if (skipFirstPersistRef.current) {
      skipFirstPersistRef.current = false;
      return;
    }
    const id = window.setTimeout(() => {
      try {
        sessionStorage.setItem(TACHE_DRAFT_STORAGE_KEY, JSON.stringify(state));
      } catch {
        /* quota */
      }
    }, 300);
    return () => window.clearTimeout(id);
  }, [state, persistSessionDraft]);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return <TacheFormContext.Provider value={value}>{children}</TacheFormContext.Provider>;
}

export function useTacheForm(): TacheFormContextValue {
  const ctx = useContext(TacheFormContext);
  if (!ctx) {
    throw new Error("useTacheForm doit être utilisé dans un TacheFormProvider");
  }
  return ctx;
}

/**
 * Bloc 1 — complétude (`ConceptionSlice` = `state.bloc1`).
 * docs/DECISIONS.md — mode requis ; si équipe, au moins un collaborateur (docs/WORKFLOWS.md §3.4).
 */
export function isConceptionStepComplete(bloc1: ConceptionSlice): boolean {
  if (bloc1.modeConception === "seul") return true;
  if (bloc1.modeConception === "equipe") {
    if (bloc1.collaborateurs.length < 1) return false;
    return bloc1.collaborateurs.every((x) => isProfileCollaborateurId(x.id));
  }
  return false;
}

/** Alias explicite — même logique que `isConceptionStepComplete`. */
export const isBloc1StepComplete = isConceptionStepComplete;

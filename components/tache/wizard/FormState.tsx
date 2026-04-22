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
import { TAE_DRAFT_STORAGE_KEY } from "@/lib/tache/tae-draft-storage-key";
import { taeFormReducer } from "@/lib/tache/tae-form-reducer";
import { isProfileCollaborateurId } from "@/lib/tache/collaborateur-user-ids";
import {
  initialTaeFormState,
  type ConceptionSlice,
  type TaeFormAction,
  type TaeFormState,
} from "@/lib/tache/tae-form-state-types";

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
  TaeFormAction,
  TaeFormState,
} from "@/lib/tache/tae-form-state-types";

export {
  getRedactionSliceForPreview,
  initialBlueprint,
  initialBloc3,
  initialBloc5,
  initialBloc7,
  initialConception,
  initialTaeFormState,
  TAE_BLUEPRINT_STEP_INDEX,
  TAE_BLOC5_STEP_INDEX,
  TAE_CD_STEP_INDEX,
  TAE_CONCEPTION_STEP_INDEX,
  TAE_CONNAISSANCES_STEP_INDEX,
  TAE_DOCUMENTS_STEP_INDEX,
  TAE_FORM_STEP_COUNT,
  TAE_REDACTION_STEP_INDEX,
} from "@/lib/tache/tae-form-state-types";

export { taeFormReducer } from "@/lib/tache/tae-form-reducer";

export { TAE_DRAFT_STORAGE_KEY } from "@/lib/tache/tae-draft-storage-key";

type TaeFormContextValue = {
  state: TaeFormState;
  dispatch: Dispatch<TaeFormAction>;
};

const TaeFormContext = createContext<TaeFormContextValue | null>(null);

type TaeFormProviderProps = {
  children: ReactNode;
  /**
   * État initial serveur (édition d’une TAÉ). Sinon le formulaire démarre vide ; la reprise « Créer »
   * se fait via `WizardDraftBanners` + `HYDRATE` — `docs/DECISIONS.md` § brouillons.
   */
  serverInitialState?: TaeFormState | null;
  /** Faux sur `/questions/[id]/edit` : ne pas persister dans `TAE_DRAFT_STORAGE_KEY`. */
  persistSessionDraft?: boolean;
};

function initFormState(serverInitial: TaeFormState | null | undefined): TaeFormState {
  if (serverInitial) {
    return taeFormReducer(initialTaeFormState, { type: "HYDRATE", state: serverInitial });
  }
  return initialTaeFormState;
}

export function TaeFormProvider({
  children,
  serverInitialState = null,
  persistSessionDraft = true,
}: TaeFormProviderProps) {
  const [state, dispatch] = useReducer(taeFormReducer, serverInitialState ?? undefined, (initArg) =>
    initFormState(initArg ?? null),
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
        sessionStorage.setItem(TAE_DRAFT_STORAGE_KEY, JSON.stringify(state));
      } catch {
        /* quota */
      }
    }, 300);
    return () => window.clearTimeout(id);
  }, [state, persistSessionDraft]);

  const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  return <TaeFormContext.Provider value={value}>{children}</TaeFormContext.Provider>;
}

export function useTaeForm(): TaeFormContextValue {
  const ctx = useContext(TaeFormContext);
  if (!ctx) {
    throw new Error("useTaeForm doit être utilisé dans un TaeFormProvider");
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

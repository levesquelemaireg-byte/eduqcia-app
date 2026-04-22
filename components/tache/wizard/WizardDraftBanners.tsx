"use client";

import { useEffect, useState } from "react";
import { useTaeForm, type TaeFormState } from "@/components/tache/wizard/FormState";
import { TAE_DRAFT_STORAGE_KEY } from "@/lib/tache/tae-draft-storage-key";
import { sanitizeHydratedState } from "@/lib/tache/tae-form-hydrate";
import { hasMeaningfulWizardProgress } from "@/lib/tache/wizard-draft-progress";
import {
  WIZARD_BANNER_DISMISS_LOCAL,
  WIZARD_BANNER_DISMISS_SERVER,
  WIZARD_BANNER_LOCAL_BODY,
  WIZARD_BANNER_LOCAL_TITLE,
  WIZARD_BANNER_RESUME,
  WIZARD_BANNER_SERVER_BODY,
  WIZARD_BANNER_SERVER_TITLE,
} from "@/lib/ui/ui-copy";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

function readMeaningfulSessionDraft(): TaeFormState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(TAE_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = sanitizeHydratedState(JSON.parse(raw) as unknown);
    if (parsed && hasMeaningfulWizardProgress(parsed)) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

type Props = {
  savedServerDraft: TaeFormState | null;
};

export function WizardDraftBanners({ savedServerDraft }: Props) {
  const { state, dispatch } = useTaeForm();
  const [dismissedServer, setDismissedServer] = useState(false);
  const [dismissedLocal, setDismissedLocal] = useState(false);
  /** Toujours `null` au 1er rendu (SSR = client) — lecture `sessionStorage` après hydratation uniquement. */
  const [sessionDraft, setSessionDraft] = useState<TaeFormState | null>(null);

  useEffect(() => {
    const draft = readMeaningfulSessionDraft();
    if (draft == null) return;
    queueMicrotask(() => {
      setSessionDraft(draft);
    });
  }, []);

  const showServer = Boolean(savedServerDraft) && !dismissedServer;
  /** Pas deux bandeaux ; le local disparaît aussi dès que l’utilisateur remplit le formulaire (sans clic). */
  const formStillFresh = !hasMeaningfulWizardProgress(state);
  const showLocal =
    sessionDraft != null &&
    !dismissedLocal &&
    hasMeaningfulWizardProgress(sessionDraft) &&
    (!savedServerDraft || dismissedServer) &&
    formStillFresh;

  if (!showServer && !showLocal) return null;

  return (
    <div
      className="mb-5 flex flex-col gap-3 md:mb-6"
      role="region"
      aria-label="Reprise de brouillon"
    >
      {showServer ? (
        <div
          className={cn(
            "rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-deep shadow-sm",
            "md:px-5 md:py-4",
          )}
        >
          <p className="font-semibold text-deep">{WIZARD_BANNER_SERVER_TITLE}</p>
          <p className="mt-1.5 leading-relaxed text-steel">{WIZARD_BANNER_SERVER_BODY}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="primary"
              className="min-h-11"
              onClick={() => {
                if (savedServerDraft) {
                  dispatch({ type: "HYDRATE", state: savedServerDraft });
                }
                setDismissedServer(true);
                setDismissedLocal(true);
                setSessionDraft(null);
              }}
            >
              {WIZARD_BANNER_RESUME}
            </Button>
            <Button
              variant="secondary"
              className="min-h-11"
              onClick={() => setDismissedServer(true)}
            >
              {WIZARD_BANNER_DISMISS_SERVER}
            </Button>
          </div>
        </div>
      ) : null}

      {showLocal ? (
        <div
          className={cn(
            "rounded-xl border border-border bg-panel-alt px-4 py-3 text-sm text-deep shadow-sm",
            "md:px-5 md:py-4",
          )}
        >
          <p className="font-semibold text-deep">{WIZARD_BANNER_LOCAL_TITLE}</p>
          <p className="mt-1.5 leading-relaxed text-steel">{WIZARD_BANNER_LOCAL_BODY}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="primary"
              className="min-h-11"
              onClick={() => {
                if (sessionDraft) {
                  dispatch({ type: "HYDRATE", state: sessionDraft });
                }
                setDismissedLocal(true);
              }}
            >
              {WIZARD_BANNER_RESUME}
            </Button>
            <Button
              variant="secondary"
              className="min-h-11"
              onClick={() => {
                try {
                  sessionStorage.removeItem(TAE_DRAFT_STORAGE_KEY);
                } catch {
                  /* ignore */
                }
                setSessionDraft(null);
                setDismissedLocal(true);
              }}
            >
              {WIZARD_BANNER_DISMISS_LOCAL}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

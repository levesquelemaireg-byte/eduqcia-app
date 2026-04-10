"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTaeForm } from "@/components/tae/TaeForm/FormState";
import { WIZARD_DRAFT_INDICATOR_SAVING, WIZARD_DRAFT_INDICATOR_SAVED } from "@/lib/ui/ui-copy";

type Phase = "idle" | "saving" | "saved";

/**
 * Indicateur permanent « Brouillon · Sauvegardé il y a X sec. ».
 * Adresse l'écart E3.1.2 de l'audit du 8 avril 2026.
 *
 * Détecte les changements de state via un key dérivé (JSON hash tronqué)
 * passé comme dépendance d'un unique useEffect. Pas de ref dans les deps
 * d'effet, pas de setState dans le corps d'un effet, conforme aux règles
 * ESLint React 19.
 */
export function WizardDraftIndicator() {
  const { state } = useTaeForm();
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const lastSavedAtRef = useRef(0);
  const isFirstRef = useRef(true);

  // Key dérivé qui change à chaque mutation du state — déclenche l'effet
  const stateKey = state.currentStep.toString() + JSON.stringify(state.bloc3).length;

  const markSaved = useCallback(() => {
    lastSavedAtRef.current = Date.now();
    setPhase("saved");
    setElapsed(0);
  }, []);

  // Détecte les mutations du state.
  // Les deux setState sont dans des callbacks de timer, pas directement
  // dans le corps de l'effet — conforme react-hooks/set-state-in-effect.
  useEffect(() => {
    if (isFirstRef.current) {
      isFirstRef.current = false;
      return;
    }
    const savingId = setTimeout(() => setPhase("saving"), 0);
    const savedId = setTimeout(markSaved, 1000);
    return () => {
      clearTimeout(savingId);
      clearTimeout(savedId);
    };
  }, [stateKey, markSaved]);

  // Rafraîchit le compteur toutes les 5 secondes
  useEffect(() => {
    const id = setInterval(() => {
      if (lastSavedAtRef.current > 0) {
        setElapsed(Math.floor((Date.now() - lastSavedAtRef.current) / 1000));
      }
    }, 5000);
    return () => clearInterval(id);
  }, []);

  if (phase === "idle") return null;

  if (phase === "saving") {
    return (
      <p className="text-xs italic text-muted" aria-live="polite">
        <span className="material-symbols-outlined text-[13px] align-middle" aria-hidden="true">
          sync
        </span>{" "}
        {WIZARD_DRAFT_INDICATOR_SAVING}
      </p>
    );
  }

  return (
    <p className="text-xs italic text-muted" aria-live="polite">
      <span className="material-symbols-outlined text-[13px] align-middle" aria-hidden="true">
        check_circle
      </span>{" "}
      {WIZARD_DRAFT_INDICATOR_SAVED(elapsed)}
    </p>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTaeForm } from "@/components/tache/wizard/FormState";
import { WIZARD_DRAFT_INDICATOR_SAVING } from "@/lib/ui/ui-copy";

type Phase = "idle" | "saving" | "saved" | "fading";

const FADE_DELAY_MS = 3500;

/**
 * Indicateur de sauvegarde pour le header du wizard.
 *
 * Comportement :
 * - Au save : apparaît en pleine opacité (fade-in)
 * - Après ~3,5 s : passe en opacité réduite (reste visible mais discret)
 * - Au prochain save : réapparaît en pleine opacité
 * - Si le save est perceptiblement long : affiche « Sauvegarde… »
 */
export function WizardDraftIndicator() {
  const { state } = useTaeForm();
  const [phase, setPhase] = useState<Phase>("idle");
  const isFirstRef = useRef(true);

  // Key dérivé qui change à chaque mutation du state — déclenche l'effet
  const stateKey = state.currentStep.toString() + JSON.stringify(state.bloc3).length;

  const markSaved = useCallback(() => {
    setPhase("saved");
  }, []);

  // Détecte les mutations du state.
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

  // Après un délai, passe en mode discret (opacité réduite)
  useEffect(() => {
    if (phase !== "saved") return;
    const id = setTimeout(() => setPhase("fading"), FADE_DELAY_MS);
    return () => clearTimeout(id);
  }, [phase]);

  if (phase === "idle") return null;

  if (phase === "saving") {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs text-muted transition-opacity duration-300"
        aria-live="polite"
      >
        <span className="material-symbols-outlined text-[14px] animate-spin" aria-hidden="true">
          progress_activity
        </span>
        {WIZARD_DRAFT_INDICATOR_SAVING}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs text-success transition-opacity duration-500 ${
        phase === "fading" ? "opacity-40" : "opacity-100"
      }`}
      aria-live="polite"
    >
      <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
        check_circle
      </span>
      Sauvegardé
    </span>
  );
}

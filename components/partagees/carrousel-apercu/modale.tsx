"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useApercuPng, type PayloadImpression } from "@/hooks/partagees/use-apercu-png";
import { Button } from "@/components/ui/Button";
import {
  NavbarModesImpression,
  type OptionCorrige,
} from "@/components/partagees/navbar-modes-impression";
import type { ModeImpression, TypeFeuillet } from "@/lib/epreuve/pagination/types";
import { CarrouselApercu, construireFeuillets } from "./index";
import { CARROUSEL_APERCU_COPY } from "./copy";
import { CarrouselNavProvider, useCarrouselNavControls } from "./nav-context";
import { cn } from "@/lib/utils/cn";

export type CarrouselApercuModaleProps = {
  open: boolean;
  onClose: () => void;
  payload: PayloadImpression;
};

/** Délai avant regénération sur changement de mode/corrigé (ms). */
const DEBOUNCE_REGENERATION_MS = 500;

/**
 * Overlay modal partagé — bouton imprimante des vues détaillées
 * (tâche, document, épreuve). Outil de configuration complet de l'aperçu :
 * - Header une ligne : titre · navbar modes · navbar corrigé · X.
 * - Onglets feuillets dynamiques selon le mode (gérés par CarrouselApercu).
 * - Footer : pagination centrée + bouton « Télécharger le PDF » (label fixe).
 *
 * Régénération AUTOMATIQUE sur changement de mode/corrigé (debounce 500ms).
 * Pas de bouton « Mettre à jour » ni de message d'invalidation : le contenu
 * du formulaire ne change pas — seul le paramètre de rendu change.
 *
 * Documents : pas de navbar (un seul mode).
 */
export function CarrouselApercuModale({ open, onClose, payload }: CarrouselApercuModaleProps) {
  const titleId = useId();

  // Défauts neutres à l'ouverture, indépendants du payload reçu : la
  // modale est l'outil de configuration complet et démarre toujours sur
  // le mode le plus simple (formatif, sans corrigé). Le payload reçu de
  // la vue détaillée porte ses propres défauts pour son rendu inline.
  const [mode, setMode] = useState<ModeImpression>("formatif");
  const [optionCorrige, setOptionCorrige] = useState<OptionCorrige>("aucun");

  // Phase 6 : « Corrigé simple » et « Corrigé détaillé » mappent tous deux
  // vers estCorrige=true. Le rendu différencié arrive en Phase 5.
  const estCorrige = optionCorrige !== "aucun";

  // Payload effectif passé à useApercuPng — applique le mode/corrigé locaux
  // au-dessus du payload reçu. Le hook régénère les PNG quand le payload change.
  const payloadEffectif = useMemo<PayloadImpression>(() => {
    if (payload.type === "document") return payload;
    return { ...payload, mode, estCorrige };
  }, [payload, mode, estCorrige]);

  const { etat, generer, telechargerPdf, pdfEnCours } = useApercuPng(payloadEffectif);

  // State du feuillet actif — onglets rendus dans la modale (pas dans
  // CarrouselApercu) pour s'intégrer au flux DOM (header → onglets →
  // contenu → footer) sans flotter par-dessus la sidebar.
  const [feuilletActif, setFeuilletActif] = useState<TypeFeuillet>("dossier-documentaire");

  const feuillets = useMemo(() => {
    if (etat.statut !== "pret") return [];
    return construireFeuillets(etat.pages, etat.pagesParFeuillet);
  }, [etat]);

  // Reset du feuillet actif au premier disponible quand la liste change
  // (changement de mode → composition différente des feuillets).
  useEffect(() => {
    if (feuillets.length === 0) return;
    const existe = feuillets.some((f) => f.type === feuilletActif);
    if (!existe) {
      setFeuilletActif(feuillets[0]!.type);
    }
  }, [feuillets, feuilletActif]);

  // Régénération : immédiate à l'ouverture, debounce 500ms sur changement
  // ultérieur de mode/corrigé. `generer` n'est pas dans les deps pour éviter
  // une boucle (il change à chaque payload via useApercuPng).
  const isFirstOpenRef = useRef(true);
  useEffect(() => {
    if (!open) {
      isFirstOpenRef.current = true;
      return;
    }
    if (isFirstOpenRef.current) {
      isFirstOpenRef.current = false;
      generer();
      return;
    }
    const timer = setTimeout(() => generer(), DEBOUNCE_REGENERATION_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- generer change à chaque render via useApercuPng
  }, [open, mode, estCorrige]);

  // Verrou scroll body
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape pour fermer
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <CarrouselNavProvider>
      <div className="fixed inset-0 z-50 flex flex-col" role="presentation">
        <button
          type="button"
          className="absolute inset-0 bg-black/50"
          aria-label={CARROUSEL_APERCU_COPY.boutonFermer}
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative z-10 flex min-h-0 flex-1 flex-col bg-deep/25"
        >
          {/* Header — UNE seule ligne : titre · navbar modes · navbar corrigé · X */}
          <header className="flex shrink-0 items-center gap-4 border-b border-border bg-panel px-4 py-2 shadow-sm sm:px-5">
            <h2 id={titleId} className="shrink-0 text-[14px] font-medium text-deep">
              {CARROUSEL_APERCU_COPY.modalTitle}
            </h2>

            {payload.type !== "document" && (
              <NavbarModesImpression
                entite={payload.type}
                mode={mode}
                optionCorrige={optionCorrige}
                surChangerMode={setMode}
                surChangerCorrige={setOptionCorrige}
                className="min-w-0 flex-1"
              />
            )}

            {payload.type === "document" && <div className="flex-1" aria-hidden="true" />}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted hover:bg-panel-alt hover:text-deep"
              aria-label={CARROUSEL_APERCU_COPY.boutonFermer}
            >
              <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                close
              </span>
            </button>
          </header>

          {/* Onglets feuillets — fond blanc, border-bottom — conditionnel.
              Cachés en formatif (un seul feuillet questionnaire). Apparaissent
              en sommatif (2) ou ministériel (3). */}
          {feuillets.length > 1 && (
            <div
              role="tablist"
              aria-label="Feuillets"
              className="flex shrink-0 gap-1 border-b-[0.5px] border-border bg-(--color-background-primary) px-4 sm:px-5"
            >
              {feuillets.map((f) => {
                const estActif = f.type === feuilletActif;
                return (
                  <button
                    key={f.type}
                    type="button"
                    role="tab"
                    aria-selected={estActif}
                    onClick={() => setFeuilletActif(f.type)}
                    className={cn(
                      "px-4 py-2 text-sm font-medium transition-colors",
                      estActif
                        ? "border-b-2 border-accent text-accent"
                        : "text-muted hover:text-deep",
                    )}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* Contenu principal — fond gris secondaire, overflow-hidden. */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-(--color-background-secondary) px-4 py-6 sm:px-8">
            {etat.statut === "chargement" && <SqueletteChargement />}

            {etat.statut === "erreur" && (
              <EtatErreur message={etat.message} surReessayer={generer} />
            )}

            {etat.statut === "pret" && (
              <CarrouselApercu
                pages={etat.pages}
                pagesParFeuillet={etat.pagesParFeuillet}
                empreintePng={etat.empreintePng}
                feuilletActif={feuilletActif}
              />
            )}
          </div>

          {/* Footer — grid 3 colonnes : nav centrée absolument, action à droite. */}
          <footer className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-t border-border bg-panel px-4 py-3 sm:px-5">
            <div aria-hidden="true" />
            <FooterNavigation />
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="primary"
                disabled={etat.statut !== "pret" || pdfEnCours}
                onClick={telechargerPdf}
              >
                {pdfEnCours ? (
                  <span className="inline-flex items-center gap-[0.35em]">
                    <span
                      className="material-symbols-outlined animate-spin text-[1em] leading-none"
                      aria-hidden="true"
                    >
                      progress_activity
                    </span>
                    {CARROUSEL_APERCU_COPY.boutonTelechargerPdf}
                  </span>
                ) : (
                  CARROUSEL_APERCU_COPY.boutonTelechargerPdf
                )}
              </Button>
            </div>
          </footer>
        </div>
      </div>
    </CarrouselNavProvider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sous-composants internes                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Navigation prev / next + indicateur, lue depuis le Context du carrousel.
 * Boutons icône bordés (chevron_left / chevron_right), indicateur central
 * en font-semibold pour le contraste avec les boutons ghost à côté.
 */
function FooterNavigation() {
  const controls = useCarrouselNavControls();

  if (!controls) {
    return <div aria-hidden="true" />;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={controls.scrollPrev}
        disabled={!controls.peutPrecedent}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-panel text-deep transition-colors hover:border-border-secondary hover:bg-panel-alt disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Page précédente"
      >
        <span className="material-symbols-outlined text-[1.25em] leading-none" aria-hidden="true">
          chevron_left
        </span>
      </button>
      <span className="min-w-[8ch] px-2 text-center text-sm font-semibold text-deep tabular-nums">
        {CARROUSEL_APERCU_COPY.indicateurPage(controls.indexPageGlobal, controls.totalPagesGlobal)}
      </span>
      <button
        type="button"
        onClick={controls.scrollNext}
        disabled={!controls.peutSuivant}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-panel text-deep transition-colors hover:border-border-secondary hover:bg-panel-alt disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Page suivante"
      >
        <span className="material-symbols-outlined text-[1.25em] leading-none" aria-hidden="true">
          chevron_right
        </span>
      </button>
    </div>
  );
}

function SqueletteChargement() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      <span
        className="material-symbols-outlined animate-spin text-[2rem] text-accent"
        aria-hidden="true"
      >
        progress_activity
      </span>
      <p className="text-base font-semibold text-deep">{CARROUSEL_APERCU_COPY.skeletonTitre}</p>
      <p className="text-sm text-muted">{CARROUSEL_APERCU_COPY.skeletonSousTitre}</p>
    </div>
  );
}

function EtatErreur({ message, surReessayer }: { message: string; surReessayer: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <span className="material-symbols-outlined text-[2rem] text-error" aria-hidden="true">
        error
      </span>
      <p className="text-base font-semibold text-deep">{CARROUSEL_APERCU_COPY.erreurGeneration}</p>
      <p className="text-sm text-muted">{message}</p>
      <Button type="button" variant="secondary" onClick={surReessayer}>
        {CARROUSEL_APERCU_COPY.boutonReessayer}
      </Button>
    </div>
  );
}

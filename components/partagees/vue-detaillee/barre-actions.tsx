"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

type Entite = "document" | "tache" | "epreuve";

type Props = {
  estAuteur: boolean;
  estEpinglee: boolean;
  entite: Entite;
  retour: { chemin: string; libelle: string };
  surModifier: () => void;
  surEpingler: () => void;
  surCopierLien: () => void;
  surOuvrirVisionneuse: () => void;
  surSupprimer: () => void;
  surAjouterEpreuve?: () => void;
  /** En mode stacked (panneau latéral), le bouton Modifier est masqué. */
  layout?: "sidebar" | "stacked";
};

/**
 * Barre d'actions partagée — bouton retour + icônes utilitaires + bouton primaire + menu ⋯.
 */
export function BarreActions({
  estAuteur,
  estEpinglee,
  entite,
  retour,
  surModifier,
  surEpingler,
  surCopierLien,
  surOuvrirVisionneuse,
  surSupprimer,
  surAjouterEpreuve,
  layout = "sidebar",
}: Props) {
  const router = useRouter();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [copieFeedback, setCopieFeedback] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const boutonMenuRef = useRef<HTMLButtonElement>(null);

  /* Fermer le menu au clic extérieur */
  useEffect(() => {
    if (!menuOuvert) return;
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        boutonMenuRef.current &&
        !boutonMenuRef.current.contains(e.target as Node)
      ) {
        setMenuOuvert(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOuvert]);

  const gererCopierLien = useCallback(() => {
    surCopierLien();
    setCopieFeedback(true);
    setTimeout(() => setCopieFeedback(false), 1800);
  }, [surCopierLien]);

  const estStacked = layout === "stacked";

  return (
    <div
      className={cn(
        "flex items-center justify-between py-2",
        estStacked ? "px-4" : "mx-auto max-w-6xl px-6",
      )}
    >
      {/* Bouton retour */}
      <button
        type="button"
        className="group inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-sm font-medium text-steel transition-all duration-150 ease-in-out hover:bg-surface hover:text-deep active:scale-[0.98]"
        onClick={() => router.push(retour.chemin)}
      >
        <span
          className="material-symbols-outlined text-[18px] transition-transform duration-150 ease-in-out group-hover:-translate-x-0.5"
          aria-hidden="true"
        >
          chevron_left
        </span>
        {retour.libelle}
      </button>

      {/* Actions droite */}
      <div className="flex items-center gap-1.5">
        {/* Copier le lien */}
        <div className="relative">
          <BoutonIcone icone="link" ariaLabel="Copier le lien" onClick={gererCopierLien} />
          {copieFeedback && <PopoverCopieLien />}
        </div>

        {/* Ouvrir visionneuse */}
        <BoutonIcone
          icone="print"
          ariaLabel="Ouvrir la visionneuse"
          onClick={surOuvrirVisionneuse}
        />

        {/* Épingler — visiteur tâche : icône simple avant le séparateur */}
        {!estAuteur && entite === "tache" && (
          <BoutonIcone
            icone="push_pin"
            ariaLabel={estEpinglee ? "Retirer l'épingle" : "Épingler"}
            onClick={surEpingler}
            rempli={estEpinglee}
          />
        )}

        {/* Séparateur */}
        <div className="mx-1 h-5 w-px bg-border" />

        {/* Bouton primaire */}
        {estAuteur && !estStacked ? (
          <BoutonPrimaire icone="edit_document" libelle="Modifier" onClick={surModifier} />
        ) : !estAuteur && entite === "tache" && surAjouterEpreuve ? (
          <BoutonPrimaire
            icone="playlist_add"
            libelle="Ajouter à une épreuve"
            onClick={surAjouterEpreuve}
          />
        ) : !estAuteur ? (
          estEpinglee ? (
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-accent bg-panel px-4 text-sm font-medium text-accent transition-all duration-150 ease-in-out hover:bg-accent/5 active:scale-[0.97]"
              onClick={surEpingler}
            >
              <span
                className="material-symbols-outlined text-[1em]"
                aria-hidden="true"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                push_pin
              </span>
              Épinglé
            </button>
          ) : (
            <BoutonPrimaire icone="push_pin" libelle="Épingler" onClick={surEpingler} />
          )
        ) : null}

        {/* Menu ⋯ — propriétaire uniquement */}
        {estAuteur && !estStacked && (
          <div className="relative">
            <button
              ref={boutonMenuRef}
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted transition-all duration-150 ease-in-out hover:bg-surface hover:text-deep active:scale-[0.93]"
              aria-label="Plus d'options"
              aria-haspopup="true"
              aria-expanded={menuOuvert}
              onClick={() => setMenuOuvert((v) => !v)}
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                more_vert
              </span>
            </button>

            {menuOuvert && (
              <div
                ref={menuRef}
                className="absolute right-0 top-full z-30 mt-1 min-w-[180px] rounded-md border border-border bg-panel py-1 shadow-md"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-muted transition-colors hover:bg-error/5 hover:text-error"
                  onClick={() => {
                    setMenuOuvert(false);
                    surSupprimer();
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    delete
                  </span>
                  Supprimer
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Sous-composants internes ──────────────────────────────── */

function BoutonIcone({
  icone,
  ariaLabel,
  onClick,
  rempli,
}: {
  icone: string;
  ariaLabel: string;
  onClick: () => void;
  rempli?: boolean;
}) {
  return (
    <button
      type="button"
      className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted transition-all duration-150 ease-in-out hover:bg-surface hover:text-deep active:scale-[0.93]"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <span
        className="material-symbols-outlined text-[20px]"
        aria-hidden="true"
        style={rempli ? { fontVariationSettings: '"FILL" 1' } : undefined}
      >
        {icone}
      </span>
    </button>
  );
}

function BoutonPrimaire({
  icone,
  libelle,
  onClick,
}: {
  icone: string;
  libelle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-accent px-4 text-sm font-medium text-white shadow-none transition-all duration-150 ease-in-out hover:bg-accent/90 hover:shadow-[0_1px_3px_color-mix(in_srgb,var(--color-accent)_30%,transparent)] active:scale-[0.97] active:shadow-none"
      onClick={onClick}
    >
      <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
        {icone}
      </span>
      {libelle}
    </button>
  );
}

function PopoverCopieLien() {
  return (
    <div className="absolute bottom-full left-1/2 z-40 mb-2 -translate-x-1/2 animate-[fadeIn_150ms_ease-out]">
      <div className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-deep px-3 py-2 text-sm font-medium text-white shadow-lg">
        <span className="material-symbols-outlined text-[1em] text-success" aria-hidden="true">
          check
        </span>
        Lien copié
      </div>
      {/* Flèche vers le bas */}
      <div className="flex justify-center">
        <div className="h-0 w-0 border-x-[6px] border-t-[6px] border-x-transparent border-t-deep" />
      </div>
    </div>
  );
}

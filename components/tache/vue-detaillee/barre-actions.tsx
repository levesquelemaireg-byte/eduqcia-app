"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";
import {
  FICHE_BARRE_RETOUR,
  FICHE_BARRE_AJOUTER_EPREUVE,
  FICHE_BARRE_EPINGLER,
  FICHE_BARRE_MODIFIER,
  FICHE_BARRE_PARTAGER,
  FICHE_BARRE_EXPORTER_PDF,
  FICHE_BARRE_SUPPRIMER,
  TOAST_FICHE_FONCTIONNALITE_A_VENIR,
  TOAST_FICHE_LIEN_COPIE,
} from "@/lib/ui/ui-copy";

type Props = {
  tacheId: string;
  estAuteur: boolean;
};

/**
 * Top navbar sticky de la vue détaillée tâche.
 * Chrome global : bouton retour + actions sur l'item.
 * Aucune contextualisation au scroll.
 */
export function TacheBarreActions({ tacheId, estAuteur }: Props) {
  const [epinglee, setEpinglee] = useState(false);
  const [kebabOuvert, setKebabOuvert] = useState(false);
  const kebabTriggerRef = useRef<HTMLButtonElement>(null);

  /* ─── Handlers ─────────────────────────────────────────────── */

  const surAjouterEpreuve = useCallback(() => {
    console.warn("ajouter à épreuve", tacheId);
    toast.info(TOAST_FICHE_FONCTIONNALITE_A_VENIR);
  }, [tacheId]);

  const surEpingler = useCallback(() => {
    const prochain = !epinglee;
    setEpinglee(prochain);
    console.warn("épingler toggle", tacheId, prochain);
    toast.info(TOAST_FICHE_FONCTIONNALITE_A_VENIR);
  }, [epinglee, tacheId]);

  const surPartager = useCallback(async () => {
    setKebabOuvert(false);
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(TOAST_FICHE_LIEN_COPIE);
    } catch {
      toast.error("Impossible de copier le lien.");
    }
  }, []);

  const surExporterPdf = useCallback(() => {
    setKebabOuvert(false);
    console.warn("exporter PDF", tacheId);
    toast.info(TOAST_FICHE_FONCTIONNALITE_A_VENIR);
  }, [tacheId]);

  const surSupprimer = useCallback(() => {
    setKebabOuvert(false);
    console.warn("supprimer", tacheId);
  }, [tacheId]);

  /* ─── Fermeture kebab sur Escape ───────────────────────────── */

  useEffect(() => {
    if (!kebabOuvert) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setKebabOuvert(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [kebabOuvert]);

  /* ─── Styles partagés ──────────────────────────────────────── */

  const boutonIcone =
    "flex min-h-11 min-w-11 items-center justify-center rounded-lg border-[0.5px] border-border bg-panel text-steel transition-colors hover:bg-surface hover:text-deep";

  const menuItem =
    "flex w-full min-h-11 items-center gap-3 px-4 py-2.5 text-left text-sm text-steel transition-colors hover:bg-surface";

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b-[0.5px] border-border bg-panel px-6 py-2.5 print:hidden">
      {/* ─── Gauche : retour ─────────────────────────────────── */}
      <Link
        href="/questions"
        className="inline-flex items-center gap-1.5 text-[13px] text-steel transition-colors hover:text-accent"
      >
        <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
          arrow_back
        </span>
        {FICHE_BARRE_RETOUR}
      </Link>

      {/* ─── Droite : actions ────────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        {/* Ajouter à une épreuve — bouton primaire, icône seule sur mobile */}
        <button
          type="button"
          onClick={surAjouterEpreuve}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-accent px-2.5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-accent/90 md:px-3.5"
          title={FICHE_BARRE_AJOUTER_EPREUVE}
        >
          <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
            snippet_folder
          </span>
          <span className="hidden md:inline">{FICHE_BARRE_AJOUTER_EPREUVE}</span>
        </button>

        {/* Épingler — bouton icône toggle, masqué sur mobile (dans kebab) */}
        <button
          type="button"
          onClick={surEpingler}
          className={cn(boutonIcone, "hidden md:flex", epinglee && "bg-panel-alt")}
          title={FICHE_BARRE_EPINGLER}
          aria-label={FICHE_BARRE_EPINGLER}
          aria-pressed={epinglee}
        >
          <span
            className={cn("material-symbols-outlined text-[1.1em]", epinglee && "text-accent")}
            aria-hidden="true"
            style={epinglee ? { fontVariationSettings: "'FILL' 1" } : undefined}
          >
            file_save
          </span>
        </button>

        {/* Modifier — auteur uniquement, masqué sur mobile (dans kebab) */}
        {estAuteur ? (
          <Link
            href={`/questions/${tacheId}/edit`}
            className="hidden min-h-11 items-center gap-1.5 rounded-lg border-[0.5px] border-border bg-panel px-3 py-2 text-[13px] font-medium text-deep transition-colors hover:bg-surface md:inline-flex"
          >
            <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
              edit_document
            </span>
            {FICHE_BARRE_MODIFIER}
          </Link>
        ) : null}

        {/* Kebab — menu secondaire */}
        <div className="relative">
          <button
            ref={kebabTriggerRef}
            type="button"
            onClick={() => setKebabOuvert((v) => !v)}
            className={boutonIcone}
            aria-label="Actions"
            aria-haspopup="menu"
            aria-expanded={kebabOuvert}
          >
            <span className="material-symbols-outlined text-[1.1em]" aria-hidden="true">
              more_vert
            </span>
          </button>

          {kebabOuvert ? (
            <>
              <div
                className="fixed inset-0 z-10"
                aria-hidden="true"
                onClick={() => setKebabOuvert(false)}
              />
              <div
                className="absolute right-0 top-full z-20 mt-1 min-w-[180px] rounded-xl border border-border bg-panel py-1 shadow-lg"
                role="menu"
              >
                {/* Mobile-only: Épingler dans le kebab */}
                <button
                  type="button"
                  className={cn(menuItem, "md:hidden")}
                  role="menuitem"
                  onClick={() => {
                    setKebabOuvert(false);
                    surEpingler();
                  }}
                >
                  <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                    file_save
                  </span>
                  {FICHE_BARRE_EPINGLER}
                </button>

                {/* Mobile-only: Modifier dans le kebab (auteur) */}
                {estAuteur ? (
                  <Link
                    href={`/questions/${tacheId}/edit`}
                    className={cn(menuItem, "md:hidden")}
                    role="menuitem"
                    onClick={() => setKebabOuvert(false)}
                  >
                    <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                      edit_document
                    </span>
                    {FICHE_BARRE_MODIFIER}
                  </Link>
                ) : null}

                {/* Divider entre items mobile et items globaux (mobile only) */}
                <div className="my-1 border-t-[0.5px] border-border md:hidden" />

                {/* Partager */}
                <button type="button" className={menuItem} role="menuitem" onClick={surPartager}>
                  <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                    share
                  </span>
                  {FICHE_BARRE_PARTAGER}
                </button>

                {/* Exporter en PDF */}
                <button type="button" className={menuItem} role="menuitem" onClick={surExporterPdf}>
                  <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                    picture_as_pdf
                  </span>
                  {FICHE_BARRE_EXPORTER_PDF}
                </button>

                {/* Supprimer — auteur uniquement, séparé par divider */}
                {estAuteur ? (
                  <>
                    <div className="my-1 border-t-[0.5px] border-border" />
                    <button
                      type="button"
                      className={cn(menuItem, "text-error hover:bg-error/5")}
                      role="menuitem"
                      onClick={surSupprimer}
                    >
                      <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                        delete
                      </span>
                      {FICHE_BARRE_SUPPRIMER}
                    </button>
                  </>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}

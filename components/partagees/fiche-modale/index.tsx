"use client";

import { useEffect, useRef, useCallback, useState, useId } from "react";
import Link from "next/link";
import { DocumentFicheLecture } from "@/components/documents/DocumentFicheLecture";
import { fetchDocFicheDataAction } from "@/lib/actions/fetch-doc-fiche-data";
import type { DocFicheData } from "@/lib/fiche/types";
import {
  FICHE_MODALE_TITRE_DOCUMENT,
  FICHE_MODALE_OUVRIR_PLEIN_ECRAN,
  FICHE_MODALE_DOCUMENT_INDISPONIBLE,
} from "@/lib/ui/ui-copy";

/* ─── Types ──────────────────────────────────────────────────── */

type EtatChargement =
  | { statut: "chargement" }
  | { statut: "pret"; data: DocFicheData }
  | { statut: "erreur" };

type Props = {
  docId: string;
  surFermer: () => void;
};

/* ─── Skeleton 2 colonnes ────────────────────────────────────── */

function SkeletonModale() {
  return (
    <div className="flex gap-8 p-6">
      <div className="flex flex-1 flex-col gap-5">
        <div className="h-5 w-2/3 animate-pulse rounded bg-panel-alt" />
        <div className="h-4 w-full animate-pulse rounded bg-panel-alt" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-panel-alt" />
        <div className="h-4 w-4/6 animate-pulse rounded bg-panel-alt" />
        <div className="mt-4 h-32 w-full animate-pulse rounded bg-panel-alt" />
      </div>
      <div className="hidden w-[200px] shrink-0 flex-col gap-4 md:flex">
        <div className="h-4 w-full animate-pulse rounded bg-panel-alt" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-panel-alt" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-panel-alt" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-panel-alt" />
      </div>
    </div>
  );
}

/* ─── Composant principal ────────────────────────────────────── */

/**
 * Modale fiche document embarquée.
 * Overlay fixed avec panneau centré, focus trap, Escape, click backdrop.
 * Rend `DocumentFicheLecture` (FicheRenderer + DOC_FICHE_SECTIONS) strictement identique
 * à la route dédiée `/documents/[id]`.
 */
export function FicheModale({ docId, surFermer }: Props) {
  const titleId = useId();
  const panneauRef = useRef<HTMLDivElement>(null);

  const [etat, setEtat] = useState<EtatChargement>({ statut: "chargement" });

  /* ── Fetch données document ─────────────────────────────────── */

  useEffect(() => {
    let annule = false;

    fetchDocFicheDataAction(docId).then((result) => {
      if (annule) return;
      if (result.ok) {
        setEtat({ statut: "pret", data: result.data });
      } else {
        setEtat({ statut: "erreur" });
      }
    });

    return () => {
      annule = true;
    };
  }, [docId]);

  /* ── Verrouiller le scroll du body ──────────────────────────── */

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* ── Focus initial sur le premier bouton visible ─────────────── */

  useEffect(() => {
    /* Le panneau contient deux boutons fermeture (mobile back + desktop close).
       On focus le premier visible (offsetParent !== null). */
    const panneau = panneauRef.current;
    if (!panneau) return;
    const boutons = panneau.querySelectorAll<HTMLElement>("button, a[href]");
    for (const btn of boutons) {
      if (btn.offsetParent !== null) {
        btn.focus();
        break;
      }
    }
  }, []);

  /* ── Escape ferme ───────────────────────────────────────────── */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") surFermer();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [surFermer]);

  /* ── Focus trap ─────────────────────────────────────────────── */

  const gererTabTrap = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const panneau = panneauRef.current;
    if (!panneau) return;

    const focusables = panneau.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;

    const premier = focusables[0];
    const dernier = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === premier) {
        e.preventDefault();
        dernier.focus();
      }
    } else {
      if (document.activeElement === dernier) {
        e.preventDefault();
        premier.focus();
      }
    }
  }, []);

  /* ── Contenu du panneau ─────────────────────────────────────── */

  let contenu: React.ReactNode;
  if (etat.statut === "chargement") {
    contenu = <SkeletonModale />;
  } else if (etat.statut === "erreur") {
    contenu = (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <span className="material-symbols-outlined text-[40px] text-muted" aria-hidden="true">
          error_outline
        </span>
        <p className="text-sm text-muted">{FICHE_MODALE_DOCUMENT_INDISPONIBLE}</p>
      </div>
    );
  } else {
    contenu = (
      <div className="p-6">
        <DocumentFicheLecture data={etat.data} />
      </div>
    );
  }

  /* ── Rendu ──────────────────────────────────────────────────── */

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-3 lg:p-10"
      role="presentation"
    >
      {/* Backdrop — masqué sur mobile (plein écran) */}
      <button
        type="button"
        className="absolute inset-0 hidden cursor-pointer md:block"
        style={{ background: "rgba(28, 37, 54, 0.55)" }}
        aria-label="Fermer la fenêtre"
        onClick={surFermer}
      />

      {/* Panneau modal — plein écran mobile, marge tablet, centré desktop */}
      <div
        ref={panneauRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={gererTabTrap}
        className="relative z-10 flex h-full w-full flex-col overflow-hidden bg-bg md:h-[95vh] md:max-h-[900px] md:w-[calc(100vw-48px)] md:max-w-[1080px] md:rounded-2xl md:shadow-[0_20px_60px_rgba(0,0,0,0.3)] lg:h-[min(90vh,900px)] lg:w-[min(1080px,90vw)]"
      >
        {/* Header — bouton retour sur mobile, croix sur tablet/desktop */}
        <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3 md:px-5">
          {/* Mobile : bouton retour chevron gauche */}
          <button
            type="button"
            onClick={surFermer}
            className="inline-flex items-center gap-1 text-sm font-medium text-steel md:hidden"
            aria-label="Fermer"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              arrow_back
            </span>
            {FICHE_MODALE_TITRE_DOCUMENT}
          </button>

          {/* Tablet/Desktop : titre seul */}
          <h2 id={titleId} className="hidden text-sm font-semibold text-deep md:block">
            {FICHE_MODALE_TITRE_DOCUMENT}
          </h2>

          <div className="flex items-center gap-3">
            <Link
              href={`/documents/${docId}`}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
            >
              <span className="material-symbols-outlined text-[1em]" aria-hidden="true">
                open_in_new
              </span>
              <span className="hidden md:inline">{FICHE_MODALE_OUVRIR_PLEIN_ECRAN}</span>
            </Link>

            {/* Bouton fermeture croix — tablet/desktop uniquement */}
            <button
              type="button"
              onClick={surFermer}
              className="hidden h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-panel-alt hover:text-deep md:inline-flex"
              aria-label="Fermer"
            >
              <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                close
              </span>
            </button>
          </div>
        </header>

        {/* Corps scrollable */}
        <div className="min-h-0 flex-1 overflow-y-auto">{contenu}</div>
      </div>
    </div>
  );
}

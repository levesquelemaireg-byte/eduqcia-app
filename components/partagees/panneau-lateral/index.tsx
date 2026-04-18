"use client";

import { useEffect, useRef, useCallback, useId, type ReactNode } from "react";

type Props = {
  surFermer: () => void;
  children: ReactNode;
};

/**
 * Panneau latéral (slide-over) — glisse depuis la droite.
 * 400px desktop, pleine largeur mobile.
 * Focus trap, Escape, clic backdrop.
 */
export function PanneauLateral({ surFermer, children }: Props) {
  const titleId = useId();
  const panneauRef = useRef<HTMLDivElement>(null);

  /* Verrouiller le scroll du body */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* Focus initial */
  useEffect(() => {
    const panneau = panneauRef.current;
    if (!panneau) return;
    const premier = panneau.querySelector<HTMLElement>("button, a[href]");
    premier?.focus();
  }, []);

  /* Escape ferme */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") surFermer();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [surFermer]);

  /* Focus trap */
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

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="presentation">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 cursor-pointer"
        style={{ background: "hsla(220, 40%, 18%, 0.3)" }}
        aria-label="Fermer le panneau"
        onClick={surFermer}
      />

      {/* Panneau glissant */}
      <div
        ref={panneauRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={gererTabTrap}
        className="relative z-10 flex h-full w-full flex-col overflow-hidden bg-bg shadow-lg transition-transform duration-300 ease-out sm:w-[400px]"
        style={{ animation: "slideInFromRight 300ms ease-out" }}
      >
        {/* Header avec bouton fermeture */}
        <header className="flex shrink-0 items-center justify-end border-b border-border px-4 py-2">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-muted hover:bg-panel-alt hover:text-deep transition-colors"
            aria-label="Fermer"
            onClick={surFermer}
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
              close
            </span>
          </button>
        </header>

        {/* Contenu scrollable */}
        <div id={titleId} className="sr-only">
          Détail
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>

      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

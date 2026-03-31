"use client";

/**
 * Fenêtre modale React (dialog accessible : `role="dialog"`, `aria-modal`, fermeture Échap, overlay).
 * Primitive Next.js pour l’UI — pas le singleton WordPress `window.eduqcApp.modal` (historique). Voir `docs/DESIGN-SYSTEM.md` (Modales) et `docs/WORKFLOWS.md`.
 * (cette spec couvre l’intégration PHP historique).
 */
import { useEffect, useId, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** `info-help` : en-tête avec glyphe Material `info` en **`text-accent`** (teal) + titre — modales d’aide (« tooltip modale »). `plain` : titre seul (banque, etc.). **Avertissement** avec conséquence : **`WarningModal`** (`components/ui/WarningModal.tsx`). */
export type SimpleModalTitleStyle = "plain" | "info-help";

type SimpleModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Contenu du footer (boutons) */
  footer?: ReactNode;
  /** Classes du panneau dialog (ex. `max-w-3xl` pour contenu large — défaut `max-w-lg`). */
  panelClassName?: string;
  /**
   * Si true : hauteur selon le contenu, pas de scroll interne au panneau ;
   * défilement éventuel sur la fenêtre (overlay `overflow-y-auto`). Ex. grille 660px.
   */
  fitContentHeight?: boolean;
  /** Défaut `plain`. Utiliser `info-help` pour les modales « aide champ » (Bloc 2–3, documents, etc.). */
  titleStyle?: SimpleModalTitleStyle;
};

export function SimpleModal({
  open,
  title,
  onClose,
  children,
  footer,
  panelClassName,
  fitContentHeight = false,
  titleStyle = "plain",
}: SimpleModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const panel = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={cn(
        "relative z-10 flex w-full flex-col rounded-md border border-border bg-panel shadow-lg",
        fitContentHeight ? "pointer-events-auto max-h-none" : "max-h-[min(90vh,720px)]",
        panelClassName ?? "max-w-lg",
      )}
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
        {titleStyle === "info-help" ? (
          <h2
            id={titleId}
            className="icon-text min-w-0 flex-1 text-lg font-semibold leading-snug text-deep"
          >
            <span
              className="material-symbols-outlined shrink-0 text-[1.15em] text-accent"
              aria-hidden="true"
            >
              info
            </span>
            {title}
          </h2>
        ) : (
          <h2 id={titleId} className="min-w-0 flex-1 text-lg font-semibold text-deep">
            {title}
          </h2>
        )}
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-panel-alt hover:text-deep"
          aria-label="Fermer"
        >
          <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
            close
          </span>
        </button>
      </header>
      <div
        className={cn(
          "px-4 py-3 text-sm text-deep md:px-5 md:py-4",
          fitContentHeight
            ? /* `overflow-x-hidden` + `visible` y force souvent `overflow-y: auto` (spec) → fausse barre de scroll */
              "shrink-0 overflow-x-clip overflow-y-visible"
            : "min-h-0 flex-1 overflow-y-auto",
        )}
      >
        {children}
      </div>
      {footer != null ? (
        <footer className="shrink-0 border-t border-border px-4 py-3 md:px-5">{footer}</footer>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 p-4",
        fitContentHeight ? "overflow-y-auto" : "flex items-center justify-center",
      )}
      role="presentation"
    >
      <button
        type="button"
        className={cn(
          "cursor-pointer bg-black/50",
          fitContentHeight ? "fixed inset-0 z-0" : "absolute inset-0",
        )}
        aria-label="Fermer la fenêtre"
        onClick={onClose}
      />
      {fitContentHeight ? (
        <div className="relative z-10 flex min-h-full w-full flex-col items-center justify-center py-8 pointer-events-none">
          {panel}
        </div>
      ) : (
        panel
      )}
    </div>
  );
}
